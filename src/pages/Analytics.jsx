import { useEffect, useState } from "react";
import { getUtilizationAnalytics } from "../api/utilizationApi";
import { getAllEquipment } from "../api/equipmentApi";
import { getAllBookings } from "../api/bookingApi";
import { getAllCosts } from "../api/costApi";
import { extractErrorMessage } from "../api/client";
import { page, headerRow, h1Style, subStyle, card, statsRow, statCardStyle, thStyle, tdStyle, errorText, emptyText, pill } from "../styles/shared";

const ANALYTICS_ROLES = ["SYSTEM_ADMIN", "INSTITUTION_ADMIN", "DEPARTMENT_HEAD", "LAB_MANAGER", "LAB_TECHNICIAN"];
const COST_ROLES = ["SYSTEM_ADMIN", "INSTITUTION_ADMIN"];

function Analytics({ userRole }) {
  const [analytics, setAnalytics] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    const tasks = [
      getAllEquipment().then(setEquipment).catch(() => {}),
      getAllBookings().then(setBookings).catch(() => {}),
    ];
    if (ANALYTICS_ROLES.includes(userRole)) {
      tasks.push(getUtilizationAnalytics().then(setAnalytics).catch(() => {}));
    }
    if (COST_ROLES.includes(userRole)) {
      tasks.push(getAllCosts().then(setCosts).catch(() => {}));
    }
    Promise.allSettled(tasks)
      .then((results) => {
        const failed = results.find((r) => r.status === "rejected");
        if (failed) setError(extractErrorMessage(failed.reason, "Some analytics data failed to load."));
      })
      .finally(() => setLoading(false));
  }, [userRole]);

  const statusBreakdown = equipment.reduce((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {});

  const bookingStatusBreakdown = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  const avgUtilization = analytics.length
    ? (analytics.reduce((s, a) => s + (a.utilizationPercentage || 0), 0) / analytics.length).toFixed(1)
    : null;

  const topUsed = [...analytics].sort((a, b) => (b.utilizationPercentage || 0) - (a.utilizationPercentage || 0)).slice(0, 8);
  const totalCost = costs.reduce((s, c) => s + Number(c.totalCost || 0), 0);

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>Analytics</h1>
          <p style={subStyle}>Cross-cutting view of equipment, bookings, and utilization</p>
        </div>
      </div>

      {error && <p style={errorText}>{error}</p>}

      <div style={statsRow}>
        <div style={statCardStyle}><div><p style={{ margin: "0 0 4px", color: "#718096", fontSize: 12 }}>Total Equipment</p><h2 style={{ margin: 0, fontSize: 22 }}>{equipment.length}</h2></div></div>
        <div style={statCardStyle}><div><p style={{ margin: "0 0 4px", color: "#718096", fontSize: 12 }}>Total Bookings</p><h2 style={{ margin: 0, fontSize: 22 }}>{bookings.length}</h2></div></div>
        {avgUtilization !== null && (
          <div style={statCardStyle}><div><p style={{ margin: "0 0 4px", color: "#718096", fontSize: 12 }}>Avg Utilization</p><h2 style={{ margin: 0, fontSize: 22 }}>{avgUtilization}%</h2></div></div>
        )}
        {COST_ROLES.includes(userRole) && (
          <div style={statCardStyle}><div><p style={{ margin: "0 0 4px", color: "#718096", fontSize: 12 }}>Total Cost</p><h2 style={{ margin: 0, fontSize: 22 }}>₹{totalCost.toFixed(2)}</h2></div></div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ ...card, padding: 20 }}>
          <h3 style={{ marginTop: 0, fontSize: 15 }}>Equipment Status Breakdown</h3>
          {Object.entries(statusBreakdown).map(([status, count]) => (
            <div key={status} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f2f6", fontSize: 13 }}>
              <span>{status}</span>
              <span style={pill("#eaf2ff", "#2563eb")}>{count}</span>
            </div>
          ))}
          {Object.keys(statusBreakdown).length === 0 && <p style={emptyText}>No equipment data.</p>}
        </div>

        <div style={{ ...card, padding: 20 }}>
          <h3 style={{ marginTop: 0, fontSize: 15 }}>Booking Status Breakdown</h3>
          {Object.entries(bookingStatusBreakdown).map(([status, count]) => (
            <div key={status} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f2f6", fontSize: 13 }}>
              <span>{status}</span>
              <span style={pill("#fff4df", "#b56a00")}>{count}</span>
            </div>
          ))}
          {Object.keys(bookingStatusBreakdown).length === 0 && <p style={emptyText}>No booking data.</p>}
        </div>
      </div>

      {ANALYTICS_ROLES.includes(userRole) && (
        <div style={card}>
          <div style={{ padding: "17px 20px", borderBottom: "1px solid #e8ecf2" }}>
            <h3 style={{ margin: 0, fontSize: 15 }}>Most Utilized Equipment</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            {loading ? (
              <p style={{ padding: 20 }}>Loading...</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={thStyle}>Equipment</th>
                    <th style={thStyle}>Utilization %</th>
                    <th style={thStyle}>Usage Hours</th>
                    <th style={thStyle}>Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {topUsed.map((a) => (
                    <tr key={a.equipId} style={{ borderBottom: "1px solid #f0f2f6" }}>
                      <td style={tdStyle}>{a.equipName}</td>
                      <td style={tdStyle}>{a.utilizationPercentage?.toFixed(1)}%</td>
                      <td style={tdStyle}>{a.totalUsageHours?.toFixed(1)}</td>
                      <td style={tdStyle}>{a.bookingCount}</td>
                    </tr>
                  ))}
                  {topUsed.length === 0 && (
                    <tr><td colSpan={4} style={emptyText}>No utilization data yet.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;
