package com.labplatform.controller;

import com.labplatform.dto.ApiResponse;
import com.labplatform.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/equipment/{equipmentId}/utilization")
    public ResponseEntity<ApiResponse<AnalyticsService.UtilizationSummary>> utilization(
            @PathVariable Long equipmentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.utilizationFor(equipmentId, from, to)));
    }

    @GetMapping("/institution/{institutionId}/heatmap")
    @PreAuthorize("hasAnyRole('LAB_MANAGER','DEPARTMENT_HEAD','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<List<AnalyticsService.UtilizationSummary>>> heatmap(
            @PathVariable Long institutionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.heatmapForInstitution(institutionId, from, to)));
    }

    @GetMapping("/institution/{institutionId}/idle")
    @PreAuthorize("hasAnyRole('LAB_MANAGER','DEPARTMENT_HEAD','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<List<AnalyticsService.UtilizationSummary>>> idle(
            @PathVariable Long institutionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "30") double threshold) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.idleEquipment(institutionId, from, to, threshold)));
    }

    @GetMapping("/institution/{institutionId}/dashboard")
    @PreAuthorize("hasAnyRole('LAB_MANAGER','DEPARTMENT_HEAD','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<AnalyticsService.DashboardSummary>> dashboard(
            @PathVariable Long institutionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.institutionDashboard(institutionId, from, to)));
    }
}
