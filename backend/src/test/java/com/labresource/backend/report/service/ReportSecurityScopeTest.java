package com.labresource.backend.report.service;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.billing.repository.CostRecordRepository;
import com.labresource.backend.billing.repository.InvoiceRepository;
import com.labresource.backend.billing.service.BillingService;
import com.labresource.backend.budget.entity.Budget;
import com.labresource.backend.budget.repository.BudgetRepository;
import com.labresource.backend.budget.repository.BudgetRequestRepository;
import com.labresource.backend.budget.service.BudgetService;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.department.entity.Department;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.equipment.repository.EquipmentRepository;
import com.labresource.backend.institution.repository.InstitutionRepository;
import com.labresource.backend.laboratory.repository.LaboratoryRepository;
import com.labresource.backend.notification.service.NotificationService;
import com.labresource.backend.report.repository.ReportRepository;
import com.labresource.backend.role.entity.Role;
import com.labresource.backend.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReportSecurityScopeTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private BudgetRequestRepository budgetRequestRepository;

    @Mock
    private CostRecordRepository costRecordRepository;

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private LaboratoryRepository laboratoryRepository;

    @Mock
    private InstitutionRepository institutionRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ReportService reportService;

    @InjectMocks
    private BillingService billingService;

    @InjectMocks
    private BudgetService budgetService;

    private UserPrincipal adminInst6;
    private Department deptInst7;

    @BeforeEach
    public void setUp() {
        // Institution Admin for Institution 6
        AppUser user6 = new AppUser();
        user6.setUserId(60L);
        user6.setInstitutionId(6L);
        user6.setDepartmentId(null);
        Role adminRole = new Role();
        adminRole.setRoleName("ROLE_INSTITUTION_ADMIN");
        adminRole.setPermissions(Set.of());
        user6.setRoles(Set.of(adminRole));
        adminInst6 = new UserPrincipal(user6);

        // Department 99 belonging to Institution 7 (Cross-Institution target)
        deptInst7 = new Department();
        deptInst7.setDepartmentId(99L);
        deptInst7.setInstitutionId(7L);
        deptInst7.setName("Foreign EEE Department");
    }

    @Test
    public void testDepartmentPerformance_DeniesCrossInstitutionAccess() {
        when(departmentRepository.findById(99L)).thenReturn(Optional.of(deptInst7));

        ApiException ex = assertThrows(ApiException.class, () -> {
            reportService.getDepartmentPerformanceReport(adminInst6, LocalDate.now().minusDays(30), LocalDate.now(), 99L);
        });

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        assertTrue(ex.getMessage().contains("does not belong to your institution"));
    }

    @Test
    public void testGetReports_DeniesCrossInstitutionAccess() {
        when(departmentRepository.findById(99L)).thenReturn(Optional.of(deptInst7));

        ApiException ex = assertThrows(ApiException.class, () -> {
            reportService.getReports(adminInst6, 99L);
        });

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        assertTrue(ex.getMessage().contains("does not belong to your institution"));
    }

    @Test
    public void testCostSummary_DeniesCrossInstitutionAccess() {
        when(departmentRepository.findById(99L)).thenReturn(Optional.of(deptInst7));

        ApiException ex = assertThrows(ApiException.class, () -> {
            billingService.getCostSummary(adminInst6, 99L, "2026-2027");
        });

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        assertTrue(ex.getMessage().contains("does not belong to your institution"));
    }

    @Test
    public void testGetDepartmentBudget_DeniesCrossInstitutionAccess() {
        when(departmentRepository.findById(99L)).thenReturn(Optional.of(deptInst7));

        ApiException ex = assertThrows(ApiException.class, () -> {
            budgetService.getDepartmentBudget(adminInst6, 99L, "2026-2027");
        });

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        assertTrue(ex.getMessage().contains("does not belong to your institution"));
    }

    @Test
    public void testAllocateBudget_DeniesCrossInstitutionAccess() {
        when(departmentRepository.findById(99L)).thenReturn(Optional.of(deptInst7));

        ApiException ex = assertThrows(ApiException.class, () -> {
            budgetService.allocateDepartmentBudget(adminInst6, 99L, new BigDecimal("50000"), "2026-2027");
        });

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        assertTrue(ex.getMessage().contains("does not belong to your institution"));
    }
}
