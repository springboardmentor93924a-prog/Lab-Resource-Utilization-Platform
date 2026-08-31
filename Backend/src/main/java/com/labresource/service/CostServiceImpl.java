package com.labresource.service.impl;

import com.labresource.entity.BillingStatus;
import com.labresource.entity.Cost;
import com.labresource.entity.CostType;
import com.labresource.entity.EquipmentUtilization;
import com.labresource.repository.CostRepository;
import com.labresource.repository.EquipmentUtilizationRepository;
import com.labresource.service.CostService;
import com.labresource.dto.DepartmentCostAllocationDTO;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class CostServiceImpl implements CostService {

    private final CostRepository costRepository;
    private final EquipmentUtilizationRepository utilizationRepository;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public CostServiceImpl(
            CostRepository costRepository,
            EquipmentUtilizationRepository utilizationRepository
    ) {
        this.costRepository = costRepository;
        this.utilizationRepository = utilizationRepository;
    }

    // =========================================================
    // CREATE
    // =========================================================

    @Override
    public Cost createCost(Cost cost) {

        if (cost == null) {
            throw new IllegalArgumentException(
                    "Cost data cannot be null"
            );
        }

        calculateAndSetTotalCost(cost);

        return costRepository.save(cost);
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @Override
    public Cost updateCost(
            Long id,
            Cost updatedCost
    ) {

        Cost existingCost = getCostById(id);

        if (updatedCost == null) {
            throw new IllegalArgumentException(
                    "Cost data cannot be null"
            );
        }

        existingCost.setEquipment(
                updatedCost.getEquipment()
        );

        existingCost.setDepartment(
                updatedCost.getDepartment()
        );

        existingCost.setInstitution(
                updatedCost.getInstitution()
        );

        existingCost.setCostType(
                updatedCost.getCostType()
        );

        existingCost.setBillingStatus(
                updatedCost.getBillingStatus()
        );

        existingCost.setUsageHours(
                updatedCost.getUsageHours()
        );

        existingCost.setRatePerHour(
                updatedCost.getRatePerHour()
        );

        existingCost.setCostDate(
                updatedCost.getCostDate()
        );

        existingCost.setDescription(
                updatedCost.getDescription()
        );

        calculateAndSetTotalCost(existingCost);

        return costRepository.save(existingCost);
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Cost getCostById(Long id) {

        return costRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Cost record not found with id: " + id
                        )
                );
    }

    // =========================================================
    // GET ALL
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Cost> getAllCosts() {

        return costRepository.findAll();
    }

    // =========================================================
    // GET BY EQUIPMENT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Cost> getCostsByEquipment(
            Long equipmentId
    ) {

        return costRepository.findByEquipmentId(
                equipmentId
        );
    }

    // =========================================================
    // GET BY DEPARTMENT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Cost> getCostsByDepartment(
            Long departmentId
    ) {

        return costRepository.findByDepartmentId(
                departmentId
        );
    }

    // =========================================================
    // GET BY INSTITUTION
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Cost> getCostsByInstitution(
            Long institutionId
    ) {

        return costRepository.findByInstitutionId(
                institutionId
        );
    }

    // =========================================================
    // GET BY COST TYPE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Cost> getCostsByType(
            CostType costType
    ) {

        if (costType == null) {
            throw new IllegalArgumentException(
                    "Cost type cannot be null"
            );
        }

        return costRepository.findByCostType(
                costType
        );
    }

    // =========================================================
    // GET BY BILLING STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Cost> getCostsByBillingStatus(
            BillingStatus billingStatus
    ) {

        if (billingStatus == null) {
            throw new IllegalArgumentException(
                    "Billing status cannot be null"
            );
        }

        return costRepository.findByBillingStatus(
                billingStatus
        );
    }

    // =========================================================
    // GET BY DATE RANGE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Cost> getCostsByDateRange(
            LocalDate startDate,
            LocalDate endDate
    ) {

        validateDateRange(
                startDate,
                endDate
        );

        return costRepository.findByCostDateBetween(
                startDate,
                endDate
        );
    }

    // =========================================================
    // DEPARTMENT + DATE RANGE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Cost> getDepartmentCostsByDateRange(
            Long departmentId,
            LocalDate startDate,
            LocalDate endDate
    ) {

        validateDateRange(
                startDate,
                endDate
        );

        return costRepository
                .findByDepartmentIdAndCostDateBetween(
                        departmentId,
                        startDate,
                        endDate
                );
    }

    // =========================================================
    // INSTITUTION + DATE RANGE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Cost> getInstitutionCostsByDateRange(
            Long institutionId,
            LocalDate startDate,
            LocalDate endDate
    ) {

        validateDateRange(
                startDate,
                endDate
        );

        return costRepository
                .findByInstitutionIdAndCostDateBetween(
                        institutionId,
                        startDate,
                        endDate
                );
    }

    // =========================================================
    // EQUIPMENT + DATE RANGE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Cost> getEquipmentCostsByDateRange(
            Long equipmentId,
            LocalDate startDate,
            LocalDate endDate
    ) {

        validateDateRange(
                startDate,
                endDate
        );

        return costRepository
                .findByEquipmentIdAndCostDateBetween(
                        equipmentId,
                        startDate,
                        endDate
                );
    }

    // =========================================================
    // CALCULATE TOTAL COST
    // =========================================================

    @Override
    public Double calculateTotalCost(
            Double usageHours,
            Double ratePerHour
    ) {

        if (usageHours == null || usageHours < 0) {
            throw new IllegalArgumentException(
                    "Usage hours must be zero or greater"
            );
        }

        if (ratePerHour == null || ratePerHour < 0) {
            throw new IllegalArgumentException(
                    "Rate per hour must be zero or greater"
            );
        }

        return usageHours * ratePerHour;
    }

    // =========================================================
    // 3.8.3
    // CALCULATE COST FROM EQUIPMENT UTILIZATION
    // =========================================================

    @Override
    public Double calculateCost(Long id) {

        Cost cost = costRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Cost record not found with id: " + id
                        )
                );

        if (cost.getEquipment() == null) {
            throw new IllegalArgumentException(
                    "Equipment is required for usage-based cost calculation"
            );
        }

        Long equipmentId =
                cost.getEquipment().getId();

        // -----------------------------------------------------
        // GET EXISTING UTILIZATION RECORDS
        // -----------------------------------------------------

        List<EquipmentUtilization> utilizationRecords =
                utilizationRepository.findByEquipmentId(
                        equipmentId
                );

        // -----------------------------------------------------
        // CALCULATE TOTAL USAGE HOURS
        // -----------------------------------------------------

        double totalUsageHours =
                utilizationRecords.stream()
                        .mapToDouble(record ->
                                record.getUsageHours() != null
                                        ? record.getUsageHours()
                                        : 0.0
                        )
                        .sum();

        // -----------------------------------------------------
        // ROUND USAGE HOURS
        // -----------------------------------------------------

        totalUsageHours =
                Math.round(
                        totalUsageHours * 100.0
                ) / 100.0;

        // -----------------------------------------------------
        // GET RATE
        // -----------------------------------------------------

        Double ratePerHour =
                cost.getRatePerHour();

        if (ratePerHour == null || ratePerHour < 0) {
            throw new IllegalArgumentException(
                    "Rate per hour must be zero or greater"
            );
        }

        // -----------------------------------------------------
        // CALCULATE TOTAL COST
        // -----------------------------------------------------

        Double totalCost =
                calculateTotalCost(
                        totalUsageHours,
                        ratePerHour
                );

        // -----------------------------------------------------
        // SAVE CALCULATED VALUES
        // -----------------------------------------------------

        cost.setUsageHours(
                totalUsageHours
        );

        cost.setTotalCost(
                totalCost
        );

        costRepository.save(cost);

        return totalCost;
    }

    // =========================================================
    // UPDATE BILLING STATUS
    // =========================================================

    @Override
    public Cost updateBillingStatus(
            Long id,
            BillingStatus billingStatus
    ) {

        if (billingStatus == null) {
            throw new IllegalArgumentException(
                    "Billing status cannot be null"
            );
        }

        Cost cost = getCostById(id);

        cost.setBillingStatus(
                billingStatus
        );

        return costRepository.save(cost);
    }



    // =========================================================
