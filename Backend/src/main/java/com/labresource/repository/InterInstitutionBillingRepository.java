
package com.labresource.repository;

import com.labresource.entity.BillingStatus;
import com.labresource.entity.InterInstitutionBilling;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InterInstitutionBillingRepository
        extends JpaRepository<InterInstitutionBilling, Long> {

    // =========================================================
    // FIND BY SHARING INSTITUTION
    // =========================================================

    List<InterInstitutionBilling> findBySharingInstitutionId(
            Long sharingInstitutionId
    );


    // =========================================================
    // FIND BY USING INSTITUTION
    // =========================================================

    List<InterInstitutionBilling> findByUsingInstitutionId(
            Long usingInstitutionId
    );


    // =========================================================
    // FIND BY EQUIPMENT
    // =========================================================

    List<InterInstitutionBilling> findByEquipmentId(
            Long equipmentId
    );


    // =========================================================
    // FIND BY BILLING STATUS
    // =========================================================

    List<InterInstitutionBilling> findByBillingStatus(
            BillingStatus billingStatus
    );


    // =========================================================
    // FIND BY BILLING DATE
    // =========================================================

    List<InterInstitutionBilling> findByBillingDate(
            LocalDate billingDate
    );


    // =========================================================
    // FIND BY BILLING DATE RANGE
    // =========================================================

    List<InterInstitutionBilling> findByBillingDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );


    // =========================================================
    // SHARING INSTITUTION + DATE RANGE
    // =========================================================

    List<InterInstitutionBilling>
    findBySharingInstitutionIdAndBillingDateBetween(
            Long sharingInstitutionId,
            LocalDate startDate,
            LocalDate endDate
    );


    // =========================================================
    // USING INSTITUTION + DATE RANGE
    // =========================================================

    List<InterInstitutionBilling>
    findByUsingInstitutionIdAndBillingDateBetween(
            Long usingInstitutionId,
            LocalDate startDate,
            LocalDate endDate
    );


    // =========================================================
    // EQUIPMENT + DATE RANGE
    // =========================================================

    List<InterInstitutionBilling>
    findByEquipmentIdAndBillingDateBetween(
            Long equipmentId,
            LocalDate startDate,
            LocalDate endDate
    );
}
