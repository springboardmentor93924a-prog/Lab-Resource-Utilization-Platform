import { useEffect, useState } from "react";
import { getAllUtilization, getUtilizationAnalytics, startUtilization, endUtilization } from "../api/utilizationApi";
import { getAllBookings } from "../api/bookingApi";
import { extractErrorMessage } from "../api/client";
import { page, headerRow, h1Style, subStyle, card, thStyle, tdStyle, actionBtn, errorText, emptyText, pill, primaryBtn, inputStyle, labelStyle, modalOverlay, modalCard, cancelBtn } from "../styles/shared";

const SESSION_ROLES = ["LAB_MANAGER", "LAB_TECHNICIAN"];

function UtilizationPage({ userRole }) {
  const [sessions, setSessions] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("analytics");
  const [showStartForm, setShowStartForm] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const load = () => {
    setLoading(true);
    Promise.allSettled([
      getAllUtilization().then(setSessions),
      getUtilizationAnalytics().then(setAnalytics),
      getAllBookings().then(setBookings),
    ])
      .then((results) => {
        const failed = results.find((r) => r.status === "rejected");
        if (failed) setError(extractErrorMessage(failed.reason, "Failed to load some utilization data."));
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const equipmentName = (id) => bookings.find((b) => b.equipId === id)?.equipmentName || `Equipment ${id}`;

  const handleStart = async (e) => {
    e.preventDefault();
    try {
      await startUtilization(Number(bookingId));
      setBookingId("");
      setShowStartForm(false);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to start utilization tracking."));
    }
  };

  const handleEnd = async (id) => {
    try {
      await endUtilization(id);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to end utilization session."));
    }
  };

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>Equipment Utilization</h1>
          <p style={subStyle}>Usage sessions and utilization analytics</p>
        </div>
        {SESSION_ROLES.includes(userRole) && (
          <button onClick={() => setShowStartForm(true)} style={primaryBtn}>+ Start Session</button>
        )}
      </div>

      {error && <p style={errorText}>{error}</p>}

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button onClick={() => setTab("analytics")} style={tab === "analytics" ? tabBtnActive : tabBtn}>Analytics</button>
        <button onClick={() => setTab("sessions")} style={tab === "sessions" ? tabBtnActive : tabBtn}>Usage Sessions</button>
      </div>

      {tab === "analytics" && (
        <div style={card}>
          <div style={{ overflowX: "auto" }}>
            {loading ? (
              <p style={{ padding: 20 }}>Loading analytics...</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={thStyle}>Equipment</th>
                    <th style={thStyle}>Utilization %</th>
                    <th style={thStyle}>Total Usage (hrs)</th>
                    <th style={thStyle}>Idle Hours</th>
                    <th style={thStyle}>Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.map((a) => (
                    <tr key={a.equipId} style={{ borderBottom: "1px solid #f0f2f6" }}>
                      <td style={tdStyle}>{a.equipName}</td>
                      <td style={tdStyle}>
                        <span style={a.utilizationPercentage >= 70 ? pill("#e8f7ee", "#16834b") : a.utilizationPercentage >= 30 ? pill("#fff4df", "#b56a00") : pill("#fdecec", "#c0392b")}>
                          {a.utilizationPercentage?.toFixed(1)}%
                        </span>
                      </td>
                      <td style={tdStyle}>{a.totalUsageHours?.toFixed(1)}</td>
                      <td style={tdStyle}>{a.idleHours?.toFixed(1)}</td>
                      <td style={tdStyle}>{a.bookingCount}</td>
                    </tr>
                  ))}
                  {analytics.length === 0 && (
                    <tr><td colSpan={5} style={emptyText}>No utilization analytics available yet.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === "sessions" && (
        <div style={card}>
          <div style={{ overflowX: "auto" }}>
            {loading ? (
              <p style={{ padding: 20 }}>Loading sessions...</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={thStyle}>Booking</th>
                    <th style={thStyle}>Equipment</th>
                    <th style={thStyle}>Start</th>
                    <th style={thStyle}>End</th>
                    <th style={thStyle}>Usage Hours</th>
                    <th style={thStyle}>Status</th>
                    {SESSION_ROLES.includes(userRole) && <th style={thStyle}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.utilizationId} style={{ borderBottom: "1px solid #f0f2f6" }}>
                      <td style={tdStyle}>#{s.bookingId}</td>
                      <td style={tdStyle}>{equipmentName(s.equipId)}</td>
                      <td style={tdStyle}>{s.startTime ? new Date(s.startTime).toLocaleString() : "-"}</td>
                      <td style={tdStyle}>{s.endTime ? new Date(s.endTime).toLocaleString() : "-"}</td>
                      <td style={tdStyle}>{s.usageHours ?? "-"}</td>
                      <td style={tdStyle}>
                        <span style={s.status === "ACTIVE" ? pill("#fff4df", "#b56a00") : pill("#e8f7ee", "#16834b")}>{s.status}</span>
                      </td>
                      {SESSION_ROLES.includes(userRole) && (
                        <td style={tdStyle}>
                          {s.status === "ACTIVE" && (
                            <button onClick={() => handleEnd(s.bookingId)} style={actionBtn}>End Session</button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                  {sessions.length === 0 && (
                    <tr><td colSpan={7} style={emptyText}>No utilization sessions yet.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {showStartForm && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 19 }}>Start Utilization Session</h2>
              <button onClick={() => setShowStartForm(false)} style={{ border: "none", background: "none", fontSize: 19, cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleStart}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Booking</label>
                <select required value={bookingId} onChange={(e) => setBookingId(e.target.value)} style={inputStyle}>
                  <option value="">Select a confirmed booking</option>
                  {bookings.filter((b) => b.status === "CONFIRMED").map((b) => (
                    <option key={b.bookingId} value={b.bookingId}>#{b.bookingId} - {b.equipmentName}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 20 }}>
                <button type="button" onClick={() => setShowStartForm(false)} style={cancelBtn}>Cancel</button>
                <button type="submit" style={primaryBtn}>Start Session</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const tabBtn = { padding: "9px 16px", borderRadius: 7, border: "1px solid #d9dfe8", background: "white", color: "#475569", fontSize: 13, cursor: "pointer" };
const tabBtnActive = { ...tabBtn, background: "#2563eb", borderColor: "#2563eb", color: "white", fontWeight: 600 };

export default UtilizationPage;
