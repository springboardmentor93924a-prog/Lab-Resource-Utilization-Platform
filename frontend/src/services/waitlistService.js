import axios from "axios";

const API_BASE_URL = "https://lab-resource-utilization-platform-o09v.onrender.com/api/waitlist";

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

export async function joinWaitlist(payload) {
  const { data } = await api.post("", payload);
  return data;
}

export async function getMyWaitlistEntries() {
  const { data } = await api.get("/my");
  return data;
}

export default api;
