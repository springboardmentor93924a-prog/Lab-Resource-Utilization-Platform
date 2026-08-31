package com.labplatform.auth.service;
import org.springframework.transaction.annotation.Transactional;
import com.labplatform.auth.dto.AuthResponse;
import com.labplatform.auth.dto.GoogleRegisterRequest;
import com.labplatform.auth.dto.LoginRequest;
import com.labplatform.auth.dto.MeResponse;
import com.labplatform.auth.dto.RegisterRequest;
import com.labplatform.auth.model.PasswordResetToken;
import com.labplatform.auth.model.Role;
import com.labplatform.auth.model.User;
import com.labplatform.auth.repository.PasswordResetTokenRepository;
import com.labplatform.auth.repository.RoleRepository;
import com.labplatform.auth.repository.UserRepository;
import com.labplatform.auth.security.JwtUtil;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;


@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final JavaMailSender mailSender;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            AuthenticationManager authenticationManager,
            PasswordResetTokenRepository passwordResetTokenRepository,
            JavaMailSender mailSender) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.mailSender = mailSender;
    }


    // =========================================================
    // GET CURRENT USER
    // =========================================================

    public MeResponse getCurrentUser(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new BadCredentialsException("User not found")
                );

        return new MeResponse(
                user.getId().toString(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().getName(),
                user.getInstitution() != null
                        ? user.getInstitution().getId()
                        : null,
                user.getInstitution() != null
                        ? user.getInstitution().getName()
                        : null
        );
    }


    // =========================================================
    // NORMAL REGISTRATION
    // =========================================================

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {

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

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setRole(role);

        user.setInstitutionId(
                request.getInstitutionId()
        );

        user.setDepartmentId(
                request.getDepartmentId()
        );

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


    // =========================================================
    // GOOGLE REGISTRATION
    // =========================================================

    public AuthResponse registerGoogleUser(
            String email,
            String fullName,
            GoogleRegisterRequest request) {

        if (userRepository.existsByEmail(email)) {

            throw new IllegalArgumentException(
                    "An account with this email already exists"
            );
        }


        Role role = roleRepository
                .findByName(
                        request.getRole().toUpperCase()
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid role: "
                                        + request.getRole()
                        )
                );


        User user = new User();

        user.setFullName(fullName);
        user.setEmail(email);

        /*
         * Google users do not use normal password login.
         * The password column is mandatory, so store
         * a random encoded value.
         */
        user.setPassword(
                passwordEncoder.encode(
                        UUID.randomUUID().toString()
                )
        );

        user.setRole(role);

        user.setInstitutionId(
                request.getInstitutionId()
        );

        user.setDepartmentId(
                request.getDepartmentId()
        );

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


    // =========================================================
    // LOGIN
    // =========================================================

    public AuthResponse login(LoginRequest request) {

        try {

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

        } catch (Exception e) {

            throw new BadCredentialsException(
                    "Invalid email or password"
            );
        }


        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new BadCredentialsException(
                                "Invalid email or password"
                        )
                );


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


    // =========================================================
    // FORGOT PASSWORD
    // =========================================================

   @Transactional
public void forgotPassword(String email) {

        User user = userRepository
                .findByEmail(email)
                .orElse(null);


        /*
         * Do not reveal whether the email exists.
         *
         * This prevents account enumeration.
         */
        if (user == null) {
            return;
        }


        /*
         * Delete any previous reset token
         * belonging to this user.
         */
        passwordResetTokenRepository
                .deleteByUser(user);


        /*
         * Generate a secure random reset token.
         */
        String token = UUID.randomUUID().toString();


        PasswordResetToken resetToken =
                new PasswordResetToken();

        resetToken.setToken(token);
        resetToken.setUser(user);

        resetToken.setExpiryDate(
                LocalDateTime.now().plusMinutes(30)
        );

        resetToken.setUsed(false);


        passwordResetTokenRepository.save(
                resetToken
        );


        /*
         * Link that will be opened by the frontend.
         */
        String resetLink =
                "http://localhost:5173/reset-password?token="
                        + token;


        /*
         * Create email.
         */
        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(user.getEmail());

        message.setSubject(
                "Lab Platform - Password Reset"
        );

        message.setText(
                "Hello "
                        + user.getFullName()
                        + ",\n\n"

                        + "We received a request to reset "
                        + "your password.\n\n"

                        + "Click the link below to create "
                        + "a new password:\n\n"

                        + resetLink
                        + "\n\n"

                        + "This link will expire in "
                        + "30 minutes.\n\n"

                        + "If you did not request a password "
                        + "reset, you can safely ignore "
                        + "this email.\n\n"

                        + "Lab Resource Utilization Platform"
        );


        /*
         * Send email using Gmail SMTP.
         */
        mailSender.send(message);
    }


    // =========================================================
    // RESET PASSWORD
    // =========================================================

    public void resetPassword(
            String token,
            String newPassword) {


        PasswordResetToken resetToken =
                passwordResetTokenRepository
                        .findByToken(token)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid or expired reset token"
                                )
                        );


        /*
         * Check whether token was already used.
         */
        if (resetToken.isUsed()) {

            throw new IllegalArgumentException(
                    "This reset link has already been used"
            );
        }


        /*
         * Check whether token has expired.
         */
        if (resetToken.getExpiryDate()
                .isBefore(LocalDateTime.now())) {

            throw new IllegalArgumentException(
                    "This reset link has expired"
            );
        }


        /*
         * Get the user associated with the token.
         */
        User user =
                resetToken.getUser();


        /*
         * Encode the new password before storing it.
         */
        user.setPassword(
                passwordEncoder.encode(
                        newPassword
                )
        );


        userRepository.save(user);


        /*
         * Mark the reset token as used.
         */
        resetToken.setUsed(true);

        passwordResetTokenRepository.save(
                resetToken
        );
    }
}