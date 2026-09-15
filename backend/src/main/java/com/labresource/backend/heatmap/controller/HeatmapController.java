package com.labresource.backend.heatmap.controller;

import com.labresource.backend.heatmap.dto.HeatmapDataDto;
import com.labresource.backend.heatmap.service.HeatmapService;
import com.labresource.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

/**
 * GET /api/heatmap
 *
 * Returns combined { equipment[], bookings[] } shaped for the
 * frontend UtilizationHeatmapPage component.
 *
 * Query parameters:
 *   departmentId  (optional) — filter by department.
 *                              Ignored for LAB_MANAGER and DEPARTMENT_HEAD
 *                              (always scoped to their own dept from JWT).
 *                              Honoured for INSTITUTION_ADMIN and SYSTEM_ADMIN.
 *
 *   from          (optional) — ISO-8601 datetime e.g. 2026-08-01T00:00:00
 *   to            (optional) — ISO-8601 datetime e.g. 2026-08-31T23:59:59
 *                              When both provided, only bookings whose startTime
 *                              falls within [from, to] are returned.
 *                              When omitted, ALL bookings for the scoped
 *                              equipment are returned (frontend filters by its
 *                              own column date logic).
 *
 * Access:
 *   LAB_MANAGER, DEPARTMENT_HEAD, INSTITUTION_ADMIN, SYSTEM_ADMIN
 *
 * Frontend mapping:
 *   equipment[].id          ← equipmentId
 *   equipment[].name        ← equipment name
 *   equipment[].status      ← AVAILABLE | BOOKED | UNDER_MAINTENANCE | OUT_OF_SERVICE | RETIRED
 *   equipment[].department  ← department NAME (joined from Department table)
 *   equipment[].category    ← category
 *
 *   bookings[].id           ← bookingId
 *   bookings[].equipmentId  ← equipmentId
 *   bookings[].start        ← startTime as ISO string  e.g. "2026-08-15T10:00:00"
 *   bookings[].end          ← endTime as ISO string    e.g. "2026-08-15T12:00:00"
 *   bookings[].status       ← CONFIRMED | COMPLETED (only usable bookings returned)
 *   bookings[].researcher   ← firstName + lastName (joined from AppUser table)
 *   bookings[].purpose      ← booking purpose text
 */
@RestController
@RequestMapping("/api/heatmap")
@RequiredArgsConstructor
public class HeatmapController {

    private final HeatmapService heatmapService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('VIEW_UTILIZATION_ANALYTICS', 'ROLE_DEPARTMENT_HEAD', 'DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN', 'INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN', 'SYSTEM_ADMIN', 'ROLE_LAB_MANAGER', 'LAB_MANAGER', 'ROLE_LAB_TECHNICIAN', 'LAB_TECHNICIAN')")
    public HeatmapDataDto getHeatmapData(
            @AuthenticationPrincipal UserPrincipal principal,

            @RequestParam(required = false) Long departmentId,

            @RequestParam(required = false) String viewBy,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime from,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime to) {

        return heatmapService.getHeatmapData(principal, departmentId, viewBy, null, null, null, null, from, to);
    }
}
