import axios from "axios";
const API_BASE_URL = "https://lab-resource-utilization-platform-o09v.onrender.com/api/cost";
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
export async function getCostSummary() {
  const { data } = await api.get("/summary");
  return data;
}
export async function getBookingsWithCost() {
  const { data } = await api.get("/bookings");
  return data;
}
export async function getMonthlyReport() {
  const { data } = await api.get("/monthly-report");
  return data;
}
export default api;
