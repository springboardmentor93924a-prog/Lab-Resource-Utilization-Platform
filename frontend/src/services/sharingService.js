import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

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

export async function getCurrentUserInfo() {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function createAccessRequest(payload) {
  const { data } = await api.post("/access-requests", payload);
  return data;
}

export async function getMyAccessRequests() {
  const { data } = await api.get("/access-requests/my");
  return data;
}

export async function getPendingAccessRequests() {
  const { data } = await api.get("/access-requests/pending");
  return data;
}

export async function approveAccessRequest(id) {
  const { data } = await api.put(`/access-requests/${id}/approve`);
  return data;
}

export async function rejectAccessRequest(id) {
  const { data } = await api.put(`/access-requests/${id}/reject`);
  return data;
}

// =========================================================
// INTER-INSTITUTION SHARING REPORT
// =========================================================

export async function getInterInstitutionSharingReport(from, to) {
  const { data } = await api.get(
    "/access-requests/reports/inter-institution-sharing",
    {
      params: {
        from,
        to,
      },
    }
  );

  return data;
}

export default api;