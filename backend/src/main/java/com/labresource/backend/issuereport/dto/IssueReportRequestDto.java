package com.labresource.backend.issuereport.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class IssueReportRequestDto {
    private Long bookingId;
    private Long equipmentId;

    @NotBlank
    private String issueType;

    @NotBlank
    private String description;

    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH, CRITICAL
    private String attachmentUrl;

    /** Date & Time when the fault or incident occurred */
    @NotNull(message = "Incident timestamp is required.")
    private LocalDateTime incidentTimestamp;

    /** Mandatory confirmation checkbox: true when user confirms damage occurred during usage */
    @NotNull(message = "Damage acknowledgment confirmation is required.")
    @AssertTrue(message = "You must accept/confirm that the equipment was damaged during your usage.")
    private Boolean damageAcknowledged;
}
