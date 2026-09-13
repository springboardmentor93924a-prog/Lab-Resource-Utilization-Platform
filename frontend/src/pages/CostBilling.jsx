import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const RUPEE = "\u20B9";

const colors = {
  bg: "#0B1220",
  panel: "#111A2C",
  panelAlt: "#0F1B2D",
  border: "#1E2A41",
  borderSoft: "#243248",
  text: "#F1F5F9",
  textMuted: "#94A3B8",
  textFaint: "#64748B",
  accent: "#3B82F6",
  accentSoft: "#1D4ED8",
  green: "#22C55E",
  greenBg: "rgba(34,197,94,0.12)",
  amber: "#F59E0B",
  amberBg: "rgba(245,158,11,0.12)",
  red: "#F87171",
};

const card = {
  background: colors.panel,
  border: `1px solid ${colors.border}`,
  borderRadius: "14px",
  padding: "22px",
  boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
};

const rowLine = {
  display: "flex",
  justifyContent: "space-between",
  padding: "9px 0",
  borderBottom: `1px solid ${colors.border}`,
  fontSize: "14px",
};

const sectionLabel = {
  color: colors.textMuted,
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: "10px",
};

const thStyle = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: 600,
  color: colors.textMuted,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  borderBottom: `1px solid ${colors.border}`,
};

const tdStyle = {
  padding: "13px 16px",
  fontSize: "14px",
  borderTop: `1px solid ${colors.border}`,
};

