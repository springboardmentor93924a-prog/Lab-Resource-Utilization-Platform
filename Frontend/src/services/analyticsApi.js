import api from "./api";

// =========================================================
// 5.16.1 - EQUIPMENT UTILIZATION
// =========================================================

export const getEquipmentUtilization = async (
  equipmentId,
  startDate,
  endDate
) => {
  const response = await api.get(
    `/analytics/utilization/equipment/${equipmentId}`,
    {
      params: {
        startDate,
        endDate,
      },
    }
  );

  return response.data;
};


// =========================================================
// 5.16.2 - DEMAND ANALYSIS
// =========================================================

export const getDemandAnalysis = async (
  startDate,
  endDate
) => {
  const response = await api.get(
    "/analytics/demand",
    {
      params: {
        startDate,
        endDate,
      },
    }
  );

  return response.data;
};


// =========================================================
// 5.16.4 - DEMAND TRENDS
// =========================================================

export const getDemandTrends = async (
  startDate,
  endDate
) => {
  const response = await api.get(
    "/analytics/trends",
    {
      params: {
        startDate,
        endDate,
      },
    }
  );

  return response.data;
};


// =========================================================
// 5.16.5 - EQUIPMENT RANKING
// =========================================================

export const getEquipmentRanking = async (
  startDate,
  endDate
) => {
  const response = await api.get(
    "/analytics/ranking",
    {
      params: {
        startDate,
        endDate,
      },
    }
  );

  return response.data;
};


// =========================================================
// 5.16.6 - UTILIZATION REPORT
// =========================================================

export const getUtilizationReport = async (
  startDate,
  endDate
) => {
  const response = await api.get(
    "/analytics/report",
    {
      params: {
        startDate,
        endDate,
      },
    }
  );

  return response.data;
};