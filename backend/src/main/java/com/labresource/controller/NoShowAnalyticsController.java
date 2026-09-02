package com.labresource.controller;

import com.labresource.dto.NoShowAnalyticsResponseDto;
import com.labresource.service.NoShowAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics/no-show")
public class NoShowAnalyticsController {

    private final NoShowAnalyticsService noShowAnalyticsService;

    public NoShowAnalyticsController(NoShowAnalyticsService noShowAnalyticsService) {
        this.noShowAnalyticsService = noShowAnalyticsService;
    }

    @GetMapping
    public ResponseEntity<NoShowAnalyticsResponseDto> getNoShowAnalytics() {
        return ResponseEntity.ok(noShowAnalyticsService.getNoShowAnalytics());
    }
}
