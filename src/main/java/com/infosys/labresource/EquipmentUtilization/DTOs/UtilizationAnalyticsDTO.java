package com.infosys.labresource.EquipmentUtilization.DTOs;

import lombok.Data;

@Data
public class UtilizationAnalyticsDTO {
    private Long equipId;
    private String equipName;
    private Double utilizationPercentage;
    private Double totalUsageHours;
    private Double idleHours;
    private Long bookingCount;

    // added so it's obvious from the response itself which department/institution
    // each row belongs to, instead of having to cross-check against /api/equipment
    private Long departmentId;
    private String departmentName;
    private Long institutionId;
    private String institutionName;
}