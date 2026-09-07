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
  return data;
}
export async function markRead(id) {
  const { data } = await api.put(`/${id}/read`);
  return data;
}
export async function markAllRead() {
  const { data } = await api.put("/read-all");
  return data;
}
export default api;
