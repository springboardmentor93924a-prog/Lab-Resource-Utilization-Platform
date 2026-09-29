import { apiFetch } from "./client";

export const authApi = {
  register: (payload) => apiFetch("/auth/register", { method: "POST", body: payload }),
  login: (payload) => apiFetch("/auth/login", { method: "POST", body: payload }),
  me: () => apiFetch("/auth/me"),
  listInstitutions: () => apiFetch("/institutions"),
  listActiveInstitutions: () => apiFetch("/institutions/active"),
  getInstitution: (institutionId) => apiFetch(`/institutions/${institutionId}`),
  listDepartments: (institutionId) => apiFetch(`/institutions/${institutionId}/departments`),
  inviteStaff: (payload) => apiFetch("/staff/invitations/invite", { method: "POST", body: payload }),
  cancelStaffInvitation: (invitationId) => apiFetch(`/staff/invitations/${invitationId}/cancel`, { method: "POST" }),
  validateStaffInvitationToken: (token) => apiFetch(`/staff/invitations/validate?token=${encodeURIComponent(token)}`),
  acceptStaffInvitation: (payload) => apiFetch("/staff/invitations/accept", { method: "POST", body: payload }),
  deactivateStaff: (userId, reason) => apiFetch(`/users/deactivate-staff/${userId}`, { method: "POST", body: { reason } }),
  checkInstitutionCode: (code) => apiFetch(`/institutions/check-code?code=${encodeURIComponent(code)}`),
  registerInstitution: (payload) => apiFetch("/institutions/register", { method: "POST", body: payload }),
  listPendingInstitutions: () => apiFetch("/institutions/pending"),
  approveInstitution: (institutionId) => apiFetch(`/institutions/${institutionId}/approve`, { method: "POST" }),
  rejectInstitution: (institutionId, reason) => apiFetch(`/institutions/${institutionId}/reject`, { method: "POST", body: { reason } }),
  validateSetupToken: (token) => apiFetch(`/auth/setup-token/validate?token=${encodeURIComponent(token)}`),
  setupPassword: (payload) => apiFetch("/auth/setup-password", { method: "POST", body: payload }),
  sendOtp: (email, purpose) => apiFetch(`/auth/otp/send?email=${encodeURIComponent(email)}&purpose=${encodeURIComponent(purpose)}`, { method: "POST" }),
  verifyOtp: (email, purpose, otp) => apiFetch(`/auth/otp/verify?email=${encodeURIComponent(email)}&purpose=${encodeURIComponent(purpose)}&otp=${encodeURIComponent(otp)}`, { method: "POST" }),
  getSystemAdminDashboard: () => apiFetch("/dashboard/system-admin"),
  getAuditLogs: () => apiFetch("/audit-logs"),
  getAllUsers: (params = {}) => {
    const query = new URLSearchParams();
    if (params.role) query.append("role", params.role);
    if (params.status) query.append("status", params.status);
    if (params.institutionId) query.append("institutionId", params.institutionId);
    if (params.search) query.append("search", params.search);
    const qStr = query.toString();
    return apiFetch(`/users/all${qStr ? `?${qStr}` : ""}`);
  },
  toggleUserActiveStatus: (userId, reason) =>
    apiFetch(`/users/${userId}/toggle-active`, { method: "POST", body: { reason } }),
  getPendingRegistrations: () => apiFetch("/users/pending-registrations"),
  getAllStaffInvitations: () => apiFetch("/staff/invitations/all"),
  getPlatformAnalytics: () => apiFetch("/system-admin/analytics"),
  getSystemSettings: () => apiFetch("/system-admin/settings"),
  updateSystemSettings: (payload) => apiFetch("/system-admin/settings", { method: "PUT", body: payload }),
};
