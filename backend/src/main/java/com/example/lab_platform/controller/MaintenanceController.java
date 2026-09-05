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
@PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
public class MaintenanceController {
 
    private final MaintenanceService maintenanceService;
 
    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }
 
    // Get all maintenance records (Restricted to technical and administrative roles)
    @GetMapping
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public List<Maintenance> getAllMaintenanceRecords() {
        return maintenanceService.getAllMaintenance();
    }
 
    // Create a new maintenance record / work order (Restricted to the
    // roles that actually assign work — Lab Manager, Department Head,
    // and admins. Lab Technicians receive assignments, they don't open
    // their own work orders.)
    @PostMapping
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<Maintenance> createMaintenance(
            @RequestBody Maintenance maintenance) {
 
        Maintenance savedMaintenance =
                maintenanceService.createMaintenance(maintenance);
 
        return ResponseEntity.ok(savedMaintenance);
    }
 
    // Get maintenance record by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<Maintenance> getMaintenanceById(
            @PathVariable Integer id) {
 
        return ResponseEntity.ok(
                maintenanceService.getMaintenanceById(id)
        );
    }
 
    // Work orders assigned to the currently logged-in technician
    // (the Lab Technician dashboard's "My Tasks" view).
    @GetMapping("/my-tasks")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<List<Maintenance>> getMyTasks() {
        return ResponseEntity.ok(maintenanceService.getMyTasks());
    }

    // Update / complete a maintenance record (technicians can update — but
    // only their own assigned task, and can't reassign it — enforced in
    // MaintenanceServiceImpl; managers/dept heads/admins can update any
    // record, including reassigning the technician)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<Maintenance> updateMaintenance(
            @PathVariable Integer id,
            @RequestBody Maintenance maintenance) {
 
        Maintenance updated =
                maintenanceService.updateMaintenance(id, maintenance);
 
        return ResponseEntity.ok(updated);
    }
}