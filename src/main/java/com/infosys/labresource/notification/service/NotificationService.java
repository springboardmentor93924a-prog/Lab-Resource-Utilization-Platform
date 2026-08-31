package com.infosys.labresource.notification.service;

import com.infosys.labresource.notification.entity.NotificationResponseDTO;
import com.infosys.labresource.notification.entity.NotificationType;
import com.infosys.labresource.user.entites.UserEntity;

import java.util.List;

public interface NotificationService {

    // used internally by other services (booking, sharing, waitlist, calibration etc)
    void send(UserEntity recipient, String message, NotificationType type);

    List<NotificationResponseDTO> getMyNotifications(String email);

    long getUnreadCount(String email);

    void markAsRead(Long notificationId, String email);
}
