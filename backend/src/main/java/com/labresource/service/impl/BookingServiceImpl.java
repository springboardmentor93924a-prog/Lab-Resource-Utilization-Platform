package com.labresource.service.impl;

//import com.labresource.dto.booking.BookingRequest;
//import com.labresource.dto.booking.BookingResponse;
//import com.labresource.entity.Booking;
//import com.labresource.entity.Equipment;
//import com.labresource.entity.User;
//import com.labresource.exception.BadRequestException;
//import com.labresource.exception.ResourceNotFoundException;
//import com.labresource.repository.BookingRepository;
//import com.labresource.repository.EquipmentRepository;
//import com.labresource.repository.UserRepository;
//import com.labresource.service.BookingService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class BookingServiceImpl implements BookingService {
//
//    private final BookingRepository bookingRepository;
//    private final EquipmentRepository equipmentRepository;
//    private final UserRepository userRepository;
//
//    @Override
//    public BookingResponse createBooking(
//            BookingRequest request
//    ) {
//
//        Equipment equipment = equipmentRepository
//                .findById(request.getEquipmentId())
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Equipment not found"
//                        )
//                );
//
//        User user = userRepository
//                .findById(request.getUserId())
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "User not found"
//                        )
//                );
//
//        if (!"AVAILABLE".equalsIgnoreCase(
//                equipment.getAvailabilityStatus())) {
//
//            throw new BadRequestException(
//                    "Equipment is not available"
//            );
//        }
//
//        List<Booking> conflicts =
//                bookingRepository
//                        .findByEquipmentAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
//                                equipment,
//                                request.getEndTime(),
//                                request.getStartTime()
//                        );
//
//        if (!conflicts.isEmpty()) {
//
//            throw new BadRequestException(
//                    "Equipment is already booked for this time slot"
//            );
//        }
//
//        Booking booking = new Booking();
//
//        booking.setEquipment(equipment);
//        booking.setUser(user);
//
//        booking.setStartTime(request.getStartTime());
//        booking.setEndTime(request.getEndTime());
//
//        booking.setPurpose(request.getPurpose());
//        booking.setProjectName(request.getProjectName());
//        booking.setNotes(request.getNotes());
//
//        booking.setBookingStatus("SCHEDULED");
//        booking.setApprovalStatus("PENDING");
//
//        Booking savedBooking =
//                bookingRepository.save(booking);
//
//        return mapToResponse(savedBooking);
//    }
//
//    @Override
//    public List<BookingResponse> getAllBookings() {
//
//        return bookingRepository.findAll()
//                .stream()
//                .map(this::mapToResponse)
//                .toList();
//    }
//
//    @Override
//    public BookingResponse getBookingById(
//            String bookingId
//    ) {
//
//        Booking booking =
//                bookingRepository.findById(bookingId)
//                        .orElseThrow(() ->
//                                new ResourceNotFoundException(
//                                        "Booking not found"
//                                )
//                        );
//
//        return mapToResponse(booking);
//    }
//    @Override
//    public List<BookingResponse> getBookingsByUser(
//            String userId
//    ) {
//
//        User user = userRepository
//                .findById(userId)
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "User not found"
//                        )
//                );
//
//        return bookingRepository.findByUser(user)
//                .stream()
//                .map(this::mapToResponse)
//                .toList();
//    }
//
//    @Override
//    public List<BookingResponse> getBookingsByEquipment(
//            String equipmentId
//    ) {
//
//        Equipment equipment = equipmentRepository
//                .findById(equipmentId)
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Equipment not found"
//                        )
//                );
//
//        return bookingRepository.findByEquipment(equipment)
//                .stream()
//                .map(this::mapToResponse)
//                .toList();
//    }
//
//    @Override
//    public List<BookingResponse> getBookingsByStatus(
//            String bookingStatus
//    ) {
//
//        return bookingRepository
//                .findByBookingStatus(bookingStatus)
//                .stream()
//                .map(this::mapToResponse)
//                .toList();
//    }
//
//    @Override
//    public List<BookingResponse> getBookingsByApprovalStatus(
//            String approvalStatus
//    ) {
//
//        return bookingRepository
//                .findByApprovalStatus(approvalStatus)
//                .stream()
//                .map(this::mapToResponse)
//                .toList();
//    }
//
//    @Override
//    public BookingResponse approveBooking(
//            String bookingId
//    ) {
//
//        Booking booking = bookingRepository
//                .findById(bookingId)
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Booking not found"
//                        )
//                );
//
//        if ("CANCELLED".equalsIgnoreCase(
//                booking.getBookingStatus())) {
//
//            throw new BadRequestException(
//                    "Cancelled booking cannot be approved"
//            );
//        }
//
//        if ("REJECTED".equalsIgnoreCase(
//                booking.getApprovalStatus())) {
//
//            throw new BadRequestException(
//                    "Rejected booking cannot be approved"
//            );
//        }
//
//        if ("APPROVED".equalsIgnoreCase(
//                booking.getApprovalStatus())) {
//
//            throw new BadRequestException(
//                    "Booking is already approved"
//            );
//        }
//
//        booking.setApprovalStatus("APPROVED");
//
//        Booking updatedBooking =
//                bookingRepository.save(booking);
//
//        return mapToResponse(updatedBooking);
//    }
//
//    @Override
//    public BookingResponse rejectBooking(
//            String bookingId
//    ) {
//
//        Booking booking = bookingRepository
//                .findById(bookingId)
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Booking not found"
//                        )
//                );
//
//        if ("CANCELLED".equalsIgnoreCase(
//                booking.getBookingStatus())) {
//
//            throw new BadRequestException(
//                    "Cancelled booking cannot be rejected"
//            );
//        }
//
//        if ("APPROVED".equalsIgnoreCase(
//                booking.getApprovalStatus())) {
//
//            throw new BadRequestException(
//                    "Approved booking cannot be rejected"
//            );
//        }
//
//        if ("REJECTED".equalsIgnoreCase(
//                booking.getApprovalStatus())) {
//
//            throw new BadRequestException(
//                    "Booking is already rejected"
//            );
//        }
//
//        booking.setApprovalStatus("REJECTED");
//        booking.setBookingStatus("CANCELLED");
//
//        Booking updatedBooking =
//                bookingRepository.save(booking);
//
//        return mapToResponse(updatedBooking);
//    }
//    @Override
//    public BookingResponse cancelBooking(
//            String bookingId
//    ) {
//
//        Booking booking = bookingRepository
//                .findById(bookingId)
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Booking not found"
//                        )
//                );
//
//        if ("CANCELLED".equalsIgnoreCase(
//                booking.getBookingStatus())) {
//
//            throw new BadRequestException(
//                    "Booking is already cancelled"
//            );
//        }
//
//        if ("COMPLETED".equalsIgnoreCase(
//                booking.getBookingStatus())) {
//
//            throw new BadRequestException(
//                    "Completed booking cannot be cancelled"
//            );
//        }
//
//        booking.setBookingStatus("CANCELLED");
//
//        Booking updatedBooking =
//                bookingRepository.save(booking);
//
//        return mapToResponse(updatedBooking);
//    }
//
//    @Override
//    public BookingResponse updateBooking(
//            String bookingId,
//            BookingRequest request
//    ) {
//
//        Booking booking = bookingRepository
//                .findById(bookingId)
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Booking not found"
//                        )
//                );
//
//        Equipment equipment = equipmentRepository
//                .findById(request.getEquipmentId())
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Equipment not found"
//                        )
//                );
//
//        User user = userRepository
//                .findById(request.getUserId())
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "User not found"
//                        )
//                );
//
//        if (request.getEndTime()
//                .isBefore(request.getStartTime()) ||
//                request.getEndTime()
//                        .isEqual(request.getStartTime())) {
//
//            throw new BadRequestException(
//                    "End time must be after start time"
//            );
//        }
//
//        if (!"AVAILABLE".equalsIgnoreCase(
//                equipment.getAvailabilityStatus())) {
//
//            throw new BadRequestException(
//                    "Equipment is not available"
//            );
//        }
//
//        List<Booking> conflicts =
//                bookingRepository
//                        .findByEquipmentAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
//                                equipment,
//                                request.getEndTime(),
//                                request.getStartTime()
//                        );
//
//        boolean hasConflict = conflicts.stream()
//                .anyMatch(existingBooking ->
//                        !existingBooking.getId()
//                                .equals(bookingId)
//                );
//
//        if (hasConflict) {
//
//            throw new BadRequestException(
//                    "Equipment is already booked for this time slot"
//            );
//        }
//
//        booking.setEquipment(equipment);
//        booking.setUser(user);
//        booking.setStartTime(request.getStartTime());
//        booking.setEndTime(request.getEndTime());
//        booking.setPurpose(request.getPurpose());
//        booking.setProjectName(request.getProjectName());
//        booking.setNotes(request.getNotes());
//
//        booking.setApprovalStatus("PENDING");
//
//        Booking updatedBooking =
//                bookingRepository.save(booking);
//
//        return mapToResponse(updatedBooking);
//    }
//
//    @Override
//    public void deleteBooking(
//            String bookingId
//    ) {
//
//        Booking booking = bookingRepository
//                .findById(bookingId)
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Booking not found"
//                        )
//                );
//
//        bookingRepository.delete(booking);
//    }
//
//    private BookingResponse mapToResponse(
//            Booking booking
//    ) {
//
//        String userName = null;
//
//        if (booking.getUser() != null) {
//
//            String firstName =
//                    booking.getUser().getFirstName();
//
//            String lastName =
//                    booking.getUser().getLastName();
//
//            userName = (
//                    (firstName != null ? firstName : "")
//                            + " "
//                            + (lastName != null ? lastName : "")
//            ).trim();
//        }
//
//        return new BookingResponse(
//                booking.getId(),
//
//                booking.getEquipment() != null
//                        ? booking.getEquipment().getId()
//                        : null,
//
//                booking.getEquipment() != null
//                        ? booking.getEquipment().getName()
//                        : null,
//
//                booking.getUser() != null
//                        ? booking.getUser().getId()
//                        : null,
//
//                userName,
//
//                booking.getUser() != null
//                        ? booking.getUser().getEmail()
//                        : null,
//
//                booking.getStartTime(),
//                booking.getEndTime(),
//                booking.getPurpose(),
//                booking.getProjectName(),
//                booking.getNotes(),
//                booking.getBookingStatus(),
//                booking.getApprovalStatus(),
//                booking.getCreatedAt(),
//                booking.getUpdatedAt()
//        );
//    }
//}





