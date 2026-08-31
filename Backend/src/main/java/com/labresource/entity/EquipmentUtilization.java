package com.labresource.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "equipment_utilization")
public class EquipmentUtilization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // EQUIPMENT
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    // =========================================================
    // USAGE DATE
    // =========================================================

    @Column(name = "usage_date", nullable = false)
    private LocalDate usageDate;

    // =========================================================
    // START / END TIME
    // =========================================================

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    // =========================================================
    // START / END TIMESTAMP
    // =========================================================

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    // =========================================================
    // USAGE HOURS
    // =========================================================

    @Column(name = "usage_hours")
    private Double usageHours;

    // =========================================================
    // STATUS
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UtilizationStatus status = UtilizationStatus.IN_USE;

    // =========================================================
    // CREATED AT
    // =========================================================

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // =========================================================
    // PRE PERSIST
    // =========================================================

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (usageDate == null) {
            usageDate = LocalDate.now();
        }

        if (startedAt == null) {
            startedAt = LocalDateTime.now();
        }

        if (startTime == null) {
            startTime = startedAt.toLocalTime();
        }

        if (status == null) {
            status = UtilizationStatus.IN_USE;
        }
    }

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public EquipmentUtilization() {
    }

    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }

    public LocalDate getUsageDate() {
        return usageDate;
    }

    public void setUsageDate(LocalDate usageDate) {
        this.usageDate = usageDate;
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

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(LocalDateTime endedAt) {
        this.endedAt = endedAt;
    }

    public Double getUsageHours() {
        return usageHours;
    }

    public void setUsageHours(Double usageHours) {
        this.usageHours = usageHours;
    }

    public UtilizationStatus getStatus() {
        return status;
    }

    public void setStatus(UtilizationStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}