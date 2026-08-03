package com.labplatform.controller;

import com.labplatform.dto.ApiResponse;
import com.labplatform.entity.MaintenanceRecord;
import com.labplatform.entity.MaintenanceStatus;
import com.labplatform.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('LAB_TECHNICIAN','LAB_MANAGER','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping
    public ResponseEntity<ApiResponse<MaintenanceRecord>> schedule(
            @RequestParam Long equipmentId, @RequestParam(required = false) Long technicianId,
            @RequestParam String type,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate scheduledDate,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(ApiResponse.ok("Maintenance scheduled",
                maintenanceService.schedule(equipmentId, technicianId, type, scheduledDate, notes)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MaintenanceRecord>>> all(@RequestParam(required = false) MaintenanceStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(status != null ? maintenanceService.byStatus(status) : maintenanceService.all()));
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<ApiResponse<List<MaintenanceRecord>>> forEquipment(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(ApiResponse.ok(maintenanceService.forEquipment(equipmentId)));
    }

    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<ApiResponse<List<MaintenanceRecord>>> forTechnician(@PathVariable Long technicianId) {
        return ResponseEntity.ok(ApiResponse.ok(maintenanceService.forTechnician(technicianId)));
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<ApiResponse<MaintenanceRecord>> start(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Maintenance started", maintenanceService.startWork(id)));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<MaintenanceRecord>> complete(@PathVariable Long id,
            @RequestParam(required = false) Integer downtimeHours, @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(ApiResponse.ok("Maintenance completed", maintenanceService.complete(id, downtimeHours, notes)));
    }
}
