
import axios from "axios";
import api from "./api";

// __define-ocg__

// const API_BASE_URL = "http://localhost:8080/api/maintenance";
const API_BASE_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:8080"
}/api/maintenance`;

const maintenanceApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// AUTH TOKEN
// ============================================================

maintenanceApi.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") 
      // localStorage.getItem("authToken") ||
      // localStorage.getItem("jwt");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// 1. CREATE MAINTENANCE REQUEST
// POST /api/maintenance/requests
//
// Controller:
// @RequestParam Long equipmentId
// @RequestParam String description
// @RequestParam MaintenancePriority priority
// @RequestParam String notes
// ============================================================

export const createMaintenanceRequest = async ({
  equipmentId,
  description,
  priority,
  notes,
}) => {
  const response = await maintenanceApi.post(
    "/requests",
    null,
    {
      params: {
        equipmentId,
        description,
        priority,
        notes,
      },
    }
  );

  return response.data;
};

// ============================================================
// 2. GET ALL MAINTENANCE REQUESTS
// GET /api/maintenance/requests
// ============================================================

export const getAllMaintenanceRequests = async () => {
  const response = await maintenanceApi.get(
    "/requests"
  );

  return response.data;
};

// ============================================================
// 3. GET MAINTENANCE REQUEST BY ID
// GET /api/maintenance/requests/{id}
// ============================================================

export const getMaintenanceRequestById = async (id) => {
  const response = await maintenanceApi.get(
    `/requests/${id}`
  );

  return response.data;
};

// ============================================================
// 4. GET REQUESTS BY STATUS
// GET /api/maintenance/requests/status/{status}
// ============================================================

export const getMaintenanceRequestsByStatus = async (
  status
) => {
  const response = await maintenanceApi.get(
    `/requests/status/${status}`
  );

  return response.data;
};

// ============================================================
// 5. GET REQUESTS BY EQUIPMENT
// GET /api/maintenance/requests/equipment/{equipmentId}
// ============================================================

export const getMaintenanceRequestsByEquipment = async (
  equipmentId
) => {
  const response = await maintenanceApi.get(
    `/requests/equipment/${equipmentId}`
  );

  return response.data;
};

// ============================================================
// 6. UPDATE MAINTENANCE REQUEST STATUS
// PUT /api/maintenance/requests/{id}/status
//
// @RequestParam MaintenanceRequestStatus status
// ============================================================

export const updateMaintenanceRequestStatus = async (
  id,
  status
) => {
  const response = await maintenanceApi.put(
    `/requests/${id}/status`,
    null,
    {
      params: {
        status,
      },
    }
  );

  return response.data;
};

// ============================================================
// 7. CREATE WORK ORDER
// POST /api/maintenance/work-orders
//
// @RequestParam Long maintenanceRequestId
// @RequestParam String workDescription
// @RequestParam String scheduledStart
// @RequestParam String scheduledEnd
// ============================================================

export const createWorkOrder = async ({
  maintenanceRequestId,
  workDescription,
  scheduledStart,
  scheduledEnd,
}) => {
  const response = await maintenanceApi.post(
    "/work-orders",
    null,
    {
      params: {
        maintenanceRequestId,
        workDescription,
        scheduledStart,
        scheduledEnd,
      },
    }
  );

  return response.data;
};

// ============================================================
// 8. GET ALL WORK ORDERS
// GET /api/maintenance/work-orders
// ============================================================

export const getAllWorkOrders = async () => {
  const response = await maintenanceApi.get(
    "/work-orders"
  );

  return response.data;
};

// ============================================================
// 9. GET WORK ORDER BY ID
// GET /api/maintenance/work-orders/{id}
// ============================================================

export const getWorkOrderById = async (id) => {
  const response = await maintenanceApi.get(
    `/work-orders/${id}`
  );

  return response.data;
};

// ============================================================
// 10. GET WORK ORDERS BY STATUS
// GET /api/maintenance/work-orders/status/{status}
// ============================================================

export const getWorkOrdersByStatus = async (
  status
) => {
  const response = await maintenanceApi.get(
    `/work-orders/status/${status}`
  );

  return response.data;
};

// ============================================================
// 11. GET WORK ORDERS BY TECHNICIAN
// GET /api/maintenance/work-orders/technician/{technicianId}
// ============================================================

export const getWorkOrdersByTechnician = async (
  technicianId
) => {
  const response = await maintenanceApi.get(
    `/work-orders/technician/${technicianId}`
  );

  return response.data;
};

// ============================================================
// 12. ASSIGN TECHNICIAN
// PUT /api/maintenance/work-orders/{id}/assign/{technicianId}
// ============================================================

export const assignTechnician = async (
  workOrderId,
  technicianId
) => {
  const response = await maintenanceApi.put(
    `/work-orders/${workOrderId}/assign/${technicianId}`
  );

  return response.data;
};

// ============================================================
// 13. UPDATE WORK ORDER STATUS
// PUT /api/maintenance/work-orders/{id}/status
//
// @RequestParam WorkOrderStatus status
// ============================================================

export const updateWorkOrderStatus = async (
  id,
  status
) => {
  const response = await maintenanceApi.put(
    `/work-orders/${id}/status`,
    null,
    {
      params: {
        status,
      },
    }
  );

  return response.data;
};

// ============================================================
// 14. START WORK ORDER
// PUT /api/maintenance/work-orders/{id}/start
// ============================================================

export const startWorkOrder = async (id) => {
  const response = await maintenanceApi.put(
    `/work-orders/${id}/start`
  );

  return response.data;
};

// ============================================================
// 15. COMPLETE WORK ORDER
// PUT /api/maintenance/work-orders/{id}/complete
//
// @RequestParam(required = false) String completionNotes
// ============================================================

export const completeWorkOrder = async (
  id,
  completionNotes
) => {
  const response = await maintenanceApi.put(
    `/work-orders/${id}/complete`,
    null,
    {
      params: {
        completionNotes,
      },
    }
  );

  return response.data;
};

// ============================================================
// 16. CALCULATE DOWNTIME
// GET /api/maintenance/work-orders/{id}/downtime
// ============================================================

export const calculateDowntime = async (id) => {
  const response = await maintenanceApi.get(
    `/work-orders/${id}/downtime`
  );

  return response.data;
};

export const getTechnicians = async () => {

    const response = await api.get(
        "/admin/users/technicians"
    );

    return response.data;
};


// ============================================================
// 17. GET DOWNTIME DETAILS
// GET /api/maintenance/work-orders/{id}/downtime
// ============================================================

export const getDowntimeDetails = async (workOrderId) => {
  const response = await maintenanceApi.get(
    `/work-orders/${workOrderId}/downtime`
  );

  return response.data;
};


// ============================================================
// 18. GET EQUIPMENT MAINTENANCE HISTORY
// GET /api/maintenance/requests/equipment/{equipmentId}
// ============================================================

export const getEquipmentMaintenanceHistory = async (
  equipmentId
) => {
  const response = await maintenanceApi.get(
    `/requests/equipment/${equipmentId}`
  );

  return response.data;
};


// ============================================================
// 19. CALCULATE DOWNTIME HOURS
// ============================================================

export const calculateDowntimeHours = (
  actualStart,
  actualEnd
) => {
  if (!actualStart) {
    return 0;
  }

  const start = new Date(actualStart);

  const end = actualEnd
    ? new Date(actualEnd)
    : new Date();

  const difference =
    end.getTime() - start.getTime();

  if (difference <= 0) {
    return 0;
  }

  return difference / (1000 * 60 * 60);
};


// ============================================================
// 20. FORMAT DOWNTIME
// ============================================================

export const formatDowntime = (
  actualStart,
  actualEnd
) => {
  const hours = calculateDowntimeHours(
    actualStart,
    actualEnd
  );

  if (hours === 0) {
    return "0 hrs";
  }

  if (hours < 1) {
    const minutes = Math.round(hours * 60);

    return `${minutes} min`;
  }

  return `${hours.toFixed(2)} hrs`;
};



// ============================================================
// DEFAULT EXPORT
// ============================================================

const varOcg = {
  createMaintenanceRequest,
  getAllMaintenanceRequests,
  getMaintenanceRequestById,
  getMaintenanceRequestsByStatus,
  getMaintenanceRequestsByEquipment,
  updateMaintenanceRequestStatus,

  createWorkOrder,
  getAllWorkOrders,
  getWorkOrderById,
  getWorkOrdersByStatus,
  getWorkOrdersByTechnician,

  assignTechnician,
  updateWorkOrderStatus,
  startWorkOrder,
  completeWorkOrder,
  calculateDowntime,

  getTechnicians,

  // Downtime & History 
  getDowntimeDetails, 
  getEquipmentMaintenanceHistory, 
  calculateDowntimeHours, 
  formatDowntime
};

export default varOcg;
