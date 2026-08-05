package com.infosys.labresource.user.Controller;

import com.infosys.labresource.user.Service.DepartmentServiceImpl;
import com.infosys.labresource.user.entites.Department;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {
    private final DepartmentServiceImpl departService;

    @PostMapping
    public Department createDepartment(@RequestBody Department department,
                                       Authentication authentication) {

        return departService.createDepartment(department, authentication);

    }
    @GetMapping
    public List<Department> getAllDepartments(Authentication authentication) {

        return departService.getAllDepartments(authentication);
    }
    @GetMapping("/{id}")
    public Department getDepartmentById(@PathVariable Long id) {

        return departService.getDepartmentById(id);
    }
    @GetMapping("/name/{name}")
    public Department getDepartmentByName(@PathVariable String name) {
        return departService.getDepartmentByName(name);
    }
    @GetMapping("/institution/{institutionId}")
    public List<Department> getDepartmentsByInstitution(
            @PathVariable Long institutionId) {

        return departService.getDepartmentsByInstitution(institutionId);
    }
    @PutMapping("/{id}")
    public Department updateDepartment(@PathVariable Long id, @RequestBody Department department, Authentication authentication) {

        return departService.updateDepartment(id, department, authentication);
    }

    // Delete Department
    @DeleteMapping("/{id}")
    public String deleteDepartment(@PathVariable Long id, Authentication authentication) {

        departService.deleteDepartment(id, authentication);
        return "Department deleted successfully.";
    }

}
