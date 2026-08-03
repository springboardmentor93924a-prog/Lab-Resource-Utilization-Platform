package com.labplatform.service;

import com.labplatform.entity.Notification;
import com.labplatform.entity.User;
import com.labplatform.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    @Value("${app.notifications.email-enabled:true}")
    private boolean emailEnabled;

    @Value("${app.notifications.sms-enabled:false}")
    private boolean smsEnabled;

    @Value("${app.notifications.push-enabled:false}")
    private boolean pushEnabled;

    /** Creates an in-app notification and fans it out to email (and SMS/push once configured). */
    public Notification notify(User user, String title, String message, String type) {
        Notification notification = Notification.builder()
                .user(user).title(title).message(message).type(type).build();
        notificationRepository.save(notification);

        if (emailEnabled && user.getEmail() != null) {
            sendEmailSafely(user.getEmail(), title, message);
        }
        if (smsEnabled) {
            sendSms(user.getPhone(), message); // stub — wire up Twilio credentials to activate
        }
        if (pushEnabled) {
            sendPush(user, title, message); // stub — wire up Firebase credentials to activate
        }
        return notification;
    }

    private void sendEmailSafely(String to, String subject, String body) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(to);
            mail.setSubject(subject);
            mail.setText(body);
            mailSender.send(mail);
        } catch (Exception e) {
            // Do not fail the whole request just because SMTP isn't configured yet
            System.err.println("Email send failed (check MAIL_USERNAME/MAIL_PASSWORD): " + e.getMessage());
        }
    }

    private void sendSms(String phone, String message) {
        // TODO: integrate Twilio SDK here once ACCOUNT_SID / AUTH_TOKEN / FROM_NUMBER are set
    }

    private void sendPush(User user, String title, String message) {
        // TODO: integrate Firebase Admin SDK here once service-account JSON is set
    }

    public List<Notification> forUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> unreadForUser(Long userId) {
        return notificationRepository.findByUserIdAndReadFalse(userId);
    }

    public void markRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}
