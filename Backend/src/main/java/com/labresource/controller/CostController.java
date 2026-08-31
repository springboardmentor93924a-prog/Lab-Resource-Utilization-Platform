
package com.labresource.controller;

import com.labresource.entity.Cost;
import com.labresource.service.CostService;

import com.labresource.dto.DepartmentCostAllocationDTO;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/costs")
@CrossOrigin(origins = "http://localhost:5173")
public class CostController {

    private final CostService costService;

    public CostController(CostService costService) {
        this.costService = costService;
    }

    // =========================================================
    // CREATE COST
    // =========================================================

    @PostMapping
    public ResponseEntity<Cost> createCost(@RequestBody Cost cost) {

        Cost createdCost = costService.createCost(cost);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdCost);
    }

    // =========================================================
    // GET ALL COSTS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Cost>> getAllCosts() {

        List<Cost> costs = costService.getAllCosts();

        return ResponseEntity.ok(costs);
    }


    // =========================================================
// 3.9 DEPARTMENT-WISE COST ALLOCATION
// =========================================================

@GetMapping("/department-allocation")
public ResponseEntity<List<DepartmentCostAllocationDTO>>
getDepartmentCostAllocation() {

    List<DepartmentCostAllocationDTO> allocation =
            costService.getDepartmentCostAllocation();

    return ResponseEntity.ok(allocation);
}


    // =========================================================
    // GET COST BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Cost> getCostById(@PathVariable Long id) {

        Cost cost = costService.getCostById(id);

        return ResponseEntity.ok(cost);
    }

    // =========================================================
    // UPDATE COST
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<Cost> updateCost(
            @PathVariable Long id,
            @RequestBody Cost cost) {

        Cost updatedCost = costService.updateCost(id, cost);

        return ResponseEntity.ok(updatedCost);
    }

    // =========================================================
    // DELETE COST
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCost(@PathVariable Long id) {

        costService.deleteCost(id);

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // CALCULATE COST
    // =========================================================

    @PostMapping("/{id}/calculate")
    public ResponseEntity<Double> calculateCost(@PathVariable Long id) {

        Double totalCost = costService.calculateCost(id);

        return ResponseEntity.ok(totalCost);
    }
}
