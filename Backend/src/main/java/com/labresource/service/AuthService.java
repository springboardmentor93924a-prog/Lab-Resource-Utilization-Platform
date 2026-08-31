
package com.labresource.service;

import com.labresource.dto.AuthResponse;
import com.labresource.dto.LoginRequest;
import com.labresource.dto.RegisterRequest;
import com.labresource.entity.Department;
import com.labresource.entity.Institution;
import com.labresource.entity.Role;
import com.labresource.entity.User;
import com.labresource.repository.DepartmentRepository;
import com.labresource.repository.InstitutionRepository;
import com.labresource.repository.UserRepository;
import com.labresource.security.JwtService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            InstitutionRepository institutionRepository,
            DepartmentRepository departmentRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.institutionRepository = institutionRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    // =========================================================
    // NORMAL USER REGISTRATION
    // =========================================================
    //
    // Normal registration creates RESEARCHER.
    //
    // Administrative roles are NOT allowed through this API.
    //
    // Administrative users are created through:
    //
    // SYSTEM_ADMIN
    //      ↓
    // INSTITUTION_ADMIN
    //      ↓
    // DEPARTMENT_HEAD
    //      ↓
    // LAB_MANAGER
    //      ↓
    // LAB_TECHNICIAN
    //
    // =========================================================

    public AuthResponse register(
            RegisterRequest request) {

        // ---------------------------------------------------------
        // Validate email
        // ---------------------------------------------------------

        if (request.getEmail() == null
                || request.getEmail().isBlank()) {

            throw new RuntimeException(
                    "Email is required."
            );
        }

        // ---------------------------------------------------------
        // Check duplicate email
        // ---------------------------------------------------------

        if (userRepository.existsByEmail(
                request.getEmail())) {

            throw new RuntimeException(
                    "Email already registered"
            );
        }

        // ---------------------------------------------------------
        // Find institution
        // ---------------------------------------------------------

        Institution institution =
                institutionRepository.findById(
                        request.getInstitutionId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Institution not found"
                        )
                );

        // ---------------------------------------------------------
        // Find department if provided
        // ---------------------------------------------------------

        Department department = null;

        if (request.getDepartmentId() != null) {

            department =
                    departmentRepository.findById(
                            request.getDepartmentId()
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "Department not found"
                            )
                    );
        }

        // ---------------------------------------------------------
        // Create user
        // ---------------------------------------------------------

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

        // ---------------------------------------------------------
        // IMPORTANT:
        // Normal registration = RESEARCHER
        // ---------------------------------------------------------

        user.setRole(
                Role.RESEARCHER
        );

        user.setInstitution(
                institution
        );

        user.setDepartment(
                department
        );

        // ---------------------------------------------------------
        // Save
        // ---------------------------------------------------------

        User savedUser =
                userRepository.save(user);

        // ---------------------------------------------------------
        // Generate JWT
        // ---------------------------------------------------------

        String token =
                jwtService.generateToken(
                        savedUser.getEmail(),
                        savedUser.getRole().name()
                );

        // ---------------------------------------------------------
        // Return response
        // ---------------------------------------------------------

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole().name()
        );
    }

    // =========================================================
    // LOGIN
    // =========================================================

    public AuthResponse login(
            LoginRequest request) {

        // ---------------------------------------------------------
        // Authenticate email + password
        // ---------------------------------------------------------

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // ---------------------------------------------------------
        // Load user
        // ---------------------------------------------------------

        User user =
                userRepository.findByEmail(
                        request.getEmail()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        // ---------------------------------------------------------
        // Generate JWT using actual database role
        // ---------------------------------------------------------

        String token =
                jwtService.generateToken(
                        user.getEmail(),
                        user.getRole().name()
                );

        // ---------------------------------------------------------
        // Return response
        // ---------------------------------------------------------

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}
