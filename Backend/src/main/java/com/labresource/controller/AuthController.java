package com.labresource.controller;

import com.labresource.dto.AuthResponse;
import com.labresource.dto.ForgotPasswordRequest;
import com.labresource.dto.LoginRequest;
import com.labresource.dto.ProfileResponse;
import com.labresource.dto.RegisterRequest;
import com.labresource.dto.ResetPasswordRequest;

import com.labresource.service.AuthService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175"
        }
)
public class AuthController {

    private final AuthService
            authService;


    public AuthController(
            AuthService authService
    ) {

        this.authService =
                authService;
    }


    // =========================================================
    // REGISTER
    // =========================================================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody
            RegisterRequest request
    ) {

        try {

            return ResponseEntity

                    .status(
                            HttpStatus.CREATED
                    )

                    .body(
                            authService.register(
                                    request
                            )
                    );

        } catch (
                RuntimeException e
        ) {

            return ResponseEntity

                    .badRequest()

                    .body(
                            e.getMessage()
                    );
        }
    }


    // =========================================================
    // LOGIN
    // =========================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody
            LoginRequest request
    ) {

        try {

            return ResponseEntity.ok(

                    authService.login(
                            request
                    )
            );

        } catch (
                Exception e
        ) {

            return ResponseEntity

                    .status(
                            HttpStatus.UNAUTHORIZED
                    )

                    .body(
                            "Invalid email or password"
                    );
        }
    }


    // =========================================================
    // GET CURRENT USER
    // =========================================================

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            Authentication authentication
    ) {

        try {

            if (
                    authentication == null
                            ||
                    !authentication.isAuthenticated()
            ) {

                return ResponseEntity

                        .status(
                                HttpStatus.UNAUTHORIZED
                        )

                        .body(
                                "User is not authenticated"
                        );
            }


            String email =
                    authentication.getName();


            ProfileResponse profile =
                    authService
                            .getCurrentUserProfile(
                                    email
                            );


            return ResponseEntity.ok(
                    profile
            );

        } catch (
                RuntimeException e
        ) {

            return ResponseEntity

                    .status(
                            HttpStatus.NOT_FOUND
                    )

                    .body(
                            e.getMessage()
                    );
        }
    }


    // =========================================================
    // FORGOT PASSWORD
    // =========================================================

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody
            ForgotPasswordRequest request
    ) {

        try {

            authService.forgotPassword(
                    request
            );


            /*
             * Same response for existing and non-existing emails.
             */

            return ResponseEntity.ok(
                    "If an account exists for this email, "
                            +
                            "password reset instructions have been generated."
            );

        } catch (
                RuntimeException e
        ) {

            return ResponseEntity

                    .badRequest()

                    .body(
                            e.getMessage()
                    );
        }
    }


    // =========================================================
    // RESET PASSWORD
    // =========================================================

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody
            ResetPasswordRequest request
    ) {

        try {

            authService.resetPassword(
                    request
            );


            return ResponseEntity.ok(
                    "Password reset successfully"
            );

        } catch (
                RuntimeException e
        ) {

            return ResponseEntity

                    .badRequest()

                    .body(
                            e.getMessage()
                    );
        }
    }
}