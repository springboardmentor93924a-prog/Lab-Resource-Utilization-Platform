package com.example.lab_platform.service.impl;

import com.example.lab_platform.dto.BudgetRequestDTO;
import com.example.lab_platform.dto.BudgetUtilizationDTO;
import com.example.lab_platform.entity.Budget;
import com.example.lab_platform.entity.Department;
import com.example.lab_platform.entity.DepartmentCostAllocation;
import com.example.lab_platform.entity.EquipmentUsageCost;
import com.example.lab_platform.entity.Institution;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.BudgetRepository;
import com.example.lab_platform.repository.DepartmentCostAllocationRepository;
import com.example.lab_platform.repository.DepartmentRepository;
import com.example.lab_platform.repository.EquipmentUsageCostRepository;
import com.example.lab_platform.repository.InstitutionRepository;
import com.example.lab_platform.service.BudgetService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final DepartmentCostAllocationRepository allocationRepository;
    private final EquipmentUsageCostRepository usageCostRepository;

    public BudgetServiceImpl(
            BudgetRepository budgetRepository,
            InstitutionRepository institutionRepository,
            DepartmentRepository departmentRepository,
            DepartmentCostAllocationRepository allocationRepository,
            EquipmentUsageCostRepository usageCostRepository) {

        this.budgetRepository = budgetRepository;
        this.institutionRepository = institutionRepository;
        this.departmentRepository = departmentRepository;
        this.allocationRepository = allocationRepository;
        this.usageCostRepository = usageCostRepository;
    }

    // Same institution-scoping rule used across the cost module:
    // SYSTEM_ADMIN sees everything, everyone else only their own
    // institution's data.
    private Integer scopedInstitutionIdOrNull() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return null;
        }

        User loggedInUser = (User) authentication.getPrincipal();
        String role = loggedInUser.getRole() != null
                ? loggedInUser.getRole().getRoleName()
                : null;

        if ("SYSTEM_ADMIN".equalsIgnoreCase(role)) {
            return null;
        }

        return loggedInUser.getInstitution() != null
                ? loggedInUser.getInstitution().getInstitutionId()
                : -1;
    }

    @Override
    public BudgetUtilizationDTO createBudget(BudgetRequestDTO request) {

        Institution institution = resolveCallerInstitution();

        validateRequest(request);

        Budget budget = new Budget();
        budget.setInstitution(institution);

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found."));
            budget.setDepartment(department);
        }

        budget.setPeriodStart(request.getPeriodStart());
        budget.setPeriodEnd(request.getPeriodEnd());
        budget.setBudgetAmount(request.getBudgetAmount());
        budget.setNotes(request.getNotes());

        budget = budgetRepository.save(budget);

        return toUtilizationDTO(budget);
    }

    @Override
    public List<BudgetUtilizationDTO> getAllBudgets() {

        Integer scopedInstitutionId = scopedInstitutionIdOrNull();

        return budgetRepository.findAll().stream()
                .filter(b -> scopedInstitutionId == null
                        || (b.getInstitution() != null
                            && scopedInstitutionId.equals(b.getInstitution().getInstitutionId())))
                .map(this::toUtilizationDTO)
                .sorted(Comparator.comparing(BudgetUtilizationDTO::getPeriodStart,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    @Override
    public BudgetUtilizationDTO getBudgetUtilization(Integer budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found."));
        return toUtilizationDTO(budget);
    }

    @Override
    public BudgetUtilizationDTO updateBudget(Integer budgetId, BudgetRequestDTO request) {

        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found."));

        validateRequest(request);

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found."));
            budget.setDepartment(department);
        } else {
            budget.setDepartment(null);
        }

        budget.setPeriodStart(request.getPeriodStart());
        budget.setPeriodEnd(request.getPeriodEnd());
        budget.setBudgetAmount(request.getBudgetAmount());
        budget.setNotes(request.getNotes());

        budget = budgetRepository.save(budget);

        return toUtilizationDTO(budget);
    }

    @Override
    public void deleteBudget(Integer budgetId) {
        if (!budgetRepository.existsById(budgetId)) {
            throw new RuntimeException("Budget not found.");
        }
        budgetRepository.deleteById(budgetId);
    }

    // =========================================================
    // Helpers
    // =========================================================
    // Every account (including SYSTEM_ADMIN) is tied to a home
    // institution at registration - a new budget always attaches to
    // the caller's own institution, regardless of how broadly their
    // role can later read across institutions.
    private Institution resolveCallerInstitution() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            throw new RuntimeException("Could not resolve the logged-in user.");
        }

        User loggedInUser = (User) authentication.getPrincipal();

        if (loggedInUser.getInstitution() == null) {
            throw new RuntimeException("Your account has no institution to attach this budget to.");
        }

        Integer institutionId = loggedInUser.getInstitution().getInstitutionId();

        return institutionRepository.findById(institutionId)
                .orElseThrow(() -> new RuntimeException("Institution not found."));
    }

    private void validateRequest(BudgetRequestDTO request) {
        if (request.getPeriodStart() == null || request.getPeriodEnd() == null) {
            throw new RuntimeException("Budget period start and end are required.");
        }
        if (request.getPeriodEnd().isBefore(request.getPeriodStart())) {
            throw new RuntimeException("Budget period end cannot be before period start.");
        }
        if (request.getBudgetAmount() == null || request.getBudgetAmount() < 0) {
            throw new RuntimeException("Budget amount must be a non-negative number.");
        }
    }

    private BudgetUtilizationDTO toUtilizationDTO(Budget budget) {

        double spent = budget.getDepartment() != null
                ? spentForDepartment(budget)
                : spentForInstitution(budget);

        double amount = budget.getBudgetAmount() != null ? budget.getBudgetAmount() : 0.0;
        double remaining = round(amount - spent);
        double percentUsed = amount > 0 ? round((spent / amount) * 100.0) : 0.0;

        BudgetUtilizationDTO dto = new BudgetUtilizationDTO();
        dto.setBudgetId(budget.getBudgetId());
        dto.setScopeLabel(budget.getDepartment() != null
                ? budget.getDepartment().getDepartmentName()
                : (budget.getInstitution() != null
                    ? budget.getInstitution().getInstitutionName() + " (institution-wide)"
                    : "Unknown"));
        dto.setPeriodStart(budget.getPeriodStart());
        dto.setPeriodEnd(budget.getPeriodEnd());
        dto.setBudgetAmount(amount);
        dto.setSpentAmount(round(spent));
        dto.setRemainingAmount(remaining);
        dto.setPercentUsed(percentUsed);
        dto.setOverBudget(spent > amount);
        dto.setNotes(budget.getNotes());

        return dto;
    }

    private double spentForDepartment(Budget budget) {

        Integer departmentId = budget.getDepartment().getDepartmentId();
        LocalDate start = budget.getPeriodStart();
        LocalDate end = budget.getPeriodEnd();

        return allocationRepository.findByDepartment_DepartmentId(departmentId).stream()
                .filter(a -> a.getAllocationDate() != null
                        && !a.getAllocationDate().isBefore(start)
                        && !a.getAllocationDate().isAfter(end))
                .mapToDouble(a -> a.getAllocatedAmount() != null ? a.getAllocatedAmount() : 0.0)
                .sum();
    }

    private double spentForInstitution(Budget budget) {

        Integer institutionId = budget.getInstitution() != null
                ? budget.getInstitution().getInstitutionId()
                : null;

        if (institutionId == null) {
            return 0.0;
        }

        LocalDate start = budget.getPeriodStart();
        LocalDate end = budget.getPeriodEnd();

        return usageCostRepository.findAll().stream()
                .filter(c -> c.getEquipment() != null
                        && c.getEquipment().getInstitution() != null
                        && institutionId.equals(c.getEquipment().getInstitution().getInstitutionId()))
                .filter(c -> c.getUsageEnd() != null
                        && !c.getUsageEnd().toLocalDate().isBefore(start)
                        && !c.getUsageEnd().toLocalDate().isAfter(end))
                .mapToDouble(c -> c.getTotalCost() != null ? c.getTotalCost() : 0.0)
                .sum();
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}