package com.labplatform.maintenance.dto;

import com.labplatform.maintenance.model.WorkOrder;

import java.time.LocalDateTime;
import java.util.UUID;

public class WorkOrderResponse {

    private Integer id;
    private Long equipmentId;
    private String equipmentName;
    private UUID reportedById;
    private String reportedByName;
    private UUID assignedToId;
    private String assignedToName;
    private String issueDescription;
    private String priority;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    public WorkOrderResponse() {
    }

    public WorkOrderResponse(WorkOrder wo) {
        this.id = wo.getId();
        this.equipmentId = wo.getEquipment().getId();
        this.equipmentName = wo.getEquipment().getEquipmentName();
        this.reportedById = wo.getReportedBy().getId();
        this.reportedByName = wo.getReportedBy().getFullName();
        this.assignedToId = wo.getAssignedTo() != null ? wo.getAssignedTo().getId() : null;
        this.assignedToName = wo.getAssignedTo() != null ? wo.getAssignedTo().getFullName() : null;
        this.issueDescription = wo.getIssueDescription();
        this.priority = wo.getPriority().name();
        this.status = wo.getStatus().name();
        this.createdAt = wo.getCreatedAt();
        this.completedAt = wo.getCompletedAt();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Long getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Long equipmentId) { this.equipmentId = equipmentId; }

    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }

    public UUID getReportedById() { return reportedById; }
    public void setReportedById(UUID reportedById) { this.reportedById = reportedById; }

    public String getReportedByName() { return reportedByName; }
    public void setReportedByName(String reportedByName) { this.reportedByName = reportedByName; }

    public UUID getAssignedToId() { return assignedToId; }
    public void setAssignedToId(UUID assignedToId) { this.assignedToId = assignedToId; }

    public String getAssignedToName() { return assignedToName; }
    public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }

    public String getIssueDescription() { return issueDescription; }
    public void setIssueDescription(String issueDescription) { this.issueDescription = issueDescription; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}