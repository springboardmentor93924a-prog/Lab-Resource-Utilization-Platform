import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

function Utilization() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUtilization = async () => {
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
        throw new Error("Failed to load utilization data");
      }

      const result = await response.json();

      const fixedData = result.map((item) => ({
        ...item,
        usedHours: Number(item.usedHours || 0),
        idleHours: Number(item.idleHours || 0),
        utilizationPercentage: Math.min(
          100,
          Math.max(0, Number(item.utilizationPercentage || 0))
        ),
        idleDays: Number(item.idleDays || 0),
      }));

      setData(fixedData);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load utilization data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUtilization();

    const interval = setInterval(
      fetchUtilization,
      30000
    );

    return () => clearInterval(interval);
  }, []);

  const getCategoryClass = (category) => {
    switch (category) {
      case "HIGH":
        return "util-high";

      case "MEDIUM":
        return "util-medium";

      case "LOW":
        return "util-low";

      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.message}>
          Loading utilization data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>
            Equipment Utilization
          </h2>

          <p style={styles.subtitle}>
            Monitor equipment usage, idle time and
            utilization rates.
          </p>
        </div>

        <button
          style={styles.refreshButton}
          onClick={fetchUtilization}
        >
          Refresh
        </button>
      </div>

      {data.length === 0 ? (
        <div style={styles.empty}>
          No utilization data available.
        </div>
      ) : (
        <>
          <div style={styles.summaryGrid}>

            <div style={styles.card}>
              <span style={styles.label}>
                Equipment
              </span>

              <strong style={styles.value}>
                {data.length}
              </strong>
            </div>

            <div style={styles.card}>
              <span style={styles.label}>
                Average Utilization
              </span>

              <strong style={styles.value}>
                {(
                  data.reduce(
                    (sum, item) =>
                      sum + item.utilizationPercentage,
                    0
                  ) / data.length
                ).toFixed(1)}
                %
              </strong>
            </div>

            <div style={styles.card}>
              <span style={styles.label}>
                Total Used Hours
              </span>

              <strong style={styles.value}>
                {data
                  .reduce(
                    (sum, item) =>
                      sum + item.usedHours,
                    0
                  )
                  .toFixed(1)}
              </strong>
            </div>

            <div style={styles.card}>
              <span style={styles.label}>
                Total Idle Hours
              </span>

              <strong style={styles.value}>
                {data
                  .reduce(
                    (sum, item) =>
                      sum + item.idleHours,
                    0
                  )
                  .toFixed(1)}
              </strong>
            </div>

          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              Utilization by Equipment
            </h3>

            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="equipmentName"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={80}
                  />

                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value) =>
                      `${value}%`
                    }
                  />

                  <Tooltip
                    formatter={(value) =>
                      `${Number(value).toFixed(1)}%`
                    }
                  />

                  <Bar
                    dataKey="utilizationPercentage"
                    name="Utilization"
                    fill="#2563eb"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              Equipment Utilization Details
            </h3>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>
                      Equipment
                    </th>

                    <th style={styles.th}>
                      Used Hours
                    </th>

                    <th style={styles.th}>
                      Idle Hours
                    </th>

                    <th style={styles.th}>
                      Utilization
                    </th>

                    <th style={styles.th}>
                      Category
                    </th>

                    <th style={styles.th}>
                      Idle Days
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((item, index) => (
                    <tr key={`${item.equipmentName}-${index}`}>

                      <td style={styles.td}>
                        {item.equipmentName}
                      </td>

                      <td style={styles.td}>
                        {item.usedHours.toFixed(1)}
                      </td>

                      <td style={styles.td}>
                        {item.idleHours.toFixed(1)}
                      </td>

                      <td style={styles.td}>
                        <div style={styles.progressContainer}>
                          <div
                            style={{
                              ...styles.progress,
                              width: `${item.utilizationPercentage}%`,
                            }}
                          />
                        </div>

                        <span>
                          {item.utilizationPercentage.toFixed(1)}%
                        </span>
                      </td>

                      <td style={styles.td}>
                        <span
                          className={getCategoryClass(
                            item.category
                          )}
                          style={{
                            ...styles.badge,
                            ...(item.category === "HIGH"
                              ? styles.high
                              : item.category === "MEDIUM"
                              ? styles.medium
                              : styles.low),
                          }}
                        >
                          {item.category}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {item.idleDays}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
  },

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
    marginTop: "6px",
    color: "#64748b",
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

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },

  card: {
    background: "white",
    borderRadius: "10px",
    padding: "20px",
    border: "1px solid #e2e8f0",
  },

  label: {
    display: "block",
    color: "#64748b",
    fontSize: "14px",
    marginBottom: "8px",
  },

  value: {
    fontSize: "26px",
  },

  section: {
    background: "white",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    padding: "20px",
    marginBottom: "24px",
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: "20px",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "2px solid #e2e8f0",
    fontSize: "14px",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #e2e8f0",
  },

  progressContainer: {
    width: "100px",
    height: "8px",
    background: "#e2e8f0",
    borderRadius: "10px",
    display: "inline-block",
    marginRight: "8px",
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    background: "#2563eb",
    borderRadius: "10px",
  },

  badge: {
    padding: "5px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
  },

  high: {
    background: "#dcfce7",
    color: "#166534",
  },

  medium: {
    background: "#fef3c7",
    color: "#92400e",
  },

  low: {
    background: "#fee2e2",
    color: "#991b1b",
  },

  empty: {
    padding: "40px",
    textAlign: "center",
    background: "white",
    borderRadius: "10px",
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

export default Utilization;