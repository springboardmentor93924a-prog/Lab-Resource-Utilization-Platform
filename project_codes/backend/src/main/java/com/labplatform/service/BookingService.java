package com.labplatform.service;

import com.labplatform.dto.BookingRequest;
import com.labplatform.entity.*;
import com.labplatform.repository.BookingRepository;
import com.labplatform.repository.EquipmentRepository;
import com.labplatform.repository.WaitlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final WaitlistRepository waitlistRepository;
    private final NotificationService notificationService;
    private final CostService costService;

    private static final List<BookingStatus> BLOCKING_STATUSES =
            List.of(BookingStatus.PENDING_APPROVAL, BookingStatus.CONFIRMED, BookingStatus.IN_USE);

    public Booking create(User requester, BookingRequest req) {
        Equipment equipment = equipmentRepository.findById(req.getEquipmentId())
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found"));

        if (equipment.getStatus() == EquipmentStatus.RETIRED || equipment.getStatus() == EquipmentStatus.OUT_OF_SERVICE) {
            throw new IllegalStateException("Equipment is not available for booking (" + equipment.getStatus() + ")");
        }

        boolean conflict = !bookingRepository
                .findByEquipmentIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                        equipment.getId(), BLOCKING_STATUSES, req.getEndTime(), req.getStartTime())
                .isEmpty();

        if (conflict) {
            throw new IllegalStateException("Equipment is already booked for that time slot. You can join the waitlist instead.");
        }

        Booking booking = Booking.builder()
                .equipment(equipment)
                .requestedBy(requester)
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .purpose(req.getPurpose())
                .recurring(req.isRecurring())
                .recurrenceRule(req.getRecurrenceRule())
                .status(BookingStatus.PENDING_APPROVAL)
                .build();

        Booking saved = bookingRepository.save(booking);

        notificationService.notify(requester, "Booking request submitted",
                "Your booking request for " + equipment.getName() + " is pending approval.", "BOOKING_CONFIRMATION");

        return saved;
    }

    public Booking approve(Long bookingId, User approver) {
        Booking booking = get(bookingId);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setApprovedBy(approver);
        Booking saved = bookingRepository.save(booking);

        notificationService.notify(booking.getRequestedBy(), "Booking confirmed",
                "Your booking for " + booking.getEquipment().getName() + " has been confirmed.", "BOOKING_CONFIRMATION");
        return saved;
    }

    public Booking reject(Long bookingId, User approver) {
        Booking booking = get(bookingId);
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setApprovedBy(approver);
        Booking saved = bookingRepository.save(booking);

        notificationService.notify(booking.getRequestedBy(), "Booking rejected",
                "Your booking request for " + booking.getEquipment().getName() + " was rejected.", "BOOKING_CONFIRMATION");
        promoteWaitlist(booking.getEquipment());
        return saved;
    }

    public Booking cancel(Long bookingId, User actor) {
        Booking booking = get(bookingId);
        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        promoteWaitlist(booking.getEquipment());
        return saved;
    }

    public Booking checkIn(Long bookingId) {
        Booking booking = get(bookingId);
        booking.setStatus(BookingStatus.IN_USE);
        booking.setActualStartTime(LocalDateTime.now());
        booking.getEquipment().setStatus(EquipmentStatus.BOOKED);
        equipmentRepository.save(booking.getEquipment());
        return bookingRepository.save(booking);
    }

    public Booking checkOut(Long bookingId) {
        Booking booking = get(bookingId);
        booking.setStatus(BookingStatus.COMPLETED);
        booking.setActualEndTime(LocalDateTime.now());
        booking.getEquipment().setStatus(EquipmentStatus.AVAILABLE);
        equipmentRepository.save(booking.getEquipment());
        Booking saved = bookingRepository.save(booking);
        promoteWaitlist(booking.getEquipment());
        costService.chargeForCompletedBooking(saved);
        return saved;
    }

    public Booking markNoShow(Long bookingId) {
        Booking booking = get(bookingId);
        booking.setStatus(BookingStatus.NO_SHOW);
        booking.setNoShowFlag(true);
        Booking saved = bookingRepository.save(booking);
        promoteWaitlist(booking.getEquipment());
        return saved;
    }

    private void promoteWaitlist(Equipment equipment) {
        List<Waitlist> waiters = waitlistRepository.findByEquipmentIdOrderByCreatedAtAsc(equipment.getId());
        if (!waiters.isEmpty()) {
            Waitlist next = waiters.get(0);
            if (!next.isNotified()) {
                next.setNotified(true);
                waitlistRepository.save(next);
                notificationService.notify(next.getUser(), "Equipment now available",
                        equipment.getName() + " has an open slot — book now before it's taken.", "WAITLIST");
            }
        }
    }

    public Booking get(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
    }

    public List<Booking> forUser(Long userId) {
        return bookingRepository.findByRequestedById(userId);
    }

    public List<Booking> forEquipment(Long equipmentId) {
        return bookingRepository.findByEquipmentId(equipmentId);
    }

    public List<Booking> byStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }

    public List<Booking> all() {
        return bookingRepository.findAll();
    }
}
