package com.labresource.backend.billing.service;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.billing.dto.InvoiceDto;
import com.labresource.backend.billing.entity.Invoice;
import com.labresource.backend.billing.repository.InvoiceRepository;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.institution.repository.InstitutionRepository;
import com.labresource.backend.role.entity.Role;
import com.labresource.backend.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;
    @Mock
    private InstitutionRepository institutionRepository;
    @Mock
    private DepartmentRepository departmentRepository;

    @InjectMocks
    private InvoiceService invoiceService;

    private UserPrincipal providerAdmin;
    private UserPrincipal requesterAdmin;
    private UserPrincipal unauthorizedAdmin;

    @BeforeEach
    void setUp() {
        Role adminRole = new Role();
        adminRole.setRoleId(1L);
        adminRole.setRoleName("INSTITUTION_ADMIN");

        AppUser pUser = new AppUser();
        pUser.setUserId(100L);
        pUser.setEmail("provider@admin.com");
        pUser.setInstitutionId(1L);
        pUser.setDepartmentId(10L);
        pUser.setIsActive(true);
        pUser.setRoles(Set.of(adminRole));

        AppUser rUser = new AppUser();
        rUser.setUserId(101L);
        rUser.setEmail("requester@admin.com");
        rUser.setInstitutionId(2L);
        rUser.setDepartmentId(20L);
        rUser.setIsActive(true);
        rUser.setRoles(Set.of(adminRole));

        AppUser uUser = new AppUser();
        uUser.setUserId(102L);
        uUser.setEmail("unauth@admin.com");
        uUser.setInstitutionId(3L);
        uUser.setDepartmentId(30L);
        uUser.setIsActive(true);
        uUser.setRoles(Set.of(adminRole));

        providerAdmin = new UserPrincipal(pUser);
        requesterAdmin = new UserPrincipal(rUser);
        unauthorizedAdmin = new UserPrincipal(uUser);
    }

    @Test
    @DisplayName("Invoice number generation contains fiscal/monthly prefix and sequence")
    void testGenerateInvoiceNumber() {
        when(invoiceRepository.existsByInvoiceNumber(anyString())).thenReturn(false);
        String invNum = invoiceService.generateInvoiceNumber(1L);
        assertNotNull(invNum);
        assertTrue(invNum.startsWith("INV-"));
        assertTrue(invNum.contains("-1-"));
    }

    @Test
    @DisplayName("Sharing invoice creation is idempotent when duplicate requested")
    void testCreateSharingInvoiceIdempotency() {
        Invoice existingInvoice = new Invoice();
        existingInvoice.setInvoiceId(55L);
        existingInvoice.setInvoiceNumber("INV-202609-1-000001");
        existingInvoice.setTotalAmount(new BigDecimal("500.00"));

        when(invoiceRepository.findBySharingAgreementIdAndInvoicePeriod(10L, "2026-2027"))
                .thenReturn(Optional.of(existingInvoice));

        Invoice result = invoiceService.createSharingInvoice(10L, 1L, 2L, 5L, new BigDecimal("500.00"), "2026-2027");

        assertNotNull(result);
        assertEquals(55L, result.getInvoiceId());
        verify(invoiceRepository, never()).save(any(Invoice.class));
    }

    @Test
    @DisplayName("Institution Admin can access provider and requester invoices only")
    void testInstitutionAccessIsolation() {
        Invoice inv1 = new Invoice();
        inv1.setInvoiceId(1L);
        inv1.setInstitutionId(1L);
        inv1.setExternalInstitutionId(2L);
        inv1.setStatus("PENDING");

        when(invoiceRepository.findByInstitutionIdOrExternalInstitutionId(1L, 1L))
                .thenReturn(List.of(inv1));

        List<InvoiceDto> results = invoiceService.getAccessibleInvoices(providerAdmin);
        assertEquals(1, results.size());
        assertEquals(1L, results.get(0).getInvoiceId());
    }

    @Test
    @DisplayName("Unauthorized institution cannot view third-party invoice")
    void testGetInvoiceByIdUnauthorized() {
        Invoice inv = new Invoice();
        inv.setInvoiceId(10L);
        inv.setInstitutionId(1L);
        inv.setExternalInstitutionId(2L);

        when(invoiceRepository.findById(10L)).thenReturn(Optional.of(inv));

        assertThrows(ApiException.class, () -> invoiceService.getInvoiceById(unauthorizedAdmin, 10L));
    }

    @Test
    @DisplayName("Payment endpoint updates invoice status to PAID and sets paidDate")
    void testPayInvoiceSuccess() {
        Invoice inv = new Invoice();
        inv.setInvoiceId(20L);
        inv.setInstitutionId(1L);
        inv.setExternalInstitutionId(2L);
        inv.setStatus("PENDING");

        when(invoiceRepository.findById(20L)).thenReturn(Optional.of(inv));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InvoiceDto result = invoiceService.payInvoice(requesterAdmin, 20L);

        assertNotNull(result);
        assertEquals("PAID", result.getStatus());
        assertEquals(LocalDate.now(), result.getPaidDate());
    }

    @Test
    @DisplayName("Paying an already PAID invoice throws BAD_REQUEST")
    void testPayAlreadyPaidInvoice() {
        Invoice inv = new Invoice();
        inv.setInvoiceId(21L);
        inv.setInstitutionId(1L);
        inv.setExternalInstitutionId(2L);
        inv.setStatus("PAID");

        when(invoiceRepository.findById(21L)).thenReturn(Optional.of(inv));

        assertThrows(ApiException.class, () -> invoiceService.payInvoice(requesterAdmin, 21L));
    }
}
