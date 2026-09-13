
package com.labresource.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService) {

        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader =
                request.getHeader("Authorization");

        // ---------------------------------------------------------
        // No JWT supplied
        // ---------------------------------------------------------

        if (authHeader == null
                || !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        String token =
                authHeader.substring(7);

        try {

            // -----------------------------------------------------
            // Check token first
            // -----------------------------------------------------

            if (!jwtService.isTokenValid(token)) {

                filterChain.doFilter(request, response);
                return;
            }

            // -----------------------------------------------------
            // Extract email
            // -----------------------------------------------------

            String email =
                    jwtService.extractEmail(token);

            if (email == null
                    || email.isBlank()) {

                filterChain.doFilter(request, response);
                return;
            }

            // -----------------------------------------------------
            // Don't replace existing authentication
            // -----------------------------------------------------

            if (SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {

                // -------------------------------------------------
                // Load user from database
                // -------------------------------------------------

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(email);

                // -------------------------------------------------
                // Create authenticated user
                // -------------------------------------------------

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                // -------------------------------------------------
                // Store authentication
                // -------------------------------------------------

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(
                                authentication
                        );
            }

        } catch (Exception e) {

            // Invalid JWT should not crash the request.
            // The request will continue without authentication.

            SecurityContextHolder
                    .clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
