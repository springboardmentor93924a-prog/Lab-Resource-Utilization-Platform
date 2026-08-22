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
  const { data } = await api.get("/utilization");
  return data;
}
export async function getCalibrationAlerts() {
  const { data } = await api.get("/calibration-alerts");
  return data;
}
export async function getUtilizationCostReport(from, to) {
  const { data } = await api.get(`/reports/utilization-cost?from=${from}&to=${to}`);
  return data;
}
export async function getUtilizationHeatmap(from, to) {
  const { data } = await api.get(
    `/utilization/heatmap?from=${from}&to=${to}`
  );
  return data;
}

export function getUtilizationCostReportCsvUrl(from, to) {
  return `${API_BASE_URL}/reports/utilization-cost/csv?from=${from}&to=${to}`;
}
export async function downloadUtilizationCostReportCsv(from, to) {
  const response = await api.get(`/reports/utilization-cost/csv?from=${from}&to=${to}`, {
    responseType: "blob",
  });
  const blobUrl = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = "utilization_cost_report.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

export default api;