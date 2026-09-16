import { apiFetch, API_BASE_URL, getToken } from "./client";

export const issueReportApi = {
  getEligibleBookings: () => apiFetch("/issue-reports/eligible-bookings"),
  report: (payload) => apiFetch("/issue-reports", { method: "POST", body: payload }),
  myReports: () => apiFetch("/issue-reports/my"),
  getDetails: (id) => apiFetch(`/issue-reports/${id}`),
  downloadPdf: async (id) => {
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE_URL}/issue-reports/${id}/download`, { headers });
    if (!res.ok) throw new Error("Could not download incident report PDF.");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `incident_report_${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
