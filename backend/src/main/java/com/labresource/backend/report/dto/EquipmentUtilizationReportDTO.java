package com.labresource.backend.report.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentUtilizationReportDTO {

    // ── Identity ─────────────────────────────────────────────────────────────
    private Long   equipmentId;       // matches heatmap: e.id
    private String equipmentName;     // matches heatmap: e.name

    // ── Classification ───────────────────────────────────────────────────────
    private String category;          // matches heatmap: e.category (added)
    private Long   departmentId;
    private String departmentName;    // matches heatmap: e.department

    // ── Status ───────────────────────────────────────────────────────────────
    /** matches heatmap: e.status — AVAILABLE | BOOKED | UNDER_MAINTENANCE | OUT_OF_SERVICE | RETIRED */
    private String status;            // (added)

    // ── Utilization Metrics ──────────────────────────────────────────────────
    /** Total hours the equipment was available for booking in the date range */
    private BigDecimal totalAvailableHours;

    /** Total hours the equipment was actually in use */
    private BigDecimal totalUtilizedHours;

    /** utilizationPercentage = (totalUtilizedHours / totalAvailableHours) × 100 */
    private BigDecimal utilizationPercentage;

    /** idleTime = totalAvailableHours − totalUtilizedHours */
    private BigDecimal idleTime;

    // ── Booking Counts ───────────────────────────────────────────────────────
    private Long totalBookings;
    private Long completedBookings;
    private Long cancelledBookings;
    private Long noShowCount;
}
