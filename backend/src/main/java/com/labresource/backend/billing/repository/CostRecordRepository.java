package com.labresource.backend.billing.repository;

import com.labresource.backend.billing.entity.CostRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CostRecordRepository extends JpaRepository<CostRecord, Long> {
    List<CostRecord> findByDepartmentId(Long departmentId);
    List<CostRecord> findByInstitutionId(Long institutionId);
    List<CostRecord> findByEquipmentId(Long equipmentId);
    Optional<CostRecord> findByMaintenanceId(Long maintenanceId);
    Optional<CostRecord> findByBookingIdAndCostType(Long bookingId, String costType);
    Optional<CostRecord> findByMaintenanceIdAndCostType(Long maintenanceId, String costType);
    Optional<CostRecord> findBySharingAgreementIdAndBillingPeriod(Long sharingAgreementId, String billingPeriod);
    boolean existsByMaintenanceId(Long maintenanceId);

    // Date-range queries for report aggregation
    List<CostRecord> findByDepartmentIdAndCreatedAtBetween(Long departmentId, LocalDateTime from, LocalDateTime to);
    List<CostRecord> findByInstitutionIdAndCreatedAtBetween(Long institutionId, LocalDateTime from, LocalDateTime to);
}

