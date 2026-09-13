package com.labresource.controller;

import com.labresource.entity.ChargebackStatus;
import com.labresource.entity.CostRecovery;
import com.labresource.service.CostRecoveryService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/cost-recovery")
@CrossOrigin(origins = "http://localhost:5173")
public class CostRecoveryController {

    private final CostRecoveryService recoveryService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public CostRecoveryController(
            CostRecoveryService recoveryService
    ) {
        this.recoveryService = recoveryService;
    }


    // =========================================================
    // CREATE
    // POST /api/cost-recovery
    // =========================================================

    @PostMapping
    public ResponseEntity<CostRecovery> createRecovery(
            @RequestBody CostRecovery recovery
    ) {

        CostRecovery created =
                recoveryService.createRecovery(recovery);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }


    // =========================================================
    // UPDATE
    // PUT /api/cost-recovery/{id}
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<CostRecovery> updateRecovery(
            @PathVariable Long id,
            @RequestBody CostRecovery recovery
    ) {

        CostRecovery updated =
                recoveryService.updateRecovery(
                        id,
                        recovery
                );

        return ResponseEntity.ok(updated);
    }


    // =========================================================
    // GET BY ID
    // GET /api/cost-recovery/{id}
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<CostRecovery> getRecoveryById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                recoveryService.getRecoveryById(id)
        );
    }


    // =========================================================
    // GET ALL
    // GET /api/cost-recovery
    // =========================================================

    @GetMapping
    public ResponseEntity<List<CostRecovery>> getAllRecoveries() {

        return ResponseEntity.ok(
                recoveryService.getAllRecoveries()
        );
    }


    // =========================================================
    // GET BY COST
    // GET /api/cost-recovery/cost/{costId}
    // =========================================================

    @GetMapping("/cost/{costId}")
    public ResponseEntity<List<CostRecovery>>
    getRecoveriesByCost(
            @PathVariable Long costId
    ) {

        return ResponseEntity.ok(
                recoveryService.getRecoveriesByCost(costId)
        );
    }


    // =========================================================
    // GET BY DEPARTMENT
    // GET /api/cost-recovery/department/{departmentId}
    // =========================================================

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<CostRecovery>>
    getRecoveriesByDepartment(
            @PathVariable Long departmentId
    ) {

        return ResponseEntity.ok(
                recoveryService
                        .getRecoveriesByDepartment(departmentId)
        );
    }


    // =========================================================
    // GET BY INSTITUTION
    // GET /api/cost-recovery/institution/{institutionId}
    // =========================================================

    @GetMapping("/institution/{institutionId}")
    public ResponseEntity<List<CostRecovery>>
    getRecoveriesByInstitution(
            @PathVariable Long institutionId
    ) {

        return ResponseEntity.ok(
                recoveryService
                        .getRecoveriesByInstitution(institutionId)
        );
    }


    // =========================================================
    // GET BY EQUIPMENT
    // GET /api/cost-recovery/equipment/{equipmentId}
    // =========================================================

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<CostRecovery>>
    getRecoveriesByEquipment(
            @PathVariable Long equipmentId
    ) {

        return ResponseEntity.ok(
                recoveryService
                        .getRecoveriesByEquipment(equipmentId)
        );
    }


    // =========================================================
    // GET BY STATUS
    // GET /api/cost-recovery/status/{status}
    // =========================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<CostRecovery>>
    getRecoveriesByStatus(
            @PathVariable ChargebackStatus status
    ) {

        return ResponseEntity.ok(
                recoveryService
                        .getRecoveriesByStatus(status)
        );
    }


    // =========================================================
    // GET BY DATE
    // GET /api/cost-recovery/date/{date}
    // =========================================================

    @GetMapping("/date/{date}")
    public ResponseEntity<List<CostRecovery>>
    getRecoveriesByDate(
            @PathVariable LocalDate date
    ) {

        return ResponseEntity.ok(
                recoveryService
                        .getRecoveriesByDate(date)
        );
    }


    // =========================================================
    // GET BY DATE RANGE
    // GET /api/cost-recovery/date-range
    // =========================================================

    @GetMapping("/date-range")
    public ResponseEntity<List<CostRecovery>>
    getRecoveriesByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {

        return ResponseEntity.ok(
                recoveryService
                        .getRecoveriesByDateRange(
                                startDate,
                                endDate
                        )
        );
    }


    // =========================================================
    // DEPARTMENT + STATUS
    // GET /api/cost-recovery/department/{id}/status/{status}
    // =========================================================

    @GetMapping(
            "/department/{departmentId}/status/{status}"
    )
    public ResponseEntity<List<CostRecovery>>
    getDepartmentRecoveriesByStatus(
            @PathVariable Long departmentId,
            @PathVariable ChargebackStatus status
    ) {

        return ResponseEntity.ok(
                recoveryService
                        .getDepartmentRecoveriesByStatus(
                                departmentId,
                                status
                        )
        );
    }


    // =========================================================
    // INSTITUTION + STATUS
    // GET /api/cost-recovery/institution/{id}/status/{status}
    // =========================================================

    @GetMapping(
            "/institution/{institutionId}/status/{status}"
    )
    public ResponseEntity<List<CostRecovery>>
    getInstitutionRecoveriesByStatus(
            @PathVariable Long institutionId,
            @PathVariable ChargebackStatus status
    ) {

        return ResponseEntity.ok(
                recoveryService
                        .getInstitutionRecoveriesByStatus(
                                institutionId,
                                status
                        )
        );
    }


    // =========================================================
    // EQUIPMENT + STATUS
    // GET /api/cost-recovery/equipment/{id}/status/{status}
    // =========================================================

    @GetMapping(
            "/equipment/{equipmentId}/status/{status}"
    )
    public ResponseEntity<List<CostRecovery>>
    getEquipmentRecoveriesByStatus(
            @PathVariable Long equipmentId,
            @PathVariable ChargebackStatus status
    ) {

        return ResponseEntity.ok(
                recoveryService
                        .getEquipmentRecoveriesByStatus(
                                equipmentId,
                                status
                        )
        );
    }


    // =========================================================
    // DEPARTMENT + DATE RANGE
    // GET /api/cost-recovery/department/{id}/date-range
    // =========================================================

    @GetMapping(
            "/department/{departmentId}/date-range"
    )
    public ResponseEntity<List<CostRecovery>>
    getDepartmentRecoveriesByDateRange(
            @PathVariable Long departmentId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {

        return ResponseEntity.ok(
                recoveryService
                        .getDepartmentRecoveriesByDateRange(
                                departmentId,
                                startDate,
                                endDate
                        )
        );
    }


    // =========================================================
    // INSTITUTION + DATE RANGE
    // GET /api/cost-recovery/institution/{id}/date-range
    // =========================================================

    @GetMapping(
            "/institution/{institutionId}/date-range"
    )
    public ResponseEntity<List<CostRecovery>>
    getInstitutionRecoveriesByDateRange(
            @PathVariable Long institutionId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {

        return ResponseEntity.ok(
                recoveryService
                        .getInstitutionRecoveriesByDateRange(
                                institutionId,
                                startDate,
                                endDate
                        )
        );
    }


    // =========================================================
    // STATUS + DATE RANGE
    // GET /api/cost-recovery/status/{status}/date-range
    // =========================================================

    @GetMapping(
            "/status/{status}/date-range"
    )
    public ResponseEntity<List<CostRecovery>>
    getRecoveriesByStatusAndDateRange(
            @PathVariable ChargebackStatus status,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {

        return ResponseEntity.ok(
                recoveryService
                        .getRecoveriesByStatusAndDateRange(
                                status,
                                startDate,
                                endDate
                        )
        );
    }


    // =========================================================
    // CALCULATE OUTSTANDING AMOUNT
    // GET /api/cost-recovery/calculate-outstanding
    // =========================================================

    @GetMapping("/calculate-outstanding")
    public ResponseEntity<Double>
    calculateOutstandingAmount(
            @RequestParam Double recoverableAmount,
            @RequestParam Double recoveredAmount
    ) {

        return ResponseEntity.ok(
                recoveryService.calculateOutstandingAmount(
                        recoverableAmount,
                        recoveredAmount
                )
        );
    }


    // =========================================================
    // CALCULATE OUTSTANDING FOR EXISTING RECORD
    // GET /api/cost-recovery/{id}/outstanding
    // =========================================================

    @GetMapping("/{id}/outstanding")
    public ResponseEntity<Double>
    calculateOutstandingAmount(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                recoveryService
                        .calculateOutstandingAmount(id)
        );
    }


    // =========================================================
    // UPDATE RECOVERED AMOUNT
    // PATCH /api/cost-recovery/{id}/recovered-amount
    // =========================================================

    @PatchMapping("/{id}/recovered-amount")
    public ResponseEntity<CostRecovery>
    updateRecoveredAmount(
            @PathVariable Long id,
            @RequestParam Double recoveredAmount
    ) {

        return ResponseEntity.ok(
                recoveryService.updateRecoveredAmount(
                        id,
                        recoveredAmount
                )
        );
    }


    // =========================================================
    // UPDATE CHARGEBACK STATUS
    // PATCH /api/cost-recovery/{id}/status
    // =========================================================

    @PatchMapping("/{id}/status")
    public ResponseEntity<CostRecovery>
    updateChargebackStatus(
            @PathVariable Long id,
            @RequestParam ChargebackStatus status
    ) {

        return ResponseEntity.ok(
                recoveryService.updateChargebackStatus(
                        id,
                        status
                )
        );
    }


    // =========================================================
    // MARK AS RECOVERED
    // PATCH /api/cost-recovery/{id}/mark-recovered
    // =========================================================

    @PatchMapping("/{id}/mark-recovered")
    public ResponseEntity<CostRecovery>
    markAsRecovered(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                recoveryService.markAsRecovered(id)
        );
    }


    // =========================================================
    // DELETE
    // DELETE /api/cost-recovery/{id}
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecovery(
            @PathVariable Long id
    ) {

        recoveryService.deleteRecovery(id);

        return ResponseEntity.noContent().build();
    }
}