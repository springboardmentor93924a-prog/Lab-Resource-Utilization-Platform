package com.example.lab_platform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resource_sharing_requests")
public class ResourceSharingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne
    @JoinColumn(name = "sender_institution_id")
    private Institution senderInstitution;

    @ManyToOne
    @JoinColumn(name = "receiver_institution_id")
    private Institution receiverInstitution;
    
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED
    
    private LocalDateTime requestDate = LocalDateTime.now();

    public ResourceSharingRequest() {}

    public ResourceSharingRequest(Equipment equipment, Institution senderInstitution, Institution receiverInstitution) {
        this.equipment = equipment;
        this.senderInstitution = senderInstitution;
        this.receiverInstitution = receiverInstitution;
        this.status = "PENDING";
        this.requestDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Equipment getEquipment() { return equipment; }
    public void setEquipment(Equipment equipment) { this.equipment = equipment; }

    // Convenience read-only fields so the existing frontend
    // (which reads req.equipmentId / req.equipmentName) keeps working
    // without a rewrite, now always sourced live from the real record.
    public Integer getEquipmentId() {
        return equipment != null ? equipment.getEquipmentId() : null;
    }

    public String getEquipmentName() {
        return equipment != null ? equipment.getEquipmentName() : null;
    }

    public Institution getSenderInstitution() { return senderInstitution; }
    public void setSenderInstitution(Institution senderInstitution) { this.senderInstitution = senderInstitution; }

    public Institution getReceiverInstitution() { return receiverInstitution; }
    public void setReceiverInstitution(Institution receiverInstitution) { this.receiverInstitution = receiverInstitution; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getRequestDate() { return requestDate; }
    public void setRequestDate(LocalDateTime requestDate) { this.requestDate = requestDate; }
}