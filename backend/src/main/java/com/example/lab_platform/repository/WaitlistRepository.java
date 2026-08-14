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
}