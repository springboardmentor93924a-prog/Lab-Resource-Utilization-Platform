package com.labresource.dto.equipment;

public class EquipmentStatusRequest {

    private String status;
    private String availabilityStatus;

    public EquipmentStatusRequest() {
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
}