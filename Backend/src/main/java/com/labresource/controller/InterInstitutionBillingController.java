
package com.labresource.controller;

import com.labresource.entity.BillingStatus;
import com.labresource.entity.InterInstitutionBilling;
import com.labresource.service.InterInstitutionBillingService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/inter-institution-billing")
@CrossOrigin(origins = "http://localhost:5173")
public class InterInstitutionBillingController {

    private final InterInstitutionBillingService billingService;

    public InterInstitutionBillingController(
            InterInstitutionBillingService billingService
    ) {
        this.billingService = billingService;
    }

    // =========================================================
    // CREATE BILLING
    // =========================================================

    @PostMapping
    public ResponseEntity<InterInstitutionBilling> createBilling(
            @RequestBody InterInstitutionBilling billing
    ) {

        InterInstitutionBilling createdBilling =
                billingService.createBilling(billing);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdBilling);
    }

    // =========================================================
    // GET ALL BILLINGS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<InterInstitutionBilling>> getAllBillings() {

        List<InterInstitutionBilling> billings =
                billingService.getAllBillings();

        return ResponseEntity.ok(billings);
    }

    // =========================================================
    // GET BILLING BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<InterInstitutionBilling> getBillingById(
            @PathVariable Long id
    ) {

        InterInstitutionBilling billing =
                billingService.getBillingById(id);

        return ResponseEntity.ok(billing);
    }

    // =========================================================
    // UPDATE BILLING
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<InterInstitutionBilling> updateBilling(
            @PathVariable Long id,
            @RequestBody InterInstitutionBilling billing
    ) {

        InterInstitutionBilling updatedBilling =
                billingService.updateBilling(id, billing);

        return ResponseEntity.ok(updatedBilling);
    }

    // =========================================================
    // DELETE BILLING
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBilling(
            @PathVariable Long id
    ) {

        billingService.deleteBilling(id);

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // GET BY SHARING INSTITUTION
    // =========================================================

    @GetMapping("/sharing-institution/{institutionId}")
    public ResponseEntity<List<InterInstitutionBilling>>
    getBillingsBySharingInstitution(
            @PathVariable Long institutionId
    ) {

        List<InterInstitutionBilling> billings =
                billingService.getBillingsBySharingInstitution(
                        institutionId
                );

        return ResponseEntity.ok(billings);
    }

    // =========================================================
    // GET BY USING INSTITUTION
    // =========================================================

    @GetMapping("/using-institution/{institutionId}")
    public ResponseEntity<List<InterInstitutionBilling>>
    getBillingsByUsingInstitution(
            @PathVariable Long institutionId
    ) {

        List<InterInstitutionBilling> billings =
                billingService.getBillingsByUsingInstitution(
                        institutionId
                );

        return ResponseEntity.ok(billings);
    }

    // =========================================================
    // GET BY EQUIPMENT
    // =========================================================

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<InterInstitutionBilling>>
    getBillingsByEquipment(
            @PathVariable Long equipmentId
    ) {

        List<InterInstitutionBilling> billings =
                billingService.getBillingsByEquipment(
                        equipmentId
                );

        return ResponseEntity.ok(billings);
    }

    // =========================================================
    // GET BY BILLING STATUS
    // =========================================================

    @GetMapping("/status/{billingStatus}")
    public ResponseEntity<List<InterInstitutionBilling>>
    getBillingsByStatus(
            @PathVariable BillingStatus billingStatus
    ) {

        List<InterInstitutionBilling> billings =
                billingService.getBillingsByStatus(
                        billingStatus
                );

        return ResponseEntity.ok(billings);
    }

    // =========================================================
    // GET BY BILLING DATE
    // =========================================================

    @GetMapping("/date/{billingDate}")
    public ResponseEntity<List<InterInstitutionBilling>>
    getBillingsByDate(
            @PathVariable LocalDate billingDate
    ) {

        List<InterInstitutionBilling> billings =
                billingService.getBillingsByDate(
                        billingDate
                );

        return ResponseEntity.ok(billings);
    }

    // =========================================================
    // GET BY DATE RANGE
    // =========================================================

    @GetMapping("/date-range")
    public ResponseEntity<List<InterInstitutionBilling>>
    getBillingsByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {

        List<InterInstitutionBilling> billings =
                billingService.getBillingsByDateRange(
                        startDate,
                        endDate
                );

        return ResponseEntity.ok(billings);
    }

    // =========================================================
    // SHARING INSTITUTION + DATE RANGE
    // =========================================================

    @GetMapping("/sharing-institution/{institutionId}/date-range")
    public ResponseEntity<List<InterInstitutionBilling>>
    getSharingInstitutionBillingsByDateRange(
            @PathVariable Long institutionId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {

        List<InterInstitutionBilling> billings =
                billingService
                        .getSharingInstitutionBillingsByDateRange(
                                institutionId,
                                startDate,
                                endDate
                        );

        return ResponseEntity.ok(billings);
    }

    // =========================================================
    // USING INSTITUTION + DATE RANGE
    // =========================================================

    @GetMapping("/using-institution/{institutionId}/date-range")
    public ResponseEntity<List<InterInstitutionBilling>>
    getUsingInstitutionBillingsByDateRange(
            @PathVariable Long institutionId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {

        List<InterInstitutionBilling> billings =
                billingService
                        .getUsingInstitutionBillingsByDateRange(
                                institutionId,
                                startDate,
                                endDate
                        );

        return ResponseEntity.ok(billings);
    }

    // =========================================================
    // EQUIPMENT + DATE RANGE
    // =========================================================

    @GetMapping("/equipment/{equipmentId}/date-range")
    public ResponseEntity<List<InterInstitutionBilling>>
    getEquipmentBillingsByDateRange(
            @PathVariable Long equipmentId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {

        List<InterInstitutionBilling> billings =
                billingService
                        .getEquipmentBillingsByDateRange(
                                equipmentId,
                                startDate,
                                endDate
                        );

        return ResponseEntity.ok(billings);
    }

    // =========================================================
    // CALCULATE BILLING AMOUNT
    // =========================================================

    @GetMapping("/calculate")
    public ResponseEntity<Double> calculateBillingAmount(
            @RequestParam Double usageHours,
            @RequestParam Double ratePerHour
    ) {

        Double amount =
                billingService.calculateBillingAmount(
                        usageHours,
                        ratePerHour
                );

        return ResponseEntity.ok(amount);
    }

    // =========================================================
    // UPDATE BILLING STATUS
    // =========================================================

    @PutMapping("/{id}/status")
    public ResponseEntity<InterInstitutionBilling>
    updateBillingStatus(
            @PathVariable Long id,
            @RequestParam BillingStatus billingStatus
    ) {

        InterInstitutionBilling updatedBilling =
                billingService.updateBillingStatus(
                        id,
                        billingStatus
                );

        return ResponseEntity.ok(updatedBilling);
    }
}
