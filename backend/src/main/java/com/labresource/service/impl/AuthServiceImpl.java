package com.labresource.service.impl;

import com.labresource.dto.request.LoginRequest;
import com.labresource.dto.request.RegisterRequest;
import com.labresource.dto.response.AuthResponse;
import com.labresource.entity.Department;
import com.labresource.entity.Institution;
import com.labresource.entity.Role;
import com.labresource.entity.User;
import com.labresource.repository.DepartmentRepository;
import com.labresource.repository.InstitutionRepository;
import com.labresource.repository.RoleRepository;
import com.labresource.repository.UserRepository;
import com.labresource.security.JwtService;
import com.labresource.security.UserDetailsImpl;
import com.labresource.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            InstitutionRepository institutionRepository,
            DepartmentRepository departmentRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.institutionRepository = institutionRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException(
                    "User with this email already exists"
            );
        }

        Role role = roleRepository
                .findByName(request.getRole())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Role not found: " + request.getRole()
                        )
                );

        Institution institution = institutionRepository
                .findById(request.getInstitutionId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Institution not found"
                        )
                );

        Department department = departmentRepository
                .findById(request.getDepartmentId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Department not found"
                        )
                );

        /*
         * Check whether the selected department belongs
         * to the selected institution.
         */
        if (department.getInstitution() == null
                || !department.getInstitution()
                .getId()
                .equals(institution.getId())) {

            throw new RuntimeException(
                    "Department does not belong to selected institution"
            );
        }

        User user = new User();

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(email);
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );
        user.setPhone(request.getPhone());
        user.setRole(role);
        user.setInstitution(institution);
        user.setDepartment(department);
        user.setStatus("ACTIVE");

        User savedUser = userRepository.save(user);

        UserDetailsImpl userDetails =
                new UserDetailsImpl(savedUser);

        String jwtToken =
                jwtService.generateToken(userDetails);

        return createAuthResponse(
                savedUser,
                jwtToken,
                "Registration successful"
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase();

        /*
         * Spring Security checks:
         * 1. Whether user exists
         * 2. Whether password is correct
         * 3. Whether account is enabled
         */
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        request.getPassword()
                )
        );

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        UserDetailsImpl userDetails =
                new UserDetailsImpl(user);

        String jwtToken =
                jwtService.generateToken(userDetails);

        return createAuthResponse(
                user,
                jwtToken,
                "Login successful"
        );
    }

    private AuthResponse createAuthResponse(
            User user,
            String token,
            String message
    ) {

        String roleName = null;

        if (user.getRole() != null
                && user.getRole().getName() != null) {

            roleName = user.getRole()
                    .getName()
                    .name();
        }

        return new AuthResponse(
                token,
                "Bearer",
                message,
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                roleName
        );
    }
}