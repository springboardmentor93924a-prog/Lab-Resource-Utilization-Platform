package com.labresource.service;

import com.labresource.dto.BookingRequest;
import com.labresource.entity.Booking;
import com.labresource.entity.BookingStatus;
import com.labresource.entity.Equipment;
import com.labresource.entity.User;

import com.labresource.entity.NotificationType;
import com.labresource.service.NotificationService;
import com.labresource.security.SecurityService;

import com.labresource.repository.BookingRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.UserRepository;

import com.labresource.dto.BookingOptimizationResponse;

import com.labresource.dto.BookingResponse;
import com.labresource.dto.TimeSlotResponse;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.ArrayList;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final SecurityService securityService;

    public BookingService(
            BookingRepository bookingRepository,
            EquipmentRepository equipmentRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            SecurityService securityService
    ) {
        this.bookingRepository = bookingRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.securityService = securityService;
    }

    public Booking createBooking(BookingRequest request) {

        if (request.getEquipmentId() == null) {
            throw new RuntimeException("Equipment is required");
        }

        // if (request.getUserId() == null) {
        //     throw new RuntimeException("User is required");
        // }

        if (request.getBookingDate() == null) {
            throw new RuntimeException("Booking date is required");
        }

        if (request.getStartTime() == null ||
                request.getEndTime() == null) {

            throw new RuntimeException(
                    "Start time and end time are required"
            );
        }

        if (!request.getEndTime().isAfter(
                request.getStartTime())) {

            throw new RuntimeException(
                    "End time must be after start time"
            );
        }

        Equipment equipment =
                equipmentRepository.findById(
                        request.getEquipmentId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Equipment not found"
                        )
                );

        // User user =
        //         userRepository.findById(
        //                 request.getUserId()
        //         ).orElseThrow(() ->
        //                 new RuntimeException(
        //                         "User not found"
        //                 )
        //         );

        User user =
        securityService.getCurrentUser();

        /*
         * Check whether the equipment already has
         * a booking at the requested time.
         */
        List<Booking> existingBookings =
                bookingRepository
                        .findByEquipmentIdAndBookingDate(
                                request.getEquipmentId(),
                                request.getBookingDate()
                        );

        for (Booking existing : existingBookings) {

    // Only CONFIRMED bookings block the equipment
    if (existing.getStatus() != BookingStatus.CONFIRMED) {
        continue;
    }

    if (isOverlapping(
            request.getStartTime(),
            request.getEndTime(),
            existing.getStartTime(),
            existing.getEndTime()
    )) {

        throw new RuntimeException(
                "Equipment is already booked for the selected time"
        );
    }
}

        Booking booking = new Booking();

        booking.setEquipment(equipment);
        booking.setUser(user);

        booking.setBookingDate(
                request.getBookingDate()
        );

        booking.setStartTime(
                request.getStartTime()
        );

        booking.setEndTime(
                request.getEndTime()
        );

        booking.setPurpose(
                request.getPurpose()
        );

        booking.setRecurring(
                request.isRecurring()
        );

        booking.setRecurrenceWeeks(
                request.getRecurrenceWeeks()
        );

        booking.setStatus(
                BookingStatus.PENDING_APPROVAL
        );

        // return bookingRepository.save(booking);

        Booking savedBooking = bookingRepository.save(booking);

        notificationService.createNotification(
                user,
                NotificationType.BOOKING_CONFIRMATION,
                "Booking Submitted",
                "Your booking for " +
                        equipment.getName() +
                        " on " +
                        request.getBookingDate() +
                        " from " +
                        request.getStartTime() +
                        " to " +
                        request.getEndTime() +
                        " has been submitted for approval.",
                savedBooking.getId(),
                "BOOKING"
        );
        
        return savedBooking;
    }

    private boolean isOverlapping(
            LocalTime newStart,
            LocalTime newEnd,
            LocalTime existingStart,
            LocalTime existingEnd
    ) {

        return newStart.isBefore(existingEnd)
                && newEnd.isAfter(existingStart);
    }

    public List<BookingResponse> getUserBookings(
        Long userId
) {

    securityService.checkUserAccess(
            userId
    );


    return bookingRepository
            .findByUserId(userId)
            .stream()
            .map(this::convertToResponse)
            .toList();
}

    public List<BookingResponse> getEquipmentBookings(
        Long equipmentId) {

    return bookingRepository
            .findByEquipmentId(equipmentId)
            .stream()
            .map(this::convertToResponse)
            .toList();
     }

    public List<BookingResponse> getAllBookings() {

    return bookingRepository
            .findAll()
            .stream()
            .map(this::convertToResponse)
            .toList();
     }

    public Booking getBooking(Long id) {

    Booking booking =
            bookingRepository
                    .findById(id)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Booking not found"
                            )
                    );


    securityService.checkOwnership(
            booking.getUser().getId()
    );


    return booking;
}

    public Booking cancelBooking(Long id) {

    Booking booking = getBooking(id);

    booking.setStatus(
            BookingStatus.CANCELLED
    );

    Booking savedBooking = bookingRepository.save(booking);

    if (booking.getUser() != null) {

        notificationService.createNotification(
                booking.getUser(),
                NotificationType.SYSTEM_ALERT,
                "Booking Cancelled",
                "Your booking for " +
                        getEquipmentName(booking) +
                        " on " +
                        booking.getBookingDate() +
                        " has been cancelled.",
                savedBooking.getId(),
                "BOOKING"
        );
    }

    return savedBooking;
}
    public Booking approveBooking(Long id) {

    Booking booking =
            bookingRepository
                    .findById(id)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Booking not found"
                            )
                    );

    if (booking.getStatus()
            != BookingStatus.PENDING_APPROVAL) {

        throw new RuntimeException(
                "Only pending bookings can be approved"
        );
    }

    booking.setStatus(
            BookingStatus.CONFIRMED
    );

    Booking savedBooking =
            bookingRepository.save(booking);

    if (booking.getUser() != null) {

        notificationService.createNotification(
                booking.getUser(),
                NotificationType.BOOKING_APPROVED,
                "Booking Approved",
                "Your booking for " +
                        getEquipmentName(booking) +
                        " on " +
                        booking.getBookingDate() +
                        " from " +
                        booking.getStartTime() +
                        " to " +
                        booking.getEndTime() +
                        " has been approved.",
                savedBooking.getId(),
                "BOOKING"
        );
    }

    return savedBooking;
}


