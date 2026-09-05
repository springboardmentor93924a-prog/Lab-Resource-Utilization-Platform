////package com.labresource.config;
////
////import com.labresource.security.JwtAuthenticationFilter;
////import org.springframework.context.annotation.Bean;
////import org.springframework.context.annotation.Configuration;
////import org.springframework.security.authentication.AuthenticationProvider;
////import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
////import org.springframework.security.config.annotation.web.builders.HttpSecurity;
////import org.springframework.security.config.http.SessionCreationPolicy;
////import org.springframework.security.web.SecurityFilterChain;
////import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
////
////@Configuration
////@EnableMethodSecurity
////public class SecurityConfig {
////
////    private final JwtAuthenticationFilter jwtAuthenticationFilter;
////    private final AuthenticationProvider authenticationProvider;
////
////    public SecurityConfig(
////            JwtAuthenticationFilter jwtAuthenticationFilter,
////            AuthenticationProvider authenticationProvider
////    ) {
////        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
////        this.authenticationProvider = authenticationProvider;
////    }
////
////    @Bean
////    public SecurityFilterChain securityFilterChain(
////            HttpSecurity http
////    ) throws Exception {
////
////        http
////                .csrf(csrf -> csrf.disable())
////
////                .authorizeHttpRequests(auth -> auth
////
////                        // Public APIs
////                        .requestMatchers(
////                                "/api/auth/register",
////                                "/api/auth/login"
////                        ).permitAll()
////
////
////                        .requestMatchers(
////                                "/swagger-ui/**",
////                                "/v3/api-docs/**"
////                        ).permitAll()
////
////                        // All remaining APIs require JWT
////                        .anyRequest().authenticated()
////                )
////
////                .sessionManagement(session ->
////                        session.sessionCreationPolicy(
////                                SessionCreationPolicy.STATELESS
////                        )
////                )
////
////                .authenticationProvider(authenticationProvider)
////
////                .addFilterBefore(
////                        jwtAuthenticationFilter,
////                        UsernamePasswordAuthenticationFilter.class
////                );
////
////        return http.build();
////    }
////}
//package com.labresource.config;
//
//import com.labresource.security.JwtAuthenticationFilter;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.authentication.AuthenticationProvider;
//import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.CorsConfigurationSource;
//import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
//
//import java.util.List;
//
//@Configuration
//@EnableMethodSecurity
//public class SecurityConfig {
//
//    private final JwtAuthenticationFilter jwtAuthenticationFilter;
//    private final AuthenticationProvider authenticationProvider;
//
//    public SecurityConfig(
//            JwtAuthenticationFilter jwtAuthenticationFilter,
//            AuthenticationProvider authenticationProvider
//    ) {
//        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
//        this.authenticationProvider = authenticationProvider;
//    }
//
//    @Bean
//    public SecurityFilterChain securityFilterChain(
//            HttpSecurity http
//    ) throws Exception {
//
//        http
//                // Enable CORS
//                .cors(cors -> cors.configurationSource(
//                        corsConfigurationSource()
//                ))
//
//                // Disable CSRF because JWT is used
//                .csrf(csrf -> csrf.disable())
//
//                .authorizeHttpRequests(auth -> auth
//
//
//                        .requestMatchers(
//                                "/api/auth/register",
//                                "/api/auth/login"
//                        ).permitAll()
//
//
////                        .requestMatchers(
////                                "/swagger-ui/**",
////                                "/swagger-ui.html",
////                                "/v3/api-docs/**"
////                        ).permitAll()
//                                .requestMatchers(
//                                        org.springframework.http.HttpMethod.GET,
//                                        "/api/institutions",
//                                        "/api/institutions/**",
//                                        "/api/departments",
//                                        "/api/departments/**"
//                                ).permitAll()
//                        .requestMatchers(
//                                org.springframework.http.HttpMethod.OPTIONS,
//                                "/**"
//
//                        ).permitAll()
//
//                        // All other APIs require JWT
//                        .anyRequest().authenticated()
//                )
//
//
//                .sessionManagement(session ->
//                        session.sessionCreationPolicy(
//                                SessionCreationPolicy.STATELESS
//                        )
//                )
//
//                .authenticationProvider(authenticationProvider)
//
//
//                .addFilterBefore(
//                        jwtAuthenticationFilter,
//                        UsernamePasswordAuthenticationFilter.class
//                );
//
//        return http.build();
//    }
//
//    @Bean
//    public CorsConfigurationSource corsConfigurationSource() {
//
//        CorsConfiguration configuration =
//                new CorsConfiguration();
//
//        // React Vite frontend URL
//        configuration.setAllowedOrigins(
//                List.of("http://localhost:5173")
//        );
//
//        configuration.setAllowedMethods(
//                List.of(
//                        "GET",
//                        "POST",
//                        "PUT",
//                        "PATCH",
//                        "DELETE",
//                        "OPTIONS"
//                )
//        );
//
//        configuration.setAllowedHeaders(
//                List.of("*")
//        );
//
//        configuration.setExposedHeaders(
//                List.of("Authorization")
//        );
//
//        configuration.setAllowCredentials(true);
//
//        UrlBasedCorsConfigurationSource source =
//                new UrlBasedCorsConfigurationSource();
//
//        source.registerCorsConfiguration(
//                "/**",
//                configuration
//        );
//
//        return source;
//    }
//}





























package com.labresource.config;

import com.labresource.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
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
    private final AuthenticationProvider authenticationProvider;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            AuthenticationProvider authenticationProvider
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.authenticationProvider = authenticationProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .cors(cors -> cors.configurationSource(
                        corsConfigurationSource()
                ))

                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login"
                        ).permitAll()

                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/institutions",
                                "/api/institutions/**",
                                "/api/departments",
                                "/api/departments/**"
                        ).permitAll()

                        .requestMatchers(
                                "/api/realtime/equipment-status"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        .anyRequest().authenticated()
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authenticationProvider(authenticationProvider)

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:5173","https://lab-resource-utilization-platform-obc7.onrender.com")
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setExposedHeaders(
                List.of("Authorization")
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
}