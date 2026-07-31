package com.labresource.repository;

import com.labresource.entity.BillingRecord;
import com.labresource.entity.ExternalBooking;
import com.labresource.entity.Institution;
import com.labresource.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillingRecordRepository
        extends JpaRepository<BillingRecord, String> {

    Optional<BillingRecord> findByInvoiceNumberIgnoreCase(
            String invoiceNumber
    );

    boolean existsByInvoiceNumberIgnoreCase(
            String invoiceNumber
    );

    List<BillingRecord> findByExternalBooking(
            ExternalBooking externalBooking
    );

    List<BillingRecord> findByPayerInstitution(
            Institution payerInstitution
    );

    List<BillingRecord> findByReceiverInstitution(
            Institution receiverInstitution
    );

    List<BillingRecord> findByCreatedBy(
            User createdBy
    );

    List<BillingRecord> findByBillingStatusIgnoreCase(
            String billingStatus
    );

    List<BillingRecord> findByPaymentStatusIgnoreCase(
            String paymentStatus
    );

    List<BillingRecord> findByPayerInstitutionAndPaymentStatusIgnoreCase(
            Institution payerInstitution,
            String paymentStatus
    );

    List<BillingRecord> findByReceiverInstitutionAndPaymentStatusIgnoreCase(
            Institution receiverInstitution,
            String paymentStatus
    );

    List<BillingRecord> findByInvoiceDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    List<BillingRecord> findByDueDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    List<BillingRecord> findByPayerInstitutionAndInvoiceDateBetween(
            Institution payerInstitution,
            LocalDate startDate,
            LocalDate endDate
    );

    List<BillingRecord> findByReceiverInstitutionAndInvoiceDateBetween(
            Institution receiverInstitution,
            LocalDate startDate,
            LocalDate endDate
    );

    List<BillingRecord> findByPaymentStatusIgnoreCaseAndDueDateBefore(
            String paymentStatus,
            LocalDate currentDate
    );
}