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
public class IssueSummaryReportDTO {
    private String equipmentName;
    private Long equipmentId;
    private String departmentName;
    private Long departmentId;

    // Issue reports count
    private Long openIssueReportCount;

    // Maintenance requests count by specific status
    private Long activeMaintenanceRequestCount; // status not COMPLETED/CANCELLED
    private Long rejectedMaintenanceVerificationCount; // status is REJECTED
    private Long openMaintenanceCount;
    private Long assignedMaintenanceCount;
    private Long inProgressMaintenanceCount;
    private Long pendingVerificationMaintenanceCount;
    private Long rejectedMaintenanceCount;

    // Equipment and downtime
    private String currentEquipmentStatus;
    private BigDecimal totalDowntime;

    // Latest issue/request info
    private String latestIssueDescription;
    private LocalDateTime latestIssueReportedDate;
    private String assignedTechnician;
    private String currentMaintenanceStatus;
    private String priority;

    // Computed category
    private String category; // "Needs Attention", "Under Maintenance", "Critical / Out of Service", "Resolved"

    // Actionable references for navigation
    private Long latestIssueReportId;
    private Long activeMaintenanceRequestId;
    private Long assignedTechnicianId;
}
