
package com.labresource.controller;

import com.labresource.entity.EquipmentUtilization;
import com.labresource.service.EquipmentUtilizationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/utilization")
@CrossOrigin(origins = "http://localhost:5173")
public class EquipmentUtilizationController {

    private final EquipmentUtilizationService utilizationService;

    public EquipmentUtilizationController(
            EquipmentUtilizationService utilizationService
    ) {
        this.utilizationService = utilizationService;
    }

    // =========================================================
    // GET ALL UTILIZATION RECORDS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<EquipmentUtilization>> getAllUtilization() {

        return ResponseEntity.ok(
                utilizationService.getAllUtilization()
        );
    }

    // =========================================================
    // GET UTILIZATION BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getUtilization(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    utilizationService.getUtilization(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // =========================================================
    // GET UTILIZATION BY EQUIPMENT
    // =========================================================

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<EquipmentUtilization>>
    getEquipmentUtilization(
            @PathVariable Long equipmentId
    ) {

        return ResponseEntity.ok(
                utilizationService.getEquipmentUtilization(equipmentId)
        );
    }

    // =========================================================
    // START EQUIPMENT USAGE
    // =========================================================

    @PostMapping("/start")
    public ResponseEntity<?> startUsage(
            @RequestParam Long equipmentId
    ) {

        try {

            EquipmentUtilization utilization =
                    utilizationService.startUsage(equipmentId);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(utilization);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // STOP EQUIPMENT USAGE
    // =========================================================

    @PutMapping("/{id}/stop")
    public ResponseEntity<?> stopUsage(
            @PathVariable Long id
    ) {

        try {

            EquipmentUtilization utilization =
                    utilizationService.stopUsage(id);

            return ResponseEntity.ok(utilization);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // GET CURRENT EQUIPMENT STATUS
    // =========================================================

    @GetMapping("/status/{equipmentId}")
    public ResponseEntity<?> getEquipmentStatus(
            @PathVariable Long equipmentId
    ) {

        try {

            return ResponseEntity.ok(
                    utilizationService
                            .getEquipmentUtilizationStatus(equipmentId)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // GET ACTIVE UTILIZATION FOR EQUIPMENT
    // =========================================================

    @GetMapping("/active/{equipmentId}")
    public ResponseEntity<?> getActiveUtilization(
            @PathVariable Long equipmentId
    ) {

        try {

            EquipmentUtilization utilization =
                    utilizationService
                            .getActiveUtilization(equipmentId);

            if (utilization == null) {
                return ResponseEntity
                        .noContent()
                        .build();
            }

            return ResponseEntity.ok(utilization);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // GET ALL CURRENTLY ACTIVE EQUIPMENT
    // =========================================================

    @GetMapping("/active")
    public ResponseEntity<List<EquipmentUtilization>>
    getCurrentlyActiveUtilization() {

        return ResponseEntity.ok(
                utilizationService
                        .getCurrentlyActiveUtilization()
        );
    }

    // =========================================================
    // GET UTILIZATION BY DATE
    // =========================================================

    @GetMapping("/date/{date}")
    public ResponseEntity<List<EquipmentUtilization>>
    getUtilizationByDate(
            @PathVariable LocalDate date
    ) {

        return ResponseEntity.ok(
                utilizationService
                        .getUtilizationByDate(date)
        );
    }

    // =========================================================
    // GET UTILIZATION BETWEEN DATES
    // =========================================================

    @GetMapping("/date-range")
    public ResponseEntity<List<EquipmentUtilization>>
    getUtilizationBetweenDates(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {

        return ResponseEntity.ok(
                utilizationService
                        .getUtilizationBetweenDates(
                                startDate,
                                endDate
                        )
        );
    }

    // =========================================================
    // GET EQUIPMENT UTILIZATION BETWEEN DATES
    // =========================================================

    @GetMapping("/equipment/{equipmentId}/date-range")
    public ResponseEntity<List<EquipmentUtilization>>
    getEquipmentUtilizationBetweenDates(
            @PathVariable Long equipmentId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {

        return ResponseEntity.ok(
                utilizationService
                        .getEquipmentUtilizationBetweenDates(
                                equipmentId,
                                startDate,
                                endDate
                        )
        );
    }

    // =========================================================
    // GET CURRENT USAGE HOURS
    // =========================================================

    @GetMapping("/{id}/hours")
    public ResponseEntity<?> getCurrentUsageHours(
            @PathVariable Long id
    ) {

        try {

            double hours =
                    utilizationService
                            .getCurrentUsageHours(id);

            return ResponseEntity.ok(hours);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // DELETE UTILIZATION RECORD
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUtilization(
            @PathVariable Long id
    ) {

        try {

            utilizationService.deleteUtilization(id);

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // 5.13.1 / 5.13.2
    // UTILIZATION ANALYTICS - ALL EQUIPMENT
    // =========================================================

    @GetMapping("/analytics")
    public ResponseEntity<?> getUtilizationAnalytics() {

        try {

            return ResponseEntity.ok(
                    utilizationService
                            .getUtilizationAnalytics()
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // UTILIZATION ANALYTICS - ONE EQUIPMENT
    // =========================================================

    @GetMapping("/analytics/{equipmentId}")
    public ResponseEntity<?> getEquipmentUtilizationAnalytics(
            @PathVariable Long equipmentId
    ) {

        try {

            return ResponseEntity.ok(
                    utilizationService
                            .getEquipmentUtilizationAnalytics(
                                    equipmentId
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // 5.13.4
    // IDLE EQUIPMENT
    // =========================================================

    @GetMapping("/idle")
    public ResponseEntity<?> getIdleEquipment() {

        try {

            return ResponseEntity.ok(
                    utilizationService.getIdleEquipment()
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // 5.13.3
    // HEATMAP DATA
    //
    // Optional dates.
    //
    // Without dates:
    // GET /api/utilization/heatmap
    //
    // With dates:
    // GET /api/utilization/heatmap?startDate=2026-08-01&endDate=2026-08-16
    // =========================================================

    @GetMapping("/heatmap")
    public ResponseEntity<?> getHeatmapData(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate
    ) {

        try {

            // Default date range
            if (startDate == null) {
                startDate = LocalDate.now()
                        .minusDays(6);
            }

            if (endDate == null) {
                endDate = LocalDate.now();
            }

            if (startDate.isAfter(endDate)) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "startDate cannot be after endDate"
                        );
            }

            return ResponseEntity.ok(
                    utilizationService.getHeatmapData(
                            startDate,
                            endDate
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}
