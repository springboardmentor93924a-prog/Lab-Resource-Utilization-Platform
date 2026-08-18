package com.labplatform.notification.controller;

import com.labplatform.notification.dto.NotificationResponse;
import com.labplatform.notification.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }


    // =========================================================
    // GET MY NOTIFICATIONS
    // =========================================================

    @GetMapping("/my")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            Authentication authentication) {

        return ResponseEntity.ok(
                notificationService.getMyNotifications(
                        authentication.getName()
                )
        );
    }


    // =========================================================
    // GET UNREAD COUNT
    // =========================================================

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            Authentication authentication) {

        return ResponseEntity.ok(
                notificationService.getUnreadCount(
                        authentication.getName()
                )
        );
    }


    // =========================================================
    // MARK NOTIFICATION AS READ
    // =========================================================

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Integer id,
            Authentication authentication) {

        notificationService.markAsRead(
                id,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }


    // =========================================================
    // DELETE ONE NOTIFICATION
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Integer id,
            Authentication authentication) {

        notificationService.deleteNotification(
                id,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }


    // =========================================================
    // DELETE ALL READ NOTIFICATIONS
    // =========================================================

    @DeleteMapping("/read")
    public ResponseEntity<Void> deleteReadNotifications(
            Authentication authentication) {

        notificationService.deleteReadNotifications(
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }
}