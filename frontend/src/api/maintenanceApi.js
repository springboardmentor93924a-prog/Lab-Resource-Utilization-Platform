import { apiFetch } from "./client";

export const maintenanceApi = {
  getEligibleTechnicians: (id) => apiFetch(`/maintenance/${id}/eligible-technicians`),
  report: (payload) => apiFetch("/maintenance/report", { method: "POST", body: payload }),
  myReports: () => apiFetch("/maintenance/my"),
  getTechnicianTasks: () => apiFetch("/maintenance/technician"),
  getDepartmentWorkOrders: () => apiFetch("/maintenance/department"),
  getEquipmentHistory: (equipmentId) => apiFetch("/maintenance/records/history", { params: { equipmentId } }),
  getHistory: (equipmentId) => apiFetch("/maintenance/records/history", { params: { equipmentId } }),
  submitPlan: (id, payload) =>
    apiFetch(`/maintenance/${id}/submit-plan`, {
      method: "POST",
      body: payload
    }),
  acceptSchedule: (id) =>
    apiFetch(`/maintenance/${id}/accept-schedule`, {
      method: "POST"
    }),
  finalizeSchedule: (id, payload) =>
    apiFetch(`/maintenance/${id}/finalize-schedule`, {
      method: "POST",
      body: payload
    }),
  acceptTechnicianProposal: (id, payload) =>
    apiFetch(`/maintenance/${id}/accept-proposal`, {
      method: "POST",
      body: payload || {}
    }),
  cancelAssignment: (id) =>
    apiFetch(`/maintenance/${id}/cancel-assignment`, { method: "POST" }),
  managerCancel: (id, reason) =>
    apiFetch(`/maintenance/${id}/manager-cancel`, {
      method: "POST",
      body: { reason }
    }),
  assignTechnician: (id, payload) =>
    apiFetch(`/maintenance/${id}/assign`, {
      method: "POST",
      body: payload
    }),
  removeAssignment: (id, reason) =>
    apiFetch(`/maintenance/${id}/remove-assignment`, {
      method: "POST",
      body: { reason }
    }),
  reassignTechnician: (id, payload) =>
    apiFetch(`/maintenance/${id}/reassign`, {
      method: "POST",
      body: payload
    }),
  startWork: (id) =>
    apiFetch(`/maintenance/${id}/start`, { method: "POST" }),
  completeWork: (id, payload, photoFile) => {
    if (photoFile) {
      const formData = new FormData();
      if (payload?.diagnosticNotes) formData.append("diagnosticNotes", payload.diagnosticNotes);
      if (payload?.workPerformed) formData.append("workPerformed", payload.workPerformed);
      if (payload?.partsUsed) formData.append("partsUsed", payload.partsUsed);
      if (photoFile) formData.append("completionPhoto", photoFile);
      return apiFetch(`/maintenance/${id}/complete`, {
        method: "POST",
        body: formData,
      });
    }
    return apiFetch(`/maintenance/${id}/complete`, {
      method: "POST",
      body: payload || {},
    });
  },
  verifyWork: (id, payload) =>
    apiFetch(`/maintenance/${id}/verify`, {
      method: "POST",
      body: payload,
    }),
  editMaintenance: (id, data) =>
    apiFetch(`/maintenance/${id}/edit`, { method: "PUT", body: data }),
};
