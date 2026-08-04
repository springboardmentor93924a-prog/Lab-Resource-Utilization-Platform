package com.example.lab_platform.service;

import com.example.lab_platform.dto.LoginRequest;
import com.example.lab_platform.dto.RegisterRequest;
import com.example.lab_platform.entity.Department;
import com.example.lab_platform.entity.Role;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.DepartmentRepository;
import com.example.lab_platform.repository.RoleRepository;
import com.example.lab_platform.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;

    public UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            DepartmentRepository departmentRepository) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.departmentRepository = departmentRepository;
    }

    // User Registration
    public User registerUser(RegisterRequest registerRequest) {

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email is already registered!");
        }

        Role role = roleRepository.findById(registerRequest.getRoleId())
                .orElseThrow(() ->
                        new RuntimeException("Role not found!"));

        Department department =
                departmentRepository.findById(
                        registerRequest.getDepartmentId())
                .orElseThrow(() ->
                        new RuntimeException("Department not found!"));

        User user = new User();

        user.setFullName(registerRequest.getFullName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(registerRequest.getPassword());
        user.setPhone(registerRequest.getPhone());
        user.setRole(role);
        user.setDepartment(department);
        user.setStatus("Active");

        return userRepository.save(user);
    }

    // User Login
    public User loginUser(LoginRequest loginRequest) {

        Optional<User> userOptional =
                userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found!");
        }

        User user = userOptional.get();

        if (!user.getPassword().equals(loginRequest.getPassword())) {
            throw new RuntimeException("Invalid credentials!");
        }

        if (!"Active".equalsIgnoreCase(user.getStatus())) {
            throw new RuntimeException("User account is inactive!");
        }

        return user;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }
}