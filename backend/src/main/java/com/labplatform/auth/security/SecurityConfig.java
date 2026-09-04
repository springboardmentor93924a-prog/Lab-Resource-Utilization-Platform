package com.labplatform.auth.security;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final GoogleOAuth2SuccessHandler googleOAuth2SuccessHandler;
    @Value("${FRONTEND_URL:http://localhost:5173}")
private String frontendUrl;

    public SecurityConfig(
        JwtAuthFilter jwtAuthFilter,
        GoogleOAuth2SuccessHandler googleOAuth2SuccessHandler
) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.googleOAuth2SuccessHandler = googleOAuth2SuccessHandler;
    }


    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(auth -> auth
        .requestMatchers("/", "/error").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/oauth2/**").permitAll()
                        .requestMatchers("/login/oauth2/**").permitAll()

                        .requestMatchers("/api/admin/**")
                        .hasAnyRole("INSTITUTION_ADMIN", "SYSTEM_ADMIN")

                        .requestMatchers(
                                org.springframework.http.HttpMethod.POST,
                                "/api/equipment/**"
                        )
                        .hasAnyRole(
                                "INSTITUTION_ADMIN",
                                "SYSTEM_ADMIN",
                                "LAB_MANAGER"
                        )

                        .requestMatchers(
                                org.springframework.http.HttpMethod.PUT,
                                "/api/equipment/**"
                        )
                        .hasAnyRole(
                                "INSTITUTION_ADMIN",
                                "SYSTEM_ADMIN",
                                "LAB_MANAGER"
                        )

                        .requestMatchers(
                                org.springframework.http.HttpMethod.DELETE,
                                "/api/equipment/**"
                        )
                        .hasAnyRole(
                                "INSTITUTION_ADMIN",
                                "SYSTEM_ADMIN",
                                "LAB_MANAGER"
                        )

                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/bookings")
                        .hasAnyRole("INSTITUTION_ADMIN", "SYSTEM_ADMIN","LAB_MANAGER", "DEPARTMENT_HEAD")

                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/bookings/**")
                        .hasAnyRole("INSTITUTION_ADMIN", "SYSTEM_ADMIN","LAB_MANAGER", "DEPARTMENT_HEAD")

                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/files/**")
                        .hasAnyRole("INSTITUTION_ADMIN", "SYSTEM_ADMIN","LAB_MANAGER", "DEPARTMENT_HEAD")

                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/files/**")
                        .hasAnyRole(
                                "STUDENT",
                                "RESEARCHER",
                                "LAB_TECHNICIAN",
                                "LAB_MANAGER",
                                "DEPARTMENT_HEAD",
                                "INSTITUTION_ADMIN",
                                "SYSTEM_ADMIN"
                        )
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/files/**")
                        .authenticated()

                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/bookings/**")
                        .hasAnyRole(
                                "STUDENT",
                                "RESEARCHER",
                                "INSTITUTION_ADMIN",
                                "SYSTEM_ADMIN",
                                "LAB_MANAGER",
                                "DEPARTMENT_HEAD"
                        )

                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/equipment/utilization")
                        .hasAnyRole(
                                "INSTITUTION_ADMIN",
                                "SYSTEM_ADMIN",
                                "LAB_MANAGER",
                                "DEPARTMENT_HEAD"
                        )

                        .requestMatchers(
                                org.springframework.http.HttpMethod.PUT,
                                "/api/access-requests/*/approve",
                                "/api/access-requests/*/reject"
                        )
                        .hasAnyRole(
                                "INSTITUTION_ADMIN",
                                "SYSTEM_ADMIN",
                                "LAB_MANAGER",
                                "DEPARTMENT_HEAD"
                        )
                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/api/bookings/reports/**"
                        )
                        .hasAnyRole(
                                "INSTITUTION_ADMIN",
                                "SYSTEM_ADMIN",
                                "LAB_MANAGER",
                                "DEPARTMENT_HEAD"
                        )
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(googleOAuth2SuccessHandler)
                        .failureHandler((request, response, exception) -> {

                            System.err.println("========================================");
                            System.err.println("GOOGLE OAUTH LOGIN FAILED");
                            System.err.println("Exception: " + exception.getClass().getName());
                            System.err.println("Message: " + exception.getMessage());

                            if (exception.getCause() != null) {
                                System.err.println("Cause: " + exception.getCause());
                            }

                            exception.printStackTrace();

                            System.err.println("========================================");

                            response.sendRedirect(
        frontendUrl + "/login?error=google"
);
                        })
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
        "http://localhost:5173",
        frontendUrl
));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
