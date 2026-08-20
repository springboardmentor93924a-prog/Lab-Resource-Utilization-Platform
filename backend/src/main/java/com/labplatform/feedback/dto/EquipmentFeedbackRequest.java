package com.labplatform.feedback.dto;

import com.labplatform.feedback.model.FeedbackSeverity;
import com.labplatform.feedback.model.FunctioningStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class EquipmentFeedbackRequest {

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    private Long bookingId;

    private UUID submittedById;

    private String submittedByName;

    private String submittedByRole;

    @NotNull(message = "Functioning status is required")
    private FunctioningStatus functioningStatus;

    @NotNull(message = "Severity is required")
    private FeedbackSeverity severity;

    @Size(max = 2000, message = "Comments cannot exceed 2000 characters")
    private String comments;

    public EquipmentFeedbackRequest() {
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
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

    public void setFunctioningStatus(FunctioningStatus functioningStatus) {
        this.functioningStatus = functioningStatus;
    }

    public FeedbackSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(FeedbackSeverity severity) {
        this.severity = severity;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}