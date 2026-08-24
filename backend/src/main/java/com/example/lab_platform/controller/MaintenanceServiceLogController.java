package com.example.lab_platform.controller;

import com.example.lab_platform.dto.MaintenanceServiceLogDTO;
import com.example.lab_platform.entity.MaintenanceServiceLog;
import com.example.lab_platform.service.MaintenanceServiceLogService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/service-logs")
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
public class MaintenanceServiceLogController {

    private final MaintenanceServiceLogService serviceLogService;

    public MaintenanceServiceLogController(MaintenanceServiceLogService serviceLogService) {
        this.serviceLogService = serviceLogService;
    }

    // Service log entries recorded against a single work order.
    @GetMapping("/work-order/{workOrderId}")
    public ResponseEntity<List<MaintenanceServiceLogDTO>> getLogsForWorkOrder(
            @PathVariable Integer workOrderId) {
        List<MaintenanceServiceLogDTO> logs = serviceLogService.getLogsForWorkOrder(workOrderId)
                .stream()
                .map(MaintenanceServiceLogDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    // Full maintenance/service history for a piece of equipment, across
    // every work order it has ever had — newest first.
    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<MaintenanceServiceLogDTO>> getHistoryForEquipment(
            @PathVariable Integer equipmentId) {
        List<MaintenanceServiceLogDTO> history = serviceLogService.getHistoryForEquipment(equipmentId)
                .stream()
                .map(MaintenanceServiceLogDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(history);
    }

    // Technician logs work done (parts replaced, cost, remarks) against
    // a work order. Technician + date default to the logged-in user / today.
    @PostMapping("/work-order/{workOrderId}")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<MaintenanceServiceLogDTO> addLog(
            @PathVariable Integer workOrderId,
            @RequestBody MaintenanceServiceLog log) {

        MaintenanceServiceLog saved = serviceLogService.addLog(workOrderId, log);
        return ResponseEntity.ok(MaintenanceServiceLogDTO.fromEntity(saved));
    }
}
