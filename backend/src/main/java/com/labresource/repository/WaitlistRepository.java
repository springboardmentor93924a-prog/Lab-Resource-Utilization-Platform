package com.labresource.repository;

import com.labresource.entity.Equipment;
import com.labresource.entity.User;
import com.labresource.entity.WaitlistEntry;
import com.labresource.enums.WaitlistStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WaitlistRepository
        extends JpaRepository<WaitlistEntry, String> {

    List<WaitlistEntry> findByEquipment(
            Equipment equipment
    );

    List<WaitlistEntry> findByUser(
            User user
    );

    List<WaitlistEntry> findByStatus(
            WaitlistStatus status
    );

    List<WaitlistEntry> findByEquipmentAndStatusOrderByPriorityDescCreatedAtAsc(
            Equipment equipment,
            WaitlistStatus status
    );

    List<WaitlistEntry> findByEquipmentOrderByPriorityDescCreatedAtAsc(
            Equipment equipment
    );

    Optional<WaitlistEntry>
    findFirstByEquipmentAndStatusOrderByPriorityDescCreatedAtAsc(
            Equipment equipment,
            WaitlistStatus status
    );

    boolean existsByEquipmentAndUserAndRequestedStartTimeAndRequestedEndTimeAndStatus(
            Equipment equipment,
            User user,
            LocalDateTime requestedStartTime,
            LocalDateTime requestedEndTime,
            WaitlistStatus status
    );

    List<WaitlistEntry>
    findByStatusAndAllocationExpiresAtBefore(
            WaitlistStatus status,
            LocalDateTime currentTime
    );

    List<WaitlistEntry>
    findByEquipmentAndRequestedStartTimeLessThanAndRequestedEndTimeGreaterThanAndStatus(
            Equipment equipment,
            LocalDateTime requestedEndTime,
            LocalDateTime requestedStartTime,
            WaitlistStatus status
    );

    long countByEquipmentAndStatus(
            Equipment equipment,
            WaitlistStatus status
    );
}