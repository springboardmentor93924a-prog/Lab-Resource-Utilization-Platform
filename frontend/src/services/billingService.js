import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/billing";

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

export async function getWhatWeOwe() {
  const { data } = await api.get("/my-institution");
  return data;
}

export async function getWhatIsOwedToUs() {
  const { data } = await api.get("/owed-to-me");
  return data;
}

export async function markPaid(id) {
  const { data } = await api.put(`/${id}/mark-paid`);
  return data;
}

export default api;