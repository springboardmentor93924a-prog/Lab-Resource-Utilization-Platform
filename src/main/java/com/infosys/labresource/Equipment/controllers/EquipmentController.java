package com.infosys.labresource.Equipment.controllers;

import com.infosys.labresource.Equipment.dtos.EquipmentRequestDTO;
import com.infosys.labresource.Equipment.dtos.EquipmentResponseDTO;
import com.infosys.labresource.Equipment.services.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {
    private final EquipmentService equipmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','LAB_MANAGER','LAB_TECHNICIAN')")
    public ResponseEntity<EquipmentResponseDTO> addEquipment(@RequestBody EquipmentRequestDTO requestDTO) {

        EquipmentResponseDTO equipment = equipmentService.addEquipment(requestDTO);
        return new ResponseEntity<>(equipment, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EquipmentResponseDTO>> getAllEquipment() {

        return ResponseEntity.ok(equipmentService.getAllEquipment());
    }

    @GetMapping("/{equipmentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EquipmentResponseDTO> getEquipmentById(
            @PathVariable Long equipmentId) {

        return ResponseEntity.ok(
                equipmentService.getEquipmentById(equipmentId));
    }

    @PutMapping("/{equipmentId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','LAB_MANAGER','LAB_TECHNICIAN')")
    public ResponseEntity<EquipmentResponseDTO> updateEquipment(
            @PathVariable Long equipmentId,
            @RequestBody EquipmentRequestDTO requestDTO) {

        return ResponseEntity.ok(
                equipmentService.updateEquipment(equipmentId, requestDTO));
    }

    @DeleteMapping("/{equipmentId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','LAB_MANAGER')")
    public ResponseEntity<String> deleteEquipment(
            @PathVariable Long equipmentId) {

        equipmentService.deleteEquipment(equipmentId);

        return ResponseEntity.ok("Equipment deleted successfully.");
    }
}
