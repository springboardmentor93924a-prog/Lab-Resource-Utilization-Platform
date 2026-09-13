
package com.labresource.config;

import com.labresource.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
    }

    // =========================================================
    // PASSWORD ENCODER
    // =========================================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    // =========================================================
    // AUTHENTICATION MANAGER
    // =========================================================

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }

    // =========================================================
    // SECURITY FILTER CHAIN
    // =========================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http)
            throws Exception {

        http

                // -------------------------------------------------
                // CSRF
                // -------------------------------------------------

                .csrf(csrf ->
                        csrf.disable()
                )

                // -------------------------------------------------
                // CORS
                // -------------------------------------------------

                .cors(cors ->
                        cors.configurationSource(request -> {

                            var configuration =
                                    new org.springframework.web.cors
                                            .CorsConfiguration();

                            configuration.setAllowedOrigins(
                                    java.util.List.of(
                                            "http://localhost:5173",
                                            "http://localhost:5174",
                                            "http://localhost:5175"
                                    )
                            );

                            configuration.setAllowedMethods(
                                    java.util.List.of(
                                            "GET",
                                            "POST",
                                            "PUT",
                                            "DELETE",
                                            "PATCH",
                                            "OPTIONS"
                                    )
                            );

                            configuration.setAllowedHeaders(
                                    java.util.List.of("*")
                            );

                            configuration.setAllowCredentials(
                                    true
                            );

                            return configuration;
                        })
                )

                // -------------------------------------------------
                // STATELESS JWT
                // -------------------------------------------------

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // -------------------------------------------------
                // AUTHORIZATION
                // -------------------------------------------------

                .authorizeHttpRequests(auth -> auth

                        // Public authentication APIs
                        .requestMatchers(
                                "/api/auth/**"
                        ).permitAll()

                        // Preflight
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // Existing APIs
                        .requestMatchers(
                                "/api/institutions/**"
                        ).permitAll()

                        .requestMatchers(
                                "/api/departments/**"
                        ).permitAll()

                        .requestMatchers(
                                "/api/equipment/**"
                        ).permitAll()

                        .requestMatchers(
                                "/api/bookings/**"
                        ).authenticated()

                        .requestMatchers(
                                "/api/waitlists/**"
                        ).authenticated()

                        .requestMatchers(
                                "/api/analytics/**"
                        ).permitAll()

                        .requestMatchers(
                                "/api/maintenance/**"
                        ).authenticated()

                        // -------------------------------------------------
                        // ADMIN USER API
                        //
                        // Authentication is required here.
                        // Actual role checking is done using
                        // @PreAuthorize in AdminUserController.
                        // -------------------------------------------------

                        .requestMatchers(
                                "/api/admin/users/**"
                        ).authenticated()

                        
                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )

                // -------------------------------------------------
                // JWT FILTER
                // -------------------------------------------------

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}
