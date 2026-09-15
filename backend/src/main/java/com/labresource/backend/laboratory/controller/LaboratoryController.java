package com.labresource.backend.laboratory.controller;

import com.labresource.backend.laboratory.dto.LaboratoryDto;
import com.labresource.backend.laboratory.entity.Laboratory;
import com.labresource.backend.laboratory.service.LaboratoryService;
import com.labresource.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/laboratories")
@RequiredArgsConstructor
public class LaboratoryController {

    private final LaboratoryService laboratoryService;

    @GetMapping
    public List<LaboratoryDto> getLaboratories(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long departmentId) {
        return laboratoryService.getLaboratories(principal, departmentId);
    }

    @GetMapping("/{id}")
    public LaboratoryDto getLaboratoryById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return laboratoryService.getLaboratoryById(principal, id);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public LaboratoryDto createLaboratory(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Laboratory lab) {
        return laboratoryService.createLaboratory(principal, lab);
    }
}
