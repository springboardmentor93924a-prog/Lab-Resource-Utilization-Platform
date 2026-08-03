package com.labplatform.controller;

import com.labplatform.dto.ApiResponse;
import com.labplatform.dto.EquipmentRequest;
import com.labplatform.entity.Equipment;
import com.labplatform.entity.EquipmentStatus;
import com.labplatform.service.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Equipment>>> all(@RequestParam(required = false) Long institutionId,
                                                              @RequestParam(required = false) String q) {
        List<Equipment> result;
        if (q != null && !q.isBlank()) {
            result = equipmentService.search(q);
        } else if (institutionId != null) {
            result = equipmentService.listByInstitution(institutionId);
        } else {
            result = equipmentService.listAll();
        }
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Equipment>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(equipmentService.get(id)));
    }

    @GetMapping("/sharable")
    public ResponseEntity<ApiResponse<List<Equipment>>> sharable() {
        return ResponseEntity.ok(ApiResponse.ok(equipmentService.sharableEquipment()));
    }

    @GetMapping("/calibration-due")
    @PreAuthorize("hasAnyRole('LAB_MANAGER','LAB_TECHNICIAN','DEPARTMENT_HEAD','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<List<Equipment>>> calibrationDue(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.ok(equipmentService.calibrationDueSoon(days)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('LAB_MANAGER','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Equipment>> create(@RequestBody EquipmentRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Equipment created", equipmentService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LAB_MANAGER','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Equipment>> update(@PathVariable Long id, @RequestBody EquipmentRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Equipment updated", equipmentService.update(id, req)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('LAB_MANAGER','LAB_TECHNICIAN','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Equipment>> updateStatus(@PathVariable Long id, @RequestParam EquipmentStatus status) {
        return ResponseEntity.ok(ApiResponse.ok("Status updated", equipmentService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        equipmentService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Equipment deleted", null));
    }
}
