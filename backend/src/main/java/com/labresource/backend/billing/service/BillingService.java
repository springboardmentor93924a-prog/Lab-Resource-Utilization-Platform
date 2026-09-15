package com.labresource.backend.billing.service;

import com.labresource.backend.billing.dto.CostRecordDto;
import com.labresource.backend.billing.dto.CostSummaryDto;
import com.labresource.backend.billing.entity.CostRecord;
import com.labresource.backend.billing.entity.Invoice;
import com.labresource.backend.billing.repository.CostRecordRepository;
import com.labresource.backend.billing.repository.InvoiceRepository;
import com.labresource.backend.budget.entity.Budget;
import com.labresource.backend.budget.repository.BudgetRepository;
import com.labresource.backend.budget.util.FiscalYearUtil;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.department.entity.Department;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.repository.EquipmentRepository;
import com.labresource.backend.institution.entity.Institution;
import com.labresource.backend.institution.repository.InstitutionRepository;
import com.labresource.backend.laboratory.entity.Laboratory;
import com.labresource.backend.laboratory.repository.LaboratoryRepository;
import com.labresource.backend.notification.service.NotificationService;
import com.labresource.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillingService {

    private final CostRecordRepository costRecordRepository;
    private final InvoiceRepository invoiceRepository;
    private final BudgetRepository budgetRepository;
    private final NotificationService notificationService;
    private final EquipmentRepository equipmentRepository;
    private final DepartmentRepository departmentRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final InstitutionRepository institutionRepository;

    @Transactional
    public CostRecord recordCost(Long bookingId, Long equipmentId, Long departmentId, Long institutionId,
                                 BigDecimal amount, String costType) {
        return recordCostWithDetails(bookingId, null, null, equipmentId, departmentId, institutionId, amount, costType);
    }

    @Transactional
    public CostRecord recordCostWithDetails(Long bookingId, Long maintenanceId, Long sharingAgreementId,
                                            Long equipmentId, Long departmentId, Long institutionId,
                                            BigDecimal amount, String costType) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            log.info("Cost amount is zero or null. Skipping cost recording.");
            return null;
        }

        // ── Idempotency Checks ────────────────────────────────────────────────
        if (bookingId != null && costType != null) {
            Optional<CostRecord> existing = costRecordRepository.findByBookingIdAndCostType(bookingId, costType);
            if (existing.isPresent()) {
                log.info("CostRecord already exists for booking ID {} and type {}. Skipping duplicate recording.", bookingId, costType);
                return existing.get();
            }
        }
        if (maintenanceId != null) {
            Optional<CostRecord> existing = costRecordRepository.findByMaintenanceId(maintenanceId);
            if (existing.isPresent()) {
                log.info("CostRecord already exists for maintenance ID {}. Skipping duplicate recording.", maintenanceId);
                return existing.get();
            }
        }

        String currentFiscalYear = FiscalYearUtil.getCurrentFiscalYear();

        log.info("Recording billing cost of {} INR ({}) for booking: {}, maintenance: {}, agreement: {}",
                amount, costType, bookingId, maintenanceId, sharingAgreementId);

        CostRecord cost = new CostRecord();
        cost.setEquipmentId(equipmentId);
        cost.setDepartmentId(departmentId);
        cost.setInstitutionId(institutionId);
        cost.setBookingId(bookingId);
        cost.setMaintenanceId(maintenanceId);
        cost.setSharingAgreementId(sharingAgreementId);
        cost.setCostType(costType != null ? costType : "USAGE");
        cost.setAmount(amount);
        cost.setCurrency("INR");
        cost.setBillingPeriod(currentFiscalYear);

        CostRecord savedCost = costRecordRepository.save(cost);

        // ── Budget Ledger Update ──────────────────────────────────────────────
        // Internal usage and maintenance costs deduct from department expenditure budget.
        // Inter-institution SHARING_FEE represents provider revenue and does NOT deduct from provider department budget.
        if (!"SHARING_FEE".equalsIgnoreCase(costType) && !"SHARING".equalsIgnoreCase(costType) && !"DAMAGE_CHARGE".equalsIgnoreCase(costType)) {
            budgetRepository.findByDepartmentIdAndFiscalYear(departmentId, currentFiscalYear).ifPresent(budget -> {
                BigDecimal newUsed = budget.getUsedAmount().add(amount);
                budget.setUsedAmount(newUsed);
                // Clamp remainingAmount to max(0) to satisfy PostgreSQL chk_budget_amounts constraint
                budget.setRemainingAmount(budget.getAllocatedAmount().subtract(newUsed).max(BigDecimal.ZERO));
                budgetRepository.save(budget);

                // Check budget threshold alerts (e.g. 80%)
                BigDecimal limit = budget.getAllocatedAmount();
                if (limit.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal usagePct = newUsed.multiply(BigDecimal.valueOf(100)).divide(limit, 2, RoundingMode.HALF_UP);
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

        return savedCost;
    }

    public List<Invoice> getDepartmentInvoices(Long departmentId) {
        return invoiceRepository.findByDepartmentId(departmentId);
    }

    public List<Invoice> getInstitutionInvoices(Long institutionId) {
        return invoiceRepository.findByInstitutionId(institutionId);
    }

    // ── Cost Records Search & History API ──────────────────────────────────────

    public List<CostRecordDto> getCostRecords(UserPrincipal principal, Long targetDepartmentId, String costTypeFilter, String fiscalYearFilter) {
        boolean isSysAdmin = principal.getRoleNames().contains("ROLE_SYSTEM_ADMIN") || principal.getRoleNames().contains("SYSTEM_ADMIN");
        boolean isInstAdmin = principal.getRoleNames().contains("ROLE_INSTITUTION_ADMIN") || principal.getRoleNames().contains("INSTITUTION_ADMIN");

        List<CostRecord> raw;

        if (isSysAdmin) {
            if (targetDepartmentId != null) {
                raw = costRecordRepository.findByDepartmentId(targetDepartmentId);
            } else {
                raw = costRecordRepository.findAll();
            }
        } else if (isInstAdmin) {
            if (targetDepartmentId != null) {
                Department dept = departmentRepository.findById(targetDepartmentId)
                        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Department not found."));
                if (!dept.getInstitutionId().equals(principal.getInstitutionId())) {
                    throw new ApiException(HttpStatus.FORBIDDEN, "Access denied to department outside your institution.");
                }
                raw = costRecordRepository.findByDepartmentId(targetDepartmentId);
            } else {
                raw = costRecordRepository.findByInstitutionId(principal.getInstitutionId());
            }
        } else {
            // Department Head or Researcher
            Long deptId = principal.getDepartmentId();
            if (deptId == null) {
                return List.of();
            }
            raw = costRecordRepository.findByDepartmentId(deptId);
        }

        // Apply filters
        String fy = (fiscalYearFilter != null && !fiscalYearFilter.isBlank()) ? fiscalYearFilter : null;
        String type = (costTypeFilter != null && !costTypeFilter.isBlank() && !"ALL".equalsIgnoreCase(costTypeFilter)) ? costTypeFilter.toUpperCase() : null;

        return raw.stream()
                .filter(c -> fy == null || fy.equalsIgnoreCase(c.getBillingPeriod()))
                .filter(c -> type == null || type.equalsIgnoreCase(c.getCostType()))
                .sorted(Comparator.comparing(CostRecord::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapToDto)
                .toList();
    }

    // ── Cost Summary & Analytics API ─────────────────────────────────────────

    public CostSummaryDto getCostSummary(UserPrincipal principal, Long targetDepartmentId, String fiscalYearParam) {
        boolean isSysAdmin = principal.getRoleNames().contains("ROLE_SYSTEM_ADMIN") || principal.getRoleNames().contains("SYSTEM_ADMIN");
        boolean isInstAdmin = principal.getRoleNames().contains("ROLE_INSTITUTION_ADMIN") || principal.getRoleNames().contains("INSTITUTION_ADMIN");

        String fy = (fiscalYearParam != null && !fiscalYearParam.isBlank()) ? fiscalYearParam : FiscalYearUtil.getCurrentFiscalYear();

        Long deptId = null;
        Long instId = principal.getInstitutionId();

        if (!isSysAdmin && !isInstAdmin) {
            deptId = principal.getDepartmentId();
            if (deptId == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Department ID is missing for your user account.");
            }
        } else if (targetDepartmentId != null) {
            if (isInstAdmin) {
                Department dept = departmentRepository.findById(targetDepartmentId)
                        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Department not found."));
                if (!dept.getInstitutionId().equals(principal.getInstitutionId())) {
                    throw new ApiException(HttpStatus.FORBIDDEN, "Access denied. Department does not belong to your institution.");
                }
            }
            deptId = targetDepartmentId;
        }

        // 1. Fetch Budget details
        BigDecimal allocated = BigDecimal.ZERO;
        BigDecimal used = BigDecimal.ZERO;
        String warningStatus = "NORMAL";
        String departmentName = "All Departments";

        if (deptId != null) {
            Department dept = departmentRepository.findById(deptId).orElse(null);
            if (dept != null) {
                departmentName = dept.getName();
            }
            Optional<Budget> budgetOpt = budgetRepository.findByDepartmentIdAndFiscalYear(deptId, fy);
            if (budgetOpt.isPresent()) {
                Budget b = budgetOpt.get();
                allocated = b.getAllocatedAmount() != null ? b.getAllocatedAmount() : BigDecimal.ZERO;
                used = b.getUsedAmount() != null ? b.getUsedAmount() : BigDecimal.ZERO;
            }
        } else if (instId != null) {
            List<Budget> budgets = budgetRepository.findByInstitutionIdAndFiscalYear(instId, fy);
            for (Budget b : budgets) {
                allocated = allocated.add(b.getAllocatedAmount() != null ? b.getAllocatedAmount() : BigDecimal.ZERO);
                used = used.add(b.getUsedAmount() != null ? b.getUsedAmount() : BigDecimal.ZERO);
            }
        }

        BigDecimal remaining = allocated.subtract(used);
        BigDecimal pct = BigDecimal.ZERO;
        if (allocated.compareTo(BigDecimal.ZERO) > 0) {
            pct = used.multiply(BigDecimal.valueOf(100)).divide(allocated, 2, RoundingMode.HALF_UP);
        }

        double pctVal = pct.doubleValue();
        if (pctVal >= 100.0) warningStatus = "EXCEEDED";
        else if (pctVal >= 90.0) warningStatus = "CRITICAL";
        else if (pctVal >= 80.0) warningStatus = "WARNING";
        else if (pctVal >= 70.0) warningStatus = "WATCH";

        // 2. Fetch Cost Records
        List<CostRecord> records;
        if (deptId != null) {
            records = costRecordRepository.findByDepartmentId(deptId);
        } else if (instId != null) {
            records = costRecordRepository.findByInstitutionId(instId);
        } else {
            records = costRecordRepository.findAll();
        }

        // Filter by Fiscal Year
        records = records.stream()
                .filter(c -> fy.equalsIgnoreCase(c.getBillingPeriod()))
                .toList();

        BigDecimal usageCost = BigDecimal.ZERO;
        BigDecimal maintenanceCost = BigDecimal.ZERO;
        BigDecimal damageCharge = BigDecimal.ZERO;
        BigDecimal sharingFee = BigDecimal.ZERO;

        Map<Long, BigDecimal> eqSpendMap = new HashMap<>();
        Map<Long, Long> eqCountMap = new HashMap<>();
        Map<String, BigDecimal> monthlyMap = new LinkedHashMap<>();

        for (CostRecord c : records) {
            BigDecimal amt = c.getAmount() != null ? c.getAmount() : BigDecimal.ZERO;
            String type = c.getCostType() != null ? c.getCostType().toUpperCase() : "USAGE";

            switch (type) {
                case "USAGE" -> usageCost = usageCost.add(amt);
                case "MAINTENANCE" -> maintenanceCost = maintenanceCost.add(amt);
                case "DAMAGE_CHARGE" -> damageCharge = damageCharge.add(amt);
                case "SHARING_FEE" -> sharingFee = sharingFee.add(amt);
                default -> usageCost = usageCost.add(amt);
            }

            if (c.getEquipmentId() != null) {
                eqSpendMap.put(c.getEquipmentId(), eqSpendMap.getOrDefault(c.getEquipmentId(), BigDecimal.ZERO).add(amt));
                eqCountMap.put(c.getEquipmentId(), eqCountMap.getOrDefault(c.getEquipmentId(), 0L) + 1);
            }

            if (c.getCreatedAt() != null) {
                String mName = c.getCreatedAt().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
                monthlyMap.put(mName, monthlyMap.getOrDefault(mName, BigDecimal.ZERO).add(amt));
            }
        }

        // Build spending by equipment
        List<CostSummaryDto.ItemSpendDto> eqSpendList = eqSpendMap.entrySet().stream()
                .map(e -> {
                    String name = equipmentRepository.findById(e.getKey()).map(Equipment::getName).orElse("Equipment #" + e.getKey());
                    return new CostSummaryDto.ItemSpendDto(e.getKey(), name, e.getValue(), eqCountMap.getOrDefault(e.getKey(), 0L));
                })
                .sorted(Comparator.comparing(CostSummaryDto.ItemSpendDto::getAmount, Comparator.reverseOrder()))
                .limit(10)
                .toList();

        // Build spending by lab
        Map<Long, BigDecimal> labSpendMap = new HashMap<>();
        Map<Long, Long> labCountMap = new HashMap<>();
        for (CostRecord c : records) {
            if (c.getEquipmentId() != null) {
                Equipment eq = equipmentRepository.findById(c.getEquipmentId()).orElse(null);
                if (eq != null && eq.getLabId() != null) {
                    BigDecimal amt = c.getAmount() != null ? c.getAmount() : BigDecimal.ZERO;
                    labSpendMap.put(eq.getLabId(), labSpendMap.getOrDefault(eq.getLabId(), BigDecimal.ZERO).add(amt));
                    labCountMap.put(eq.getLabId(), labCountMap.getOrDefault(eq.getLabId(), 0L) + 1);
                }
            }
        }

        List<CostSummaryDto.ItemSpendDto> labSpendList = labSpendMap.entrySet().stream()
                .map(e -> {
                    String name = laboratoryRepository.findById(e.getKey()).map(Laboratory::getName).orElse("Laboratory #" + e.getKey());
                    return new CostSummaryDto.ItemSpendDto(e.getKey(), name, e.getValue(), labCountMap.getOrDefault(e.getKey(), 0L));
                })
                .sorted(Comparator.comparing(CostSummaryDto.ItemSpendDto::getAmount, Comparator.reverseOrder()))
                .limit(10)
                .toList();

        // Build monthly trend list
        List<CostSummaryDto.MonthlySpendDto> monthlyList = monthlyMap.entrySet().stream()
                .map(e -> new CostSummaryDto.MonthlySpendDto(e.getKey(), e.getValue()))
                .toList();

        return CostSummaryDto.builder()
                .fiscalYear(fy)
                .institutionId(instId)
                .departmentId(deptId)
                .departmentName(departmentName)
                .allocatedAmount(allocated)
                .usedAmount(used)
                .remainingAmount(remaining)
                .usedPercentage(pct)
                .warningStatus(warningStatus)
                .usageCost(usageCost)
                .maintenanceCost(maintenanceCost)
                .damageCharge(damageCharge)
                .sharingFee(sharingFee)
                .totalCostsCount(records.size())
                .spendingByEquipment(eqSpendList)
                .spendingByLab(labSpendList)
                .monthlyTrend(monthlyList)
                .build();
    }

    private CostRecordDto mapToDto(CostRecord c) {
        Equipment eq = c.getEquipmentId() != null ? equipmentRepository.findById(c.getEquipmentId()).orElse(null) : null;
        String eqName = eq != null ? eq.getName() : (c.getEquipmentId() != null ? "Equipment #" + c.getEquipmentId() : "N/A");
        String labName = (eq != null && eq.getLabId() != null) ? laboratoryRepository.findById(eq.getLabId()).map(Laboratory::getName).orElse(null) : null;
        String deptName = c.getDepartmentId() != null ? departmentRepository.findById(c.getDepartmentId()).map(Department::getName).orElse("Department") : "Department";
        String instName = c.getInstitutionId() != null ? institutionRepository.findById(c.getInstitutionId()).map(Institution::getName).orElse("Institution") : "Institution";

        return CostRecordDto.fromEntity(c, eqName, deptName, labName, instName);
    }
}
