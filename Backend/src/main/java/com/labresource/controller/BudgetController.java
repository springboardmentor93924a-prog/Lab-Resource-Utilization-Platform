package com.labresource.controller;

import com.labresource.entity.Budget;
import com.labresource.entity.BudgetStatus;
import com.labresource.service.BudgetService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(
            BudgetService budgetService
    ) {
        this.budgetService = budgetService;
    }

    // =========================================================
    // CREATE
    // =========================================================

    @PostMapping
    public ResponseEntity<Budget> createBudget(
            @RequestBody Budget budget
    ) {

        return ResponseEntity.ok(
                budgetService.createBudget(budget)
        );
    }


    // =========================================================
    // UPDATE
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<Budget> updateBudget(
            @PathVariable Long id,
            @RequestBody Budget budget
    ) {

        return ResponseEntity.ok(
                budgetService.updateBudget(
                        id,
                        budget
                )
        );
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Budget> getBudgetById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                budgetService.getBudgetById(id)
        );
    }


    // =========================================================
    // GET ALL
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Budget>> getAllBudgets() {

        return ResponseEntity.ok(
                budgetService.getAllBudgets()
        );
    }


    // =========================================================
    // GET BY DEPARTMENT
    // =========================================================

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<Budget>>
    getBudgetsByDepartment(
            @PathVariable Long departmentId
    ) {

        return ResponseEntity.ok(
                budgetService.getBudgetsByDepartment(
                        departmentId
                )
        );
    }


    // =========================================================
    // GET BY INSTITUTION
    // =========================================================

    @GetMapping("/institution/{institutionId}")
    public ResponseEntity<List<Budget>>
    getBudgetsByInstitution(
            @PathVariable Long institutionId
    ) {

        return ResponseEntity.ok(
                budgetService.getBudgetsByInstitution(
                        institutionId
                )
        );
    }


    // =========================================================
    // GET BY FINANCIAL YEAR
    // =========================================================

    @GetMapping("/financial-year/{financialYear}")
    public ResponseEntity<List<Budget>>
    getBudgetsByFinancialYear(
            @PathVariable String financialYear
    ) {

        return ResponseEntity.ok(
                budgetService.getBudgetsByFinancialYear(
                        financialYear
                )
        );
    }


    // =========================================================
    // GET BY STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Budget>>
    getBudgetsByStatus(
            @PathVariable BudgetStatus status
    ) {

        return ResponseEntity.ok(
                budgetService.getBudgetsByStatus(
                        status
                )
        );
    }


    // =========================================================
    // DEPARTMENT + STATUS
    // =========================================================

    @GetMapping(
            "/department/{departmentId}/status/{status}"
    )
    public ResponseEntity<List<Budget>>
    getDepartmentBudgetsByStatus(
            @PathVariable Long departmentId,
            @PathVariable BudgetStatus status
    ) {

        return ResponseEntity.ok(
                budgetService
                        .getDepartmentBudgetsByStatus(
                                departmentId,
                                status
                        )
        );
    }


    // =========================================================
    // INSTITUTION + STATUS
    // =========================================================

    @GetMapping(
            "/institution/{institutionId}/status/{status}"
    )
    public ResponseEntity<List<Budget>>
    getInstitutionBudgetsByStatus(
            @PathVariable Long institutionId,
            @PathVariable BudgetStatus status
    ) {

        return ResponseEntity.ok(
                budgetService
                        .getInstitutionBudgetsByStatus(
                                institutionId,
                                status
                        )
        );
    }


    // =========================================================
    // FINANCIAL YEAR + STATUS
    // =========================================================

    @GetMapping(
            "/financial-year/{financialYear}/status/{status}"
    )
    public ResponseEntity<List<Budget>>
    getBudgetsByFinancialYearAndStatus(
            @PathVariable String financialYear,
            @PathVariable BudgetStatus status
    ) {

        return ResponseEntity.ok(
                budgetService
                        .getBudgetsByFinancialYearAndStatus(
                                financialYear,
                                status
                        )
        );
    }


    // =========================================================
    // DEPARTMENT + FINANCIAL YEAR
    // =========================================================

    @GetMapping(
            "/department/{departmentId}/financial-year/{financialYear}"
    )
    public ResponseEntity<Budget>
    getDepartmentBudgetForYear(
            @PathVariable Long departmentId,
            @PathVariable String financialYear
    ) {

        return ResponseEntity.ok(
                budgetService
                        .getDepartmentBudgetForYear(
                                departmentId,
                                financialYear
                        )
        );
    }


    // =========================================================
    // INSTITUTION + FINANCIAL YEAR
    // =========================================================

    @GetMapping(
            "/institution/{institutionId}/financial-year/{financialYear}"
    )
    public ResponseEntity<Budget>
    getInstitutionBudgetForYear(
            @PathVariable Long institutionId,
            @PathVariable String financialYear
    ) {

        return ResponseEntity.ok(
                budgetService
                        .getInstitutionBudgetForYear(
                                institutionId,
                                financialYear
                        )
        );
    }


    // =========================================================
    // CALCULATE REMAINING
    // =========================================================

    @GetMapping("/{id}/remaining")
    public ResponseEntity<Double>
    calculateRemainingBudget(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                budgetService
                        .calculateRemainingBudget(id)
        );
    }


    // =========================================================
    // CALCULATE UTILIZATION
    // =========================================================

    @GetMapping("/{id}/utilization")
    public ResponseEntity<Double>
    calculateUtilization(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                budgetService
                        .calculateUtilizationPercentage(id)
        );
    }


    // =========================================================
    // CALCULATE REMAINING FROM AMOUNTS
    // =========================================================

    @GetMapping("/calculate-remaining")
    public ResponseEntity<Double>
    calculateRemainingFromAmounts(
            @RequestParam Double allocatedAmount,
            @RequestParam Double utilizedAmount
    ) {

        return ResponseEntity.ok(
                budgetService.calculateRemainingBudget(
                        allocatedAmount,
                        utilizedAmount
                )
        );
    }


    // =========================================================
    // UPDATE USED AMOUNT
    // =========================================================

    @PatchMapping("/{id}/used-amount")
    public ResponseEntity<Budget>
    updateUsedAmount(
            @PathVariable Long id,
            @RequestParam Double usedAmount
    ) {

        return ResponseEntity.ok(
                budgetService.updateUsedAmount(
                        id,
                        usedAmount
                )
        );
    }


    // =========================================================
    // UPDATE UTILIZED AMOUNT
    // =========================================================

    @PatchMapping("/{id}/utilized-amount")
    public ResponseEntity<Budget>
    updateUtilizedAmount(
            @PathVariable Long id,
            @RequestParam Double utilizedAmount
    ) {

        return ResponseEntity.ok(
                budgetService.updateUtilizedAmount(
                        id,
                        utilizedAmount
                )
        );
    }


    // =========================================================
    // ADD USED AMOUNT
    // =========================================================

    @PatchMapping("/{id}/add-used-amount")
    public ResponseEntity<Budget>
    addUsedAmount(
            @PathVariable Long id,
            @RequestParam Double amount
    ) {

        return ResponseEntity.ok(
                budgetService.addUsedAmount(
                        id,
                        amount
                )
        );
    }


    // =========================================================
    // UPDATE STATUS
    // =========================================================

    @PatchMapping("/{id}/status")
    public ResponseEntity<Budget>
    updateBudgetStatus(
            @PathVariable Long id,
            @RequestParam BudgetStatus status
    ) {

        return ResponseEntity.ok(
                budgetService.updateBudgetStatus(
                        id,
                        status
                )
        );
    }


    // =========================================================
    // MARK AS EXHAUSTED
    // =========================================================

    @PatchMapping("/{id}/mark-exhausted")
    public ResponseEntity<Budget>
    markAsExhausted(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                budgetService.markAsExhausted(id)
        );
    }


    // =========================================================
    // DELETE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @PathVariable Long id
    ) {

        budgetService.deleteBudget(id);

        return ResponseEntity.noContent().build();
    }
}