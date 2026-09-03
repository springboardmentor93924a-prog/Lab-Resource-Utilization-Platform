package com.example.lab_platform.controller;

import com.example.lab_platform.dto.InvoiceDTO;
import com.example.lab_platform.dto.InvoiceGenerateRequestDTO;
import com.example.lab_platform.service.InvoiceService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private static final String MANAGER_ROLES = """
        hasAnyRole(
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """;

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    @PreAuthorize(MANAGER_ROLES)
    public List<InvoiceDTO> getAllInvoices() {
        return invoiceService.getAllInvoices();
    }

    @PostMapping("/generate")
    @PreAuthorize(MANAGER_ROLES)
    public InvoiceDTO generate(@RequestBody InvoiceGenerateRequestDTO request) {
        return invoiceService.generateInvoice(request);
    }

    @PutMapping("/{invoiceId}/issue")
    @PreAuthorize(MANAGER_ROLES)
    public InvoiceDTO markIssued(@PathVariable Integer invoiceId) {
        return invoiceService.markIssued(invoiceId);
    }

    @PutMapping("/{invoiceId}/paid")
    @PreAuthorize(MANAGER_ROLES)
    public InvoiceDTO markPaid(@PathVariable Integer invoiceId) {
        return invoiceService.markPaid(invoiceId);
    }

    @GetMapping("/{invoiceId}/export/pdf")
    @PreAuthorize(MANAGER_ROLES)
    public ResponseEntity<byte[]> exportPdf(@PathVariable Integer invoiceId) {

        byte[] pdf = invoiceService.exportInvoicePdf(invoiceId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=invoice-" + invoiceId + ".pdf")
                .body(pdf);
    }
}