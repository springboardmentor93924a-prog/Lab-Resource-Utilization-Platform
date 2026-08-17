package com.example.lab_platform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resource_sharing_requests")
public class ResourceSharingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long equipmentId;
    private String equipmentName;

    @ManyToOne
    @JoinColumn(name = "sender_institution_id")
    private Institution senderInstitution;

    @ManyToOne
    @JoinColumn(name = "receiver_institution_id")
    private Institution receiverInstitution;
    
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED
    
    private LocalDateTime requestDate = LocalDateTime.now();

    public ResourceSharingRequest() {}

    public ResourceSharingRequest(Long equipmentId, String equipmentName, Institution senderInstitution, Institution receiverInstitution) {
        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.senderInstitution = senderInstitution;
        this.receiverInstitution = receiverInstitution;
        this.status = "PENDING";
        this.requestDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Long equipmentId) { this.equipmentId = equipmentId; }

    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }

    public Institution getSenderInstitution() { return senderInstitution; }
    public void setSenderInstitution(Institution senderInstitution) { this.senderInstitution = senderInstitution; }

    public Institution getReceiverInstitution() { return receiverInstitution; }
    public void setReceiverInstitution(Institution receiverInstitution) { this.receiverInstitution = receiverInstitution; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getRequestDate() { return requestDate; }
    public void setRequestDate(LocalDateTime requestDate) { this.requestDate = requestDate; }
}