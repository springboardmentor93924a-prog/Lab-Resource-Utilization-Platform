package com.labresource.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "booking_logs")
public class BookingLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;

    @Column(name = "booking_id", nullable = false, insertable = false, updatable = false)
    private Long bookingId;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "changed_by", nullable = false)
    private Long changedBy;

    @Column(name = "changed_at")
    private String changedAt;

    @Column(name = "remarks", length = 255)
    private String remarks;

    // Default Constructor
    public BookingLog() {
    }

    // Parameterized Constructor
    public BookingLog(Long logId,
                      Long bookingId,
                      String status,
                      Long changedBy,
                      String changedAt,
                      String remarks) {

        this.logId = logId;
        this.bookingId = bookingId;
        this.status = status;
        this.changedBy = changedBy;
        this.changedAt = changedAt;
        this.remarks = remarks;
    }

    public Long getLogId() {
        return logId;
    }

    public void setLogId(Long logId) {
        this.logId = logId;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(Long changedBy) {
        this.changedBy = changedBy;
    }

    public String getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(String changedAt) {
        this.changedAt = changedAt;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }
}