package com.labresource.backend.billing.controller;

import com.labresource.backend.billing.entity.Invoice;
import com.labresource.backend.billing.service.BillingService;
import com.labresource.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @GetMapping("/invoices")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_SYSTEM_ADMIN')")
    public List<Invoice> getInvoices(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long departmentId) {
        if (departmentId != null) {
            return billingService.getDepartmentInvoices(departmentId);
        }
        return billingService.getInstitutionInvoices(principal.getInstitutionId());
    }
}
