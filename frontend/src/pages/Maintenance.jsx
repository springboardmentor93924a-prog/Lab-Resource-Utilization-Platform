import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  getAllWorkOrders,
  createWorkOrder,
  assignTechnician,
} from "../services/maintenanceService";
import { getAllEquipment } from "../services/equipmentService";
import { isAdmin } from "../utils/auth";

/* =========================================================
   TABLE HEADER STYLE
========================================================= */

const thStyle = {
  padding: "12px 16px",
  textAlign: "left",
  background: "#0F1B2D",
  color: "#FFFFFF",
  border: "1px solid #0F1B2D",
  fontSize: "14px",
  fontWeight: 700,
};

/* =========================================================
   TABLE DATA STYLE
========================================================= */

const tdStyle = {
  padding: "12px 16px",
  border: "1px solid #E2E8F0",
  color: "#0F172A",
  background: "#FFFFFF",
  fontSize: "14px",
  fontWeight: 500,
};

/* =========================================================
   STATUS COLORS
========================================================= */

function statusColor(status) {
  switch (status) {
    case "OPEN":
      return "#ef4444";

    case "IN_PROGRESS":
      return "#f59e0b";

    case "COMPLETED":
      return "#22c55e";

    default:
      return "#94a3b8";
  }
}

/* =========================================================
   DOWNTIME FORMAT
========================================================= */

