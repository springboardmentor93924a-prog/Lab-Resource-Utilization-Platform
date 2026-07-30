package com.labresource.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "external_bookings")
public class ExternalBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    /*
     * ज्या equipment साठी external booking केली आहे.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "equipment_id",
            nullable = false
    )
    private Equipment equipment;

    /*
     * External booking करणारा user.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "requested_by_user_id",
            nullable = false
    )
    private User requestedBy;

    /*
     * User कोणत्या institution मधून request करत आहे.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "requesting_institution_id",
            nullable = false
    )
    private Institution requestingInstitution;

    /*
     * Equipment ज्या institution चे आहे.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "provider_institution_id",
            nullable = false
    )
    private Institution providerInstitution;

    /*
     * Admin ज्याने request approve किंवा reject केली.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_user_id")
    private User reviewedBy;

    @Column(nullable = false)
    private LocalDateTime requestedStartTime;

    @Column(nullable = false)
    private LocalDateTime requestedEndTime;

    /*
     * PENDING
     * APPROVED
     * REJECTED
     * CANCELLED
     * COMPLETED
     */
    @Column(nullable = false)
    private String status;

    @Column(length = 1000)
    private String purpose;

    @Column(length = 1000)
    private String accessInstructions;

    @Column(length = 1000)
    private String rejectionReason;

    private LocalDateTime reviewedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public ExternalBooking() {
    }

    @PrePersist
    public void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (status == null || status.isBlank()) {
            status = "PENDING";
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }

    public User getRequestedBy() {
        return requestedBy;
    }

    public void setRequestedBy(User requestedBy) {
        this.requestedBy = requestedBy;
    }

    public Institution getRequestingInstitution() {
        return requestingInstitution;
    }

    public void setRequestingInstitution(
            Institution requestingInstitution
    ) {
        this.requestingInstitution = requestingInstitution;
    }

    public Institution getProviderInstitution() {
        return providerInstitution;
    }

    public void setProviderInstitution(
            Institution providerInstitution
    ) {
        this.providerInstitution = providerInstitution;
    }

    public User getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(User reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public LocalDateTime getRequestedStartTime() {
        return requestedStartTime;
    }

    public void setRequestedStartTime(
            LocalDateTime requestedStartTime
    ) {
        this.requestedStartTime = requestedStartTime;
    }

    public LocalDateTime getRequestedEndTime() {
        return requestedEndTime;
    }

    public void setRequestedEndTime(
            LocalDateTime requestedEndTime
    ) {
        this.requestedEndTime = requestedEndTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getAccessInstructions() {
        return accessInstructions;
    }

    public void setAccessInstructions(
            String accessInstructions
    ) {
        this.accessInstructions = accessInstructions;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(
            String rejectionReason
    ) {
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