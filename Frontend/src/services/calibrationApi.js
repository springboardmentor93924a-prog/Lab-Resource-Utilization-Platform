import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/calibration";

// =========================================================
// Calibration API instance
// =========================================================

const calibrationApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================================================
// JWT Authorization
// =========================================================

calibrationApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =========================================================
// 1. CREATE CALIBRATION
// POST /api/calibration
// =========================================================

export const createCalibration = async (calibration) => {
  const response = await calibrationApi.post(
    "",
    calibration
  );

  return response.data;
};

// =========================================================
// 2. GET ALL CALIBRATIONS
// GET /api/calibration
// =========================================================

export const getAllCalibrations = async () => {
  const response = await calibrationApi.get("");

  return response.data;
};

// =========================================================
// 3. GET CALIBRATION BY ID
// GET /api/calibration/{id}
// =========================================================

export const getCalibrationById = async (id) => {
  const response = await calibrationApi.get(`/${id}`);

  return response.data;
};

// =========================================================
// 4. GET CALIBRATION HISTORY BY EQUIPMENT
// GET /api/calibration/equipment/{equipmentId}
// =========================================================

export const getCalibrationsByEquipment = async (
  equipmentId
) => {
  const response = await calibrationApi.get(
    `/equipment/${equipmentId}`
  );

  return response.data;
};

// =========================================================
// 5. UPDATE CALIBRATION
// PUT /api/calibration/{id}
// =========================================================

export const updateCalibration = async (
  id,
  calibration
) => {
  const response = await calibrationApi.put(
    `/${id}`,
    calibration
  );

  return response.data;
};

// =========================================================
// 6. DELETE CALIBRATION
// DELETE /api/calibration/{id}
// =========================================================

export const deleteCalibration = async (id) => {
  const response = await calibrationApi.delete(
    `/${id}`
  );

  return response.data;
};

// =========================================================
// 7. UPCOMING CALIBRATIONS
// GET /api/calibration/upcoming
// =========================================================

export const getUpcomingCalibrations = async (
  startDate,
  endDate
) => {
  const response = await calibrationApi.get(
    "/upcoming",
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
// 8. EXPIRED CALIBRATIONS
// GET /api/calibration/expired
// =========================================================

export const getExpiredCalibrations = async (
  date
) => {
  const response = await calibrationApi.get(
    "/expired",
    {
      params: date ? { date } : {},
    }
  );

  return response.data;
};

// =========================================================
// 9. UPCOMING CERTIFICATIONS
// GET /api/calibration/certifications/upcoming
// =========================================================

export const getUpcomingCertifications = async (
  startDate,
  endDate
) => {
  const response = await calibrationApi.get(
    "/certifications/upcoming",
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
// 10. EXPIRED CERTIFICATIONS
// GET /api/calibration/certifications/expired
// =========================================================

export const getExpiredCertifications = async (
  date
) => {
  const response = await calibrationApi.get(
    "/certifications/expired",
    {
      params: date ? { date } : {},
    }
  );

  return response.data;
};

// =========================================================
// 11. CALIBRATION REMINDERS
// GET /api/calibration/reminders
// =========================================================

export const getCalibrationReminders = async () => {
  const response = await calibrationApi.get(
    "/reminders"
  );

  return response.data;
};

// =========================================================
// 12. CERTIFICATION REMINDERS
// GET /api/calibration/certification-reminders
// =========================================================

export const getCertificationReminders = async () => {
  const response = await calibrationApi.get(
    "/certification-reminders"
  );

  return response.data;
};

// =========================================================
// Export API object
// =========================================================

const varOcg = {
  createCalibration,
  getAllCalibrations,
  getCalibrationById,
  getCalibrationsByEquipment,
  updateCalibration,
  deleteCalibration,
  getUpcomingCalibrations,
  getExpiredCalibrations,
  getUpcomingCertifications,
  getExpiredCertifications,
  getCalibrationReminders,
  getCertificationReminders,
};

export default varOcg;