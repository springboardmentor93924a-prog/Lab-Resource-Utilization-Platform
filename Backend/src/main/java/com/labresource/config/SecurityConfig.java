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

import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .cors(cors -> cors.configurationSource(request -> {

                var configuration =
                        new org.springframework.web.cors.CorsConfiguration();

                List<String> allowedOrigins = new ArrayList<>(List.of(
                        "http://localhost:5173",
                        "http://localhost:5174",
                        "http://localhost:5175"
                ));

                String frontendUrl = System.getenv("FRONTEND_URL");
                if (frontendUrl != null && !frontendUrl.isBlank()) {
                    allowedOrigins.add(frontendUrl);
                }

                configuration.setAllowedOrigins(allowedOrigins);

                configuration.setAllowedMethods(List.of(
                        "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
                ));

                configuration.setAllowedHeaders(List.of("*"));
                configuration.setAllowCredentials(true);

                return configuration;
            }))

            .sessionManagement(session ->
                    session.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS
                    )
            )

            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/institutions/**").permitAll()
                .requestMatchers("/api/departments/**").permitAll()
                .requestMatchers("/api/equipment/**").permitAll()
                .requestMatchers("/api/bookings/**").authenticated()
                .requestMatchers("/api/waitlists/**").authenticated()
                .requestMatchers("/api/analytics/**").permitAll()
                .requestMatchers("/api/maintenance/**").authenticated()
                .requestMatchers("/api/admin/users/**").authenticated()
                .anyRequest().authenticated()
            )

            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}
