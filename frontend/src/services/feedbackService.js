import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/feedback";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================
// ADD JWT TOKEN TO EVERY REQUEST
// ==========================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// SUBMIT FEEDBACK
// ==========================================

export async function submitFeedback(payload) {
  const { data } = await api.post("", payload);
  return data;
}

// ==========================================
// GET ALL FEEDBACK
// ==========================================

export async function getAllFeedback() {
  const { data } = await api.get("");
  return data;
}

// ==========================================
// GET NEW FEEDBACK
// ==========================================

export async function getNewFeedback() {
  const { data } = await api.get("/new");
  return data;
}

// ==========================================
// GET FEEDBACK BY EQUIPMENT
// ==========================================

export async function getFeedbackByEquipment(equipmentId) {
  const { data } = await api.get(`/equipment/${equipmentId}`);
  return data;
}

// ==========================================
// GET FEEDBACK BY SUBMITTER
// ==========================================

export async function getFeedbackBySubmitter(userId) {
  const { data } = await api.get(`/submitter/${userId}`);
  return data;
}

// ==========================================
// UPDATE FEEDBACK STATUS
// ==========================================

export async function updateFeedbackStatus(feedbackId, status) {
  const { data } = await api.put(
    `/${feedbackId}/status`,
    null,
    {
      params: {
        status,
      },
    }
  );

  return data;
}

export default api;