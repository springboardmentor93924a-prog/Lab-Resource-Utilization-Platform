package com.lab.labresource.service.impl;

import com.lab.labresource.dto.LoginRequest;
import com.lab.labresource.dto.LoginResponse;
import com.lab.labresource.entity.User;
import com.lab.labresource.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import com.lab.labresource.service.AuthService;
import com.lab.labresource.security.JwtService;
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    @Override
    public LoginResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        String token = jwtService.generateToken(
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPassword(),
                        java.util.List.of()
                )
        );

        return LoginResponse.builder()
                .message("Login Successful")
                .role(user.getRole().getRoleName())
                .token(token)
                .build();
    }
}
