package com.example.demo.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.Department;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.DepartmentRepository;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private RoleRepository roleRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        // Check whether email is already registered
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", "Email already registered"));
        }

        // Create user
        User user = new User();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        // Find department
        Department department = departmentRepository
                .findById(request.getDepartmentId())
                .orElseThrow(() ->
                        new RuntimeException("Invalid department ID")
                );

        user.setDepartment(department);

        // Find role
        Role role = roleRepository
                .findById(request.getRoleId())
                .orElseThrow(() ->
                        new RuntimeException("Invalid role ID")
                );

        user.setRole(role);

        // Timestamps
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        // Save user
        userRepository.save(user);

        // Generate JWT immediately after registration
        String roleName = role.getRoleName()
                .toUpperCase()
                .replace(" ", "_")
                .replace("/", "_");

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getUserId(),
                roleName
        );

        // Return same response shape as login
        Map<String, Object> response = new HashMap<>();

        response.put("token", token);
        response.put("email", user.getEmail());
        response.put(
                "fullName",
                user.getFirstName() + " " + user.getLastName()
        );
        response.put("role", roleName);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElse(null);

        // Validate credentials
        if (user == null ||
                !passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                )) {

            return ResponseEntity
                    .status(401)
                    .body(Map.of("error", "Invalid email or password"));
        }

        // Get role name
        String roleName = user.getRole() != null
                ? user.getRole()
                        .getRoleName()
                        .toUpperCase()
                        .replace(" ", "_")
                        .replace("/", "_")
                : null;

        // Generate JWT
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getUserId(),
                roleName
        );

        // Return authentication information
        Map<String, Object> response = new HashMap<>();

        response.put("token", token);
        response.put("email", user.getEmail());
        response.put(
                "fullName",
                user.getFirstName() + " " + user.getLastName()
        );
        response.put("role", roleName);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(java.security.Principal principal) {

        User user = userRepository
                .findByEmail(principal.getName())
                .orElse(null);

        if (user == null) {
            return ResponseEntity
                    .status(404)
                    .body(Map.of("error", "User not found"));
        }

        Map<String, Object> response = new HashMap<>();

        response.put("id", user.getUserId());

        response.put(
                "fullName",
                user.getFirstName() + " " + user.getLastName()
        );

        response.put("email", user.getEmail());

        String roleName = user.getRole() != null
                ? user.getRole()
                        .getRoleName()
                        .toUpperCase()
                        .replace(" ", "_")
                        .replace("/", "_")
                : null;

        response.put("role", roleName);

        // Institution information comes through the user's department
        if (user.getDepartment() != null &&
                user.getDepartment().getInstitution() != null) {

            response.put(
                    "institutionName",
                    user.getDepartment()
                            .getInstitution()
                            .getInstitutionName()
            );

            response.put(
                    "institutionId",
                    user.getDepartment()
                            .getInstitution()
                            .getInstitutionId()
            );

        } else {
            response.put("institutionName", null);
            response.put("institutionId", null);
        }

        return ResponseEntity.ok(response);
    }
}
