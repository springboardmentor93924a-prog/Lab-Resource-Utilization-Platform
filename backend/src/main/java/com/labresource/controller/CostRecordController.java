package com.labresource.controller;

import com.labresource.dto.CostRecordRequestDto;
import com.labresource.dto.CostRecordResponseDto;
import com.labresource.service.CostRecordService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/cost-records")
public class CostRecordController {

    private final CostRecordService costRecordService;

    public CostRecordController(CostRecordService costRecordService) {
        this.costRecordService = costRecordService;
    }

    @PostMapping
    public CostRecordResponseDto createCostRecord(
            @Valid @RequestBody CostRecordRequestDto requestDto) {

        return costRecordService.createCostRecord(requestDto);
    }

    @PutMapping("/{costRecordId}")
    public CostRecordResponseDto updateCostRecord(
            @PathVariable String costRecordId,
            @Valid @RequestBody CostRecordRequestDto requestDto) {

        return costRecordService.updateCostRecord(costRecordId, requestDto);
    }

    @GetMapping
    public List<CostRecordResponseDto> getAllCostRecords() {
        return costRecordService.getAllCostRecords();
    }

    @GetMapping("/{costRecordId}")
    public CostRecordResponseDto getCostRecordById(
            @PathVariable String costRecordId) {

        return costRecordService.getCostRecordById(costRecordId);
    }

    @GetMapping("/equipment/{equipmentId}")
    public List<CostRecordResponseDto> getCostRecordsByEquipment(
            @PathVariable String equipmentId) {

        return costRecordService.getCostRecordsByEquipment(equipmentId);
    }

    @GetMapping("/institution/{institutionId}")
    public List<CostRecordResponseDto> getCostRecordsByInstitution(
            @PathVariable String institutionId) {

        return costRecordService.getCostRecordsByInstitution(institutionId);
    }

    @GetMapping("/maintenance/{maintenanceRecordId}")
    public List<CostRecordResponseDto> getCostRecordsByMaintenance(
            @PathVariable String maintenanceRecordId) {

        return costRecordService.getCostRecordsByMaintenance(maintenanceRecordId);
    }

    @GetMapping("/calibration/{calibrationRecordId}")
    public List<CostRecordResponseDto> getCostRecordsByCalibration(
            @PathVariable String calibrationRecordId) {

        return costRecordService.getCostRecordsByCalibration(calibrationRecordId);
    }

    @GetMapping("/cost-type/{costType}")
    public List<CostRecordResponseDto> getCostRecordsByCostType(
            @PathVariable String costType) {

        return costRecordService.getCostRecordsByCostType(costType);
    }

    @GetMapping("/payment-status/{paymentStatus}")
    public List<CostRecordResponseDto> getCostRecordsByPaymentStatus(
            @PathVariable String paymentStatus) {

        return costRecordService.getCostRecordsByPaymentStatus(paymentStatus);
    }

    @GetMapping("/date-range")
    public List<CostRecordResponseDto> getCostRecordsByDateRange(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate) {

        return costRecordService.getCostRecordsByDateRange(startDate, endDate);
    }

    @GetMapping("/institution/{institutionId}/date-range")
    public List<CostRecordResponseDto> getInstitutionCostRecordsByDateRange(

            @PathVariable String institutionId,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate) {

        return costRecordService.getInstitutionCostRecordsByDateRange(
                institutionId,
                startDate,
                endDate
        );
    }

    @DeleteMapping("/{costRecordId}")
    public String deleteCostRecord(
            @PathVariable String costRecordId) {

        costRecordService.deleteCostRecord(costRecordId);

        return "Cost record deleted successfully.";
    }
}