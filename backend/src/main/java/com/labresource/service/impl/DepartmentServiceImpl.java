package com.labresource.service.impl;

import com.labresource.dto.department.DepartmentRequest;
import com.labresource.dto.department.DepartmentResponse;
import com.labresource.entity.Department;
import com.labresource.entity.Institution;
import com.labresource.exception.ResourceNotFoundException;
import com.labresource.repository.DepartmentRepository;
import com.labresource.repository.InstitutionRepository;
import com.labresource.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final InstitutionRepository institutionRepository;

    @Override
    public DepartmentResponse createDepartment(
            DepartmentRequest request
    ) {

        Institution institution = institutionRepository.findById(
                        request.getInstitutionId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Institution not found"));

        Department department = new Department();

        department.setName(request.getName());
        department.setDescription(request.getDescription());
        department.setInstitution(institution);

        Department savedDepartment =
                departmentRepository.save(department);

        return mapToResponse(savedDepartment);
    }

    @Override
    public List<DepartmentResponse> getAllDepartments() {

        return departmentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public DepartmentResponse getDepartmentById(
            String departmentId
    ) {

        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Department not found"));

        return mapToResponse(department);
    }

    @Override
    public List<DepartmentResponse> getDepartmentsByInstitution(
            String institutionId
    ) {

        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Institution not found"));

        return departmentRepository.findByInstitution(institution)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public DepartmentResponse updateDepartment(
            String departmentId,
            DepartmentRequest request
    ) {

        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Department not found"));

        Institution institution = institutionRepository.findById(
                        request.getInstitutionId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Institution not found"));

        department.setName(request.getName());
        department.setDescription(request.getDescription());
        department.setInstitution(institution);

        Department updatedDepartment =
                departmentRepository.save(department);

        return mapToResponse(updatedDepartment);
    }

    @Override
    public void deleteDepartment(
            String departmentId
    ) {

        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Department not found"));

        departmentRepository.delete(department);
    }

    private DepartmentResponse mapToResponse(
            Department department
    ) {

        return new DepartmentResponse(
                department.getId(),
                department.getName(),
                department.getDescription(),
                department.getInstitution().getId(),
                department.getInstitution().getName(),
                department.getCreatedAt(),
                department.getUpdatedAt()
        );
    }
}