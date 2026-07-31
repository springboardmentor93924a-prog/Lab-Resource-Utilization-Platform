package com.labresource.dto;

import java.time.LocalDateTime;

public class UtilizationLogRequestDto {

    private String equipmentId;
    private String bookingId;
    private String userId;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private String utilizationSource;
    private String status;
    private String remarks;

    public UtilizationLogRequestDto() {
    }

    public String getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(String equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getUtilizationSource() {
        return utilizationSource;
    }

    public void setUtilizationSource(String utilizationSource) {
        this.utilizationSource = utilizationSource;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}