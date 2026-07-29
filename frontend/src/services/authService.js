import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/auth";

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

export async function registerUser(payload) {
  const { data } = await api.post("/register", payload);
  return data;
}

export async function loginUser(payload) {
  const { data } = await api.post("/login", payload);
  return data;
}

export default api;