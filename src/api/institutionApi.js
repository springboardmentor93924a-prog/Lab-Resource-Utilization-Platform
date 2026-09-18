import apiClient from "./client";

// POST /api/institutions - currently public per SecurityConfig
export function createInstitution(payload) {
  // payload matches the Institution entity:
  // { institutionName, institutionCode, address, city, state, country, pincode, contactEmail, contactPhone }
  return apiClient.post("/api/institutions", payload).then((res) => res.data);
}

// GET /api/institutions - public
export function getAllInstitutions() {
  return apiClient.get("/api/institutions").then((res) => res.data);
}

// GET /api/institutions/code/{code}
export function getInstitutionByCode(code) {
  return apiClient.get(`/api/institutions/code/${encodeURIComponent(code)}`).then((res) => res.data);
}

// GET /api/institutions/name/{name}
export function getInstitutionByName(name) {
  return apiClient.get(`/api/institutions/name/${encodeURIComponent(name)}`).then((res) => res.data);
}

// GET /api/institutions/city/{city}
export function getInstitutionsByCity(city) {
  return apiClient.get(`/api/institutions/city/${encodeURIComponent(city)}`).then((res) => res.data);
}

// PUT /api/institutions/{id}
export function updateInstitution(id, payload) {
  return apiClient.put(`/api/institutions/${id}`, payload).then((res) => res.data);
}

// DELETE /api/institutions/{id}
export function deleteInstitution(id) {
  return apiClient.delete(`/api/institutions/${id}`).then((res) => res.data);
}
