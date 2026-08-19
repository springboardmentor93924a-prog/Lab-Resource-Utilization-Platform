import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/billing";

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


// =====================================================
// WHAT WE OWE
// =====================================================
export async function getWhatWeOwe() {
  const { data } = await api.get("/my-institution");

  return data;
}


// =====================================================
// WHAT IS OWED TO US
// =====================================================
export async function getWhatIsOwedToUs() {
  const { data } = await api.get("/owed-to-me");

  return data;
}


// =====================================================
// DEPARTMENT-WISE COST SUMMARY
// =====================================================
export async function getDepartmentCostSummary() {
  const { data } = await api.get(
    "/department-summary"
  );

  return data;
}


// =====================================================
// MARK BILLING RECORD AS PAID
// =====================================================
export async function markPaid(id) {
  const { data } = await api.put(
    `/${id}/mark-paid`
  );

  return data;
};


export default api;