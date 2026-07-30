package com.labresource.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class ExternalBookingRequestDto {

    @NotBlank
    private String equipmentId;

    @NotBlank
    private String requestedByUserId;

    @NotBlank
    private String requestingInstitutionId;

    @NotNull
    @Future
    private LocalDateTime requestedStartTime;

    @NotNull
    @Future
    private LocalDateTime requestedEndTime;

    @NotBlank
    private String purpose;

    public String getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(String equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getRequestedByUserId() {
        return requestedByUserId;
    }

    public void setRequestedByUserId(String requestedByUserId) {
        this.requestedByUserId = requestedByUserId;
    }

    public String getRequestingInstitutionId() {
        return requestingInstitutionId;
    }

    public void setRequestingInstitutionId(String requestingInstitutionId) {
        this.requestingInstitutionId = requestingInstitutionId;
    }

    public LocalDateTime getRequestedStartTime() {
        return requestedStartTime;
    }

    public void setRequestedStartTime(LocalDateTime requestedStartTime) {
        this.requestedStartTime = requestedStartTime;
    }

    public LocalDateTime getRequestedEndTime() {
        return requestedEndTime;
    }

    public void setRequestedEndTime(LocalDateTime requestedEndTime) {
        this.requestedEndTime = requestedEndTime;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }
}