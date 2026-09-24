package com.example.lab_platform.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * Checks a "Sign in with Google" ID token and returns the verified email.
 *
 * The browser gets the token from Google (free, no secret needed); this
 * class asks Google whether the token is genuine, was issued for OUR app
 * (audience = our client id) and belongs to a verified email address.
 *
 * Google Sign-In only proves WHO the person is. It never creates an
 * account or grants a role - the account still has to exist and be
 * approved (see UserService.loginWithGoogleEmail).
 */
@Service
public class GoogleTokenVerifier {

    private static final String TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";

    private final String clientId;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GoogleTokenVerifier(@Value("${app.google.client-id:}") String clientId) {
        this.clientId = clientId == null ? "" : clientId.trim();
    }

    public String verifyAndGetEmail(String idToken) {

        if (clientId.isEmpty()) {
            throw new RuntimeException("Google sign-in is not set up on the server.");
        }

        if (idToken == null || idToken.isBlank()) {
            throw new RuntimeException("Google sign-in failed: missing token.");
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(TOKENINFO_URL + URLEncoder.encode(idToken, StandardCharsets.UTF_8)))
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();

            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException("Google sign-in failed: invalid or expired token.");
            }

            JsonNode token = objectMapper.readTree(response.body());

            // Must have been issued for THIS app, not some other website's.
            if (!clientId.equals(token.path("aud").asText())) {
                throw new RuntimeException("Google sign-in failed: token was not issued for this app.");
            }

            String issuer = token.path("iss").asText();
            if (!"accounts.google.com".equals(issuer) && !"https://accounts.google.com".equals(issuer)) {
                throw new RuntimeException("Google sign-in failed: unexpected token issuer.");
            }

            if (token.path("exp").asLong(0) < System.currentTimeMillis() / 1000) {
                throw new RuntimeException("Google sign-in failed: token expired.");
            }

            if (!"true".equalsIgnoreCase(token.path("email_verified").asText())) {
                throw new RuntimeException("Your Google email address is not verified.");
            }

            String email = token.path("email").asText("").trim().toLowerCase();

            if (email.isEmpty()) {
                throw new RuntimeException("Google sign-in failed: no email in token.");
            }

            return email;

        } catch (RuntimeException e) {
            throw e;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Google sign-in was interrupted. Please try again.");
        } catch (Exception e) {
            throw new RuntimeException("Could not reach Google to verify your sign-in. Please try again.");
        }
    }
}