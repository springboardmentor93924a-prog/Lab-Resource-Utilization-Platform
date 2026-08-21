package com.example.lab_platform.controller;

import com.example.lab_platform.entity.EquipmentCertification;
import com.example.lab_platform.service.CertificationService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certifications")
@CrossOrigin(origins = "http://localhost:5173")
public class CertificationController {

    private final CertificationService certificationService;

    public CertificationController(CertificationService certificationService) {
        this.certificationService = certificationService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public List<EquipmentCertification> getAllCertifications() {
        return certificationService.getAllCertifications();
    }

    @GetMapping("/equipment/{equipmentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LAB_TECHNICIAN', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<List<EquipmentCertification>> getByEquipment(@PathVariable Integer equipmentId) {
        return ResponseEntity.ok(certificationService.getCertificationsByEquipment(equipmentId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<EquipmentCertification> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(certificationService.getCertificationById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<EquipmentCertification> create(@RequestBody EquipmentCertification certification) {
        return ResponseEntity.ok(certificationService.createCertification(certification));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<EquipmentCertification> update(
            @PathVariable Integer id, @RequestBody EquipmentCertification certification) {
        return ResponseEntity.ok(certificationService.updateCertification(id, certification));
    }

    @GetMapping("/expiring-soon")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<List<EquipmentCertification>> getExpiringSoon(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(certificationService.getExpiringSoon(days));
    }

    @GetMapping("/expired")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<List<EquipmentCertification>> getExpired() {
        return ResponseEntity.ok(certificationService.getExpired());
    }
}