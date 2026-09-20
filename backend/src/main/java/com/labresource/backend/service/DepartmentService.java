package com.labresource.backend.service;

import com.labresource.backend.entity.Department;
import com.labresource.backend.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository repository;

    public DepartmentService(DepartmentRepository repository) {
        this.repository = repository;
    }

    public Department save(Department department) {
        return repository.save(department);
    }

    public List<Department> getAll() {
        return repository.findAll();
    }
}