package com.example.lab_platform.controller;

import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.service.EquipmentService;
import com.example.lab_platform.service.RealtimeUpdateService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@CrossOrigin(origins = "${app.frontend-base-url}")
public class EquipmentController {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentService equipmentService;
    private final RealtimeUpdateService realtimeUpdateService;

    public EquipmentController(
            EquipmentRepository equipmentRepository,
            EquipmentService equipmentService,
            RealtimeUpdateService realtimeUpdateService) {

        this.equipmentRepository = equipmentRepository;
        this.equipmentService = equipmentService;
        this.realtimeUpdateService = realtimeUpdateService;
    }

    private User getLoggedInUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
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
    // LAB_MANAGER only. Equipment is the lab manager's operational
    // responsibility — technicians, institution admins, and system
    // admins are oversight/support roles, not equipment owners, same
    // split already used for booking approve/reject elsewhere in
    // this controller family (see BookingController).
    // =========================================================

    @PreAuthorize("hasRole('LAB_MANAGER')")
    @PostMapping
    public ResponseEntity<Equipment> createEquipment(
            @RequestBody Equipment equipment) {

        if (equipment.getStatus() == null
                || equipment.getStatus().isBlank()) {

            equipment.setStatus("Available");
        }

        /*
         * Institution and department are NEVER trusted from the request
         * body — always the logged-in manager's own registered
         * institution/department, no exceptions. Previously the client
         * could send (or the Add Equipment form could submit) any
         * institution/department id at all, letting a Lab Manager
         * silently create equipment under a completely different
         * college than their own. There is intentionally no dropdown
         * for this on the frontend anymore — it's not a choice.
         */
        User loggedInUser = getLoggedInUser();

        if (loggedInUser.getInstitution() == null
                || loggedInUser.getDepartment() == null) {
            throw new RuntimeException(
                    "Your account is not linked to an institution and department — contact an admin before adding equipment."
            );
        }

        equipment.setInstitution(loggedInUser.getInstitution());
        equipment.setDepartment(loggedInUser.getDepartment());

        // Purchase cost and hourly rate come from the Add Equipment form.
        // A missing rate defaults to 0; negative numbers are rejected.
        if (equipment.getRatePerHour() == null) {
            equipment.setRatePerHour(0.0);
        }

        if (equipment.getRatePerHour() < 0
                || (equipment.getPurchaseCost() != null && equipment.getPurchaseCost() < 0)) {
            throw new RuntimeException(
                    "Purchase cost and rate per hour cannot be negative."
            );
        }

        Equipment savedEquipment =
                equipmentRepository.save(equipment);

        realtimeUpdateService.pingEquipmentUpdated();

        return ResponseEntity.ok(
                savedEquipment
        );
    }

    // =========================================================
    // UPDATE EQUIPMENT
    // LAB_MANAGER only — see CREATE EQUIPMENT above for why.
    // =========================================================

    @PreAuthorize("hasRole('LAB_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<Equipment> updateEquipment(
            @PathVariable Integer id,
            @RequestBody Equipment updatedEquipment) {

        return equipmentRepository
                .findById(id)
                .map(eq -> {

                    assertOwnsEquipment(eq);

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

                    // Purchase cost and rate per hour were silently dropped
                    // on edit before (the form sent them, the server ignored
                    // them). Only overwrite when a value is actually sent.
                    if (updatedEquipment.getPurchaseCost() != null) {
                        if (updatedEquipment.getPurchaseCost() < 0) {
                            throw new RuntimeException("Purchase cost cannot be negative.");
                        }
                        eq.setPurchaseCost(updatedEquipment.getPurchaseCost());
                    }

                    if (updatedEquipment.getRatePerHour() != null) {
                        if (updatedEquipment.getRatePerHour() < 0) {
                            throw new RuntimeException("Rate per hour cannot be negative.");
                        }
                        eq.setRatePerHour(updatedEquipment.getRatePerHour());
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

                    /*
                     * Institution and department are intentionally NOT
                     * editable here, in either direction — equipment
                     * stays permanently tied to whatever institution/
                     * department it was created under (the manager's
                     * own, set in createEquipment()). Previously this
                     * let a manager reassign existing equipment to a
                     * completely different college's department via
                     * the Edit form, same underlying issue as create.
                     */

                    Equipment saved =
                            equipmentRepository.save(eq);

                    realtimeUpdateService.pingEquipmentUpdated();

                    return ResponseEntity.ok(saved);

                })
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }

    // =========================================================
    // DELETE EQUIPMENT
    // LAB_MANAGER only — see CREATE EQUIPMENT above for why.
    // =========================================================

    @PreAuthorize("hasRole('LAB_MANAGER')")
@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteEquipment(
        @PathVariable Integer id) {

    return equipmentRepository.findById(id)
            .map(eq -> {
                assertOwnsEquipment(eq);
                equipmentRepository.deleteById(id);
                realtimeUpdateService.pingEquipmentUpdated();
                return ResponseEntity.noContent().<Void>build();   // witness on build(), not noContent()
            })
            .orElse(ResponseEntity.notFound().build());
}

    // =========================================================
    // OWNERSHIP CHECK — a Lab Manager may only edit/delete
    // equipment that belongs to their OWN institution AND
    // department. Previously update/delete were gated only by
    // "hasRole('LAB_MANAGER')", which let any manager on the
    // platform modify or delete any equipment by id, regardless
    // of who it actually belonged to. This mirrors the ownership
    // check already used correctly in MaintenanceServiceImpl.
    // =========================================================
    private void assertOwnsEquipment(Equipment equipment) {

        User loggedInUser = getLoggedInUser();

        boolean owns = loggedInUser.getInstitution() != null
                && loggedInUser.getDepartment() != null
                && equipment.getInstitution() != null
                && equipment.getDepartment() != null
                && loggedInUser.getInstitution().getInstitutionId()
                        .equals(equipment.getInstitution().getInstitutionId())
                && loggedInUser.getDepartment().getDepartmentId()
                        .equals(equipment.getDepartment().getDepartmentId());

        if (!owns) {
            throw new RuntimeException(
                    "You can only manage equipment that belongs to your own institution and department"
            );
        }
    }
}