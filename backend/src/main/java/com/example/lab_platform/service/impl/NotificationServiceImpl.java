package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Notification;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.NotificationRepository;
import com.example.lab_platform.service.NotificationService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    private User getLoggedInUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }

    @Override
    public Notification create(User user, String notificationType, String title, String message, Integer referenceId) {
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

        return notificationRepository.save(notification);
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