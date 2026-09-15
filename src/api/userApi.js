import apiClient from "./client";

// POST /api/users/register - public. Returns the raw UserEntity.
export function registerUser(payload) {
  // payload: { firstName, lastName, email, password, phone, role, institutionId, departmentId }
  return apiClient.post("/api/users/register", payload).then((res) => res.data);
}

// GET /api/users - institution admin / system admin
export function getAllUsers() {
  return apiClient.get("/api/users").then((res) => res.data);
}

// GET /api/users/{email}
export function getUserByEmail(email) {
  return apiClient.get(`/api/users/${encodeURIComponent(email)}`).then((res) => res.data);
}

// PUT /api/users/{email} - { firstName, lastName, phone, departmentId }
export function updateUser(email, payload) {
  return apiClient
    .put(`/api/users/${encodeURIComponent(email)}`, payload)
    .then((res) => res.data);
}

// DELETE /api/users/{email}
export function deleteUser(email) {
  return apiClient.delete(`/api/users/${encodeURIComponent(email)}`).then((res) => res.data);
}

// GET /api/users/pending
export function getPendingUsers() {
  return apiClient.get("/api/users/pending").then((res) => res.data);
}

// PUT /api/users/approve/{email}
export function approveUser(email) {
  return apiClient
    .put(`/api/users/approve/${encodeURIComponent(email)}`)
    .then((res) => res.data);
}
