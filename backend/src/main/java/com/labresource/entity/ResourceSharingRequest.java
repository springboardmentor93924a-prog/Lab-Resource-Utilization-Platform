//package com.labresource.entity;
//
//import jakarta.persistence.*;
//
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "resource_sharing_requests")
//public class ResourceSharingRequest {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.UUID)
//    private String id;
//
//    @ManyToOne
//    @JoinColumn(name = "equipment_id")
//    private Equipment equipment;
//
//    @ManyToOne
//    @JoinColumn(name = "requester_id")
//    private User requester;
//
//    @ManyToOne
//    @JoinColumn(name = "requester_institution_id")
//    private Institution requesterInstitution;
//
//    @ManyToOne
//    @JoinColumn(name = "provider_institution_id")
//    private Institution providerInstitution;
//
//    @Column(name = "start_time")
//    private LocalDateTime startTime;
//
//    @Column(name = "end_time")
//    private LocalDateTime endTime;
//
//    private String purpose;
//
//    private String status;
//
//    @ManyToOne
//    @JoinColumn(name = "approved_by")
//    private User approvedBy;
//
//    @Column(name = "rejection_reason")
//    private String rejectionReason;
//
//    @Column(name = "created_at")
//    private LocalDateTime createdAt;
//
//    @Column(name = "updated_at")
//    private LocalDateTime updatedAt;
//
//    public ResourceSharingRequest() {
//    }
//
//    public String getId() {
//        return id;
//    }
//
//    public void setId(String id) {
//        this.id = id;
//    }
//
//    public Equipment getEquipment() {
//        return equipment;
//    }
//
//    public void setEquipment(Equipment equipment) {
//        this.equipment = equipment;
//    }
//
//    public User getRequester() {
//        return requester;
//    }
//
//    public void setRequester(User requester) {
//        this.requester = requester;
//    }
//
//    public Institution getRequesterInstitution() {
//        return requesterInstitution;
//    }
//
//    public void setRequesterInstitution(Institution requesterInstitution) {
//        this.requesterInstitution = requesterInstitution;
//    }
//
//    public Institution getProviderInstitution() {
//        return providerInstitution;
//    }
//
//    public void setProviderInstitution(Institution providerInstitution) {
//        this.providerInstitution = providerInstitution;
//    }
//
//    public LocalDateTime getStartTime() {
//        return startTime;
//    }
//
//    public void setStartTime(LocalDateTime startTime) {
//        this.startTime = startTime;
//    }
//
//    public LocalDateTime getEndTime() {
//        return endTime;
//    }
//
//    public void setEndTime(LocalDateTime endTime) {
//        this.endTime = endTime;
//    }
//
//    public String getPurpose() {
//        return purpose;
//    }
//
//    public void setPurpose(String purpose) {
//        this.purpose = purpose;
//    }
//
//    public String getStatus() {
//        return status;
//    }
//
//    public void setStatus(String status) {
//        this.status = status;
//    }
//
//    public User getApprovedBy() {
//        return approvedBy;
//    }
//
//    public void setApprovedBy(User approvedBy) {
//        this.approvedBy = approvedBy;
//    }
//
//    public String getRejectionReason() {
//        return rejectionReason;
//    }
//
//    public void setRejectionReason(String rejectionReason) {
//        this.rejectionReason = rejectionReason;
//    }
//
//    public LocalDateTime getCreatedAt() {
//        return createdAt;
//    }
//
//    public void setCreatedAt(LocalDateTime createdAt) {
//        this.createdAt = createdAt;
//    }
//
//    public LocalDateTime getUpdatedAt() {
//        return updatedAt;
//    }
//
//    public void setUpdatedAt(LocalDateTime updatedAt) {
//        this.updatedAt = updatedAt;
//    }
//}

package com.labresource.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "resource_sharing_requests")
public class ResourceSharingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @ManyToOne
    @JoinColumn(name = "requester_institution_id", nullable = false)
    private Institution requesterInstitution;

    @ManyToOne
    @JoinColumn(name = "provider_institution_id", nullable = false)
    private Institution providerInstitution;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(columnDefinition = "TEXT")
    private String purpose;

    @Column(nullable = false)
    private String status;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public ResourceSharingRequest() {
    }

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();

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

    public User getRequester() {
        return requester;
    }

    public void setRequester(User requester) {
        this.requester = requester;
    }

    public Institution getRequesterInstitution() {
        return requesterInstitution;
    }

    public void setRequesterInstitution(Institution requesterInstitution) {
        this.requesterInstitution = requesterInstitution;
    }

    public Institution getProviderInstitution() {
        return providerInstitution;
    }

    public void setProviderInstitution(Institution providerInstitution) {
        this.providerInstitution = providerInstitution;
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

    public User getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(User approvedBy) {
        this.approvedBy = approvedBy;
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