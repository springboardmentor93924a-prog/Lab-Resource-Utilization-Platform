package com.example.lab_platform.controller;

import com.example.lab_platform.entity.Maintenance;
import com.example.lab_platform.service.MaintenanceService;

import org.springframework.http.ResponseEntity;
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



    // Get all maintenance records
    @GetMapping
    public List<Maintenance> getAllMaintenanceRecords() {

        return maintenanceService.getAllMaintenance();
    }



    // Create a new maintenance record
    @PostMapping
    public ResponseEntity<Maintenance> createMaintenance(
            @RequestBody Maintenance maintenance) {

        Maintenance savedMaintenance =
                maintenanceService.createMaintenance(maintenance);

        return ResponseEntity.ok(savedMaintenance);
    }



    // Get maintenance record by ID
    @GetMapping("/{id}")
    public ResponseEntity<Maintenance> getMaintenanceById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                maintenanceService.getMaintenanceById(id)
        );
    }
}