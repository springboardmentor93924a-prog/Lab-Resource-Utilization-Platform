package com.infosys.labresource.notification.service;

import com.infosys.labresource.notification.Repository.NotificationRepository;
import com.infosys.labresource.notification.entity.Notification;
import com.infosys.labresource.notification.entity.NotificationResponseDTO;
import com.infosys.labresource.notification.entity.NotificationType;
import com.infosys.labresource.user.Repository.UserRepository;
import com.infosys.labresource.user.entites.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notifRepo;
    private final UserRepository userRepo;

    @Override
    public void send(UserEntity recipient, String message, NotificationType type) {

        // recipient can be null in a few edge cases (e.g. department with no head yet), just skip
        if (recipient == null) {
            return;
        }

        Notification notif = new Notification();

        notif.setRecipient(recipient);
        notif.setMessage(message);
        notif.setType(type);
        notif.setRead(false);
        notif.setCreatedAt(LocalDateTime.now());

        notifRepo.save(notif);
    }

    @Override
    public List<NotificationResponseDTO> getMyNotifications(String email) {

        UserEntity user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        List<Notification> notifList = notifRepo.findByRecipientOrderByCreatedAtDesc(user);

        List<NotificationResponseDTO> resList = new ArrayList<>();

        for (Notification notif : notifList) {
            resList.add(convertToDTO(notif));
        }

        return resList;
    }

    @Override
    public long getUnreadCount(String email) {

        UserEntity user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        return notifRepo.countByRecipientAndIsReadFalse(user);
    }

    @Override
    public void markAsRead(Long notificationId, String email) {

        Notification notif = notifRepo.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found."));

        // a user should only be able to mark their own notifications as read, not anyone else's
        if (!notif.getRecipient().getEmail().equals(email)) {
            throw new RuntimeException("This notification does not belong to you.");
        }

        notif.setRead(true);
        notifRepo.save(notif);
    }

    private NotificationResponseDTO convertToDTO(Notification notif) {

        NotificationResponseDTO dto = new NotificationResponseDTO();

        dto.setNotificationId(notif.getNotificationId());
        dto.setMessage(notif.getMessage());
        dto.setType(notif.getType());
        dto.setRead(notif.isRead());
        dto.setCreatedAt(notif.getCreatedAt());

        return dto;
    }
}