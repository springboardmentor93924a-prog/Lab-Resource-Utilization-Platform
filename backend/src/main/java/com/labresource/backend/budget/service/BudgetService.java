package com.labresource.backend.budget.service;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.auth.repository.AppUserRepository;
import com.labresource.backend.budget.dto.BudgetDto;
import com.labresource.backend.budget.dto.BudgetRequestDto;
import com.labresource.backend.budget.entity.Budget;
import com.labresource.backend.budget.entity.BudgetRequest;
import com.labresource.backend.budget.repository.BudgetRepository;
import com.labresource.backend.budget.repository.BudgetRequestRepository;
import com.labresource.backend.budget.util.FiscalYearUtil;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.department.entity.Department;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.notification.service.NotificationService;
import com.labresource.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final BudgetRequestRepository budgetRequestRepository;
    private final DepartmentRepository departmentRepository;
    private final AppUserRepository appUserRepository;
    private final NotificationService notificationService;

    // ── Department Budget Single Source of Truth ──────────────────────────────

    public BudgetDto getDepartmentBudget(UserPrincipal principal, Long departmentId, String fiscalYear) {
        boolean isSysAdmin = principal.getRoleNames().contains("ROLE_SYSTEM_ADMIN") || principal.getRoleNames().contains("SYSTEM_ADMIN");
        boolean isInstAdmin = principal.getRoleNames().contains("ROLE_INSTITUTION_ADMIN") || principal.getRoleNames().contains("INSTITUTION_ADMIN");

        Long targetDeptId;
        if (!isSysAdmin && !isInstAdmin) {
            targetDeptId = principal.getDepartmentId();
        } else if (departmentId != null) {
            if (isInstAdmin) {
                Department dept = departmentRepository.findById(departmentId)
                        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Department not found."));
                if (!dept.getInstitutionId().equals(principal.getInstitutionId())) {
                    throw new ApiException(HttpStatus.FORBIDDEN, "Access denied. Department does not belong to your institution.");
                }
            }
            targetDeptId = departmentId;
        } else {
            targetDeptId = principal.getDepartmentId();
        }

        if (targetDeptId == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Department ID is required.");
        }

        String targetFiscalYear = (fiscalYear != null && !fiscalYear.isBlank()) ? fiscalYear : FiscalYearUtil.getCurrentFiscalYear();

        Budget budget = budgetRepository.findByDepartmentIdAndFiscalYear(targetDeptId, targetFiscalYear)
                .orElseGet(() -> {
                    Budget b = new Budget();
                    b.setInstitutionId(principal.getInstitutionId());
                    b.setDepartmentId(targetDeptId);
                    b.setFiscalYear(targetFiscalYear);
                    b.setAllocatedAmount(BigDecimal.ZERO);
                    b.setUsedAmount(BigDecimal.ZERO);
                    b.setRemainingAmount(BigDecimal.ZERO);
                    return budgetRepository.save(b);
                });

        String deptName = departmentRepository.findById(targetDeptId).map(Department::getName).orElse("Department");
        return BudgetDto.fromEntity(budget, deptName);
    }

    public List<BudgetDto> getInstitutionBudgets(UserPrincipal principal, String fiscalYear) {
        Long instId = principal.getInstitutionId();
        String targetFiscalYear = (fiscalYear != null && !fiscalYear.isBlank()) ? fiscalYear : FiscalYearUtil.getCurrentFiscalYear();

        List<Budget> budgets = budgetRepository.findByInstitutionIdAndFiscalYear(instId, targetFiscalYear);
        List<Department> depts = departmentRepository.findByInstitutionId(instId);
        Map<Long, String> deptNames = depts.stream().collect(Collectors.toMap(Department::getDepartmentId, Department::getName));

        return budgets.stream()
                .filter(b -> b.getDepartmentId() != null)
                .map(b -> BudgetDto.fromEntity(b, deptNames.getOrDefault(b.getDepartmentId(), "Department #" + b.getDepartmentId())))
                .toList();
    }

    @Transactional
    public BudgetDto allocateDepartmentBudget(UserPrincipal principal, Long departmentId, BigDecimal allocatedAmount, String fiscalYear) {
        if (allocatedAmount == null || allocatedAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Allocated amount must be a valid non-negative value.");
        }

        boolean isInstAdmin = principal.getRoleNames().contains("ROLE_INSTITUTION_ADMIN") || principal.getRoleNames().contains("INSTITUTION_ADMIN");
        if (isInstAdmin) {
            Department dept = departmentRepository.findById(departmentId)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Department not found."));
            if (!dept.getInstitutionId().equals(principal.getInstitutionId())) {
                throw new ApiException(HttpStatus.FORBIDDEN, "Access denied. Department does not belong to your institution.");
            }
        }

        String targetFiscalYear = (fiscalYear != null && !fiscalYear.isBlank()) ? fiscalYear : FiscalYearUtil.getCurrentFiscalYear();

        Budget budget = budgetRepository.findByDepartmentIdAndFiscalYear(departmentId, targetFiscalYear)
                .orElseGet(() -> {
                    Budget b = new Budget();
                    b.setInstitutionId(principal.getInstitutionId());
                    b.setDepartmentId(departmentId);
                    b.setFiscalYear(targetFiscalYear);
                    b.setUsedAmount(BigDecimal.ZERO);
                    return b;
                });

        budget.setAllocatedAmount(allocatedAmount);
        budget.setRemainingAmount(allocatedAmount.subtract(budget.getUsedAmount()));

        Budget saved = budgetRepository.save(budget);
        String deptName = departmentRepository.findById(departmentId).map(Department::getName).orElse("Department");
        return BudgetDto.fromEntity(saved, deptName);
    }

    // ── Budget Request Workflow ───────────────────────────────────────────────

    @Transactional
    public BudgetRequestDto submitBudgetRequest(UserPrincipal principal, BigDecimal requestedAmount, String reason) {
        if (requestedAmount == null || requestedAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Requested amount must be greater than zero.");
        }
        if (reason == null || reason.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Reason for budget request is required.");
        }

        String fiscalYear = FiscalYearUtil.getCurrentFiscalYear();

        BudgetRequest req = new BudgetRequest();
        req.setDepartmentId(principal.getDepartmentId());
        req.setInstitutionId(principal.getInstitutionId());
        req.setFiscalYear(fiscalYear);
        req.setRequestedAmount(requestedAmount);
        req.setReason(reason);
        req.setRequestedBy(principal.getUserId());
        req.setStatus(BudgetRequest.PENDING);

        BudgetRequest saved = budgetRequestRepository.save(req);

        // Alert Institution Admins
        notificationService.notifyInstitutionAdmins(
                principal.getInstitutionId(),
                "BUDGET_REQUEST_SUBMITTED",
                "New Budget Request",
                "Department Head requested additional budget of INR " + requestedAmount + " for " + fiscalYear
        );

        String deptName = departmentRepository.findById(saved.getDepartmentId()).map(Department::getName).orElse("Department");
        String userNav = principal.getUsername();
        return BudgetRequestDto.fromEntity(saved, deptName, userNav, null);
    }

    @Transactional
    public BudgetRequestDto approveBudgetRequest(UserPrincipal principal, Long requestId, String comment) {
        BudgetRequest req = budgetRequestRepository.findById(requestId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Budget request not found."));

        if (!BudgetRequest.PENDING.equals(req.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Request is already " + req.getStatus());
        }

        req.setStatus(BudgetRequest.APPROVED);
        req.setReviewedBy(principal.getUserId());
        req.setReviewedAt(LocalDateTime.now());
        req.setReviewComment(comment);
        BudgetRequest savedReq = budgetRequestRepository.save(req);

        // Increase department allocation in Budget entity (Source of Truth)
        Budget budget = budgetRepository.findByDepartmentIdAndFiscalYear(req.getDepartmentId(), req.getFiscalYear())
                .orElseGet(() -> {
                    Budget b = new Budget();
                    b.setInstitutionId(req.getInstitutionId());
                    b.setDepartmentId(req.getDepartmentId());
                    b.setFiscalYear(req.getFiscalYear());
                    b.setAllocatedAmount(BigDecimal.ZERO);
                    b.setUsedAmount(BigDecimal.ZERO);
                    b.setRemainingAmount(BigDecimal.ZERO);
                    return b;
                });

        BigDecimal newAllocation = budget.getAllocatedAmount().add(req.getRequestedAmount());
        budget.setAllocatedAmount(newAllocation);
        budget.setRemainingAmount(newAllocation.subtract(budget.getUsedAmount()));
        budgetRepository.save(budget);

        // Notify Department Head
        notificationService.notifyDepartmentHeads(
                req.getDepartmentId(),
                "BUDGET_REQUEST_APPROVED",
                "Budget Request Approved",
                "Your request for additional budget of INR " + req.getRequestedAmount() + " has been approved!"
        );

        String deptName = departmentRepository.findById(req.getDepartmentId()).map(Department::getName).orElse("Department");
        return BudgetRequestDto.fromEntity(savedReq, deptName, "Dept Head", principal.getUsername());
    }

    @Transactional
    public BudgetRequestDto rejectBudgetRequest(UserPrincipal principal, Long requestId, String comment) {
        BudgetRequest req = budgetRequestRepository.findById(requestId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Budget request not found."));

        if (!BudgetRequest.PENDING.equals(req.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Request is already " + req.getStatus());
        }

        req.setStatus(BudgetRequest.REJECTED);
        req.setReviewedBy(principal.getUserId());
        req.setReviewedAt(LocalDateTime.now());
        req.setReviewComment(comment);
        BudgetRequest savedReq = budgetRequestRepository.save(req);

        notificationService.notifyDepartmentHeads(
                req.getDepartmentId(),
                "BUDGET_REQUEST_REJECTED",
                "Budget Request Rejected",
                "Your budget request was rejected. Comment: " + (comment != null ? comment : "N/A")
        );

        String deptName = departmentRepository.findById(req.getDepartmentId()).map(Department::getName).orElse("Department");
        return BudgetRequestDto.fromEntity(savedReq, deptName, "Dept Head", principal.getUsername());
    }

    public List<BudgetRequestDto> getBudgetRequests(UserPrincipal principal, String status) {
        List<BudgetRequest> list;
        if (principal.getRoleNames().contains("ROLE_INSTITUTION_ADMIN") || principal.getRoleNames().contains("ROLE_SYSTEM_ADMIN")) {
            list = status != null ? budgetRequestRepository.findByInstitutionIdAndStatusOrderByCreatedAtDesc(principal.getInstitutionId(), status)
                    : budgetRequestRepository.findByInstitutionIdOrderByCreatedAtDesc(principal.getInstitutionId());
        } else {
            list = budgetRequestRepository.findByDepartmentIdOrderByCreatedAtDesc(principal.getDepartmentId());
        }

        return list.stream()
                .map(r -> {
                    String dName = departmentRepository.findById(r.getDepartmentId()).map(Department::getName).orElse("Department");
                    String reqUser = appUserRepository.findById(r.getRequestedBy()).map(u -> u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "")).orElse("User");
                    String revUser = r.getReviewedBy() != null ? appUserRepository.findById(r.getReviewedBy()).map(u -> u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "")).orElse(null) : null;
                    return BudgetRequestDto.fromEntity(r, dName, reqUser, revUser);
                })
                .toList();
    }
}
