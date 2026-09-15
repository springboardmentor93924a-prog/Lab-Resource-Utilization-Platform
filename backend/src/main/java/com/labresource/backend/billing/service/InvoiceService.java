package com.labresource.backend.billing.service;

import com.labresource.backend.billing.dto.InvoiceDto;
import com.labresource.backend.billing.entity.Invoice;
import com.labresource.backend.billing.repository.InvoiceRepository;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.department.entity.Department;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.institution.entity.Institution;
import com.labresource.backend.institution.repository.InstitutionRepository;
import com.labresource.backend.security.UserPrincipal;
import com.labresource.backend.sharing.entity.SharedBooking;
import com.labresource.backend.sharing.repository.SharedBookingRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Slf4j
@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final SharedBookingRepository sharedBookingRepository;

    private static final AtomicLong INVOICE_SEQUENCE = new AtomicLong(System.currentTimeMillis() % 1000000);

    @Autowired
    public InvoiceService(InvoiceRepository invoiceRepository,
                          InstitutionRepository institutionRepository,
                          DepartmentRepository departmentRepository,
                          SharedBookingRepository sharedBookingRepository) {
        this.invoiceRepository = invoiceRepository;
        this.institutionRepository = institutionRepository;
        this.departmentRepository = departmentRepository;
        this.sharedBookingRepository = sharedBookingRepository;
    }

    public InvoiceService(InvoiceRepository invoiceRepository,
                          InstitutionRepository institutionRepository,
                          DepartmentRepository departmentRepository) {
        this(invoiceRepository, institutionRepository, departmentRepository, null);
    }

    public String generateInvoiceNumber(Long providerInstId) {
        String period = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        long seq = INVOICE_SEQUENCE.incrementAndGet();
        String candidate = String.format("INV-%s-%d-%06d", period, providerInstId != null ? providerInstId : 0, seq % 1000000);

        while (invoiceRepository.existsByInvoiceNumber(candidate)) {
            seq = INVOICE_SEQUENCE.incrementAndGet();
            candidate = String.format("INV-%s-%d-%06d", period, providerInstId != null ? providerInstId : 0, seq % 1000000);
        }
        return candidate;
    }

    @Transactional
    public Invoice createSharingInvoice(Long sharingAgreementId, Long providerInstId, Long requesterInstId,
                                         Long departmentId, BigDecimal amount, String invoicePeriod, boolean isNewCostRecord) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            log.info("Zero or null amount for sharing agreement ID {}. Skipping invoice generation.", sharingAgreementId);
            return null;
        }

        // Idempotency / Consolidation check: check if an invoice already exists for this agreement and period
        Optional<Invoice> existingOpt = invoiceRepository.findBySharingAgreementIdAndInvoicePeriod(sharingAgreementId, invoicePeriod);
        if (existingOpt.isPresent()) {
            Invoice existing = existingOpt.get();
            if (isNewCostRecord && "PENDING".equalsIgnoreCase(existing.getStatus())) {
                existing.setTotalAmount(existing.getTotalAmount().add(amount));
                Invoice updated = invoiceRepository.save(existing);
                log.info("Updated consolidated invoice ID {} for agreement {} with additional {} INR. New total: {}",
                        updated.getInvoiceId(), sharingAgreementId, amount, updated.getTotalAmount());
                return updated;
            }
            log.info("Invoice already exists for sharing agreement ID {} and period {}. Returning existing invoice ID {}.",
                    sharingAgreementId, invoicePeriod, existing.getInvoiceId());
            return existing;
        }

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber(providerInstId));
        invoice.setInstitutionId(providerInstId);
        invoice.setExternalInstitutionId(requesterInstId);
        invoice.setDepartmentId(departmentId);
        invoice.setSharingAgreementId(sharingAgreementId);
        invoice.setTotalAmount(amount);
        invoice.setStatus("PENDING");
        invoice.setIssueDate(LocalDate.now());
        invoice.setDueDate(LocalDate.now().plusDays(30));
        invoice.setInvoicePeriod(invoicePeriod);

        Invoice saved = invoiceRepository.save(invoice);
        log.info("Generated inter-institution invoice {} (ID: {}) for amount {} INR",
                saved.getInvoiceNumber(), saved.getInvoiceId(), amount);
        return saved;
    }

    @Transactional
    public Invoice createSharingInvoice(Long sharingAgreementId, Long providerInstId, Long requesterInstId,
                                         Long departmentId, BigDecimal amount, String invoicePeriod) {
        return createSharingInvoice(sharingAgreementId, providerInstId, requesterInstId, departmentId, amount, invoicePeriod, true);
    }

    @Transactional
    public List<InvoiceDto> getAccessibleInvoices(UserPrincipal principal) {
        List<Invoice> rawInvoices;
        boolean isSysAdmin = principal.getRoleNames().contains("ROLE_SYSTEM_ADMIN") || principal.getRoleNames().contains("SYSTEM_ADMIN");
        boolean isInstAdmin = principal.getRoleNames().contains("ROLE_INSTITUTION_ADMIN") || principal.getRoleNames().contains("INSTITUTION_ADMIN");
        boolean isDeptHeadOrManager = principal.getRoleNames().contains("ROLE_DEPARTMENT_HEAD") || principal.getRoleNames().contains("DEPARTMENT_HEAD")
                || principal.getRoleNames().contains("ROLE_LAB_MANAGER") || principal.getRoleNames().contains("LAB_MANAGER");

        if (isSysAdmin) {
            rawInvoices = invoiceRepository.findAll();
        } else if (isInstAdmin) {
            Long instId = principal.getInstitutionId();
            rawInvoices = invoiceRepository.findByInstitutionIdOrExternalInstitutionId(instId, instId);
        } else if (isDeptHeadOrManager) {
            rawInvoices = invoiceRepository.findByDepartmentId(principal.getDepartmentId());
        } else {
            throw new ApiException(HttpStatus.FORBIDDEN, "Access denied to invoice reports.");
        }

        // Automatic Overdue Detection & Status Update
        LocalDate today = LocalDate.now();
        for (Invoice inv : rawInvoices) {
            if ("PENDING".equals(inv.getStatus()) && inv.getDueDate() != null && today.isAfter(inv.getDueDate())) {
                inv.setStatus("OVERDUE");
                invoiceRepository.save(inv);
            }
        }

        Map<Long, String> instNames = institutionRepository.findAll().stream()
                .collect(Collectors.toMap(Institution::getInstitutionId, Institution::getName));
        Map<Long, String> deptNames = departmentRepository.findAll().stream()
                .collect(Collectors.toMap(Department::getDepartmentId, Department::getName));

        return rawInvoices.stream()
                .map(inv -> InvoiceDto.fromEntity(
                        inv,
                        instNames.getOrDefault(inv.getInstitutionId(), "Institution #" + inv.getInstitutionId()),
                        instNames.getOrDefault(inv.getExternalInstitutionId(), "Institution #" + inv.getExternalInstitutionId()),
                        deptNames.getOrDefault(inv.getDepartmentId(), "Department")
                ))
                .toList();
    }

    @Transactional
    public InvoiceDto getInvoiceById(UserPrincipal principal, Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Invoice not found."));

        boolean isSysAdmin = principal.getRoleNames().contains("ROLE_SYSTEM_ADMIN") || principal.getRoleNames().contains("SYSTEM_ADMIN");
        Long callerInstId = principal.getInstitutionId();

        boolean isProvider = callerInstId != null && callerInstId.equals(invoice.getInstitutionId());
        boolean isRequester = callerInstId != null && callerInstId.equals(invoice.getExternalInstitutionId());

        if (!isSysAdmin && !isProvider && !isRequester) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Access denied. You can only view invoices related to your institution.");
        }

        // Overdue check
        if ("PENDING".equals(invoice.getStatus()) && invoice.getDueDate() != null && LocalDate.now().isAfter(invoice.getDueDate())) {
            invoice.setStatus("OVERDUE");
            invoice = invoiceRepository.save(invoice);
        }

        String providerName = institutionRepository.findById(invoice.getInstitutionId()).map(Institution::getName).orElse("Provider Institution");
        String requesterName = invoice.getExternalInstitutionId() != null
                ? institutionRepository.findById(invoice.getExternalInstitutionId()).map(Institution::getName).orElse("Requester Institution")
                : "N/A";
        String deptName = invoice.getDepartmentId() != null
                ? departmentRepository.findById(invoice.getDepartmentId()).map(Department::getName).orElse("Department")
                : "N/A";

        return InvoiceDto.fromEntity(invoice, providerName, requesterName, deptName);
    }

    @Transactional
    public InvoiceDto payInvoice(UserPrincipal principal, Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Invoice not found."));

        boolean isSysAdmin = principal.getRoleNames().contains("ROLE_SYSTEM_ADMIN") || principal.getRoleNames().contains("SYSTEM_ADMIN");
        Long callerInstId = principal.getInstitutionId();
        boolean isRequester = callerInstId != null && callerInstId.equals(invoice.getExternalInstitutionId());

        if (!isSysAdmin && !isRequester) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the paying/requester institution can make invoice payments.");
        }

        if ("PAID".equals(invoice.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invoice is already paid.");
        }

        invoice.setStatus("PAID");
        invoice.setPaidDate(LocalDate.now());
        Invoice saved = invoiceRepository.save(invoice);

        // Sync SharedBooking payment status if repository is available
        if (sharedBookingRepository != null && saved.getSharingAgreementId() != null) {
            List<SharedBooking> sharedBookings = sharedBookingRepository.findByAgreementId(saved.getSharingAgreementId());
            for (SharedBooking sb : sharedBookings) {
                sb.setPaymentStatus("PAID");
                sharedBookingRepository.save(sb);
            }
        }

        log.info("Invoice {} (ID: {}) paid successfully by institution ID {}",
                saved.getInvoiceNumber(), saved.getInvoiceId(), callerInstId);

        String providerName = institutionRepository.findById(saved.getInstitutionId()).map(Institution::getName).orElse("Provider Institution");
        String requesterName = saved.getExternalInstitutionId() != null
                ? institutionRepository.findById(saved.getExternalInstitutionId()).map(Institution::getName).orElse("Requester Institution")
                : "N/A";
        String deptName = saved.getDepartmentId() != null
                ? departmentRepository.findById(saved.getDepartmentId()).map(Department::getName).orElse("Department")
                : "N/A";

        return InvoiceDto.fromEntity(saved, providerName, requesterName, deptName);
    }
}
