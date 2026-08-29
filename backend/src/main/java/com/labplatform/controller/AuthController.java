package com.labplatform.controller;

import com.labplatform.dto.Dtos;
import com.labplatform.entity.User;
import com.labplatform.repository.UserRepository;
import com.labplatform.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Dtos.LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));

        String token = tokenProvider.generateToken(auth);
        User user = userRepository.findByEmail(req.email()).orElseThrow();

        Dtos.UserDto userDto = new Dtos.UserDto(
                user.getId(), user.getEmail(), user.getFullName(),
                user.getRole(), user.getDepartment(),
                user.getInstitution() != null ? user.getInstitution().getName() : "N/A"
        );

        return ResponseEntity.ok(new Dtos.AuthResponse(token, "Bearer", userDto));
    }
}