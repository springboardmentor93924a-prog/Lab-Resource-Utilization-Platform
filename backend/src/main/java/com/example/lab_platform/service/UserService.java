package com.example.lab_platform.service;

import com.example.lab_platform.dto.LoginRequest;
import com.example.lab_platform.dto.RegisterRequest;
import com.example.lab_platform.entity.Department;
import com.example.lab_platform.entity.Role;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.DepartmentRepository;
import com.example.lab_platform.repository.RoleRepository;
import com.example.lab_platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Added BCrypt Password Encoder for security audit


    // =========================
    // REGISTER USER
    // =========================
    public User registerUser(RegisterRequest registerRequest) {

        // Check duplicate email
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email is already registered!");
        }

        // Find role
        Role role = roleRepository.findById(registerRequest.getRoleId())
                .orElseThrow(() ->
                        new RuntimeException("Invalid role selected!")
                );

        // Find department
        Department department = departmentRepository
                .findById(registerRequest.getDepartmentId())
                .orElseThrow(() ->
                        new RuntimeException("Invalid department selected!")
                );

        // Create user
        User user = new User();

        user.setFullName(registerRequest.getFullName());
        user.setEmail(registerRequest.getEmail());
        
        // Encode password using BCrypt instead of storing in plain text
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        
        user.setPhone(registerRequest.getPhone());

        // Set role and department
        user.setRole(role);
        user.setDepartment(department);

        // Default status
        user.setStatus("Active");

        return userRepository.save(user);
    }


    // =========================
    // LOGIN USER
    // =========================
    public User loginUser(LoginRequest loginRequest) {

        Optional<User> userOptional =
                userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found!");
        }

        User user = userOptional.get();

        // Check account status
        if (!"Active".equalsIgnoreCase(user.getStatus())) {
            throw new RuntimeException("User account is inactive!");
        }

        // Check password using passwordEncoder matches for hashed passwords
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials!");
        }

        return user;
    }


    // =========================
    // GET ALL USERS
    // =========================
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }


    // =========================
    // GET USER BY ID
    // =========================
    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }
}
