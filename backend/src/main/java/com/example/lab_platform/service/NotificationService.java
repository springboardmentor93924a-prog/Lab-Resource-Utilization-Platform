package com.example.lab_platform.service;

import com.example.lab_platform.entity.Notification;
import com.example.lab_platform.entity.User;

import java.util.List;

public interface NotificationService {

    /*
     * Internal creation hook — called from other services (booking,
     * waitlist, equipment feedback) to raise a notification for a
     * user. Not exposed directly as a controller endpoint since the
     * caller always knows the recipient already.
     */
    Notification create(User user, String notificationType, String title, String message, Integer referenceId);

    List<Notification> getMyNotifications();

    List<Notification> getMyUnreadNotifications();

    Notification markAsRead(Integer id);

    // add to the interface
Notification createIfNotAlreadyNotifiedToday(
        User user, String notificationType, String title, String message, Integer referenceId);
}