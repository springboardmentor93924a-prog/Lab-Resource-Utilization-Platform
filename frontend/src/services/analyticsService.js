import axios from "axios";
const API_BASE_URL = "http://localhost:8080/api/analytics";
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
export async function getAnalyticsSummary() {
  const { data } = await api.get("/summary");
  return data;
}
export default api;
