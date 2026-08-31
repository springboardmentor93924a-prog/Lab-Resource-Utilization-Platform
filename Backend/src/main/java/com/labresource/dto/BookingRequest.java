package com.labresource.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class BookingRequest {

    private Long equipmentId;
    private Long userId;

    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;

    private String purpose;

    private boolean recurring;
    private Integer recurrenceWeeks;

    public BookingRequest() {
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
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
}