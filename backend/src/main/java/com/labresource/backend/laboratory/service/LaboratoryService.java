package com.labresource.backend.laboratory.service;

import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.department.entity.Department;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.laboratory.dto.LaboratoryDto;
import com.labresource.backend.laboratory.entity.Laboratory;
import com.labresource.backend.laboratory.repository.LaboratoryRepository;
import com.labresource.backend.security.ResourceAuthorizationService;
import com.labresource.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LaboratoryService {

    private final LaboratoryRepository laboratoryRepository;
    private final DepartmentRepository departmentRepository;
    private final ResourceAuthorizationService authService;

    public List<LaboratoryDto> getLaboratories(UserPrincipal principal, Long filterDepartmentId) {
        Long effectiveInstId = authService.resolveEffectiveInstitutionId(principal, null);
        Long effectiveDeptId = authService.resolveEffectiveDepartmentId(principal, filterDepartmentId);

        if (Long.valueOf(-1L).equals(effectiveInstId) || Long.valueOf(-1L).equals(effectiveDeptId)) {
            return List.of();
        }

        List<Laboratory> labs;
        if (effectiveDeptId != null) {
            labs = laboratoryRepository.findByDepartmentIdAndIsActiveTrue(effectiveDeptId).stream()
                    .filter(l -> effectiveInstId == null || effectiveInstId.equals(l.getInstitutionId()))
                    .toList();
        } else if (effectiveInstId != null) {
            labs = laboratoryRepository.findByInstitutionIdAndIsActiveTrue(effectiveInstId);
        } else {
            labs = laboratoryRepository.findAll();
        }

        List<Long> deptIds = labs.stream().map(Laboratory::getDepartmentId).distinct().toList();
        Map<Long, String> deptNames = departmentRepository.findAllById(deptIds).stream()
                .collect(Collectors.toMap(Department::getDepartmentId, Department::getName));

        return labs.stream()
                .map(l -> LaboratoryDto.fromEntity(l, deptNames.getOrDefault(l.getDepartmentId(), "Unknown Department")))
                .toList();
    }

    public LaboratoryDto getLaboratoryById(UserPrincipal principal, Long id) {
        Laboratory lab = laboratoryRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Laboratory not found."));
        authService.authorizeResourceAccess(principal, lab.getInstitutionId(), lab.getDepartmentId());
        String deptName = departmentRepository.findById(lab.getDepartmentId())
                .map(Department::getName).orElse("Unknown Department");
        return LaboratoryDto.fromEntity(lab, deptName);
    }

    @Transactional
    public LaboratoryDto createLaboratory(UserPrincipal principal, Laboratory lab) {
        if (authService.isDepartmentScopedRole(principal)) {
            if (principal.getDepartmentId() == null) {
                throw new ApiException(HttpStatus.FORBIDDEN, "User does not have an assigned department.");
            }
            lab.setDepartmentId(principal.getDepartmentId());
        }
        if (principal.getInstitutionId() != null) {
            lab.setInstitutionId(principal.getInstitutionId());
        }

        Laboratory saved = laboratoryRepository.save(lab);
        String deptName = departmentRepository.findById(saved.getDepartmentId())
                .map(Department::getName).orElse("Unknown Department");
        return LaboratoryDto.fromEntity(saved, deptName);
    }
}
