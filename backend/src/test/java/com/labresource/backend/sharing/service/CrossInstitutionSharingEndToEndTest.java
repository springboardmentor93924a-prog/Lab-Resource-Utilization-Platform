package com.labresource.backend.sharing.service;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.billing.entity.CostRecord;
import com.labresource.backend.billing.entity.Invoice;
import com.labresource.backend.billing.repository.CostRecordRepository;
import com.labresource.backend.billing.repository.InvoiceRepository;
import com.labresource.backend.billing.service.BillingService;
import com.labresource.backend.billing.service.InvoiceService;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.repository.EquipmentRepository;
import com.labresource.backend.institution.entity.Institution;
import com.labresource.backend.institution.repository.InstitutionRepository;
import com.labresource.backend.role.entity.Role;
import com.labresource.backend.security.UserPrincipal;
import com.labresource.backend.sharing.dto.InstitutionSharingOverviewDto;
import com.labresource.backend.sharing.dto.SharingMoUProposalDto;
import com.labresource.backend.sharing.entity.ResourceSharingRequest;
import com.labresource.backend.sharing.entity.SharingAgreement;
import com.labresource.backend.sharing.repository.ResourceSharingRequestRepository;
import com.labresource.backend.sharing.repository.SharedBookingRepository;
import com.labresource.backend.sharing.repository.SharingAgreementRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CrossInstitutionSharingEndToEndTest {

    @Mock private ResourceSharingRequestRepository requestRepository;
    @Mock private SharingAgreementRepository agreementRepository;
    @Mock private SharedBookingRepository sharedBookingRepository;
    @Mock private EquipmentRepository equipmentRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private InstitutionRepository institutionRepository;
    @Mock private CostRecordRepository costRecordRepository;
    @Mock private InvoiceRepository invoiceRepository;
    @Mock private com.labresource.backend.notification.service.NotificationService notificationService;

    @Mock private InvoiceService invoiceService;
    @Mock private BillingService billingService;

    @InjectMocks private SharingService sharingService;

    private UserPrincipal providerDeptHead;
    private UserPrincipal requesterDeptHead;
    private UserPrincipal requesterAdmin;
    private UserPrincipal thirdPartyAdmin;

    @BeforeEach
    void setUp() {
        Role deptHeadRole = new Role();
        deptHeadRole.setRoleName(Role.DEPARTMENT_HEAD);

        Role instAdminRole = new Role();
        instAdminRole.setRoleName(Role.INSTITUTION_ADMIN);

        // Institution A = 1L (Provider)
        AppUser provUser = new AppUser();
        provUser.setUserId(10L);
        provUser.setInstitutionId(1L);
        provUser.setDepartmentId(101L);
        provUser.setRoles(Set.of(deptHeadRole));
        providerDeptHead = new UserPrincipal(provUser);

        // Institution B = 2L (Requester)
        AppUser reqUser = new AppUser();
        reqUser.setUserId(20L);
        reqUser.setInstitutionId(2L);
        reqUser.setDepartmentId(202L);
        reqUser.setRoles(Set.of(deptHeadRole));
        requesterDeptHead = new UserPrincipal(reqUser);

        AppUser reqAdminUser = new AppUser();
        reqAdminUser.setUserId(21L);
        reqAdminUser.setInstitutionId(2L);
        reqAdminUser.setRoles(Set.of(instAdminRole));
        requesterAdmin = new UserPrincipal(reqAdminUser);

        // Institution C = 3L (Unauthorized Third Party)
        AppUser thirdUser = new AppUser();
        thirdUser.setUserId(30L);
        thirdUser.setInstitutionId(3L);
        thirdUser.setRoles(Set.of(instAdminRole));
        thirdPartyAdmin = new UserPrincipal(thirdUser);
    }

    @Test
    @DisplayName("21. End-To-End Scenario: Request -> Propose MOU -> Accept -> Active Agreement -> Overview Realized Financials")
    void testCompleteEndToEndSharingWorkflow() {
        Long equipmentId = 50L;
        Long requestId = 100L;
        LocalDate start = LocalDate.now().plusDays(1);
        LocalDate end = LocalDate.now().plusDays(30);

        // Step 1: Equipment setup (Owned by Institution 1)
        Equipment eq = new Equipment();
        eq.setEquipmentId(equipmentId);
        eq.setInstitutionId(1L);
        eq.setDepartmentId(101L);
        eq.setIsShareable(true);
        eq.setIsActive(true);
        eq.setStatus(Equipment.AVAILABLE);
        when(equipmentRepository.findById(equipmentId)).thenReturn(Optional.of(eq));

        ResourceSharingRequest req = new ResourceSharingRequest();
        req.setRequestId(requestId);
        req.setRequestingInstitutionId(2L);
        req.setRequestingDepartmentId(202L);
        req.setOwningInstitutionId(1L);
        req.setOwningDepartmentId(101L);
        req.setEquipmentId(equipmentId);
        req.setStatus("PENDING");
        when(requestRepository.save(any(ResourceSharingRequest.class))).thenReturn(req);

        // Submitting sharing request from Institution B
        ResourceSharingRequest createdReq = sharingService.submitRequest(
                requesterDeptHead,
                equipmentId,
                start,
                end,
                "Joint Research"
        );

        assertNotNull(createdReq);
        assertEquals("PENDING", createdReq.getStatus());

        // Step 2: Owning Dept Head (Inst 1) proposes MOU
        when(requestRepository.findById(requestId)).thenReturn(Optional.of(req));

        SharingMoUProposalDto proposal = new SharingMoUProposalDto(
                BigDecimal.valueOf(100),
                "Standard terms",
                start,
                end,
                LocalTime.of(9, 0),
                LocalTime.of(17, 0)
        );

        ResourceSharingRequest proposedReq = sharingService.proposeMou(
                providerDeptHead,
                requestId,
                proposal
        );

        assertEquals("MOU_PROPOSED", proposedReq.getStatus());
        assertEquals(
                BigDecimal.valueOf(100),
                proposedReq.getProposedHourlyRate()
        );

        // Step 3: Requesting Dept Head (Inst 2) accepts MOU
        // -> Creates ACTIVE SharingAgreement
        req.setStatus("MOU_PROPOSED");
        req.setProposedHourlyRate(BigDecimal.valueOf(100));
        req.setRequestedStartDate(start);
        req.setRequestedEndDate(end);

        when(agreementRepository.save(any(SharingAgreement.class))).thenAnswer(inv -> {
            SharingAgreement sa = inv.getArgument(0);
            sa.setAgreementId(500L);
            return sa;
        });

        SharingAgreement activeAgreement = sharingService.acceptMou(
                requesterDeptHead,
                requestId
        );

        assertNotNull(activeAgreement);
        assertEquals("ACTIVE", activeAgreement.getStatus());
        assertEquals(
                BigDecimal.valueOf(100),
                activeAgreement.getHourlyRate()
        );

        // Step 4: Realized Financial Overview Verification
        Institution inst1 = new Institution();
        inst1.setInstitutionId(1L);
        inst1.setName("Provider Inst");

        when(institutionRepository.findById(1L))
                .thenReturn(Optional.of(inst1));

        CostRecord costRecord = new CostRecord();
        costRecord.setInstitutionId(1L);
        costRecord.setCostType("SHARING_FEE");
        costRecord.setAmount(BigDecimal.valueOf(500));

        when(costRecordRepository.findAll())
                .thenReturn(List.of(costRecord));

        InstitutionSharingOverviewDto overview =
                sharingService.getInstitutionSharingOverview(
                        inst1AdminUser()
                );

        assertNotNull(overview);

        // Revenue MUST be derived from actual cost record (500),
        // NOT MOU rate (100)
        assertEquals(
                BigDecimal.valueOf(500),
                overview.getTotalRevenueEarned()
        );
    }

    @Test
    @DisplayName("22. Multiple-Booking Consolidated Billing Test: 3 bookings aggregated correctly under Agreement #10")
    void testMultipleBookingsConsolidatedInvoicing() {
        Long sharingAgreementId = 10L;
        Long providerInstId = 1L;
        Long requesterInstId = 2L;
        Long departmentId = 101L;
        String fiscalYear = "2026-2027";

        /*
         * InvoiceService now requires four constructor dependencies.
         */
        InvoiceService realInvoiceService = new InvoiceService(
                invoiceRepository,
                institutionRepository,
                departmentRepository,
                sharedBookingRepository
        );

        // Booking 1: 2 hours = 120 INR
        when(invoiceRepository.findBySharingAgreementIdAndInvoicePeriod(
                sharingAgreementId,
                fiscalYear
        )).thenReturn(Optional.empty());

        when(invoiceRepository.save(any(Invoice.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        Invoice inv1 = realInvoiceService.createSharingInvoice(
                sharingAgreementId,
                providerInstId,
                requesterInstId,
                departmentId,
                BigDecimal.valueOf(120),
                fiscalYear,
                true
        );

        assertEquals(
                BigDecimal.valueOf(120),
                inv1.getTotalAmount()
        );

        assertEquals(
                "PENDING",
                inv1.getStatus()
        );

        // Booking 2: 3 hours = 180 INR
        // Consolidated into existing PENDING invoice
        when(invoiceRepository.findBySharingAgreementIdAndInvoicePeriod(
                sharingAgreementId,
                fiscalYear
        )).thenReturn(Optional.of(inv1));

        Invoice inv2 = realInvoiceService.createSharingInvoice(
                sharingAgreementId,
                providerInstId,
                requesterInstId,
                departmentId,
                BigDecimal.valueOf(180),
                fiscalYear,
                true
        );

        assertEquals(
                BigDecimal.valueOf(300),
                inv2.getTotalAmount()
        );

        // 120 + 180 = 300

        // Booking 3: 1 hour = 60 INR
        // Consolidated into existing PENDING invoice
        Invoice inv3 = realInvoiceService.createSharingInvoice(
                sharingAgreementId,
                providerInstId,
                requesterInstId,
                departmentId,
                BigDecimal.valueOf(60),
                fiscalYear,
                true
        );

        assertEquals(
                BigDecimal.valueOf(360),
                inv3.getTotalAmount()
        );

        // 300 + 60 = 360

        // Duplicate Job Run:
        // isNewCostRecord = false
        // -> Does NOT add duplicate fee
        Invoice invRetry = realInvoiceService.createSharingInvoice(
                sharingAgreementId,
                providerInstId,
                requesterInstId,
                departmentId,
                BigDecimal.valueOf(60),
                fiscalYear,
                false
        );

        assertEquals(
                BigDecimal.valueOf(360),
                invRetry.getTotalAmount()
        );

        // Remains 360
    }

    @Test
    @DisplayName("23. Cross-Institution Security Test: Unauthorized Institution C rejected with 403 FORBIDDEN")
    void testCrossInstitutionSecurityIsolation() {
        Long invoiceId = 999L;

        Invoice inv = new Invoice();
        inv.setInvoiceId(invoiceId);
        inv.setInstitutionId(1L); // Provider = Inst 1
        inv.setExternalInstitutionId(2L); // Requester = Inst 2
        inv.setTotalAmount(BigDecimal.valueOf(500));
        inv.setStatus("PENDING");

        /*
         * InvoiceService now requires four constructor dependencies.
         */
        InvoiceService realInvoiceService = new InvoiceService(
                invoiceRepository,
                institutionRepository,
                departmentRepository,
                sharedBookingRepository
        );

        when(invoiceRepository.findById(invoiceId))
                .thenReturn(Optional.of(inv));

        // Institution C (3L) attempts to access Institution A & B's invoice
        ApiException ex = assertThrows(
                ApiException.class,
                () -> realInvoiceService.getInvoiceById(
                        thirdPartyAdmin,
                        invoiceId
                )
        );

        assertEquals(
                HttpStatus.FORBIDDEN,
                ex.getStatus()
        );

        assertTrue(
                ex.getMessage().contains("Access denied")
        );

        // Institution C attempts to pay Institution A & B's invoice
        ApiException payEx = assertThrows(
                ApiException.class,
                () -> realInvoiceService.payInvoice(
                        thirdPartyAdmin,
                        invoiceId
                )
        );

        assertEquals(
                HttpStatus.FORBIDDEN,
                payEx.getStatus()
        );

        assertTrue(
                payEx.getMessage().contains(
                        "Only the paying/requester institution"
                )
        );
    }

    private UserPrincipal inst1AdminUser() {
        Role r = new Role();
        r.setRoleName(Role.INSTITUTION_ADMIN);

        AppUser u = new AppUser();
        u.setUserId(1L);
        u.setInstitutionId(1L);
        u.setRoles(Set.of(r));

        return new UserPrincipal(u);
    }
}