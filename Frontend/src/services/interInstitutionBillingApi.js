import api from "./api";

// =========================================================
// INTER-INSTITUTION BILLING API
// =========================================================

// Get all billing records
export const getAllBillings = () => {
  return api.get("/inter-institution-billing");
};

// Get billing by ID
export const getBillingById = (id) => {
  return api.get(`/inter-institution-billing/${id}`);
};

// Get by sharing institution
export const getBillingsBySharingInstitution = (institutionId) => {
  return api.get(
    `/inter-institution-billing/sharing-institution/${institutionId}`
  );
};

// Get by using institution
export const getBillingsByUsingInstitution = (institutionId) => {
  return api.get(
    `/inter-institution-billing/using-institution/${institutionId}`
  );
};

// Get by equipment
export const getBillingsByEquipment = (equipmentId) => {
  return api.get(
    `/inter-institution-billing/equipment/${equipmentId}`
  );
};

// Get by billing status
export const getBillingsByStatus = (status) => {
  return api.get(
    `/inter-institution-billing/status/${status}`
  );
};

// Get by billing date
export const getBillingsByDate = (date) => {
  return api.get(
    `/inter-institution-billing/date/${date}`
  );
};

// Get by date range
export const getBillingsByDateRange = (
  startDate,
  endDate
) => {
  return api.get(
    `/inter-institution-billing/date-range`,
    {
      params: {
        startDate,
        endDate,
      },
    }
  );
};

// Create billing
export const createBilling = (billing) => {
  return api.post(
    "/inter-institution-billing",
    billing
  );
};

// Update billing
export const updateBilling = (id, billing) => {
  return api.put(
    `/inter-institution-billing/${id}`,
    billing
  );
};

// Update billing status
export const updateBillingStatus = (
  id,
  billingStatus
) => {
  return api.put(
    `/inter-institution-billing/${id}/status`,
    null,
    {
      params: {
        billingStatus,
      },
    }
  );
};

// Delete billing
export const deleteBilling = (id) => {
  return api.delete(
    `/inter-institution-billing/${id}`
  );
};

