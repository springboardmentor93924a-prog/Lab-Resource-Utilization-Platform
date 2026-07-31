package com.labresource.dto.resourcesharing;

import java.time.LocalDateTime;

public class ResourceSharingRequestDto {

    private String equipmentId;

    private String requesterId;

    private String requesterInstitutionId;

    private String providerInstitutionId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String purpose;

    public ResourceSharingRequestDto() {
    }

    public String getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(String equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(String requesterId) {
        this.requesterId = requesterId;
    }

    public String getRequesterInstitutionId() {
        return requesterInstitutionId;
    }

    public void setRequesterInstitutionId(String requesterInstitutionId) {
        this.requesterInstitutionId = requesterInstitutionId;
    }

    public String getProviderInstitutionId() {
        return providerInstitutionId;
    }

    public void setProviderInstitutionId(String providerInstitutionId) {
        this.providerInstitutionId = providerInstitutionId;
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
}