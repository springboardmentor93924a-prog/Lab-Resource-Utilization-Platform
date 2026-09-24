package com.example.lab_platform.service;

import com.example.lab_platform.entity.Booking;
import com.example.lab_platform.entity.BookingAudit;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.BookingAuditRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Booking history / audit trail. record() is called wherever a booking's
 * status changes. It never throws: a failed audit write must not break
 * the booking action that triggered it.
 */
@Service
public class BookingAuditService {

    private static final Logger log = LoggerFactory.getLogger(BookingAuditService.class);

    private final BookingAuditRepository auditRepository;

    public BookingAuditService(BookingAuditRepository auditRepository) {
        this.auditRepository = auditRepository;
    }

    /**
     * @param actor the person who did it, or null when the system did it
     *              (automatic start / completion / expiry).
     */
    public void record(Booking booking, String fromStatus, String toStatus, User actor, String note) {

        try {

            if (booking == null || booking.getBookingId() == null) {
                return;
            }

            BookingAudit row = new BookingAudit();
            row.setBookingId(booking.getBookingId());
            row.setFromStatus(fromStatus);
            row.setToStatus(toStatus);
            row.setChangedAt(LocalDateTime.now());
            row.setNote(note == null ? null : (note.length() > 255 ? note.substring(0, 255) : note));

            if (actor == null) {
                row.setActorName("System");
                row.setActorRole("SYSTEM");
            } else {
                row.setActorName(actor.getFullName());
                row.setActorRole(actor.getRole() != null ? actor.getRole().getRoleName() : null);
            }

            auditRepository.save(row);

        } catch (Exception e) {
            log.warn("Could not write booking audit row: {}", e.getMessage());
        }
    }

    public List<BookingAudit> getTrail(Integer bookingId) {
        return auditRepository.findByBookingIdOrderByChangedAtAscAuditIdAsc(bookingId);
    }
}