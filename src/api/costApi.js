import apiClient from "./client";

// GET /api/cost -> CostResponseDTO[]
export function getAllCosts() {
  return apiClient.get("/api/cost").then((res) => res.data);
}

// GET /api/cost/equipment/{equipId} -> CostResponseDTO[]
export function getCostByEquipment(equipId) {
  return apiClient.get(`/api/cost/equipment/${equipId}`).then((res) => res.data);
}

// GET /api/cost/department/{deptId} -> CostSummaryDTO
export function getCostByDepartment(deptId) {
  return apiClient.get(`/api/cost/department/${deptId}`).then((res) => res.data);
}

// GET /api/cost/institution/{instId} -> CostSummaryDTO
export function getCostByInstitution(instId) {
  return apiClient.get(`/api/cost/institution/${instId}`).then((res) => res.data);
}

// GET /api/cost/billing/{instId} -> CostSummaryDTO (what other institutions owe this one)
export function getBillingForInstitution(instId) {
  return apiClient.get(`/api/cost/billing/${instId}`).then((res) => res.data);
}
