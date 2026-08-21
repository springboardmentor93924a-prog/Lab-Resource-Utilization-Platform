package com.example.lab_platform.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
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

    /*
     * True only for entries auto-created because the user already had
     * a Pending Approval or Confirmed booking on equipment that got an
     * unresolved URGENT feedback report filed against it. These users
     * had already secured a slot before anyone else joined the waitlist
     * on their own, so they're served ahead of ordinary entries once
     * the issue is resolved. Ordinary joinWaitlist() entries always
     * default to false.
     */
    @Column(name = "is_priority", nullable = false)
    private Boolean isPriority = false;

    /*
     * The ordering key for the queue. For a priority entry (auto-added
     * from a displaced Pending Approval / Confirmed booking) this is
     * that booking's bookingDate — the system date the user actually
     * made the reservation, NOT the requested usage start time. For an
     * ordinary entry (joined the waitlist on their own) this is simply
     * the date they joined. Either way it answers the same question:
     * "when did this user establish their claim in line?"
     */
    @Column(name = "queue_date")
    private LocalDate queueDate;

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

    public Boolean getIsPriority() { return isPriority; }
    public void setIsPriority(Boolean isPriority) { this.isPriority = isPriority; }

    public LocalDate getQueueDate() { return queueDate; }
    public void setQueueDate(LocalDate queueDate) { this.queueDate = queueDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}