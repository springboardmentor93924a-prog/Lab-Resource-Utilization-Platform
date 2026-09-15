package com.labresource.backend.booking.dto;

import com.labresource.backend.booking.entity.Booking;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class BookingDto {
    private Long bookingId;
    private Long equipmentId;
    private String equipmentName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private String purpose;
    private Boolean isRecurring;
    private String recurrencePattern;
    private BigDecimal estimatedCost;
    private BigDecimal actualCost;
    private String paymentStatus;
    private LocalDateTime createdAt;

    // Rejection details
    private String rejectionReason;
    private Long rejectedBy;
    private String rejectedByName;
    private LocalDateTime rejectedAt;

    // Approval details
    private Long approvedBy;
    private String approvedByName;

    // Agreement details
    private Boolean agreementAccepted;
    private String agreementVersion;
    private LocalDateTime agreementAcceptedAt;

    public static BookingDto fromEntity(Booking b, String equipmentName) {
        return fromEntity(b, equipmentName, null, null);
    }

    public static BookingDto fromEntity(Booking b, String equipmentName, String approvedByName, String rejectedByName) {
        BookingDto dto = new BookingDto();
        dto.setBookingId(b.getBookingId());
        dto.setEquipmentId(b.getEquipmentId());
        dto.setEquipmentName(equipmentName);
        dto.setStartTime(b.getStartTime());
        dto.setEndTime(b.getEndTime());
        dto.setStatus(b.getStatus());
        dto.setPurpose(b.getPurpose());
        dto.setIsRecurring(b.getIsRecurring());
        dto.setRecurrencePattern(b.getRecurrencePattern());
        dto.setEstimatedCost(b.getEstimatedCost());
        dto.setActualCost(b.getActualCost());
        dto.setPaymentStatus(b.getPaymentStatus());
        dto.setCreatedAt(b.getCreatedAt());

        dto.setRejectionReason(b.getRejectionReason());
        dto.setRejectedBy(b.getRejectedBy());
        dto.setRejectedByName(rejectedByName);
        dto.setRejectedAt(b.getRejectedAt());

        dto.setApprovedBy(b.getApprovedBy());
        dto.setApprovedByName(approvedByName);

        dto.setAgreementAccepted(b.getAgreementAccepted());
        dto.setAgreementVersion(b.getAgreementVersion());
        dto.setAgreementAcceptedAt(b.getAgreementAcceptedAt());
        return dto;
    }
}

