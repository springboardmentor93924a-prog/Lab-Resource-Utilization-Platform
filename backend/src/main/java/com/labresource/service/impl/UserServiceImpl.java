package com.labresource.service.impl;

import com.labresource.dto.request.UserRequest;
import com.labresource.dto.response.UserResponse;
import com.labresource.entity.Department;
import com.labresource.entity.Institution;
import com.labresource.entity.Role;
import com.labresource.entity.User;
import com.labresource.enums.RoleType;
import com.labresource.repository.DepartmentRepository;
import com.labresource.repository.RoleRepository;
import com.labresource.repository.UserRepository;
import com.labresource.security.UserDetailsImpl;
import com.labresource.service.UserService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            DepartmentRepository departmentRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private User getCurrentAdminUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) principal).getUser();
        }
        throw new RuntimeException("Could not extract admin user from context");
    }

    private Department resolveDepartment(String departmentName, Institution institution) {
        return departmentRepository.findByNameAndInstitution(departmentName, institution)
                .orElseGet(() -> {
                    Department newDept = new Department();
                    newDept.setName(departmentName);
                    newDept.setInstitution(institution);
                    return departmentRepository.save(newDept);
                });
    }

    private UserResponse mapToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        
        String name = user.getFirstName();
        if (user.getLastName() != null && !user.getLastName().isEmpty()) {
            name += " " + user.getLastName();
        }
        response.setName(name);
        
        response.setEmail(user.getEmail());
        if (user.getRole() != null) {
            response.setRole(user.getRole().getName().name());
        }
        if (user.getDepartment() != null) {
            response.setDepartment(user.getDepartment().getName());
        }
        if (user.getInstitution() != null) {
            response.setInstitution(user.getInstitution().getName());
        }
        response.setPhone(user.getPhone());
        response.setStatus(user.getStatus());
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        User admin = getCurrentAdminUser();
        // Return users for the admin's institution
        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getInstitution() != null && u.getInstitution().getId().equals(admin.getInstitution().getId()))
                .collect(Collectors.toList());
        return users.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        User admin = getCurrentAdminUser();
        
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new RuntimeException("User with this email already exists");
        }

        RoleType roleType;
        try {
            String roleStr = request.getRole();
            if ("ADMIN".equalsIgnoreCase(roleStr)) {
                roleStr = "INSTITUTION_ADMIN";
            }
            roleType = RoleType.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + request.getRole());
        }

        Role role = roleRepository.findByName(roleType)
                .orElseThrow(() -> new RuntimeException("Role not found: " + request.getRole()));

        Department department = resolveDepartment(request.getDepartment(), admin.getInstitution());

        User user = new User();
        // Split name into first and last
        String[] nameParts = request.getName().trim().split(" ", 2);
        user.setFirstName(nameParts[0]);
        user.setLastName(nameParts.length > 1 ? nameParts[1] : "");
        
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setInstitution(admin.getInstitution());
        user.setDepartment(department);
        user.setStatus("ACTIVE");

        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse updateUser(String id, UserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (request.getName() != null && !request.getName().isBlank()) {
            String[] nameParts = request.getName().trim().split(" ", 2);
            user.setFirstName(nameParts[0]);
            user.setLastName(nameParts.length > 1 ? nameParts[1] : "");
        }
        
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail().trim().toLowerCase());
        }
        
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        if (request.getRole() != null && !request.getRole().isBlank()) {
            RoleType roleType;
            try {
                String roleStr = request.getRole();
                if ("ADMIN".equalsIgnoreCase(roleStr)) {
                    roleStr = "INSTITUTION_ADMIN";
                }
                roleType = RoleType.valueOf(roleStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid role: " + request.getRole());
            }
            Role role = roleRepository.findByName(roleType)
                    .orElseThrow(() -> new RuntimeException("Role not found: " + request.getRole()));
            user.setRole(role);
        }
        
        if (request.getDepartment() != null && !request.getDepartment().isBlank()) {
            Department department = resolveDepartment(request.getDepartment(), user.getInstitution());
            user.setDepartment(department);
        }
        
        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }
}
