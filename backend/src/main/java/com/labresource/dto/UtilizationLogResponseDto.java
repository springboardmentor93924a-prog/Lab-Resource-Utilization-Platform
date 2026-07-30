package com.labresource.dto;

import java.time.LocalDateTime;

public class UtilizationLogResponseDto {

    private String id;

    private String equipmentId;
    private String equipmentName;

    private String bookingId;

    private String userId;
    private String userName;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private Integer usageDurationMinutes;

    private String utilizationSource;

    private String status;

    private String remarks;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UtilizationLogResponseDto() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
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

    public Integer getUsageDurationMinutes() {
        return usageDurationMinutes;
    }

    public void setUsageDurationMinutes(Integer usageDurationMinutes) {
        this.usageDurationMinutes = usageDurationMinutes;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

//{
//  "id": "a1b2c3",
//
//  "equipmentId": "eq123",
//  "equipmentName": "Microscope",
//
//  "bookingId": "bk456",
//
//  "userId": "u789",
//  "userName": "Avdhut Magar",
//
//  "startTime": "2026-07-30T10:00:00",
//  "endTime": "2026-07-30T12:30:00",
//
//  "usageDurationMinutes": 150,
//
//  "utilizationSource": "BOOKING",
//
//  "status": "COMPLETED",
//
//  "remarks": "Research completed successfully.",
//
//  "createdAt": "2026-07-30T09:55:00",
//  "updatedAt": "2026-07-30T12:30:00"
//}