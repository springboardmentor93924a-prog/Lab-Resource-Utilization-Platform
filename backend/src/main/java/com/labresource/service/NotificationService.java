package com.labresource.service;

import com.labresource.dto.NotificationResponseDto;
import com.labresource.enums.NotificationType;
import java.util.List;

public interface NotificationService {
    NotificationResponseDto createNotification(
            String userId, NotificationType type,
            String title, String message,
            String referenceType, String referenceId);

    List<NotificationResponseDto> getUserNotifications(String userId);
    List<NotificationResponseDto> getUnreadNotifications(String userId);
    long getUnreadCount(String userId);
    NotificationResponseDto markAsRead(String notificationId);
    void deleteNotification(String notificationId);
}
