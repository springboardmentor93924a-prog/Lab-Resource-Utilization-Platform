import { useEffect, useState } from "react";
import { getAllWaitlistEntries } from "../api/bookingApi";
import { getAllEquipment } from "../api/equipmentApi";
import { extractErrorMessage } from "../api/client";
import { page, headerRow, h1Style, subStyle, card, filterBar, selectStyle, thStyle, tdStyle, errorText, emptyText, pill } from "../styles/shared";

function ManagerWaitlist() {
  const [entries, setEntries] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [equipmentFilter, setEquipmentFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([getAllWaitlistEntries(), getAllEquipment()])
      .then(([w, eq]) => { setEntries(w); setEquipment(eq); })
      .catch((err) => setError(extractErrorMessage(err, "Failed to load waitlist.")))
      .finally(() => setLoading(false));
  }, []);

  const equipmentName = (id) => equipment.find((e) => e.equipmentId === id)?.equipmentName || `Equipment ${id}`;

  const filtered = entries
    .filter((e) => equipmentFilter === "All" || String(e.equipId) === equipmentFilter)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>Equipment Waitlists</h1>
          <p style={subStyle}>
            Everyone currently queued for busy equipment, across all requesters.
          </p>
        </div>
      </div>

      {error && <p style={errorText}>{error}</p>}

      <div style={card}>
        <div style={filterBar}>
          <select value={equipmentFilter} onChange={(e) => setEquipmentFilter(e.target.value)} style={selectStyle}>
            <option value="All">All Equipment</option>
            {equipment.map((eq) => (
              <option key={eq.equipmentId} value={eq.equipmentId}>{eq.equipmentName}</option>
            ))}
          </select>
        </div>
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <p style={{ padding: 20 }}>Loading waitlist...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={thStyle}>Equipment</th>
                  <th style={thStyle}>Requester (User ID)</th>
                  <th style={thStyle}>Requested Start</th>
                  <th style={thStyle}>Requested End</th>
                  <th style={thStyle}>Queue Position</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.waitlistId} style={{ borderBottom: "1px solid #f0f2f6" }}>
                    <td style={tdStyle}>{equipmentName(e.equipId)}</td>
                    <td style={tdStyle}>#{e.requestedById}</td>
                    <td style={tdStyle}>{e.startTime ? new Date(e.startTime).toLocaleString() : "-"}</td>
                    <td style={tdStyle}>{e.endTime ? new Date(e.endTime).toLocaleString() : "-"}</td>
                    <td style={tdStyle}>#{e.position}</td>
                    <td style={tdStyle}>
                      <span style={e.active ? pill("#fff4df", "#b56a00") : pill("#f1f5f9", "#475569")}>
                        {e.active ? "Waiting" : "Cleared"}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={emptyText}>No one is waitlisted right now.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManagerWaitlist;
