package com.labresource.dto;

import java.time.LocalDateTime;

public class ExternalBookingResponseDto {

    private String id;

    private String equipmentId;
    private String equipmentName;

    private String requestedByUserId;
    private String requestedByUserName;

    private String requestingInstitutionId;
    private String requestingInstitutionName;

    private String providerInstitutionId;
    private String providerInstitutionName;

    private String reviewedByUserId;
    private String reviewedByUserName;

    private LocalDateTime requestedStartTime;
    private LocalDateTime requestedEndTime;

    private String purpose;
    private String status;

    private String accessInstructions;
    private String rejectionReason;

    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

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

    public String getRequestedByUserId() {
        return requestedByUserId;
    }

    public void setRequestedByUserId(String requestedByUserId) {
        this.requestedByUserId = requestedByUserId;
    }

    public String getRequestedByUserName() {
        return requestedByUserName;
    }

    public void setRequestedByUserName(String requestedByUserName) {
        this.requestedByUserName = requestedByUserName;
    }

    public String getRequestingInstitutionId() {
        return requestingInstitutionId;
    }

    public void setRequestingInstitutionId(String requestingInstitutionId) {
        this.requestingInstitutionId = requestingInstitutionId;
    }

    public String getRequestingInstitutionName() {
        return requestingInstitutionName;
    }

    public void setRequestingInstitutionName(String requestingInstitutionName) {
        this.requestingInstitutionName = requestingInstitutionName;
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

    public String getReviewedByUserId() {
        return reviewedByUserId;
    }

    public void setReviewedByUserId(String reviewedByUserId) {
        this.reviewedByUserId = reviewedByUserId;
    }

    public String getReviewedByUserName() {
        return reviewedByUserName;
    }

    public void setReviewedByUserName(String reviewedByUserName) {
        this.reviewedByUserName = reviewedByUserName;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAccessInstructions() {
        return accessInstructions;
    }

    public void setAccessInstructions(String accessInstructions) {
        this.accessInstructions = accessInstructions;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
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