import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/notifications";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getMyNotifications() {
  const { data } = await api.get("/my");
  return data;
}

export async function getUnreadCount() {
  const { data } = await api.get("/unread-count");
  return data.unreadCount;
}

export async function markAsRead(id) {
  await api.put(`/${id}/read`);
}

export default api;