package com.labplatform.booking.service;

import com.labplatform.auth.model.User;
import com.labplatform.auth.repository.UserRepository;
import com.labplatform.billing.service.BillingService;
import com.labplatform.booking.dto.BookingRequest;
import com.labplatform.booking.dto.BookingResponse;
import com.labplatform.booking.model.Booking;
import com.labplatform.booking.model.BookingStatus;
import com.labplatform.booking.repository.BookingRepository;
import com.labplatform.equipment.model.Equipment;
import com.labplatform.equipment.repository.EquipmentRepository;
import com.labplatform.notification.service.NotificationService;
import com.labplatform.sharing.repository.EquipmentAccessGrantRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;
    private final EquipmentAccessGrantRepository grantRepository;
    private final WaitlistService waitlistService;
    private final BillingService billingService;
    private final NotificationService notificationService;

    public BookingService(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            EquipmentRepository equipmentRepository,
            EquipmentAccessGrantRepository grantRepository,
            WaitlistService waitlistService,
            BillingService billingService,
            NotificationService notificationService) {

        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.equipmentRepository = equipmentRepository;
        this.grantRepository = grantRepository;
        this.waitlistService = waitlistService;
        this.billingService = billingService;
        this.notificationService = notificationService;
    }

    private User resolveCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"));
    }

    private boolean isAdmin(User user) {
        String role = user.getRole().getName();

        return role.equals("INSTITUTION_ADMIN")
                || role.equals("SYSTEM_ADMIN")
                || role.equals("LAB_MANAGER")
                || role.equals("DEPARTMENT_HEAD");
    }

    public BookingResponse createBooking(
            BookingRequest request,
            String requesterEmail) {

        User currentUser = resolveCurrentUser(requesterEmail);

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Equipment not found with id: " + request.getEquipmentId()));

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "End time must be after start time");
        }

        if (!canAccessEquipment(currentUser, equipment)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "This equipment belongs to another institution. Please request access first.");
        }

        List<Booking> existingBookings =
                bookingRepository.findByEquipmentIdAndBookingDateAndBookingStatusIn(
                        equipment.getId(),
                        request.getBookingDate(),
                        List.of(
                                BookingStatus.PENDING,
                                BookingStatus.CONFIRMED
                        ));

        boolean hasConflict = existingBookings.stream().anyMatch(existing ->
                request.getStartTime().isBefore(existing.getEndTime())
                        && existing.getStartTime().isBefore(request.getEndTime())
        );

        if (hasConflict) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This equipment is already booked for the selected time. You can join the waitlist instead.");
        }

        Booking booking = new Booking();

        booking.setUser(currentUser);
        booking.setEquipment(equipment);
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setDurationHours(request.getDurationHours());
        booking.setPurpose(request.getPurpose());
        booking.setRecurring(
                request.getRecurring() != null
                        ? request.getRecurring()
                        : false
        );
        booking.setRecurringWeeks(request.getRecurringWeeks());
        booking.setBookingStatus(BookingStatus.PENDING);

        boolean requestedPriority =
                request.getPriorityBooking() != null
                        && request.getPriorityBooking();

        boolean isStudent =
                currentUser.getRole().getName().equals("STUDENT");

        if (requestedPriority && isStudent) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Students cannot make priority bookings");
        }

        booking.setIsPriorityBooking(requestedPriority);

        Booking saved = bookingRepository.save(booking);

        billingService.generateBillingRecordIfApplicable(
                saved,
                currentUser
        );

        return new BookingResponse(saved);
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
    }

    public BookingResponse getBookingById(
            Long id,
            String requesterEmail) {

        User currentUser = resolveCurrentUser(requesterEmail);

        Booking booking = findBookingOrThrow(id);

        if (!isOwnerOrAdmin(booking, currentUser)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not have permission to view this booking");
        }

        return new BookingResponse(booking);
    }

    public List<BookingResponse> getBookingsByUser(
            UUID userId,
            String requesterEmail) {

        User currentUser = resolveCurrentUser(requesterEmail);

        boolean isOwnRecord =
                currentUser.getId().equals(userId);

        if (!isOwnRecord && !isAdmin(currentUser)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not have permission to view these bookings");
        }

        return bookingRepository.findByUserId(userId)
                .stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getBookingsByEquipment(
            Long equipmentId) {

        return bookingRepository.findByEquipmentId(equipmentId)
                .stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
    }

    public BookingResponse cancelBooking(
            Long id,
            String requesterEmail) {

        User currentUser = resolveCurrentUser(requesterEmail);

        Booking booking = findBookingOrThrow(id);

        if (!isOwnerOrAdmin(booking, currentUser)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not have permission to cancel this booking");
        }

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Booking is already cancelled");
        }

        if (booking.getBookingStatus() == BookingStatus.COMPLETED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot cancel a completed booking");
        }

        booking.setBookingStatus(BookingStatus.CANCELLED);

        Booking saved = bookingRepository.save(booking);

        waitlistService.notifyNextInLineIfAny(
                booking.getEquipment().getId(),
                booking.getBookingDate());

        return new BookingResponse(saved);
    }

    public void deleteBooking(
            Long id,
            String requesterEmail) {

        User currentUser = resolveCurrentUser(requesterEmail);

        if (!isAdmin(currentUser)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only admins can permanently delete a booking");
        }

        if (!bookingRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Booking not found with id: " + id);
        }

        bookingRepository.deleteById(id);
    }

    public BookingResponse approveBooking(
            Long id,
            String reviewerEmail) {

        User reviewer = resolveCurrentUser(reviewerEmail);

        if (!isAdmin(reviewer)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only admins can approve bookings");
        }

        Booking booking = findBookingOrThrow(id);

        if (booking.getBookingStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only pending bookings can be approved");
        }

        booking.setBookingStatus(BookingStatus.CONFIRMED);

        Booking saved = bookingRepository.save(booking);

        notificationService.create(
                booking.getUser(),
                "BOOKING_APPROVED",
                "Your booking for "
                        + booking.getEquipment().getEquipmentName()
                        + " on "
                        + booking.getBookingDate()
                        + " has been confirmed."
        );

        return new BookingResponse(saved);
    }

    public BookingResponse rejectBooking(
            Long id,
            String reviewerEmail) {

        User reviewer = resolveCurrentUser(reviewerEmail);

        if (!isAdmin(reviewer)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only admins can reject bookings");
        }

        Booking booking = findBookingOrThrow(id);

        if (booking.getBookingStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only pending bookings can be rejected");
        }

        booking.setBookingStatus(BookingStatus.CANCELLED);

        Booking saved = bookingRepository.save(booking);

        notificationService.create(
                booking.getUser(),
                "BOOKING_REJECTED",
                "Your booking for "
                        + booking.getEquipment().getEquipmentName()
                        + " on "
                        + booking.getBookingDate()
                        + " was not approved."
        );

        waitlistService.notifyNextInLineIfAny(
                booking.getEquipment().getId(),
                booking.getBookingDate()
        );

        return new BookingResponse(saved);
    }

    private Booking findBookingOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found with id: " + id));
    }

    private boolean isOwnerOrAdmin(
            Booking booking,
            User user) {

        boolean isOwner =
                booking.getUser().getId().equals(user.getId());

        return isOwner || isAdmin(user);
    }

    private boolean canAccessEquipment(
            User user,
            Equipment equipment) {

        if (isAdmin(user)) {
            return true;
        }

        boolean ownInstitution =
                user.getInstitution() != null
                        && user.getInstitution()
                        .getId()
                        .equals(equipment.getInstitution().getId());

        if (ownInstitution) {
            return true;
        }

        return grantRepository.existsByUserIdAndEquipmentIdAndRevokedFalse(
                user.getId(),
                equipment.getId()
        );
    }
}