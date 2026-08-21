import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/work-orders";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function getMaintenanceDowntimeReport(from, to) {
  const { data } = await api.get("/reports/maintenance-downtime", {
    params: {
      from,
      to,
    },
  });

  return data;
}

export default api;