import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/bookings";

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

export async function createBooking(payload) {
  const { data } = await api.post("", payload);
  return data;
}

export async function getAllBookings() {
  const { data } = await api.get("");
  return data;
}

export async function getBookingsByUser(userId) {
  const { data } = await api.get(`/user/${userId}`);
  return data;
}

export async function getBookingsByEquipment(equipmentId) {
  const { data } = await api.get(`/equipment/${equipmentId}`);
  return data;
}

export async function cancelBooking(id) {
  const { data } = await api.put(`/${id}/cancel`);
  return data;
}

export async function approveBooking(id) {
  const { data } = await api.put(`/${id}/approve`);
  return data;
}

export async function rejectBooking(id) {
  const { data } = await api.put(`/${id}/reject`);
  return data;
}

// =========================================================
// DEPARTMENT / RESOURCE USAGE REPORT
// =========================================================

export async function getDepartmentUsageReport(from, to) {
  const { data } = await api.get("/reports/department-usage", {
    params: {
      from,
      to,
    },
  });

  return data;
}

export default api;