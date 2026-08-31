package com.labresource.controller;

import com.labresource.dto.DemandAnalysisResponse;
import com.labresource.dto.DemandTrendResponse;
import com.labresource.dto.EquipmentRankingResponse;
import com.labresource.dto.UtilizationReportResponse;
import com.labresource.service.UtilizationAnalyticsService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
})
public class UtilizationAnalyticsController {

    private final UtilizationAnalyticsService service;

    public UtilizationAnalyticsController(
            UtilizationAnalyticsService service) {

        this.service = service;
    }

    // =========================================================
    // 5.16.1 - EQUIPMENT UTILIZATION
    // =========================================================

    @GetMapping("/utilization/equipment/{equipmentId}")
    public ResponseEntity<?> getEquipmentUtilization(

            @PathVariable Long equipmentId,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate endDate) {

        try {

            double utilization =
                    service.calculateEquipmentUtilization(
                            equipmentId,
                            startDate,
                            endDate
                    );

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "equipmentId",
                    equipmentId
            );

            response.put(
                    "startDate",
                    startDate
            );

            response.put(
                    "endDate",
                    endDate
            );

            response.put(
                    "utilizationPercentage",
                    utilization
            );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 5.16.2 - DEMAND ANALYSIS
    // =========================================================

    @GetMapping("/demand")
    public ResponseEntity<?> getDemandAnalysis(

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate endDate) {

        try {

            List<DemandAnalysisResponse> result =
                    service.getDemandAnalysis(
                            startDate,
                            endDate
                    );

            return ResponseEntity.ok(result);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 5.16.4 - DEMAND TRENDS
    // =========================================================

    @GetMapping("/trends")
    public ResponseEntity<?> getDemandTrends(

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate endDate) {

        try {

            List<DemandTrendResponse> result =
                    service.getDemandTrends(
                            startDate,
                            endDate
                    );

            return ResponseEntity.ok(result);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 5.16.5 - EQUIPMENT RANKING
    // =========================================================

    @GetMapping("/ranking")
    public ResponseEntity<?> getEquipmentRanking(

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate endDate) {

        try {

            List<EquipmentRankingResponse> result =
                    service.getEquipmentRanking(
                            startDate,
                            endDate
                    );

            return ResponseEntity.ok(result);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 5.16.6 - UTILIZATION REPORT
    // =========================================================

    @GetMapping("/report")
    public ResponseEntity<?> getUtilizationReport(

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate endDate) {

        try {

            UtilizationReportResponse result =
                    service.getUtilizationReport(
                            startDate,
                            endDate
                    );

            return ResponseEntity.ok(result);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}