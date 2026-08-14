import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

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

export async function getCurrentUserInfo() {
  const { data } = await axios.get("http://localhost:8080/auth/me", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return data;
}

export async function createAccessRequest(payload) {
  const { data } = await api.post("/access-requests", payload);
  return data;
}

export async function getMyAccessRequests() {
  const { data } = await api.get("/access-requests/my");
  return data;
}

export async function getPendingAccessRequests() {
  const { data } = await api.get("/access-requests/pending");
  return data;
}

export async function approveAccessRequest(id) {
  const { data } = await api.put(`/access-requests/${id}/approve`);
  return data;
}

export async function rejectAccessRequest(id) {
  const { data } = await api.put(`/access-requests/${id}/reject`);
  return data;
}

export default api;