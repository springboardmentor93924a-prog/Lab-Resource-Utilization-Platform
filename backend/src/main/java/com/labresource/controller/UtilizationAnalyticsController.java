//package com.labresource.controller;
//
//import com.labresource.dto.HeatmapDataResponseDto;
//import com.labresource.dto.UtilizationAnalyticsResponseDto;
//import com.labresource.service.UtilizationAnalyticsService;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/utilization-analytics")
//public class UtilizationAnalyticsController {
//
//    private final UtilizationAnalyticsService utilizationAnalyticsService;
//
//    public UtilizationAnalyticsController(
//            UtilizationAnalyticsService utilizationAnalyticsService
//    ) {
//        this.utilizationAnalyticsService =
//                utilizationAnalyticsService;
//    }
//
//    /*
//     * Get utilization rate of one equipment.
//     */
//    @GetMapping("/utilization-rate/{equipmentId}")
//    public ResponseEntity<UtilizationAnalyticsResponseDto>
//    getUtilizationRate(
//            @PathVariable String equipmentId
//    ) {
//
//        return ResponseEntity.ok(
//                utilizationAnalyticsService
//                        .getUtilizationRate(equipmentId)
//        );
//    }
//
//    /*
//     * Get idle-time details of one equipment.
//     */
//    @GetMapping("/idle-time/{equipmentId}")
//    public ResponseEntity<UtilizationAnalyticsResponseDto>
//    getIdleTime(
//            @PathVariable String equipmentId
//    ) {
//
//        return ResponseEntity.ok(
//                utilizationAnalyticsService
//                        .getIdleTime(equipmentId)
//        );
//    }
//
//    /*
//     * Get all equipment ordered by highest idle time.
//     */
//    @GetMapping("/idle-equipment")
//    public ResponseEntity<List<UtilizationAnalyticsResponseDto>>
//    getIdleEquipments() {
//
//        return ResponseEntity.ok(
//                utilizationAnalyticsService
//                        .getIdleEquipments()
//        );
//    }
//
//    /*
//     * Get equipment ordered by highest utilization.
//     */
//    @GetMapping("/most-used-equipment")
//    public ResponseEntity<List<UtilizationAnalyticsResponseDto>>
//    getMostUsedEquipments() {
//
//        return ResponseEntity.ok(
//                utilizationAnalyticsService
//                        .getMostUsedEquipments()
//        );
//    }
//
//    /*
//     * Get demand analysis based on bookings,
//     * resource-sharing requests and actual utilization.
//     */
//    @GetMapping("/demand-analysis")
//    public ResponseEntity<List<UtilizationAnalyticsResponseDto>>
//    getDemandAnalysis() {
//
//        return ResponseEntity.ok(
//                utilizationAnalyticsService
//                        .getDemandAnalysis()
//        );
//    }
//
//    /*
//     * Get day/hour heatmap data of one equipment.
//     */
//    @GetMapping("/heatmap/{equipmentId}")
//    public ResponseEntity<List<HeatmapDataResponseDto>>
//    getHeatmapData(
//            @PathVariable String equipmentId
//    ) {
//
//        return ResponseEntity.ok(
//                utilizationAnalyticsService
//                        .getHeatmapData(equipmentId)
//        );
//    }
//}