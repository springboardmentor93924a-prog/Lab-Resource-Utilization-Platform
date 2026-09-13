import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getAnalyticsSummary } from "../services/analyticsService";

function StatCard({ label, value }) {
  return (
    <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "20px", minWidth: "200px" }}>
      <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "6px" }}>{label}</p>
      <p style={{ fontSize: "26px", fontWeight: 700 }}>{value}</p>
    </div>
  );
}

function BreakdownPanel({ title, data }) {
  const entries = Object.entries(data || {});
  return (
    <div style={{ flex: 1, minWidth: "280px", background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "20px" }}>
      <h4 style={{ marginBottom: "12px", fontSize: "15px" }}>{title}</h4>
      {entries.length === 0 && <p style={{ color: "#94a3b8" }}>No data yet.</p>}
      {entries.map(([key, val]) => (
        <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1f2937" }}>
          <span>{key}</span>
          <span>{val}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAnalyticsSummary();
        setSummary(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load analytics data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#020b1c", color: "#fff" }}>
      <aside className="sidebar">
        <Sidebar />
      </aside>
      <main style={{ flex: 1, padding: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700 }}>Analytics</h2>
          <button onClick={() => navigate("/profile")} title="My Profile" aria-label="My Profile" style={{ width: 38, height: 38, borderRadius: "50%", background: "#dbeafe", border: "2px solid #93c5fd", color: "#312e81", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.3 0-9.8 1.6-9.8 4.9v2.1c0 .7.5 1.2 1.2 1.2h17.2c.7 0 1.2-.5 1.2-1.2v-2.1c0-3.3-6.5-4.9-9.8-4.9z"/></svg></button>
        </div>

        {loading && <p>Loading analytics...</p>}
        {error && <p style={{ color: "#f87171" }}>{error}</p>}

        {!loading && !error && summary && (
          <>
            <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
              <StatCard label="Total equipment" value={summary.totalEquipment} />
              <StatCard label="Shared equipment" value={summary.sharedEquipmentCount} />
              <StatCard label="Total bookings" value={summary.totalBookings} />
              <StatCard label="Total work orders" value={summary.totalWorkOrders} />
              <StatCard label="Total cost" value={`\u20B9${Number(summary.totalCost).toFixed(2)}`} />
            </div>

            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <BreakdownPanel title="Equipment by status" data={summary.equipmentByStatus} />
              <BreakdownPanel title="Bookings by status" data={summary.bookingsByStatus} />
              <BreakdownPanel title="Work orders by status" data={summary.workOrdersByStatus} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
