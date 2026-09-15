package com.labresource.backend.budget.service;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.budget.dto.BudgetDto;
import com.labresource.backend.budget.dto.BudgetRequestDto;
import com.labresource.backend.budget.entity.Budget;
import com.labresource.backend.budget.entity.BudgetRequest;
import com.labresource.backend.budget.repository.BudgetRepository;
import com.labresource.backend.budget.repository.BudgetRequestRepository;
import com.labresource.backend.budget.util.FiscalYearUtil;
import com.labresource.backend.department.entity.Department;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.notification.service.NotificationService;
import com.labresource.backend.role.entity.Role;
import com.labresource.backend.security.UserPrincipal;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private BudgetRequestRepository budgetRequestRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private BudgetService budgetService;

    @Test
    public void testFiscalYearCalculation() {
        String fy = FiscalYearUtil.getFiscalYearForDate(LocalDate.of(2026, 9, 1));
        assertEquals("2026-2027", fy);

        String fyJan = FiscalYearUtil.getFiscalYearForDate(LocalDate.of(2027, 2, 15));
        assertEquals("2026-2027", fyJan);
    }

    @Test
    public void getDepartmentBudget_SingleSourceOfTruth() {
        AppUser user = new AppUser();
        user.setUserId(1L);
        user.setDepartmentId(10L);
        user.setInstitutionId(100L);
        user.setIsActive(true);

        Role role = new Role();
        role.setRoleName("ROLE_DEPARTMENT_HEAD");
        user.setRoles(Set.of(role));

        UserPrincipal principal = new UserPrincipal(user);

        Budget budget = new Budget();
        budget.setBudgetId(1L);
        budget.setInstitutionId(100L);
        budget.setDepartmentId(10L);
        budget.setFiscalYear("2026-2027");
        budget.setAllocatedAmount(BigDecimal.valueOf(1000000));
        budget.setUsedAmount(BigDecimal.valueOf(850000)); // 85% usage -> WARNING level

        Department dept = new Department();
        dept.setDepartmentId(10L);
        dept.setName("Mechanical Engineering");

        when(budgetRepository.findByDepartmentIdAndFiscalYear(10L, "2026-2027")).thenReturn(Optional.of(budget));
        when(departmentRepository.findById(10L)).thenReturn(Optional.of(dept));

        BudgetDto dto = budgetService.getDepartmentBudget(principal, null, "2026-2027");

        assertNotNull(dto);
        assertEquals(BigDecimal.valueOf(1000000), dto.getAllocatedAmount());
        assertEquals(BigDecimal.valueOf(850000), dto.getUsedAmount());
        assertEquals(BigDecimal.valueOf(150000), dto.getRemainingAmount());
        assertEquals("WARNING", dto.getWarningStatus());
    }

    @Test
    public void approveBudgetRequest_Success() {
        AppUser user = new AppUser();
        user.setUserId(99L);
        user.setInstitutionId(100L);
        user.setIsActive(true);

        Role role = new Role();
        role.setRoleName("ROLE_INSTITUTION_ADMIN");
        user.setRoles(Set.of(role));

        UserPrincipal admin = new UserPrincipal(user);

        BudgetRequest request = new BudgetRequest();
        request.setRequestId(5L);
        request.setDepartmentId(10L);
        request.setInstitutionId(100L);
        request.setFiscalYear("2026-2027");
        request.setRequestedAmount(BigDecimal.valueOf(200000));
        request.setReason("Equipment maintenance emergency");
        request.setStatus(BudgetRequest.PENDING);

        Budget budget = new Budget();
        budget.setBudgetId(1L);
        budget.setDepartmentId(10L);
        budget.setFiscalYear("2026-2027");
        budget.setAllocatedAmount(BigDecimal.valueOf(1000000));
        budget.setUsedAmount(BigDecimal.valueOf(400000));

        Department dept = new Department();
        dept.setDepartmentId(10L);
        dept.setName("ECE");

        when(budgetRequestRepository.findById(5L)).thenReturn(Optional.of(request));
        when(budgetRequestRepository.save(any(BudgetRequest.class))).thenAnswer(i -> i.getArgument(0));
        when(budgetRepository.findByDepartmentIdAndFiscalYear(10L, "2026-2027")).thenReturn(Optional.of(budget));
        when(departmentRepository.findById(10L)).thenReturn(Optional.of(dept));

        BudgetRequestDto dto = budgetService.approveBudgetRequest(admin, 5L, "Approved additional grant.");

        assertNotNull(dto);
        assertEquals("APPROVED", dto.getStatus());
        assertEquals(BigDecimal.valueOf(1200000), budget.getAllocatedAmount());
    }
}