function formatDowntime(minutes) {
  if (minutes == null) {
    return "—";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return remainingHours > 0
    ? `${days}d ${remainingHours}h`
    : `${days}d`;
}

/* =========================================================
   MAINTENANCE COMPONENT
========================================================= */

export default function Maintenance() {
  const [workOrders, setWorkOrders] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  /* Selected work order for View Details modal */
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

  const [form, setForm] = useState({
    equipmentId: "",
    issueDescription: "",
    priority: "MEDIUM",
  });

  const [technicianId, setTechnicianId] = useState({});

  const userIsAdmin = isAdmin();

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [wos, equipment] = await Promise.all([
        getAllWorkOrders(),
        getAllEquipment(),
      ]);

      setWorkOrders(wos);
      setEquipmentList(equipment);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     CREATE WORK ORDER
  ========================================================= */

  async function handleCreate() {
    if (!form.equipmentId || !form.issueDescription.trim()) {
      alert("Please select equipment and describe the issue.");
      return;
    }

    try {
      await createWorkOrder({
        equipmentId: Number(form.equipmentId),
        issueDescription: form.issueDescription,
        priority: form.priority,
      });

      alert(
        "Work order created. Equipment marked as under maintenance."
      );

      setForm({
        equipmentId: "",
        issueDescription: "",
        priority: "MEDIUM",
      });

      setShowForm(false);

      loadData();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to create work order."
      );
    }
  }

  /* =========================================================
     ASSIGN TECHNICIAN
  ========================================================= */

  async function handleAssign(id) {
    const techId = technicianId[id];

    if (!techId) {
      alert("Please paste the technician's user ID first.");
      return;
    }

    try {
      await assignTechnician(id, techId);

      alert("Technician assigned.");

      loadData();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to assign technician."
      );
    }
  }

  /* =========================================================
     COMPLETE WORK ORDER
  ========================================================= */



  /* =========================================================
     VIEW MAINTENANCE DETAILS
  ========================================================= */

  function handleViewDetails(workOrder) {
    setSelectedWorkOrder(workOrder);
  }

  function closeDetails() {
    setSelectedWorkOrder(null);
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        background: "#020b1c",
        color: "#ffffff",
      }}
    >

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className="sidebar"
        style={{
          flexShrink: 0,
        }}
      >
        <Sidebar />
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main
        style={{
          flex: 1,
          minHeight: "100vh",
          padding: "30px",
          background: "#020b1c",
          color: "#ffffff",
        }}
      >

        {/* ===================================================
            PAGE HEADER
        =================================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
          }}
        >
          <h2
            style={{
              fontWeight: 700,
              fontSize: "22px",
              color: "#FFFFFF",
              margin: 0,
            }}
          >
            Maintenance & work orders
          </h2>

          {/* LOG ISSUE BUTTON */}

          {userIsAdmin && (
            <button
              className="btn"
              onClick={() =>
                setShowForm((prev) => !prev)
              }
              style={{
                background: "#1557a8",
                color: "#FFFFFF",
                border: "1px solid #38bdf8",
                fontWeight: 600,
                borderRadius: "7px",
                padding: "9px 18px",
                cursor: "pointer",
              }}
            >
              {showForm ? "Cancel" : "+ Log an issue"}
            </button>
          )}
        </div>

        {/* ===================================================
            CREATE WORK ORDER FORM
        =================================================== */}

        {showForm && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "25px",
              boxShadow:
                "0 8px 25px rgba(0,0,0,0.25)",
              color: "#0F172A",
            }}
          >

            {/* EQUIPMENT */}

            <div
              style={{
                marginBottom: "15px",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#0F172A",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Equipment
              </label>

              <select
                className="form-select"
                value={form.equipmentId}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    equipmentId: e.target.value,
                  }))
                }
                style={{
                  color: "#0F172A",
                  background: "#FFFFFF",
                }}
              >
                <option value="">
                  Select equipment
                </option>

                {equipmentList.map((eq) => (
                  <option
                    key={eq.id}
                    value={eq.id}
                  >
                    {eq.equipmentName}
                  </option>
                ))}
              </select>
            </div>

            {/* ISSUE DESCRIPTION */}

            <div
              style={{
                marginBottom: "15px",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#0F172A",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Issue description
              </label>

              <textarea
                className="form-control"
                rows={3}
                value={form.issueDescription}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    issueDescription: e.target.value,
                  }))
                }
                style={{
                  color: "#0F172A",
                  background: "#FFFFFF",
                }}
              />
            </div>

            {/* PRIORITY */}

            <div
              style={{
                marginBottom: "15px",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#0F172A",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Priority
              </label>

              <select
                className="form-select"
                value={form.priority}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    priority: e.target.value,
                  }))
                }
                style={{
                  color: "#0F172A",
                  background: "#FFFFFF",
                }}
              >
                <option value="LOW">
                  Low
                </option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="HIGH">
                  High
                </option>
              </select>
            </div>

            {/* CREATE BUTTON */}

            <button
              className="btn"
              onClick={handleCreate}
              style={{
                background: "#0F1B2D",
                color: "#FFFFFF",
                border: "1px solid #315477",
                borderRadius: "7px",
                padding: "9px 18px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Create work order
            </button>
          </div>
        )}

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && (
          <p
            style={{
              color: "#FFFFFF",
              fontSize: "15px",
            }}
          >
            Loading work orders...
          </p>
        )}

        {/* ===================================================
            WORK ORDERS TABLE
        =================================================== */}

        {!loading && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow:
                "0 8px 25px rgba(0,0,0,0.25)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >

              {/* TABLE HEADER */}

              <thead>
                <tr>
                  <th style={thStyle}>
                    ID
                  </th>

                  <th style={thStyle}>
                    Equipment
                  </th>

                  <th style={thStyle}>
                    Issue
                  </th>

                  <th style={thStyle}>
                    Priority
                  </th>

                  <th style={thStyle}>
                    Status
                  </th>

                  <th style={thStyle}>
                    Assigned to
                  </th>

                  <th style={thStyle}>
                    Maintenance started
                  </th>

                  <th style={thStyle}>
                    Completed
                  </th>

                  <th style={thStyle}>
                    Downtime
                  </th>

                  <th style={thStyle}>
                    Service log
                  </th>

                  {/* ACTION IS NOW AVAILABLE TO EVERYONE */}

                  <th style={thStyle}>
                    Action
                  </th>
                </tr>
              </thead>

              {/* TABLE BODY */}

              <tbody>
                {workOrders.map((wo) => (
                  <tr key={wo.id}>

                    {/* ID */}

                    <td style={tdStyle}>
                      {wo.id}
                    </td>

                    {/* EQUIPMENT */}

                    <td style={tdStyle}>
                      {wo.equipmentName}
                    </td>

                    {/* ISSUE */}

                    <td style={tdStyle}>
                      {wo.issueDescription}
                    </td>

                    {/* PRIORITY */}

                    <td style={tdStyle}>
                      {wo.priority}
                    </td>

                    {/* STATUS */}

                    <td style={tdStyle}>
                      <span
                        style={{
                          background:
                            statusColor(
                              wo.status
                            ),
                          color: "#FFFFFF",
                          padding:
                            "5px 12px",
                          borderRadius:
                            "999px",
                          fontSize: "13px",
                          fontWeight: 600,
                          display:
                            "inline-block",
                        }}
                      >
                        {wo.status}
                      </span>
                    </td>

                    {/* ASSIGNED TO */}

                    <td style={tdStyle}>
                      {wo.assignedToName || "—"}
                    </td>

                    {/* MAINTENANCE STARTED */}

                    <td style={tdStyle}>
                      {wo.maintenanceStartedAt
                        ? new Date(
                            wo.maintenanceStartedAt
                          ).toLocaleString()
                        : "—"}
                    </td>

                    {/* COMPLETED */}

                    <td style={tdStyle}>
                      {wo.completedAt
                        ? new Date(
                            wo.completedAt
                          ).toLocaleString()
                        : "—"}
                    </td>

                    {/* DOWNTIME */}

                    <td style={tdStyle}>
                      {wo.downtimeMinutes != null
                        ? formatDowntime(
                            wo.downtimeMinutes
                          )
                        : "—"}
                    </td>

                    {/* SERVICE LOG */}

                    <td
                      style={{
                        ...tdStyle,
                        maxWidth: "280px",
                        whiteSpace: "normal",
                      }}
                    >
                      {wo.serviceLog || "—"}
                    </td>

                    {/* =================================================
                        ACTION
                    ================================================= */}

                    <td
                      style={{
                        ...tdStyle,
                        minWidth: "170px",
                      }}
                    >

                      {/* VIEW DETAILS BUTTON */}

                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          handleViewDetails(wo)
                        }
                        style={{
                          width: "100%",
                          marginBottom:
                            userIsAdmin &&
                            (wo.status === "OPEN" ||
                              wo.status ===
                                "IN_PROGRESS")
                              ? "8px"
                              : "0",
                          fontWeight: 600,
                          background: "#1557a8",
                          border:
                            "1px solid #38bdf8",
                          color: "#FFFFFF",
                          borderRadius: "6px",
                          padding: "7px 10px",
                        }}
                      >
                        <i className="bi bi-eye me-1"></i>
                        View Details
                      </button>

                      {/* ADMIN ACTIONS */}

                      {userIsAdmin &&
                        wo.status === "OPEN" && (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "6px",
                            }}
                          >
                            <input
                              type="text"
                              placeholder="Technician user ID"
                              value={
                                technicianId[
                                  wo.id
                                ] || ""
                              }
                              onChange={(e) =>
                                setTechnicianId(
                                  (prev) => ({
                                    ...prev,
                                    [wo.id]:
                                      e.target.value,
                                  })
                                )
                              }
                              style={{
                                width: "100%",
                                fontSize: "12px",
                                padding: "6px",
                                border:
                                  "1px solid #CBD5E1",
                                borderRadius:
                                  "5px",
                                color: "#0F172A",
                                background:
                                  "#FFFFFF",
                                outline: "none",
                              }}
                            />

                            <button
                              className="btn btn-outline-dark btn-sm"
                              onClick={() =>
                                handleAssign(
                                  wo.id
                                )
                              }
                            >
                              Assign
                            </button>
                          </div>
                        )}

                      {/* ADMIN MARK COMPLETE */}

                    
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* =========================================================
          MAINTENANCE DETAILS MODAL
      ========================================================= */}

      {selectedWorkOrder && (
        <div
          onClick={closeDetails}
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0, 0, 0, 0.70)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          {/* MODAL BOX */}

          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width: "min(700px, 95vw)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#FFFFFF",
              borderRadius: "14px",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.45)",
              color: "#0F172A",
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                padding: "20px 24px",
                background: "#0F1B2D",
                color: "#FFFFFF",
                borderRadius:
                  "14px 14px 0 0",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: 700,
                  }}
                >
                  Maintenance Details
                </h3>

                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "13px",
                    color: "#94A3B8",
                  }}
                >
                  Work Order #{selectedWorkOrder.id}
                </div>
              </div>

              <button
                onClick={closeDetails}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  border: "1px solid #64748B",
                  background: "transparent",
                  color: "#FFFFFF",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}

            <div
              style={{
                padding: "24px",
              }}
            >

              {/* EQUIPMENT + STATUS */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    padding: "15px",
                    background: "#F8FAFC",
                    borderRadius: "10px",
                    border:
                      "1px solid #E2E8F0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748B",
                      marginBottom: "5px",
                    }}
                  >
                    Equipment
                  </div>

                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                    }}
                  >
                    {selectedWorkOrder.equipmentName}
                  </div>
                </div>

                <div
                  style={{
                    padding: "15px",
                    background: "#F8FAFC",
                    borderRadius: "10px",
                    border:
                      "1px solid #E2E8F0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748B",
                      marginBottom: "5px",
                    }}
                  >
                    Status
                  </div>

                  <span
                    style={{
                      background:
                        statusColor(
                          selectedWorkOrder.status
                        ),
                      color: "#FFFFFF",
                      padding:
                        "6px 12px",
                      borderRadius:
                        "999px",
                      fontSize: "13px",
                      fontWeight: 700,
                      display:
                        "inline-block",
                    }}
                  >
                    {selectedWorkOrder.status}
                  </span>
                </div>
              </div>

              {/* DETAIL GRID */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "18px",
                }}
              >

                <DetailItem
                  label="Work Order ID"
                  value={
                    selectedWorkOrder.id
                  }
                />

                <DetailItem
                  label="Priority"
                  value={
                    selectedWorkOrder.priority
                  }
                />

                <DetailItem
                  label="Assigned To"
                  value={
                    selectedWorkOrder.assignedToName ||
                    "Not assigned"
                  }
                />

                <DetailItem
                  label="Reported By"
                  value={
                    selectedWorkOrder.reportedByName ||
                    "—"
                  }
                />

                <DetailItem
                  label="Maintenance Started"
                  value={
                    selectedWorkOrder.maintenanceStartedAt
                      ? new Date(
                          selectedWorkOrder.maintenanceStartedAt
                        ).toLocaleString()
                      : "—"
                  }
                />

                <DetailItem
                  label="Completed At"
                  value={
                    selectedWorkOrder.completedAt
                      ? new Date(
                          selectedWorkOrder.completedAt
                        ).toLocaleString()
                      : "Not completed"
                  }
                />

                <DetailItem
                  label="Downtime"
                  value={
                    selectedWorkOrder.downtimeMinutes !=
                    null
                      ? formatDowntime(
                          selectedWorkOrder.downtimeMinutes
                        )
                      : "—"
                  }
                />

                <DetailItem
                  label="Created At"
                  value={
                    selectedWorkOrder.createdAt
                      ? new Date(
                          selectedWorkOrder.createdAt
                        ).toLocaleString()
                      : "—"
                  }
                />

              </div>

              {/* ISSUE */}

              <div
                style={{
                  marginTop: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: "7px",
                  }}
                >
                  Issue Description
                </div>

                <div
                  style={{
                    background: "#F8FAFC",
                    border:
                      "1px solid #E2E8F0",
                    borderRadius: "8px",
                    padding: "14px",
                    lineHeight: "1.6",
                    whiteSpace:
                      "pre-wrap",
                  }}
                >
                  {selectedWorkOrder.issueDescription ||
                    "—"}
                </div>
              </div>

              {/* SERVICE LOG */}

              <div
                style={{
                  marginTop: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: "7px",
                  }}
                >
                  Service / Maintenance Log
                </div>

                <div
                  style={{
                    background:
                      selectedWorkOrder.serviceLog
                        ? "#F0FDF4"
                        : "#F8FAFC",
                    border:
                      "1px solid #E2E8F0",
                    borderRadius: "8px",
                    padding: "14px",
                    lineHeight: "1.6",
                    whiteSpace:
                      "pre-wrap",
                  }}
                >
                  {selectedWorkOrder.serviceLog ||
                    "No service log has been added yet."}
                </div>
              </div>

            </div>

            {/* MODAL FOOTER */}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "15px 24px",
                borderTop:
                  "1px solid #E2E8F0",
              }}
            >
              <button
                onClick={closeDetails}
                className="btn btn-dark"
                style={{
                  padding: "8px 20px",
                  fontWeight: 600,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   REUSABLE DETAIL ITEM
========================================================= */

function DetailItem({ label, value }) {
  return (
    <div
      style={{
        paddingBottom: "12px",
        borderBottom:
          "1px solid #E2E8F0",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#64748B",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "#0F172A",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}