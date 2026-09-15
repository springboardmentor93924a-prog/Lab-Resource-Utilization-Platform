package com.labresource.backend.report.service;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.billing.entity.CostRecord;
import com.labresource.backend.billing.repository.CostRecordRepository;
import com.labresource.backend.billing.repository.InvoiceRepository;
import com.labresource.backend.booking.repository.BookingRepository;
import com.labresource.backend.budget.entity.Budget;
import com.labresource.backend.budget.repository.BudgetRepository;
import com.labresource.backend.calibration.repository.EquipmentCalibrationRepository;
import com.labresource.backend.certification.repository.EquipmentCertificationRepository;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.department.entity.Department;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.repository.EquipmentOperatingScheduleRepository;
import com.labresource.backend.equipment.repository.EquipmentRepository;
import com.labresource.backend.institution.entity.Institution;
import com.labresource.backend.institution.repository.InstitutionRepository;
import com.labresource.backend.issuereport.repository.EquipmentIssueReportRepository;
import com.labresource.backend.laboratory.entity.Laboratory;
import com.labresource.backend.laboratory.repository.LaboratoryRepository;
import com.labresource.backend.maintenance.repository.MaintenanceRequestRepository;
import com.labresource.backend.report.dto.CostAnalysisReportDto;
import com.labresource.backend.report.dto.UtilizationEffectivenessReportDto;
import com.labresource.backend.report.repository.ReportRepository;
import com.labresource.backend.role.entity.Role;
import com.labresource.backend.security.UserPrincipal;
import com.labresource.backend.sharing.repository.ResourceSharingRequestRepository;
import com.labresource.backend.sharing.repository.SharedBookingRepository;
import com.labresource.backend.sharing.repository.SharingAgreementRepository;
import com.labresource.backend.storage.StorageService;
import com.labresource.backend.utilization.entity.UtilizationMetric;
import com.labresource.backend.utilization.repository.UtilizationLogRepository;
import com.labresource.backend.utilization.repository.UtilizationMetricRepository;
import com.labresource.backend.auth.repository.AppUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class Milestone3ReportServiceTest {

    @Mock private ReportRepository reportRepository;
    @Mock private StorageService storageService;
    @Mock private EquipmentRepository equipmentRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private BookingRepository bookingRepository;
    @Mock private UtilizationMetricRepository utilizationMetricRepository;
    @Mock private UtilizationLogRepository utilizationLogRepository;
    @Mock private MaintenanceRequestRepository maintenanceRequestRepository;
    @Mock private EquipmentIssueReportRepository issueReportRepository;
    @Mock private EquipmentCalibrationRepository calibrationRepository;
    @Mock private EquipmentCertificationRepository certificationRepository;
    @Mock private SharedBookingRepository sharedBookingRepository;
    @Mock private SharingAgreementRepository sharingAgreementRepository;
    @Mock private ResourceSharingRequestRepository resourceSharingRequestRepository;
    @Mock private InvoiceRepository invoiceRepository;
    @Mock private InstitutionRepository institutionRepository;
    @Mock private AppUserRepository appUserRepository;
    @Mock private EquipmentOperatingScheduleRepository scheduleRepository;
    @Mock private CostRecordRepository costRecordRepository;
    @Mock private BudgetRepository budgetRepository;
    @Mock private LaboratoryRepository laboratoryRepository;

    @InjectMocks
    private ReportService reportService;

    private UserPrincipal labManagerPrincipal;
    private UserPrincipal deptHeadPrincipal;
    private UserPrincipal instAdminPrincipal;
    private UserPrincipal instAdmin7Principal;

    private Equipment equipment1;
    private Department dept10;
    private Department dept11;
    private Institution institution6;

    @BeforeEach
    void setUp() {
        labManagerPrincipal  = buildPrincipal(1L, 6L, 10L, "LAB_MANAGER");
        deptHeadPrincipal    = buildPrincipal(2L, 6L, 10L, "DEPARTMENT_HEAD");
        instAdminPrincipal   = buildPrincipal(3L, 6L, null, "INSTITUTION_ADMIN");
        instAdmin7Principal  = buildPrincipal(4L, 7L, null, "INSTITUTION_ADMIN");

        dept10 = new Department();
        dept10.setDepartmentId(10L);
        dept10.setInstitutionId(6L);
        dept10.setName("CSE");

        dept11 = new Department();
        dept11.setDepartmentId(11L);
        dept11.setInstitutionId(6L);
        dept11.setName("EEE");

        institution6 = new Institution();
        institution6.setInstitutionId(6L);
        institution6.setName("Test University");

        equipment1 = new Equipment();
        equipment1.setEquipmentId(100L);
        equipment1.setName("Oscilloscope");
        equipment1.setDepartmentId(10L);
        equipment1.setInstitutionId(6L);
        equipment1.setLabId(50L);
        equipment1.setStatus("AVAILABLE");
    }

    // ── UTILIZATION EFFECTIVENESS TESTS ─────────────────────────────────────

    @Test
    void utilizationReport_LabManager_ReturnsOwnDeptEquipmentOnly() {
        when(equipmentRepository.findByDepartmentIdAndInstitutionId(10L, 6L)).thenReturn(List.of(equipment1));
        when(utilizationMetricRepository.findByEquipmentIdInAndPeriodDateBetween(anyList(), any(), any())).thenReturn(Collections.emptyList());
        when(bookingRepository.findByEquipmentIdInAndStartTimeBetween(anyList(), any(), any())).thenReturn(Collections.emptyList());
        when(departmentRepository.findAll()).thenReturn(List.of(dept10));
        when(laboratoryRepository.findByDepartmentId(10L)).thenReturn(Collections.emptyList());
        when(institutionRepository.findById(6L)).thenReturn(Optional.of(institution6));
        when(utilizationLogRepository.findByEquipmentIdInAndUsageStartTimeAfter(anyList(), any())).thenReturn(Collections.emptyList());

        UtilizationEffectivenessReportDto result = reportService.getUtilizationEffectivenessReport(
                labManagerPrincipal, LocalDate.now().minusDays(7), LocalDate.now(), null, null);

        assertNotNull(result);
        assertEquals("UTILIZATION_EFFECTIVENESS", result.getMetadata().getReportType());
        assertEquals(1, result.getEquipmentUtilization().size());
        assertNull(result.getDepartmentComparison());
    }

    @Test
    void utilizationReport_DeptHead_DepartmentComparisonIsNull() {
        when(equipmentRepository.findByDepartmentIdAndInstitutionId(10L, 6L)).thenReturn(List.of(equipment1));
        when(utilizationMetricRepository.findByEquipmentIdInAndPeriodDateBetween(anyList(), any(), any())).thenReturn(Collections.emptyList());
        when(bookingRepository.findByEquipmentIdInAndStartTimeBetween(anyList(), any(), any())).thenReturn(Collections.emptyList());
        when(departmentRepository.findAll()).thenReturn(List.of(dept10));
        when(laboratoryRepository.findByDepartmentId(10L)).thenReturn(Collections.emptyList());
        when(institutionRepository.findById(6L)).thenReturn(Optional.of(institution6));
        when(utilizationLogRepository.findByEquipmentIdInAndUsageStartTimeAfter(anyList(), any())).thenReturn(Collections.emptyList());

        UtilizationEffectivenessReportDto result = reportService.getUtilizationEffectivenessReport(
                deptHeadPrincipal, LocalDate.now().minusDays(7), LocalDate.now(), null, null);

        assertNull(result.getDepartmentComparison());
    }

    @Test
    void utilizationReport_InstAdmin_PopulatesDepartmentComparison() {
        when(equipmentRepository.findByInstitutionId(6L)).thenReturn(List.of(equipment1));
        when(utilizationMetricRepository.findByEquipmentIdInAndPeriodDateBetween(anyList(), any(), any())).thenReturn(Collections.emptyList());
        when(bookingRepository.findByEquipmentIdInAndStartTimeBetween(anyList(), any(), any())).thenReturn(Collections.emptyList());
        when(departmentRepository.findAll()).thenReturn(List.of(dept10, dept11));
        when(laboratoryRepository.findByInstitutionIdAndIsActiveTrue(6L)).thenReturn(Collections.emptyList());
        when(institutionRepository.findById(6L)).thenReturn(Optional.of(institution6));
        when(utilizationLogRepository.findByEquipmentIdInAndUsageStartTimeAfter(anyList(), any())).thenReturn(Collections.emptyList());

        UtilizationEffectivenessReportDto result = reportService.getUtilizationEffectivenessReport(
                instAdminPrincipal, LocalDate.now().minusDays(7), LocalDate.now(), null, null);

        assertNotNull(result.getDepartmentComparison());
        assertFalse(result.getDepartmentComparison().isEmpty());
    }

    @Test
    void utilizationReport_EmptyEquipment_ZeroSummary() {
        when(equipmentRepository.findByDepartmentIdAndInstitutionId(10L, 6L)).thenReturn(Collections.emptyList());
        when(departmentRepository.findAll()).thenReturn(List.of(dept10));
        when(laboratoryRepository.findByDepartmentId(10L)).thenReturn(Collections.emptyList());
        when(institutionRepository.findById(6L)).thenReturn(Optional.of(institution6));

        UtilizationEffectivenessReportDto result = reportService.getUtilizationEffectivenessReport(
                labManagerPrincipal, LocalDate.now().minusDays(7), LocalDate.now(), null, null);

        assertEquals(0L, result.getSummary().getTotalEquipmentCount());
        assertEquals(0.0, result.getSummary().getTotalUsedHours());
        assertNull(result.getMostUtilizedEquipment());
    }

    @Test
    void utilizationReport_InvalidDateRange_ThrowsBadRequest() {
        ApiException ex = assertThrows(ApiException.class, () ->
                reportService.getUtilizationEffectivenessReport(labManagerPrincipal,
                        LocalDate.now(), LocalDate.now().minusDays(5), null, null));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void utilizationReport_FiftyPct_ClassifiedAsModerate() {
        UtilizationMetric m = buildMetric(100L, new BigDecimal("8.00"), new BigDecimal("4.00"), new BigDecimal("4.00"));
        when(equipmentRepository.findByDepartmentIdAndInstitutionId(10L, 6L)).thenReturn(List.of(equipment1));
        when(utilizationMetricRepository.findByEquipmentIdInAndPeriodDateBetween(anyList(), any(), any())).thenReturn(List.of(m));
        when(bookingRepository.findByEquipmentIdInAndStartTimeBetween(anyList(), any(), any())).thenReturn(Collections.emptyList());
        when(departmentRepository.findAll()).thenReturn(List.of(dept10));
        when(laboratoryRepository.findByDepartmentId(10L)).thenReturn(Collections.emptyList());
        when(institutionRepository.findById(6L)).thenReturn(Optional.of(institution6));
        when(utilizationLogRepository.findByEquipmentIdInAndUsageStartTimeAfter(anyList(), any())).thenReturn(Collections.emptyList());

        UtilizationEffectivenessReportDto result = reportService.getUtilizationEffectivenessReport(
                labManagerPrincipal, LocalDate.now().minusDays(7), LocalDate.now().minusDays(1), null, null);

        assertEquals("MODERATE", result.getEquipmentUtilization().get(0).getUtilizationStatus());
        assertEquals(50.0, result.getEquipmentUtilization().get(0).getUtilizationPercentage(), 0.01);
    }

    @Test
    void utilizationReport_TwentyPct_ClassifiedAsLowAndUnderutilized() {
        UtilizationMetric m = buildMetric(100L, new BigDecimal("10.00"), new BigDecimal("2.00"), new BigDecimal("8.00"));
        when(equipmentRepository.findByDepartmentIdAndInstitutionId(10L, 6L)).thenReturn(List.of(equipment1));
        when(utilizationMetricRepository.findByEquipmentIdInAndPeriodDateBetween(anyList(), any(), any())).thenReturn(List.of(m));
        when(bookingRepository.findByEquipmentIdInAndStartTimeBetween(anyList(), any(), any())).thenReturn(Collections.emptyList());
        when(departmentRepository.findAll()).thenReturn(List.of(dept10));
        when(laboratoryRepository.findByDepartmentId(10L)).thenReturn(Collections.emptyList());
        when(institutionRepository.findById(6L)).thenReturn(Optional.of(institution6));
        when(utilizationLogRepository.findByEquipmentIdInAndUsageStartTimeAfter(anyList(), any())).thenReturn(Collections.emptyList());

        UtilizationEffectivenessReportDto result = reportService.getUtilizationEffectivenessReport(
                labManagerPrincipal, LocalDate.now().minusDays(7), LocalDate.now().minusDays(1), null, null);

        assertEquals("LOW", result.getEquipmentUtilization().get(0).getUtilizationStatus());
        assertEquals(1, result.getUnderutilizedEquipment().size());
        assertEquals(0, result.getHighlyUtilizedEquipment().size());
    }

    @Test
    void utilizationReport_EightyPct_ClassifiedAsHighAndHighlyUtilized() {
        UtilizationMetric m = buildMetric(100L, new BigDecimal("10.00"), new BigDecimal("8.00"), new BigDecimal("2.00"));
        when(equipmentRepository.findByDepartmentIdAndInstitutionId(10L, 6L)).thenReturn(List.of(equipment1));
        when(utilizationMetricRepository.findByEquipmentIdInAndPeriodDateBetween(anyList(), any(), any())).thenReturn(List.of(m));
        when(bookingRepository.findByEquipmentIdInAndStartTimeBetween(anyList(), any(), any())).thenReturn(Collections.emptyList());
        when(departmentRepository.findAll()).thenReturn(List.of(dept10));
        when(laboratoryRepository.findByDepartmentId(10L)).thenReturn(Collections.emptyList());
        when(institutionRepository.findById(6L)).thenReturn(Optional.of(institution6));
        when(utilizationLogRepository.findByEquipmentIdInAndUsageStartTimeAfter(anyList(), any())).thenReturn(Collections.emptyList());

        UtilizationEffectivenessReportDto result = reportService.getUtilizationEffectivenessReport(
                labManagerPrincipal, LocalDate.now().minusDays(7), LocalDate.now().minusDays(1), null, null);

        assertEquals("HIGH", result.getEquipmentUtilization().get(0).getUtilizationStatus());
        assertEquals(1, result.getHighlyUtilizedEquipment().size());
        assertEquals(0, result.getUnderutilizedEquipment().size());
    }

    @Test
    void utilizationReport_7DayRange_GeneratesDailyTrend() {
        when(equipmentRepository.findByDepartmentIdAndInstitutionId(10L, 6L)).thenReturn(List.of(equipment1));
        when(utilizationMetricRepository.findByEquipmentIdInAndPeriodDateBetween(anyList(), any(), any())).thenReturn(Collections.emptyList());
        when(bookingRepository.findByEquipmentIdInAndStartTimeBetween(anyList(), any(), any())).thenReturn(Collections.emptyList());
        when(departmentRepository.findAll()).thenReturn(List.of(dept10));
        when(laboratoryRepository.findByDepartmentId(10L)).thenReturn(Collections.emptyList());
        when(institutionRepository.findById(6L)).thenReturn(Optional.of(institution6));
        when(utilizationLogRepository.findByEquipmentIdInAndUsageStartTimeAfter(anyList(), any())).thenReturn(Collections.emptyList());

        UtilizationEffectivenessReportDto result = reportService.getUtilizationEffectivenessReport(
                labManagerPrincipal, LocalDate.now().minusDays(6), LocalDate.now(), null, null);

        assertEquals(7, result.getUtilizationTrend().size());
        assertTrue(result.getUtilizationTrend().get(0).getPeriod().matches("\\d{4}-\\d{2}-\\d{2}"));
    }

    @Test
    void utilizationReport_60DayRange_GeneratesMonthlyTrend() {
        when(equipmentRepository.findByDepartmentIdAndInstitutionId(10L, 6L)).thenReturn(List.of(equipment1));
        when(utilizationMetricRepository.findByEquipmentIdInAndPeriodDateBetween(anyList(), any(), any())).thenReturn(Collections.emptyList());
        when(bookingRepository.findByEquipmentIdInAndStartTimeBetween(anyList(), any(), any())).thenReturn(Collections.emptyList());
        when(departmentRepository.findAll()).thenReturn(List.of(dept10));
        when(laboratoryRepository.findByDepartmentId(10L)).thenReturn(Collections.emptyList());
        when(institutionRepository.findById(6L)).thenReturn(Optional.of(institution6));
        when(utilizationLogRepository.findByEquipmentIdInAndUsageStartTimeAfter(anyList(), any())).thenReturn(Collections.emptyList());

        UtilizationEffectivenessReportDto result = reportService.getUtilizationEffectivenessReport(
                labManagerPrincipal, LocalDate.now().minusDays(60), LocalDate.now(), null, null);

        assertFalse(result.getUtilizationTrend().isEmpty());
        assertTrue(result.getUtilizationTrend().get(0).getPeriod().matches("\\d{4}-\\d{2}"));
    }

    // ── COST ANALYSIS TESTS ───────────────────────────────────────────────────

    @Test
    void costReport_LabManager_ReturnsDeptScopedCosts() {
        CostRecord cr = buildCostRecord(100L, 10L, 6L, "USAGE", new BigDecimal("500.00"));
        stubCostReportMocksForLabManager(List.of(cr));

        CostAnalysisReportDto result = reportService.getCostAnalysisReport(
                labManagerPrincipal, LocalDate.now().minusDays(30), LocalDate.now(), null, "2026-2027");

        assertEquals(new BigDecimal("500.00"), result.getSummary().getUsageCost());
        assertNull(result.getDepartmentComparison());
    }

    @Test
    void costReport_InstAdmin_PopulatesDepartmentComparison() {
        CostRecord cr1 = buildCostRecord(100L, 10L, 6L, "USAGE", new BigDecimal("300.00"));
        CostRecord cr2 = buildCostRecord(100L, 11L, 6L, "USAGE", new BigDecimal("200.00"));

        when(costRecordRepository.findByInstitutionIdAndCreatedAtBetween(eq(6L), any(), any())).thenReturn(List.of(cr1, cr2));
        when(equipmentRepository.findByInstitutionId(6L)).thenReturn(List.of(equipment1));
        when(departmentRepository.findAll()).thenReturn(List.of(dept10, dept11));
        when(laboratoryRepository.findByInstitutionIdAndIsActiveTrue(6L)).thenReturn(Collections.emptyList());
        when(institutionRepository.findById(6L)).thenReturn(Optional.of(institution6));
        when(budgetRepository.findByInstitutionIdAndFiscalYear(6L, "2026-2027")).thenReturn(Collections.emptyList());
        when(maintenanceRequestRepository.findByEquipmentIdIn(anyList())).thenReturn(Collections.emptyList());
        when(sharingAgreementRepository.findByEquipmentIdIn(anyList())).thenReturn(Collections.emptyList());

        CostAnalysisReportDto result = reportService.getCostAnalysisReport(
                instAdminPrincipal, LocalDate.now().minusDays(30), LocalDate.now(), null, "2026-2027");

        assertNotNull(result.getDepartmentComparison());
        assertEquals(2, result.getDepartmentComparison().size());
    }

    @Test
    void costReport_CrossInstitutionDept_ThrowsForbidden() {
        Department foreignDept = new Department();
        foreignDept.setDepartmentId(99L);
        foreignDept.setInstitutionId(6L); // inst 6, but attacker is inst 7

        when(costRecordRepository.findByInstitutionIdAndCreatedAtBetween(eq(7L), any(), any())).thenReturn(Collections.emptyList());
        when(departmentRepository.findById(99L)).thenReturn(Optional.of(foreignDept));

        ApiException ex = assertThrows(ApiException.class, () ->
                reportService.getCostAnalysisReport(instAdmin7Principal,
                        LocalDate.now().minusDays(30), LocalDate.now(), 99L, "2026-2027"));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
    }

    @Test
    void costReport_AllFourCostTypes_BreakdownCorrect() {
        List<CostRecord> records = List.of(
                buildCostRecord(100L, 10L, 6L, "USAGE",         new BigDecimal("100.00")),
                buildCostRecord(100L, 10L, 6L, "MAINTENANCE",    new BigDecimal("200.00")),
                buildCostRecord(100L, 10L, 6L, "SHARING_FEE",   new BigDecimal("300.00")),
                buildCostRecord(100L, 10L, 6L, "DAMAGE_CHARGE", new BigDecimal("400.00"))
        );
        stubCostReportMocksForLabManager(records);

        CostAnalysisReportDto result = reportService.getCostAnalysisReport(
                labManagerPrincipal, LocalDate.now().minusDays(30), LocalDate.now(), null, "2026-2027");

        assertEquals(new BigDecimal("100.00"), result.getSummary().getUsageCost());
        assertEquals(new BigDecimal("200.00"), result.getSummary().getMaintenanceCost());
        assertEquals(new BigDecimal("300.00"), result.getSummary().getSharingFee());
        assertEquals(new BigDecimal("400.00"), result.getSummary().getDamageCharge());
        assertEquals(new BigDecimal("1000.00"), result.getSummary().getTotalCost());
    }

    @Test
    void costReport_BudgetPresent_BudgetSummaryPopulated() {
        Budget budget = new Budget();
        budget.setDepartmentId(10L);
        budget.setFiscalYear("2026-2027");
        budget.setAllocatedAmount(new BigDecimal("1000000.00"));
        budget.setUsedAmount(new BigDecimal("600000.00"));
        budget.setRemainingAmount(new BigDecimal("400000.00"));

        when(costRecordRepository.findByDepartmentIdAndCreatedAtBetween(eq(10L), any(), any())).thenReturn(Collections.emptyList());
        when(equipmentRepository.findByDepartmentIdAndInstitutionId(10L, 6L)).thenReturn(Collections.emptyList());
        when(departmentRepository.findAll()).thenReturn(List.of(dept10));
        when(laboratoryRepository.findByDepartmentId(10L)).thenReturn(Collections.emptyList());
        when(institutionRepository.findById(6L)).thenReturn(Optional.of(institution6));
        when(budgetRepository.findByDepartmentIdAndFiscalYear(10L, "2026-2027")).thenReturn(Optional.of(budget));
        when(maintenanceRequestRepository.findByEquipmentIdIn(anyList())).thenReturn(Collections.emptyList());
        when(sharingAgreementRepository.findByEquipmentIdIn(anyList())).thenReturn(Collections.emptyList());

        CostAnalysisReportDto result = reportService.getCostAnalysisReport(
                labManagerPrincipal, LocalDate.now().minusDays(30), LocalDate.now(), null, "2026-2027");

        assertNotNull(result.getBudget());
        assertEquals("WATCH", result.getBudget().getWarningStatus()); // 60% used → WATCH
    }

    @Test
    void costReport_BudgetUnder50Pct_IsNormal() {
        Budget budget = new Budget();
        budget.setDepartmentId(10L);
        budget.setFiscalYear("2026-2027");
        budget.setAllocatedAmount(new BigDecimal("1000000.00"));
        budget.setUsedAmount(new BigDecimal("200000.00"));
        budget.setRemainingAmount(new BigDecimal("800000.00"));

        when(costRecordRepository.findByDepartmentIdAndCreatedAtBetween(eq(10L), any(), any())).thenReturn(Collections.emptyList());
        when(equipmentRepository.findByDepartmentIdAndInstitutionId(10L, 6L)).thenReturn(Collections.emptyList());
        when(departmentRepository.findAll()).thenReturn(List.of(dept10));
        when(laboratoryRepository.findByDepartmentId(10L)).thenReturn(Collections.emptyList());
        when(institutionRepository.findById(6L)).thenReturn(Optional.of(institution6));
        when(budgetRepository.findByDepartmentIdAndFiscalYear(10L, "2026-2027")).thenReturn(Optional.of(budget));
        when(maintenanceRequestRepository.findByEquipmentIdIn(anyList())).thenReturn(Collections.emptyList());
        when(sharingAgreementRepository.findByEquipmentIdIn(anyList())).thenReturn(Collections.emptyList());

        CostAnalysisReportDto result = reportService.getCostAnalysisReport(
                labManagerPrincipal, LocalDate.now().minusDays(30), LocalDate.now(), null, "2026-2027");

        assertEquals("NORMAL", result.getBudget().getWarningStatus());
    }

    @Test
    void costReport_MonthlyTrend_FilledForEntireRange() {
        when(costRecordRepository.findByDepartmentIdAndCreatedAtBetween(eq(10L), any(), any())).thenReturn(Collections.emptyList());
        when(equipmentRepository.findByDepartmentIdAndInstitutionId(10L, 6L)).thenReturn(Collections.emptyList());
        when(departmentRepository.findAll()).thenReturn(List.of(dept10));
        when(laboratoryRepository.findByDepartmentId(10L)).thenReturn(Collections.emptyList());
        when(institutionRepository.findById(6L)).thenReturn(Optional.of(institution6));
        when(budgetRepository.findByDepartmentIdAndFiscalYear(10L, "2026-2027")).thenReturn(Optional.empty());
        when(maintenanceRequestRepository.findByEquipmentIdIn(anyList())).thenReturn(Collections.emptyList());
        when(sharingAgreementRepository.findByEquipmentIdIn(anyList())).thenReturn(Collections.emptyList());

        CostAnalysisReportDto result = reportService.getCostAnalysisReport(
                labManagerPrincipal, LocalDate.of(2026, 4, 1), LocalDate.of(2026, 6, 30), null, "2026-2027");

        assertEquals(3, result.getMonthlyTrend().size());
        assertEquals("2026-04", result.getMonthlyTrend().get(0).getPeriod());
        assertEquals("2026-06", result.getMonthlyTrend().get(2).getPeriod());
    }

    @Test
    void costReport_NoBudget_BudgetSummaryIsNull() {
        stubCostReportMocksForLabManager(Collections.emptyList());

        CostAnalysisReportDto result = reportService.getCostAnalysisReport(
                labManagerPrincipal, LocalDate.now().minusDays(30), LocalDate.now(), null, "2026-2027");

        assertNull(result.getBudget());
    }

    @Test
    void costReport_InvalidDateRange_ThrowsBadRequest() {
        ApiException ex = assertThrows(ApiException.class, () ->
                reportService.getCostAnalysisReport(labManagerPrincipal,
                        LocalDate.now(), LocalDate.now().minusDays(5), null, "2026-2027"));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void costReport_Metadata_ContainsCorrectReportType() {
        stubCostReportMocksForLabManager(Collections.emptyList());

        CostAnalysisReportDto result = reportService.getCostAnalysisReport(
                labManagerPrincipal, LocalDate.now().minusDays(30), LocalDate.now(), null, "2026-2027");

        assertEquals("COST_ANALYSIS", result.getMetadata().getReportType());
        assertEquals(6L, result.getMetadata().getInstitutionId());
        assertEquals(10L, result.getMetadata().getDepartmentId());
        assertEquals(1L, result.getMetadata().getGeneratedByUserId());
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void stubCostReportMocksForLabManager(List<CostRecord> records) {
        when(costRecordRepository.findByDepartmentIdAndCreatedAtBetween(eq(10L), any(), any())).thenReturn(records);
        when(equipmentRepository.findByDepartmentIdAndInstitutionId(10L, 6L)).thenReturn(List.of(equipment1));
        when(departmentRepository.findAll()).thenReturn(List.of(dept10));
        when(laboratoryRepository.findByDepartmentId(10L)).thenReturn(Collections.emptyList());
        when(institutionRepository.findById(6L)).thenReturn(Optional.of(institution6));
        when(budgetRepository.findByDepartmentIdAndFiscalYear(10L, "2026-2027")).thenReturn(Optional.empty());
        when(maintenanceRequestRepository.findByEquipmentIdIn(anyList())).thenReturn(Collections.emptyList());
        when(sharingAgreementRepository.findByEquipmentIdIn(anyList())).thenReturn(Collections.emptyList());
    }

    private UserPrincipal buildPrincipal(Long userId, Long institutionId, Long departmentId, String roleName) {
        AppUser user = new AppUser();
        user.setUserId(userId);
        user.setInstitutionId(institutionId);
        user.setDepartmentId(departmentId);
        Role role = new Role();
        role.setRoleName(roleName);
        role.setPermissions(Set.of());
        user.setRoles(Set.of(role));
        return new UserPrincipal(user);
    }

    private UtilizationMetric buildMetric(Long eqId, BigDecimal avail, BigDecimal used, BigDecimal idle) {
        UtilizationMetric m = new UtilizationMetric();
        m.setEquipmentId(eqId);
        m.setPeriodDate(LocalDate.now().minusDays(1));
        m.setTotalAvailableHours(avail);
        m.setTotalUsedHours(used);
        m.setIdleTimeHours(idle);
        return m;
    }

    private CostRecord buildCostRecord(Long eqId, Long deptId, Long instId, String costType, BigDecimal amount) {
        CostRecord cr = new CostRecord();
        cr.setEquipmentId(eqId);
        cr.setDepartmentId(deptId);
        cr.setInstitutionId(instId);
        cr.setCostType(costType);
        cr.setAmount(amount);
        cr.setCreatedAt(LocalDateTime.now().minusDays(5));
        return cr;
    }
}
