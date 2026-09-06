package com.labplatform.booking.repository;

import com.labplatform.booking.model.WaitlistEntry;
import com.labplatform.booking.model.WaitlistStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WaitlistEntryRepository extends JpaRepository<WaitlistEntry, Integer> {

    List<WaitlistEntry> findByEquipmentIdAndRequestedDateAndStatusOrderByCreatedAtAsc(
            Long equipmentId, java.time.LocalDate requestedDate, WaitlistStatus status);

    List<WaitlistEntry> findByUserId(UUID userId);
}