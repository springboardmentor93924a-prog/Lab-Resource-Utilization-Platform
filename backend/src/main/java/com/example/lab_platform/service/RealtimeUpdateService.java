package com.example.lab_platform.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

/*
 * Public (non-per-user) real-time push, separate from
 * NotificationService (which pushes only to one specific user's
 * private queue). This broadcasts to /topic/equipment-updates, which
 * ANY connected, authenticated client can subscribe to (the existing
 * WebSocketConfig.registerStompEndpoints() already enables the
 * "/topic" broker prefix for exactly this).
 *
 * Deliberately a lightweight PING, not the equipment payload itself:
 * different roles/institutions see different equipment subsets (see
 * EquipmentServiceImpl / booking/department scoping throughout the
 * app), and duplicating that scoping logic here just to build a
 * broadcast payload would be a second place for it to drift out of
 * sync. Instead, connected clients just refetch GET /api/equipment
 * (already scoped correctly server-side) the moment they receive a
 * ping, which is instant over the existing connection and avoids
 * polling on a fixed interval.
 */
@Service
public class RealtimeUpdateService {

    private final SimpMessagingTemplate messagingTemplate;

    public RealtimeUpdateService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void pingEquipmentUpdated() {
    try {
        Map<String, Object> payload = Map.of(
                "type", "EQUIPMENT_UPDATED",
                "at", System.currentTimeMillis()
        );
        messagingTemplate.convertAndSend(
                "/topic/equipment-updates",
                (Object) payload   // <-- explicit cast breaks the overload tie
        );
    } catch (Exception ignored) {
        // Never let a push failure break the actual write that triggered it.
    }
}
}