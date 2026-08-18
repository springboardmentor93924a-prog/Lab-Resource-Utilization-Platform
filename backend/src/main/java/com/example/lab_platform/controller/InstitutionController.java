package com.example.lab_platform.controller;

import com.example.lab_platform.entity.Department;
import com.example.lab_platform.entity.Institution;
import com.example.lab_platform.entity.InstitutionDepartment;
import com.example.lab_platform.repository.DepartmentRepository;
import com.example.lab_platform.repository.InstitutionDepartmentRepository;
import com.example.lab_platform.repository.InstitutionRepository;
import com.example.lab_platform.dto.DepartmentLinkRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/institutions")
@CrossOrigin(origins = "http://localhost:5173")
public class InstitutionController {

    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final InstitutionDepartmentRepository institutionDepartmentRepository;

public InstitutionController(InstitutionRepository institutionRepository,
                              InstitutionDepartmentRepository institutionDepartmentRepository,
                            DepartmentRepository departmentRepository) {
    this.institutionRepository = institutionRepository;
    this.departmentRepository = departmentRepository;
    this.institutionDepartmentRepository = institutionDepartmentRepository;
}

// Public read — departments belonging to one institution, for Register.jsx cascade
@GetMapping("/{institutionId}/departments")
public List<Department> getDepartmentsForInstitution(@PathVariable Integer institutionId) {
    return institutionDepartmentRepository.findByInstitutionInstitutionId(institutionId)
            .stream()
            .map(InstitutionDepartment::getDepartment)
            .toList();
}

// Links an existing (or new) department to this institution.
// If the department name already exists in the global catalog, it's reused —
// no duplicate Department row is ever created, only a new link row.
@PostMapping("/{institutionId}/departments")
@PreAuthorize("hasAnyRole('INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
public ResponseEntity<?> addDepartmentToInstitution(
        @PathVariable Integer institutionId,
        @RequestBody DepartmentLinkRequest request) {

    Institution institution = institutionRepository.findById(institutionId)
            .orElseThrow(() -> new RuntimeException("Institution not found"));

    Department department;

    if (request.getDepartmentId() != null) {
        department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));
    } else {
        // reuse by name if it already exists in the catalog, else create it once
        department = departmentRepository.findByDepartmentNameIgnoreCase(request.getDepartmentName())
                .orElseGet(() -> {
                    Department d = new Department();
                    d.setDepartmentName(request.getDepartmentName());
                    return departmentRepository.save(d);
                });
    }

    boolean alreadyLinked = institutionDepartmentRepository
            .existsByInstitutionInstitutionIdAndDepartmentDepartmentId(
                    institutionId, department.getDepartmentId());

    if (alreadyLinked) {
        return ResponseEntity.badRequest().body("Department already linked to this institution");
    }

    InstitutionDepartment link = new InstitutionDepartment(institution, department);
    institutionDepartmentRepository.save(link);

    return ResponseEntity.ok(department);
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