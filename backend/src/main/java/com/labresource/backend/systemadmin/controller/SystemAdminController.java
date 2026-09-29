package com.labresource.backend.systemadmin.controller;

import com.labresource.backend.security.UserPrincipal;
import com.labresource.backend.settings.dto.SystemSettingsDto;
import com.labresource.backend.settings.service.SystemSettingsService;
import com.labresource.backend.systemadmin.dto.PlatformAnalyticsDto;
import com.labresource.backend.systemadmin.service.SystemAdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/system-admin")
@RequiredArgsConstructor
public class SystemAdminController {

    private final SystemAdminAnalyticsService analyticsService;
    private final SystemSettingsService settingsService;

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyAuthority('SYSTEM_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public PlatformAnalyticsDto getPlatformAnalytics() {
        return analyticsService.getPlatformAnalytics();
    }

    @GetMapping("/settings")
    @PreAuthorize("hasAnyAuthority('SYSTEM_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public SystemSettingsDto getSystemSettings() {
        return settingsService.getSettings();
    }

    @PutMapping("/settings")
    @PreAuthorize("hasAnyAuthority('SYSTEM_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public SystemSettingsDto updateSystemSettings(
            @RequestBody SystemSettingsDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long adminUserId = principal != null ? principal.getUserId() : 0L;
        return settingsService.updateSettings(dto, adminUserId);
    }
}
