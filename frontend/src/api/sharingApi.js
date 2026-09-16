import { apiFetch } from "./client";

/**
 * Sharing API — wraps existing /api/sharing endpoints.
 * Uses real ResourceSharingRequest / SharingAgreement backend entities.
 * No duplicate sharing system is created here.
 */
export const sharingApi = {
  // Agreements for a specific equipment (read-only panel in drawer)
  getAgreementsForEquipment: (equipmentId) =>
    apiFetch("/sharing/agreements", { params: { equipmentId } }),

  // All agreements (for institution-level overview)
  getAllAgreements: () => apiFetch("/sharing/agreements"),

  // Incoming sharing requests (other institutions requesting OUR equipment)
  getIncomingRequests: () => apiFetch("/sharing/requests/incoming/detailed"),

  // Outgoing sharing requests (we are requesting THEIR equipment)
  getOutgoingRequests: () => apiFetch("/sharing/requests/outgoing/detailed"),

  // Institution Admin Overview
  getInstitutionSharingOverview: () => apiFetch("/sharing/institution-overview"),

  // Propose a new MOU for an incoming request
  proposeMou: (requestId, mouData) => {
    const body = typeof mouData === "string"
      ? { proposedHourlyRate: 0, mouTerms: mouData }
      : mouData;
    return apiFetch(`/sharing/requests/${requestId}/propose-mou`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  // Reject an incoming request
  rejectRequest: (requestId) =>
    apiFetch(`/sharing/requests/${requestId}/reject`, { method: "POST" }),

  // Accept / countersign MOU (moves to AGREEMENT stage)
  acceptMou: (requestId) =>
    apiFetch(`/sharing/requests/${requestId}/accept-mou`, { method: "POST" }),

  // Submit a new inter-institution sharing request
  createRequest: (equipmentId, startDate, endDate, purpose) =>
    apiFetch("/sharing/requests", {
      method: "POST",
      params: { equipmentId, startDate, endDate, purpose },
    }),

  // Partner Resource Discovery Endpoints (Read-Only Cross-Institution)
  getPartnerDepartments: (partnerInstitutionId) =>
    apiFetch(`/sharing/institutions/${partnerInstitutionId}/departments`),

  getPartnerLaboratories: (partnerInstitutionId, departmentId) =>
    apiFetch(`/sharing/institutions/${partnerInstitutionId}/laboratories`, {
      params: departmentId ? { departmentId } : {},
    }),

  getPartnerEquipment: (partnerInstitutionId, params) =>
    apiFetch(`/sharing/institutions/${partnerInstitutionId}/equipment`, { params }),

  getPartnerCategories: (partnerInstitutionId, departmentId) =>
    apiFetch(`/sharing/institutions/${partnerInstitutionId}/categories`, {
      params: departmentId ? { departmentId } : {},
    }),

  getPartnerLocations: (partnerInstitutionId, departmentId, labId) =>
    apiFetch(`/sharing/institutions/${partnerInstitutionId}/locations`, {
      params: { departmentId, labId },
    }),
};
