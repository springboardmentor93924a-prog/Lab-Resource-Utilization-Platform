import apiClient from "./client";

// GET /api/notifications - the JWT identifies the user, never pass a user id
export function getMyNotifications() {
  return apiClient.get("/api/notifications").then((res) => res.data);
}

// GET /api/notifications/unread-count -> Long
export function getUnreadCount() {
  return apiClient.get("/api/notifications/unread-count").then((res) => res.data);
}

// PUT /api/notifications/{id}/read - no body
export function markNotificationAsRead(notificationId) {
  return apiClient
    .put(`/api/notifications/${notificationId}/read`)
    .then((res) => res.data);
}

// POST /api/notifications/check-reminders - SYSTEM_ADMIN / INSTITUTION_ADMIN only
export function runReminderCheck() {
  return apiClient.post("/api/notifications/check-reminders").then((res) => res.data);
}
