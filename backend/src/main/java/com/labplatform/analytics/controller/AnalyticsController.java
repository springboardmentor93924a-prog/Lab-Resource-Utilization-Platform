package com.labplatform.analytics.controller;

import com.labplatform.analytics.dto.AnalyticsResponse;
import com.labplatform.analytics.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/me")
    public ResponseEntity<AnalyticsResponse> getMyAnalytics(Authentication authentication) {
        return ResponseEntity.ok(analyticsService.getMyAnalytics(authentication.getName()));
    }
}