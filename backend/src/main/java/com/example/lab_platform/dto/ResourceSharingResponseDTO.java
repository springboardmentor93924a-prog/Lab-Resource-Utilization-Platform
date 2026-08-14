package com.example.lab_platform.dto;

import java.time.LocalDateTime;

public class ResourceSharingResponseDTO {
    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private String senderInstitution;
    private String receiverInstitution;
    private String status;
    private LocalDateTime requestDate;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Long equipmentId) { this.equipmentId = equipmentId; }

    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }

    public String getSenderInstitution() { return senderInstitution; }
    public void setSenderInstitution(String senderInstitution) { this.senderInstitution = senderInstitution; }

    public String getReceiverInstitution() { return receiverInstitution; }
    public void setReceiverInstitution(String receiverInstitution) { this.receiverInstitution = receiverInstitution; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getRequestDate() { return requestDate; }
    public void setRequestDate(LocalDateTime requestDate) { this.requestDate = requestDate; }
}