package com.example.lab_platform.controller;

import com.example.lab_platform.dto.ForgotPasswordRequest;
import com.example.lab_platform.dto.LoginRequest;
import com.example.lab_platform.dto.RegisterRequest;
import com.example.lab_platform.dto.ResetPasswordRequest;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.security.JwtService;
import com.example.lab_platform.service.EmailService;
import com.example.lab_platform.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${app.frontend-base-url}")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthController(
            UserService userService,
            JwtService jwtService,
            EmailService emailService) {

        this.userService = userService;
        this.jwtService = jwtService;
        this.emailService = emailService;
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

            if (user.getInstitution() != null) {
                response.put("institutionId", user.getInstitution().getInstitutionId());
                response.put("institutionName", user.getInstitution().getInstitutionName());
            }

            if (user.getDepartment() != null) {
    response.put("departmentId", user.getDepartment().getDepartmentId());
    response.put("departmentName", user.getDepartment().getDepartmentName());
}
            return ResponseEntity.ok(response);

        }catch (RuntimeException e) {
    Map<String, Object> error = new HashMap<>();
    error.put("message", e.getMessage());

    return ResponseEntity
            .badRequest()
            .body(error);
}
    }


    // =========================
    // REGISTER
    // =========================
    // Public self-registration. Any role listed in /api/roles (including
    // admin-tier roles) can be selected here — self-registration is
    // intentionally left open for every role.
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

    // =========================
    // FORGOT PASSWORD
    // Security note: the reset token is never returned in the API
    // response (that would let anyone who knows/guesses an email take
    // over the account without inbox access) - it's only ever sent to
    // the account's own inbox via EmailService. The response is
    // identical whether or not the email exists, so this endpoint can't
    // be used to enumerate registered accounts.
    // =========================
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {

        Map<String, Object> response = new HashMap<>();
        response.put("message", "If an account with that email exists, a password reset link has been generated.");

        try {
            String token = userService.createPasswordResetToken(request.getEmail());

            emailService.sendPasswordResetEmail(request.getEmail(), token);

            // Still logged server-side too, so the flow is testable even
            // before SMTP creds (MAIL_USERNAME/MAIL_PASSWORD) are set up.
            org.slf4j.LoggerFactory.getLogger(AuthController.class)
                    .info("Password reset token generated for {}: {}", request.getEmail(), token);

        } catch (RuntimeException e) {
            // Deliberately swallowed: returning a different response for a
            // nonexistent email allows user enumeration.
            org.slf4j.LoggerFactory.getLogger(AuthController.class)
                    .info("Password reset requested for unknown/invalid email: {}", request.getEmail());
        }

        return ResponseEntity.ok(response);
    }

@PostMapping("/reset-password")
public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
    try {
        userService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("Password reset successful");

    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}

}