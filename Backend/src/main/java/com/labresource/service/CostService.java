
package com.labresource.service;

import com.labresource.entity.BillingStatus;
import com.labresource.entity.Cost;
import com.labresource.entity.CostType;
import com.labresource.dto.DepartmentCostAllocationDTO;

import java.time.LocalDate;
import java.util.List;

public interface CostService {

    // =========================================================
    // CREATE
    // =========================================================

    Cost createCost(Cost cost);

    // =========================================================
    // UPDATE
    // =========================================================

    Cost updateCost(Long id, Cost cost);

    // =========================================================
    // GET BY ID
    // =========================================================

    Cost getCostById(Long id);

    // =========================================================
    // GET ALL
    // =========================================================

    List<Cost> getAllCosts();

    // =========================================================
    // GET BY EQUIPMENT
    // =========================================================

    List<Cost> getCostsByEquipment(Long equipmentId);

    // =========================================================
    // GET BY DEPARTMENT
    // =========================================================

    List<Cost> getCostsByDepartment(Long departmentId);

    // =========================================================
    // GET BY INSTITUTION
    // =========================================================

    List<Cost> getCostsByInstitution(Long institutionId);

    // =========================================================
    // GET BY COST TYPE
    // =========================================================

    List<Cost> getCostsByType(CostType costType);

    // =========================================================
    // GET BY BILLING STATUS
    // =========================================================

    List<Cost> getCostsByBillingStatus(BillingStatus billingStatus);

    // =========================================================
    // GET BY DATE RANGE
    // =========================================================

    List<Cost> getCostsByDateRange(
            LocalDate startDate,
            LocalDate endDate
    );

    // =========================================================
    // DEPARTMENT COST BY DATE RANGE
    // =========================================================

    List<Cost> getDepartmentCostsByDateRange(
            Long departmentId,
            LocalDate startDate,
            LocalDate endDate
    );

    // =========================================================
    // INSTITUTION COST BY DATE RANGE
    // =========================================================

    List<Cost> getInstitutionCostsByDateRange(
            Long institutionId,
            LocalDate startDate,
            LocalDate endDate
    );

    // =========================================================
    // EQUIPMENT COST BY DATE RANGE
    // =========================================================

    List<Cost> getEquipmentCostsByDateRange(
            Long equipmentId,
            LocalDate startDate,
            LocalDate endDate
    );

    // =========================================================
    // CALCULATE TOTAL COST
    // =========================================================

    Double calculateTotalCost(
            Double usageHours,
            Double ratePerHour
    );

    Double calculateCost(Long id);

    // =========================================================
    // UPDATE BILLING STATUS
    // =========================================================

    Cost updateBillingStatus(
            Long id,
            BillingStatus billingStatus
    );

    // =========================================================
    // DELETE
    // =========================================================

    void deleteCost(Long id);

    // =========================================================
// 3.9 DEPARTMENT-WISE COST ALLOCATION
// =========================================================

List<DepartmentCostAllocationDTO> getDepartmentCostAllocation();
}
