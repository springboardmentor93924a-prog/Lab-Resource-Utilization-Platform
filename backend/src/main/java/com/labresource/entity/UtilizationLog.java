package com.labresource.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "utilization_logs")
public class UtilizationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "utilization_id")
    private Long utilizationId;

    @Column(name = "equipment_id", nullable = false)
    private Long equipmentId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "check_in_time", nullable = false)
    private String checkInTime;

    @Column(name = "check_out_time")
    private String checkOutTime;

    @Column(name = "duration")
    private Double duration;

    @Column(name = "status", length = 30)
    private String status;

    @Column(name = "remarks", length = 255)
    private String remarks;

    // Default Constructor
    public UtilizationLog() {
    }

    // Parameterized Constructor
    public UtilizationLog(Long utilizationId,
                          Long equipmentId,
                          Long userId,
                          Long bookingId,
                          String checkInTime,
                          String checkOutTime,
                          Double duration,
                          String status,
                          String remarks) {

        this.utilizationId = utilizationId;
        this.equipmentId = equipmentId;
        this.userId = userId;
        this.bookingId = bookingId;
        this.checkInTime = checkInTime;
        this.checkOutTime = checkOutTime;
        this.duration = duration;
        this.status = status;
        this.remarks = remarks;
    }

    public Long getUtilizationId() {
        return utilizationId;
    }

    public void setUtilizationId(Long utilizationId) {
        this.utilizationId = utilizationId;
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

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(String checkInTime) {
        this.checkInTime = checkInTime;
    }

    public String getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(String checkOutTime) {
        this.checkOutTime = checkOutTime;
    }

    public Double getDuration() {
        return duration;
    }

    public void setDuration(Double duration) {
        this.duration = duration;
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