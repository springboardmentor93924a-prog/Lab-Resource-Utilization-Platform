package com.labresource.backend.report.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SharingCostReportDTO {
    private String equipmentName;
    private Long equipmentId;
    private String owningInstitution;
    private Long owningInstitutionId;
    private String requestingInstitution;
    private Long requestingInstitutionId;
    private String sharingRequestStatus;
    private String agreementStatus;
    private String sharedBookingStatus;
    private BigDecimal estimatedFee;
    private BigDecimal finalUsageFee;
    private String invoiceStatus;
    private String paymentStatus;
}
