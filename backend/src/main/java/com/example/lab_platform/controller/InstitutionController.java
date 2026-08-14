package com.example.lab_platform.controller;

import com.example.lab_platform.entity.Institution;
import com.example.lab_platform.repository.InstitutionRepository;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/institutions")
@CrossOrigin(origins = "http://localhost:5173")
public class InstitutionController {

    private final InstitutionRepository institutionRepository;

    public InstitutionController(InstitutionRepository institutionRepository) {
        this.institutionRepository = institutionRepository;
    }

    // Public read — needed so any logged-in user can populate the
    // institution dropdown when creating a sharing request.
    @GetMapping
    public List<Institution> getAllInstitutions() {
        return institutionRepository.findAll();
    }

    // Restricted write — same pattern as DepartmentController
    @PostMapping
    @PreAuthorize("hasAnyRole('INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public Institution createInstitution(@RequestBody Institution institution) {
        return institutionRepository.save(institution);
    }
}