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
    @GetMapping("/dashboard")
    @PreAuthorize("""
        hasAnyRole(
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)
    public AnalyticsDashboardDTO getDashboardAnalytics() {
        return analyticsService.getDashboardAnalytics();
    }
}
