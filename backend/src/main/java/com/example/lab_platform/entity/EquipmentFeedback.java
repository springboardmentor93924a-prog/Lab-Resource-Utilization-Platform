package com.example.lab_platform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipment_feedback")
public class EquipmentFeedback {

    // NOTE: Booking is in the same package (com.example.lab_platform.entity),
    // so no separate import statement is required.

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id")
    private Integer feedbackId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by", nullable = false)
    private User reportedBy;

    // Optional — set when the report was raised from a specific completed
    // booking's inline "Submit Feedback" action rather than the general
    // equipment page. Lets the service validate the 1-hour post-completion
    // window and prevent duplicate reports per booking.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = true)
    private Booking booking;

    @Column(name = "description", nullable = false)
    private String description;

    // NORMAL, URGENT
    @Column(name = "urgency", length = 20)
    private String urgency = "NORMAL";

    // PENDING -> PENDING_APPROVAL -> RESOLVED
    //                             -> REJECTED -> (technician retries) -> PENDING_APPROVAL
    @Column(name = "status", length = 20)
    private String status = "PENDING";

    // The technician who clicked "Mark as Fixed" — set each time a fix is
    // submitted, so a rejection notification can go back to the right person.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "handled_by")
    private User handledBy;

    @Column(name = "created_date")
    private LocalDateTime createdDate = LocalDateTime.now();

    public EquipmentFeedback() {}

    public Integer getFeedbackId() { return feedbackId; }
    public void setFeedbackId(Integer feedbackId) { this.feedbackId = feedbackId; }

    public Equipment getEquipment() { return equipment; }
    public void setEquipment(Equipment equipment) { this.equipment = equipment; }

    public User getReportedBy() { return reportedBy; }
    public void setReportedBy(User reportedBy) { this.reportedBy = reportedBy; }

    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public User getHandledBy() { return handledBy; }
    public void setHandledBy(User handledBy) { this.handledBy = handledBy; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}