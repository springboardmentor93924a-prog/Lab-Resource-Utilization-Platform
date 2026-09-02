package com.labresource.dto;

import java.time.LocalDateTime;

public class EquipmentStatusEventDto {
    private String equipmentId;
    private String equipmentName;
    private String status;
    private String message;
    private LocalDateTime timestamp;

    public EquipmentStatusEventDto() {}

    public EquipmentStatusEventDto(String equipmentId, String equipmentName,
                                   String status, String message,
                                   LocalDateTime timestamp) {
        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.status = status;
        this.message = message;
        this.timestamp = timestamp;
    }

    public String getEquipmentId() { return equipmentId; }
    public void setEquipmentId(String equipmentId) { this.equipmentId = equipmentId; }
    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
