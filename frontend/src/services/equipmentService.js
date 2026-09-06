import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/equipment";

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

export async function getAllEquipment() {
  const { data } = await api.get("");
  return data;
}

export async function getEquipmentById(id) {
  const { data } = await api.get(`/${id}`);
  return data;
}

export async function addEquipment(payload) {
  const { data } = await api.post("", payload);
  return data;
}
export async function updateEquipment(id, payload) {
  const { data } = await api.put(`/${id}`, payload);
  return data;
}

export async function deleteEquipment(id) {
  const { data } = await api.delete(`/${id}`);
  return data;
}
export async function getEquipmentUtilization() {
  const { data } = await axios.get("http://localhost:8080/api/utilization/summary", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return data;
}
export async function getCalibrationAlerts() {
  const { data } = await api.get("/calibration-alerts");
  return data;
}


export default api;