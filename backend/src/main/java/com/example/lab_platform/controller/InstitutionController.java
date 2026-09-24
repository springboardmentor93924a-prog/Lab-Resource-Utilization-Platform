package com.example.lab_platform.controller;

import com.example.lab_platform.dto.DepartmentDTO;
import com.example.lab_platform.dto.DepartmentLinkRequest;
import com.example.lab_platform.dto.InstitutionDTO;
import com.example.lab_platform.entity.Department;
import com.example.lab_platform.entity.Institution;
import com.example.lab_platform.entity.InstitutionDepartment;
import com.example.lab_platform.repository.DepartmentRepository;
import com.example.lab_platform.repository.InstitutionDepartmentRepository;
import com.example.lab_platform.repository.InstitutionRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/institutions")
@CrossOrigin(origins = "${app.frontend-base-url}")
public class InstitutionController {

    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final InstitutionDepartmentRepository institutionDepartmentRepository;

    public InstitutionController(
            InstitutionRepository institutionRepository,
            InstitutionDepartmentRepository institutionDepartmentRepository,
            DepartmentRepository departmentRepository) {

        this.institutionRepository = institutionRepository;
        this.departmentRepository = departmentRepository;
        this.institutionDepartmentRepository = institutionDepartmentRepository;
    }

    // ============================================================
    // GET DEPARTMENTS FOR AN INSTITUTION
    // ============================================================

    @GetMapping("/{institutionId}/departments")
    public List<DepartmentDTO> getDepartmentsForInstitution(
            @PathVariable Integer institutionId) {

        return institutionDepartmentRepository
                .findByInstitutionInstitutionId(institutionId)
                .stream()
                .map(InstitutionDepartment::getDepartment)
                .map(department ->
                        new DepartmentDTO(
                                department.getDepartmentId(),
                                department.getDepartmentName()
                        )
                )
                .toList();
    }

    // ============================================================
    // ADD DEPARTMENT TO INSTITUTION
    // ============================================================

    @PostMapping("/{institutionId}/departments")
    @PreAuthorize("hasAnyRole('INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<?> addDepartmentToInstitution(
            @PathVariable Integer institutionId,
            @RequestBody DepartmentLinkRequest request) {

        // An Institution Admin may only add departments to THEIR OWN
        // institution (System Admin can add to any).
        org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder
                        .getContext().getAuthentication();

        if (auth != null && auth.getPrincipal() instanceof com.example.lab_platform.entity.User caller
                && caller.getRole() != null
                && "INSTITUTION_ADMIN".equalsIgnoreCase(caller.getRole().getRoleName())) {

            if (caller.getInstitution() == null
                    || !caller.getInstitution().getInstitutionId().equals(institutionId)) {
                throw new RuntimeException("You can only add departments to your own institution");
            }
        }

        Institution institution = institutionRepository
                .findById(institutionId)
                .orElseThrow(() ->
                        new RuntimeException("Institution not found"));

        Department department;

        if (request.getDepartmentId() != null) {

            department = departmentRepository
                    .findById(request.getDepartmentId())
                    .orElseThrow(() ->
                            new RuntimeException("Department not found"));

        } else {

            department = departmentRepository
                    .findByDepartmentNameIgnoreCase(
                            request.getDepartmentName())
                    .orElseGet(() -> {

                        Department d = new Department();

                        d.setDepartmentName(
                                request.getDepartmentName());

                        return departmentRepository.save(d);
                    });
        }

        boolean alreadyLinked =
                institutionDepartmentRepository
                        .existsByInstitutionInstitutionIdAndDepartmentDepartmentId(
                                institutionId,
                                department.getDepartmentId());

        if (alreadyLinked) {

            return ResponseEntity
                    .badRequest()
                    .body("Department already linked to this institution");
        }

        InstitutionDepartment link =
                new InstitutionDepartment(
                        institution,
                        department);

        institutionDepartmentRepository.save(link);

        return ResponseEntity.ok(
                new DepartmentDTO(
                        department.getDepartmentId(),
                        department.getDepartmentName()
                )
        );
    }

    // ============================================================
    // GET ALL INSTITUTIONS
    // ============================================================

    @GetMapping
    public List<InstitutionDTO> getAllInstitutions() {

        return institutionRepository
                .findAll()
                .stream()
                .map(institution ->
                        new InstitutionDTO(
                                institution.getInstitutionId(),
                                institution.getInstitutionName()
                        )
                )
                .toList();
    }

    // ============================================================
    // CREATE INSTITUTION
    // ============================================================

    // Institutions are created by the System Admin (directly here, or by
    // approving a new college's Institution Admin registration). An
    // Institution Admin must not be able to create extra institutions.
    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public Institution createInstitution(
            @RequestBody Institution institution) {

        return institutionRepository.save(institution);
    }
}