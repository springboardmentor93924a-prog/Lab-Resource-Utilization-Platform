package com.example.lab_platform.config;

import com.example.lab_platform.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

            // =====================================================
            // CORS
            // =====================================================
            .cors(cors ->
                cors.configurationSource(
                    corsConfigurationSource()
                )
            )

            // =====================================================
            // CSRF
            // =====================================================
            .csrf(csrf ->
                csrf.disable()
            )

            // =====================================================
            // JWT = Stateless
            // =====================================================
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // =====================================================
            // AUTHORIZATION
            // =====================================================
            .authorizeHttpRequests(auth -> auth

                // CORS preflight
                .requestMatchers(
                    org.springframework.http.HttpMethod.OPTIONS,
                    "/**"
                ).permitAll()

                // -------------------------------------------------
                // PUBLIC ENDPOINTS
                // -------------------------------------------------
                .requestMatchers(
                    "/api/auth/**",
                    "/api/departments/**",
                    "/api/institutions/**",
                    "/api/roles/**",
                    "/error"
                ).permitAll()

                // -------------------------------------------------
                // EQUIPMENT
                // Actual role restrictions are also controlled
                // using @PreAuthorize in EquipmentController.
                // -------------------------------------------------
                .requestMatchers("/api/equipment/**")
                .authenticated()

                // -------------------------------------------------
                // BOOKINGS
                // -------------------------------------------------
                .requestMatchers("/api/bookings/**")
                .authenticated()

                // -------------------------------------------------
                // UTILIZATION / DASHBOARD
                // -------------------------------------------------
                .requestMatchers("/api/utilization/**")
                .authenticated()

                // -------------------------------------------------
                // USERS
                // Only administrators should access this API.
                // -------------------------------------------------
                .requestMatchers("/api/users/**")
                .hasAnyRole(
                    "INSTITUTION_ADMIN",
                    "SYSTEM_ADMIN"
                )

                // -------------------------------------------------
                // EVERYTHING ELSE
                // -------------------------------------------------
                .anyRequest()
                .authenticated()
            )

            // =====================================================
            // JWT FILTER
            // =====================================================
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    // =============================================================
    // CORS CONFIGURATION
    // =============================================================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
            List.of("http://localhost:5173")
        );

        configuration.setAllowedMethods(
            List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS"
            )
        );

        configuration.setAllowedHeaders(
            List.of(
                "Authorization",
                "Content-Type"
            )
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
            "/**",
            configuration
        );

        return source;
    }

    // =============================================================
    // PASSWORD ENCODER
    // =============================================================
    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }
}