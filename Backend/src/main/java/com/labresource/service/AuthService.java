package com.labresource.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import com.labresource.dto.AuthResponse;
import com.labresource.dto.ForgotPasswordRequest;
import com.labresource.dto.LoginRequest;
import com.labresource.dto.ProfileResponse;
import com.labresource.dto.RegisterRequest;
import com.labresource.dto.ResetPasswordRequest;

import com.labresource.entity.Department;
import com.labresource.entity.Institution;
import com.labresource.entity.Role;
import com.labresource.entity.User;

import com.labresource.repository.DepartmentRepository;
import com.labresource.repository.InstitutionRepository;
import com.labresource.repository.UserRepository;

import com.labresource.security.JwtService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

import java.util.UUID;


@Service
public class AuthService {

    private final UserRepository userRepository;

    private final InstitutionRepository
            institutionRepository;

    private final DepartmentRepository
            departmentRepository;

    private final PasswordEncoder
            passwordEncoder;

    private final AuthenticationManager
            authenticationManager;

    private final JwtService
            jwtService;

    private final JavaMailSender mailSender;


    public AuthService(

        UserRepository userRepository,

        InstitutionRepository institutionRepository,

        DepartmentRepository departmentRepository,

        PasswordEncoder passwordEncoder,

        AuthenticationManager authenticationManager,

        JwtService jwtService,

        JavaMailSender mailSender
) {

    this.userRepository =
            userRepository;

    this.institutionRepository =
            institutionRepository;

    this.departmentRepository =
            departmentRepository;

    this.passwordEncoder =
            passwordEncoder;

    this.authenticationManager =
            authenticationManager;

    this.jwtService =
            jwtService;

    this.mailSender =
            mailSender;
}

    // =========================================================
    // NORMAL USER REGISTRATION
    // =========================================================

    public AuthResponse register(
            RegisterRequest request
    ) {

        if (
                request.getEmail() == null
                        ||
                request.getEmail().isBlank()
        ) {

            throw new RuntimeException(
                    "Email is required."
            );
        }


        if (
                userRepository.existsByEmail(
                        request.getEmail()
                )
        ) {

            throw new RuntimeException(
                    "Email already registered"
            );
        }


        Institution institution =
                institutionRepository.findById(
                        request.getInstitutionId()
                ).orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Institution not found"
                                )
                );


        Department department =
                null;


        if (
                request.getDepartmentId()
                        != null
        ) {

            department =
                    departmentRepository.findById(
                            request.getDepartmentId()
                    ).orElseThrow(
                            () ->
                                    new RuntimeException(
                                            "Department not found"
                                    )
                    );
        }


        User user =
                new User();


        user.setFullName(
                request.getFullName()
        );


        user.setEmail(
                request.getEmail()
        );


        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );


        // Normal registration always creates RESEARCHER

        user.setRole(
                Role.RESEARCHER
        );


        user.setInstitution(
                institution
        );


        user.setDepartment(
                department
        );


        User savedUser =
                userRepository.save(
                        user
                );


        String token =
                jwtService.generateToken(
                        savedUser.getEmail(),
                        savedUser.getRole().name()
                );


        return new AuthResponse(

                token,

                savedUser.getId(),

                savedUser.getFullName(),

                savedUser.getEmail(),

                savedUser.getRole().name()
        );
    }


    // =========================================================
    // LOGIN
    // =========================================================

    public AuthResponse login(
            LoginRequest request
    ) {

        authenticationManager.authenticate(

                new UsernamePasswordAuthenticationToken(

                        request.getEmail(),

                        request.getPassword()
                )
        );


        User user =
                userRepository.findByEmail(
                        request.getEmail()
                ).orElseThrow(
                        () ->
                                new RuntimeException(
                                        "User not found"
                                )
                );


        String token =
                jwtService.generateToken(

                        user.getEmail(),

                        user.getRole().name()
                );


        return new AuthResponse(

                token,

                user.getId(),

                user.getFullName(),

                user.getEmail(),

                user.getRole().name()
        );
    }


    // =========================================================
    // GET CURRENT USER PROFILE
    // =========================================================

    public ProfileResponse
    getCurrentUserProfile(
            String email
    ) {

        User user =
                userRepository.findByEmail(
                        email
                ).orElseThrow(
                        () ->
                                new RuntimeException(
                                        "User not found"
                                )
                );


        Long institutionId =
                null;

        String institutionName =
                null;


        if (
                user.getInstitution()
                        != null
        ) {

            institutionId =
                    user.getInstitution()
                            .getId();

            institutionName =
                    user.getInstitution()
                            .getName();
        }


        Long departmentId =
                null;

        String departmentName =
                null;


        if (
                user.getDepartment()
                        != null
        ) {

            departmentId =
                    user.getDepartment()
                            .getId();

            departmentName =
                    user.getDepartment()
                            .getName();
        }


        return new ProfileResponse(

                user.getId(),

                user.getFullName(),

                user.getEmail(),

                user.getRole().name(),

                institutionId,

                institutionName,

                departmentId,

                departmentName
        );
    }


    // =========================================================
