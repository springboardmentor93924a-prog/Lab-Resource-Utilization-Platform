package com.example.lab_platform.controller;

import com.example.lab_platform.dto.CostRecordDTO;
import com.example.lab_platform.dto.CostStatusUpdateRequest;
import com.example.lab_platform.dto.CostSummaryDTO;
import com.example.lab_platform.dto.RateUpdateRequest;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.service.CostManagementService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/costs")
public class CostManagementController {

    // Per PDF Section 11, "Cost Analysis" only appears in the
    // Institution Administrator nav list — Lab Manager and Department
    // Head lose it here (System Admin left untouched).
    private static final String MANAGER_ROLES = """
        hasAnyRole(
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """;

    private final CostManagementService costManagementService;

    public CostManagementController(CostManagementService costManagementService) {
        this.costManagementService = costManagementService;
    }

    // List every usage-cost record visible to the caller's institution.
    // (Also lazily generates any missing records for freshly completed
    // bookings, so the list is always in sync without a manual step.)
    @GetMapping
    @PreAuthorize(MANAGER_ROLES)
    public List<CostRecordDTO> getAllCosts() {
        return costManagementService.getAllUsageCosts();
    }

    // Aggregated cost dashboard: totals, cost by equipment, cost by
    // department, and monthly trend - everything Task 4's analytics
    // dashboard also reuses.
    @GetMapping("/summary")
    @PreAuthorize(MANAGER_ROLES)
    public CostSummaryDTO getCostSummary() {
        return costManagementService.getCostSummary();
    }

    // Manual re-sync trigger: scans completed bookings and creates any
    // missing cost/allocation records. Idempotent.
    @PostMapping("/generate")
    @PreAuthorize(MANAGER_ROLES)
    public Map<String, Object> generateCosts() {
        int created = costManagementService.generateMissingCostRecords();
        return Map.of(
                "generated", created,
                "message", created > 0
                        ? created + " new cost record(s) generated."
                        : "No new cost records to generate - already up to date."
        );
    }

    // Mark a usage-cost record (and its linked department allocation)
    // as PENDING / PAID / WAIVED.
    @PutMapping("/{usageCostId}/status")
    @PreAuthorize(MANAGER_ROLES)
    public CostRecordDTO updateStatus(
            @PathVariable Integer usageCostId,
            @RequestBody CostStatusUpdateRequest request) {

        return costManagementService.updateCostStatus(
                usageCostId, request.getCostStatus());
    }

    // Set/update the hourly billing rate for a piece of equipment -
    // this feeds directly into future cost calculations.
    @PutMapping("/equipment/{equipmentId}/rate")
    @PreAuthorize(MANAGER_ROLES)
    public Equipment updateEquipmentRate(
            @PathVariable Integer equipmentId,
            @RequestBody RateUpdateRequest request) {

        return costManagementService.updateEquipmentRate(
                equipmentId, request.getRatePerHour());
    }
}