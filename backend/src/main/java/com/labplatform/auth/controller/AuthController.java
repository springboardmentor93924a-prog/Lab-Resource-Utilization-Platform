package com.labplatform.auth.controller;
import com.labplatform.auth.dto.AuthResponse;
import com.labplatform.auth.dto.LoginRequest;
import com.labplatform.auth.dto.RegisterRequest;
import com.labplatform.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.labplatform.auth.dto.MeResponse;
import org.springframework.security.core.Authentication;
import java.util.Map;
import com.labplatform.auth.dto.GoogleRegisterRequest;
import jakarta.servlet.http.HttpSession;


@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        }
    }
    @PostMapping("/google/register")
    public ResponseEntity<?> registerGoogleUser(
            @Valid @RequestBody GoogleRegisterRequest request,
            HttpSession session
    ) {
        try {

            String email =
                    (String) session.getAttribute("GOOGLE_EMAIL");

            String fullName =
                    (String) session.getAttribute("GOOGLE_FULL_NAME");

            if (email == null || email.isBlank()) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of(
                                "message",
                                "Google registration session has expired. Please sign in with Google again."
                        ));
            }

            if (fullName == null || fullName.isBlank()) {
                fullName = email.split("@")[0];
            }

            AuthResponse response =
                    authService.registerGoogleUser(
                            email,
                            fullName,
                            request
                    );

            session.removeAttribute("GOOGLE_EMAIL");
            session.removeAttribute("GOOGLE_FULL_NAME");

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
        }
    }
    @GetMapping("/me")
    public ResponseEntity<MeResponse> getCurrentUser(Authentication authentication) {
        MeResponse response = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(response);
    }
}
