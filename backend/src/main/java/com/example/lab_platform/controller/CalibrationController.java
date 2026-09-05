package com.example.lab_platform.controller;

import com.example.lab_platform.entity.EquipmentCalibration;
import com.example.lab_platform.service.CalibrationService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calibrations")
@CrossOrigin(origins = "http://localhost:5173")
public class CalibrationController {

    private final CalibrationService calibrationService;

    public CalibrationController(CalibrationService calibrationService) {
        this.calibrationService = calibrationService;
    }

    // Full list — technical/admin oversight only
    @GetMapping
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'SYSTEM_ADMIN')")
    public List<EquipmentCalibration> getAllCalibrations() {
        return calibrationService.getAllCalibrations();
    }

    // Per-equipment history — read-only, everyone including students,
    // since it affects whether they can trust/book that equipment
    @GetMapping("/equipment/{equipmentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LAB_TECHNICIAN', 'SYSTEM_ADMIN')")
    public ResponseEntity<List<EquipmentCalibration>> getByEquipment(@PathVariable Integer equipmentId) {
        return ResponseEntity.ok(calibrationService.getCalibrationsByEquipment(equipmentId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'SYSTEM_ADMIN')")
    public ResponseEntity<EquipmentCalibration> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(calibrationService.getCalibrationById(id));
    }

    // Log a completed calibration — technician performs the work
    @PostMapping
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'SYSTEM_ADMIN')")
    public ResponseEntity<EquipmentCalibration> create(@RequestBody EquipmentCalibration calibration) {
        return ResponseEntity.ok(calibrationService.createCalibration(calibration));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'SYSTEM_ADMIN')")
    public ResponseEntity<EquipmentCalibration> update(
            @PathVariable Integer id, @RequestBody EquipmentCalibration calibration) {
        return ResponseEntity.ok(calibrationService.updateCalibration(id, calibration));
    }

    // Reminder feeds — will be consumed by Task 6 notifications later
    @GetMapping("/due-soon")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'SYSTEM_ADMIN')")
    public ResponseEntity<List<EquipmentCalibration>> getDueSoon(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(calibrationService.getDueSoon(days));
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'SYSTEM_ADMIN')")
    public ResponseEntity<List<EquipmentCalibration>> getOverdue() {
        return ResponseEntity.ok(calibrationService.getOverdue());
    }
}