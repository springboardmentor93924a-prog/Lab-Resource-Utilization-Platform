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
    private String equipmentName;
    private Long equipmentId;
    private String departmentName;
    private Long departmentId;
    private BigDecimal totalAvailableHours;
    private BigDecimal totalUtilizedHours;
    private BigDecimal utilizationPercentage;
    private Long totalBookings;
    private Long completedBookings;
    private Long cancelledBookings;
    private Long noShowCount;
    private BigDecimal idleTime;
}
