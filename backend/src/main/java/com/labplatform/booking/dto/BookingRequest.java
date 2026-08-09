package com.labplatform.booking.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class BookingRequest {

    @NotNull(message = "User id is required")
    private UUID userId;

    @NotNull(message = "Equipment id is required")
    private Long equipmentId;

    @NotNull(message = "Booking date is required")
    private LocalDate bookingDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private Integer durationHours;

    private String purpose;

    private Boolean recurring;

    private Integer recurringWeeks;
    private Boolean priorityBooking;

    public BookingRequest() {
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
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

    public Integer getDurationHours() {
        return durationHours;
    }

    public void setDurationHours(Integer durationHours) {
        this.durationHours = durationHours;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public Boolean getRecurring() {
        return recurring;
    }

    public void setRecurring(Boolean recurring) {
        this.recurring = recurring;
    }

    public Integer getRecurringWeeks() {
        return recurringWeeks;
    }

    public void setRecurringWeeks(Integer recurringWeeks) {
        this.recurringWeeks = recurringWeeks;
    }
    public Boolean getPriorityBooking() {
        return priorityBooking;
    }

    public void setPriorityBooking(Boolean priorityBooking) {
        this.priorityBooking = priorityBooking;
    }
}