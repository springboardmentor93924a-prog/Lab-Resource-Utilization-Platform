package com.labresource.backend.budget.dto;

import com.labresource.backend.budget.entity.Budget;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BudgetDto {
    private Long budgetId;
    private Long institutionId;
    private Long departmentId;
    private String departmentName;
    private String fiscalYear;
    private BigDecimal allocatedAmount;
    private BigDecimal usedAmount;
    private BigDecimal remainingAmount;
    private BigDecimal usedPercentage;
    private String warningStatus; // NORMAL, WATCH, WARNING, CRITICAL, EXCEEDED

    public static BudgetDto fromEntity(Budget budget, String departmentName) {
        BigDecimal allocated = budget.getAllocatedAmount() != null ? budget.getAllocatedAmount() : BigDecimal.ZERO;
        BigDecimal used = budget.getUsedAmount() != null ? budget.getUsedAmount() : BigDecimal.ZERO;
        BigDecimal remaining = allocated.subtract(used);

        BigDecimal pct = BigDecimal.ZERO;
        if (allocated.compareTo(BigDecimal.ZERO) > 0) {
            pct = used.multiply(BigDecimal.valueOf(100)).divide(allocated, 2, RoundingMode.HALF_UP);
        }

        String warning = "NORMAL";
        double pctValue = pct.doubleValue();
        if (pctValue >= 100.0) {
            warning = "EXCEEDED";
        } else if (pctValue >= 90.0) {
            warning = "CRITICAL";
        } else if (pctValue >= 80.0) {
            warning = "WARNING";
        } else if (pctValue >= 70.0) {
            warning = "WATCH";
        }

        return new BudgetDto(
                budget.getBudgetId(),
                budget.getInstitutionId(),
                budget.getDepartmentId(),
                departmentName,
                budget.getFiscalYear(),
                allocated,
                used,
                remaining,
                pct,
                warning
        );
    }
}
