
package com.labresource.controller;

import com.labresource.entity.SharedEquipment;
import com.labresource.service.SharedEquipmentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shared-equipment")
@CrossOrigin(origins = "http://localhost:5173")
public class SharedEquipmentController {

    private final SharedEquipmentService
            sharedEquipmentService;

    public SharedEquipmentController(
            SharedEquipmentService sharedEquipmentService
    ) {
        this.sharedEquipmentService =
                sharedEquipmentService;
    }

    // =========================================================
    // GET ALL
    // =========================================================

    @GetMapping
    public ResponseEntity<List<SharedEquipment>>
    getAllSharedEquipment() {

        return ResponseEntity.ok(
                sharedEquipmentService
                        .getAllSharedEquipment()
        );
    }

    // =========================================================
    // GET AVAILABLE
    // =========================================================

    @GetMapping("/available")
    public ResponseEntity<List<SharedEquipment>>
    getAvailableSharedEquipment() {

        return ResponseEntity.ok(
                sharedEquipmentService
                        .getAvailableSharedEquipment()
        );
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getSharedEquipment(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    sharedEquipmentService
                            .getSharedEquipment(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // =========================================================
    // GET BY OWNER INSTITUTION
    // =========================================================

    @GetMapping("/owner/{institutionId}")
    public ResponseEntity<List<SharedEquipment>>
    getByOwnerInstitution(
            @PathVariable Long institutionId
    ) {

        return ResponseEntity.ok(
                sharedEquipmentService
                        .getByOwnerInstitution(
                                institutionId
                        )
        );
    }

    // =========================================================
    // GET SHARED WITH INSTITUTION
    // =========================================================

    @GetMapping("/institution/{institutionId}")
    public ResponseEntity<List<SharedEquipment>>
    getBySharedWithInstitution(
            @PathVariable Long institutionId
    ) {

        return ResponseEntity.ok(
                sharedEquipmentService
                        .getBySharedWithInstitution(
                                institutionId
                        )
        );
    }

    // =========================================================
    // CREATE SHARING
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createSharedEquipment(

            @RequestParam Long equipmentId,

            @RequestParam Long ownerInstitutionId,

            @RequestParam Long sharedWithInstitutionId,

            @RequestParam(required = false)
            String sharingNotes

    ) {

        try {

            SharedEquipment result =
                    sharedEquipmentService
                            .createSharedEquipment(
                                    equipmentId,
                                    ownerInstitutionId,
                                    sharedWithInstitutionId,
                                    sharingNotes
                            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(result);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSharedEquipment(

            @PathVariable Long id,

            @RequestParam(required = false)
            Boolean available,

            @RequestParam(required = false)
            String sharingStatus,

            @RequestParam(required = false)
            String sharingNotes

    ) {

        try {

            return ResponseEntity.ok(
                    sharedEquipmentService
                            .updateSharedEquipment(
                                    id,
                                    available,
                                    sharingStatus,
                                    sharingNotes
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // DELETE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSharedEquipment(
            @PathVariable Long id
    ) {

        try {

            sharedEquipmentService
                    .deleteSharedEquipment(id);

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}