import apiClient from "./client";

// EquipmentRequestDTO shape:
// { equipmentName, assetTag, categoryId, institutionId, departmentId, status,
//   hourlyRate, purchaseDate, purchaseCost, warrantyExpiry }

// POST /api/equipment
export function addEquipment(payload) {
  return apiClient.post("/api/equipment", payload).then((res) => res.data);
}

// GET /api/equipment -> EquipmentResponseDTO[]
export function getAllEquipment() {
  return apiClient.get("/api/equipment").then((res) => res.data);
}

// GET /api/equipment/{id}
export function getEquipmentById(equipmentId) {
  return apiClient.get(`/api/equipment/${equipmentId}`).then((res) => res.data);
}

// PUT /api/equipment/{id}
export function updateEquipment(equipmentId, payload) {
  return apiClient.put(`/api/equipment/${equipmentId}`, payload).then((res) => res.data);
}

// DELETE /api/equipment/{id}
export function deleteEquipment(equipmentId) {
  return apiClient.delete(`/api/equipment/${equipmentId}`).then((res) => res.data);
}

// ---- Calibration sub-module: /api/equipment/calibration ----

// CalibRecordRequestDTO shape:
// { equipmentId, lastCalibrationDate, nextCalibrationDate, calibrationIntervalMonths,
//   certificationNumber, certificationIssueDate, certificationExpiryDate, certificationRequired }

// POST /api/equipment/calibration
export function createCalibrationRecord(payload) {
  return apiClient.post("/api/equipment/calibration", payload).then((res) => res.data);
}

// GET /api/equipment/calibration/equipment/{equipmentId}
export function getCalibrationByEquipment(equipmentId) {
  return apiClient
    .get(`/api/equipment/calibration/equipment/${equipmentId}`)
    .then((res) => res.data);
}

// PUT /api/equipment/calibration/{calibrationId}
export function updateCalibrationRecord(calibrationId, payload) {
  return apiClient
    .put(`/api/equipment/calibration/${calibrationId}`, payload)
    .then((res) => res.data);
}

// DELETE /api/equipment/calibration/{calibrationId}
export function deleteCalibrationRecord(calibrationId) {
  return apiClient
    .delete(`/api/equipment/calibration/${calibrationId}`)
    .then((res) => res.data);
}
