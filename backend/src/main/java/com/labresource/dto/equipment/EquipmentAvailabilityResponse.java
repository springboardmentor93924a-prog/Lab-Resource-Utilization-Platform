package com.labresource.dto.equipment;

public class EquipmentAvailabilityResponse {

    private String equipmentId;
    private String equipmentName;
    private String status;
    private String availabilityStatus;
    private boolean available;
    private String message;

    public EquipmentAvailabilityResponse() {
    }

    public EquipmentAvailabilityResponse(
            String equipmentId,
            String equipmentName,
            String status,
            String availabilityStatus,
            boolean available,
            String message
    ) {
        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.status = status;
        this.availabilityStatus = availabilityStatus;
        this.available = available;
        this.message = message;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(
            String availabilityStatus
    ) {
        this.availabilityStatus = availabilityStatus;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}