package com.example.lab_platform.controller;

import com.example.lab_platform.dto.MaintenanceDTO;
import com.example.lab_platform.entity.Maintenance;
import com.example.lab_platform.service.MaintenanceService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @GetMapping
    public List<MaintenanceDTO> getAllMaintenance() {
        return maintenanceService.getAllMaintenance()
                .stream()
                .map(MaintenanceDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceDTO> getMaintenanceById(@PathVariable Integer id) {
        return ResponseEntity.ok(MaintenanceDTO.fromEntity(maintenanceService.getMaintenanceById(id)));
    }

    // Full scheduled-maintenance history for a piece of equipment,
    // newest first.
    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<MaintenanceDTO>> getMaintenanceForEquipment(
            @PathVariable Integer equipmentId) {
        List<MaintenanceDTO> history = maintenanceService.getMaintenanceForEquipment(equipmentId)
                .stream()
                .map(MaintenanceDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(history);
    }

    // Preventive maintenance items due today or earlier and not yet
    // completed - for a "due / overdue maintenance" dashboard widget.
    @GetMapping("/upcoming")
    public List<MaintenanceDTO> getUpcomingMaintenance() {
        return maintenanceService.getUpcomingMaintenance()
                .stream()
                .map(MaintenanceDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // Schedule a new (preventive) maintenance record for a piece of
    // equipment.
    @PostMapping
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<MaintenanceDTO> scheduleMaintenance(@RequestBody Maintenance maintenance) {
        Maintenance saved = maintenanceService.scheduleMaintenance(maintenance);
        return ResponseEntity.ok(MaintenanceDTO.fromEntity(saved));
    }

    // Update status / notes / next-due date / assigned technician on an
    // existing maintenance record.
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<MaintenanceDTO> updateMaintenance(
            @PathVariable Integer id,
            @RequestBody Maintenance updatedMaintenance) {
        Maintenance saved = maintenanceService.updateMaintenance(id, updatedMaintenance);
        return ResponseEntity.ok(MaintenanceDTO.fromEntity(saved));
    }
}
