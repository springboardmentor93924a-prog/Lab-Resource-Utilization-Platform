package com.example.lab_platform.controller;

import com.example.lab_platform.dto.AnalyticsDashboardDTO;
import com.example.lab_platform.service.AnalyticsService;

import org.springframework.security.access.prepost.PreAuthorize;
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

    // Single combined payload for the Analytics Dashboard page:
    // utilization (Task 1/2) + cost (Task 3) + booking trends,
    // all pre-aggregated so the frontend just renders it.
    // Per PDF Section 11, Analytics only appears in the Institution
    // Administrator nav list — Lab Manager and Department Head lose it
    // here (System Admin left untouched).
    @GetMapping("/dashboard")
    @PreAuthorize("""
        hasAnyRole(
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)
    public AnalyticsDashboardDTO getDashboardAnalytics() {
        return analyticsService.getDashboardAnalytics();
    }
}