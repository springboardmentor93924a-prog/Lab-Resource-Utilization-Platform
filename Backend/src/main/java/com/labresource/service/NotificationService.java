package com.labresource.service;

import com.labresource.entity.Notification;
import com.labresource.entity.NotificationType;
import com.labresource.entity.User;
import com.labresource.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<Notification> getAllNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public Notification createNotification(
            User user,
            NotificationType type,
            String title,
            String message,
            Long referenceId,
            String referenceType
    ) {

        Notification notification = new Notification();

        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setReferenceId(referenceId);
        notification.setReferenceType(referenceType);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    @Transactional
    public Notification markAsRead(Long notificationId) {

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() ->
                        new RuntimeException("Notification not found with id: " + notificationId)
                );

        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    @Transactional
    public int markAllAsRead(Long userId) {

        List<Notification> notifications =
                notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);

        LocalDateTime now = LocalDateTime.now();

        for (Notification notification : notifications) {
            notification.setRead(true);
            notification.setReadAt(now);
        }

        notificationRepository.saveAll(notifications);

        return notifications.size();
    }

    public void deleteNotification(Long notificationId) {

        if (!notificationRepository.existsById(notificationId)) {
            throw new RuntimeException(
                    "Notification not found with id: " + notificationId
            );
        }

        notificationRepository.deleteById(notificationId);
    }
}