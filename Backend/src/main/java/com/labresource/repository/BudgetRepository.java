package com.labresource.repository;

import com.labresource.entity.Budget;
import com.labresource.entity.BudgetStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository
        extends JpaRepository<Budget, Long> {

    // =========================================================
    // FIND BY DEPARTMENT
    // =========================================================

    List<Budget> findByDepartmentId(
            Long departmentId
    );

    // =========================================================
    // FIND BY INSTITUTION
    // =========================================================

    List<Budget> findByInstitutionId(
            Long institutionId
    );

    // =========================================================
    // FIND BY FINANCIAL YEAR
    // =========================================================

    List<Budget> findByFinancialYear(
            String financialYear
    );

    // =========================================================
    // FIND BY STATUS
    // =========================================================

    List<Budget> findByBudgetStatus(
            BudgetStatus budgetStatus
    );

    // =========================================================
    // DEPARTMENT + FINANCIAL YEAR
    // =========================================================

    Optional<Budget> findByDepartmentIdAndFinancialYear(
            Long departmentId,
            String financialYear
    );

    // =========================================================
    // INSTITUTION + FINANCIAL YEAR
    // =========================================================

    Optional<Budget> findByInstitutionIdAndFinancialYear(
            Long institutionId,
            String financialYear
    );

    // =========================================================
    // DEPARTMENT + STATUS
    // =========================================================

    List<Budget> findByDepartmentIdAndBudgetStatus(
            Long departmentId,
            BudgetStatus budgetStatus
    );

    // =========================================================
    // INSTITUTION + STATUS
    // =========================================================

    List<Budget> findByInstitutionIdAndBudgetStatus(
            Long institutionId,
            BudgetStatus budgetStatus
    );

    // =========================================================
    // FINANCIAL YEAR + STATUS
    // =========================================================

    List<Budget> findByFinancialYearAndBudgetStatus(
            String financialYear,
            BudgetStatus budgetStatus
    );

    // =========================================================
    // DEPARTMENT + FINANCIAL YEAR + STATUS
    // =========================================================

    Optional<Budget>
    findByDepartmentIdAndFinancialYearAndBudgetStatus(
            Long departmentId,
            String financialYear,
            BudgetStatus budgetStatus
    );

    // =========================================================
    // INSTITUTION + FINANCIAL YEAR + STATUS
    // =========================================================

    Optional<Budget>
    findByInstitutionIdAndFinancialYearAndBudgetStatus(
            Long institutionId,
            String financialYear,
            BudgetStatus budgetStatus
    );
}