public Booking rejectBooking(Long id) {

    Booking booking = getBooking(id);

    if (booking.getStatus() != BookingStatus.PENDING_APPROVAL) {
        throw new RuntimeException(
                "Only pending bookings can be rejected"
        );
    }

    booking.setStatus(
            BookingStatus.CANCELLED
    );

    Booking savedBooking = bookingRepository.save(booking);

    if (booking.getUser() != null) {

        notificationService.createNotification(
                booking.getUser(),
                NotificationType.BOOKING_REJECTED,
                "Booking Rejected",
                "Your booking for " +
                        getEquipmentName(booking) +
                        " on " +
                        booking.getBookingDate() +
                        " has been rejected.",
                savedBooking.getId(),
                "BOOKING"
        );
    }

    return savedBooking;
}

private BookingResponse convertToResponse(Booking booking) {

    BookingResponse response = new BookingResponse();

    response.setId(booking.getId());

    if (booking.getEquipment() != null) {

        response.setEquipmentId(
                booking.getEquipment().getId()
        );

        response.setEquipmentName(
                booking.getEquipment().getName()
        );

        response.setEquipmentCategory(
                booking.getEquipment().getCategory()
        );

        response.setEquipmentAssetTag(
                booking.getEquipment().getAssetTag()
        );

        response.setEquipmentImageUrl(
                booking.getEquipment().getImageUrl()
        );
    }

    if (booking.getUser() != null) {

    response.setUserId(
            booking.getUser().getId()
    );

    response.setUserName(
            booking.getUser().getFullName()
    );
}

    response.setBookingDate(
            booking.getBookingDate()
    );

    response.setStartTime(
            booking.getStartTime()
    );

    response.setEndTime(
            booking.getEndTime()
    );

    response.setPurpose(
            booking.getPurpose()
    );

    response.setRecurring(
            booking.isRecurring()
    );

    response.setRecurrenceWeeks(
            booking.getRecurrenceWeeks()
    );

    response.setStatus(
            booking.getStatus().name()
    );

    return response;
}

