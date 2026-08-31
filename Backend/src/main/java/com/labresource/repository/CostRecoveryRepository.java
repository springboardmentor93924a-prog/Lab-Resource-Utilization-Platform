package com.labresource.repository;

import com.labresource.entity.ChargebackStatus;
import com.labresource.entity.CostRecovery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CostRecoveryRepository
        extends JpaRepository<CostRecovery, Long> {

    // =========================================================
    // FIND BY COST
    // =========================================================

    List<CostRecovery> findByCostId(Long costId);


    // =========================================================
    // FIND BY DEPARTMENT
    // =========================================================

    List<CostRecovery> findByDepartmentId(
            Long departmentId
    );


    // =========================================================
    // FIND BY INSTITUTION
    // =========================================================

    List<CostRecovery> findByInstitutionId(
            Long institutionId
    );


    // =========================================================
    // FIND BY EQUIPMENT
    // =========================================================

    List<CostRecovery> findByEquipmentId(
            Long equipmentId
    );


    // =========================================================
    // FIND BY CHARGEBACK STATUS
    // =========================================================

    List<CostRecovery> findByChargebackStatus(
            ChargebackStatus chargebackStatus
    );


    // =========================================================
    // FIND BY RECOVERY DATE
    // =========================================================

    List<CostRecovery> findByRecoveryDate(
            LocalDate recoveryDate
    );


    // =========================================================
    // FIND BY RECOVERY DATE RANGE
    // =========================================================

    List<CostRecovery> findByRecoveryDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );


    // =========================================================
    // DEPARTMENT + STATUS
    // =========================================================

    List<CostRecovery> findByDepartmentIdAndChargebackStatus(
            Long departmentId,
            ChargebackStatus chargebackStatus
    );


    // =========================================================
    // INSTITUTION + STATUS
    // =========================================================

    List<CostRecovery> findByInstitutionIdAndChargebackStatus(
            Long institutionId,
            ChargebackStatus chargebackStatus
    );


    // =========================================================
    // EQUIPMENT + STATUS
    // =========================================================

    List<CostRecovery> findByEquipmentIdAndChargebackStatus(
            Long equipmentId,
            ChargebackStatus chargebackStatus
    );


    // =========================================================
    // DEPARTMENT + DATE RANGE
    // =========================================================

    List<CostRecovery>
    findByDepartmentIdAndRecoveryDateBetween(
            Long departmentId,
            LocalDate startDate,
            LocalDate endDate
    );


    // =========================================================
    // INSTITUTION + DATE RANGE
    // =========================================================

    List<CostRecovery>
    findByInstitutionIdAndRecoveryDateBetween(
            Long institutionId,
            LocalDate startDate,
            LocalDate endDate
    );


    // =========================================================
    // STATUS + DATE RANGE
    // =========================================================

    List<CostRecovery>
    findByChargebackStatusAndRecoveryDateBetween(
            ChargebackStatus chargebackStatus,
            LocalDate startDate,
            LocalDate endDate
    );
}