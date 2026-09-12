import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  getAllWorkOrders,
  createWorkOrder,
  assignTechnician,
  markComplete,
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
    case "Scheduled":
      return "#ef4444";

    case "In Progress":
      return "#f59e0b";

    case "Completed":
      return "#22c55e";

    default:
      return "#94a3b8";
  }
}

/* =========================================================
   MAINTENANCE COMPONENT
========================================================= */

export default function Maintenance() {
  const [workOrders, setWorkOrders] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

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

  async function handleComplete(id) {
    try {
      await markComplete(id);

      alert("Work order marked complete.");

      loadData();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to mark complete."
      );
    }
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
                    key={eq.equipmentId}
                    value={eq.equipmentId}
                  >
                    {eq.name}
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
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
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

                  {userIsAdmin && (
                    <th style={thStyle}>
                      Action
                    </th>
                  )}
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
                      {wo.assignedToName ||
                        "—"}
                    </td>

                    {/* ACTION */}

                    {userIsAdmin && (
                      <td style={tdStyle}>
                        {/* OPEN → ASSIGN */}

                        {wo.status === "Scheduled" && (
                          <div
                            style={{
                              display:
                                "flex",
                              gap: "6px",
                              alignItems:
                                "center",
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
                                      e.target
                                        .value,
                                  })
                                )
                              }
                              style={{
                                width: "160px",
                                fontSize:
                                  "12px",
                                padding:
                                  "6px",
                                border:
                                  "1px solid #CBD5E1",
                                borderRadius:
                                  "5px",
                                color:
                                  "#0F172A",
                                background:
                                  "#FFFFFF",
                                outline:
                                  "none",
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

                        {/* IN_PROGRESS → COMPLETE */}

                        {wo.status === "In Progress" && (
                          <button
                            className="btn btn-outline-dark btn-sm"
                            onClick={() =>
                              handleComplete(
                                wo.id
                              )
                            }
                          >
                            Mark complete
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
