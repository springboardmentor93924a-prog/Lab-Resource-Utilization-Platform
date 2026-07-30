package com.labresource.controller;

import com.labresource.dto.department.DepartmentRequest;
import com.labresource.dto.department.DepartmentResponse;
import com.labresource.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping
    public ResponseEntity<DepartmentResponse> createDepartment(
            @Valid @RequestBody DepartmentRequest request
    ) {

        DepartmentResponse response =
                departmentService.createDepartment(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<DepartmentResponse>> getAllDepartments() {

        return ResponseEntity.ok(
                departmentService.getAllDepartments()
        );
    }

    @GetMapping("/{departmentId}")
    public ResponseEntity<DepartmentResponse> getDepartmentById(
            @PathVariable String departmentId
    ) {

        return ResponseEntity.ok(
                departmentService.getDepartmentById(departmentId)
        );
    }

    @GetMapping("/institution/{institutionId}")
    public ResponseEntity<List<DepartmentResponse>>
    getDepartmentsByInstitution(
            @PathVariable String institutionId
    ) {

        return ResponseEntity.ok(
                departmentService.getDepartmentsByInstitution(
                        institutionId
                )
        );
    }

    @PutMapping("/{departmentId}")
    public ResponseEntity<DepartmentResponse> updateDepartment(
            @PathVariable String departmentId,
            @Valid @RequestBody DepartmentRequest request
    ) {

        DepartmentResponse response =
                departmentService.updateDepartment(
                        departmentId,
                        request
                );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{departmentId}")
    public ResponseEntity<Void> deleteDepartment(
            @PathVariable String departmentId
    ) {

        departmentService.deleteDepartment(departmentId);

        return ResponseEntity.noContent().build();
    }
}