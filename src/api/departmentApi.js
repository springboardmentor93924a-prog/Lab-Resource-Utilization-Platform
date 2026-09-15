import apiClient from "./client";

// POST /api/departments - { departmentName, description, institution: { institutionId } }
export function createDepartment(payload) {
  return apiClient.post("/api/departments", payload).then((res) => res.data);
}

// GET /api/departments
export function getAllDepartments() {
  return apiClient.get("/api/departments").then((res) => res.data);
}

// GET /api/departments/{id}
export function getDepartmentById(id) {
  return apiClient.get(`/api/departments/${id}`).then((res) => res.data);
}

// GET /api/departments/name/{name} - public
export function getDepartmentByName(name) {
  return apiClient.get(`/api/departments/name/${encodeURIComponent(name)}`).then((res) => res.data);
}

// GET /api/departments/institution/{institutionId} - public, drives dependent dropdowns
export function getDepartmentsByInstitution(institutionId) {
  return apiClient
    .get(`/api/departments/institution/${institutionId}`)
    .then((res) => res.data);
}

// PUT /api/departments/{id}
export function updateDepartment(id, payload) {
  return apiClient.put(`/api/departments/${id}`, payload).then((res) => res.data);
}

// DELETE /api/departments/{id}
export function deleteDepartment(id) {
  return apiClient.delete(`/api/departments/${id}`).then((res) => res.data);
}
