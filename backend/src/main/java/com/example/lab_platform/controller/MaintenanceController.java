package com.example.lab_platform.controller;

import com.example.lab_platform.entity.Maintenance;
import com.example.lab_platform.service.MaintenanceService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "http://localhost:5173")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    // Get all maintenance records (Restricted to technical and administrative roles)
    @GetMapping
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public List<Maintenance> getAllMaintenanceRecords() {
        return maintenanceService.getAllMaintenance();
    }

    // Create a new maintenance record (Restricted to technicians and managers)
    @PostMapping
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<Maintenance> createMaintenance(
            @RequestBody Maintenance maintenance) {

        Maintenance savedMaintenance =
                maintenanceService.createMaintenance(maintenance);

        return ResponseEntity.ok(savedMaintenance);
    }

    // Get maintenance record by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<Maintenance> getMaintenanceById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                maintenanceService.getMaintenanceById(id)
        );
    }
}