package com.labresource.service.impl;

import com.labresource.dto.NotificationResponseDto;
import com.labresource.entity.Notification;
import com.labresource.entity.User;
import com.labresource.enums.NotificationStatus;
import com.labresource.enums.NotificationType;
import com.labresource.repository.NotificationRepository;
import com.labresource.repository.UserRepository;
import com.labresource.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public NotificationResponseDto createNotification(
            String userId, NotificationType type,
            String title, String message,
            String referenceType, String referenceId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification n = new Notification();
        n.setUser(user);
        n.setType(type);
        n.setStatus(NotificationStatus.UNREAD);
        n.setTitle(title);
        n.setMessage(message);
        n.setReferenceType(referenceType);
        n.setReferenceId(referenceId);

        return mapToResponse(notificationRepository.save(n));
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getUserNotifications(String userId) {
        User user = getUser(userId);
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getUnreadNotifications(String userId) {
        User user = getUser(userId);
        return notificationRepository
                .findByUserAndStatusOrderByCreatedAtDesc(
                        user, NotificationStatus.UNREAD)
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserAndStatus(
                getUser(userId), NotificationStatus.UNREAD);
    }

    @Override
    public NotificationResponseDto markAsRead(String notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setStatus(NotificationStatus.READ);
        n.setReadAt(LocalDateTime.now());
        return mapToResponse(notificationRepository.save(n));
    }

    @Override
    public void deleteNotification(String notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notificationRepository.delete(n);
    }

    private User getUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private NotificationResponseDto mapToResponse(Notification n) {
        NotificationResponseDto r = new NotificationResponseDto();
        r.setId(n.getId());
        if (n.getUser() != null) r.setUserId(n.getUser().getId());
        r.setType(n.getType());
        r.setStatus(n.getStatus());
        r.setTitle(n.getTitle());
        r.setMessage(n.getMessage());
        r.setReferenceType(n.getReferenceType());
        r.setReferenceId(n.getReferenceId());
        r.setCreatedAt(n.getCreatedAt());
        r.setReadAt(n.getReadAt());
        return r;
    }
}
