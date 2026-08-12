package com.example.demo.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Equipment;
import com.example.demo.repository.DepartmentRepository;
import com.example.demo.repository.EquipmentCategoryRepository;
import com.example.demo.repository.EquipmentRepository;
import com.example.demo.repository.InstitutionRepository;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    @Autowired private EquipmentRepository equipmentRepository;
    @Autowired private EquipmentCategoryRepository categoryRepository;
    @Autowired private DepartmentRepository departmentRepository;
    @Autowired private InstitutionRepository institutionRepository;

    @GetMapping("/shared")
    public List<Equipment> sharedEquipment() {
        return equipmentRepository.findAll().stream()
                .filter(e -> Boolean.TRUE.equals(e.getSharedAvailable()))
                .collect(java.util.stream.Collectors.toList());
    }

    @PutMapping("/{id}/share")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('INSTITUTION_ADMINISTRATOR') or hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<?> toggleShare(@PathVariable Integer id, @RequestBody Map<String, Boolean> body) {
        if (!equipmentRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Equipment not found"));
        }
        Equipment eq = equipmentRepository.findById(id).get();
        eq.setSharedAvailable(body.get("shared"));
        eq.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(equipmentRepository.save(eq));
    }

    @GetMapping("/idle-report")
    public List<Map<String, Object>> idleReport() {
        return equipmentRepository.findAll().stream()
                .filter(e -> "Available".equals(e.getStatus()))
                .sorted((a, b) -> a.getUpdatedAt().compareTo(b.getUpdatedAt()))
                .map(e -> {
                    long idleHours = java.time.Duration.between(e.getUpdatedAt(), java.time.LocalDateTime.now()).toHours();
                    Map<String, Object> row = new java.util.LinkedHashMap<>();
                    row.put("equipmentId", e.getEquipmentId());
                    row.put("name", e.getName());
                    row.put("category", e.getCategory().getCategoryName());
                    row.put("idleHours", idleHours);
                    return row;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/status-summary")
    public Map<String, Long> statusSummary() {
        return equipmentRepository.findAll().stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        Equipment::getStatus, java.util.stream.Collectors.counting()));
    }

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
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('INSTITUTION_ADMINISTRATOR') or hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<?> create(@RequestBody Equipment equipment) {
        if (!categoryRepository.existsById(equipment.getCategory().getCategoryId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid categoryId"));
        }
        if (!departmentRepository.existsById(equipment.getDepartment().getDepartmentId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid departmentId"));
        }
        if (!institutionRepository.existsById(equipment.getInstitution().getInstitutionId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid institutionId"));
        }
        equipment.setCategory(categoryRepository.findById(equipment.getCategory().getCategoryId()).get());
        equipment.setDepartment(departmentRepository.findById(equipment.getDepartment().getDepartmentId()).get());
        equipment.setInstitution(institutionRepository.findById(equipment.getInstitution().getInstitutionId()).get());
        equipment.setCreatedAt(LocalDateTime.now());
        equipment.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(equipmentRepository.save(equipment));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('INSTITUTION_ADMINISTRATOR') or hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Equipment updated) {
        if (!equipmentRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Equipment not found"));
        }
        Equipment existing = equipmentRepository.findById(id).get();
        updated.setEquipmentId(id);
        updated.setCategory(categoryRepository.findById(updated.getCategory().getCategoryId()).get());
        updated.setDepartment(departmentRepository.findById(updated.getDepartment().getDepartmentId()).get());
        updated.setInstitution(institutionRepository.findById(updated.getInstitution().getInstitutionId()).get());
        updated.setCreatedAt(existing.getCreatedAt());
        updated.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(equipmentRepository.save(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('INSTITUTION_ADMINISTRATOR') or hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (!equipmentRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Equipment not found"));
        }
        equipmentRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Equipment deleted"));
    }
}


