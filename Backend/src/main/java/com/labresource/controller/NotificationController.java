package com.labresource.controller;

import com.labresource.entity.Notification;
import com.labresource.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotifications(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(
                notificationService.getAllNotifications(userId)
        );
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(userId)
        );
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(
                notificationService.getUnreadCount(userId)
        );
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                notificationService.markAsRead(id)
        );
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<String> markAllAsRead(
            @PathVariable Long userId
    ) {

        int count = notificationService.markAllAsRead(userId);

        return ResponseEntity.ok(
                count + " notification(s) marked as read"
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNotification(
            @PathVariable Long id
    ) {

        notificationService.deleteNotification(id);

        return ResponseEntity.ok(
                "Notification deleted successfully"
        );
    }
}