import apiClient from "./client";

// POST /api/resource-sharing/request - { equipmentId } - requester comes from JWT
export function createSharingRequest(equipmentId) {
  return apiClient
    .post("/api/resource-sharing/request", { equipmentId })
    .then((res) => res.data);
}

// GET /api/resource-sharing
export function getAllSharingRequests() {
  return apiClient.get("/api/resource-sharing").then((res) => res.data);
}

// GET /api/resource-sharing/{requestId}
export function getSharingRequestById(requestId) {
  return apiClient.get(`/api/resource-sharing/${requestId}`).then((res) => res.data);
}

// GET /api/resource-sharing/pending
export function getPendingSharingRequests() {
  return apiClient.get("/api/resource-sharing/pending").then((res) => res.data);
}

// PUT /api/resource-sharing/approve/{requestId} - no body
export function approveSharingRequest(requestId) {
  return apiClient
    .put(`/api/resource-sharing/approve/${requestId}`)
    .then((res) => res.data);
}

// PUT /api/resource-sharing/reject/{requestId} - no body
export function rejectSharingRequest(requestId) {
  return apiClient
    .put(`/api/resource-sharing/reject/${requestId}`)
    .then((res) => res.data);
}
