package com.example.lab_platform.controller;

import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.repository.EquipmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@CrossOrigin(origins = "http://localhost:5173")
public class EquipmentController {

    private final EquipmentRepository equipmentRepository;

    public EquipmentController(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    // Get all equipment
    @GetMapping
    public ResponseEntity<List<Equipment>> getAllEquipment() {
        return ResponseEntity.ok(equipmentRepository.findAll());
    }

    // Get equipment by ID
    @GetMapping("/{id}")
    public ResponseEntity<Equipment> getEquipmentById(@PathVariable Integer id) {
        return equipmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create / Save equipment
    @PostMapping
    public ResponseEntity<Equipment> createEquipment(@RequestBody Equipment equipment) {
        Equipment savedEquipment = equipmentRepository.save(equipment);
        return ResponseEntity.ok(savedEquipment);
    }
// to update the status of equipment
    @PutMapping("/{id}/status")
public ResponseEntity<Equipment> updateEquipmentStatus(
        @PathVariable Integer id,
        @RequestParam String status) {

    return equipmentRepository.findById(id)
            .map(equipment -> {
                equipment.setStatus(status);
                Equipment updatedEquipment = equipmentRepository.save(equipment);
                return ResponseEntity.ok(updatedEquipment);
            })
            .orElse(ResponseEntity.notFound().build());
}
}
