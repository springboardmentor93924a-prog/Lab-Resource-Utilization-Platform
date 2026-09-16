import { apiFetch } from "./client";

export const billingApi = {
  getCostRecords: (params) => apiFetch("/billing/costs", { params }),
  getCostSummary: (params) => apiFetch("/billing/costs/summary", { params }),
  getInvoices: () => apiFetch("/billing/invoices"),
  getInvoiceById: (id) => apiFetch(`/billing/invoices/${id}`),
  payInvoice: (id) =>
    apiFetch(`/billing/invoices/${id}/pay`, {
      method: "POST",
    }),
  getPrimaryBankAccount: () => apiFetch("/institution/bank-account/primary"),
};
