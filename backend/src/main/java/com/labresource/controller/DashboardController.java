package com.labresource.controller;

import com.labresource.dto.dashboard.DashboardResponse;
import com.labresource.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboardSummary() {

        DashboardResponse response =
                dashboardService.getDashboardSummary();

        return ResponseEntity.ok(response);
    }
}