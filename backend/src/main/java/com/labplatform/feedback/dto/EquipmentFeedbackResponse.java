package com.labplatform.feedback.dto;

import com.labplatform.feedback.model.EquipmentFeedback;
import com.labplatform.feedback.model.FeedbackSeverity;
import com.labplatform.feedback.model.FeedbackStatus;
import com.labplatform.feedback.model.FunctioningStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public class EquipmentFeedbackResponse {

    private Long id;

    private Long equipmentId;
    private String equipmentName;
    private String assetTag;

    private Long bookingId;

    private UUID submittedById;
    private String submittedByName;
    private String submittedByRole;

    private FunctioningStatus functioningStatus;
    private FeedbackSeverity severity;

    private String comments;

    private FeedbackStatus feedbackStatus;

    private LocalDateTime submittedAt;

    public EquipmentFeedbackResponse() {
    }

    public EquipmentFeedbackResponse(EquipmentFeedback feedback) {

        this.id = feedback.getId();

        if (feedback.getEquipment() != null) {

            this.equipmentId =
                    feedback.getEquipment().getId();

            this.equipmentName =
                    feedback.getEquipment().getEquipmentName();

            this.assetTag =
                    feedback.getEquipment().getAssetTag();
        }

        this.bookingId =
                feedback.getBookingId();

        // ==========================================
        // SUBMITTER INFORMATION
        // ==========================================

        this.submittedById =
                feedback.getSubmittedById();

        this.submittedByName =
                feedback.getSubmittedByName();

        this.submittedByRole =
                feedback.getSubmittedByRole();

        // ==========================================
        // FEEDBACK INFORMATION
        // ==========================================

        this.functioningStatus =
                feedback.getFunctioningStatus();

        this.severity =
                feedback.getSeverity();

        this.comments =
                feedback.getComments();

        // ==========================================
        // FEEDBACK STATUS
        // ==========================================

        this.feedbackStatus =
                feedback.getFeedbackStatus();

        // ==========================================
        // SUBMITTED DATE
        // ==========================================

        this.submittedAt =
                feedback.getSubmittedAt();
    }

    // ==========================================
    // GETTERS
    // ==========================================

    public Long getId() {
        return id;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public String getAssetTag() {
        return assetTag;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public UUID getSubmittedById() {
        return submittedById;
    }

    public String getSubmittedByName() {
        return submittedByName;
    }

    public String getSubmittedByRole() {
        return submittedByRole;
    }

    public FunctioningStatus getFunctioningStatus() {
        return functioningStatus;
    }

    public FeedbackSeverity getSeverity() {
        return severity;
    }

    public String getComments() {
        return comments;
    }

    public FeedbackStatus getFeedbackStatus() {
        return feedbackStatus;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
}