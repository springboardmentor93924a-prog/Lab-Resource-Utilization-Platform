package com.labplatform.controller;

import com.labplatform.entity.Equipment;
import com.labplatform.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EquipmentController {

    private final EquipmentRepository equipmentRepository;

    // 1. GET ALL: GET http://localhost:8080/api/equipment
    @GetMapping
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    // 2. GET BY ID: GET http://localhost:8080/api/equipment/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Equipment> getEquipmentById(@PathVariable Long id) {
        return equipmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. CREATE: POST http://localhost:8080/api/equipment
    @PostMapping
    public ResponseEntity<Equipment> addEquipment(@RequestBody Equipment equipment) {
        Equipment saved = equipmentRepository.save(equipment);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // 4. UPDATE: PUT http://localhost:8080/api/equipment/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Equipment> updateEquipment(@PathVariable Long id, @RequestBody Equipment updatedEquipment) {
        if (!equipmentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        updatedEquipment.setId(id);
        return ResponseEntity.ok(equipmentRepository.save(updatedEquipment));
    }

    // 5. DELETE: DELETE http://localhost:8080/api/equipment/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipment(@PathVariable Long id) {
        if (!equipmentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        equipmentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}