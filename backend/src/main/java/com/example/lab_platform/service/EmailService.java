package com.example.lab_platform.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Email for the WHOLE project. Every notification (bookings, waitlist,
 * maintenance, registration approvals...) and the password-reset mail
 * already funnel through send(), so changing how send() delivers mail
 * fixes email everywhere at once.
 *
 * Delivery, in order of preference:
 *   1. BREVO_API_KEY set -> Brevo's HTTPS API (port 443). Works on
 *      Render's free plan, which blocks outbound SMTP ports 25/465/587.
 *   2. MAIL_USERNAME/MAIL_PASSWORD set -> Gmail SMTP (works locally or on
 *      a paid Render instance).
 *   3. Neither set -> the email is only logged; the app keeps running.
 *
 * send() never throws - a failed email must never break the booking /
 * approval / password-reset flow that triggered it.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private static final String BREVO_URL = "https://api.brevo.com/v3/smtp/email";

    private final JavaMailSender mailSender;
    private final String smtpUsername;
    private final String frontendBaseUrl;
    private final String brevoApiKey;
    private final String fromAddress;
    private final String fromName;

    private final boolean smtpConfigured;
    private final boolean brevoConfigured;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public EmailService(
            JavaMailSender mailSender,
            @Value("${spring.mail.username:}") String smtpUsername,
            @Value("${app.frontend-base-url}") String frontendBaseUrl,
            @Value("${app.mail.brevo-api-key:}") String brevoApiKey,
            @Value("${app.mail.from:}") String mailFrom,
            @Value("${app.mail.from-name:Lab Resource Utilization Platform}") String fromName) {

        this.mailSender = mailSender;
        this.smtpUsername = smtpUsername;
        this.frontendBaseUrl = frontendBaseUrl;
        this.brevoApiKey = brevoApiKey;
        this.fromName = fromName;

        this.smtpConfigured = smtpUsername != null && !smtpUsername.isBlank();
        this.brevoConfigured = brevoApiKey != null && !brevoApiKey.isBlank();

        // Sender address: MAIL_FROM if given, otherwise the Gmail login.
        this.fromAddress = (mailFrom != null && !mailFrom.isBlank()) ? mailFrom : smtpUsername;

        if (brevoConfigured && (fromAddress == null || fromAddress.isBlank())) {
            log.warn("BREVO_API_KEY is set but MAIL_FROM is not - Brevo needs a verified "
                    + "sender address, so emails will not be sent until MAIL_FROM is set.");
        }

        if (!brevoConfigured && !smtpConfigured) {
            log.warn("No email provider configured (BREVO_API_KEY / MAIL_USERNAME not set) - "
                    + "EmailService will only log, not actually send email.");
        } else if (brevoConfigured) {
            log.info("EmailService: sending through Brevo HTTPS API.");
        } else {
            log.info("EmailService: sending through SMTP ({}).", smtpUsername);
        }
    }

    /**
     * Fire-and-forget send. Never throws.
     */
    public void send(String toEmail, String subject, String body) {

        if (toEmail == null || toEmail.isBlank()) {
            return;
        }

        if (brevoConfigured) {
            sendViaBrevo(toEmail, subject, body);
            return;
        }

        if (smtpConfigured) {
            sendViaSmtp(toEmail, subject, body);
            return;
        }

        log.info("[email disabled] would send to {} | subject: {}", toEmail, subject);
    }

    private void sendViaBrevo(String toEmail, String subject, String body) {

        if (fromAddress == null || fromAddress.isBlank()) {
            log.warn("[email not sent] MAIL_FROM missing | to {} | subject: {}", toEmail, subject);
            return;
        }

        try {
            String json = objectMapper.writeValueAsString(Map.of(
                    "sender", Map.of("name", fromName, "email", fromAddress),
                    "to", List.of(Map.of("email", toEmail)),
                    "subject", subject == null ? "" : subject,
                    "textContent", body == null ? "" : body
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BREVO_URL))
                    .timeout(Duration.ofSeconds(15))
                    .header("accept", "application/json")
                    .header("content-type", "application/json")
                    .header("api-key", brevoApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            // Async so a slow mail provider never slows down the user's request.
            httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenAccept(response -> {
                        if (response.statusCode() / 100 != 2) {
                            log.warn("Brevo rejected email to {} (HTTP {}): {}",
                                    toEmail, response.statusCode(), response.body());
                        }
                    })
                    .exceptionally(ex -> {
                        log.warn("Failed to send email to {}: {}", toEmail, ex.getMessage());
                        return null;
                    });

        } catch (Exception e) {
            log.warn("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }

    private void sendViaSmtp(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

        } catch (MailException e) {
            log.warn("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendPasswordResetEmail(String toEmail, String token) {

        String resetLink = frontendBaseUrl + "/reset-password?token=" + token;

        String body = "We received a request to reset your Lab Resource Utilization "
                + "Platform password.\n\n"
                + "Reset your password using the link below (valid for 30 minutes):\n"
                + resetLink + "\n\n"
                + "If you didn't request this, you can safely ignore this email - "
                + "your password won't be changed.";

        send(toEmail, "Reset your password", body);
    }

    // ---------------------------------------------------------------
    // Registration approval emails
    // ---------------------------------------------------------------

    public void sendRegistrationSubmitted(String toEmail, String fullName, String approverLabel) {

        String body = "Hi " + fullName + ",\n\n"
                + "We received your registration for the Lab Resource Utilization Platform.\n\n"
                + "Your account is waiting for approval by " + approverLabel + ". "
                + "You cannot log in until it is approved - we'll email you as soon as "
                + "a decision is made.\n\n"
                + "If you didn't register, you can ignore this email.";

        send(toEmail, "Registration received - waiting for approval", body);
    }

    public void sendRegistrationApproved(String toEmail, String fullName) {

        String body = "Hi " + fullName + ",\n\n"
                + "Good news - your registration has been approved. "
                + "You can now log in:\n"
                + frontendBaseUrl + "\n";

        send(toEmail, "Your registration was approved", body);
    }

    public void sendRegistrationRejected(String toEmail, String fullName, String reason) {

        String body = "Hi " + fullName + ",\n\n"
                + "Your registration request was not approved.\n\n"
                + "Reason: " + (reason == null || reason.isBlank() ? "not specified" : reason) + "\n\n"
                + "If this was a mistake, you can register again with the correct details:\n"
                + frontendBaseUrl + "/register\n";

        send(toEmail, "Your registration was not approved", body);
    }
}