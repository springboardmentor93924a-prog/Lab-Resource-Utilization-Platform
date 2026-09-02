package com.labresource.controller;

import com.labresource.dto.EquipmentDowntimeResponseDto;
import com.labresource.service.EquipmentDowntimeAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics/equipment-downtime")
public class EquipmentDowntimeAnalyticsController {

    private final EquipmentDowntimeAnalyticsService service;

    public EquipmentDowntimeAnalyticsController(
            EquipmentDowntimeAnalyticsService service
    ) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<EquipmentDowntimeResponseDto>> getDowntime() {
        return ResponseEntity.ok(service.getEquipmentDowntime());
    }
}
