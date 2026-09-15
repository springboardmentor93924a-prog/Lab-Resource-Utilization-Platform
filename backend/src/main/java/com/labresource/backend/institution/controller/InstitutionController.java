package com.labresource.backend.institution.controller;

import com.labresource.backend.institution.dto.InstitutionDto;
import com.labresource.backend.institution.service.InstitutionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/institutions")
@RequiredArgsConstructor
public class InstitutionController {

    private final InstitutionService institutionService;
    private final com.labresource.backend.department.service.DepartmentService departmentService;

    @GetMapping
    public List<InstitutionDto> getAll() {
        return institutionService.getAll();
    }

    @GetMapping("/active")
    public List<InstitutionDto> getActive() {
        return institutionService.getActiveInstitutions();
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyAuthority('SYSTEM_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public List<InstitutionDto> getPending() {
        return institutionService.getPendingInstitutions();
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyAuthority('SYSTEM_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public java.util.Map<String, String> approveInstitution(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.labresource.backend.security.UserPrincipal principal,
            @PathVariable Long id) {
        return institutionService.approveInstitution(principal != null ? principal.getUserId() : null, id);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyAuthority('SYSTEM_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public java.util.Map<String, String> rejectInstitution(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.labresource.backend.security.UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String finalReason = reason != null && !reason.isBlank() ? reason : (body != null ? body.get("reason") : null);
        return institutionService.rejectInstitution(principal != null ? principal.getUserId() : null, id, finalReason);
    }

    @GetMapping("/check-code")
    public java.util.Map<String, Object> checkCode(@RequestParam String code) {
        String normalized = code != null ? code.trim().toUpperCase() : "";
        boolean isTaken = institutionService.isCodeTaken(normalized);
        return java.util.Map.of(
                "code", normalized,
                "available", !isTaken,
                "exists", isTaken
        );
    }

    @GetMapping("/{id}")
    public InstitutionDto getById(@PathVariable Long id) {
        return institutionService.getById(id);
    }

    @GetMapping("/{institutionId}/departments")
    public List<com.labresource.backend.department.dto.DepartmentDto> getDepartments(@PathVariable Long institutionId) {
        return departmentService.getByInstitutionId(institutionId);
    }

    @PostMapping("/register")
    public InstitutionDto register(@Valid @RequestBody com.labresource.backend.institution.dto.InstitutionRegistrationRequestDto dto) {
        return institutionService.registerInstitution(dto);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_INSTITUTION')")
    public InstitutionDto create(@Valid @RequestBody InstitutionDto dto) {
        return institutionService.create(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_INSTITUTION')")
    public InstitutionDto update(@PathVariable Long id, @Valid @RequestBody InstitutionDto dto) {
        return institutionService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_INSTITUTION')")
    public void delete(@PathVariable Long id) {
        institutionService.delete(id);
    }
}
