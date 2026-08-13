package com.example.lab_platform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "waitlist")
public class Waitlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "waitlist_id")
    private Integer waitlistId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @Column(name = "requested_start_time")
    private LocalDateTime requestedStartTime;

    @Column(name = "requested_end_time")
    private LocalDateTime requestedEndTime;

    @Column(name = "waitlist_status", length = 20)
    private String waitlistStatus = "WAITING"; // WAITING, NOTIFIED, FULFILLED, CANCELLED

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Waitlist() {
    }

    // Getters and setters — add these the same way as your other entities
    public Integer getWaitlistId() { return waitlistId; }
    public void setWaitlistId(Integer waitlistId) { this.waitlistId = waitlistId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Equipment getEquipment() { return equipment; }
    public void setEquipment(Equipment equipment) { this.equipment = equipment; }

    public LocalDateTime getRequestedStartTime() { return requestedStartTime; }
    public void setRequestedStartTime(LocalDateTime requestedStartTime) { this.requestedStartTime = requestedStartTime; }

    public LocalDateTime getRequestedEndTime() { return requestedEndTime; }
    public void setRequestedEndTime(LocalDateTime requestedEndTime) { this.requestedEndTime = requestedEndTime; }

    public String getWaitlistStatus() { return waitlistStatus; }
    public void setWaitlistStatus(String waitlistStatus) { this.waitlistStatus = waitlistStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}