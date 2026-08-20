package com.labplatform.equipment.controller;
import com.labplatform.equipment.dto.EquipmentUtilizationResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import com.labplatform.equipment.dto.EquipmentRequest;
import com.labplatform.equipment.dto.EquipmentResponse;
import com.labplatform.equipment.service.EquipmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.labplatform.equipment.dto.CalibrationAlertResponse;
import com.labplatform.equipment.dto.UtilizationCostReportRow;
import org.springframework.web.bind.annotation.RequestParam;
import java.time.LocalDate;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    private final EquipmentService equipmentService;

    public EquipmentController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    @GetMapping
    public ResponseEntity<List<EquipmentResponse>> getAllEquipment() {
        return ResponseEntity.ok(equipmentService.getAllEquipment());
    }
    @GetMapping("/utilization")
    public ResponseEntity<List<EquipmentUtilizationResponse>> getUtilizationData() {
        return ResponseEntity.ok(equipmentService.getUtilizationData());
    }
    @GetMapping("/calibration-alerts")
    public ResponseEntity<List<CalibrationAlertResponse>> getCalibrationAlerts() {
        return ResponseEntity.ok(equipmentService.getCalibrationAlerts());
    }
    @GetMapping("/reports/utilization-cost")
    public ResponseEntity<List<UtilizationCostReportRow>> getUtilizationCostReport(
            @RequestParam("from") LocalDate from,
            @RequestParam("to") LocalDate to) {
        return ResponseEntity.ok(equipmentService.generateUtilizationCostReport(from, to));
    }

    @GetMapping("/reports/utilization-cost/csv")
    public ResponseEntity<byte[]> downloadUtilizationCostReportCsv(
            @RequestParam("from") LocalDate from,
            @RequestParam("to") LocalDate to) {
        List<UtilizationCostReportRow> rows = equipmentService.generateUtilizationCostReport(from, to);

        StringBuilder csv = new StringBuilder();
        csv.append("Equipment,Category,Total Bookings,Usage Hours,Utilization Rate (%),Total Cost\n");
        for (UtilizationCostReportRow row : rows) {
            csv.append(String.format("%s,%s,%d,%d,%.1f,%s\n",
                    row.getEquipmentName(), row.getCategory(), row.getTotalBookings(),
                    row.getUsageHours(), row.getUtilizationRate(), row.getTotalCost()));
        }

        byte[] csvBytes = csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"utilization_cost_report.csv\"")
                .contentType(org.springframework.http.MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
    @GetMapping("/{id}")
    public ResponseEntity<EquipmentResponse> getEquipmentById(@PathVariable Long id) {
        return ResponseEntity.ok(equipmentService.getEquipmentById(id));
    }


    @PostMapping
    public ResponseEntity<EquipmentResponse> addEquipment(@Valid @RequestBody EquipmentRequest request) {
        EquipmentResponse response = equipmentService.addEquipment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'LAB_MANAGER')")
    public ResponseEntity<EquipmentResponse> updateEquipment(
            @PathVariable Long id,
            @Valid @RequestBody EquipmentRequest request) {

        return ResponseEntity.ok(
                equipmentService.updateEquipment(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipment(@PathVariable Long id) {
        equipmentService.deleteEquipment(id);
        return ResponseEntity.noContent().build();
    }
}