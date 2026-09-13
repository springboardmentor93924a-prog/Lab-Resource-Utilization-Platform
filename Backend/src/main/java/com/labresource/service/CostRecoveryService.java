package com.labresource.service;

import com.labresource.entity.ChargebackStatus;
import com.labresource.entity.CostRecovery;

import java.time.LocalDate;
import java.util.List;

public interface CostRecoveryService {

    // =========================================================
    // CREATE
    // =========================================================

    CostRecovery createRecovery(
            CostRecovery recovery
    );


    // =========================================================
    // UPDATE
    // =========================================================

    CostRecovery updateRecovery(
            Long id,
            CostRecovery recovery
    );


    // =========================================================
    // GET BY ID
    // =========================================================

    CostRecovery getRecoveryById(
            Long id
    );


    // =========================================================
    // GET ALL
    // =========================================================

    List<CostRecovery> getAllRecoveries();


    // =========================================================
    // GET BY COST
    // =========================================================

    List<CostRecovery> getRecoveriesByCost(
            Long costId
    );


    // =========================================================
    // GET BY DEPARTMENT
    // =========================================================

    List<CostRecovery> getRecoveriesByDepartment(
            Long departmentId
    );


    // =========================================================
    // GET BY INSTITUTION
    // =========================================================

    List<CostRecovery> getRecoveriesByInstitution(
            Long institutionId
    );


    // =========================================================
    // GET BY EQUIPMENT
    // =========================================================

    List<CostRecovery> getRecoveriesByEquipment(
            Long equipmentId
    );


    // =========================================================
    // GET BY CHARGEBACK STATUS
    // =========================================================

    List<CostRecovery> getRecoveriesByStatus(
            ChargebackStatus chargebackStatus
    );


    // =========================================================
    // GET BY RECOVERY DATE
    // =========================================================

    List<CostRecovery> getRecoveriesByDate(
            LocalDate recoveryDate
    );


    // =========================================================
    // GET BY DATE RANGE
    // =========================================================

    List<CostRecovery> getRecoveriesByDateRange(
            LocalDate startDate,
            LocalDate endDate
    );


    // =========================================================
    // DEPARTMENT + STATUS
    // =========================================================

    List<CostRecovery>
    getDepartmentRecoveriesByStatus(
            Long departmentId,
            ChargebackStatus chargebackStatus
    );


    // =========================================================
    // INSTITUTION + STATUS
    // =========================================================

    List<CostRecovery>
    getInstitutionRecoveriesByStatus(
            Long institutionId,
            ChargebackStatus chargebackStatus
    );


    // =========================================================
    // EQUIPMENT + STATUS
    // =========================================================

    List<CostRecovery>
    getEquipmentRecoveriesByStatus(
            Long equipmentId,
            ChargebackStatus chargebackStatus
    );


    // =========================================================
    // DEPARTMENT + DATE RANGE
    // =========================================================

    List<CostRecovery>
    getDepartmentRecoveriesByDateRange(
            Long departmentId,
            LocalDate startDate,
            LocalDate endDate
    );


    // =========================================================
    // INSTITUTION + DATE RANGE
    // =========================================================

    List<CostRecovery>
    getInstitutionRecoveriesByDateRange(
            Long institutionId,
            LocalDate startDate,
            LocalDate endDate
    );


    // =========================================================
    // STATUS + DATE RANGE
    // =========================================================

    List<CostRecovery>
    getRecoveriesByStatusAndDateRange(
            ChargebackStatus chargebackStatus,
            LocalDate startDate,
            LocalDate endDate
    );


    // =========================================================
    // CALCULATE OUTSTANDING AMOUNT
    // =========================================================

    Double calculateOutstandingAmount(
            Double recoverableAmount,
            Double recoveredAmount
    );


    // =========================================================
    // CALCULATE OUTSTANDING FOR EXISTING RECORD
    // =========================================================

    Double calculateOutstandingAmount(
            Long id
    );


    // =========================================================
    // UPDATE RECOVERY AMOUNT
    // =========================================================

    CostRecovery updateRecoveredAmount(
            Long id,
            Double recoveredAmount
    );


    // =========================================================
    // UPDATE CHARGEBACK STATUS
    // =========================================================

    CostRecovery updateChargebackStatus(
            Long id,
            ChargebackStatus chargebackStatus
    );


    // =========================================================
    // MARK AS RECOVERED
    // =========================================================

    CostRecovery markAsRecovered(
            Long id
    );


    // =========================================================
    // DELETE
    // =========================================================

    void deleteRecovery(
            Long id
    );
}