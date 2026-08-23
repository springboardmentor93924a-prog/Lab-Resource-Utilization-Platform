package com.labresource.backend.report.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceDowntimeReportDTO {
    private String equipmentName;
    private Long equipmentId;
    private String departmentName;
    private Long departmentId;
    private String issueDescription;
    private LocalDateTime issueReportDate;
    private String assignedTechnician;
    private String maintenanceStatus;
    private LocalDateTime downtimeStartedAt;
    private LocalDateTime completedAt;
    private BigDecimal totalDowntimeHours;
    private String verificationResult;
    private Long maintenanceRequestCount;
}
