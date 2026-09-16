import { apiFetch } from "./client";

export const budgetApi = {
  getDepartmentBudget: (params) => apiFetch("/budgets/department", { params }),
  getInstitutionBudgets: (params) => apiFetch("/budgets/institution", { params }),
  allocateDepartmentBudget: (departmentId, allocatedAmount, fiscalYear) =>
    apiFetch("/budgets/allocate", {
      method: "POST",
      params: { departmentId, allocatedAmount, fiscalYear },
    }),
  getBudgetRequests: (params) => apiFetch("/budget-requests", { params }),
  submitBudgetRequest: (requestedAmount, reason) =>
    apiFetch("/budget-requests", {
      method: "POST",
      params: { requestedAmount, reason },
    }),
  approveBudgetRequest: (id, comment) =>
    apiFetch(`/budget-requests/${id}/approve`, {
      method: "PUT",
      params: { comment },
    }),
  rejectBudgetRequest: (id, comment) =>
    apiFetch(`/budget-requests/${id}/reject`, {
      method: "PUT",
      params: { comment },
    }),
};
