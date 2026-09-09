import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/files`;
const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post("/upload", formData);
  return data;
}

export function getFileUrl(filename) {
  return `${API_BASE_URL}/${filename}`;
}
export async function downloadFileAsBlob(filename) {
  const response = await api.get(`/${filename}`, { responseType: "blob" });
  const blobUrl = window.URL.createObjectURL(response.data);
  return blobUrl;
}

export default api;