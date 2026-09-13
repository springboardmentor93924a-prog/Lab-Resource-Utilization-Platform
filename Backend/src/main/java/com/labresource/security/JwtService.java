
package com.labresource.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    // =========================================================
    // JWT SECRET KEY
    // =========================================================

    private static final String SECRET =
            "LabResourcePlatformSecretKeyForJWT2026VerySecureKey";

    // =========================================================
    // TOKEN EXPIRATION
    // 24 HOURS
    // =========================================================

    private static final long EXPIRATION_TIME =
            1000L * 60 * 60 * 24;

    private final SecretKey key =
            Keys.hmacShaKeyFor(
                    SECRET.getBytes(StandardCharsets.UTF_8)
            );

    // =========================================================
    // GENERATE JWT TOKEN
    // =========================================================

    public String generateToken(
            String email,
            String role) {

        return Jwts.builder()

                // User email
                .subject(email)

                // User role
                .claim("role", role)

                // Token creation time
                .issuedAt(new Date())

                // Token expiration
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + EXPIRATION_TIME
                        )
                )

                // Sign token
                .signWith(key)

                .compact();
    }

    // =========================================================
    // EXTRACT EMAIL
    // =========================================================

    public String extractEmail(String token) {

        return extractClaims(token)
                .getSubject();
    }

    // =========================================================
    // EXTRACT ROLE
    // =========================================================

    public String extractRole(String token) {

        Claims claims =
                extractClaims(token);

        return claims.get("role", String.class);
    }

    // =========================================================
    // CHECK TOKEN VALIDITY
    // =========================================================

    public boolean isTokenValid(String token) {

        try {

            Claims claims =
                    extractClaims(token);

            Date expiration =
                    claims.getExpiration();

            return expiration != null
                    && expiration.after(
                            new Date()
                    );

        } catch (Exception e) {

            return false;
        }
    }

    // =========================================================
    // EXTRACT ALL CLAIMS
    // =========================================================

    private Claims extractClaims(String token) {

        return Jwts.parser()

                .verifyWith(key)

                .build()

                .parseSignedClaims(token)

                .getPayload();
    }
}
