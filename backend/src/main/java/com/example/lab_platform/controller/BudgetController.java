package com.example.lab_platform.controller;

import com.example.lab_platform.dto.BudgetRequestDTO;
import com.example.lab_platform.dto.BudgetUtilizationDTO;
import com.example.lab_platform.service.BudgetService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    // Same nav rule as Cost Analysis (PDF Section 11): Institution
    // Admin owns budget management, System Admin left untouched.
    private static final String MANAGER_ROLES = """
        hasAnyRole(
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """;

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    @PreAuthorize(MANAGER_ROLES)
    public List<BudgetUtilizationDTO> getAllBudgets() {
        return budgetService.getAllBudgets();
    }

    @GetMapping("/{budgetId}/utilization")
    @PreAuthorize(MANAGER_ROLES)
    public BudgetUtilizationDTO getBudgetUtilization(@PathVariable Integer budgetId) {
        return budgetService.getBudgetUtilization(budgetId);
    }

    @PostMapping
    @PreAuthorize(MANAGER_ROLES)
    public BudgetUtilizationDTO createBudget(@RequestBody BudgetRequestDTO request) {
        return budgetService.createBudget(request);
    }

    @PutMapping("/{budgetId}")
    @PreAuthorize(MANAGER_ROLES)
    public BudgetUtilizationDTO updateBudget(
            @PathVariable Integer budgetId,
            @RequestBody BudgetRequestDTO request) {
        return budgetService.updateBudget(budgetId, request);
    }

    @DeleteMapping("/{budgetId}")
    @PreAuthorize(MANAGER_ROLES)
    public void deleteBudget(@PathVariable Integer budgetId) {
        budgetService.deleteBudget(budgetId);
    }
}