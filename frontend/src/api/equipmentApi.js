import { apiFetch } from "./client";

export const equipmentApi = {
  // Equipment CRUD
  search: (params) => apiFetch("/equipment/search", { params }),
  getById: (equipmentId) => apiFetch(`/equipment/${equipmentId}`),
  create: (dto) => apiFetch("/equipment", { method: "POST", body: JSON.stringify(dto) }),
  update: (equipmentId, dto) => apiFetch(`/equipment/${equipmentId}`, { method: "PUT", body: JSON.stringify(dto) }),

  // Filter metadata — institution & department scoping enforced server-side
  getCategories: () => apiFetch("/equipment/categories"),
  getLocations: (params) => apiFetch("/equipment/locations", { params }),

  // Real equipment documents & calibrations
  getDocuments: (equipmentId) => apiFetch(`/equipment/${equipmentId}/documents`),
  getCalibrations: (equipmentId) => apiFetch(`/equipment/${equipmentId}/calibrations`),
  recordCalibration: (equipmentId, formData) =>
    apiFetch(`/equipment/${equipmentId}/calibrations`, { method: "POST", body: formData }),

  // Department & laboratory dropdowns — institution derived from JWT server-side
  getDepartments: () => apiFetch("/departments/my-institution"),
  getLaboratories: (departmentId) =>
    apiFetch("/laboratories", { params: departmentId ? { departmentId } : {} }),

  // Image Upload
  uploadImage: (equipmentId, formData) =>
    apiFetch(`/equipment/${equipmentId}/image`, { method: "POST", body: formData }),

  // Department Head-only: update inter-institution sharing settings
  updateSharing: (equipmentId, payload) =>
    apiFetch(`/equipment/${equipmentId}/sharing`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
