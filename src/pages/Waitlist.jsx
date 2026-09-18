import { useEffect, useState } from "react";
import { getAllWaitlistEntries } from "../api/bookingApi";
import { getAllEquipment } from "../api/equipmentApi";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { page, headerRow, h1Style, subStyle, card, thStyle, tdStyle, errorText, emptyText, pill } from "../styles/shared";

function Waitlist() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [equipment, setEquipment] = useState([]);
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

  // NOTE: the backend has no POST /api/waitlist endpoint - a researcher is added
  // to a waitlist automatically when they try to book equipment that's taken.
  // There's also no requester name on WaitlistResponseDTO, so "my" waitlist
  // entries are matched by numeric user id only.
  const myEntries = user?.userId ? entries.filter((e) => e.requestedById === user.userId) : [];

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>My Waitlist</h1>
          <p style={subStyle}>
            You're placed here automatically when you try to book equipment that's
            already reserved for that time slot.
          </p>
        </div>
      </div>

      {error && <p style={errorText}>{error}</p>}

      <div style={card}>
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <p style={{ padding: 20 }}>Loading waitlist...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={thStyle}>Equipment</th>
                  <th style={thStyle}>Requested Start</th>
                  <th style={thStyle}>Requested End</th>
                  <th style={thStyle}>Position in Queue</th>
                  <th style={thStyle}>Added</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {myEntries.map((e) => (
                  <tr key={e.waitlistId} style={{ borderBottom: "1px solid #f0f2f6" }}>
                    <td style={tdStyle}>{equipmentName(e.equipId)}</td>
                    <td style={tdStyle}>{e.startTime ? new Date(e.startTime).toLocaleString() : "-"}</td>
                    <td style={tdStyle}>{e.endTime ? new Date(e.endTime).toLocaleString() : "-"}</td>
                    <td style={tdStyle}>#{e.position}</td>
                    <td style={tdStyle}>{e.addedAt ? new Date(e.addedAt).toLocaleString() : "-"}</td>
                    <td style={tdStyle}>
                      <span style={e.active ? pill("#fff4df", "#b56a00") : pill("#f1f5f9", "#475569")}>
                        {e.active ? "Waiting" : "Cleared"}
                      </span>
                    </td>
                  </tr>
                ))}
                {myEntries.length === 0 && (
                  <tr><td colSpan={6} style={emptyText}>You're not on any waitlists right now.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Waitlist;
