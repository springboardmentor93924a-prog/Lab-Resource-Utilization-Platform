package com.labplatform.controller;

import com.labplatform.dto.ApiResponse;
import com.labplatform.entity.CostRecord;
import com.labplatform.service.CostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/costs")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('LAB_MANAGER','DEPARTMENT_HEAD','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
public class CostController {

    private final CostService costService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CostRecord>>> all() {
        return ResponseEntity.ok(ApiResponse.ok(costService.all()));
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<ApiResponse<List<CostRecord>>> forEquipment(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(ApiResponse.ok(costService.forEquipment(equipmentId)));
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<ApiResponse<List<CostRecord>>> forDepartment(@PathVariable String department) {
        return ResponseEntity.ok(ApiResponse.ok(costService.forDepartment(department)));
    }
}
