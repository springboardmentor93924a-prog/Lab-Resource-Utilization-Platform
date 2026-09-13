package com.labresource.repository;

import com.labresource.entity.BillingStatus;
import com.labresource.entity.Cost;
import com.labresource.entity.CostType;
import com.labresource.entity.Department;
import com.labresource.entity.Equipment;
import com.labresource.entity.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CostRepository extends JpaRepository<Cost, Long> {

    // =========================================================
    // FIND BY EQUIPMENT
    // =========================================================

    List<Cost> findByEquipment(Equipment equipment);

    List<Cost> findByEquipmentId(Long equipmentId);

    // =========================================================
    // FIND BY DEPARTMENT
    // =========================================================

    List<Cost> findByDepartment(Department department);

    List<Cost> findByDepartmentId(Long departmentId);

    // =========================================================
    // FIND BY INSTITUTION
    // =========================================================

    List<Cost> findByInstitution(Institution institution);

    List<Cost> findByInstitutionId(Long institutionId);

    // =========================================================
    // FIND BY COST TYPE
    // =========================================================

    List<Cost> findByCostType(CostType costType);

    // =========================================================
    // FIND BY BILLING STATUS
    // =========================================================

    List<Cost> findByBillingStatus(BillingStatus billingStatus);

    // =========================================================
    // FIND BY DATE
    // =========================================================

    List<Cost> findByCostDate(LocalDate costDate);

    List<Cost> findByCostDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    // =========================================================
    // DEPARTMENT + DATE RANGE
    // =========================================================

    List<Cost> findByDepartmentIdAndCostDateBetween(
            Long departmentId,
            LocalDate startDate,
            LocalDate endDate
    );

    // =========================================================
    // INSTITUTION + DATE RANGE
    // =========================================================

    List<Cost> findByInstitutionIdAndCostDateBetween(
            Long institutionId,
            LocalDate startDate,
            LocalDate endDate
    );

    // =========================================================
    // EQUIPMENT + DATE RANGE
    // =========================================================

    List<Cost> findByEquipmentIdAndCostDateBetween(
            Long equipmentId,
            LocalDate startDate,
            LocalDate endDate
    );

    // =========================================================
// 3.9 DEPARTMENT-WISE COST ALLOCATION
// =========================================================

@Query("""
    SELECT
        c.department.id,
        c.department.name,
        COALESCE(SUM(c.usageHours), 0),
        COALESCE(SUM(c.totalCost), 0)
    FROM Cost c
    WHERE c.department IS NOT NULL
    GROUP BY c.department.id, c.department.name
    ORDER BY c.department.name
""")
List<Object[]> findDepartmentCostAllocation();

}