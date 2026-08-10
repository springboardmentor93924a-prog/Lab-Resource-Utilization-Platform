package com.infosys.labresource.user.Service;

import com.infosys.labresource.user.Repository.DepartmentRepo;
import com.infosys.labresource.user.Repository.InstitutionRepo;
import com.infosys.labresource.user.Repository.UserRepository;
import com.infosys.labresource.user.entites.Department;
import com.infosys.labresource.user.entites.Institution;
import com.infosys.labresource.user.entites.Role;
import com.infosys.labresource.user.entites.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService{
    private final UserRepository userRepo;
    private final DepartmentRepo departmentRepo;
    private final InstitutionRepo institutionRepo;
    @Override
    public Department createDepartment(Department department, Authentication authentication) {
        UserEntity loggedInUser = userRepo.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role role = loggedInUser.getRole();

        if (role != Role.SYSTEM_ADMIN &&
                role != Role.INSTITUTION_ADMIN) {

            throw new RuntimeException("Access Denied");
        }

        return departmentRepo.save(department);
    }

    @Override
    public List<Department> getAllDepartments(Authentication authentication) {
        UserEntity loggedInUser = userRepo.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Role role = loggedInUser.getRole();
        if (role != Role.SYSTEM_ADMIN &&
                role != Role.INSTITUTION_ADMIN) {

            throw new RuntimeException("Access Denied");
        }

        return departmentRepo.findAll();
    }

    @Override
    public Department getDepartmentById(Long id) {
       return departmentRepo.findById(id).orElseThrow(()->new RuntimeException("Department not found"));
    }

    @Override
    public Department getDepartmentByName(String name) {
        return departmentRepo.findByDepartmentName(name)
                .orElseThrow(() ->
                        new RuntimeException("Department not found"));
    }

    @Override
    public Department updateDepartment(Long id, Department request, Authentication authentication) {

        UserEntity loggedInUser = userRepo.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (loggedInUser.getRole() == Role.RESEARCHER) {
            throw new RuntimeException("Access Denied");
        }

        Department department = departmentRepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Department not found"));

        if (request.getDepartmentName() != null) {
            department.setDepartmentName(request.getDepartmentName());
        }

        if (request.getDescription() != null) {
            department.setDescription(request.getDescription());
        }

        return departmentRepo.save(department);
    }

    @Override
    public void deleteDepartment(Long id, Authentication authentication) {

        UserEntity loggedInUser = userRepo.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role role = loggedInUser.getRole();

        if (role != Role.SYSTEM_ADMIN &&
                role != Role.INSTITUTION_ADMIN &&
                role != Role.DEPARTMENT_HEAD) {

            throw new RuntimeException("Access Denied");
        }

        Department department = departmentRepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Department not found"));

        departmentRepo.delete(department);
    }
    @Override
    public List<Department> getDepartmentsByInstitution(Long institutionId) {

        Institution institution = institutionRepo.findById(institutionId)
                .orElseThrow(() -> new RuntimeException("Institution not found"));

        return departmentRepo.findByInstitution(institution);
    }
}
