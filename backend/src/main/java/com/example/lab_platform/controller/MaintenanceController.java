package com.example.lab_platform.controller;

import com.example.lab_platform.entity.Maintenance;
import com.example.lab_platform.repository.MaintenanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "http://localhost:5173")
public class MaintenanceController {

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    // Get all maintenance records
    @GetMapping
    public List<Maintenance> getAllMaintenanceRecords() {
        return maintenanceRepository.findAll();
    }

    // Create a new maintenance record
    @PostMapping
    public ResponseEntity<Maintenance> createMaintenance(@RequestBody Maintenance maintenance) {
        Maintenance savedMaintenance = maintenanceRepository.save(maintenance);
        return ResponseEntity.ok(savedMaintenance);
    }

    // Get maintenance record by ID
    @GetMapping("/{id}")
    public ResponseEntity<Maintenance> getMaintenanceById(@PathVariable Long id) {
        return maintenanceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}