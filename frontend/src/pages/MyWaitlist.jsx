import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getMyWaitlistEntries } from "../services/waitlistService";

function statusColor(status) {
  switch (status) {
    case "NOTIFIED":
      return "#22c55e";
    case "EXPIRED":
      return "#94a3b8";
    default:
      return "#f59e0b";
  }
}

export default function MyWaitlist() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      const data = await getMyWaitlistEntries();
      setEntries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside className="sidebar">
        <Sidebar />
      </aside>

      <main style={{ flex: 1, padding: "30px" }}>
        <h2 style={{ fontWeight: 700, color: "#0F1B2D", marginBottom: "25px" }}>My waitlist</h2>

        {loading && <p>Loading...</p>}

        {!loading && entries.length === 0 && <p>You're not on any waitlists.</p>}

        {!loading && entries.length > 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
          >
            {entries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "15px",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div>
                  <strong>{entry.equipmentName}</strong>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    {entry.requestedDate}, {entry.startTime}–{entry.endTime}
                  </div>
                  {entry.status === "NOTIFIED" && (
                    <div style={{ fontSize: "13px", color: "#22c55e", marginTop: "4px" }}>
                      A slot has opened up — try booking again!
                    </div>
                  )}
                </div>
                <span
                  style={{
                    background: statusColor(entry.status),
                    color: "#fff",
                    padding: "6px 14px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {entry.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}