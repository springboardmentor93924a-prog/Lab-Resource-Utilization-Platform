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

    // Add new equipment
    @PostMapping
    public ResponseEntity<Equipment> createEquipment(@RequestBody Equipment equipment) {
        Equipment savedEquipment = equipmentRepository.save(equipment);
        return ResponseEntity.ok(savedEquipment);
    }

    // Update equipment
    @PutMapping("/{id}")
    public ResponseEntity<Equipment> updateEquipment(@PathVariable Integer id, @RequestBody Equipment updatedEquipment) {
        return equipmentRepository.findById(id)
                .map(eq -> {
                    eq.setEquipmentName(updatedEquipment.getEquipmentName());
                    eq.setCategory(updatedEquipment.getCategory());
                    eq.setSerialNumber(updatedEquipment.getSerialNumber());
                    eq.setLocation(updatedEquipment.getLocation());
                    eq.setStatus(updatedEquipment.getStatus());
                    eq.setPurchaseDate(updatedEquipment.getPurchaseDate());
                    Equipment saved = equipmentRepository.save(eq);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete equipment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipment(@PathVariable Integer id) {
        if (equipmentRepository.existsById(id)) {
            equipmentRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
