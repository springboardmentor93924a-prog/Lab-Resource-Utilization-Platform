
package com.labresource.service;

import com.labresource.entity.BillingStatus;
import com.labresource.entity.InterInstitutionBilling;

import java.time.LocalDate;
import java.util.List;

public interface InterInstitutionBillingService {

    // =========================================================
    // CREATE
    // =========================================================

    InterInstitutionBilling createBilling(
            InterInstitutionBilling billing
    );


    // =========================================================
    // UPDATE
    // =========================================================

    InterInstitutionBilling updateBilling(
            Long id,
            InterInstitutionBilling billing
    );


    // =========================================================
    // GET BY ID
    // =========================================================

    InterInstitutionBilling getBillingById(
            Long id
    );


    // =========================================================
    // GET ALL
    // =========================================================

    List<InterInstitutionBilling> getAllBillings();


    // =========================================================
    // GET BY SHARING INSTITUTION
    // =========================================================

    List<InterInstitutionBilling>
    getBillingsBySharingInstitution(
            Long institutionId
    );


    // =========================================================
    // GET BY USING INSTITUTION
    // =========================================================

    List<InterInstitutionBilling>
    getBillingsByUsingInstitution(
            Long institutionId
    );


    // =========================================================
    // GET BY EQUIPMENT
    // =========================================================

    List<InterInstitutionBilling>
    getBillingsByEquipment(
            Long equipmentId
    );


    // =========================================================
    // GET BY BILLING STATUS
    // =========================================================

    List<InterInstitutionBilling>
    getBillingsByStatus(
            BillingStatus billingStatus
    );


    // =========================================================
    // GET BY BILLING DATE
    // =========================================================

    List<InterInstitutionBilling>
    getBillingsByDate(
            LocalDate billingDate
    );


    // =========================================================
    // GET BY DATE RANGE
    // =========================================================

    List<InterInstitutionBilling>
    getBillingsByDateRange(
            LocalDate startDate,
            LocalDate endDate
    );


    // =========================================================
    // SHARING INSTITUTION + DATE RANGE
    // =========================================================

    List<InterInstitutionBilling>
    getSharingInstitutionBillingsByDateRange(
            Long institutionId,
            LocalDate startDate,
            LocalDate endDate
    );


    // =========================================================
    // USING INSTITUTION + DATE RANGE
    // =========================================================

    List<InterInstitutionBilling>
    getUsingInstitutionBillingsByDateRange(
            Long institutionId,
            LocalDate startDate,
            LocalDate endDate
    );


    // =========================================================
    // EQUIPMENT + DATE RANGE
    // =========================================================

    List<InterInstitutionBilling>
    getEquipmentBillingsByDateRange(
            Long equipmentId,
            LocalDate startDate,
            LocalDate endDate
    );


    // =========================================================
    // CALCULATE BILLING AMOUNT
    // =========================================================

    Double calculateBillingAmount(
            Double usageHours,
            Double ratePerHour
    );


    // =========================================================
    // UPDATE BILLING STATUS
    // =========================================================

    InterInstitutionBilling updateBillingStatus(
            Long id,
            BillingStatus billingStatus
    );


    // =========================================================
    // DELETE
    // =========================================================

    void deleteBilling(
            Long id
    );
}
