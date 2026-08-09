package com.labplatform.booking.dto;

import com.labplatform.booking.model.WaitlistEntry;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class WaitlistResponse {

    private Integer id;
    private String userFullName;
    private Long equipmentId;
    private String equipmentName;
    private LocalDate requestedDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private LocalDateTime createdAt;

    public WaitlistResponse() {
    }

    public WaitlistResponse(WaitlistEntry entry) {
        this.id = entry.getId();
        this.userFullName = entry.getUser().getFullName();
        this.equipmentId = entry.getEquipment().getId();
        this.equipmentName = entry.getEquipment().getEquipmentName();
        this.requestedDate = entry.getRequestedDate();
        this.startTime = entry.getStartTime();
        this.endTime = entry.getEndTime();
        this.status = entry.getStatus().name();
        this.createdAt = entry.getCreatedAt();
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUserFullName() {
        return userFullName;
    }

    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public LocalDate getRequestedDate() {
        return requestedDate;
    }

    public void setRequestedDate(LocalDate requestedDate) {
        this.requestedDate = requestedDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}