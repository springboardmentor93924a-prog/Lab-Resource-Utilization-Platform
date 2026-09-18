import axios from "axios";

// Base URL always comes from the env var - never hardcode localhost here.
// See .env.example. Vite only exposes vars prefixed with VITE_.
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT (if we have one) to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized 401 handling: if the token is invalid/expired, boot the user
// back to the login screen instead of leaving them staring at broken pages.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Full reload so every bit of in-memory state (AuthContext, etc.) resets.
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

// Small helper so every api/*.js file can surface a readable error message
// instead of callers having to dig through error.response.data every time.
export function extractErrorMessage(error, fallback = "Something went wrong.") {
  if (error?.response?.data) {
    const data = error.response.data;
    if (typeof data === "string") return data;
    if (data.message) return data.message;
    if (data.error) return data.error;
  }
  if (error?.message) return error.message;
  return fallback;
}

export default apiClient;
