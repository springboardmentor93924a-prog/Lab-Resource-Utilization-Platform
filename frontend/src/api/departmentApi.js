import { apiFetch } from "./client";

export const departmentApi = {
  // Get all departments with their active laboratories for the authenticated institution
  getMyInstitutionDepartments: () => apiFetch("/departments/my-institution"),

  // Atomically create a department with one or more named laboratories and locations
  createDepartment: (dto) =>
    apiFetch("/departments", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  // Get department details with laboratories by ID
  getById: (departmentId) => apiFetch(`/departments/${departmentId}`),

  // Update department
  update: (departmentId, dto) =>
    apiFetch(`/departments/${departmentId}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),

  // Deactivate department
  delete: (departmentId) =>
    apiFetch(`/departments/${departmentId}`, {
      method: "DELETE",
    }),
};
