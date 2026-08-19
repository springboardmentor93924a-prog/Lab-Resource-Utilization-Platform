package com.example.lab_platform.controller;

import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.service.EquipmentService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@CrossOrigin(origins = "http://localhost:5173")
public class EquipmentController {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentService equipmentService;

    public EquipmentController(
            EquipmentRepository equipmentRepository,
            EquipmentService equipmentService) {

        this.equipmentRepository = equipmentRepository;
        this.equipmentService = equipmentService;
    }

    // =========================================================
    // GET ALL EQUIPMENT
    // All authenticated Milestone 2 roles can view equipment
    // =========================================================

    @PreAuthorize("""
        hasAnyRole(
            'STUDENT',
            'LAB_TECHNICIAN',
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)
    @GetMapping
    public ResponseEntity<List<Equipment>> getAllEquipment() {

        return ResponseEntity.ok(
                equipmentService.getAllEquipment()
        );
    }

    // =========================================================
    // GET EQUIPMENT BY ID
    // =========================================================

    @PreAuthorize("""
        hasAnyRole(
            'STUDENT',
            'LAB_TECHNICIAN',
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)
    @GetMapping("/{id}")
    public ResponseEntity<Equipment> getEquipmentById(
            @PathVariable Integer id) {

        try {

            return ResponseEntity.ok(
                    equipmentService.getEquipmentById(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity.notFound().build();
        }
    }

    // =========================================================
    // CREATE EQUIPMENT
    // Technician / Manager / Institution Admin / System Admin
    // =========================================================

    @PreAuthorize("""
        hasAnyRole(
            'LAB_TECHNICIAN',
            'LAB_MANAGER',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)
    @PostMapping
    public ResponseEntity<Equipment> createEquipment(
            @RequestBody Equipment equipment) {

        if (equipment.getStatus() == null
                || equipment.getStatus().isBlank()) {

            equipment.setStatus("Available");
        }

        Equipment savedEquipment =
                equipmentRepository.save(equipment);

        return ResponseEntity.ok(
                savedEquipment
        );
    }

    // =========================================================
    // UPDATE EQUIPMENT
    // Technician / Manager / Institution Admin / System Admin
    // =========================================================

    @PreAuthorize("""
        hasAnyRole(
            'LAB_TECHNICIAN',
            'LAB_MANAGER',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)
    @PutMapping("/{id}")
    public ResponseEntity<Equipment> updateEquipment(
            @PathVariable Integer id,
            @RequestBody Equipment updatedEquipment) {

        return equipmentRepository
                .findById(id)
                .map(eq -> {

                    eq.setEquipmentName(
                            updatedEquipment.getEquipmentName()
                    );

                    eq.setCategory(
                            updatedEquipment.getCategory()
                    );

                    eq.setSerialNumber(
                            updatedEquipment.getSerialNumber()
                    );

                    eq.setLocation(
                            updatedEquipment.getLocation()
                    );

                    eq.setPurchaseDate(
                            updatedEquipment.getPurchaseDate()
                    );

                    /*
                     * Status was silently dropped here before — the
                     * edit form could set requiresApproval/department/
                     * institution but never status, so marking
                     * equipment "Out of Service" or "Retired" from
                     * the Edit form returned 200 OK but never
                     * persisted. The scheduler treats these two
                     * values as sticky/manual (never auto-overwrites
                     * them), so this is the only way to set them.
                     */
                    if (updatedEquipment.getStatus() != null
                            && !updatedEquipment.getStatus().isBlank()) {
                        eq.setStatus(
                                updatedEquipment.getStatus()
                        );
                    }

                    // requiresApproval, department and institution are
                    // part of the equipment record and matter to the
                    // approval workflow / sharing scoping — they were
                    // previously silently ignored on update.
                    if (updatedEquipment.getRequiresApproval() != null) {
                        eq.setRequiresApproval(
                                updatedEquipment.getRequiresApproval()
                        );
                    }

                    if (updatedEquipment.getDepartment() != null
                            && updatedEquipment.getDepartment().getDepartmentId() != null) {
                        eq.setDepartment(
                                updatedEquipment.getDepartment()
                        );
                    }

                    if (updatedEquipment.getInstitution() != null
                            && updatedEquipment.getInstitution().getInstitutionId() != null) {
                        eq.setInstitution(
                                updatedEquipment.getInstitution()
                        );
                    }

                    Equipment saved =
                            equipmentRepository.save(eq);

                    return ResponseEntity.ok(saved);

                })
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }

    // =========================================================
    // DELETE EQUIPMENT
    // Manager / Institution Admin / System Admin
    // =========================================================

    @PreAuthorize("""
        hasAnyRole(
            'LAB_MANAGER',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipment(
            @PathVariable Integer id) {

        if (equipmentRepository.existsById(id)) {

            equipmentRepository.deleteById(id);

            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.notFound().build();
    }
}