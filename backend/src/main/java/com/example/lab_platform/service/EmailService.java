package com.example.lab_platform.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Module 7 - Email notifications, on a $0 setup: Gmail SMTP + a Google
 * "App Password". No Twilio/Firebase - those need a paid account or a
 * phone number, this doesn't.
 *
 * If spring.mail.username/password aren't set (e.g. a dev machine with
 * no SMTP creds configured yet), every send() call here just logs a
 * warning and returns - it never throws, so it can never break a
 * booking/waitlist/maintenance flow that happens to also want to email
 * someone. This mirrors how NotificationServiceImpl already treats the
 * WebSocket push as best-effort.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final boolean configured;
    private final String frontendBaseUrl;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${spring.mail.username:}") String fromAddress,
            @Value("${app.frontend-base-url}") String frontendBaseUrl) {

        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.frontendBaseUrl = frontendBaseUrl;
        this.configured = fromAddress != null && !fromAddress.isBlank();

        if (!configured) {
            log.warn("MAIL_USERNAME/MAIL_PASSWORD not set - EmailService will only log, "
                    + "not actually send email. See application.properties for setup notes.");
        }
    }

    /**
     * Fire-and-forget send. Never throws - a failed email must never
     * break the caller's actual workflow (booking, waitlist, password
     * reset token creation, etc. all already succeeded by this point).
     */
    public void send(String toEmail, String subject, String body) {

        if (toEmail == null || toEmail.isBlank()) {
            return;
        }

        if (!configured) {
            log.info("[email disabled] would send to {} | subject: {}", toEmail, subject);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

        } catch (MailException e) {
            // Best-effort only - log and move on.
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
}