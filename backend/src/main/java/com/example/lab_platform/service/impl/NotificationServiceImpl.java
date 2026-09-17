package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Notification;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.NotificationRepository;
import com.example.lab_platform.service.EmailService;
import com.example.lab_platform.service.NotificationService;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            SimpMessagingTemplate messagingTemplate,
            EmailService emailService) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
        this.emailService = emailService;
    }

    private User getLoggedInUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }

    @Override
    public Notification create(User user, String notificationType, String title, String message, Integer referenceId) {
        // EDGE CASE: no recipient — nothing to create or push
        if (user == null) {
            return null;
        }

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setNotificationType(notificationType);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setReferenceId(referenceId);
        notification.setIsRead(false);

        Notification saved = notificationRepository.save(notification);

        // Real-time push. EDGE CASE: if the user isn't connected right now,
        // this silently no-ops (no subscriber on that queue) — the row is
        // still saved, so getMyNotifications()/unread on next login/poll
        // still shows it. No exception should ever bubble up from a push
        // failure and break the actual notification-creation transaction.
        try {
            if (user.getEmail() != null) {
                messagingTemplate.convertAndSendToUser(
                        user.getEmail(), "/queue/notifications", saved
                );
            }
        } catch (Exception ignored) {
        }

        // Module 7 - Email notifications. Same best-effort treatment as
        // the WebSocket push above: EmailService.send() never throws, so
        // this can't break the caller's actual workflow (booking approval,
        // waitlist availability, maintenance alert, etc. already succeeded).
        // Covers every notification type in one place, since they're all
        // already funneled through this single create() method.
        emailService.send(user.getEmail(), title, message);

        return saved;
    }

    @Override
    public Notification createIfNotAlreadyNotifiedToday(
            User user, String notificationType, String title, String message, Integer referenceId) {

        // EDGE CASE: nothing to dedup against without a recipient or a referenceId
        if (user == null || referenceId == null) {
            return create(user, notificationType, title, message, referenceId);
        }

        boolean alreadyNotifiedToday = notificationRepository
                .existsByUser_UserIdAndNotificationTypeAndReferenceIdAndCreatedAtAfter(
                        user.getUserId(), notificationType, referenceId,
                        LocalDate.now().atStartOfDay()
                );

        if (alreadyNotifiedToday) {
            return null; // already reminded today — skip, no duplicate spam
        }

        return create(user, notificationType, title, message, referenceId);
    }

    @Override
    public List<Notification> getMyNotifications() {
        User loggedInUser = getLoggedInUser();
        return notificationRepository.findByUser_UserIdOrderByCreatedAtDesc(loggedInUser.getUserId());
    }

    @Override
    public List<Notification> getMyUnreadNotifications() {
        User loggedInUser = getLoggedInUser();
        return notificationRepository.findByUser_UserIdAndIsReadOrderByCreatedAtDesc(loggedInUser.getUserId(), false);
    }

    @Override
    public Notification markAsRead(Integer id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        User loggedInUser = getLoggedInUser();

        if (!notification.getUser().getUserId().equals(loggedInUser.getUserId())) {
            throw new RuntimeException("You can only mark your own notifications as read");
        }

        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }
}