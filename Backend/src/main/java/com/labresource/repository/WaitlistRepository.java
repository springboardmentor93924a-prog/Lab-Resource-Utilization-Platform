package com.labresource.repository;

import com.labresource.entity.Waitlist;
import com.labresource.entity.WaitlistStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface WaitlistRepository
        extends JpaRepository<Waitlist, Long> {

    // =========================================================
    // USER WAITLISTS
    // =========================================================

    List<Waitlist> findByUserId(Long userId);

    // =========================================================
    // EQUIPMENT WAITLISTS
    // =========================================================

    List<Waitlist> findByEquipmentId(Long equipmentId);

    List<Waitlist> findByEquipmentIdAndBookingDate(
            Long equipmentId,
            LocalDate bookingDate
    );

    // =========================================================
    // STATUS
    // =========================================================

    List<Waitlist> findByStatus(
            WaitlistStatus status
    );

    // =========================================================
    // QUEUE MANAGEMENT
    // =========================================================

    List<Waitlist>
    findByEquipmentIdAndBookingDateAndStartTimeAndEndTimeAndStatusOrderByCreatedAtAsc(
            Long equipmentId,
            LocalDate bookingDate,
            LocalTime startTime,
            LocalTime endTime,
            WaitlistStatus status
    );

    // =========================================================
    // CHECK WHETHER USER IS ALREADY WAITING
    // =========================================================

    boolean existsByEquipmentIdAndUserIdAndBookingDateAndStartTimeAndEndTimeAndStatus(
            Long equipmentId,
            Long userId,
            LocalDate bookingDate,
            LocalTime startTime,
            LocalTime endTime,
            WaitlistStatus status
    );
}