import api from "./api";

// =========================================================
// 3.6.1 - GET ALL COSTS
// =========================================================

export const getAllCosts = async () => {
  const response = await api.get("/costs");

  return response.data;
};


// =========================================================
// 3.6.2 - GET COST BY ID
// =========================================================

export const getCostById = async (id) => {
  const response = await api.get(`/costs/${id}`);

  return response.data;
};


// =========================================================
// 3.6.3 - CREATE COST
// =========================================================

export const createCost = async (costData) => {
  const response = await api.post(
    "/costs",
    costData
  );

  return response.data;
};


// =========================================================
// 3.6.4 - UPDATE COST
// =========================================================

export const updateCost = async (
  id,
  costData
) => {
  const response = await api.put(
    `/costs/${id}`,
    costData
  );

  return response.data;
};


// =========================================================
// 3.6.5 - DELETE COST
// =========================================================

export const deleteCost = async (id) => {
  const response = await api.delete(
    `/costs/${id}`
  );

  return response.data;
};


// =========================================================
// 3.6.6 - CALCULATE COST
// =========================================================

export const calculateCost = async (id) => {
  const response = await api.post(
    `/costs/${id}/calculate`
  );

  return response.data;
};