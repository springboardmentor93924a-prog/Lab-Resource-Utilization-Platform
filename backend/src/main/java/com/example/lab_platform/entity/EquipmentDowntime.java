 package com.example.lab_platform.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipment_downtime")
public class EquipmentDowntime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "downtime_id")
    private Integer downtimeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maintenance_id")
    private Maintenance maintenance;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "reason")
    private String reason;

    @Column(name = "downtime_status", length = 30)
    private String downtimeStatus;

    public EquipmentDowntime() {
    }

    public Integer getDowntimeId() {
        return downtimeId;
    }

    public void setDowntimeId(Integer downtimeId) {
        this.downtimeId = downtimeId;
    }

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }

    public Maintenance getMaintenance() {
        return maintenance;
    }

    public void setMaintenance(Maintenance maintenance) {
        this.maintenance = maintenance;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDowntimeStatus() {
        return downtimeStatus;
    }

    public void setDowntimeStatus(String downtimeStatus) {
        this.downtimeStatus = downtimeStatus;
    }
}