// 3.9 DEPARTMENT-WISE COST ALLOCATION
// =========================================================

@Override
@Transactional(readOnly = true)
public List<DepartmentCostAllocationDTO> getDepartmentCostAllocation() {

    List<Object[]> results =
            costRepository.findDepartmentCostAllocation();

    return results.stream()
            .map(row -> {

                Long departmentId =
                        row[0] != null
                                ? ((Number) row[0]).longValue()
                                : null;

                String departmentName =
                        row[1] != null
                                ? row[1].toString()
                                : "Unknown Department";

                Double usageHours =
                        row[2] != null
                                ? ((Number) row[2]).doubleValue()
                                : 0.0;

                Double totalCost =
                        row[3] != null
                                ? ((Number) row[3]).doubleValue()
                                : 0.0;

                return new DepartmentCostAllocationDTO(
                        departmentId,
                        departmentName,
                        usageHours,
                        totalCost
                );
            })
            .toList();
}

    // =========================================================
    // DELETE
    // =========================================================

    @Override
    public void deleteCost(Long id) {

        Cost cost = getCostById(id);

        costRepository.delete(cost);
    }

    // =========================================================
    // INTERNAL COST CALCULATION
    // =========================================================

    private void calculateAndSetTotalCost(
            Cost cost
    ) {

        Double usageHours =
                cost.getUsageHours();

        Double ratePerHour =
                cost.getRatePerHour();

        if (usageHours == null) {
            usageHours = 0.0;
        }

        if (ratePerHour == null) {
            ratePerHour = 0.0;
        }

        if (usageHours < 0) {
            throw new IllegalArgumentException(
                    "Usage hours cannot be negative"
            );
        }

        if (ratePerHour < 0) {
            throw new IllegalArgumentException(
                    "Rate per hour cannot be negative"
            );
        }

        cost.setTotalCost(
                calculateTotalCost(
                        usageHours,
                        ratePerHour
                )
        );
    }

    // =========================================================
    // DATE VALIDATION
    // =========================================================

    private void validateDateRange(
            LocalDate startDate,
            LocalDate endDate
    ) {

        if (startDate == null ||
                endDate == null) {

            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (startDate.isAfter(endDate)) {

            throw new IllegalArgumentException(
                    "Start date cannot be after end date"
            );
        }
    }
}