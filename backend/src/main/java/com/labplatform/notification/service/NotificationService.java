package com.labplatform.notification.service;

import com.labplatform.auth.model.User;
import com.labplatform.auth.repository.UserRepository;
import com.labplatform.notification.dto.NotificationResponse;
import com.labplatform.notification.model.Notification;
import com.labplatform.notification.repository.NotificationRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;


    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository) {

        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }


    // =========================================================
    // CREATE NOTIFICATION
    // =========================================================

    public void create(
            User user,
            String type,
            String message) {

        Notification n = new Notification();

        n.setUser(user);
        n.setType(type);
        n.setMessage(message);

        notificationRepository.save(n);
    }


    // =========================================================
    // CREATE FOR USER ID
    // =========================================================

    public void createForUserId(
            UUID userId,
            String type,
            String message) {

        userRepository.findById(userId)
                .ifPresent(u ->
                        create(u, type, message)
                );
    }


    // =========================================================
    // CREATE FOR MANAGEMENT ROLES
    // =========================================================

    public void createForManagementRoles(
            String type,
            String message) {

        List<User> users = userRepository.findAll();

        for (User user : users) {

            if (user.getRole() == null ||
                    user.getRole().getName() == null) {

                continue;
            }

            String role = user.getRole().getName();

            if (role.equals("LAB_MANAGER")
                    || role.equals("DEPARTMENT_HEAD")
                    || role.equals("INSTITUTION_ADMIN")) {

                boolean alreadyExists =
                        notificationRepository
                                .existsByUserIdAndTypeAndMessage(
                                        user.getId(),
                                        type,
                                        message
                                );

                if (!alreadyExists) {

                    create(
                            user,
                            type,
                            message
                    );
                }
            }
        }
    }


    // =========================================================
    // GET MY NOTIFICATIONS
    // =========================================================

    public List<NotificationResponse> getMyNotifications(
            String email) {

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "User not found"
                                )
                        );

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(
                        user.getId()
                )
                .stream()
                .map(NotificationResponse::new)
                .collect(Collectors.toList());
    }


    // =========================================================
    // GET UNREAD COUNT
    // =========================================================

    public Map<String, Long> getUnreadCount(
            String email) {

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "User not found"
                                )
                        );

        long count =
                notificationRepository
                        .countByUserIdAndIsReadFalse(
                                user.getId()
                        );

        return Map.of(
                "unreadCount",
                count
        );
    }


    // =========================================================
    // MARK AS READ
    // =========================================================

    public void markAsRead(
            Integer id,
            String email) {

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "User not found"
                                )
                        );

        Notification notification =
                notificationRepository.findById(id)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Notification not found"
                                )
                        );


        // SECURITY CHECK
        if (!notification.getUser().getId()
                .equals(user.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Not your notification"
            );
        }


        notification.setIsRead(true);

        notificationRepository.save(notification);
    }


    // =========================================================
    // DELETE ONE NOTIFICATION
    // =========================================================

    public void deleteNotification(
            Integer id,
            String email) {

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "User not found"
                                )
                        );


        Notification notification =
                notificationRepository.findById(id)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Notification not found"
                                )
                        );


        // =====================================================
        // SECURITY CHECK
        // User can ONLY delete their own notification
        // =====================================================

        if (!notification.getUser().getId()
                .equals(user.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Not your notification"
            );
        }


        notificationRepository.delete(notification);
    }


    // =========================================================
    // DELETE ALL READ NOTIFICATIONS
    // =========================================================

    public void deleteReadNotifications(
            String email) {

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "User not found"
                                )
                        );


        List<Notification> notifications =
                notificationRepository
                        .findByUserIdOrderByCreatedAtDesc(
                                user.getId()
                        );


        // Keep only unread notifications
        List<Notification> readNotifications =
                notifications.stream()
                        .filter(Notification::getIsRead)
                        .collect(Collectors.toList());


        // Delete only this user's read notifications
        notificationRepository.deleteAll(
                readNotifications
        );
    }
}