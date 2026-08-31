package com.infosys.labresource.cost.Controller;

import com.infosys.labresource.cost.dtos.CostResponseDTO;
import com.infosys.labresource.cost.dtos.CostSummaryDTO;
import com.infosys.labresource.cost.service.CostService;
import lombok.*;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/cost")
@RequiredArgsConstructor
public class CostController {
    private final CostService costService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN')")
    public ResponseEntity<List<CostResponseDTO>> getAllCosts() {
        return ResponseEntity.ok(costService.getAllCosts());
    }

    @GetMapping("/equipment/{equipId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','LAB_MANAGER','DEPARTMENT_HEAD')")
    public ResponseEntity<List<CostResponseDTO>> getCostByEquipment(@PathVariable Long equipId) {
        return ResponseEntity.ok(costService.getCostByEquipment(equipId));
    }

    @GetMapping("/department/{deptId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','DEPARTMENT_HEAD','LAB_MANAGER')")
    public ResponseEntity<CostSummaryDTO> getCostByDepartment(@PathVariable Long deptId) {
        return ResponseEntity.ok(costService.getCostByDepartment(deptId));
    }

    @GetMapping("/institution/{instId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN')")
    public ResponseEntity<CostSummaryDTO> getCostByInstitution(@PathVariable Long instId) {
        return ResponseEntity.ok(costService.getCostByInstitution(instId));
    }

    // inter institution billing, what other institutions owe this one for shared equipment usage
    @GetMapping("/billing/{instId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN')")
    public ResponseEntity<CostSummaryDTO> getBillingForInstitution(@PathVariable Long instId) {
        return ResponseEntity.ok(costService.getBillingForInstitution(instId));
    }
}
