package com.labresource.backend.department.service;

import com.labresource.backend.budget.entity.Budget;
import com.labresource.backend.budget.repository.BudgetRepository;
import com.labresource.backend.budget.util.FiscalYearUtil;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.department.dto.DepartmentCreateRequestDto;
import com.labresource.backend.department.dto.DepartmentDto;
import com.labresource.backend.department.dto.LaboratoryCreateRequestDto;
import com.labresource.backend.department.entity.Department;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.laboratory.dto.LaboratoryDto;
import com.labresource.backend.laboratory.entity.Laboratory;
import com.labresource.backend.laboratory.repository.LaboratoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final BudgetRepository budgetRepository;


    public List<DepartmentDto> getByInstitutionId(Long institutionId) {
        if (institutionId == null) {
            return List.of();
        }
        List<Department> departments = departmentRepository.findByInstitutionIdAndIsActiveTrue(institutionId);
        List<Laboratory> laboratories = laboratoryRepository.findByInstitutionIdAndIsActiveTrue(institutionId);

        Map<Long, List<LaboratoryDto>> labsByDept = laboratories.stream()
                .map(l -> LaboratoryDto.fromEntity(l, null))
                .collect(Collectors.groupingBy(LaboratoryDto::getDepartmentId));

        return departments.stream()
                .map(d -> DepartmentDto.fromEntity(d, labsByDept.getOrDefault(d.getDepartmentId(), List.of())))
                .toList();
    }

    public DepartmentDto getById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Department not found."));

        List<LaboratoryDto> labs = laboratoryRepository.findByDepartmentIdAndIsActiveTrue(id).stream()
                .map(l -> LaboratoryDto.fromEntity(l, dept.getName()))
                .toList();

        return DepartmentDto.fromEntity(dept, labs);
    }

    public Department getEntity(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Department not found."));
    }

    @Transactional
    public DepartmentDto createDepartmentWithLabs(Long institutionId, DepartmentCreateRequestDto dto) {
        if (institutionId == null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Institution ID could not be determined from authentication context.");
        }

        // Validate department name
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Department name is required.");
        }
        String trimmedName = dto.getName().trim();

        // Validate department code
        if (dto.getCode() == null || dto.getCode().trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Department code is required.");
        }
        String trimmedCode = dto.getCode().trim().toUpperCase();

        // Check duplicate name within institution
        departmentRepository.findByInstitutionIdAndNameIgnoreCase(institutionId, trimmedName)
                .ifPresent(d -> {
                    throw new ApiException(HttpStatus.CONFLICT, "A department with this name already exists in this institution.");
                });

        // Check duplicate code within institution
        departmentRepository.findByInstitutionIdAndCodeIgnoreCase(institutionId, trimmedCode)
                .ifPresent(d -> {
                    throw new ApiException(HttpStatus.CONFLICT, "A department with this code already exists in this institution.");
                });

        // Validate laboratories
        if (dto.getLaboratories() == null || dto.getLaboratories().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "At least one laboratory is required.");
        }

        Set<String> seenLabNames = new HashSet<>();
        for (LaboratoryCreateRequestDto labReq : dto.getLaboratories()) {
            if (labReq == null || labReq.getName() == null || labReq.getName().trim().isEmpty()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Laboratory name is required.");
            }
            if (labReq.getLocation() == null || labReq.getLocation().trim().isEmpty()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Laboratory location is required.");
            }
            String normName = labReq.getName().trim().toLowerCase();
            if (!seenLabNames.add(normName)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Duplicate laboratory name: " + labReq.getName().trim());
            }
        }

        // 1. Save Department
        Department dept = new Department();
        dept.setInstitutionId(institutionId);
        dept.setName(trimmedName);
        dept.setCode(trimmedCode);
        dept.setBudgetAllocated(BigDecimal.ZERO);
        dept.setIsActive(true);
        Department savedDept = departmentRepository.save(dept);

        // 2. Save Laboratories
        List<LaboratoryDto> savedLabDtos = new ArrayList<>();
        for (LaboratoryCreateRequestDto labReq : dto.getLaboratories()) {
            Laboratory lab = new Laboratory();
            lab.setInstitutionId(institutionId);
            lab.setDepartmentId(savedDept.getDepartmentId());
            lab.setName(labReq.getName().trim());
            lab.setLocation(labReq.getLocation().trim());
            lab.setDescription(labReq.getDescription() != null ? labReq.getDescription().trim() : null);
            lab.setCapacity(labReq.getCapacity() != null && labReq.getCapacity() > 0 ? labReq.getCapacity() : 1);
            lab.setIsActive(true);

            Laboratory savedLab = laboratoryRepository.save(lab);
            savedLabDtos.add(LaboratoryDto.fromEntity(savedLab, savedDept.getName()));
        }

        return DepartmentDto.fromEntity(savedDept, savedLabDtos);
    }

    @Transactional
    public DepartmentDto create(DepartmentDto dto) {
        // Enforce unique department name within institution
        departmentRepository.findByInstitutionIdAndNameIgnoreCase(dto.getInstitutionId(), dto.getName())
                .ifPresent(d -> {
                    throw new ApiException(HttpStatus.CONFLICT, "A department with this name already exists in this institution.");
                });

        if (dto.getCode() != null && !dto.getCode().trim().isEmpty()) {
            departmentRepository.findByInstitutionIdAndCodeIgnoreCase(dto.getInstitutionId(), dto.getCode().trim())
                    .ifPresent(d -> {
                        throw new ApiException(HttpStatus.CONFLICT, "A department with this code already exists in this institution.");
                    });
        }

        Department dept = new Department();
        dept.setInstitutionId(dto.getInstitutionId());
        dept.setName(dto.getName() != null ? dto.getName().trim() : null);
        dept.setCode(dto.getCode() != null ? dto.getCode().trim().toUpperCase() : null);
        dept.setBudgetAllocated(dto.getBudgetAllocated() != null ? dto.getBudgetAllocated() : BigDecimal.ZERO);
        dept.setIsActive(true);
        Department savedDept = departmentRepository.save(dept);

        // Sync normalized Budget entity for active fiscal year
        if (dto.getBudgetAllocated() != null) {
            syncNormalizedBudget(savedDept.getInstitutionId(), savedDept.getDepartmentId(), dto.getBudgetAllocated());
        }

        List<LaboratoryDto> savedLabs = new ArrayList<>();
        if (dto.getLaboratories() != null && !dto.getLaboratories().isEmpty()) {
            for (LaboratoryDto lDto : dto.getLaboratories()) {
                Laboratory lab = new Laboratory();
                lab.setInstitutionId(dto.getInstitutionId());
                lab.setDepartmentId(savedDept.getDepartmentId());
                lab.setName(lDto.getName() != null ? lDto.getName().trim() : null);
                lab.setLocation(lDto.getLocation() != null ? lDto.getLocation().trim() : null);
                lab.setDescription(lDto.getDescription());
                lab.setCapacity(lDto.getCapacity() != null && lDto.getCapacity() > 0 ? lDto.getCapacity() : 1);
                lab.setIsActive(true);
                Laboratory savedLab = laboratoryRepository.save(lab);
                savedLabs.add(LaboratoryDto.fromEntity(savedLab, savedDept.getName()));
            }
        }

        return DepartmentDto.fromEntity(savedDept, savedLabs);
    }

    @Transactional
    public DepartmentDto update(Long id, DepartmentDto dto) {
        Department dept = getEntity(id);

        if (dto.getName() != null && !dept.getName().equalsIgnoreCase(dto.getName())) {
            departmentRepository.findByInstitutionIdAndNameIgnoreCase(dept.getInstitutionId(), dto.getName().trim())
                    .ifPresent(d -> {
                        throw new ApiException(HttpStatus.CONFLICT, "A department with this name already exists in this institution.");
                    });
            dept.setName(dto.getName().trim());
        }

        if (dto.getCode() != null && !dto.getCode().equalsIgnoreCase(dept.getCode())) {
            departmentRepository.findByInstitutionIdAndCodeIgnoreCase(dept.getInstitutionId(), dto.getCode().trim())
                    .ifPresent(d -> {
                        throw new ApiException(HttpStatus.CONFLICT, "A department with this code already exists in this institution.");
                    });
            dept.setCode(dto.getCode().trim().toUpperCase());
        }

        if (dto.getBudgetAllocated() != null) {
            dept.setBudgetAllocated(dto.getBudgetAllocated());
            syncNormalizedBudget(dept.getInstitutionId(), dept.getDepartmentId(), dto.getBudgetAllocated());
        }
        Department savedDept = departmentRepository.save(dept);
        List<LaboratoryDto> labs = laboratoryRepository.findByDepartmentIdAndIsActiveTrue(id).stream()
                .map(l -> LaboratoryDto.fromEntity(l, savedDept.getName()))
                .toList();
        return DepartmentDto.fromEntity(savedDept, labs);
    }

    private void syncNormalizedBudget(Long institutionId, Long departmentId, BigDecimal allocatedAmount) {
        String currentFiscalYear = FiscalYearUtil.getCurrentFiscalYear();
        Budget budget = budgetRepository.findByDepartmentIdAndFiscalYear(departmentId, currentFiscalYear)
                .orElseGet(() -> {
                    Budget b = new Budget();
                    b.setInstitutionId(institutionId);
                    b.setDepartmentId(departmentId);
                    b.setFiscalYear(currentFiscalYear);
                    b.setUsedAmount(BigDecimal.ZERO);
                    return b;
                });
        budget.setAllocatedAmount(allocatedAmount);
        budget.setRemainingAmount(allocatedAmount.subtract(budget.getUsedAmount() != null ? budget.getUsedAmount() : BigDecimal.ZERO));
        budgetRepository.save(budget);
    }


    @Transactional
    public void delete(Long id) {
        Department dept = getEntity(id);
        dept.setIsActive(false);
        departmentRepository.save(dept);
    }
}
