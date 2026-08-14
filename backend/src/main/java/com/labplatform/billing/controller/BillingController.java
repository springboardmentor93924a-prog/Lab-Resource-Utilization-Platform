package com.labplatform.billing.controller;

import com.labplatform.billing.dto.BillingRecordResponse;
import com.labplatform.billing.service.BillingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @GetMapping("/my-institution")
    public ResponseEntity<List<BillingRecordResponse>> getWhatMyInstitutionOwes(Authentication authentication) {
        return ResponseEntity.ok(billingService.getWhatMyInstitutionOwes(authentication.getName()));
    }

    @GetMapping("/owed-to-me")
    public ResponseEntity<List<BillingRecordResponse>> getWhatIsOwedToMyInstitution(Authentication authentication) {
        return ResponseEntity.ok(billingService.getWhatIsOwedToMyInstitution(authentication.getName()));
    }

    @PutMapping("/{id}/mark-paid")
    public ResponseEntity<BillingRecordResponse> markPaid(@PathVariable Integer id, Authentication authentication) {
        return ResponseEntity.ok(billingService.markPaid(id, authentication.getName()));
    }
}