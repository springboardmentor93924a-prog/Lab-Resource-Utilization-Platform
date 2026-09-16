import { apiFetch, API_BASE_URL, getToken } from "./client.js";

/**
 * Downloads binary report file (PDF, Excel, CSV) from backend export endpoints
 */
async function downloadReportFile(path, params, defaultFilename) {
  let url = `${API_BASE_URL}${path}`;
  if (params) {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    if (query) url += `?${query}`;
  }

  const token = getToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { method: "GET", headers });
  if (!response.ok) {
    const isJson = response.headers.get("content-type")?.includes("application/json");
    const payload = isJson ? await response.json().catch(() => null) : null;
    const msg = payload?.message || `Failed to export file (HTTP ${response.status})`;
    throw new Error(msg);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition");
  let filename = defaultFilename;
  if (disposition && disposition.includes("filename=")) {
    const match = disposition.match(/filename=["']?([^"';]+)["']?/);
    if (match && match[1]) filename = match[1];
  }

  const link = document.createElement("a");
  const blobUrl = URL.createObjectURL(blob);
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}

export const reportApi = {
  /**
   * Fetch Utilization Effectiveness Report JSON
   */
  getUtilizationEffectiveness: (params) =>
    apiFetch("/reports/utilization-effectiveness", { params }),

  /**
   * Fetch Cost Analysis Report JSON
   */
  getCostAnalysis: (params) =>
    apiFetch("/reports/cost-analysis", { params }),

  // ─── Export Binary Endpoints ──────────────────────────────────────────────

  exportUtilizationPdf: (params) =>
    downloadReportFile("/reports/utilization-effectiveness/export/pdf", params, "utilization-effectiveness-report.pdf"),

  exportUtilizationExcel: (params) =>
    downloadReportFile("/reports/utilization-effectiveness/export/excel", params, "utilization-effectiveness-report.xlsx"),

  exportUtilizationCsv: (params) =>
    downloadReportFile("/reports/utilization-effectiveness/export/csv", params, "utilization-effectiveness-report.csv"),

  exportCostPdf: (params) =>
    downloadReportFile("/reports/cost-analysis/export/pdf", params, "cost-analysis-report.pdf"),

  exportCostExcel: (params) =>
    downloadReportFile("/reports/cost-analysis/export/excel", params, "cost-analysis-report.xlsx"),

  exportCostCsv: (params) =>
    downloadReportFile("/reports/cost-analysis/export/csv", params, "cost-analysis-report.csv"),
};
