import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/bookings";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================================================
// ATTACH JWT TOKEN TO EVERY REQUEST
// =========================================================

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// =========================================================
// CREATE BOOKING
// =========================================================

export async function createBooking(payload) {
  const { data } = await api.post("", payload);
  return data;
}

// =========================================================
// GET ALL BOOKINGS
// =========================================================

export async function getAllBookings() {
  const { data } = await api.get("");
  return data;
}

// =========================================================
// GET BOOKINGS BY USER
// =========================================================

export async function getBookingsByUser(userId) {
  const { data } = await api.get(`/user/${userId}`);
  return data;
}

// =========================================================
// GET BOOKINGS BY EQUIPMENT
// =========================================================

export async function getBookingsByEquipment(equipmentId) {
  const { data } = await api.get(`/equipment/${equipmentId}`);
  return data;
}

// =========================================================
// CANCEL BOOKING
// =========================================================

export async function cancelBooking(id) {
  const { data } = await api.put(`/${id}/cancel`);
  return data;
}

// =========================================================
// APPROVE BOOKING
// =========================================================

export async function approveBooking(id) {
  const { data } = await api.put(`/${id}/approve`);
  return data;
}

// =========================================================
// REJECT BOOKING
// =========================================================

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
      from: from,
      to: to,
    },
  });

  return data;
}

// =========================================================
// DEFAULT API
// =========================================================

export default api;