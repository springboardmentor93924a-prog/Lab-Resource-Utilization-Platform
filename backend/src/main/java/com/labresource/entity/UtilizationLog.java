//package com.labresource.entity;
//
//import jakarta.persistence.*;
//
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "utilization_logs")
//public class UtilizationLog {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.UUID)
//    private String id;
//
//    @ManyToOne
//    @JoinColumn(name = "equipment_id")
//    private Equipment equipment;
//
//    @ManyToOne
//    @JoinColumn(name = "booking_id")
//    private Booking booking;
//
//    @ManyToOne
//    @JoinColumn(name = "user_id")
//    private User user;
//
//    @Column(name = "start_time")
//    private LocalDateTime startTime;
//
//    @Column(name = "end_time")
//    private LocalDateTime endTime;
//
//    @Column(name = "usage_duration_minutes")
//    private Integer usageDurationMinutes;
//
//    @Column(name = "utilization_source")
//    private String utilizationSource;
//
//    private String remarks;
//
//    @Column(name = "created_at")
//    private LocalDateTime createdAt;
//
//    public UtilizationLog() {
//    }
//
//    public String getId() {
//        return id;
//    }
//
//    public void setId(String id) {
//        this.id = id;
//    }
//
//    public Equipment getEquipment() {
//        return equipment;
//    }
//
//    public void setEquipment(Equipment equipment) {
//        this.equipment = equipment;
//    }
//
//    public Booking getBooking() {
//        return booking;
//    }
//
//    public void setBooking(Booking booking) {
//        this.booking = booking;
//    }
//
//    public User getUser() {
//        return user;
//    }
//
//    public void setUser(User user) {
//        this.user = user;
//    }
//
//    public LocalDateTime getStartTime() {
//        return startTime;
//    }
//
//    public void setStartTime(LocalDateTime startTime) {
//        this.startTime = startTime;
//    }
//
//    public LocalDateTime getEndTime() {
//        return endTime;
//    }
//
//    public void setEndTime(LocalDateTime endTime) {
//        this.endTime = endTime;
//    }
//
//    public Integer getUsageDurationMinutes() {
//        return usageDurationMinutes;
//    }
//
//    public void setUsageDurationMinutes(Integer usageDurationMinutes) {
//        this.usageDurationMinutes = usageDurationMinutes;
//    }
//
//    public String getUtilizationSource() {
//        return utilizationSource;
//    }
//
//    public void setUtilizationSource(String utilizationSource) {
//        this.utilizationSource = utilizationSource;
//    }
//
//    public String getRemarks() {
//        return remarks;
//    }
//
//    public void setRemarks(String remarks) {
//        this.remarks = remarks;
//    }
//
//    public LocalDateTime getCreatedAt() {
//        return createdAt;
//    }
//
//    public void setCreatedAt(LocalDateTime createdAt) {
//        this.createdAt = createdAt;
//    }
//}

package com.labresource.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "utilization_logs")
public class UtilizationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "usage_duration_minutes")
    private Integer usageDurationMinutes;

    @Column(name = "utilization_source", nullable = false)
    private String utilizationSource;

    @Column(nullable = false)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public UtilizationLog() {
    }

    @PrePersist
    public void onCreate() {

        createdAt = LocalDateTime.now();

        if (startTime == null) {
            startTime = LocalDateTime.now();
        }

        if (status == null || status.isBlank()) {
            status = "IN_USE";
        }

        if (utilizationSource == null || utilizationSource.isBlank()) {
            utilizationSource = "BOOKING";
        }
    }

    @PreUpdate
    public void onUpdate() {

        updatedAt = LocalDateTime.now();

        if (startTime != null && endTime != null) {

            usageDurationMinutes =
                    (int) java.time.Duration
                            .between(startTime, endTime)
                            .toMinutes();
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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