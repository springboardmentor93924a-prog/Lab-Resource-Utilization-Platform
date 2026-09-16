import { apiFetch } from "./client.js";

export const heatmapApi = {
  /**
   * Fetch utilization heatmap data (equipment list + usable bookings).
   *
   * @param {Object} [params]
   * @param {number|string} [params.departmentId]
   * @param {string} [params.from] - ISO-8601 e.g. "2026-08-01T00:00:00"
   * @param {string} [params.to]   - ISO-8601 e.g. "2026-08-31T23:59:59"
   */
  getHeatmapData: (params) => apiFetch("/heatmap", { params }),
};
