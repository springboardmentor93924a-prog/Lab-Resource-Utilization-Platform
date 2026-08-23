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
public class DepartmentPerformanceReportDTO {
    // Current Live Snapshot Metrics
    private Long totalEquipment;
    private Long availableEquipment;
    private Long equipmentUnderMaintenance;
    private Long outOfServiceEquipment;

    // Date-Range Dependent Metrics
    private Long totalBookings;
    private Long completedBookings;
    private Long cancelledBookings;
    private Long noShowCount;
    private BigDecimal noShowRate;
    private BigDecimal departmentUtilizationRate;
    private BigDecimal totalDowntimeHours;
    private BigDecimal totalUsageCost;
    private String mostUsedEquipment;
}
