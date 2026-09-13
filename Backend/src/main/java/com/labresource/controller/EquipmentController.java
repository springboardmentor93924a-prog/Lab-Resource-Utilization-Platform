package com.labresource.controller;

import com.labresource.entity.Equipment;
import com.labresource.repository.EquipmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@CrossOrigin(origins = "http://localhost:5173")
public class EquipmentController {

    private final EquipmentRepository equipmentRepository;

    public EquipmentController(
            EquipmentRepository equipmentRepository
    ) {
        this.equipmentRepository = equipmentRepository;
    }

    @GetMapping
    public ResponseEntity<List<Equipment>> getAllEquipment() {
        return ResponseEntity.ok(
                equipmentRepository.findAll()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Equipment> getEquipmentById(
            @PathVariable Long id
    ) {
        return equipmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}