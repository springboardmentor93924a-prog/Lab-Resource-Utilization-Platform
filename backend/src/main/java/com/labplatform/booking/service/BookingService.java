package com.labplatform.booking.service;
import org.springframework.scheduling.annotation.Scheduled;
import java.util.List;
import java.util.UUID;
import java.util.Set;
import java.time.LocalDate;
import java.util.Map;
import java.util.HashMap;
import java.util.HashSet;
import java.time.LocalDateTime;
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
import com.labplatform.equipment.dto.DepartmentUsageReportRow;


import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;


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
// =========================================================
// DEPARTMENT / RESOURCE USAGE REPORT
// =========================================================

    public List<DepartmentUsageReportRow> generateDepartmentUsageReport(
            LocalDate from,
            LocalDate to) {

        List<Booking> bookings =
                bookingRepository.findByBookingDateBetween(from, to);

        // Only actual/approved bookings should count as resource usage
        bookings = bookings.stream()
                .filter(booking ->
                        booking.getBookingStatus() == BookingStatus.CONFIRMED
                                || booking.getBookingStatus() == BookingStatus.COMPLETED
                )
                .collect(Collectors.toList());

        Map<String, List<Booking>> departmentBookings =
                bookings.stream()
                        .filter(booking ->
                                booking.getEquipment() != null
                                        && booking.getEquipment().getDepartment() != null
                                        && !booking.getEquipment()
                                        .getDepartment()
                                        .isBlank()
                        )
                        .collect(Collectors.groupingBy(
                                booking ->
                                        booking.getEquipment()
                                                .getDepartment()
                        ));

        List<DepartmentUsageReportRow> report = new java.util.ArrayList<>();

        long totalDays =
                java.time.temporal.ChronoUnit.DAYS.between(
                        from,
                        to
                ) + 1;

        for (Map.Entry<String, List<Booking>> entry
                : departmentBookings.entrySet()) {

            String department = entry.getKey();

            List<Booking> departmentBookingList =
                    entry.getValue();

            long totalBookings =
                    departmentBookingList.size();

            long usageHours =
                    departmentBookingList.stream()
                            .mapToLong(booking -> {

                                if (booking.getDurationHours() != null) {
                                    return booking.getDurationHours();
                                }

                                if (booking.getStartTime() != null
                                        && booking.getEndTime() != null) {

                                    return java.time.Duration
                                            .between(
                                                    booking.getStartTime(),
                                                    booking.getEndTime()
                                            )
                                            .toHours();
                                }

                                return 0;
                            })
                            .sum();

            long equipmentCount =
                    departmentBookingList.stream()
                            .map(booking ->
                                    booking.getEquipment().getId())
                            .distinct()
                            .count();

            /*
             * Utilization is calculated against
             * 24 hours per day for each equipment
             * available in the department.
             */
            double availableHours =
                    equipmentCount
                            * totalDays
                            * 24.0;

            double utilizationRate =
                    availableHours > 0
                            ? (usageHours / availableHours) * 100.0
                            : 0.0;

            utilizationRate =
                    Math.round(utilizationRate * 10.0) / 10.0;

            report.add(
                    new DepartmentUsageReportRow(
                            department,
                            totalBookings,
                            usageHours,
                            equipmentCount,
                            utilizationRate
                    )
            );
        }

        report.sort(
                java.util.Comparator.comparing(
                        DepartmentUsageReportRow::getDepartment
                )
        );

        return report;
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
        // =========================================================
// NOTIFY MANAGEMENT ABOUT NEW BOOKING REQUEST
// LAB MANAGER + DEPARTMENT HEAD + INSTITUTION ADMIN
// =========================================================

        if (equipment.getInstitution() != null) {

            Integer institutionId =
                    equipment.getInstitution().getId();

            String[] responsibleRoles = {
                    "LAB_MANAGER",
                    "DEPARTMENT_HEAD",
                    "INSTITUTION_ADMIN"
            };

            Set<UUID> notifiedUserIds = new HashSet<>();

            String requesterName =
                    currentUser.getFullName();

            String message =
                    "New booking request for "
                            + equipment.getEquipmentName()
                            + " from "
                            + requesterName
                            + " on "
                            + booking.getBookingDate()
                            + ". Please review the booking.";

            for (String roleName : responsibleRoles) {

                List<User> users =
                        userRepository
                                .findByInstitution_IdAndRole_Name(
                                        institutionId,
                                        roleName
                                );

                for (User user : users) {

                    // Prevent duplicate notifications
                    if (notifiedUserIds.add(user.getId())) {

                        notificationService.create(
                                user,
                                "NEW_BOOKING_REQUEST",
                                message
                        );
                    }
                }
            }
        }

        return new BookingResponse(saved);
    }

    public List<BookingResponse> getAllBookings() {

        updateExpiredBookings();

        return bookingRepository.findAll()
                .stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
    }

    public BookingResponse getBookingById(
            Long id,
            String requesterEmail) {

        updateExpiredBookings();

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

        updateExpiredBookings();

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

        updateExpiredBookings();

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
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime()
        );
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
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime()
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

    // ==========================================
// AUTO COMPLETE EXPIRED BOOKINGS
// ==========================================

    @Scheduled(fixedRate = 60000)
    public void automaticallyCompleteBookings() {

        LocalDateTime now = LocalDateTime.now();

        bookingRepository.findAll()
                .stream()
                .filter(booking ->
                        booking.getBookingStatus() == BookingStatus.CONFIRMED
                )
                .filter(booking -> {

                    LocalDateTime bookingEnd =
                            LocalDateTime.of(
                                    booking.getBookingDate(),
                                    booking.getEndTime()
                            );

                    return !bookingEnd.isAfter(now);
                })
                .forEach(booking -> {

                    booking.setBookingStatus(
                            BookingStatus.COMPLETED
                    );

                    bookingRepository.save(booking);
                });
    }
    private void updateExpiredBookings() {

        LocalDateTime now = LocalDateTime.now();

        bookingRepository.findAll()
                .stream()
                .filter(booking ->
                        booking.getBookingStatus() == BookingStatus.CONFIRMED
                )
                .filter(booking -> {

                    LocalDateTime bookingEnd =
                            LocalDateTime.of(
                                    booking.getBookingDate(),
                                    booking.getEndTime()
                            );

                    return !bookingEnd.isAfter(now);
                })
                .forEach(booking -> {

                    booking.setBookingStatus(
                            BookingStatus.COMPLETED
                    );

                    bookingRepository.save(booking);
                });
    }
}