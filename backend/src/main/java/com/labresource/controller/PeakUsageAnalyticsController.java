package com.labresource.controller;

import com.labresource.dto.PeakUsageAnalyticsResponseDto;
import com.labresource.service.PeakUsageAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics/peak-usage")
public class PeakUsageAnalyticsController {

    private final PeakUsageAnalyticsService peakUsageAnalyticsService;

    public PeakUsageAnalyticsController(PeakUsageAnalyticsService peakUsageAnalyticsService) {
        this.peakUsageAnalyticsService = peakUsageAnalyticsService;
    }

    @GetMapping
    public ResponseEntity<PeakUsageAnalyticsResponseDto> getPeakUsage() {
        return ResponseEntity.ok(peakUsageAnalyticsService.getPeakUsageAnalytics());
    }
}
