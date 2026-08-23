package com.labresource.backend.billing.repository;

import com.labresource.backend.billing.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByInstitutionId(Long institutionId);
    List<Invoice> findByDepartmentId(Long departmentId);
    List<Invoice> findBySharingAgreementIdIn(List<Long> sharingAgreementIds);
}

