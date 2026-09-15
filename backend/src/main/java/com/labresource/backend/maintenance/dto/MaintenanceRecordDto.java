package com.labresource.backend.maintenance.dto;

import com.labresource.backend.maintenance.entity.MaintenanceRecord;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceRecordDto {
    private Long maintenanceId;
    private Long equipmentId;
    private String equipmentName;
    private Long labId;
    private String labName;
    private Long departmentId;
    private String departmentName;
    private Long technicianId;
    private String technicianName;
    private Long issueReportId;
    private String maintenanceType;
    private String status;
    private String priority;
    private String reason;
    private String description;
    private String inspectionNotes;
    private String workPerformed;
    private String partsUsed;
    private BigDecimal partsCost;
    private BigDecimal labourCost;
    private BigDecimal totalCost;
    private String conditionBefore;
    private String conditionAfter;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDate nextMaintenanceDate;
    private LocalDateTime createdAt;

    public static MaintenanceRecordDto fromEntity(MaintenanceRecord record, String equipmentName, String labName, String departmentName, String technicianName) {
        return new MaintenanceRecordDto(
                record.getMaintenanceId(),
                record.getEquipmentId(),
                equipmentName,
                null,
                labName,
                null,
                departmentName,
                record.getTechnicianId(),
                technicianName,
                record.getIssueReportId(),
                record.getMaintenanceType(),
                record.getStatus(),
                record.getPriority(),
                record.getReason(),
                record.getDescription(),
                record.getInspectionNotes(),
                record.getWorkPerformed(),
                record.getPartsUsed(),
                record.getPartsCost(),
                record.getLabourCost(),
                record.getTotalCost(),
                record.getConditionBefore(),
                record.getConditionAfter(),
                record.getStartedAt(),
                record.getCompletedAt(),
                record.getNextMaintenanceDate(),
                record.getCreatedAt()
        );
    }
}
