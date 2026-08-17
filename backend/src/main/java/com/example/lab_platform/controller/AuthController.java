package com.example.lab_platform.controller;

import com.example.lab_platform.dto.LoginRequest;
import com.example.lab_platform.dto.RegisterRequest;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.security.JwtService;
import com.example.lab_platform.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(
            UserService userService,
            JwtService jwtService) {

        this.userService = userService;
        this.jwtService = jwtService;
    }


    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest loginRequest) {

        try {

            User user = userService.loginUser(loginRequest);

            String role = "";

            if (user.getRole() != null) {
                role = user.getRole()
                        .getRoleName()
                        .toUpperCase()
                        .replace(" ", "_");
            }

            String token = jwtService.generateToken(
                    user.getEmail(),
                    role
            );

            Map<String, Object> response = new HashMap<>();

            response.put("token", token);
            response.put("userId", user.getUserId());
            response.put("fullName", user.getFullName());
            response.put("email", user.getEmail());
            response.put("role", role);

            return ResponseEntity.ok(response);

       } catch (RuntimeException e) {
    Map<String, Object> errorResponse = new HashMap<>();
    errorResponse.put("message", e.getMessage());
    return ResponseEntity
            .badRequest()
            .body(errorResponse);
}
    }


    // =========================
    // REGISTER
    // =========================
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest registerRequest) {

        try {

            User user =
                    userService.registerUser(registerRequest);

            return ResponseEntity.ok(user);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}
