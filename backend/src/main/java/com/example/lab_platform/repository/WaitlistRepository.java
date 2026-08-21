package com.example.lab_platform.repository;

import com.example.lab_platform.entity.Waitlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WaitlistRepository extends JpaRepository<Waitlist, Integer> {

    // All waitlist entries for a given equipment, ordered oldest-first
    // (so the first person to join the waitlist gets priority)
    List<Waitlist> findByEquipment_EquipmentIdAndWaitlistStatusOrderByCreatedAtAsc(
            Integer equipmentId,
            String waitlistStatus
    );

    // All waitlist entries created by a specific user
    List<Waitlist> findByUser_UserId(Integer userId);

    // All entries for a specific equipment (any status) — useful for admins/managers
    List<Waitlist> findByEquipment_EquipmentId(Integer equipmentId);

    boolean existsByUser_UserIdAndEquipment_EquipmentIdAndRequestedStartTimeAndRequestedEndTimeAndWaitlistStatusIn(
        Integer userId,
        Integer equipmentId,
        java.time.LocalDateTime requestedStartTime,
        java.time.LocalDateTime requestedEndTime,
        java.util.List<String> statuses
    );

    // Used to dedupe when auto-adding a displaced booking-holder: skip
    // if they already have an active (WAITING/NOTIFIED) entry for this
    // equipment, regardless of exact time window.
    boolean existsByUser_UserIdAndEquipment_EquipmentIdAndWaitlistStatusIn(
        Integer userId,
        Integer equipmentId,
        java.util.List<String> statuses
    );

    // The cascade-processing order: priority entries (displaced booking
    // holders) first, then earliest queueDate within each group — for a
    // priority entry that's the original booking's bookingDate (system
    // date they reserved, not their requested usage start time); for an
    // ordinary entry it's the date they joined the waitlist. createdAt
    // breaks ties on the same date. Used both when equipment frees up
    // (booking rejected/completed) and when an urgent feedback report
    // or a calibration is resolved/completed.
    List<Waitlist> findByEquipment_EquipmentIdAndWaitlistStatusInOrderByIsPriorityDescQueueDateAscCreatedAtAsc(
        Integer equipmentId,
        java.util.List<String> statuses
    );
}