function StatusBadge({ status }) {
  const normalized = (status || "").toLowerCase();
  let bg = "rgba(148,163,184,0.14)";
  let fg = colors.textMuted;
  if (normalized === "completed") {
    bg = colors.greenBg;
    fg = colors.green;
  } else if (normalized.includes("pending")) {
    bg = colors.amberBg;
    fg = colors.amber;
  } else if (normalized.includes("cancel") || normalized.includes("reject")) {
    bg = "rgba(248,113,113,0.12)";
    fg = colors.red;
  } else if (normalized.includes("confirm") || normalized.includes("active")) {
    bg = "rgba(59,130,246,0.14)";
    fg = colors.accent;
  }
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
        background: bg,
        color: fg,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

export default function CostBilling() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedMonths, setExpandedMonths] = useState({});
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [reportHover, setReportHover] = useState(false);

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
    <div style={{ display: "flex", minHeight: "100vh", background: colors.bg, color: colors.text, fontFamily: "'Inter', -apple-system, 'Segoe UI', sans-serif" }}>
      <aside className="sidebar">
        <Sidebar />
      </aside>
      <main style={{ flex: 1, padding: "36px 40px", maxWidth: "1200px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "28px",
            flexWrap: "wrap",
            position: "relative",
            paddingRight: "54px",
            gap: "16px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <div style={{ width: "4px", height: "22px", borderRadius: "2px", background: colors.accent }} />
              <h2 style={{ fontSize: "24px", fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
                Cost &amp; Billing
              </h2>
            </div>
            <p style={{ margin: 0, marginLeft: "14px", color: colors.textMuted, fontSize: "14px" }}>
              Overview of equipment costs, payments, and monthly billing across the lab.
            </p>
          </div>

          {!loading && !error && summary && (

            <button
              onClick={() => downloadCSV(summary, bookings, monthlyReport)}
              onMouseEnter={() => setReportHover(true)}
              onMouseLeave={() => setReportHover(false)}
              style={{
                background: reportHover ? colors.accentSoft : colors.accent,
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "11px 20px",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: reportHover ? "0 4px 14px rgba(59,130,246,0.35)" : "0 2px 8px rgba(59,130,246,0.2)",
                transition: "all 0.15s ease",
              }}
            >
              Generate report
            </button>
          )}
          <button onClick={() => navigate("/profile")} title="My Profile" aria-label="My Profile" style={{ position: "absolute", top: 0, right: 0,  width: 38, height: 38, borderRadius: "50%", background: "#dbeafe", border: "2px solid #93c5fd", color: "#312e81", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.3 0-9.8 1.6-9.8 4.9v2.1c0 .7.5 1.2 1.2 1.2h17.2c.7 0 1.2-.5 1.2-1.2v-2.1c0-3.3-6.5-4.9-9.8-4.9z"/></svg></button>
        </div>

        {loading && <p style={{ color: colors.textMuted }}>Loading cost data...</p>}
        {error && <p style={{ color: colors.red }}>{error}</p>}

        {!loading && !error && summary && (
          <>
            <div style={{ display: "flex", gap: "20px", marginBottom: "28px", flexWrap: "wrap" }}>
              <div style={{ ...card, minWidth: "240px", flex: "1 1 240px" }}>
                <p style={sectionLabel}>Total cost</p>
                <p style={{ fontSize: "30px", fontWeight: 700, margin: 0 }}>
                  {RUPEE}{Number(summary.totalCost).toFixed(2)}
                </p>
              </div>
              <div style={{ ...card, minWidth: "240px", flex: "1 1 240px" }}>
                <p style={sectionLabel}>Completed bookings</p>
                <p style={{ fontSize: "30px", fontWeight: 700, margin: 0 }}>{summary.completedBookings}</p>
              </div>
            </div>

            <details style={{ ...card, marginBottom: "18px" }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "15px", outline: "none" }}>
                Cost by department &amp; equipment
              </summary>
              <div style={{ display: "flex", gap: "24px", marginTop: "18px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "260px" }}>
                  <h6 style={sectionLabel}>By department</h6>
                  {Object.keys(summary.byDepartment).length === 0 && (
                    <p style={{ color: colors.textFaint, fontSize: "14px" }}>No data yet.</p>
                  )}
                  {Object.entries(summary.byDepartment).map(([dept, cost]) => (
                    <div key={dept} style={rowLine}>
                      <span style={{ color: colors.textMuted }}>{dept}</span>
                      <span style={{ fontWeight: 600 }}>{RUPEE}{Number(cost).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, minWidth: "260px" }}>
                  <h6 style={sectionLabel}>By equipment</h6>
                  {Object.keys(summary.byEquipment).length === 0 && (
                    <p style={{ color: colors.textFaint, fontSize: "14px" }}>No data yet.</p>
                  )}
                  {Object.entries(summary.byEquipment).map(([eq, cost]) => (
                    <div key={eq} style={rowLine}>
                      <span style={{ color: colors.textMuted }}>{eq}</span>
                      <span style={{ fontWeight: 600 }}>{RUPEE}{Number(cost).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </details>

            <details style={{ ...card, marginBottom: "18px", padding: 0, overflow: "hidden" }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "15px", padding: "22px", outline: "none" }}>
                All booking costs ({bookings.length})
              </summary>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: colors.panelAlt }}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Equipment</th>
                    <th style={thStyle}>Department</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: "18px", color: colors.textFaint }}>
                        No booking costs yet.
                      </td>
                    </tr>
                  )}
                  {visibleBookings.map((b) => (
                    <tr key={b.id}>
                      <td style={{ ...tdStyle, color: colors.textFaint }}>{b.id}</td>
                      <td style={tdStyle}>{b.equipmentName}</td>
                      <td style={{ ...tdStyle, color: colors.textMuted }}>{b.departmentName || "-"}</td>
                      <td style={tdStyle}>
                        <StatusBadge status={b.status} />
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{RUPEE}{Number(b.cost).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length > 5 && (
                <div style={{ padding: "16px" }}>
                  <button
                    onClick={() => setShowAllBookings((v) => !v)}
                    style={{
                      background: "transparent",
                      border: `1px solid ${colors.borderSoft}`,
                      color: "#93C5FD",
                      borderRadius: "8px",
                      padding: "7px 16px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    {showAllBookings ? "Show less" : `Show all ${bookings.length}`}
                  </button>
                </div>
              )}
            </details>

            <h4 style={{ marginBottom: "14px", fontSize: "16px", fontWeight: 700 }}>Monthly report</h4>
            {monthlyReport.length === 0 && (
              <p style={{ color: colors.textFaint, fontSize: "14px" }}>No monthly data yet.</p>
            )}
            {monthlyReport.map((m) => {
              const isOpen = !!expandedMonths[m.month];
              return (
                <div key={m.month} style={{ ...card, marginBottom: "16px" }}>
                  <div
                    onClick={() => toggleMonth(m.month)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <h5 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
                      <span style={{ color: colors.textFaint, marginRight: "6px" }}>{isOpen ? "\u25BE" : "\u25B8"}</span>
                      {m.month}
                    </h5>
                    <span style={{ color: colors.textMuted, fontSize: "13px" }}>
                      {m.equipmentBookedCount} equipment booked &middot; Total: {RUPEE}{Number(m.totalCost).toFixed(2)}
                    </span>
                  </div>

                  {isOpen && (
                    <div style={{ marginTop: "18px" }}>
                      <div style={{ borderRadius: "10px", overflow: "hidden", border: `1px solid ${colors.border}`, marginBottom: "18px" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ background: colors.panelAlt }}>
                              <th style={thStyle}>User</th>
                              <th style={thStyle}>Paid</th>
                              <th style={thStyle}>Pending</th>
                            </tr>
                          </thead>
                          <tbody>
                            {m.byUser.map((u) => (
                              <tr key={u.userId}>
                                <td style={tdStyle}>{u.userName}</td>
                                <td style={{ ...tdStyle, color: colors.green, fontWeight: 600 }}>
                                  {RUPEE}{Number(u.paid).toFixed(2)}
                                </td>
                                <td style={{ ...tdStyle, color: colors.amber, fontWeight: 600 }}>
                                  {RUPEE}{Number(u.pending).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <details>
                        <summary style={{ cursor: "pointer", color: "#93C5FD", fontSize: "13px", fontWeight: 500, outline: "none" }}>
                          Department &amp; institution breakdown
                        </summary>
                        <div style={{ display: "flex", gap: "24px", marginTop: "14px", flexWrap: "wrap" }}>
                          <div style={{ flex: 1, minWidth: "220px" }}>
                            <h6 style={sectionLabel}>By department</h6>
                            {Object.entries(m.byDepartment || {}).map(([dept, cost]) => (
                              <div key={dept} style={{ ...rowLine, padding: "7px 0" }}>
                                <span style={{ color: colors.textMuted }}>{dept}</span>
                                <span style={{ fontWeight: 600 }}>{RUPEE}{Number(cost).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ flex: 1, minWidth: "220px" }}>
                            <h6 style={sectionLabel}>By institution</h6>
                            {Object.entries(m.byInstitution || {}).map(([inst, cost]) => (
                              <div key={inst} style={{ ...rowLine, padding: "7px 0" }}>
                                <span style={{ color: colors.textMuted }}>{inst}</span>
                                <span style={{ fontWeight: 600 }}>{RUPEE}{Number(cost).toFixed(2)}</span>
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