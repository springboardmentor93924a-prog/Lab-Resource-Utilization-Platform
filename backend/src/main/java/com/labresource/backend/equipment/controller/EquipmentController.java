package com.labresource.backend.equipment.controller;

import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.equipment.dto.EquipmentDepartmentAccessDto;
import com.labresource.backend.equipment.dto.EquipmentDto;
import com.labresource.backend.equipment.dto.EquipmentOperatingScheduleDto;
import com.labresource.backend.equipment.service.EquipmentService;
import com.labresource.backend.security.ResourceAuthorizationService;
import com.labresource.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final ResourceAuthorizationService authService;

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('VIEW_EQUIPMENT')")
    public List<EquipmentDto> search(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long institutionId,
            @RequestParam(required = false) Long labId,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status) {
        
        Long effectiveInstId = authService.resolveEffectiveInstitutionId(principal, institutionId);
        Long effectiveDeptId = authService.resolveEffectiveDepartmentId(principal, departmentId);

        if (Long.valueOf(-1L).equals(effectiveInstId) || Long.valueOf(-1L).equals(effectiveDeptId)) {
            return List.of();
        }

        return equipmentService.search(query, category, effectiveDeptId, effectiveInstId, labId, location, status);
    }

    @GetMapping("/categories")
    @PreAuthorize("hasAuthority('VIEW_EQUIPMENT')")
    public List<String> getCategories(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long departmentId) {
        Long effectiveInstId = authService.resolveEffectiveInstitutionId(principal, null);
        Long effectiveDeptId = authService.resolveEffectiveDepartmentId(principal, departmentId);

        if (Long.valueOf(-1L).equals(effectiveInstId) || Long.valueOf(-1L).equals(effectiveDeptId)) {
            return List.of();
        }

        return equipmentService.getCategories(effectiveInstId, effectiveDeptId);
    }

    @GetMapping("/locations")
    @PreAuthorize("hasAuthority('VIEW_EQUIPMENT')")
    public List<String> getLocations(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long labId) {
        Long effectiveInstId = authService.resolveEffectiveInstitutionId(principal, null);
        Long effectiveDeptId = authService.resolveEffectiveDepartmentId(principal, departmentId);

        if (Long.valueOf(-1L).equals(effectiveInstId) || Long.valueOf(-1L).equals(effectiveDeptId)) {
            return List.of();
        }

        return equipmentService.getLocations(effectiveInstId, effectiveDeptId, labId);
    }

    @GetMapping("/{equipmentId}")
    @PreAuthorize("hasAuthority('VIEW_EQUIPMENT')")
    public EquipmentDto getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long equipmentId) {
        EquipmentDto dto = equipmentService.getById(equipmentId);
        authService.authorizeResourceAccess(principal, dto.getInstitutionId(), dto.getDepartmentId());
        return dto;
    }

    @GetMapping("/{id}/documents")
    @PreAuthorize("hasAuthority('VIEW_EQUIPMENT')")
    public List<com.labresource.backend.equipment.entity.EquipmentDocument> getDocuments(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        EquipmentDto existing = equipmentService.getById(id);
        authService.authorizeResourceAccess(principal, existing.getInstitutionId(), existing.getDepartmentId());
        return equipmentService.getDocuments(id);
    }

    @GetMapping("/{id}/calibrations")
    @PreAuthorize("hasAuthority('VIEW_EQUIPMENT')")
    public List<com.labresource.backend.calibration.entity.EquipmentCalibration> getCalibrations(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        EquipmentDto existing = equipmentService.getById(id);
        authService.authorizeResourceAccess(principal, existing.getInstitutionId(), existing.getDepartmentId());
        return equipmentService.getCalibrations(id);
    }

    @PostMapping("/{id}/calibrations")
    @PreAuthorize("hasAnyAuthority('MANAGE_CALIBRATION', 'MANAGE_EQUIPMENT', 'ROLE_LAB_TECHNICIAN', 'ROLE_LAB_MANAGER', 'ROLE_SYSTEM_ADMIN')")
    public com.labresource.backend.calibration.entity.EquipmentCalibration recordCalibration(
            @PathVariable Long id,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate calibrationDate,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate nextDueDate,
            @RequestParam(required = false) String performedBy,
            @RequestParam(required = false) String certificateNumber,
            @RequestParam(required = false) String notes,
            @RequestParam(required = false) MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) throws IOException {
        EquipmentDto existing = equipmentService.getById(id);
        authService.authorizeResourceAccess(principal, existing.getInstitutionId(), existing.getDepartmentId());
        String actor = (performedBy != null && !performedBy.isBlank()) 
                ? performedBy 
                : ((certificateNumber != null && !certificateNumber.isBlank()) ? "Cert: " + certificateNumber : principal.getUsername());
        return equipmentService.recordCalibration(id, calibrationDate, nextDueDate, actor, notes, file);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_EQUIPMENT')")
    public EquipmentDto create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody EquipmentDto dto) {
        if (authService.isDepartmentScopedRole(principal)) {
            if (principal.getDepartmentId() == null) {
                throw new ApiException(HttpStatus.FORBIDDEN, "User does not have an assigned department.");
            }
            dto.setDepartmentId(principal.getDepartmentId());
        }
        if (principal.getInstitutionId() != null) {
            dto.setInstitutionId(principal.getInstitutionId());
        }
        return equipmentService.create(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_EQUIPMENT')")
    public EquipmentDto update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id, 
            @Valid @RequestBody EquipmentDto dto) {
        EquipmentDto existing = equipmentService.getById(id);
        authService.authorizeResourceAccess(principal, existing.getInstitutionId(), existing.getDepartmentId());

        if (authService.isDepartmentScopedRole(principal)) {
            dto.setDepartmentId(principal.getDepartmentId());
        }
        if (principal.getInstitutionId() != null) {
            dto.setInstitutionId(principal.getInstitutionId());
        }
        return equipmentService.update(id, dto);
    }

    @PatchMapping("/{id}/sharing")
    @PreAuthorize("hasAnyAuthority('ROLE_DEPARTMENT_HEAD', 'ROLE_SYSTEM_ADMIN')")
    public EquipmentDto updateSharingSettings(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody com.labresource.backend.equipment.dto.EquipmentSharingUpdateRequest request) {
        EquipmentDto existing = equipmentService.getById(id);
        authService.authorizeResourceAccess(principal, existing.getInstitutionId(), existing.getDepartmentId());
        Boolean isShareable = request != null ? request.getIsShareable() : null;
        java.math.BigDecimal externalRate = request != null ? request.getExternalHourlyRate() : null;
        return equipmentService.updateSharingSettings(id, isShareable, externalRate);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('MANAGE_EQUIPMENT')")
    public EquipmentDto updateStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam String status) {
        EquipmentDto existing = equipmentService.getById(id);
        authService.authorizeResourceAccess(principal, existing.getInstitutionId(), existing.getDepartmentId());
        return equipmentService.updateStatus(id, status, false);
    }

    @PostMapping("/{id}/schedule")
    @PreAuthorize("hasAuthority('MANAGE_EQUIPMENT')")
    public Map<String, String> setSchedules(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody List<EquipmentOperatingScheduleDto> schedules) {
        EquipmentDto existing = equipmentService.getById(id);
        authService.authorizeResourceAccess(principal, existing.getInstitutionId(), existing.getDepartmentId());
        equipmentService.setSchedules(id, schedules);
        return Map.of("message", "Schedules updated successfully.");
    }

    @PostMapping("/{id}/documents")
    @PreAuthorize("hasAuthority('MANAGE_EQUIPMENT')")
    public Map<String, String> uploadDocument(
            @PathVariable Long id,
            @RequestParam String documentType,
            @RequestParam MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) throws IOException {
        EquipmentDto existing = equipmentService.getById(id);
        authService.authorizeResourceAccess(principal, existing.getInstitutionId(), existing.getDepartmentId());
        equipmentService.uploadDocument(id, documentType, file, principal.getUserId());
        return Map.of("message", "Document uploaded successfully.");
    }

    @PostMapping("/{id}/image")
    @PreAuthorize("hasAuthority('MANAGE_EQUIPMENT')")
    public Map<String, String> uploadImage(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam MultipartFile file) throws IOException {
        EquipmentDto existing = equipmentService.getById(id);
        authService.authorizeResourceAccess(principal, existing.getInstitutionId(), existing.getDepartmentId());
        equipmentService.uploadImage(id, file);
        return Map.of("message", "Image uploaded successfully.");
    }

    @PostMapping("/{id}/access")
    @PreAuthorize("hasAuthority('MANAGE_EQUIPMENT')")
    public Map<String, String> setAccess(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody List<EquipmentDepartmentAccessDto> accessList) {
        EquipmentDto existing = equipmentService.getById(id);
        authService.authorizeResourceAccess(principal, existing.getInstitutionId(), existing.getDepartmentId());
        equipmentService.setAccess(id, accessList);
        return Map.of("message", "Access rules updated successfully.");
    }
}
