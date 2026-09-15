package com.labresource.backend.billing.repository;

import com.labresource.backend.billing.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByInstitutionId(Long institutionId);
    List<Invoice> findByExternalInstitutionId(Long externalInstitutionId);
    List<Invoice> findByInstitutionIdOrExternalInstitutionId(Long providerInstId, Long requesterInstId);
    List<Invoice> findByDepartmentId(Long departmentId);
    List<Invoice> findBySharingAgreementIdIn(List<Long> sharingAgreementIds);
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    boolean existsByInvoiceNumber(String invoiceNumber);
    Optional<Invoice> findBySharingAgreementIdAndInvoicePeriod(Long sharingAgreementId, String invoicePeriod);
}

