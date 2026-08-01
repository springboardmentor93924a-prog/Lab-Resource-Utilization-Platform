package com.example.lab_platform.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public String getMaintenanceLogs() {
        return "List of maintenance logs";
    }

    @PostMapping
    @PreAuthorize("hasRole('STAFF')")
    public String reportMaintenance() {
        return "Maintenance report filed (Staff only)";
    }
}