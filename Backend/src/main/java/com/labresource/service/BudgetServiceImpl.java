package com.labresource.service;

import com.labresource.entity.Budget;
import com.labresource.entity.BudgetStatus;
import com.labresource.repository.BudgetRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class BudgetServiceImpl
        implements BudgetService {

    private final BudgetRepository budgetRepository;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public BudgetServiceImpl(
            BudgetRepository budgetRepository
    ) {
        this.budgetRepository = budgetRepository;
    }

    // =========================================================
    // CREATE
    // =========================================================

    @Override
    public Budget createBudget(
            Budget budget
    ) {

        if (budget.getBudgetAmount() == null ||
            budget.getBudgetAmount() < 0) {

            throw new IllegalArgumentException(
                    "Budget amount must be 0 or greater."
            );
        }

        if (budget.getUsedAmount() == null) {
            budget.setUsedAmount(0.0);
        }

        if (budget.getUsedAmount() < 0) {

            throw new IllegalArgumentException(
                    "Used amount must be 0 or greater."
            );
        }

        if (budget.getUsedAmount() >
            budget.getBudgetAmount()) {

            throw new IllegalArgumentException(
                    "Used amount cannot exceed budget amount."
            );
        }

        if (budget.getFinancialYear() == null ||
            budget.getFinancialYear().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Financial year is required."
            );
        }

        if (budget.getBudgetStatus() == null) {

            budget.setBudgetStatus(
                    BudgetStatus.ACTIVE
            );
        }

        return budgetRepository.save(budget);
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @Override
    public Budget updateBudget(
            Long id,
            Budget updatedBudget
    ) {

        Budget existing =
                getBudgetById(id);

        if (updatedBudget.getBudgetAmount() == null ||
            updatedBudget.getBudgetAmount() < 0) {

            throw new IllegalArgumentException(
                    "Budget amount must be 0 or greater."
            );
        }

        if (updatedBudget.getUsedAmount() == null) {
            updatedBudget.setUsedAmount(0.0);
        }

        if (updatedBudget.getUsedAmount() < 0) {

            throw new IllegalArgumentException(
                    "Used amount must be 0 or greater."
            );
        }

        if (updatedBudget.getUsedAmount() >
            updatedBudget.getBudgetAmount()) {

            throw new IllegalArgumentException(
                    "Used amount cannot exceed budget amount."
            );
        }

        existing.setDepartment(
                updatedBudget.getDepartment()
        );

        existing.setInstitution(
                updatedBudget.getInstitution()
        );

        existing.setBudgetAmount(
                updatedBudget.getBudgetAmount()
        );

        existing.setUsedAmount(
                updatedBudget.getUsedAmount()
        );

        existing.setFinancialYear(
                updatedBudget.getFinancialYear()
        );

        if (updatedBudget.getBudgetStatus() != null) {

            existing.setBudgetStatus(
                    updatedBudget.getBudgetStatus()
            );
        }

        return budgetRepository.save(existing);
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Budget getBudgetById(
            Long id
    ) {

        return budgetRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Budget not found with id: " + id
                        )
                );
    }

    // =========================================================
    // GET ALL
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Budget> getAllBudgets() {

        return budgetRepository.findAll();
    }

    // =========================================================
    // GET BY DEPARTMENT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Budget> getBudgetsByDepartment(
            Long departmentId
    ) {

        return budgetRepository
                .findByDepartmentId(departmentId);
    }

    // =========================================================
    // GET BY INSTITUTION
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Budget> getBudgetsByInstitution(
            Long institutionId
    ) {

        return budgetRepository
                .findByInstitutionId(institutionId);
    }

    // =========================================================
    // GET BY FINANCIAL YEAR
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Budget> getBudgetsByFinancialYear(
            String financialYear
    ) {

        return budgetRepository
                .findByFinancialYear(financialYear);
    }

    // =========================================================
    // GET BY STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Budget> getBudgetsByStatus(
            BudgetStatus status
    ) {

        return budgetRepository
                .findByBudgetStatus(status);
    }

    // =========================================================
    // DEPARTMENT + YEAR
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Budget getDepartmentBudgetForYear(
            Long departmentId,
            String financialYear
    ) {

        return budgetRepository
                .findByDepartmentIdAndFinancialYear(
                        departmentId,
                        financialYear
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Budget not found for department "
                                + departmentId
                                + " and financial year "
                                + financialYear
                        )
                );
    }

    // =========================================================
    // INSTITUTION + YEAR
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Budget getInstitutionBudgetForYear(
            Long institutionId,
            String financialYear
    ) {

        return budgetRepository
                .findByInstitutionIdAndFinancialYear(
                        institutionId,
                        financialYear
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Budget not found for institution "
                                + institutionId
                                + " and financial year "
                                + financialYear
                        )
                );
    }

    // =========================================================
    // UPDATE USED AMOUNT
    // =========================================================

    @Override
    public Budget updateUsedAmount(
            Long id,
            Double usedAmount
    ) {

        Budget budget =
                getBudgetById(id);

        if (usedAmount == null ||
            usedAmount < 0) {

            throw new IllegalArgumentException(
                    "Used amount must be 0 or greater."
            );
        }

        if (usedAmount >
            budget.getBudgetAmount()) {

            throw new IllegalArgumentException(
                    "Used amount cannot exceed budget amount."
            );
        }

        budget.setUsedAmount(
                usedAmount
        );

        updateStatusAutomatically(budget);

        return budgetRepository.save(budget);
    }

    // =========================================================
    // ADD USED AMOUNT
    // =========================================================

    @Override
    public Budget addUsedAmount(
            Long id,
            Double amount
    ) {

        Budget budget =
                getBudgetById(id);

        if (amount == null ||
            amount < 0) {

            throw new IllegalArgumentException(
                    "Amount must be 0 or greater."
            );
        }

        double currentUsed =
                budget.getUsedAmount() == null
                        ? 0.0
                        : budget.getUsedAmount();

        double newUsed =
                currentUsed + amount;

        if (newUsed >
            budget.getBudgetAmount()) {

            throw new IllegalArgumentException(
                    "Used amount cannot exceed budget amount."
            );
        }

        budget.setUsedAmount(
                newUsed
        );

        updateStatusAutomatically(budget);

        return budgetRepository.save(budget);
    }

    // =========================================================
    // CALCULATE REMAINING
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Double calculateRemainingAmount(
            Long id
    ) {

        Budget budget =
                getBudgetById(id);

        return budget.getRemainingAmount();
    }

    // =========================================================
    // CALCULATE UTILIZATION
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Double calculateUtilizationPercentage(
            Long id
    ) {

        Budget budget =
                getBudgetById(id);

        return budget
                .getUtilizationPercentage();
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    @Override
    public Budget updateBudgetStatus(
            Long id,
            BudgetStatus status
    ) {

        Budget budget =
                getBudgetById(id);

        if (status == null) {

            throw new IllegalArgumentException(
                    "Budget status is required."
            );
        }

        budget.setBudgetStatus(status);

        return budgetRepository.save(budget);
    }

    // =========================================================
    // DELETE
    // =========================================================

    @Override
    public void deleteBudget(
            Long id
    ) {

        Budget budget =
                getBudgetById(id);

        budgetRepository.delete(budget);
    }


    


    // =========================================================
    // DEPARTMENT + STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Budget> getDepartmentBudgetsByStatus(
            Long departmentId,
            BudgetStatus status
    ) {

        return budgetRepository
                .findByDepartmentIdAndBudgetStatus(
                        departmentId,
                        status
                );
    }


    // =========================================================
    // INSTITUTION + STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Budget> getInstitutionBudgetsByStatus(
            Long institutionId,
            BudgetStatus status
    ) {

        return budgetRepository
                .findByInstitutionIdAndBudgetStatus(
                        institutionId,
                        status
                );
    }



    // =========================================================
    // CALCULATE REMAINING BUDGET
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Double calculateRemainingBudget(
            Double allocatedAmount,
            Double utilizedAmount
    ) {

        if (allocatedAmount == null ||
            utilizedAmount == null) {

            throw new IllegalArgumentException(
                    "Allocated amount and utilized amount are required."
            );
        }

        if (allocatedAmount < 0 ||
            utilizedAmount < 0) {

            throw new IllegalArgumentException(
                    "Amounts must be 0 or greater."
            );
        }

        return Math.max(
                allocatedAmount - utilizedAmount,
                0.0
        );
    }


    // =========================================================
    // CALCULATE REMAINING FOR EXISTING BUDGET
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Double calculateRemainingBudget(
            Long id
    ) {

        Budget budget =
                getBudgetById(id);

        return calculateRemainingBudget(
                budget.getBudgetAmount(),
                budget.getUsedAmount()
        );
    }


    // =========================================================
    // UPDATE UTILIZED AMOUNT
    // =========================================================

    @Override
    public Budget updateUtilizedAmount(
            Long id,
            Double utilizedAmount
    ) {

        return updateUsedAmount(
                id,
                utilizedAmount
        );
    }


    // =========================================================
    // MARK AS EXHAUSTED
    // =========================================================

    @Override
