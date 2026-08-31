package com.labresource.service;

import com.labresource.entity.Budget;
import com.labresource.entity.BudgetStatus;

import java.time.LocalDate;
import java.util.List;

public interface BudgetService {

    // =========================================================
    // CREATE
    // =========================================================

    Budget createBudget(
            Budget budget
    );

    // =========================================================
    // UPDATE
    // =========================================================

    Budget updateBudget(
            Long id,
            Budget budget
    );

    // =========================================================
    // GET BY ID
    // =========================================================

    Budget getBudgetById(
            Long id
    );

    // =========================================================
    // GET ALL
    // =========================================================

    List<Budget> getAllBudgets();

    // =========================================================
    // GET BY DEPARTMENT
    // =========================================================

    List<Budget> getBudgetsByDepartment(
            Long departmentId
    );

    // =========================================================
    // GET BY INSTITUTION
    // =========================================================

    List<Budget> getBudgetsByInstitution(
            Long institutionId
    );

    // =========================================================
    // GET BY FINANCIAL YEAR
    // =========================================================

    List<Budget> getBudgetsByFinancialYear(
            String financialYear
    );

    // =========================================================
    // GET BY STATUS
    // =========================================================

    List<Budget> getBudgetsByStatus(
            BudgetStatus status
    );

    // =========================================================
    // DEPARTMENT + YEAR
    // =========================================================

    Budget getDepartmentBudgetForYear(
            Long departmentId,
            String financialYear
    );

    // =========================================================
    // INSTITUTION + YEAR
    // =========================================================

    Budget getInstitutionBudgetForYear(
            Long institutionId,
            String financialYear
    );

    // =========================================================
    // UPDATE USED AMOUNT
    // =========================================================

    Budget updateUsedAmount(
            Long id,
            Double usedAmount
    );

    // =========================================================
    // ADD COST TO BUDGET
    // =========================================================

    Budget addUsedAmount(
            Long id,
            Double amount
    );

    // =========================================================
    // CALCULATE REMAINING
    // =========================================================

    Double calculateRemainingAmount(
            Long id
    );

    // =========================================================
    // CALCULATE UTILIZATION
    // =========================================================

    Double calculateUtilizationPercentage(
            Long id
    );

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    Budget updateBudgetStatus(
            Long id,
            BudgetStatus status
    );

    // =========================================================
    // DELETE
    // =========================================================

    void deleteBudget(
            Long id
    );


        // =========================================================
    // DEPARTMENT + STATUS
    // =========================================================

    List<Budget> getDepartmentBudgetsByStatus(
            Long departmentId,
            BudgetStatus status
    );

    // =========================================================
    // INSTITUTION + STATUS
    // =========================================================

    List<Budget> getInstitutionBudgetsByStatus(
            Long institutionId,
            BudgetStatus status
    );

    // =========================================================
    // FINANCIAL YEAR + STATUS
    // =========================================================

    List<Budget> getBudgetsByFinancialYearAndStatus(
            String financialYear,
            BudgetStatus status
    );

    // =========================================================
    // CALCULATE REMAINING BUDGET
    // =========================================================

    Double calculateRemainingBudget(
            Double allocatedAmount,
            Double utilizedAmount
    );

    // =========================================================
    // CALCULATE REMAINING BY ID
    // =========================================================

    Double calculateRemainingBudget(
            Long id
    );

    // =========================================================
    // UPDATE UTILIZED AMOUNT
    // =========================================================

    Budget updateUtilizedAmount(
            Long id,
            Double utilizedAmount
    );

    // =========================================================
    // MARK AS EXHAUSTED
    // =========================================================

    Budget markAsExhausted(
            Long id
    );
}