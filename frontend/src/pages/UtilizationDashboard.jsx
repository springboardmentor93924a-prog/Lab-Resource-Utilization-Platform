import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getEquipmentUtilization } from "../services/equipmentService";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function getStatusColor(status) {
  switch (status) {
    case "AVAILABLE":
      return "#22c55e";
    case "IN_USE":
      return "#f59e0b";
    case "MAINTENANCE":
      return "#ef4444";
    default:
      return "#94a3b8";
  }
}

const cardStyle = {
  borderRadius: "12px",
  padding: "20px",
  color: "#fff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

export default function UtilizationDashboard() {
  const [equipment, setEquipment] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const data = await getEquipmentUtilization();
      setEquipment(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const total = equipment.length;
  const available = equipment.filter((e) => e.status === "AVAILABLE").length;
  const inUse = equipment.filter((e) => e.status === "IN_USE").length;
  const maintenance = equipment.filter((e) => e.status === "MAINTENANCE").length;

  const avgUtilization =
    total === 0
      ? 0
      : (equipment.reduce((sum, e) => sum + (e.utilizationRate || 0), 0) / total).toFixed(1);

  const chartData = {
    labels: equipment.map((e) => e.equipmentName),
    datasets: [
      {
        label: "Usage Hours",
        data: equipment.map((e) => e.usageHours),
        backgroundColor: "#2DD4BF",
      },
    ],
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside className="sidebar">
        <Sidebar />
      </aside>

      <main style={{ flex: 1, padding: "30px" }}>
        <h2 style={{ fontWeight: 700, color: "#0F1B2D", marginBottom: "4px" }}>
          Utilization Dashboard
        </h2>
        <p style={{ color: "#64748B", marginBottom: "25px" }}>Last updated: {lastUpdated}</p>

        {loading && <p>Loading utilization data...</p>}

        {!loading && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginBottom: "25px",
              }}
            >
              <div style={{ ...cardStyle, background: "#2563EB" }}>
                <h1 style={{ margin: 0, fontSize: "36px" }}>{total}</h1>
                <p style={{ margin: 0 }}>Total Equipment</p>
              </div>
              <div style={{ ...cardStyle, background: "#22c55e" }}>
                <h1 style={{ margin: 0, fontSize: "36px" }}>{available}</h1>
                <p style={{ margin: 0 }}>Available</p>
              </div>
              <div style={{ ...cardStyle, background: "#f59e0b" }}>
                <h1 style={{ margin: 0, fontSize: "36px" }}>{inUse}</h1>
                <p style={{ margin: 0 }}>In use</p>
              </div>
              <div style={{ ...cardStyle, background: "#ef4444" }}>
                <h1 style={{ margin: 0, fontSize: "36px" }}>{maintenance}</h1>
                <p style={{ margin: 0 }}>Maintenance</p>
              </div>
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "25px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                maxWidth: "320px",
              }}
            >
              <h5 style={{ color: "#0F1B2D", marginBottom: "8px" }}>Average Utilization</h5>
              <h1 style={{ margin: 0, color: "#0F1B2D" }}>{avgUtilization}%</h1>
            </div>
<div
  style={{
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "25px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  }}
>
  <h5 style={{ color: "#0F1B2D", marginBottom: "15px" }}>High demand equipment</h5>
  {equipment.filter((e) => e.highDemand).length === 0 && (
    <p style={{ color: "#64748B" }}>No equipment currently flagged as high demand.</p>
  )}
  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
    {equipment
      .filter((e) => e.highDemand)
      .map((e) => (
        <span
          key={e.id}
          style={{
            background: "#FB923C",
            color: "#fff",
            padding: "6px 14px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {e.equipmentName} ({e.totalBookings} bookings)
        </span>
      ))}
  </div>
</div>
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "25px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
            >
              <h4 style={{ color: "#0F1B2D", marginBottom: "20px" }}>Equipment Usage Hours</h4>
              <Bar data={chartData} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}