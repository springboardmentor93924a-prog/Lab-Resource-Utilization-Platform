package com.labresource.backend.department.controller;

import com.labresource.backend.department.dto.DepartmentCreateRequestDto;
import com.labresource.backend.department.dto.DepartmentDto;
import com.labresource.backend.department.service.DepartmentService;
import com.labresource.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    /** Returns all departments belonging to the authenticated user's institution with their active laboratories. */
    @GetMapping("/my-institution")
    @PreAuthorize("isAuthenticated()")
    public List<DepartmentDto> getByMyInstitution(@AuthenticationPrincipal UserPrincipal principal) {
        return departmentService.getByInstitutionId(principal.getInstitutionId());
    }

    @GetMapping("/{id}")
    public DepartmentDto getById(@PathVariable Long id) {
        return departmentService.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_DEPARTMENT')")
    public DepartmentDto create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DepartmentCreateRequestDto dto) {
        return departmentService.createDepartmentWithLabs(principal.getInstitutionId(), dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('UPDATE_DEPARTMENT')")
    public DepartmentDto update(@PathVariable Long id, @Valid @RequestBody DepartmentDto dto) {
        return departmentService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DEACTIVATE_DEPARTMENT')")
    public void delete(@PathVariable Long id) {
        departmentService.delete(id);
    }
}
