package com.labresource.backend.budget.controller;

import com.labresource.backend.budget.dto.BudgetRequestDto;
import com.labresource.backend.budget.service.BudgetService;
import com.labresource.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/budget-requests")
@RequiredArgsConstructor
public class BudgetRequestController {

    private final BudgetService budgetService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public List<BudgetRequestDto> getBudgetRequests(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String status) {
        return budgetService.getBudgetRequests(principal, status);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_DEPARTMENT_HEAD', 'ROLE_SYSTEM_ADMIN')")
    public BudgetRequestDto submitBudgetRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam BigDecimal requestedAmount,
            @RequestParam String reason) {
        return budgetService.submitBudgetRequest(principal, requestedAmount, reason);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public BudgetRequestDto approveBudgetRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false) String comment) {
        return budgetService.approveBudgetRequest(principal, id, comment);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public BudgetRequestDto rejectBudgetRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false) String comment) {
        return budgetService.rejectBudgetRequest(principal, id, comment);
    }
}
