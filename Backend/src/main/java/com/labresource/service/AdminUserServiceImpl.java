
package com.labresource.service.impl;

import com.labresource.dto.CreateUserRequest;
import com.labresource.entity.Department;
import com.labresource.entity.Institution;
import com.labresource.entity.Role;
import com.labresource.entity.User;
import com.labresource.repository.DepartmentRepository;
import com.labresource.repository.InstitutionRepository;
import com.labresource.repository.UserRepository;
import com.labresource.service.AdminUserService;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserServiceImpl(
            UserRepository userRepository,
            InstitutionRepository institutionRepository,
            DepartmentRepository departmentRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.institutionRepository = institutionRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User createUser(
            CreateUserRequest request,
            Authentication authentication) {

        // =====================================================
        // CHECK LOGGED-IN USER
        // =====================================================

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "You are not authenticated."
            );
        }

        // =====================================================
        // GET LOGGED-IN ROLE
        // =====================================================

        String currentRole = authentication
                .getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("");

        // Remove ROLE_ prefix
        if (currentRole.startsWith("ROLE_")) {

            currentRole =
                    currentRole.substring(5);
        }

        // =====================================================
        // TARGET ROLE
        // =====================================================

        if (request.getRole() == null ||
                request.getRole().trim().isEmpty()) {

            throw new RuntimeException(
                    "Role is required."
            );
        }

        Role targetRole;

        try {

            targetRole =
                    Role.valueOf(
                            request.getRole()
                                    .trim()
                                    .toUpperCase()
                    );

        } catch (IllegalArgumentException e) {

            throw new RuntimeException(
                    "Invalid role: "
                            + request.getRole()
            );
        }

        // =====================================================
        // ROLE HIERARCHY
        //
        // SYSTEM_ADMIN
        //       ↓
        // INSTITUTION_ADMIN
        //       ↓
        // DEPARTMENT_HEAD
        //       ↓
        // LAB_MANAGER
        //       ↓
        // LAB_TECHNICIAN
        // =====================================================

        boolean authorized = false;

        if (currentRole.equals("SYSTEM_ADMIN")) {

            authorized =
                    targetRole == Role.INSTITUTION_ADMIN;
        }

        else if (currentRole.equals("INSTITUTION_ADMIN")) {

            authorized =
                    targetRole == Role.DEPARTMENT_HEAD;
        }

        else if (currentRole.equals("DEPARTMENT_HEAD")) {

            authorized =
                    targetRole == Role.LAB_MANAGER;
        }

        else if (currentRole.equals("LAB_MANAGER")) {

            authorized =
                    targetRole == Role.LAB_TECHNICIAN;
        }

        if (!authorized) {

            throw new RuntimeException(
                    "You are not authorized to create "
                            + targetRole
                            + " users."
            );
        }

        // =====================================================
        // CHECK EMAIL
        // =====================================================

        if (userRepository.existsByEmail(
                request.getEmail())) {

            throw new RuntimeException(
                    "Email already registered."
            );
        }

        // =====================================================
        // INSTITUTION
        // =====================================================

        if (request.getInstitutionId() == null) {

            throw new RuntimeException(
                    "Institution ID is required."
            );
        }

        Institution institution =
                institutionRepository
                        .findById(
                                request.getInstitutionId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Institution not found."
                                )
                        );

        // =====================================================
        // DEPARTMENT
        // =====================================================

        Department department = null;

        if (request.getDepartmentId() != null) {

            department =
                    departmentRepository
                            .findById(
                                    request.getDepartmentId()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Department not found."
                                    )
                            );

            // Make sure department belongs to institution
            if (department.getInstitution() == null ||
                    !department.getInstitution()
                            .getId()
                            .equals(
                                    institution.getId()
                            )) {

                throw new RuntimeException(
                        "Department does not belong "
                                + "to the selected institution."
                );
            }
        }

        // =====================================================
        // DEPARTMENT REQUIREMENT
        // =====================================================

        if ((targetRole == Role.DEPARTMENT_HEAD ||
                targetRole == Role.LAB_MANAGER ||
                targetRole == Role.LAB_TECHNICIAN)
                && department == null) {

            throw new RuntimeException(
                    "Department is required for "
                            + targetRole
            );
        }

        // =====================================================
        // CREATE USER
        // =====================================================

        User user = new User();

        user.setFullName(
                request.getFullName()
        );

        user.setEmail(
                request.getEmail()
        );

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setRole(targetRole);

        user.setInstitution(
                institution
        );

        user.setDepartment(
                department
        );

        // =====================================================
        // SAVE
        // =====================================================

        return userRepository.save(user);
    }

    @Override
public List<User> getTechnicians() {

    return userRepository.findByRole(
            Role.LAB_TECHNICIAN
    );
}
}
