package com.labresource.controller;

import com.labresource.dto.BillingRecordRequestDto;
import com.labresource.dto.BillingRecordResponseDto;
import com.labresource.service.BillingRecordService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/billing-records")
public class BillingRecordController {

    private final BillingRecordService billingRecordService;

    public BillingRecordController(
            BillingRecordService billingRecordService
    ) {
        this.billingRecordService = billingRecordService;
    }

    @PostMapping
    public ResponseEntity<BillingRecordResponseDto>
    createBillingRecord(
            @Valid
            @RequestBody BillingRecordRequestDto requestDto
    ) {

        BillingRecordResponseDto response =
                billingRecordService
                        .createBillingRecord(requestDto);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{billingRecordId}")
    public ResponseEntity<BillingRecordResponseDto>
    updateBillingRecord(
            @PathVariable String billingRecordId,
            @Valid
            @RequestBody BillingRecordRequestDto requestDto
    ) {

        BillingRecordResponseDto response =
                billingRecordService
                        .updateBillingRecord(
                                billingRecordId,
                                requestDto
                        );

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<BillingRecordResponseDto>>
    getAllBillingRecords() {

        return ResponseEntity.ok(
                billingRecordService
                        .getAllBillingRecords()
        );
    }

    @GetMapping("/{billingRecordId}")
    public ResponseEntity<BillingRecordResponseDto>
    getBillingRecordById(
            @PathVariable String billingRecordId
    ) {

        return ResponseEntity.ok(
                billingRecordService
                        .getBillingRecordById(
                                billingRecordId
                        )
        );
    }

    @GetMapping("/external-booking/{externalBookingId}")
    public ResponseEntity<List<BillingRecordResponseDto>>
    getBillingRecordsByExternalBooking(
            @PathVariable String externalBookingId
    ) {

        return ResponseEntity.ok(
                billingRecordService
                        .getBillingRecordsByExternalBooking(
                                externalBookingId
                        )
        );
    }

    @GetMapping("/payer-institution/{institutionId}")
    public ResponseEntity<List<BillingRecordResponseDto>>
    getBillingRecordsByPayerInstitution(
            @PathVariable String institutionId
    ) {

        return ResponseEntity.ok(
                billingRecordService
                        .getBillingRecordsByPayerInstitution(
                                institutionId
                        )
        );
    }

    @GetMapping("/receiver-institution/{institutionId}")
    public ResponseEntity<List<BillingRecordResponseDto>>
    getBillingRecordsByReceiverInstitution(
            @PathVariable String institutionId
    ) {

        return ResponseEntity.ok(
                billingRecordService
                        .getBillingRecordsByReceiverInstitution(
                                institutionId
                        )
        );
    }

    @GetMapping("/billing-status/{billingStatus}")
    public ResponseEntity<List<BillingRecordResponseDto>>
    getBillingRecordsByBillingStatus(
            @PathVariable String billingStatus
    ) {

        return ResponseEntity.ok(
                billingRecordService
                        .getBillingRecordsByBillingStatus(
                                billingStatus
                        )
        );
    }

    @GetMapping("/payment-status/{paymentStatus}")
    public ResponseEntity<List<BillingRecordResponseDto>>
    getBillingRecordsByPaymentStatus(
            @PathVariable String paymentStatus
    ) {

        return ResponseEntity.ok(
                billingRecordService
                        .getBillingRecordsByPaymentStatus(
                                paymentStatus
                        )
        );
    }

    @GetMapping("/invoice-date-range")
    public ResponseEntity<List<BillingRecordResponseDto>>
    getBillingRecordsByInvoiceDateRange(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate
    ) {

        return ResponseEntity.ok(
                billingRecordService
                        .getBillingRecordsByInvoiceDateRange(
                                startDate,
                                endDate
                        )
        );
    }

    @GetMapping(
            "/payer-institution/{institutionId}/invoice-date-range"
    )
    public ResponseEntity<List<BillingRecordResponseDto>>
    getPayerInstitutionBillsByDateRange(
            @PathVariable String institutionId,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate
    ) {

        return ResponseEntity.ok(
                billingRecordService
                        .getPayerInstitutionBillsByDateRange(
                                institutionId,
                                startDate,
                                endDate
                        )
        );
    }

    @GetMapping(
            "/receiver-institution/{institutionId}/invoice-date-range"
    )
    public ResponseEntity<List<BillingRecordResponseDto>>
    getReceiverInstitutionBillsByDateRange(
            @PathVariable String institutionId,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate
    ) {

        return ResponseEntity.ok(
                billingRecordService
                        .getReceiverInstitutionBillsByDateRange(
                                institutionId,
                                startDate,
                                endDate
                        )
        );
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<BillingRecordResponseDto>>
    getOverdueBills() {

        return ResponseEntity.ok(
                billingRecordService
                        .getOverdueBills()
        );
    }

    @DeleteMapping("/{billingRecordId}")
    public ResponseEntity<String>
    deleteBillingRecord(
            @PathVariable String billingRecordId
    ) {

        billingRecordService
                .deleteBillingRecord(billingRecordId);

        return ResponseEntity.ok(
                "Billing record deleted successfully"
        );
    }
}