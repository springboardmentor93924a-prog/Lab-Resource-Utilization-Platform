package com.labresource.dto.resourcesharing;

import java.time.LocalDateTime;

public class ResourceSharingResponseDto {

    private String id;

    private String equipmentId;
    private String equipmentName;

    private String requesterId;
    private String requesterName;

    private String requesterInstitutionId;
    private String requesterInstitutionName;

    private String providerInstitutionId;
    private String providerInstitutionName;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private String purpose;

    private String status;

    private String approvedById;
    private String approvedByName;

    private String rejectionReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ResourceSharingResponseDto() {
    }

    public ResourceSharingResponseDto(
            String id,
            String equipmentId,
            String equipmentName,
            String requesterId,
            String requesterName,
            String requesterInstitutionId,
            String requesterInstitutionName,
            String providerInstitutionId,
            String providerInstitutionName,
            LocalDateTime startTime,
            LocalDateTime endTime,
            String purpose,
            String status,
            String approvedById,
            String approvedByName,
            String rejectionReason,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.requesterId = requesterId;
        this.requesterName = requesterName;
        this.requesterInstitutionId = requesterInstitutionId;
        this.requesterInstitutionName = requesterInstitutionName;
        this.providerInstitutionId = providerInstitutionId;
        this.providerInstitutionName = providerInstitutionName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.purpose = purpose;
        this.status = status;
        this.approvedById = approvedById;
        this.approvedByName = approvedByName;
        this.rejectionReason = rejectionReason;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(String equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public String getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(String requesterId) {
        this.requesterId = requesterId;
    }

    public String getRequesterName() {
        return requesterName;
    }

    public void setRequesterName(String requesterName) {
        this.requesterName = requesterName;
    }

    public String getRequesterInstitutionId() {
        return requesterInstitutionId;
    }

    public void setRequesterInstitutionId(String requesterInstitutionId) {
        this.requesterInstitutionId = requesterInstitutionId;
    }

    public String getRequesterInstitutionName() {
        return requesterInstitutionName;
    }

    public void setRequesterInstitutionName(String requesterInstitutionName) {
        this.requesterInstitutionName = requesterInstitutionName;
    }

    public String getProviderInstitutionId() {
        return providerInstitutionId;
    }

    public void setProviderInstitutionId(String providerInstitutionId) {
        this.providerInstitutionId = providerInstitutionId;
    }

    public String getProviderInstitutionName() {
        return providerInstitutionName;
    }

    public void setProviderInstitutionName(String providerInstitutionName) {
        this.providerInstitutionName = providerInstitutionName;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getApprovedById() {
        return approvedById;
    }

    public void setApprovedById(String approvedById) {
        this.approvedById = approvedById;
    }

    public String getApprovedByName() {
        return approvedByName;
    }

    public void setApprovedByName(String approvedByName) {
        this.approvedByName = approvedByName;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}