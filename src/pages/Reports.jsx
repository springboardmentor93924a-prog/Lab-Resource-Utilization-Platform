import { useEffect, useState } from "react";
import { getUtilizationAnalytics } from "../api/utilizationApi";
import { getAllMaintenanceRequests } from "../api/maintenanceApi";
import { getAllCosts } from "../api/costApi";
import { extractErrorMessage } from "../api/client";
import { page, headerRow, h1Style, subStyle, card, thStyle, tdStyle, errorText, emptyText, pill } from "../styles/shared";

const ANALYTICS_ROLES = ["SYSTEM_ADMIN", "INSTITUTION_ADMIN", "DEPARTMENT_HEAD", "LAB_MANAGER", "LAB_TECHNICIAN"];
const COST_ROLES = ["SYSTEM_ADMIN", "INSTITUTION_ADMIN"];

function Reports({ userRole }) {
  const [tab, setTab] = useState("utilization");
  const [utilization, setUtilization] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    const tasks = [getAllMaintenanceRequests().then(setMaintenance).catch(() => {})];
    if (ANALYTICS_ROLES.includes(userRole)) {
      tasks.push(getUtilizationAnalytics().then(setUtilization).catch(() => {}));
    }
    if (COST_ROLES.includes(userRole)) {
      tasks.push(getAllCosts().then(setCosts).catch(() => {}));
    }
    Promise.allSettled(tasks)
      .then((results) => {
        const failed = results.find((r) => r.status === "rejected");
        if (failed) setError(extractErrorMessage(failed.reason, "Some report data failed to load."));
      })
      .finally(() => setLoading(false));
  }, [userRole]);

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>Reports</h1>
          <p style={subStyle}>Utilization, maintenance, and cost reports</p>
        </div>
      </div>

      {error && <p style={errorText}>{error}</p>}

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button onClick={() => setTab("utilization")} style={tab === "utilization" ? tabBtnActive : tabBtn}>Utilization</button>
        <button onClick={() => setTab("maintenance")} style={tab === "maintenance" ? tabBtnActive : tabBtn}>Maintenance</button>
        {COST_ROLES.includes(userRole) && (
          <button onClick={() => setTab("cost")} style={tab === "cost" ? tabBtnActive : tabBtn}>Cost</button>
        )}
      </div>

      {tab === "utilization" && (
        <div style={card}>
          <div style={{ overflowX: "auto" }}>
            {loading ? <p style={{ padding: 20 }}>Loading...</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={thStyle}>Equipment</th>
                    <th style={thStyle}>Utilization %</th>
                    <th style={thStyle}>Usage Hours</th>
                    <th style={thStyle}>Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {utilization.map((u) => (
                    <tr key={u.equipId} style={{ borderBottom: "1px solid #f0f2f6" }}>
                      <td style={tdStyle}>{u.equipName}</td>
                      <td style={tdStyle}>{u.utilizationPercentage?.toFixed(1)}%</td>
                      <td style={tdStyle}>{u.totalUsageHours?.toFixed(1)}</td>
                      <td style={tdStyle}>{u.bookingCount}</td>
                    </tr>
                  ))}
                  {utilization.length === 0 && <tr><td colSpan={4} style={emptyText}>No utilization data.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === "maintenance" && (
        <div style={card}>
          <div style={{ overflowX: "auto" }}>
            {loading ? <p style={{ padding: 20 }}>Loading...</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={thStyle}>Equipment</th>
                    <th style={thStyle}>Reason</th>
                    <th style={thStyle}>Priority</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenance.map((m) => (
                    <tr key={m.requestId} style={{ borderBottom: "1px solid #f0f2f6" }}>
                      <td style={tdStyle}>{m.equipment?.equipName || "-"}</td>
                      <td style={tdStyle}>{m.reason}</td>
                      <td style={tdStyle}>{m.priority}</td>
                      <td style={tdStyle}>
                        <span style={m.status === "APPROVED" ? pill("#e8f7ee", "#16834b") : m.status === "REJECTED" ? pill("#fdecec", "#c0392b") : pill("#fff4df", "#b56a00")}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {maintenance.length === 0 && <tr><td colSpan={4} style={emptyText}>No maintenance records.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === "cost" && COST_ROLES.includes(userRole) && (
        <div style={card}>
          <div style={{ overflowX: "auto" }}>
            {loading ? <p style={{ padding: 20 }}>Loading...</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={thStyle}>Equipment</th>
                    <th style={thStyle}>Department</th>
                    <th style={thStyle}>Hours Used</th>
                    <th style={thStyle}>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {costs.map((c) => (
                    <tr key={c.costId} style={{ borderBottom: "1px solid #f0f2f6" }}>
                      <td style={tdStyle}>{c.equipName}</td>
                      <td style={tdStyle}>{c.departmentName}</td>
                      <td style={tdStyle}>{c.hoursUsed}</td>
                      <td style={tdStyle}>₹{Number(c.totalCost || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  {costs.length === 0 && <tr><td colSpan={4} style={emptyText}>No cost records.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const tabBtn = { padding: "9px 16px", borderRadius: 7, border: "1px solid #d9dfe8", background: "white", color: "#475569", fontSize: 13, cursor: "pointer" };
const tabBtnActive = { ...tabBtn, background: "#2563eb", borderColor: "#2563eb", color: "white", fontWeight: 600 };

export default Reports;
