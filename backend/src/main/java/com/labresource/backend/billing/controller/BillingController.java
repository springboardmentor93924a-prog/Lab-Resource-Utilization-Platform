package com.labresource.backend.billing.controller;

import com.labresource.backend.billing.dto.CostRecordDto;
import com.labresource.backend.billing.dto.CostSummaryDto;
import com.labresource.backend.billing.dto.InvoiceDto;
import com.labresource.backend.billing.service.BillingService;
import com.labresource.backend.billing.service.InvoiceService;
import com.labresource.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;
    private final InvoiceService invoiceService;

    @GetMapping("/invoices")
    @PreAuthorize("hasAnyAuthority('VIEW_INVOICES', 'VIEW_BILLING', 'ROLE_LAB_MANAGER', 'LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN', 'INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN', 'SYSTEM_ADMIN')")
    public List<InvoiceDto> getInvoices(@AuthenticationPrincipal UserPrincipal principal) {
        return invoiceService.getAccessibleInvoices(principal);
    }

    @GetMapping("/invoices/{id}")
    @PreAuthorize("hasAnyAuthority('VIEW_INVOICES', 'VIEW_BILLING', 'ROLE_LAB_MANAGER', 'LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN', 'INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN', 'SYSTEM_ADMIN')")
    public InvoiceDto getInvoiceById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return invoiceService.getInvoiceById(principal, id);
    }

    @PostMapping("/invoices/{id}/pay")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public InvoiceDto payInvoice(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return invoiceService.payInvoice(principal, id);
    }

    @GetMapping("/costs")
    @PreAuthorize("hasAnyAuthority('VIEW_BILLING', 'ROLE_LAB_MANAGER', 'LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN', 'INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN', 'SYSTEM_ADMIN')")
    public List<CostRecordDto> getCostRecords(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String costType,
            @RequestParam(required = false) String fiscalYear) {
        return billingService.getCostRecords(principal, departmentId, costType, fiscalYear);
    }

    @GetMapping("/costs/summary")
    @PreAuthorize("hasAnyAuthority('VIEW_BILLING', 'ROLE_LAB_MANAGER', 'LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN', 'INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN', 'SYSTEM_ADMIN')")
    public CostSummaryDto getCostSummary(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String fiscalYear) {
        return billingService.getCostSummary(principal, departmentId, fiscalYear);
    }
}
