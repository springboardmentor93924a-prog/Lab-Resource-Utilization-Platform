package com.labresource.backend.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CostAnalysisReportDto {

    private ReportMetadataDto metadata;
    private CostSummaryBreakdownDto summary;
    private BudgetReportSummaryDto budget;
    private List<MonthlyCostTrendPointDto> monthlyTrend;
    private List<EquipmentCostItemDto> equipmentCosts;
    private List<LaboratoryCostItemDto> laboratoryCosts;
    private List<MaintenanceCostItemDto> maintenanceCosts;
    private List<SharingCostItemDto> sharingCosts;
    private List<DepartmentCostComparisonDto> departmentComparison;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CostSummaryBreakdownDto {
        private BigDecimal totalCost;
        private BigDecimal usageCost;
        private BigDecimal maintenanceCost;
        private BigDecimal sharingFee;
        private BigDecimal damageCharge;
        private Long totalCostsCount;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetReportSummaryDto {
        private String fiscalYear;
        private BigDecimal allocatedAmount;
        private BigDecimal usedAmount;
        private BigDecimal remainingAmount;
        private BigDecimal usedPercentage;
        private String warningStatus;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyCostTrendPointDto {
        private String period; // e.g. "Sep", "Oct" or "2026-09"
        private BigDecimal usageCost;
        private BigDecimal maintenanceCost;
        private BigDecimal sharingFee;
        private BigDecimal damageCharge;
        private BigDecimal totalCost;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EquipmentCostItemDto {
        private Long equipmentId;
        private String equipmentName;
        private Long laboratoryId;
        private String laboratoryName;
        private Long departmentId;
        private String departmentName;
        private BigDecimal usageCost;
        private BigDecimal maintenanceCost;
        private BigDecimal sharingFee;
        private BigDecimal damageCharge;
        private BigDecimal totalCost;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LaboratoryCostItemDto {
        private Long laboratoryId;
        private String laboratoryName;
        private Long departmentId;
        private String departmentName;
        private BigDecimal usageCost;
        private BigDecimal maintenanceCost;
        private BigDecimal sharingFee;
        private BigDecimal damageCharge;
        private BigDecimal totalCost;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MaintenanceCostItemDto {
        private Long maintenanceId;
        private Long equipmentId;
        private String equipmentName;
        private Long laboratoryId;
        private String laboratoryName;
        private Long departmentId;
        private String departmentName;
        private BigDecimal maintenanceCost;
        private LocalDateTime createdDate;
        private String status;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SharingCostItemDto {
        private Long agreementId;
        private Long owningInstitutionId;
        private String owningInstitution;
        private Long requestingInstitutionId;
        private String requestingInstitution;
        private String equipmentName;
        private String billingPeriod;
        private BigDecimal sharingFee;
        private String invoiceStatus;
        private String paymentStatus;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentCostComparisonDto {
        private Long departmentId;
        private String departmentName;
        private BigDecimal totalCost;
        private BigDecimal usageCost;
        private BigDecimal maintenanceCost;
        private BigDecimal sharingFee;
        private BigDecimal damageCharge;
        private BigDecimal budgetAllocated;
        private BigDecimal budgetUsed;
        private BigDecimal budgetRemaining;
        private BigDecimal budgetUtilizationPercentage;
    }
}
