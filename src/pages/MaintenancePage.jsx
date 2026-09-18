import { useEffect, useState } from "react";
import {
  getAllMaintenanceRequests,
  createMaintenanceRequest,
  approveMaintenanceRequest,
  rejectMaintenanceRequest,
  createMaintenanceSchedule,
  createWorkOrder,
  assignTechnician,
} from "../api/maintenanceApi";
import { getAllEquipment } from "../api/equipmentApi";
import { extractErrorMessage } from "../api/client";
import { MAINTENANCE_PRIORITIES } from "../utils/constants";
import {
  page, headerRow, h1Style, subStyle, card, thStyle, tdStyle, actionBtn, primaryBtn,
  cancelBtn, modalOverlay, modalCard, labelStyle, inputStyle, errorText, emptyText, pill,
} from "../styles/shared";

const CREATE_ROLES = ["RESEARCHER", "LAB_MANAGER"];
const APPROVE_ROLES = ["LAB_MANAGER"];
const SCHEDULE_ROLES = ["LAB_MANAGER"];

function MaintenancePage({ userRole, showToast }) {
  const [requests, setRequests] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({ equipmentId: "", reason: "", priority: "MEDIUM", duration: "" });

  const [schedulingRequest, setSchedulingRequest] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({ start: "", end: "" });
  const [createdSchedule, setCreatedSchedule] = useState(null);
  const [workOrderForm, setWorkOrderForm] = useState({ description: "" });
  const [createdWorkOrder, setCreatedWorkOrder] = useState(null);
  const [technicianId, setTechnicianId] = useState("");

  const load = () => {
    setLoading(true);
    getAllMaintenanceRequests()
      .then(setRequests)
      .catch((err) => setError(extractErrorMessage(err, "Failed to load maintenance requests.")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getAllEquipment().then(setEquipment).catch(() => setEquipment([]));
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await createMaintenanceRequest({
        equipmentId: Number(requestForm.equipmentId),
        reason: requestForm.reason,
        priority: requestForm.priority,
        duration: Number(requestForm.duration),
      });
      showToast?.("Maintenance request submitted.", "success");
      setRequestForm({ equipmentId: "", reason: "", priority: "MEDIUM", duration: "" });
      setShowRequestForm(false);
      load();
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Failed to submit request."), "warning");
    }
  };

  const runAction = async (action, id, successMsg) => {
    try {
      await action(id);
      showToast?.(successMsg, "success");
      load();
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Action failed."), "warning");
    }
  };

  const openScheduling = (req) => {
    setSchedulingRequest(req);
    setScheduleForm({ start: "", end: "" });
    setCreatedSchedule(null);
    setCreatedWorkOrder(null);
    setWorkOrderForm({ description: "" });
    setTechnicianId("");
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      const schedule = await createMaintenanceSchedule({
        requestId: schedulingRequest.requestId,
        start: scheduleForm.start,
        end: scheduleForm.end,
      });
      setCreatedSchedule(schedule);
      showToast?.(`Schedule #${schedule.scheduleId} created.`, "success");
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Failed to create schedule."), "warning");
    }
  };

  const handleCreateWorkOrder = async (e) => {
    e.preventDefault();
    try {
      const order = await createWorkOrder({
        scheduleId: createdSchedule.scheduleId,
        description: workOrderForm.description,
      });
      setCreatedWorkOrder(order);
      showToast?.(`Work order #${order.workOrderId} created.`, "success");
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Failed to create work order."), "warning");
    }
  };

  const handleAssignTechnician = async (e) => {
    e.preventDefault();
    try {
      const order = await assignTechnician(createdWorkOrder.workOrderId, Number(technicianId));
      setCreatedWorkOrder(order);
      showToast?.("Technician assigned.", "success");
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Failed to assign technician."), "warning");
    }
  };

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>Maintenance Requests</h1>
          <p style={subStyle}>Submit and manage equipment maintenance requests</p>
        </div>
        {CREATE_ROLES.includes(userRole) && (
          <button onClick={() => setShowRequestForm(true)} style={primaryBtn}>+ New Request</button>
        )}
      </div>

      {error && <p style={errorText}>{error}</p>}

      <div style={card}>
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <p style={{ padding: 20 }}>Loading requests...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 950 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Equipment</th>
                  <th style={thStyle}>Requested By</th>
                  <th style={thStyle}>Reason</th>
                  <th style={thStyle}>Priority</th>
                  <th style={thStyle}>Duration (hrs)</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.requestId} style={{ borderBottom: "1px solid #f0f2f6" }}>
                    <td style={tdStyle}>#{r.requestId}</td>
                    <td style={tdStyle}>{r.equipment?.equipName || r.equipment?.equipId}</td>
                    <td style={tdStyle}>{r.requestedBy ? `${r.requestedBy.firstName} ${r.requestedBy.lastName}` : "-"}</td>
                    <td style={tdStyle}>{r.reason}</td>
                    <td style={tdStyle}>{r.priority}</td>
                    <td style={tdStyle}>{r.requiredDuration}</td>
                    <td style={tdStyle}>
                      <span style={r.status === "APPROVED" ? pill("#e8f7ee", "#16834b") : r.status === "REJECTED" ? pill("#fdecec", "#c0392b") : pill("#fff4df", "#b56a00")}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {APPROVE_ROLES.includes(userRole) && r.status === "PENDING" && (
                        <>
                          <button onClick={() => runAction(approveMaintenanceRequest, r.requestId, `Request #${r.requestId} approved.`)} style={{ ...actionBtn, color: "#16834b" }}>Approve</button>
                          <button onClick={() => runAction(rejectMaintenanceRequest, r.requestId, `Request #${r.requestId} rejected.`)} style={{ ...actionBtn, color: "#c0392b" }}>Reject</button>
                        </>
                      )}
                      {SCHEDULE_ROLES.includes(userRole) && r.status === "APPROVED" && (
                        <button onClick={() => openScheduling(r)} style={actionBtn}>Schedule & Assign</button>
                      )}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr><td colSpan={8} style={emptyText}>No maintenance requests yet.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showRequestForm && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 19 }}>New Maintenance Request</h2>
              <button onClick={() => setShowRequestForm(false)} style={{ border: "none", background: "none", fontSize: 19, cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleCreateRequest}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Equipment</label>
                <select required value={requestForm.equipmentId} onChange={(e) => setRequestForm({ ...requestForm, equipmentId: e.target.value })} style={inputStyle}>
                  <option value="">Select equipment</option>
                  {equipment.map((eq) => (
                    <option key={eq.equipmentId} value={eq.equipmentId}>{eq.equipmentName}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Reason</label>
                <input required value={requestForm.reason} onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Priority</label>
                <select value={requestForm.priority} onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value })} style={inputStyle}>
                  {MAINTENANCE_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Estimated Duration (hours)</label>
                <input type="number" required value={requestForm.duration} onChange={(e) => setRequestForm({ ...requestForm, duration: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 20 }}>
                <button type="button" onClick={() => setShowRequestForm(false)} style={cancelBtn}>Cancel</button>
                <button type="submit" style={primaryBtn}>Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {schedulingRequest && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 19 }}>Schedule Request #{schedulingRequest.requestId}</h2>
              <button onClick={() => setSchedulingRequest(null)} style={{ border: "none", background: "none", fontSize: 19, cursor: "pointer" }}>×</button>
            </div>

            {!createdSchedule && (
              <form onSubmit={handleCreateSchedule}>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>Step 1: Create a maintenance schedule.</p>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Start</label>
                  <input type="datetime-local" required value={scheduleForm.start} onChange={(e) => setScheduleForm({ ...scheduleForm, start: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>End</label>
                  <input type="datetime-local" required value={scheduleForm.end} onChange={(e) => setScheduleForm({ ...scheduleForm, end: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 9 }}>
                  <button type="button" onClick={() => setSchedulingRequest(null)} style={cancelBtn}>Cancel</button>
                  <button type="submit" style={primaryBtn}>Create Schedule</button>
                </div>
              </form>
            )}

            {createdSchedule && !createdWorkOrder && (
              <form onSubmit={handleCreateWorkOrder}>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
                  Step 2: Schedule #{createdSchedule.scheduleId} created. Now create a work order.
                </p>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Description</label>
                  <input required value={workOrderForm.description} onChange={(e) => setWorkOrderForm({ description: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 9 }}>
                  <button type="button" onClick={() => setSchedulingRequest(null)} style={cancelBtn}>Close</button>
                  <button type="submit" style={primaryBtn}>Create Work Order</button>
                </div>
              </form>
            )}

            {createdWorkOrder && (
              <form onSubmit={handleAssignTechnician}>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
                  Step 3: Work order #{createdWorkOrder.workOrderId} created (status: {createdWorkOrder.status}).
                  Assign a technician by their user ID.
                </p>
                <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>
                  There's no endpoint for Lab Managers to browse the technician list, so enter
                  the technician's numeric user ID directly (visible to Institution Admins on the Users page).
                </p>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Technician User ID</label>
                  <input type="number" required value={technicianId} onChange={(e) => setTechnicianId(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 9 }}>
                  <button type="button" onClick={() => setSchedulingRequest(null)} style={cancelBtn}>Done</button>
                  <button type="submit" style={primaryBtn}>Assign Technician</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MaintenancePage;
