package com.labplatform.controller;

import com.labplatform.dto.ApiResponse;
import com.labplatform.entity.Notification;
import com.labplatform.entity.User;
import com.labplatform.service.NotificationService;
import com.labplatform.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> mine() {
        User user = SecurityUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(notificationService.forUser(user.getId())));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<Notification>>> unread() {
        User user = SecurityUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(notificationService.unreadForUser(user.getId())));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return ResponseEntity.ok(ApiResponse.ok("Marked as read", null));
    }
}
