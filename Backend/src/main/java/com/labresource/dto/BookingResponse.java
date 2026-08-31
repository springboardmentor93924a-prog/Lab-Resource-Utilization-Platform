package com.labresource.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class BookingResponse {

    private Long id;

    private Long equipmentId;
    private String equipmentName;
    private String equipmentCategory;
    private String equipmentAssetTag;
    private String equipmentImageUrl;

    private Long userId;

    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;

    private String purpose;

    private boolean recurring;
    private Integer recurrenceWeeks;

    private String status;

    public BookingResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getEquipmentCategory() {
        return equipmentCategory;
    }

    public void setEquipmentCategory(String equipmentCategory) {
        this.equipmentCategory = equipmentCategory;
    }

    public String getEquipmentAssetTag() {
        return equipmentAssetTag;
    }

    public void setEquipmentAssetTag(String equipmentAssetTag) {
        this.equipmentAssetTag = equipmentAssetTag;
    }

    public String getEquipmentImageUrl() {
        return equipmentImageUrl;
    }

    public void setEquipmentImageUrl(String equipmentImageUrl) {
        this.equipmentImageUrl = equipmentImageUrl;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
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

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public boolean isRecurring() {
        return recurring;
    }

    public void setRecurring(boolean recurring) {
        this.recurring = recurring;
    }

    public Integer getRecurrenceWeeks() {
        return recurrenceWeeks;
    }

    public void setRecurrenceWeeks(Integer recurrenceWeeks) {
        this.recurrenceWeeks = recurrenceWeeks;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    private String userName;

public String getUserName() {
    return userName;
}

public void setUserName(String userName) {
    this.userName = userName;
}
}