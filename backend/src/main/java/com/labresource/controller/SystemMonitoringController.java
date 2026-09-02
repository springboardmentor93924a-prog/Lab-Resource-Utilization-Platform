package com.labresource.controller;

import com.labresource.dto.SystemMonitoringResponseDto;
import com.labresource.service.SystemMonitoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/system-monitoring")
public class SystemMonitoringController {

    private final SystemMonitoringService systemMonitoringService;

    public SystemMonitoringController(SystemMonitoringService systemMonitoringService) {
        this.systemMonitoringService = systemMonitoringService;
    }

    @GetMapping
    public ResponseEntity<SystemMonitoringResponseDto> getSummary() {
        return ResponseEntity.ok(systemMonitoringService.getSystemMonitoringSummary());
    }
}
