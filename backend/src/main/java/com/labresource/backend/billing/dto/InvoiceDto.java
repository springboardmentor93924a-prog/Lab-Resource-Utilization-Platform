package com.labresource.backend.billing.dto;

import com.labresource.backend.billing.entity.Invoice;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class InvoiceDto {
    private Long invoiceId;
    private String invoiceNumber;
    private Long institutionId;
    private String providerInstitutionName;
    private Long externalInstitutionId;
    private String requesterInstitutionName;
    private Long departmentId;
    private String departmentName;
    private Long sharingAgreementId;
    private BigDecimal totalAmount;
    private String currency = "INR";
    private String status; // PENDING, PAID, OVERDUE, DRAFT, SENT
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate paidDate;
    private String invoicePeriod;
    private LocalDateTime createdAt;

    public static InvoiceDto fromEntity(Invoice entity, String providerName, String requesterName, String deptName) {
        if (entity == null) return null;

        InvoiceDto dto = new InvoiceDto();
        dto.setInvoiceId(entity.getInvoiceId());
        dto.setInvoiceNumber(entity.getInvoiceNumber());
        dto.setInstitutionId(entity.getInstitutionId());
        dto.setProviderInstitutionName(providerName);
        dto.setExternalInstitutionId(entity.getExternalInstitutionId());
        dto.setRequesterInstitutionName(requesterName);
        dto.setDepartmentId(entity.getDepartmentId());
        dto.setDepartmentName(deptName);
        dto.setSharingAgreementId(entity.getSharingAgreementId());
        dto.setTotalAmount(entity.getTotalAmount());
        dto.setStatus(entity.getStatus());
        dto.setIssueDate(entity.getIssueDate());
        dto.setDueDate(entity.getDueDate());
        dto.setPaidDate(entity.getPaidDate());
        dto.setInvoicePeriod(entity.getInvoicePeriod());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
