import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/analytics`;

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

export async function getMyAnalytics() {
  const { data } = await api.get("/me");
  return data;
}

export default api;