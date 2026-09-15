import apiClient from "./client";

// POST /api/utilization/start/{bookingId} - no body
export function startUtilization(bookingId) {
  return apiClient.post(`/api/utilization/start/${bookingId}`).then((res) => res.data);
}

// PUT /api/utilization/end/{bookingId} - no body
export function endUtilization(bookingId) {
  return apiClient.put(`/api/utilization/end/${bookingId}`).then((res) => res.data);
}

// GET /api/utilization -> UtilizationResponseDTO[]
export function getAllUtilization() {
  return apiClient.get("/api/utilization").then((res) => res.data);
}

// GET /api/utilization/analytics -> UtilizationAnalyticsDTO[]
export function getUtilizationAnalytics() {
  return apiClient.get("/api/utilization/analytics").then((res) => res.data);
}

// GET /api/utilization/{utilizationId}
export function getUtilizationById(utilizationId) {
  return apiClient.get(`/api/utilization/${utilizationId}`).then((res) => res.data);
}
