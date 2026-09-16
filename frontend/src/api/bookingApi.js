import { apiFetch, API_BASE_URL, getToken } from "./client";

export const bookingApi = {
  getCurrentAgreement: () => apiFetch("/bookings/agreement/current"),
  create: (payload) => apiFetch("/bookings", { method: "POST", body: payload }),
  myBookings: (tab) => apiFetch("/bookings/my", { params: { tab } }),
  cancel: (bookingId) => apiFetch(`/bookings/${bookingId}/cancel`, { method: "PUT" }),
  reschedule: (bookingId, payload) =>
    apiFetch(`/bookings/${bookingId}/reschedule`, { method: "PUT", body: payload }),
  getDepartmentBookings: (status) => apiFetch("/bookings/department", { params: { status } }),
  getApprovalDetails: (bookingId) => apiFetch(`/bookings/${bookingId}/approval-details`),
  approve: (bookingId) => apiFetch(`/bookings/${bookingId}/approve`, { method: "POST" }),
  reject: (bookingId, reason) =>
    apiFetch(`/bookings/${bookingId}/reject`, {
      method: "POST",
      body: { reason: typeof reason === "string" ? reason : reason?.reason },
    }),
  downloadReceipt: async (bookingId) => {
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/download`, { headers });
    if (!res.ok) throw new Error("Could not download booking receipt.");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `booking_receipt_${bookingId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
