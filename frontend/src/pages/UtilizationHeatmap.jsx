import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getEquipmentUtilization } from "../services/equipmentService";

function getColor(rate) {
  if (rate <= 40) return "#22c55e";
  if (rate <= 70) return "#f59e0b";
  return "#ef4444";
}

export default function UtilizationHeatmap() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEquipment();
    const interval = setInterval(loadEquipment, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadEquipment() {
    try {
      const data = await getEquipmentUtilization();
      setEquipment(data);
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
        <h2 style={{ fontWeight: 700, color: "#0F1B2D", marginBottom: "25px" }}>
          Equipment Utilization Heatmap
        </h2>

        {loading && <p>Loading...</p>}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {equipment.map((item) => {
            const color = getColor(item.utilizationRate);
            return (
              <div
                key={item.id}
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "20px",
                  borderTop: `5px solid ${color}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
  <h4 style={{ color: "#0F1B2D", marginBottom: "10px" }}>{item.equipmentName}</h4>
  <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
    {item.highDemand && (
      <span
        style={{
          background: "#FB923C",
          color: "#fff",
          padding: "4px 10px",
          borderRadius: "999px",
          fontSize: "11px",
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        High demand
      </span>
    )}
    {item.isIdle && (
      <span
        style={{
          background: "#94A3B8",
          color: "#fff",
          padding: "4px 10px",
          borderRadius: "999px",
          fontSize: "11px",
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        Idle
      </span>
    )}
  </div>
</div>
<hr />
                <p>
                  <strong>Category:</strong> {item.category}
                </p>
                <p>
                  <strong>Status:</strong> {item.status}
                </p>
                <p>
                  <strong>Usage hours:</strong> {item.usageHours}
                </p>
                <p>
                  <strong>Total bookings:</strong> {item.totalBookings}
                </p>
                <div
                  style={{
                    background: "#E2E8F0",
                    borderRadius: "6px",
                    height: "24px",
                    overflow: "hidden",
                    marginTop: "10px",
                  }}
                >
                  <div
                    style={{
                      width: `${item.utilizationRate}%`,
                      background: color,
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    {item.utilizationRate}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}