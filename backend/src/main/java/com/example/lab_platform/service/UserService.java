package com.example.lab_platform.service;

import com.example.lab_platform.dto.LoginRequest;
import com.example.lab_platform.dto.RegisterRequest;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // 1. User Registration Logic
    public User registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email is already registered!");
        }

        User user = new User();
        user.setFullName(registerRequest.getFullName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(registerRequest.getPassword()); // Raw password (Spring Security BCrypt encoder standard flow me baad me integrate hoga)
        user.setPhone(registerRequest.getPhone());
        user.setStatus("Active");

        return userRepository.save(user);
    }

    // 2. User Login Logic
    public User loginUser(LoginRequest loginRequest) {
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getPassword().equals(loginRequest.getPassword())) {
                return user;
            } else {
                throw new RuntimeException("Invalid credentials!");
            }
        } else {
            throw new RuntimeException("User not found!");
        }
    }

    // 3. Get All Users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 4. Get User By ID
    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }
}
