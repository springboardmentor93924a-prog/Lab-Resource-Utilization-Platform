package com.example.lab_platform.service;

import com.example.lab_platform.dto.InvoiceDTO;
import com.example.lab_platform.dto.InvoiceGenerateRequestDTO;

import java.util.List;

public interface InvoiceService {

    InvoiceDTO generateInvoice(InvoiceGenerateRequestDTO request);

    List<InvoiceDTO> getAllInvoices();

    InvoiceDTO markIssued(Integer invoiceId);

    InvoiceDTO markPaid(Integer invoiceId);

    byte[] exportInvoicePdf(Integer invoiceId);
}