package com.infosys.labresource.auth.service;


import com.infosys.labresource.auth.dto.JwtResponseDTO;
import com.infosys.labresource.user.DTOs.LoginRequestDTO;
import com.infosys.labresource.user.Repository.UserRepository;
import com.infosys.labresource.user.entites.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.infosys.labresource.auth.filter.JwtUtil;
@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public JwtResponseDTO login(LoginRequestDTO request) {


        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

        System.out.println("=================================");
        System.out.println("LOGIN USER: " + user.getEmail());
        System.out.println("ROLE: " + user.getRole());
        System.out.println("ACTIVE: " + user.getIsActive());
        System.out.println("PASSWORD MATCH: " +
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                ));
        System.out.println("=================================");

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        return new JwtResponseDTO(token);
    }


}
