package com.example.lab_platform.dto;

import com.example.lab_platform.entity.WorkOrder;

import java.time.LocalDate;

/*
 * Read-shape for Work Order: work order ID, maintenance request,
 * assigned technician, start date, completion date, status, and
 * notes — flattened, no lazy JPA proxies.
 */
public class WorkOrderDTO {

    private Integer workOrderId;
    private Integer requestId;
    private Integer equipmentId;
    private String equipmentName;
    private Integer assignedTechnicianId;
    private String assignedTechnicianName;
    private LocalDate startDate;
    private LocalDate completionDate;
    private String workOrderStatus;
    private String priority;
    private String description;
    private String notes;

    public WorkOrderDTO() {
    }

    public static WorkOrderDTO fromEntity(WorkOrder workOrder) {
        if (workOrder == null) {
            return null;
        }

        WorkOrderDTO dto = new WorkOrderDTO();
        dto.setWorkOrderId(workOrder.getWorkOrderId());

        if (workOrder.getMaintenanceRequest() != null) {
            dto.setRequestId(workOrder.getMaintenanceRequest().getRequestId());
        }

        if (workOrder.getEquipment() != null) {
            dto.setEquipmentId(workOrder.getEquipment().getEquipmentId());
            dto.setEquipmentName(workOrder.getEquipment().getEquipmentName());
        }

        if (workOrder.getAssignedTo() != null) {
            dto.setAssignedTechnicianId(workOrder.getAssignedTo().getUserId());
            dto.setAssignedTechnicianName(workOrder.getAssignedTo().getFullName());
        }

        dto.setStartDate(workOrder.getStartDate());
        dto.setCompletionDate(workOrder.getCompletionDate());
        dto.setWorkOrderStatus(workOrder.getWorkOrderStatus());
        dto.setPriority(workOrder.getPriority());
        dto.setDescription(workOrder.getDescription());
        dto.setNotes(workOrder.getNotes());

        return dto;
    }

    public Integer getWorkOrderId() {
        return workOrderId;
    }

    public void setWorkOrderId(Integer workOrderId) {
        this.workOrderId = workOrderId;
    }

    public Integer getRequestId() {
        return requestId;
    }

    public void setRequestId(Integer requestId) {
        this.requestId = requestId;
    }

    public Integer getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Integer equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public Integer getAssignedTechnicianId() {
        return assignedTechnicianId;
    }

    public void setAssignedTechnicianId(Integer assignedTechnicianId) {
        this.assignedTechnicianId = assignedTechnicianId;
    }

    public String getAssignedTechnicianName() {
        return assignedTechnicianName;
    }

    public void setAssignedTechnicianName(String assignedTechnicianName) {
        this.assignedTechnicianName = assignedTechnicianName;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDate completionDate) {
        this.completionDate = completionDate;
    }

    public String getWorkOrderStatus() {
        return workOrderStatus;
    }

    public void setWorkOrderStatus(String workOrderStatus) {
        this.workOrderStatus = workOrderStatus;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
