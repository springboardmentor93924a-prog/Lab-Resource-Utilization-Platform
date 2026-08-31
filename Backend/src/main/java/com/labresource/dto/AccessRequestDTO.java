package com.labresource.dto;

public class AccessRequestDTO {

    private Long userId;
    private Long sharedEquipmentId;
    private String requestReason;

    public AccessRequestDTO() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getSharedEquipmentId() {
        return sharedEquipmentId;
    }

    public void setSharedEquipmentId(Long sharedEquipmentId) {
        this.sharedEquipmentId = sharedEquipmentId;
    }

    public String getRequestReason() {
        return requestReason;
    }

    public void setRequestReason(String requestReason) {
        this.requestReason = requestReason;
    }
}