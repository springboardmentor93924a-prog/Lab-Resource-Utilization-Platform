import axios from "axios";

const API_BASE_URL =
  `${import.meta.env.VITE_API_URL}/api/notifications`;
const api = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },
});


// =========================================================
// AUTHENTICATION
// =========================================================

api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`;
  }

  return config;
});


// =========================================================
// GET MY NOTIFICATIONS
// =========================================================

export async function getMyNotifications() {

  const { data } =
    await api.get("/my");

  return data;
}


// =========================================================
// GET UNREAD COUNT
// =========================================================

export async function getUnreadCount() {

  const { data } =
    await api.get("/unread-count");

  return data.unreadCount;
}


// =========================================================
// MARK AS READ
// =========================================================

export async function markAsRead(id) {

  await api.put(`/${id}/read`);
}


// =========================================================
// DELETE ONE NOTIFICATION
// =========================================================

export async function deleteNotification(id) {

  await api.delete(`/${id}`);
}


// =========================================================
// DELETE ALL READ NOTIFICATIONS
// =========================================================

export async function deleteReadNotifications() {

  await api.delete("/read");
}


// =========================================================
// DEFAULT API
// =========================================================

export default api;