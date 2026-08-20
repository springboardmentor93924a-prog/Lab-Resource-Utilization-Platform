package com.labplatform.feedback.model;

import com.labplatform.equipment.model.Equipment;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "equipment_feedback")
public class EquipmentFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Equipment for which the feedback was submitted
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    /*
     * Booking associated with this feedback
     */
    @Column(name = "booking_id")
    private Long bookingId;

    /*
     * User who submitted the feedback.
     *
     * Can be either:
     * - STUDENT
     * - RESEARCHER
     *
     * User IDs are UUIDs in the existing User entity.
     */
    @Column(name = "submitted_by_id")
    private UUID submittedById;

    @Column(name = "submitted_by_name")
    private String submittedByName;

    @Column(name = "submitted_by_role")
    private String submittedByRole;

    /*
     * How is the equipment functioning?
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "functioning_status", nullable = false)
    private FunctioningStatus functioningStatus;

    /*
     * How serious is the problem?
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private FeedbackSeverity severity;

    /*
     * Detailed feedback / problem description
     */
    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    /*
     * Current state of feedback
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "feedback_status", nullable = false)
    private FeedbackStatus feedbackStatus;

    /*
     * Date and time when feedback was submitted
     */
    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    /*
     * Default constructor required by JPA
     */
    public EquipmentFeedback() {
    }

    /*
     * Automatically set values before inserting into database
     */
    @PrePersist
    protected void onCreate() {

        if (this.submittedAt == null) {
            this.submittedAt = LocalDateTime.now();
        }

        if (this.feedbackStatus == null) {
            this.feedbackStatus = FeedbackStatus.NEW;
        }
    }

    // =========================
    // GETTERS AND SETTERS
    // =========================

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

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public UUID getSubmittedById() {
        return submittedById;
    }

    public void setSubmittedById(UUID submittedById) {
        this.submittedById = submittedById;
    }

    public String getSubmittedByName() {
        return submittedByName;
    }

    public void setSubmittedByName(String submittedByName) {
        this.submittedByName = submittedByName;
    }

    public String getSubmittedByRole() {
        return submittedByRole;
    }

    public void setSubmittedByRole(String submittedByRole) {
        this.submittedByRole = submittedByRole;
    }

    public FunctioningStatus getFunctioningStatus() {
        return functioningStatus;
    }

    public void setFunctioningStatus(
            FunctioningStatus functioningStatus) {

        this.functioningStatus = functioningStatus;
    }

    public FeedbackSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(
            FeedbackSeverity severity) {

        this.severity = severity;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public FeedbackStatus getFeedbackStatus() {
        return feedbackStatus;
    }

    public void setFeedbackStatus(
            FeedbackStatus feedbackStatus) {

        this.feedbackStatus = feedbackStatus;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(
            LocalDateTime submittedAt) {

        this.submittedAt = submittedAt;
    }
}