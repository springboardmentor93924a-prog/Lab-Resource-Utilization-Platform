package com.labresource.controller;

import com.labresource.entity.Institution;
import com.labresource.service.InstitutionService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/institutions")
@CrossOrigin(origins = "http://localhost:5173")
public class InstitutionController {

    private final InstitutionService institutionService;

    public InstitutionController(
            InstitutionService institutionService
    ) {
        this.institutionService = institutionService;
    }

    // GET ALL
    @GetMapping
    public ResponseEntity<List<Institution>>
    getAllInstitutions() {

        return ResponseEntity.ok(
                institutionService.getAllInstitutions()
        );
    }

    // GET ACTIVE
    @GetMapping("/active")
    public ResponseEntity<List<Institution>>
    getActiveInstitutions() {

        return ResponseEntity.ok(
                institutionService.getActiveInstitutions()
        );
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getInstitution(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    institutionService.getInstitution(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // CREATE
    @PostMapping
    public ResponseEntity<?> createInstitution(
            @RequestBody Institution institution
    ) {

        try {

            Institution saved =
                    institutionService
                            .createInstitution(
                                    institution
                            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(saved);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<?> updateInstitution(
            @PathVariable Long id,
            @RequestBody Institution institution
    ) {

        try {

            return ResponseEntity.ok(
                    institutionService.updateInstitution(
                            id,
                            institution
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // DELETE / DEACTIVATE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInstitution(
            @PathVariable Long id
    ) {

        try {

            institutionService.deleteInstitution(id);

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