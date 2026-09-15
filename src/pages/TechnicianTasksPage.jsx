import { useEffect, useState } from "react";
import { getTechnicianWorkOrders, startWorkOrder, completeWorkOrder } from "../api/maintenanceApi";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { page, headerRow, h1Style, subStyle, card, thStyle, tdStyle, actionBtn, errorText, emptyText, pill } from "../styles/shared";

function TechnicianTasksPage({ showToast }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    if (!user?.userId) return;
    setLoading(true);
    getTechnicianWorkOrders(user.userId)
      .then(setOrders)
      .catch((err) => setError(extractErrorMessage(err, "Failed to load your work orders.")))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user?.userId]);

  const runAction = async (action, id, successMsg) => {
    try {
      await action(id);
      showToast?.(successMsg, "success");
      load();
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Action failed."), "warning");
    }
  };

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>My Work Orders</h1>
          <p style={subStyle}>Maintenance work orders assigned to you</p>
        </div>
      </div>

      {error && <p style={errorText}>{error}</p>}

      <div style={card}>
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <p style={{ padding: 20 }}>Loading work orders...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 850 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Equipment</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Started</th>
                  <th style={thStyle}>Completed</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.workOrderId} style={{ borderBottom: "1px solid #f0f2f6" }}>
                    <td style={tdStyle}>#{o.workOrderId}</td>
                    <td style={tdStyle}>{o.equipment?.equipName || o.equipment?.equipId}</td>
                    <td style={tdStyle}>{o.description}</td>
                    <td style={tdStyle}>
                      <span style={
                        o.status === "COMPLETED" ? pill("#e8f7ee", "#16834b") :
                        o.status === "IN_PROGRESS" ? pill("#eaf2ff", "#2563eb") :
                        pill("#fff4df", "#b56a00")
                      }>
                        {o.status}
                      </span>
                    </td>
                    <td style={tdStyle}>{o.actualStart ? new Date(o.actualStart).toLocaleString() : "-"}</td>
                    <td style={tdStyle}>{o.actualEnd ? new Date(o.actualEnd).toLocaleString() : "-"}</td>
                    <td style={{ ...tdStyle, display: "flex", gap: 6 }}>
                      {(o.status === "CREATED" || o.status === "ASSIGNED") && (
                        <button onClick={() => runAction(startWorkOrder, o.workOrderId, `Work order #${o.workOrderId} started.`)} style={actionBtn}>Start</button>
                      )}
                      {o.status === "IN_PROGRESS" && (
                        <button onClick={() => runAction(completeWorkOrder, o.workOrderId, `Work order #${o.workOrderId} completed.`)} style={{ ...actionBtn, color: "#16834b" }}>Complete</button>
                      )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={7} style={emptyText}>No work orders assigned to you yet.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default TechnicianTasksPage;
