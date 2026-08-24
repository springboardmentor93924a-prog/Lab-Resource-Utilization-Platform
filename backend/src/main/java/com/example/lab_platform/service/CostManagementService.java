package com.example.lab_platform.service;

import com.example.lab_platform.dto.CostRecordDTO;
import com.example.lab_platform.dto.CostSummaryDTO;
import com.example.lab_platform.entity.Equipment;

import java.util.List;

public interface CostManagementService {

    /*
     * Scans completed bookings and creates a usage-cost record (plus a
     * department cost allocation) for any that don't already have one.
     * Idempotent - safe to call repeatedly. Returns how many new
     * records were generated.
     */
    int generateMissingCostRecords();

    List<CostRecordDTO> getAllUsageCosts();

    CostSummaryDTO getCostSummary();

    CostRecordDTO updateCostStatus(Integer usageCostId, String newStatus);

    Equipment updateEquipmentRate(Integer equipmentId, Double ratePerHour);
}
