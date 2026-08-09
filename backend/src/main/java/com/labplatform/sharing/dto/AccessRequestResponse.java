package com.labplatform.sharing.dto;

import com.labplatform.sharing.model.AccessRequest;

import java.time.LocalDateTime;
import java.util.UUID;

public class AccessRequestResponse {

    private Integer id;
    private UUID requestingUserId;
    private String requestingUserName;
    private Long equipmentId;
    private String equipmentName;
    private Integer owningInstitutionId;
    private String owningInstitutionName;
    private String status;
    private String reason;
    private UUID reviewedById;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;

    public AccessRequestResponse() {
    }

    public AccessRequestResponse(AccessRequest request) {
        this.id = request.getId();
        this.requestingUserId = request.getRequestingUser().getId();
        this.requestingUserName = request.getRequestingUser().getFullName();
        this.equipmentId = request.getEquipment().getId();
        this.equipmentName = request.getEquipment().getEquipmentName();
        this.owningInstitutionId = request.getOwningInstitution().getId();
        this.owningInstitutionName = request.getOwningInstitution().getName();
        this.status = request.getStatus().name();
        this.reason = request.getReason();
        this.reviewedById = request.getReviewedBy() != null ? request.getReviewedBy().getId() : null;
        this.reviewedByName = request.getReviewedBy() != null ? request.getReviewedBy().getFullName() : null;
        this.reviewedAt = request.getReviewedAt();
        this.createdAt = request.getCreatedAt();
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public UUID getRequestingUserId() {
        return requestingUserId;
    }

    public void setRequestingUserId(UUID requestingUserId) {
        this.requestingUserId = requestingUserId;
    }

    public String getRequestingUserName() {
        return requestingUserName;
    }

    public void setRequestingUserName(String requestingUserName) {
        this.requestingUserName = requestingUserName;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public Integer getOwningInstitutionId() {
        return owningInstitutionId;
    }

    public void setOwningInstitutionId(Integer owningInstitutionId) {
        this.owningInstitutionId = owningInstitutionId;
    }

    public String getOwningInstitutionName() {
        return owningInstitutionName;
    }

    public void setOwningInstitutionName(String owningInstitutionName) {
        this.owningInstitutionName = owningInstitutionName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public UUID getReviewedById() {
        return reviewedById;
    }

    public void setReviewedById(UUID reviewedById) {
        this.reviewedById = reviewedById;
    }

    public String getReviewedByName() {
        return reviewedByName;
    }

    public void setReviewedByName(String reviewedByName) {
        this.reviewedByName = reviewedByName;
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
}