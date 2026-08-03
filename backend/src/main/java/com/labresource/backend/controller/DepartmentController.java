package com.labresource.backend.controller;

import com.labresource.backend.entity.Department;
import com.labresource.backend.service.DepartmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "*")
public class DepartmentController {

    private final DepartmentService service;

    public DepartmentController(DepartmentService service) {
        this.service = service;
    }

    @PostMapping
    public Department save(@RequestBody Department department) {
        return service.save(department);
    }

    @GetMapping
    public List<Department> getAll() {
        return service.getAll();
    }
}