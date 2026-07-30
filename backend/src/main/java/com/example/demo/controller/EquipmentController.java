package com.example.demo.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Equipment;
import com.example.demo.repository.EquipmentRepository;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    @Autowired
    private EquipmentRepository equipmentRepository;

    @GetMapping
    public List<Equipment> getAll() {
        return equipmentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Integer id) {
        if (!equipmentRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Equipment not found"));
        }
        return ResponseEntity.ok(equipmentRepository.findById(id).get());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Equipment equipment) {
        equipment.setCreatedAt(LocalDateTime.now());
        equipment.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(equipmentRepository.save(equipment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Equipment updated) {
        if (!equipmentRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Equipment not found"));
        }
        Equipment existing = equipmentRepository.findById(id).get();
        updated.setEquipmentId(id);
        updated.setCreatedAt(existing.getCreatedAt());
        updated.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(equipmentRepository.save(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (!equipmentRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Equipment not found"));
        }
        equipmentRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Equipment deleted"));
    }
}