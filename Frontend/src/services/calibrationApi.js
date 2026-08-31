import axios from "axios";

// ============================================================
// CALIBRATION API
// ============================================================

// __define-ocg__

const API_BASE_URL = "http://localhost:8080/api/calibration";

const calibrationApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// AUTH TOKEN
// ============================================================

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

// ============================================================
// 1. CREATE CALIBRATION
// POST /api/calibration
// ============================================================

export const createCalibration = async (calibration) => {
  const response = await calibrationApi.post(
    "",
    calibration
  );

  return response.data;
};

// ============================================================
// 2. GET ALL CALIBRATIONS
// GET /api/calibration
// ============================================================

export const getAllCalibrations = async () => {
  const response = await calibrationApi.get("");

  return response.data;
};

// ============================================================
// 3. GET CALIBRATION BY ID
// GET /api/calibration/{id}
// ============================================================

export const getCalibrationById = async (id) => {
  const response = await calibrationApi.get(
    `/${id}`
  );

  return response.data;
};

// ============================================================
// 4. GET CALIBRATION HISTORY BY EQUIPMENT
// GET /api/calibration/equipment/{equipmentId}
// ============================================================

export const getCalibrationsByEquipment = async (
  equipmentId
) => {
  const response = await calibrationApi.get(
    `/equipment/${equipmentId}`
  );

  return response.data;
};

// ============================================================
// 5. UPDATE CALIBRATION
// PUT /api/calibration/{id}
// ============================================================

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

// ============================================================
// 6. DELETE CALIBRATION
// DELETE /api/calibration/{id}
// ============================================================

export const deleteCalibration = async (id) => {
  const response = await calibrationApi.delete(
    `/${id}`
  );

  return response.data;
};

// ============================================================
// 7. GET UPCOMING CALIBRATIONS
// GET /api/calibration/upcoming
//
// startDate = YYYY-MM-DD
// endDate   = YYYY-MM-DD
// ============================================================

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

// ============================================================
// 8. GET EXPIRED CALIBRATIONS
// GET /api/calibration/expired
//
// date is optional
// ============================================================

export const getExpiredCalibrations = async (
  date
) => {
  const response = await calibrationApi.get(
    "/expired",
    {
      params: date
        ? {
            date,
          }
        : {},
    }
  );

  return response.data;
};

// ============================================================
// 9. GET UPCOMING CERTIFICATIONS
// GET /api/calibration/certifications/upcoming
// ============================================================

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

// ============================================================
// 10. GET EXPIRED CERTIFICATIONS
// GET /api/calibration/certifications/expired
//
// date is optional
// ============================================================

export const getExpiredCertifications = async (
  date
) => {
  const response = await calibrationApi.get(
    "/certifications/expired",
    {
      params: date
        ? {
            date,
          }
        : {},
    }
  );

  return response.data;
};

// ============================================================
// 11. GET CALIBRATION REMINDERS
// GET /api/calibration/reminders
//
// Uses backend's 30-day reminder window.
// ============================================================

export const getCalibrationReminders = async () => {
  const response = await calibrationApi.get(
    "/reminders"
  );

  return response.data;
};

// ============================================================
// 12. GET CERTIFICATION REMINDERS
// GET /api/calibration/certification-reminders
//
// Uses backend's 30-day reminder window.
// ============================================================

export const getCertificationReminders = async () => {
  const response = await calibrationApi.get(
    "/certification-reminders"
  );

  return response.data;
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

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