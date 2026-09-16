import { apiFetch } from "./client";

export const staffApi = {
  // Get entire dynamic staff roster with department grouping for authenticated institution admin
  getInstitutionStaffRoster: () => apiFetch("/users/staff-roster"),

  // Get full non-sensitive profile details for a specific staff member
  getStaffDetails: (userId) => apiFetch(`/users/staff/${userId}`),

  // Deactivate a staff member account with reason
  deactivateStaff: (userId, reason) =>
    apiFetch(`/users/deactivate-staff/${userId}`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  // Cancel a pending staff invitation
  cancelInvitation: (invitationId) =>
    apiFetch(`/staff/invitations/${invitationId}/cancel`, {
      method: "POST",
    }),

  // Invite a new staff member to a department
  inviteStaff: (dto) =>
    apiFetch("/staff/invitations/invite", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
};
