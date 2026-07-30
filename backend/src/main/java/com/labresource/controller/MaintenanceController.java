package com.labresource.controller;

import com.labresource.dto.maintenance.MaintenanceRequest;
import com.labresource.dto.maintenance.MaintenanceResponse;
import com.labresource.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping
    public ResponseEntity<MaintenanceResponse> createMaintenanceRecord(
            @Valid @RequestBody MaintenanceRequest request
    ) {

        MaintenanceResponse response =
                maintenanceService.createMaintenanceRecord(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceResponse>>
    getAllMaintenanceRecords() {

        return ResponseEntity.ok(
                maintenanceService.getAllMaintenanceRecords()
        );
    }

    @GetMapping("/{maintenanceId}")
    public ResponseEntity<MaintenanceResponse>
    getMaintenanceRecordById(
            @PathVariable String maintenanceId
    ) {

        return ResponseEntity.ok(
                maintenanceService.getMaintenanceRecordById(
                        maintenanceId
                )
        );
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<MaintenanceResponse>>
    getMaintenanceByEquipment(
            @PathVariable String equipmentId
    ) {

        return ResponseEntity.ok(
                maintenanceService.getMaintenanceByEquipment(
                        equipmentId
                )
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<MaintenanceResponse>>
    getMaintenanceByStatus(
            @PathVariable String status
    ) {

        return ResponseEntity.ok(
                maintenanceService.getMaintenanceByStatus(status)
        );
    }

    @GetMapping("/type/{maintenanceType}")
    public ResponseEntity<List<MaintenanceResponse>>
    getMaintenanceByType(
            @PathVariable String maintenanceType
    ) {

        return ResponseEntity.ok(
                maintenanceService.getMaintenanceByType(
                        maintenanceType
                )
        );
    }

    @GetMapping("/scheduled")
    public ResponseEntity<List<MaintenanceResponse>>
    getScheduledMaintenanceBetween(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate
    ) {

        return ResponseEntity.ok(
                maintenanceService.getScheduledMaintenanceBetween(
                        startDate,
                        endDate
                )
        );
    }

    @GetMapping("/completed")
    public ResponseEntity<List<MaintenanceResponse>>
    getCompletedMaintenanceBetween(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate
    ) {

        return ResponseEntity.ok(
                maintenanceService.getCompletedMaintenanceBetween(
                        startDate,
                        endDate
                )
        );
    }

    @GetMapping("/technician")
    public ResponseEntity<List<MaintenanceResponse>>
    searchByTechnician(
            @RequestParam String name
    ) {

        return ResponseEntity.ok(
                maintenanceService.searchByTechnician(name)
        );
    }

    @PutMapping("/{maintenanceId}")
    public ResponseEntity<MaintenanceResponse>
    updateMaintenanceRecord(
            @PathVariable String maintenanceId,
            @Valid @RequestBody MaintenanceRequest request
    ) {

        return ResponseEntity.ok(
                maintenanceService.updateMaintenanceRecord(
                        maintenanceId,
                        request
                )
        );
    }

    @DeleteMapping("/{maintenanceId}")
    public ResponseEntity<Void> deleteMaintenanceRecord(
            @PathVariable String maintenanceId
    ) {

        maintenanceService.deleteMaintenanceRecord(
                maintenanceId
        );

        return ResponseEntity.noContent().build();
    }
}