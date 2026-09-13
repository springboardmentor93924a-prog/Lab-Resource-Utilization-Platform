import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getCostSummary, getBookingsWithCost, getMonthlyReport } from "../services/costService";

function downloadCSV(summary, bookings, monthlyReport) {
  const lines = [];
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;

  lines.push("COST & BILLING REPORT");
  lines.push("");
  lines.push("SUMMARY");
  lines.push(`Total cost,${summary.totalCost}`);
  lines.push(`Completed bookings,${summary.completedBookings}`);
  lines.push("");

  lines.push("COST BY DEPARTMENT");
  lines.push("Department,Cost");
  Object.entries(summary.byDepartment || {}).forEach(([k, v]) => lines.push(`${esc(k)},${v}`));
  lines.push("");

  lines.push("COST BY EQUIPMENT");
  lines.push("Equipment,Cost");
  Object.entries(summary.byEquipment || {}).forEach(([k, v]) => lines.push(`${esc(k)},${v}`));
  lines.push("");

  lines.push("ALL BOOKING COSTS");
  lines.push("ID,Equipment,Department,Status,Cost");
  bookings.forEach((b) =>
    lines.push(`${b.id},${esc(b.equipmentName)},${esc(b.departmentName || "-")},${esc(b.status)},${b.cost}`)
  );
  lines.push("");

  monthlyReport.forEach((m) => {
    lines.push(`MONTH: ${m.month}`);
    lines.push(`Equipment booked,${m.equipmentBookedCount}`);
    lines.push(`Total cost,${m.totalCost}`);
    lines.push("");
    lines.push("User,Paid,Pending");
    m.byUser.forEach((u) => lines.push(`${esc(u.userName)},${u.paid},${u.pending}`));
    lines.push("");
    lines.push("Department,Cost");
    Object.entries(m.byDepartment || {}).forEach(([k, v]) => lines.push(`${esc(k)},${v}`));
    lines.push("");
    lines.push("Institution,Cost");
    Object.entries(m.byInstitution || {}).forEach(([k, v]) => lines.push(`${esc(k)},${v}`));
    lines.push("");
  });

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cost-billing-report-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const card = { background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "20px" };
const rowLine = { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1f2937" };

export default function CostBilling() {
  const [summary, setSummary] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedMonths, setExpandedMonths] = useState({});
  const [showAllBookings, setShowAllBookings] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [s, b, m] = await Promise.all([getCostSummary(), getBookingsWithCost(), getMonthlyReport()]);
        setSummary(s);
        setBookings(b);
        setMonthlyReport(m);
        if (m.length > 0) {
          setExpandedMonths({ [m[m.length - 1].month]: true });
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load cost data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function toggleMonth(month) {
    setExpandedMonths((prev) => ({ ...prev, [month]: !prev[month] }));
  }

  const visibleBookings = showAllBookings ? bookings : bookings.slice(0, 5);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#020b1c", color: "#fff" }}>
      <aside className="sidebar">
        <Sidebar />
      </aside>
      <main style={{ flex: 1, padding: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Cost & billing</h2>
          {!loading && !error && summary && (
            <button
              onClick={() => downloadCSV(summary, bookings, monthlyReport)}
              style={{
                background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px",
                padding: "10px 18px", fontWeight: 600, fontSize: "14px", cursor: "pointer",
              }}
            >
              Generate report
            </button>
          )}
        </div>

        {loading && <p>Loading cost data...</p>}
        {error && <p style={{ color: "#f87171" }}>{error}</p>}

        {!loading && !error && summary && (
          <>
            <div style={{ display: "flex", gap: "20px", marginBottom: "24px", flexWrap: "wrap" }}>
              <div style={{ ...card, minWidth: "220px" }}>
                <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "6px" }}>Total cost</p>
                <p style={{ fontSize: "26px", fontWeight: 700 }}>₹{Number(summary.totalCost).toFixed(2)}</p>
              </div>
              <div style={{ ...card, minWidth: "220px" }}>
                <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "6px" }}>Completed bookings</p>
                <p style={{ fontSize: "26px", fontWeight: 700 }}>{summary.completedBookings}</p>
              </div>
            </div>

            <details style={{ ...card, marginBottom: "16px" }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "15px" }}>
                Cost by department & equipment
              </summary>
              <div style={{ display: "flex", gap: "20px", marginTop: "16px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "260px" }}>
                  <h6 style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "8px" }}>By department</h6>
                  {Object.keys(summary.byDepartment).length === 0 && <p style={{ color: "#94a3b8" }}>No data yet.</p>}
                  {Object.entries(summary.byDepartment).map(([dept, cost]) => (
                    <div key={dept} style={rowLine}>
                      <span>{dept}</span>
                      <span>₹{Number(cost).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, minWidth: "260px" }}>
                  <h6 style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "8px" }}>By equipment</h6>
                  {Object.keys(summary.byEquipment).length === 0 && <p style={{ color: "#94a3b8" }}>No data yet.</p>}
                  {Object.entries(summary.byEquipment).map(([eq, cost]) => (
                    <div key={eq} style={rowLine}>
                      <span>{eq}</span>
                      <span>₹{Number(cost).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </details>

            <details style={{ ...card, marginBottom: "16px", padding: 0, overflow: "hidden" }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "15px", padding: "20px" }}>
                All booking costs ({bookings.length})
              </summary>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#0F1B2D" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>ID</th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Equipment</th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Department</th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Status</th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: "16px", color: "#94a3b8" }}>No booking costs yet.</td></tr>
                  )}
                  {visibleBookings.map((b) => (
                    <tr key={b.id} style={{ borderTop: "1px solid #1f2937" }}>
                      <td style={{ padding: "12px 16px" }}>{b.id}</td>
                      <td style={{ padding: "12px 16px" }}>{b.equipmentName}</td>
                      <td style={{ padding: "12px 16px" }}>{b.departmentName || "-"}</td>
                      <td style={{ padding: "12px 16px" }}>{b.status}</td>
                      <td style={{ padding: "12px 16px" }}>₹{Number(b.cost).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length > 5 && (
                <div style={{ padding: "14px 16px" }}>
                  <button
                    onClick={() => setShowAllBookings((v) => !v)}
                    style={{ background: "transparent", border: "1px solid #315477", color: "#93c5fd", borderRadius: "6px", padding: "6px 14px", cursor: "pointer", fontSize: "13px" }}
                  >
                    {showAllBookings ? "Show less" : `Show all ${bookings.length}`}
                  </button>
                </div>
              )}
            </details>

            <h4 style={{ marginBottom: "12px", fontSize: "15px" }}>Monthly report</h4>
            {monthlyReport.length === 0 && <p style={{ color: "#94a3b8" }}>No monthly data yet.</p>}
            {monthlyReport.map((m) => {
              const isOpen = !!expandedMonths[m.month];
              return (
                <div key={m.month} style={{ ...card, marginBottom: "14px" }}>
                  <div
                    onClick={() => toggleMonth(m.month)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", flexWrap: "wrap", gap: "10px" }}
                  >
                    <h5 style={{ margin: 0 }}>{isOpen ? "▾" : "▸"} {m.month}</h5>
                    <span style={{ color: "#94a3b8" }}>{m.equipmentBookedCount} equipment booked · Total: ₹{Number(m.totalCost).toFixed(2)}</span>
                  </div>

                  {isOpen && (
                    <div style={{ marginTop: "16px" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
                        <thead>
                          <tr style={{ background: "#0F1B2D" }}>
                            <th style={{ padding: "10px 14px", textAlign: "left" }}>User</th>
                            <th style={{ padding: "10px 14px", textAlign: "left" }}>Paid</th>
                            <th style={{ padding: "10px 14px", textAlign: "left" }}>Pending</th>
                          </tr>
                        </thead>
                        <tbody>
                          {m.byUser.map((u) => (
                            <tr key={u.userId} style={{ borderTop: "1px solid #1f2937" }}>
                              <td style={{ padding: "10px 14px" }}>{u.userName}</td>
                              <td style={{ padding: "10px 14px", color: "#22c55e" }}>₹{Number(u.paid).toFixed(2)}</td>
                              <td style={{ padding: "10px 14px", color: "#f59e0b" }}>₹{Number(u.pending).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <details>
                        <summary style={{ cursor: "pointer", color: "#93c5fd", fontSize: "13px" }}>
                          Department & institution breakdown
                        </summary>
                        <div style={{ display: "flex", gap: "20px", marginTop: "12px", flexWrap: "wrap" }}>
                          <div style={{ flex: 1, minWidth: "220px" }}>
                            <h6 style={{ marginBottom: "8px", color: "#94a3b8", fontSize: "13px" }}>By department</h6>
                            {Object.entries(m.byDepartment || {}).map(([dept, cost]) => (
                              <div key={dept} style={{ ...rowLine, padding: "6px 0", fontSize: "14px" }}>
                                <span>{dept}</span>
                                <span>₹{Number(cost).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ flex: 1, minWidth: "220px" }}>
                            <h6 style={{ marginBottom: "8px", color: "#94a3b8", fontSize: "13px" }}>By institution</h6>
                            {Object.entries(m.byInstitution || {}).map(([inst, cost]) => (
                              <div key={inst} style={{ ...rowLine, padding: "6px 0", fontSize: "14px" }}>
                                <span>{inst}</span>
                                <span>₹{Number(cost).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </main>
    </div>
  );
}