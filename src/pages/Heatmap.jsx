import { useEffect, useState } from "react";
import { getUtilizationAnalytics } from "../api/utilizationApi";
import { extractErrorMessage } from "../api/client";
import { page, headerRow, h1Style, subStyle, card, errorText, emptyText } from "../styles/shared";

// The backend only gives us per-equipment utilization %, not an hour-by-hour
// or day-by-day breakdown, so this is a utilization-intensity grid rather
// than a true time-based heatmap.
function colorFor(pct) {
  if (pct >= 80) return "#166534";
  if (pct >= 60) return "#16834b";
  if (pct >= 40) return "#eab308";
  if (pct >= 20) return "#f97316";
  return "#ef4444";
}

function Heatmap() {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getUtilizationAnalytics()
      .then(setAnalytics)
      .catch((err) => setError(extractErrorMessage(err, "Failed to load utilization data.")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>Utilization Heatmap</h1>
          <p style={subStyle}>Utilization intensity across all tracked equipment</p>
        </div>
      </div>

      <p style={{ fontSize: 12, color: "#94a3b8", marginTop: -14, marginBottom: 20 }}>
        The backend reports overall utilization per piece of equipment, not a
        time-of-day breakdown, so darker cells mean more heavily used equipment overall.
      </p>

      {error && <p style={errorText}>{error}</p>}

      <div style={{ ...card, padding: 20 }}>
        {loading ? (
          <p>Loading...</p>
        ) : analytics.length === 0 ? (
          <p style={emptyText}>No utilization data yet.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {analytics.map((a) => (
              <div
                key={a.equipId}
                style={{
                  background: colorFor(a.utilizationPercentage || 0),
                  color: "white",
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{a.equipName}</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{(a.utilizationPercentage || 0).toFixed(1)}%</div>
                <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>{a.bookingCount} bookings</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Heatmap;
