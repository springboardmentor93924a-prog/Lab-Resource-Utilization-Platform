import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:8080/api";

function Heatmap() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHeatmap = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/utilization`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load heatmap data");
      }

      const result = await response.json();

      setData(result);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load heatmap data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmap();

    const interval = setInterval(
      fetchHeatmap,
      30000
    );

    return () => clearInterval(interval);
  }, []);

  const getCellStyle = (level) => {
    switch (level) {
      case "HIGH":
        return {
          background: "#166534",
          color: "white",
        };

      case "MEDIUM":
        return {
          background: "#f59e0b",
          color: "white",
        };

      case "LOW":
        return {
          background: "#facc15",
          color: "#713f12",
        };

      default:
        return {
          background: "#e5e7eb",
          color: "#475569",
        };
    }
  };

  if (loading) {
    return (
      <div style={styles.message}>
        Loading heatmap...
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        {error}
      </div>
    );
  }

  return (
    <div>

      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>
            Utilization Heatmap
          </h2>

          <p style={styles.subtitle}>
            Equipment usage intensity by weekday.
          </p>
        </div>

        <button
          style={styles.refreshButton}
          onClick={fetchHeatmap}
        >
          Refresh
        </button>
      </div>

      <div style={styles.legend}>

        <div style={styles.legendItem}>
          <span
            style={{
              ...styles.legendBox,
              background: "#166534",
            }}
          />
          HIGH
        </div>

        <div style={styles.legendItem}>
          <span
            style={{
              ...styles.legendBox,
              background: "#f59e0b",
            }}
          />
          MEDIUM
        </div>

        <div style={styles.legendItem}>
          <span
            style={{
              ...styles.legendBox,
              background: "#facc15",
            }}
          />
          LOW
        </div>

        <div style={styles.legendItem}>
          <span
            style={{
              ...styles.legendBox,
              background: "#e5e7eb",
            }}
          />
          IDLE
        </div>

      </div>

      {data.length === 0 ? (
        <div style={styles.empty}>
          No heatmap data available.
        </div>
      ) : (
        <div style={styles.card}>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>

              <thead>
                <tr>

                  <th style={styles.th}>
                    Equipment
                  </th>

                  <th style={styles.th}>
                    Monday
                  </th>

                  <th style={styles.th}>
                    Tuesday
                  </th>

                  <th style={styles.th}>
                    Wednesday
                  </th>

                  <th style={styles.th}>
                    Thursday
                  </th>

                  <th style={styles.th}>
                    Friday
                  </th>

                  <th style={styles.th}>
                    Idle Days
                  </th>

                </tr>
              </thead>

              <tbody>

                {data.map((item, index) => (

                  <tr
                    key={`${item.equipmentName}-${index}`}
                  >

                    <td style={styles.equipment}>
                      {item.equipmentName}
                    </td>

                    {[
                      item.monday,
                      item.tuesday,
                      item.wednesday,
                      item.thursday,
                      item.friday,
                    ].map((level, dayIndex) => (

                      <td
                        key={dayIndex}
                        style={styles.td}
                      >
                        <div
                          style={{
                            ...styles.heatCell,
                            ...getCellStyle(level),
                          }}
                        >
                          {level || "IDLE"}
                        </div>
                      </td>

                    ))}

                    <td style={styles.idleDays}>
                      {item.idleDays ?? 0}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>
          </div>

        </div>
      )}

    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },

  title: {
    margin: 0,
    fontSize: "24px",
  },

  subtitle: {
    color: "#64748b",
    marginTop: "6px",
  },

  refreshButton: {
    border: "none",
    borderRadius: "6px",
    padding: "10px 18px",
    cursor: "pointer",
    background: "#2563eb",
    color: "white",
    fontWeight: "600",
  },

  legend: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "13px",
    fontWeight: "600",
  },

  legendBox: {
    width: "16px",
    height: "16px",
    borderRadius: "3px",
    display: "inline-block",
  },

  card: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "20px",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px",
  },

  th: {
    padding: "14px 10px",
    textAlign: "center",
    borderBottom: "2px solid #e2e8f0",
    fontSize: "13px",
  },

  td: {
    padding: "10px",
    borderBottom: "1px solid #e2e8f0",
    textAlign: "center",
  },

  equipment: {
    padding: "12px",
    textAlign: "left",
    fontWeight: "600",
    borderBottom: "1px solid #e2e8f0",
  },

  heatCell: {
    minWidth: "90px",
    padding: "10px 6px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
    textAlign: "center",
  },

  idleDays: {
    padding: "12px",
    textAlign: "center",
    borderBottom: "1px solid #e2e8f0",
    fontWeight: "600",
  },

  empty: {
    padding: "40px",
    background: "white",
    borderRadius: "10px",
    textAlign: "center",
  },

  message: {
    padding: "40px",
    textAlign: "center",
  },

  error: {
    padding: "20px",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "8px",
  },
};

export default Heatmap;