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
}
