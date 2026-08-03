package com.labplatform.service;

import com.labplatform.dto.AuthResponse;
import com.labplatform.dto.LoginRequest;
import com.labplatform.dto.RegisterRequest;
import com.labplatform.entity.Institution;
import com.labplatform.entity.User;
import com.labplatform.repository.InstitutionRepository;
import com.labplatform.repository.UserRepository;
import com.labplatform.security.JwtService;
import com.labplatform.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalStateException("Email already registered");
        }

        Institution institution = null;
        if (req.getInstitutionId() != null) {
            institution = institutionRepository.findById(req.getInstitutionId())
                    .orElseThrow(() -> new IllegalArgumentException("Institution not found"));
        }

        User user = User.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .department(req.getDepartment())
                .role(req.getRole())
                .institution(institution)
                .active(true)
                .build();

        userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(new UserPrincipal(user));
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .institutionId(user.getInstitution() != null ? user.getInstitution().getId() : null)
                .build();
    }
}
