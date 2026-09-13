import api from "./api";

// =========================================================
// BUDGET API
// =========================================================

// =========================================================
// GET ALL BUDGETS
// =========================================================
export const getAllBudgets = async () => {
  const response = await api.get("/budgets");
  return response.data;
};

// =========================================================
// GET BUDGET BY ID
// =========================================================
export const getBudgetById = async (id) => {
  const response = await api.get(`/budgets/${id}`);
  return response.data;
};

// =========================================================
// CREATE BUDGET
// =========================================================
export const createBudget = async (budget) => {
  const response = await api.post("/budgets", budget);
  return response.data;
};

// =========================================================
// UPDATE BUDGET
// =========================================================
export const updateBudget = async (id, budget) => {
  const response = await api.put(`/budgets/${id}`, budget);
  return response.data;
};

// =========================================================
// DELETE BUDGET
// =========================================================
export const deleteBudget = async (id) => {
  const response = await api.delete(`/budgets/${id}`);
  return response.data;
};

// =========================================================
// GET BY DEPARTMENT
// =========================================================
export const getBudgetsByDepartment = async (departmentId) => {
  const response = await api.get(
    `/budgets/department/${departmentId}`
  );
  return response.data;
};

// =========================================================
// GET BY INSTITUTION
// =========================================================
export const getBudgetsByInstitution = async (institutionId) => {
  const response = await api.get(
    `/budgets/institution/${institutionId}`
  );
  return response.data;
};

// =========================================================
// GET BY FINANCIAL YEAR
// =========================================================
export const getBudgetsByFinancialYear = async (financialYear) => {
  const response = await api.get(
    `/budgets/financial-year/${financialYear}`
  );
  return response.data;
};

// =========================================================
// GET BY STATUS
// =========================================================
export const getBudgetsByStatus = async (status) => {
  const response = await api.get(
    `/budgets/status/${status}`
  );
  return response.data;
};

// =========================================================
// DEPARTMENT + STATUS
// =========================================================
export const getDepartmentBudgetsByStatus = async (
  departmentId,
  status
) => {
  const response = await api.get(
    `/budgets/department/${departmentId}/status/${status}`
  );
  return response.data;
};

// =========================================================
// INSTITUTION + STATUS
// =========================================================
export const getInstitutionBudgetsByStatus = async (
  institutionId,
  status
) => {
  const response = await api.get(
    `/budgets/institution/${institutionId}/status/${status}`
  );
  return response.data;
};

// =========================================================
// FINANCIAL YEAR + STATUS
// =========================================================
export const getBudgetsByFinancialYearAndStatus = async (
  financialYear,
  status
) => {
  const response = await api.get(
    `/budgets/financial-year/${financialYear}/status/${status}`
  );
  return response.data;
};

// =========================================================
// DEPARTMENT + FINANCIAL YEAR
// =========================================================
export const getDepartmentBudgetForYear = async (
  departmentId,
  financialYear
) => {
  const response = await api.get(
    `/budgets/department/${departmentId}/financial-year/${financialYear}`
  );
  return response.data;
};

// =========================================================
// INSTITUTION + FINANCIAL YEAR
// =========================================================
export const getInstitutionBudgetForYear = async (
  institutionId,
  financialYear
) => {
  const response = await api.get(
    `/budgets/institution/${institutionId}/financial-year/${financialYear}`
  );
  return response.data;
};

// =========================================================
// CALCULATE REMAINING BY ID
// =========================================================
export const calculateRemainingBudget = async (id) => {
  const response = await api.get(
    `/budgets/${id}/remaining`
  );
  return response.data;
};

// =========================================================
// CALCULATE UTILIZATION BY ID
// =========================================================
export const calculateUtilization = async (id) => {
  const response = await api.get(
    `/budgets/${id}/utilization`
  );
  return response.data;
};

// =========================================================
// CALCULATE REMAINING FROM AMOUNTS
// =========================================================
export const calculateRemainingFromAmounts = async (
  allocatedAmount,
  utilizedAmount
) => {
  const response = await api.get(
    "/budgets/calculate-remaining",
    {
      params: {
        allocatedAmount,
        utilizedAmount,
      },
    }
  );

  return response.data;
};

// =========================================================
// UPDATE USED AMOUNT
// =========================================================
export const updateUsedAmount = async (
  id,
  usedAmount
) => {
  const response = await api.patch(
    `/budgets/${id}/used-amount`,
    null,
    {
      params: {
        usedAmount,
      },
    }
  );

  return response.data;
};

// =========================================================
// UPDATE UTILIZED AMOUNT
// =========================================================
export const updateUtilizedAmount = async (
  id,
  utilizedAmount
) => {
  const response = await api.patch(
    `/budgets/${id}/utilized-amount`,
    null,
    {
      params: {
        utilizedAmount,
      },
    }
  );

  return response.data;
};

// =========================================================
// ADD USED AMOUNT
// =========================================================
export const addUsedAmount = async (
  id,
  amount
) => {
  const response = await api.patch(
    `/budgets/${id}/add-used-amount`,
    null,
    {
      params: {
        amount,
      },
    }
  );

  return response.data;
};

// =========================================================
// UPDATE STATUS
// =========================================================
export const updateBudgetStatus = async (
  id,
  status
) => {
  const response = await api.patch(
    `/budgets/${id}/status`,
    null,
    {
      params: {
        status,
      },
    }
  );

  return response.data;
};

// =========================================================
// MARK AS EXHAUSTED
// =========================================================
export const markAsExhausted = async (id) => {
  const response = await api.patch(
    `/budgets/${id}/mark-exhausted`
  );

  return response.data;
};