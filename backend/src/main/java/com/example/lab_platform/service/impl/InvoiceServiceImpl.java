package com.example.lab_platform.service.impl;

import com.example.lab_platform.dto.InvoiceDTO;
import com.example.lab_platform.dto.InvoiceGenerateRequestDTO;
import com.example.lab_platform.entity.ChargebackRequest;
import com.example.lab_platform.entity.Department;
import com.example.lab_platform.entity.Institution;
import com.example.lab_platform.entity.Invoice;
import com.example.lab_platform.entity.InvoiceLineItem;
import com.example.lab_platform.repository.ChargebackRequestRepository;
import com.example.lab_platform.repository.DepartmentRepository;
import com.example.lab_platform.repository.InstitutionRepository;
import com.example.lab_platform.repository.InvoiceLineItemRepository;
import com.example.lab_platform.repository.InvoiceRepository;
import com.example.lab_platform.service.InvoiceService;
import com.example.lab_platform.util.ReportExportUtil;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceLineItemRepository lineItemRepository;
    private final ChargebackRequestRepository chargebackRepository;
    private final DepartmentRepository departmentRepository;
    private final InstitutionRepository institutionRepository;

    public InvoiceServiceImpl(
            InvoiceRepository invoiceRepository,
            InvoiceLineItemRepository lineItemRepository,
            ChargebackRequestRepository chargebackRepository,
            DepartmentRepository departmentRepository,
            InstitutionRepository institutionRepository) {

        this.invoiceRepository = invoiceRepository;
        this.lineItemRepository = lineItemRepository;
        this.chargebackRepository = chargebackRepository;
        this.departmentRepository = departmentRepository;
        this.institutionRepository = institutionRepository;
    }

    // =========================================================
    // Generation - an invoice bills out every APPROVED chargeback
    // for the chosen department/institution that hasn't already
    // been placed on an invoice, within the given period.
    // =========================================================
    @Override
    public InvoiceDTO generateInvoice(InvoiceGenerateRequestDTO request) {

        if (request.getPeriodStart() == null || request.getPeriodEnd() == null) {
            throw new RuntimeException("Invoice period start and end are required.");
        }
        if (request.getPeriodEnd().isBefore(request.getPeriodStart())) {
            throw new RuntimeException("Invoice period end cannot be before period start.");
        }
        if ((request.getDepartmentId() == null) == (request.getInstitutionId() == null)) {
            throw new RuntimeException(
                    "Provide exactly one of departmentId or institutionId to bill.");
        }

        Invoice invoice = new Invoice();
        invoice.setPeriodStart(request.getPeriodStart());
        invoice.setPeriodEnd(request.getPeriodEnd());
        invoice.setStatus("DRAFT");

        List<ChargebackRequest> chargebacks;

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found."));
            invoice.setBilledToDepartment(department);
            chargebacks = chargebackRepository.findByPayerDepartment_DepartmentIdAndStatus(
                    request.getDepartmentId(), "APPROVED");
        } else {
            Institution institution = institutionRepository.findById(request.getInstitutionId())
                    .orElseThrow(() -> new RuntimeException("Institution not found."));
            invoice.setBilledToInstitution(institution);
            chargebacks = chargebackRepository.findByPayerInstitution_InstitutionIdAndStatus(
                    request.getInstitutionId(), "APPROVED");
        }

        List<ChargebackRequest> billable = chargebacks.stream()
                .filter(c -> !lineItemRepository.existsByChargeback_ChargebackId(c.getChargebackId()))
                .filter(c -> c.getRequestedDate() != null
                        && !c.getRequestedDate().isBefore(request.getPeriodStart())
                        && !c.getRequestedDate().isAfter(request.getPeriodEnd()))
                .collect(Collectors.toList());

        if (billable.isEmpty()) {
            throw new RuntimeException(
                    "No approved, unbilled chargebacks found for this scope and period.");
        }

        invoice.setInvoiceNumber(nextInvoiceNumber());

        double total = 0.0;
        List<InvoiceLineItem> lineItems = new ArrayList<>();

        for (ChargebackRequest chargeback : billable) {

            InvoiceLineItem lineItem = new InvoiceLineItem();
            lineItem.setInvoice(invoice);
            lineItem.setChargeback(chargeback);
            lineItem.setUsageCost(chargeback.getUsageCost());
            lineItem.setDescription(lineItemDescription(chargeback));
            lineItem.setAmount(chargeback.getAmount() != null ? chargeback.getAmount() : 0.0);

            lineItems.add(lineItem);
            total += lineItem.getAmount();
        }

        invoice.setLineItems(lineItems);
        invoice.setTotalAmount(round(total));

        invoice = invoiceRepository.save(invoice);

        return toDTO(invoice);
    }

    private String lineItemDescription(ChargebackRequest chargeback) {

        String equipmentName = chargeback.getUsageCost() != null
                && chargeback.getUsageCost().getEquipment() != null
                ? chargeback.getUsageCost().getEquipment().getEquipmentName()
                : "Equipment usage";

        return "INSTITUTION".equalsIgnoreCase(chargeback.getScopeType())
                ? "Shared equipment usage - " + equipmentName
                : "Equipment usage - " + equipmentName;
    }

    private String nextInvoiceNumber() {
        String prefix = "INV-" + Year.now().getValue() + "-";
        long count = invoiceRepository.countByInvoiceNumberStartingWith(prefix);
        return prefix + String.format("%04d", count + 1);
    }

    // =========================================================
    // Reads / status transitions
    // =========================================================
    @Override
    public List<InvoiceDTO> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::toDTO)
                .sorted(Comparator.comparing(InvoiceDTO::getPeriodStart,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    @Override
    public InvoiceDTO markIssued(Integer invoiceId) {
        Invoice invoice = getOrThrow(invoiceId);
        if (!"DRAFT".equalsIgnoreCase(invoice.getStatus())) {
            throw new RuntimeException("Only a DRAFT invoice can be issued.");
        }
        invoice.setStatus("ISSUED");
        invoice.setIssuedDate(LocalDate.now());
        return toDTO(invoiceRepository.save(invoice));
    }

    @Override
    public InvoiceDTO markPaid(Integer invoiceId) {
        Invoice invoice = getOrThrow(invoiceId);
        if (!"ISSUED".equalsIgnoreCase(invoice.getStatus())) {
            throw new RuntimeException("Only an ISSUED invoice can be marked paid.");
        }
        invoice.setStatus("PAID");
        return toDTO(invoiceRepository.save(invoice));
    }

    @Override
    public byte[] exportInvoicePdf(Integer invoiceId) {

        Invoice invoice = getOrThrow(invoiceId);

        Map<String, String> filters = Map.of(
                "Billed To", billedToLabel(invoice),
                "Period", invoice.getPeriodStart() + " to " + invoice.getPeriodEnd(),
                "Status", invoice.getStatus());

        List<String[]> summaryLines = List.of(
                new String[]{"Invoice Number", invoice.getInvoiceNumber()},
                new String[]{"Total Amount", "Rs. " + round(invoice.getTotalAmount())}
        );

        String[] headers = {"Description", "Amount (Rs.)"};

        List<String[]> rows = invoice.getLineItems().stream()
                .map(li -> new String[]{
                        li.getDescription(),
                        String.valueOf(round(li.getAmount() != null ? li.getAmount() : 0.0))
                })
                .collect(Collectors.toList());

        return ReportExportUtil.generatePdf(
                "Invoice " + invoice.getInvoiceNumber(),
                LocalDateTime.now(),
                filters,
                summaryLines,
                headers,
                rows);
    }

    // =========================================================
    // Helpers
    // =========================================================
    private Invoice getOrThrow(Integer invoiceId) {
        return invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found."));
    }

    private String billedToLabel(Invoice invoice) {
        if (invoice.getBilledToDepartment() != null) {
            return invoice.getBilledToDepartment().getDepartmentName();
        }
        if (invoice.getBilledToInstitution() != null) {
            return invoice.getBilledToInstitution().getInstitutionName();
        }
        return "Unknown";
    }

    private InvoiceDTO toDTO(Invoice invoice) {

        InvoiceDTO dto = new InvoiceDTO();
        dto.setInvoiceId(invoice.getInvoiceId());
        dto.setInvoiceNumber(invoice.getInvoiceNumber());
        dto.setBilledToLabel(billedToLabel(invoice));
        dto.setPeriodStart(invoice.getPeriodStart());
        dto.setPeriodEnd(invoice.getPeriodEnd());
        dto.setTotalAmount(invoice.getTotalAmount());
        dto.setStatus(invoice.getStatus());
        dto.setIssuedDate(invoice.getIssuedDate());
        dto.setLineItems(invoice.getLineItems().stream()
                .map(li -> new InvoiceDTO.InvoiceLineItemDTO(li.getDescription(), li.getAmount()))
                .collect(Collectors.toList()));

        return dto;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}