import com.labresource.dto.booking.BookingRequest;
import com.labresource.dto.booking.BookingResponse;
import com.labresource.entity.Booking;
import com.labresource.entity.Equipment;
import com.labresource.entity.User;
import com.labresource.exception.BadRequestException;
import com.labresource.exception.ResourceNotFoundException;
import com.labresource.repository.BookingRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.UserRepository;
import com.labresource.service.BookingService;
import com.labresource.service.WaitlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;





import com.labresource.dto.EquipmentStatusEventDto;
import com.labresource.enums.NotificationType;
import com.labresource.service.NotificationService;
import com.labresource.service.EquipmentStatusStreamService;
import com.labresource.entity.UtilizationLog;
import com.labresource.repository.UtilizationLogRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final WaitlistService waitlistService;



    private final NotificationService notificationService;
    private final EquipmentStatusStreamService equipmentStatusStreamService;
    private final UtilizationLogRepository utilizationLogRepository;

    @Override
    public BookingResponse createBooking(
            BookingRequest request
    ) {

        Equipment equipment = equipmentRepository
                .findById(request.getEquipmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Equipment not found"
                        )
                );

        User user = userRepository
                .findById(request.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        if (!"AVAILABLE".equalsIgnoreCase(
                equipment.getAvailabilityStatus())) {

            throw new BadRequestException(
                    "Equipment is not available"
            );
        }

        List<Booking> conflicts =
                bookingRepository
                        .findByEquipmentAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
                                equipment,
                                request.getEndTime(),
                                request.getStartTime()
                        );

        if (!conflicts.isEmpty()) {

            throw new BadRequestException(
                    "Equipment is already booked for this time slot. "
                            + "Check booking optimization suggestions "
                            + "or join the waitlist."
            );
        }

        Booking booking = new Booking();

        booking.setEquipment(equipment);
        booking.setUser(user);

        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());

        booking.setPurpose(request.getPurpose());
        booking.setProjectName(request.getProjectName());
        booking.setNotes(request.getNotes());

        booking.setBookingStatus("SCHEDULED");
        booking.setApprovalStatus("PENDING");

        Booking savedBooking =
                bookingRepository.save(booking);

        return mapToResponse(savedBooking);
    }

    @Override
    public List<BookingResponse> getAllBookings() {

        return bookingRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public BookingResponse getBookingById(
            String bookingId
    ) {

        Booking booking =
                bookingRepository.findById(bookingId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Booking not found"
                                )
                        );

        return mapToResponse(booking);
    }
    @Override
    public List<BookingResponse> getBookingsByUser(
            String userId
    ) {

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        return bookingRepository.findByUser(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<BookingResponse> getBookingsByEquipment(
            String equipmentId
    ) {

        Equipment equipment = equipmentRepository
                .findById(equipmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Equipment not found"
                        )
                );

        return bookingRepository.findByEquipment(equipment)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<BookingResponse> getBookingsByStatus(
            String bookingStatus
    ) {

        return bookingRepository
                .findByBookingStatus(bookingStatus)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<BookingResponse> getBookingsByApprovalStatus(
            String approvalStatus
    ) {

        return bookingRepository
                .findByApprovalStatus(approvalStatus)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public BookingResponse approveBooking(
            String bookingId
    ) {

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Booking not found"
                        )
                );

        if ("CANCELLED".equalsIgnoreCase(
                booking.getBookingStatus())) {

            throw new BadRequestException(
                    "Cancelled booking cannot be approved"
            );
        }

        if ("REJECTED".equalsIgnoreCase(
                booking.getApprovalStatus())) {

            throw new BadRequestException(
                    "Rejected booking cannot be approved"
            );
        }

        if ("APPROVED".equalsIgnoreCase(
                booking.getApprovalStatus())) {

            throw new BadRequestException(
                    "Booking is already approved"
            );
        }

        booking.setApprovalStatus("APPROVED");

        Booking updatedBooking =
                bookingRepository.save(booking);

        /*
         * Wire the approved booking into the utilization pipeline:
         * every approved booking becomes a utilization log so that
         * utilization rate, idle-time, demand analysis and the
         * heatmap are all driven by real booking/usage data instead
         * of requiring a separate manual step.
         */
        createUtilizationLogForBooking(updatedBooking);








        notificationService.createNotification(
                updatedBooking.getUser().getId(),
                NotificationType.BOOKING_APPROVED,
                "Booking Approved",
                "Your booking has been approved.",
                "BOOKING",
                updatedBooking.getId()
        );

        equipmentStatusStreamService.publish(
                new EquipmentStatusEventDto(
                        updatedBooking.getEquipment().getId(),
                        updatedBooking.getEquipment().getName(),
                        "BOOKED",
                        "Equipment booking approved",
                        java.time.LocalDateTime.now()
                )
        );




        return mapToResponse(updatedBooking);
    }

    /*
     * Creates the UtilizationLog entry that represents the actual
     * usage of the equipment for an approved booking. This is what
     * feeds UtilizationAnalyticsService (utilization rate, idle
     * time, demand analysis and the day/hour heatmap).
     */
    private void createUtilizationLogForBooking(Booking booking) {

        if (booking.getStartTime() == null
                || booking.getEndTime() == null) {
            return;
        }

        boolean alreadyLogged = utilizationLogRepository
                .findByBooking(booking)
                .stream()
                .findAny()
                .isPresent();

        if (alreadyLogged) {
            return;
        }

        UtilizationLog utilizationLog = new UtilizationLog();

        utilizationLog.setEquipment(booking.getEquipment());
        utilizationLog.setUser(booking.getUser());
        utilizationLog.setBooking(booking);
        utilizationLog.setStartTime(booking.getStartTime());
        utilizationLog.setEndTime(booking.getEndTime());
        utilizationLog.setUtilizationSource("BOOKING");
        utilizationLog.setStatus("COMPLETED");

        int durationMinutes = (int) java.time.Duration.between(
                booking.getStartTime(),
                booking.getEndTime()
        ).toMinutes();

        utilizationLog.setUsageDurationMinutes(
                Math.max(durationMinutes, 0)
        );

        utilizationLogRepository.save(utilizationLog);
    }

    @Override
    public BookingResponse rejectBooking(
            String bookingId
    ) {

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Booking not found"
                        )
                );

        if ("CANCELLED".equalsIgnoreCase(
                booking.getBookingStatus())) {

            throw new BadRequestException(
                    "Cancelled booking cannot be rejected"
            );
        }

        if ("APPROVED".equalsIgnoreCase(
                booking.getApprovalStatus())) {

            throw new BadRequestException(
                    "Approved booking cannot be rejected"
            );
        }

        if ("REJECTED".equalsIgnoreCase(
                booking.getApprovalStatus())) {

            throw new BadRequestException(
                    "Booking is already rejected"
            );
        }

        booking.setApprovalStatus("REJECTED");
        booking.setBookingStatus("CANCELLED");

        Booking updatedBooking =
                bookingRepository.save(booking);










        notificationService.createNotification(
                updatedBooking.getUser().getId(),
                NotificationType.BOOKING_REJECTED,
                "Booking Rejected",
                "Your booking has been rejected.",
                "BOOKING",
                updatedBooking.getId()
        );



        tryAllocateNextWaitlistUser(
                booking.getEquipment()
        );

        return mapToResponse(updatedBooking);
    }
    @Override
    public BookingResponse cancelBooking(
            String bookingId
    ) {

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Booking not found"
                        )
                );

        if ("CANCELLED".equalsIgnoreCase(
                booking.getBookingStatus())) {

            throw new BadRequestException(
                    "Booking is already cancelled"
            );
        }

        if ("COMPLETED".equalsIgnoreCase(
                booking.getBookingStatus())) {

            throw new BadRequestException(
                    "Completed booking cannot be cancelled"
            );
        }

        booking.setBookingStatus("CANCELLED");

        Booking updatedBooking =
                bookingRepository.save(booking);










        notificationService.createNotification(
                updatedBooking.getUser().getId(),
                NotificationType.BOOKING_CANCELLED,
                "Booking Cancelled",
                "Your booking has been cancelled.",
                "BOOKING",
                updatedBooking.getId()
        );

        equipmentStatusStreamService.publish(
                new EquipmentStatusEventDto(
                        updatedBooking.getEquipment().getId(),
                        updatedBooking.getEquipment().getName(),
                        "AVAILABLE",
                        "Equipment became available after cancellation",
                        java.time.LocalDateTime.now()
                )
        );





        tryAllocateNextWaitlistUser(
                booking.getEquipment()
        );

        return mapToResponse(updatedBooking);
    }

    @Override
    public BookingResponse updateBooking(
            String bookingId,
            BookingRequest request
    ) {

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Booking not found"
                        )
                );

        Equipment equipment = equipmentRepository
                .findById(request.getEquipmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Equipment not found"
                        )
                );

        User user = userRepository
                .findById(request.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        if (request.getEndTime()
                .isBefore(request.getStartTime()) ||
                request.getEndTime()
                        .isEqual(request.getStartTime())) {

            throw new BadRequestException(
                    "End time must be after start time"
            );
        }

        if (!"AVAILABLE".equalsIgnoreCase(
                equipment.getAvailabilityStatus())) {

            throw new BadRequestException(
                    "Equipment is not available"
            );
        }

        List<Booking> conflicts =
                bookingRepository
                        .findByEquipmentAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
                                equipment,
                                request.getEndTime(),
                                request.getStartTime()
                        );

        boolean hasConflict = conflicts.stream()
                .anyMatch(existingBooking ->
                        !existingBooking.getId()
                                .equals(bookingId)
                );

        if (hasConflict) {

            throw new BadRequestException(
                    "Equipment is already booked for this time slot. "
                            + "Check booking optimization suggestions "
                            + "or join the waitlist."
            );
        }

        booking.setEquipment(equipment);
        booking.setUser(user);
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setProjectName(request.getProjectName());
        booking.setNotes(request.getNotes());

        booking.setApprovalStatus("PENDING");

        Booking updatedBooking =
                bookingRepository.save(booking);

        return mapToResponse(updatedBooking);
    }

    @Override
    public void deleteBooking(
            String bookingId
    ) {

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Booking not found"
                        )
                );

        Equipment equipment = booking.getEquipment();

        bookingRepository.delete(booking);

        tryAllocateNextWaitlistUser(equipment);
    }

    private void tryAllocateNextWaitlistUser(
            Equipment equipment
    ) {

        if (equipment == null) {
            return;
        }

        try {
            waitlistService.allocateNextUser(
                    equipment.getId()
            );
        } catch (RuntimeException ignored) {
        }
    }

    private BookingResponse mapToResponse(
            Booking booking
    ) {

        String userName = null;

        if (booking.getUser() != null) {

            String firstName =
                    booking.getUser().getFirstName();

            String lastName =
                    booking.getUser().getLastName();

            userName = (
                    (firstName != null ? firstName : "")
                            + " "
                            + (lastName != null ? lastName : "")
            ).trim();
        }

        return new BookingResponse(
                booking.getId(),

                booking.getEquipment() != null
                        ? booking.getEquipment().getId()
                        : null,

                booking.getEquipment() != null
                        ? booking.getEquipment().getName()
                        : null,

                booking.getUser() != null
                        ? booking.getUser().getId()
                        : null,

                userName,

                booking.getUser() != null
                        ? booking.getUser().getEmail()
                        : null,

                booking.getStartTime(),
                booking.getEndTime(),
                booking.getPurpose(),
                booking.getProjectName(),
                booking.getNotes(),
                booking.getBookingStatus(),
                booking.getApprovalStatus(),
                booking.getCreatedAt(),
                booking.getUpdatedAt()
        );
    }
}