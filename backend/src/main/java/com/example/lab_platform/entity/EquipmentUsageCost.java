 package com.example.lab_platform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipment_usage_costs")
public class EquipmentUsageCost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "usage_cost_id")
    private Integer usageCostId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "usage_start")
    private LocalDateTime usageStart;

    @Column(name = "usage_end")
    private LocalDateTime usageEnd;

    @Column(name = "usage_hours")
    private Double usageHours;

    @Column(name = "rate_per_hour")
    private Double ratePerHour;

    @Column(name = "total_cost")
    private Double totalCost;

    @Column(name = "cost_status", length = 30)
    private String costStatus;

    public EquipmentUsageCost() {
    }

    public Integer getUsageCostId() {
        return usageCostId;
    }

    public void setUsageCostId(Integer usageCostId) {
        this.usageCostId = usageCostId;
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

    public LocalDateTime getUsageStart() {
        return usageStart;
    }

    public void setUsageStart(LocalDateTime usageStart) {
        this.usageStart = usageStart;
    }

    public LocalDateTime getUsageEnd() {
        return usageEnd;
    }

    public void setUsageEnd(LocalDateTime usageEnd) {
        this.usageEnd = usageEnd;
    }

    public Double getUsageHours() {
        return usageHours;
    }

    public void setUsageHours(Double usageHours) {
        this.usageHours = usageHours;
    }

    public Double getRatePerHour() {
        return ratePerHour;
    }

    public void setRatePerHour(Double ratePerHour) {
        this.ratePerHour = ratePerHour;
    }

    public Double getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(Double totalCost) {
        this.totalCost = totalCost;
    }

    public String getCostStatus() {
        return costStatus;
    }

    public void setCostStatus(String costStatus) {
        this.costStatus = costStatus;
    }
}
