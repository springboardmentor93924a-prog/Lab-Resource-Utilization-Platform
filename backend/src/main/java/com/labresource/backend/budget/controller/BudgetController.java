package com.labresource.backend.budget.controller;

import com.labresource.backend.budget.dto.BudgetDto;
import com.labresource.backend.budget.service.BudgetService;
import com.labresource.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping("/department")
    @PreAuthorize("hasAnyAuthority('ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public BudgetDto getDepartmentBudget(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String fiscalYear) {
        return budgetService.getDepartmentBudget(principal, departmentId, fiscalYear);
    }

    @GetMapping("/institution")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public List<BudgetDto> getInstitutionBudgets(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String fiscalYear) {
        return budgetService.getInstitutionBudgets(principal, fiscalYear);
    }

    @PostMapping("/allocate")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public BudgetDto allocateDepartmentBudget(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam Long departmentId,
            @RequestParam BigDecimal allocatedAmount,
            @RequestParam(required = false) String fiscalYear) {
        return budgetService.allocateDepartmentBudget(principal, departmentId, allocatedAmount, fiscalYear);
    }
}
