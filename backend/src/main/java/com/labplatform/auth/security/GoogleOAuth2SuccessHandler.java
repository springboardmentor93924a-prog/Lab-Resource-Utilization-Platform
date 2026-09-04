package com.labplatform.auth.security;
import org.springframework.beans.factory.annotation.Value;
import com.labplatform.auth.model.Role;
import com.labplatform.auth.model.User;
import com.labplatform.auth.repository.RoleRepository;
import com.labplatform.auth.repository.UserRepository;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.UUID;

@Component
public class GoogleOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger log =
            LoggerFactory.getLogger(GoogleOAuth2SuccessHandler.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${FRONTEND_URL:http://localhost:5173}")
private String frontendUrl;

    public GoogleOAuth2SuccessHandler(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        OAuth2User googleUser =
                (OAuth2User) authentication.getPrincipal();

        String email = googleUser.getAttribute("email");
        String fullName = googleUser.getAttribute("name");

        if (email == null || email.isBlank()) {
            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Google account email could not be retrieved"
            );
            return;
        }

        // If Google does not provide a name, use the email as fallback
        if (fullName == null || fullName.isBlank()) {
            fullName = email.split("@")[0];
        }

        // Find existing user
        User user = userRepository.findByEmail(email).orElse(null);

        // Create a new account if user does not exist
        if (user == null) {

            request.getSession().setAttribute(
                    "GOOGLE_EMAIL",
                    email
            );

            request.getSession().setAttribute(
                    "GOOGLE_FULL_NAME",
                    fullName
            );

            log.info(
                    "New Google user detected: {}. Redirecting to Google registration.",
                    email
            );

            response.sendRedirect(
        frontendUrl + "/google-register"
);

            return;
        }

        // Generate application JWT
        log.info("Google login successful for email: {}", user.getEmail());
        log.info("User ID: {}", user.getId());
        log.info("User role: {}", user.getRole().getName());

        log.info("Generating JWT...");

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().getName(),
                user.getId().toString()
        );

        log.info("JWT generated successfully.");

        // Redirect back to React with JWT
        String redirectUrl = UriComponentsBuilder
        .fromUriString(frontendUrl + "/oauth2/callback")
                .queryParam("token", token)
                .build()
                .encode()
                .toUriString();

        log.info("Redirecting Google user to frontend.");

        response.sendRedirect(redirectUrl);
    }
}