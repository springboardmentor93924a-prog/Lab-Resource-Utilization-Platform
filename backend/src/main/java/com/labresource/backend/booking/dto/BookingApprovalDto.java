package com.labresource.backend.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingApprovalDto {

    private Long bookingId;
    private String status;

    private ApplicantDetails applicant;
    private EquipmentDetails equipment;
    private BookingDetails booking;
    private AgreementDetails agreement;
    private DecisionDetails decision;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicantDetails {
        private Long userId;
        private String fullName;
        private String email;
        private String phoneNumber;
        private String role;
        private String rollNumber;
        private String researcherId;
        private String institutionName;
        private String institutionCode;
        private String departmentName;
        private String departmentCode;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EquipmentDetails {
        private Long equipmentId;
        private String name;
        private String assetId; // serial number
        private String category;
        private String laboratory;
        private String location;
        private String condition;
        private String calibrationStatus;
        private Integer capacityPerSlot;
        private BigDecimal hourlyRate;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingDetails {
        private Long bookingId;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Double durationHours;
        private String purpose;
        private Boolean isRecurring;
        private String recurrencePattern;
        private BigDecimal estimatedCost;
        private String paymentStatus;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgreementDetails {
        private Boolean accepted;
        private String version;
        private LocalDateTime acceptedAt;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DecisionDetails {
        private String status;
        private String rejectionReason;
        private Long rejectedById;
        private String rejectedByName;
        private LocalDateTime rejectedAt;
        private Long approvedById;
        private String approvedByName;
    }
}
