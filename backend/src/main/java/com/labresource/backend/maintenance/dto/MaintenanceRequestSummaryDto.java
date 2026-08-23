package com.labresource.backend.maintenance.dto;

import com.labresource.backend.maintenance.entity.MaintenanceRequest;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class MaintenanceRequestSummaryDto {
    private Long maintenanceId;
    private String maintenanceCode;
    private Long equipmentId;
    private String equipmentName;
    private String issueType;
    private String issueDescription;
    private String priority;
    private String status;
    private LocalDateTime createdAt;
    private Long issueReportId;
    private Long departmentId;
    private Long assignedTechnicianId;
    private LocalDateTime downtimeStartedAt;
    private LocalDateTime completedAt;
    private LocalDateTime scheduledStartDatetime;
    private LocalDateTime scheduledEndDatetime;
    private java.math.BigDecimal downtimeHours;

    public static MaintenanceRequestSummaryDto fromEntity(MaintenanceRequest m, String equipmentName) {
        MaintenanceRequestSummaryDto dto = new MaintenanceRequestSummaryDto();
        dto.setMaintenanceId(m.getMaintenanceId());
        dto.setMaintenanceCode(m.getMaintenanceCode());
        dto.setEquipmentId(m.getEquipmentId());
        dto.setEquipmentName(equipmentName);
        dto.setIssueType(m.getIssueType());
        dto.setIssueDescription(m.getIssueDescription());
        dto.setPriority(m.getPriority());
        dto.setStatus(m.getStatus());
        dto.setCreatedAt(m.getCreatedAt());
        dto.setIssueReportId(m.getIssueReportId());
        dto.setDepartmentId(m.getDepartmentId());
        dto.setAssignedTechnicianId(m.getAssignedTechnicianId());
        dto.setDowntimeStartedAt(m.getDowntimeStartedAt());
        dto.setCompletedAt(m.getCompletedAt());
        dto.setScheduledStartDatetime(m.getScheduledStartDatetime());
        dto.setScheduledEndDatetime(m.getScheduledEndDatetime());
        dto.setDowntimeHours(m.getDowntimeHours());
        return dto;
    }
}
