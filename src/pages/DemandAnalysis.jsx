import { useEffect, useState } from "react";
import { getAllEquipment } from "../api/equipmentApi";
import { getAllBookings, getAllWaitlistEntries } from "../api/bookingApi";
import { extractErrorMessage } from "../api/client";
import { page, headerRow, h1Style, subStyle, card, thStyle, tdStyle, errorText, emptyText, pill } from "../styles/shared";

function DemandAnalysis() {
  const [equipment, setEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([getAllEquipment(), getAllBookings(), getAllWaitlistEntries()])
      .then(([eq, b, w]) => { setEquipment(eq); setBookings(b); setWaitlist(w); })
      .catch((err) => setError(extractErrorMessage(err, "Failed to load demand data.")))
      .finally(() => setLoading(false));
  }, []);

  // "Demand" here is derived from what the backend actually gives us: how many
  // bookings an item has attracted, plus how many people are currently queued
  // for it on the waitlist. There's no dedicated demand-forecasting endpoint.
  const rows = equipment
    .map((eq) => {
      const bookingCount = bookings.filter((b) => b.equipId === eq.equipmentId).length;
      const activeWaitlist = waitlist.filter((w) => w.equipId === eq.equipmentId && w.active).length;
      return {
        ...eq,
        bookingCount,
        activeWaitlist,
        demandScore: bookingCount + activeWaitlist * 2,
      };
    })
    .sort((a, b) => b.demandScore - a.demandScore);

  const highDemand = rows.filter((r) => r.activeWaitlist > 0);

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>Demand Analysis</h1>
          <p style={subStyle}>Equipment ranked by booking volume and active waitlist queues</p>
        </div>
      </div>

      {error && <p style={errorText}>{error}</p>}

      {highDemand.length > 0 && (
        <div style={{ ...card, padding: 20, marginBottom: 20, borderLeft: "4px solid #f97316" }}>
          <h3 style={{ marginTop: 0, fontSize: 15 }}>⚠ Equipment with an active waitlist</h3>
          <p style={{ fontSize: 13, color: "#64748b" }}>
            These {highDemand.length} item(s) currently have researchers queued and waiting —
            consider prioritizing maintenance/availability or acquiring more units.
          </p>
        </div>
      )}

      <div style={card}>
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <p style={{ padding: 20 }}>Loading demand data...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={thStyle}>Equipment</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Total Bookings</th>
                  <th style={thStyle}>Active Waitlist</th>
                  <th style={thStyle}>Demand Score</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.equipmentId} style={{ borderBottom: "1px solid #f0f2f6" }}>
                    <td style={tdStyle}>{r.equipmentName}</td>
                    <td style={tdStyle}>{r.categoryName || "-"}</td>
                    <td style={tdStyle}>{r.bookingCount}</td>
                    <td style={tdStyle}>
                      {r.activeWaitlist > 0 ? (
                        <span style={pill("#fff4df", "#b56a00")}>{r.activeWaitlist} waiting</span>
                      ) : (
                        <span style={pill("#f1f5f9", "#475569")}>None</span>
                      )}
                    </td>
                    <td style={tdStyle}>{r.demandScore}</td>
                    <td style={tdStyle}>{r.status}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={6} style={emptyText}>No equipment data available.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default DemandAnalysis;
