package com.labresource.service;

import com.labresource.dto.BillingRecordRequestDto;
import com.labresource.dto.BillingRecordResponseDto;

import java.time.LocalDate;
import java.util.List;

public interface BillingRecordService {

    BillingRecordResponseDto createBillingRecord(
            BillingRecordRequestDto dto
    );

    BillingRecordResponseDto updateBillingRecord(
            String billingRecordId,
            BillingRecordRequestDto dto
    );

    BillingRecordResponseDto getBillingRecordById(
            String billingRecordId
    );

    List<BillingRecordResponseDto> getAllBillingRecords();

    List<BillingRecordResponseDto> getBillingRecordsByExternalBooking(
            String externalBookingId
    );

    List<BillingRecordResponseDto> getBillingRecordsByPayerInstitution(
            String institutionId
    );

    List<BillingRecordResponseDto> getBillingRecordsByReceiverInstitution(
            String institutionId
    );

    List<BillingRecordResponseDto> getBillingRecordsByBillingStatus(
            String billingStatus
    );

    List<BillingRecordResponseDto> getBillingRecordsByPaymentStatus(
            String paymentStatus
    );

    List<BillingRecordResponseDto> getBillingRecordsByInvoiceDateRange(
            LocalDate startDate,
            LocalDate endDate
    );

    List<BillingRecordResponseDto> getPayerInstitutionBillsByDateRange(
            String institutionId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<BillingRecordResponseDto> getReceiverInstitutionBillsByDateRange(
            String institutionId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<BillingRecordResponseDto> getOverdueBills();

    void deleteBillingRecord(
            String billingRecordId
    );
}