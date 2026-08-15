package com.labresource.backend.billing.service;

import com.labresource.backend.billing.entity.CostRecord;
import com.labresource.backend.billing.entity.Invoice;
import com.labresource.backend.billing.repository.CostRecordRepository;
import com.labresource.backend.billing.repository.InvoiceRepository;
import com.labresource.backend.budget.entity.Budget;
import com.labresource.backend.budget.repository.BudgetRepository;
import com.labresource.backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillingService {

    private final CostRecordRepository costRecordRepository;
    private final InvoiceRepository invoiceRepository;
    private final BudgetRepository budgetRepository;
    private final NotificationService notificationService;

    @Transactional
    public void recordCost(Long bookingId, Long equipmentId, Long departmentId, Long institutionId,
                           BigDecimal amount, String costType) {
        log.info("Recording billing cost of {} INR for booking ID: {}", amount, bookingId);

        CostRecord cost = new CostRecord();
        cost.setEquipmentId(equipmentId);
        cost.setDepartmentId(departmentId);
        cost.setInstitutionId(institutionId);
        cost.setBookingId(bookingId);
        cost.setCostType(costType);
        cost.setAmount(amount);
        cost.setCurrency("INR");
        cost.setBillingPeriod(String.valueOf(LocalDate.now().getMonthValue()));
        costRecordRepository.save(cost);

        // Update Budget ledger
        String currentFiscalYear = "2026-2027"; // Mock current fiscal year
        budgetRepository.findByDepartmentIdAndFiscalYear(departmentId, currentFiscalYear).ifPresent(budget -> {
            BigDecimal newUsed = budget.getUsedAmount().add(amount);
            budget.setUsedAmount(newUsed);
            budget.setRemainingAmount(budget.getAllocatedAmount().subtract(newUsed));
            budgetRepository.save(budget);

            // Check budget threshold alerts
            BigDecimal limit = budget.getAllocatedAmount();
            if (limit.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal usagePct = newUsed.multiply(BigDecimal.valueOf(100)).divide(limit, 2, RoundingMode.HALF_UP);
                // Assume threshold is 80%
                if (usagePct.compareTo(BigDecimal.valueOf(80.0)) >= 0) {
                    notificationService.notifyDepartmentLabManagers(
                            departmentId,
                            "BUDGET_THRESHOLD_BREACH",
                            "Department Budget Warning",
                            "Your department's budget usage has reached " + usagePct + "% of the allocated limit."
                    );
                }
            }
        });
    }

    public List<Invoice> getDepartmentInvoices(Long departmentId) {
        return invoiceRepository.findByDepartmentId(departmentId);
    }

    public List<Invoice> getInstitutionInvoices(Long institutionId) {
        return invoiceRepository.findByInstitutionId(institutionId);
    }
}