public List<BookingResponse> getPendingBookings() {

    return bookingRepository
            .findByStatus(BookingStatus.PENDING_APPROVAL)
            .stream()
            .map(this::convertToResponse)
            .toList();
}

public boolean isAvailable(
        Long equipmentId,
        LocalDate bookingDate,
        LocalTime startTime,
        LocalTime endTime
) {

    if (equipmentId == null) {
        throw new RuntimeException(
                "Equipment is required"
        );
    }

    if (bookingDate == null) {
        throw new RuntimeException(
                "Booking date is required"
        );
    }

    if (startTime == null || endTime == null) {
        throw new RuntimeException(
                "Start time and end time are required"
        );
    }

    if (!endTime.isAfter(startTime)) {
        throw new RuntimeException(
                "End time must be after start time"
        );
    }

    // Make sure equipment exists
    equipmentRepository.findById(equipmentId)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Equipment not found"
                    )
            );

    List<Booking> existingBookings =
            bookingRepository
                    .findByEquipmentIdAndBookingDate(
                            equipmentId,
                            bookingDate
                    );

    for (Booking existing : existingBookings) {

    // Only CONFIRMED bookings block the equipment
    if (existing.getStatus() != BookingStatus.CONFIRMED) {
        continue;
    }

    if (isOverlapping(
            startTime,
            endTime,
            existing.getStartTime(),
            existing.getEndTime()
    )) {

        return false;
    }
}

    return true;
}

public List<TimeSlotResponse> getAvailableTimeSlots(
        Long equipmentId,
        LocalDate bookingDate
) {

    if (equipmentId == null) {
        throw new RuntimeException(
                "Equipment is required"
        );
    }

    if (bookingDate == null) {
        throw new RuntimeException(
                "Booking date is required"
        );
    }

    // Make sure equipment exists
    equipmentRepository.findById(equipmentId)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Equipment not found"
                    )
            );

    List<Booking> existingBookings =
            bookingRepository
                    .findByEquipmentIdAndBookingDate(
                            equipmentId,
                            bookingDate
                    );

    List<TimeSlotResponse> slots =
            new ArrayList<>();

    /*
     * Lab working hours:
     * 09:00 AM to 06:00 PM
     *
     * Each slot is 1 hour.
     */

    LocalTime currentTime =
            LocalTime.of(9, 0);

    LocalTime closingTime =
            LocalTime.of(18, 0);

    while (currentTime.isBefore(closingTime)) {

        LocalTime slotEnd =
                currentTime.plusHours(1);

        boolean available = true;

        /*
         * Only CONFIRMED bookings block
         * the equipment.
         */

        for (Booking existing : existingBookings) {

            if (existing.getStatus()
                    != BookingStatus.CONFIRMED) {

                continue;
            }

            if (isOverlapping(
                    currentTime,
                    slotEnd,
                    existing.getStartTime(),
                    existing.getEndTime()
            )) {

                available = false;

                break;
            }
        }

        String status;

        if (available) {
            status = "AVAILABLE";
        } else {
            status = "BOOKED";
        }

        slots.add(
                new TimeSlotResponse(
                        currentTime,
                        slotEnd,
                        available,
                        status
                )
        );

        currentTime = slotEnd;
    }

    return slots;
}



public BookingOptimizationResponse getRecommendedSlot(
        Long equipmentId,
        LocalDate bookingDate
) {

    List<TimeSlotResponse> slots =
            getAvailableTimeSlots(
                    equipmentId,
                    bookingDate
            );

    /*
     * Find the earliest available slot.
     */
    for (TimeSlotResponse slot : slots) {

        if (slot.isAvailable()) {

            return new BookingOptimizationResponse(
                    true,
                    slot.getStartTime(),
                    slot.getEndTime(),
                    "Earliest available slot found."
            );
        }
    }

    /*
     * No available slot for the selected date.
     */
    return new BookingOptimizationResponse(
            false,
            null,
            null,
            "No available slot found for this date."
    );
}


private String getEquipmentName(Booking booking) {

    if (booking.getEquipment() != null &&
            booking.getEquipment().getName() != null) {

        return booking.getEquipment().getName();
    }

    if (booking.getEquipment() != null &&
            booking.getEquipment().getId() != null) {

        return "Equipment #" +
                booking.getEquipment().getId();
    }

    return "equipment";
}


}