package com.labresource.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "access_requests")
public class AccessRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Researcher requesting access
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Shared equipment being requested
    @ManyToOne
    @JoinColumn(name = "shared_equipment_id", nullable = false)
    private SharedEquipment sharedEquipment;

    // Reason for requesting access
    @Column(length = 1000)
    private String requestReason;

    // PENDING / APPROVED / REJECTED
    @Column(nullable = false)
    private String status = "PENDING";

    // Admin/Lab Manager response
    @Column(length = 1000)
    private String adminResponse;

    // When request was created
    @Column(nullable = false)
    private LocalDateTime requestedAt;

    // When request was approved/rejected
    private LocalDateTime respondedAt;

    public AccessRequest() {
    }

    // Automatically set request date
    @PrePersist
    protected void onCreate() {
        if (requestedAt == null) {
            requestedAt = LocalDateTime.now();
        }

        if (status == null) {
            status = "PENDING";
        }
    }

    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public SharedEquipment getSharedEquipment() {
        return sharedEquipment;
    }

    public void setSharedEquipment(
            SharedEquipment sharedEquipment
    ) {
        this.sharedEquipment = sharedEquipment;
    }

    public String getRequestReason() {
        return requestReason;
    }

    public void setRequestReason(String requestReason) {
        this.requestReason = requestReason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdminResponse() {
        return adminResponse;
    }

    public void setAdminResponse(String adminResponse) {
        this.adminResponse = adminResponse;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public LocalDateTime getRespondedAt() {
        return respondedAt;
    }

    public void setRespondedAt(LocalDateTime respondedAt) {
        this.respondedAt = respondedAt;
    }
}