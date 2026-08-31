package com.infosys.labresource.notification.Controller;

import com.infosys.labresource.notification.ReminderScheduler;
import com.infosys.labresource.notification.entity.NotificationResponseDTO;
import com.infosys.labresource.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notifService;
    private final ReminderScheduler reminderScheduler;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationResponseDTO>> getMyNotifications(Authentication auth) {
        return ResponseEntity.ok(notifService.getMyNotifications(auth.getName()));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> getUnreadCount(Authentication auth) {
        return ResponseEntity.ok(notifService.getUnreadCount(auth.getName()));
    }

    @PutMapping("/{notificationId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> markAsRead(@PathVariable Long notificationId, Authentication auth) {

        notifService.markAsRead(notificationId, auth.getName());

        return ResponseEntity.ok("Notification marked as read.");
    }

    // lets you trigger the calibration/maintenance due check right now instead of
    // waiting for the daily cron, mainly useful for demo/testing purposes
    @PostMapping("/check-reminders")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN')")
    public ResponseEntity<String> checkReminders() {

        reminderScheduler.runChecks();

        return ResponseEntity.ok("Reminder check completed.");
    }
}