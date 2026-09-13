import api from "./api";

// =========================================================
// COST RECOVERY API
// =========================================================

// =========================================================
// 1. GET ALL RECOVERIES
// =========================================================
export const getAllRecoveries = async () => {
  const response = await api.get("/cost-recovery");
  return response.data;
};

// =========================================================
// 2. GET RECOVERY BY ID
// =========================================================
export const getRecoveryById = async (id) => {
  const response = await api.get(`/cost-recovery/${id}`);
  return response.data;
};

// =========================================================
// 3. CREATE RECOVERY
// =========================================================
export const createRecovery = async (recovery) => {
  const response = await api.post("/cost-recovery", recovery);
  return response.data;
};

// =========================================================
// 4. UPDATE RECOVERY
// =========================================================
export const updateRecovery = async (id, recovery) => {
  const response = await api.put(`/cost-recovery/${id}`, recovery);
  return response.data;
};

// =========================================================
// 5. GET RECOVERIES BY COST
// =========================================================
export const getRecoveriesByCost = async (costId) => {
  const response = await api.get(`/cost-recovery/cost/${costId}`);
  return response.data;
};

// =========================================================
// 6. GET RECOVERIES BY DEPARTMENT
// =========================================================
export const getRecoveriesByDepartment = async (departmentId) => {
  const response = await api.get(
    `/cost-recovery/department/${departmentId}`
  );
  return response.data;
};

// =========================================================
// 7. GET RECOVERIES BY INSTITUTION
// =========================================================
export const getRecoveriesByInstitution = async (institutionId) => {
  const response = await api.get(
    `/cost-recovery/institution/${institutionId}`
  );
  return response.data;
};

// =========================================================
// 8. GET RECOVERIES BY EQUIPMENT
// =========================================================
export const getRecoveriesByEquipment = async (equipmentId) => {
  const response = await api.get(
    `/cost-recovery/equipment/${equipmentId}`
  );
  return response.data;
};

// =========================================================
// 9. GET RECOVERIES BY STATUS
// =========================================================
export const getRecoveriesByStatus = async (status) => {
  const response = await api.get(
    `/cost-recovery/status/${status}`
  );
  return response.data;
};

// =========================================================
// 10. GET RECOVERIES BY DATE
// =========================================================
export const getRecoveriesByDate = async (date) => {
  const response = await api.get(
    `/cost-recovery/date/${date}`
  );
  return response.data;
};

// =========================================================
// 11. GET RECOVERIES BY DATE RANGE
// =========================================================
export const getRecoveriesByDateRange = async (
  startDate,
  endDate
) => {
  const response = await api.get(
    "/cost-recovery/date-range",
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
// 12. GET DEPARTMENT RECOVERIES BY STATUS
// =========================================================
export const getDepartmentRecoveriesByStatus = async (
  departmentId,
  status
) => {
  const response = await api.get(
    `/cost-recovery/department/${departmentId}/status/${status}`
  );

  return response.data;
};

// =========================================================
// 13. GET INSTITUTION RECOVERIES BY STATUS
// =========================================================
export const getInstitutionRecoveriesByStatus = async (
  institutionId,
  status
) => {
  const response = await api.get(
    `/cost-recovery/institution/${institutionId}/status/${status}`
  );

  return response.data;
};

// =========================================================
// 14. GET EQUIPMENT RECOVERIES BY STATUS
// =========================================================
export const getEquipmentRecoveriesByStatus = async (
  equipmentId,
  status
) => {
  const response = await api.get(
    `/cost-recovery/equipment/${equipmentId}/status/${status}`
  );

  return response.data;
};

// =========================================================
// 15. GET DEPARTMENT RECOVERIES BY DATE RANGE
// =========================================================
export const getDepartmentRecoveriesByDateRange = async (
  departmentId,
  startDate,
  endDate
) => {
  const response = await api.get(
    `/cost-recovery/department/${departmentId}/date-range`,
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
// 16. GET INSTITUTION RECOVERIES BY DATE RANGE
// =========================================================
export const getInstitutionRecoveriesByDateRange = async (
  institutionId,
  startDate,
  endDate
) => {
  const response = await api.get(
    `/cost-recovery/institution/${institutionId}/date-range`,
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
// 17. GET RECOVERIES BY STATUS AND DATE RANGE
// =========================================================
export const getRecoveriesByStatusAndDateRange = async (
  status,
  startDate,
  endDate
) => {
  const response = await api.get(
    `/cost-recovery/status/${status}/date-range`,
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
// 18. CALCULATE OUTSTANDING AMOUNT
// =========================================================
export const calculateOutstandingAmount = async (
  recoverableAmount,
  recoveredAmount
) => {
  const response = await api.get(
    "/cost-recovery/calculate-outstanding",
    {
      params: {
        recoverableAmount,
        recoveredAmount,
      },
    }
  );

  return response.data;
};

// =========================================================
// 19. GET OUTSTANDING AMOUNT FOR RECOVERY
// =========================================================
export const calculateOutstandingForRecovery = async (id) => {
  const response = await api.get(
    `/cost-recovery/${id}/outstanding`
  );

  return response.data;
};

// =========================================================
// 20. UPDATE RECOVERED AMOUNT
// =========================================================
export const updateRecoveredAmount = async (
  id,
  recoveredAmount
) => {
  const response = await api.patch(
    `/cost-recovery/${id}/recovered-amount`,
    null,
    {
      params: {
        recoveredAmount,
      },
    }
  );

  return response.data;
};

// =========================================================
// 21. UPDATE CHARGEBACK STATUS
// =========================================================
export const updateChargebackStatus = async (
  id,
  status
) => {
  const response = await api.patch(
    `/cost-recovery/${id}/status`,
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
// 22. MARK AS RECOVERED
// =========================================================
export const markAsRecovered = async (id) => {
  const response = await api.patch(
    `/cost-recovery/${id}/mark-recovered`
  );

  return response.data;
};

// =========================================================
// 23. DELETE RECOVERY
// =========================================================
export const deleteRecovery = async (id) => {
  const response = await api.delete(
    `/cost-recovery/${id}`
  );

  return response.data;
};