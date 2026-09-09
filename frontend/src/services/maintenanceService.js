import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/work-orders`;

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

export async function createWorkOrder(payload) {
  const { data } = await api.post("", payload);
  return data;
}

export async function getAllWorkOrders() {
  const { data } = await api.get("");
  return data;
}

export async function getMyAssignedWorkOrders() {
  const { data } = await api.get("/my");
  return data;
}

export async function getWorkOrdersByEquipment(equipmentId) {
  const { data } = await api.get(
    `/equipment/${equipmentId}`
  );

  return data;
}

export async function assignTechnician(
  workOrderId,
  technicianUserId
) {
  const { data } = await api.put(
    `/${workOrderId}/assign`,
    {
      technicianUserId,
    }
  );

  return data;
}

export async function markComplete(workOrderId, serviceLog) {
  const { data } = await api.put(
    `/${workOrderId}/complete`,
    { serviceLog }
  );
  return data;
}

export default api;