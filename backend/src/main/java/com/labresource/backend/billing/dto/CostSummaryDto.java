package com.labresource.backend.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CostSummaryDto {
    private String fiscalYear;
    private Long institutionId;
    private Long departmentId;
    private String departmentName;
    private BigDecimal allocatedAmount;
    private BigDecimal usedAmount;
    private BigDecimal remainingAmount;
    private BigDecimal usedPercentage;
    private String warningStatus;

    private BigDecimal usageCost;
    private BigDecimal maintenanceCost;
    private BigDecimal damageCharge;
    private BigDecimal sharingFee;
    private long totalCostsCount;

    private List<ItemSpendDto> spendingByEquipment;
    private List<ItemSpendDto> spendingByLab;
    private List<MonthlySpendDto> monthlyTrend;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ItemSpendDto {
        private Long id;
        private String name;
        private BigDecimal amount;
        private long count;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthlySpendDto {
        private String month;
        private BigDecimal amount;
    }
}
