package com.example.lab_platform.dto;

import com.example.lab_platform.entity.MaintenanceRequest;

import java.time.LocalDate;

/*
 * Read-shape for Maintenance Request: request ID, equipment,
 * requested by, request date, issue/description, priority, status,
 * and remarks — flattened so the API doesn't serialize lazy JPA
 * proxies or expose unrelated fields (e.g. password hashes) nested
 * inside Equipment/User.
 */
public class MaintenanceRequestDTO {

    private Integer requestId;
    private Integer equipmentId;
    private String equipmentName;
    private Integer requestedByUserId;
    private String requestedByName;
    private LocalDate requestDate;
    private String description;
    private String priority;
    private String requestStatus;
    private String remarks;

    public MaintenanceRequestDTO() {
    }

    public static MaintenanceRequestDTO fromEntity(MaintenanceRequest request) {
        if (request == null) {
            return null;
        }

        MaintenanceRequestDTO dto = new MaintenanceRequestDTO();
        dto.setRequestId(request.getRequestId());

        if (request.getEquipment() != null) {
            dto.setEquipmentId(request.getEquipment().getEquipmentId());
            dto.setEquipmentName(request.getEquipment().getEquipmentName());
        }

        if (request.getRequestedBy() != null) {
            dto.setRequestedByUserId(request.getRequestedBy().getUserId());
            dto.setRequestedByName(request.getRequestedBy().getFullName());
        }

        dto.setRequestDate(request.getRequestDate());
        dto.setDescription(request.getDescription());
        dto.setPriority(request.getPriority());
        dto.setRequestStatus(request.getRequestStatus());
        dto.setRemarks(request.getRemarks());

        return dto;
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

    public Integer getRequestedByUserId() {
        return requestedByUserId;
    }

    public void setRequestedByUserId(Integer requestedByUserId) {
        this.requestedByUserId = requestedByUserId;
    }

    public String getRequestedByName() {
        return requestedByName;
    }

    public void setRequestedByName(String requestedByName) {
        this.requestedByName = requestedByName;
    }

    public LocalDate getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDate requestDate) {
        this.requestDate = requestDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getRequestStatus() {
        return requestStatus;
    }

    public void setRequestStatus(String requestStatus) {
        this.requestStatus = requestStatus;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
