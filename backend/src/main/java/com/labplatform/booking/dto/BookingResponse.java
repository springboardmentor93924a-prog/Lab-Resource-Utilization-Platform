package com.labplatform.booking.dto;

import com.labplatform.booking.model.Booking;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public class BookingResponse {

    private Long id;
    private UUID userId;
    private String userFullName;
    private Long equipmentId;
    private String equipmentName;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer durationHours;
    private String purpose;
    private Boolean recurring;
    private Integer recurringWeeks;
    private String bookingStatus;
    private LocalDateTime createdAt;
    private Boolean priorityBooking;

    public BookingResponse() {
    }

    public BookingResponse(Booking booking) {
        this.id = booking.getId();
        this.userId = booking.getUser() != null ? booking.getUser().getId() : null;
        this.userFullName = booking.getUser() != null ? booking.getUser().getFullName() : null;
        this.equipmentId = booking.getEquipment() != null ? booking.getEquipment().getId() : null;
        this.equipmentName = booking.getEquipment() != null ? booking.getEquipment().getEquipmentName() : null;
        this.bookingDate = booking.getBookingDate();
        this.startTime = booking.getStartTime();
        this.endTime = booking.getEndTime();
        this.durationHours = booking.getDurationHours();
        this.purpose = booking.getPurpose();
        this.recurring = booking.getRecurring();
        this.recurringWeeks = booking.getRecurringWeeks();
        this.bookingStatus = booking.getBookingStatus() != null ? booking.getBookingStatus().name() : null;
        this.createdAt = booking.getCreatedAt();
        this.priorityBooking = booking.getIsPriorityBooking();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
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

    public String getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(String bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    public Boolean getPriorityBooking() {
        return priorityBooking;
    }

    public void setPriorityBooking(Boolean priorityBooking) {
        this.priorityBooking = priorityBooking;
    }
}