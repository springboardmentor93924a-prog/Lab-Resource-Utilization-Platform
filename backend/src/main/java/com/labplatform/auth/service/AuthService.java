package com.labplatform.auth.service;
import com.labplatform.auth.dto.MeResponse;
import com.labplatform.auth.dto.AuthResponse;
import com.labplatform.auth.dto.LoginRequest;
import com.labplatform.auth.dto.RegisterRequest;
import com.labplatform.auth.model.Role;
import com.labplatform.auth.model.User;
import com.labplatform.auth.repository.RoleRepository;
import com.labplatform.auth.repository.UserRepository;
import com.labplatform.auth.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.labplatform.auth.dto.GoogleRegisterRequest;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }
    public MeResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        return new MeResponse(
                user.getId().toString(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().getName(),
                user.getInstitution() != null ? user.getInstitution().getId() : null,
                user.getInstitution() != null ? user.getInstitution().getName() : null
        );
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        Role role = roleRepository.findByName(request.getRole().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid role: " + request.getRole()));

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setInstitutionId(request.getInstitutionId());
        user.setDepartmentId(request.getDepartmentId());

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().getName(), user.getId().toString());
        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole().getName());
    }
    public AuthResponse registerGoogleUser(
            String email,
            String fullName,
            GoogleRegisterRequest request
    ) {

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists"
            );
        }

        Role role = roleRepository
                .findByName(request.getRole().toUpperCase())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid role: " + request.getRole()
                        )
                );

        User user = new User();

        user.setFullName(fullName);
        user.setEmail(email);

        /*
         * Google users do not use the normal password login.
         * User.password is currently mandatory, so store
         * a random encoded value.
         */
        user.setPassword(
                passwordEncoder.encode(
                        java.util.UUID.randomUUID().toString()
                )
        );

        user.setRole(role);
        user.setInstitutionId(request.getInstitutionId());
        user.setDepartmentId(request.getDepartmentId());

        userRepository.save(user);

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().getName(),
                user.getId().toString()
        );

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getFullName(),
                user.getRole().getName()
        );
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().getName(), user.getId().toString());
        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole().getName());
    }

}