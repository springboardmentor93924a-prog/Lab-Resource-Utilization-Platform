package com.labresource.service;

import com.labresource.dto.CostRecordRequestDto;
import com.labresource.dto.CostRecordResponseDto;

import java.time.LocalDate;
import java.util.List;

public interface CostRecordService {

    CostRecordResponseDto createCostRecord(
            CostRecordRequestDto requestDto
    );

    CostRecordResponseDto updateCostRecord(
            String costRecordId,
            CostRecordRequestDto requestDto
    );

    CostRecordResponseDto getCostRecordById(
            String costRecordId
    );

    List<CostRecordResponseDto> getAllCostRecords();

    List<CostRecordResponseDto> getCostRecordsByEquipment(
            String equipmentId
    );

    List<CostRecordResponseDto> getCostRecordsByInstitution(
            String institutionId
    );

    List<CostRecordResponseDto> getCostRecordsByMaintenance(
            String maintenanceId
    );

    List<CostRecordResponseDto> getCostRecordsByCalibration(
            String calibrationId
    );

    List<CostRecordResponseDto> getCostRecordsByCostType(
            String costType
    );

    List<CostRecordResponseDto> getCostRecordsByPaymentStatus(
            String paymentStatus
    );

    List<CostRecordResponseDto> getCostRecordsByDateRange(
            LocalDate startDate,
            LocalDate endDate
    );

    List<CostRecordResponseDto> getInstitutionCostRecordsByDateRange(
            String institutionId,
            LocalDate startDate,
            LocalDate endDate
    );

    void deleteCostRecord(
            String costRecordId
    );
}