public Budget markAsExhausted(
        Long id
) {

    Budget budget =
            getBudgetById(id);

    budget.setUsedAmount(
            budget.getBudgetAmount()
    );

    budget.setBudgetStatus(
            BudgetStatus.EXHAUSTED
    );

    return budgetRepository.save(budget);
}

    // =========================================================
    // AUTOMATIC STATUS
    // =========================================================

    private void updateStatusAutomatically(
            Budget budget
    ) {

        if (budget.getBudgetStatus() ==
                BudgetStatus.CLOSED) {

            return;
        }

        double budgetAmount =
                budget.getBudgetAmount() == null
                        ? 0.0
                        : budget.getBudgetAmount();

        double usedAmount =
                budget.getUsedAmount() == null
                        ? 0.0
                        : budget.getUsedAmount();

        if (budgetAmount > 0 &&
            usedAmount >= budgetAmount) {

            budget.setBudgetStatus(
                    BudgetStatus.EXHAUSTED
            );

        } else {

            budget.setBudgetStatus(
                    BudgetStatus.ACTIVE
            );
        }
    }


        // =========================================================
    // FINANCIAL YEAR + STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Budget> getBudgetsByFinancialYearAndStatus(
            String financialYear,
            BudgetStatus status
    ) {

        return budgetRepository
                .findByFinancialYearAndBudgetStatus(
                        financialYear,
                        status
                );
    }
}