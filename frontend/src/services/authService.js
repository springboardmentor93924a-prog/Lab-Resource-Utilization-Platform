import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/auth";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ---------------- REGISTER ----------------
export async function registerUser(payload) {
  const { data } = await api.post("/register", payload);
  return data;
}

export async function googleRegisterUser(payload) {
  const { data } = await api.post("/google/register", payload);
  return data;
}

// ---------------- LOGIN ----------------
export async function loginUser(payload) {
  const { data } = await api.post("/login", payload);
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get("/me");
  return data;
}

// ---------------- FORGOT PASSWORD ----------------
export async function forgotPassword(email) {
  const { data } = await api.post("/forgot-password", { email });
  return data;
}

// ---------------- RESET PASSWORD ----------------
export async function resetPassword(token, newPassword) {
  const { data } = await api.post("/reset-password", {
    token,
    newPassword,
  });

  return data;
}

export default api;