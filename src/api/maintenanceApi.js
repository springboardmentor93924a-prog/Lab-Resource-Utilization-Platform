import apiClient from "./client";

// ---- Maintenance requests: /api/maintenance/requests (query params, NOT a JSON body) ----

// POST /api/maintenance/requests/create?equipmentId=&reason=&priority=&duration=
export function createMaintenanceRequest({ equipmentId, reason, priority, duration }) {
  return apiClient
    .post("/api/maintenance/requests/create", null, {
      params: { equipmentId, reason, priority, duration },
    })
    .then((res) => res.data);
}

// PUT /api/maintenance/requests/approve/{requestId}
export function approveMaintenanceRequest(requestId) {
  return apiClient
    .put(`/api/maintenance/requests/approve/${requestId}`)
    .then((res) => res.data);
}

// PUT /api/maintenance/requests/reject/{requestId}
export function rejectMaintenanceRequest(requestId) {
  return apiClient
    .put(`/api/maintenance/requests/reject/${requestId}`)
    .then((res) => res.data);
}

// GET /api/maintenance/requests/{requestId}
export function getMaintenanceRequest(requestId) {
  return apiClient.get(`/api/maintenance/requests/${requestId}`).then((res) => res.data);
}

// GET /api/maintenance/requests
export function getAllMaintenanceRequests() {
  return apiClient.get("/api/maintenance/requests").then((res) => res.data);
}

// ---- Maintenance schedules: /api/maintenance/schedules (query params) ----

// POST /api/maintenance/schedules/create?requestId=&start=&end=
export function createMaintenanceSchedule({ requestId, start, end }) {
  return apiClient
    .post("/api/maintenance/schedules/create", null, {
      params: { requestId, start, end },
    })
    .then((res) => res.data);
}

// GET /api/maintenance/schedules/{scheduleId}
export function getMaintenanceSchedule(scheduleId) {
  return apiClient.get(`/api/maintenance/schedules/${scheduleId}`).then((res) => res.data);
}

// GET /api/maintenance/schedules/equipment/{equipmentId}
export function getEquipmentSchedules(equipmentId) {
  return apiClient
    .get(`/api/maintenance/schedules/equipment/${equipmentId}`)
    .then((res) => res.data);
}

// ---- Work orders: /api/maintenance/work-orders ----

// POST /api/maintenance/work-orders/create?scheduleId=&description=
export function createWorkOrder({ scheduleId, description }) {
  return apiClient
    .post("/api/maintenance/work-orders/create", null, {
      params: { scheduleId, description },
    })
    .then((res) => res.data);
}

// PUT /api/maintenance/work-orders/assign/{workOrderId}/{technicianId}
export function assignTechnician(workOrderId, technicianId) {
  return apiClient
    .put(`/api/maintenance/work-orders/assign/${workOrderId}/${technicianId}`)
    .then((res) => res.data);
}

// PUT /api/maintenance/work-orders/start/{workOrderId}
export function startWorkOrder(workOrderId) {
  return apiClient
    .put(`/api/maintenance/work-orders/start/${workOrderId}`)
    .then((res) => res.data);
}

// PUT /api/maintenance/work-orders/complete/{workOrderId}
export function completeWorkOrder(workOrderId) {
  return apiClient
    .put(`/api/maintenance/work-orders/complete/${workOrderId}`)
    .then((res) => res.data);
}

// GET /api/maintenance/work-orders/{workOrderId}
export function getWorkOrder(workOrderId) {
  return apiClient.get(`/api/maintenance/work-orders/${workOrderId}`).then((res) => res.data);
}

// GET /api/maintenance/work-orders/technician/{technicianId}
export function getTechnicianWorkOrders(technicianId) {
  return apiClient
    .get(`/api/maintenance/work-orders/technician/${technicianId}`)
    .then((res) => res.data);
}
