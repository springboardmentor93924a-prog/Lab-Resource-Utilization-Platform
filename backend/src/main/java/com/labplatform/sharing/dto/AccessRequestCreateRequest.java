package com.labplatform.sharing.dto;

import jakarta.validation.constraints.NotNull;

public class AccessRequestCreateRequest {

    @NotNull(message = "Equipment id is required")
    private Long equipmentId;

    private String reason;

    public AccessRequestCreateRequest() {
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}