package com.labresource.backend.billing.service;

import com.labresource.backend.billing.entity.CostRecord;
import com.labresource.backend.billing.repository.CostRecordRepository;
import com.labresource.backend.billing.repository.InvoiceRepository;
import com.labresource.backend.budget.entity.Budget;
import com.labresource.backend.budget.repository.BudgetRepository;
import com.labresource.backend.budget.util.FiscalYearUtil;
import com.labresource.backend.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @Mock
    private CostRecordRepository costRecordRepository;
    @Mock
    private InvoiceRepository invoiceRepository;
    @Mock
    private BudgetRepository budgetRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private BillingService billingService;

    private Budget budget;

    @BeforeEach
    void setUp() {
        budget = new Budget();
        budget.setBudgetId(1L);
        budget.setInstitutionId(1L);
        budget.setDepartmentId(10L);
        budget.setFiscalYear(FiscalYearUtil.getCurrentFiscalYear());
        budget.setAllocatedAmount(new BigDecimal("10000.00"));
        budget.setUsedAmount(new BigDecimal("2000.00"));
        budget.setRemainingAmount(new BigDecimal("8000.00"));
    }

    @Test
    @DisplayName("recordCost dynamically uses current fiscal year and updates budget for USAGE")
    void testRecordCostDynamicFiscalYear() {
        String activeFY = FiscalYearUtil.getCurrentFiscalYear();
        when(costRecordRepository.findByBookingIdAndCostType(50L, "USAGE")).thenReturn(Optional.empty());
        when(budgetRepository.findByDepartmentIdAndFiscalYear(10L, activeFY)).thenReturn(Optional.of(budget));
        when(costRecordRepository.save(any(CostRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CostRecord cost = billingService.recordCost(50L, 5L, 10L, 1L, new BigDecimal("1500.00"), "USAGE");

        assertNotNull(cost);
        assertEquals(activeFY, cost.getBillingPeriod());
        assertEquals(new BigDecimal("3500.00"), budget.getUsedAmount());
        assertEquals(new BigDecimal("6500.00"), budget.getRemainingAmount());
    }

    @Test
    @DisplayName("recordCost is idempotent for duplicate booking USAGE events")
    void testRecordCostIdempotency() {
        CostRecord existing = new CostRecord();
        existing.setCostId(99L);
        existing.setBookingId(50L);

        when(costRecordRepository.findByBookingIdAndCostType(50L, "USAGE")).thenReturn(Optional.of(existing));

        CostRecord result = billingService.recordCost(50L, 5L, 10L, 1L, new BigDecimal("1500.00"), "USAGE");

        assertNotNull(result);
        assertEquals(99L, result.getCostId());
        verify(costRecordRepository, never()).save(any(CostRecord.class));
        verify(budgetRepository, never()).save(any(Budget.class));
    }

    @Test
    @DisplayName("Inter-institution SHARING_FEE does not deduct from provider department budget")
    void testSharingFeeDoesNotDeductProviderBudget() {
        String activeFY = FiscalYearUtil.getCurrentFiscalYear();
        when(costRecordRepository.findByBookingIdAndCostType(60L, "SHARING_FEE")).thenReturn(Optional.empty());
        when(costRecordRepository.save(any(CostRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CostRecord cost = billingService.recordCostWithDetails(60L, null, 20L, 5L, 10L, 1L, new BigDecimal("600.00"), "SHARING_FEE");

        assertNotNull(cost);
        assertEquals("SHARING_FEE", cost.getCostType());
        verify(budgetRepository, never()).save(any(Budget.class));
    }
}
