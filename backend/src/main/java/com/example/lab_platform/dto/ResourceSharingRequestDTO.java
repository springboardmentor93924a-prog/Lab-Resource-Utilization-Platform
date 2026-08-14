package com.example.lab_platform.dto;

public class ResourceSharingRequestDTO {
    private Long equipmentId;
    private String equipmentName;
    private String senderInstitution;
    private String receiverInstitution;

    // Getters and Setters
    public Long getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Long equipmentId) { this.equipmentId = equipmentId; }

    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }

    public String getSenderInstitution() { return senderInstitution; }
    public void setSenderInstitution(String senderInstitution) { this.senderInstitution = senderInstitution; }

    public String getReceiverInstitution() { return receiverInstitution; }
    public void setReceiverInstitution(String receiverInstitution) { this.receiverInstitution = receiverInstitution; }
}