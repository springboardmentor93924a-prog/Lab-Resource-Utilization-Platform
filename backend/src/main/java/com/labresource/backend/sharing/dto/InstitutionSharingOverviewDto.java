package com.labresource.backend.sharing.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InstitutionSharingOverviewDto {
    private Long institutionId;
    private String institutionName;
    private long totalActiveMoUs;
    private long totalPendingMoUs;
    private BigDecimal totalRevenueEarned;
    private BigDecimal totalExpensePaid;
    private List<SharingAgreementDetailDto> incomingMoUs;
    private List<SharingAgreementDetailDto> outgoingMoUs;
}
