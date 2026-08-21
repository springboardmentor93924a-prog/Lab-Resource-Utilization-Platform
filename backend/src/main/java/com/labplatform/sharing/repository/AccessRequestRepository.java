package com.labplatform.sharing.repository;

import com.labplatform.sharing.model.AccessRequest;
import com.labplatform.sharing.model.AccessRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AccessRequestRepository
        extends JpaRepository<AccessRequest, Integer> {

    List<AccessRequest> findByOwningInstitutionIdAndStatus(
            Integer institutionId,
            AccessRequestStatus status);

    List<AccessRequest> findByRequestingUserId(
            UUID requestingUserId);

    boolean existsByRequestingUserIdAndEquipmentIdAndStatus(
            UUID requestingUserId,
            Long equipmentId,
            AccessRequestStatus status);

    List<AccessRequest> findByCreatedAtBetween(
            LocalDateTime start,
            LocalDateTime end);
}