// FORGOT PASSWORD
// =========================================================

public void forgotPassword(
        ForgotPasswordRequest request
) {

    if (
            request.getEmail() == null
                    ||
            request.getEmail().isBlank()
    ) {

        throw new RuntimeException(
                "Email is required"
        );
    }


    String email =
            request.getEmail()
                    .trim()
                    .toLowerCase();


    User user =
            userRepository
                    .findByEmail(
                            email
                    )
                    .orElse(
                            null
                    );


    /*
     * Return successfully even if user does not exist.
     *
     * This prevents revealing whether an email address
     * is registered in the system.
     */

    if (
            user == null
    ) {

        return;
    }


    // =====================================================
    // GENERATE RESET TOKEN
    // =====================================================

    String resetToken =
            UUID.randomUUID()
                    .toString();


    LocalDateTime expiry =
            LocalDateTime.now()
                    .plusMinutes(
                            30
                    );


    user.setPasswordResetToken(
            resetToken
    );


    user.setPasswordResetTokenExpiry(
            expiry
    );


    userRepository.save(
            user
    );


    // =====================================================
    // CREATE RESET LINK
    // =====================================================

    String resetLink =
            "http://localhost:5173/reset-password?token="
                    + resetToken;


    // =====================================================
    // SEND EMAIL
    // =====================================================

    SimpleMailMessage message =
            new SimpleMailMessage();


    message.setTo(
            user.getEmail()
    );


    message.setSubject(
            "Reset Your Lab Resource Platform Password"
    );


    message.setText(
            "Hello "
                    + user.getFullName()
                    + ",\n\n"

                    + "We received a request to reset your password "
                    + "for the Lab Equipment Utilization Platform.\n\n"

                    + "Click the link below to reset your password:\n\n"

                    + resetLink

                    + "\n\n"

                    + "This link will expire in 30 minutes.\n\n"

                    + "If you did not request a password reset, "
                    + "please ignore this email.\n\n"

                    + "Lab Equipment Utilization Platform"
    );


    mailSender.send(
            message
    );
}


    // =========================================================
    // RESET PASSWORD
    // =========================================================

    public void resetPassword(
            ResetPasswordRequest request
    ) {

        if (
                request.getToken() == null
                        ||
                request.getToken().isBlank()
        ) {

            throw new RuntimeException(
                    "Invalid password reset token"
            );
        }


        if (
                request.getPassword() == null
                        ||
                request.getPassword().length() < 6
        ) {

            throw new RuntimeException(
                    "Password must be at least 6 characters"
            );
        }


        User user =
                userRepository.findByPasswordResetToken(
                        request.getToken()
                ).orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Invalid password reset token"
                                )
                );


        LocalDateTime expiry =
                user.getPasswordResetTokenExpiry();


        if (
                expiry == null
                        ||
                expiry.isBefore(
                        LocalDateTime.now()
                )
        ) {

            // Remove expired token

            user.setPasswordResetToken(
                    null
            );


            user.setPasswordResetTokenExpiry(
                    null
            );


            userRepository.save(
                    user
            );


            throw new RuntimeException(
                    "Password reset link has expired"
            );
        }


        // Encode new password

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );


        // Invalidate token

        user.setPasswordResetToken(
                null
        );


        user.setPasswordResetTokenExpiry(
                null
        );


        userRepository.save(
                user
        );
    }
}