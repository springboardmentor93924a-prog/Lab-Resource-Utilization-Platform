package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Notification;
import com.example.demo.entity.User;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.UserRepository;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired private NotificationRepository notificationRepository;
    @Autowired private UserRepository userRepository;

    @GetMapping("/my")
    public List<Map<String, Object>> myNotifications(java.security.Principal principal) {
        User me = userRepository.findByEmail(principal.getName()).orElse(null);
        if (me == null) return List.of();
        return notificationRepository.findByUser_UserIdOrderByCreatedAtDesc(me.getUserId())
                .stream().map(this::toResponse).collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/unread-count")
    public Map<String, Object> unreadCount(java.security.Principal principal) {
        User me = userRepository.findByEmail(principal.getName()).orElse(null);
        long count = me != null ? notificationRepository.countByUser_UserIdAndIsReadFalse(me.getUserId()) : 0;
        return Map.of("count", count);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Integer id) {
        Notification n = notificationRepository.findById(id).orElse(null);
        if (n == null) return ResponseEntity.status(404).body(Map.of("error", "Notification not found"));
        n.setIsRead(true);
        notificationRepository.save(n);
        return ResponseEntity.ok(toResponse(n));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllRead(java.security.Principal principal) {
        User me = userRepository.findByEmail(principal.getName()).orElse(null);
        if (me == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        List<Notification> mine = notificationRepository.findByUser_UserIdOrderByCreatedAtDesc(me.getUserId());
        mine.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(mine);
        return ResponseEntity.ok(Map.of("message", "All marked read"));
    }

    private Map<String, Object> toResponse(Notification n) {
        Map<String, Object> m = new java.util.LinkedHashMap<>();
        m.put("id", n.getNotificationId());
        m.put("message", n.getMessage());
        m.put("isRead", n.getIsRead());
        m.put("createdAt", n.getCreatedAt());
        return m;
    }
}
