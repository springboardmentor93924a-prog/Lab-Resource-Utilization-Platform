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
    private LocalDateTime proposedStartDatetime;
    private LocalDateTime proposedEndDatetime;
    private String delayReason;
    private java.time.LocalDate finalDueDate;
    private String managerNotes;
    private Long delayDecidedBy;
    private LocalDateTime delayDecidedAt;
    private LocalDateTime managerTargetStartDatetime;
    private LocalDateTime managerTargetEndDatetime;
    private String managerInstructions;
    private LocalDateTime planSubmittedAt;
    private LocalDateTime finalStartDatetime;
    private LocalDateTime finalEndDatetime;
    private Long finalizedBy;
    private LocalDateTime finalizedAt;
    private java.math.BigDecimal downtimeHours;
    private Long cancelledBy;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private Boolean requiresParts;
    private String partsDetails;
    private String diagnosticNotes;
    private String workPerformed;
    private String partsUsed;
    private String completionAttachmentPublicId;
    private String completionAttachmentSecureUrl;
    private String completionAttachmentFileName;
    private String verificationNotes;
    private LocalDateTime startedAt;
    private String assignmentNotes;
    private String technicianResponse;
    private LocalDateTime technicianAcceptedAt;
    private LocalDateTime assignedAt;
    private String problemDescription;
    private Long requestedBy;
    private String requestedByName;
    private Long assignedBy;
    private String assignedByName;
    private String assignedTechnicianName;
    private String labName;
    private String departmentName;

    public static MaintenanceRequestSummaryDto fromEntity(MaintenanceRequest m, String equipmentName) {
        return fromEntity(m, equipmentName, null);
    }

    public static MaintenanceRequestSummaryDto fromEntity(MaintenanceRequest m, String equipmentName, com.labresource.backend.maintenance.entity.MaintenanceAssignment assignment) {
        MaintenanceRequestSummaryDto dto = new MaintenanceRequestSummaryDto();
        dto.setMaintenanceId(m.getMaintenanceId());
        dto.setMaintenanceCode(m.getMaintenanceCode());
        dto.setEquipmentId(m.getEquipmentId());
        dto.setEquipmentName(equipmentName);
        dto.setRequestedBy(m.getRequestedBy());
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
        dto.setProposedStartDatetime(m.getProposedStartDatetime());
        dto.setProposedEndDatetime(m.getProposedEndDatetime());
        dto.setDelayReason(m.getDelayReason());
        dto.setFinalDueDate(m.getFinalDueDate());
        dto.setManagerNotes(m.getManagerNotes());
        dto.setDelayDecidedBy(m.getDelayDecidedBy());
        dto.setDelayDecidedAt(m.getDelayDecidedAt());
        dto.setManagerTargetStartDatetime(m.getManagerTargetStartDatetime());
        dto.setManagerTargetEndDatetime(m.getManagerTargetEndDatetime());
        dto.setManagerInstructions(m.getManagerInstructions());
        dto.setPlanSubmittedAt(m.getPlanSubmittedAt());
        dto.setFinalStartDatetime(m.getFinalStartDatetime());
        dto.setFinalEndDatetime(m.getFinalEndDatetime());
        dto.setFinalizedBy(m.getFinalizedBy());
        dto.setFinalizedAt(m.getFinalizedAt());
        dto.setDowntimeHours(m.getDowntimeHours());
        dto.setCancelledBy(m.getCancelledBy());
        dto.setCancelledAt(m.getCancelledAt());
        dto.setCancellationReason(m.getCancellationReason());
        dto.setRequiresParts(m.getRequiresParts());
        dto.setPartsDetails(m.getPartsDetails());
        dto.setDiagnosticNotes(m.getDiagnosticNotes());
        dto.setWorkPerformed(m.getWorkPerformed());
        dto.setPartsUsed(m.getPartsUsed());
        dto.setCompletionAttachmentPublicId(m.getCompletionAttachmentPublicId());
        dto.setCompletionAttachmentSecureUrl(m.getCompletionAttachmentSecureUrl());
        dto.setCompletionAttachmentFileName(m.getCompletionAttachmentFileName());
        dto.setVerificationNotes(m.getVerificationNotes());
        if (assignment != null) {
            dto.setAssignedBy(assignment.getAssignedBy());
            dto.setTechnicianResponse(assignment.getTechnicianResponse());
            dto.setTechnicianAcceptedAt(assignment.getTechnicianAcceptedAt());
            dto.setAssignedAt(assignment.getAssignedAt());
            dto.setStartedAt(assignment.getStartedAt());
            dto.setAssignmentNotes(assignment.getNotes());
            dto.setProblemDescription(assignment.getProblemDescription());
        }
        return dto;
    }
}
