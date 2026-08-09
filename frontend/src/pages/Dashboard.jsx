 import "./Dashboard.css";
import { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

function Dashboard() {
  const [equipment, setEquipment] = useState([]);
  const [users, setUsers] = useState([]);
  const [utilData, setUtilData] = useState([]);

  // 🔥 Utilization % color (table)
  const getUtilColor = (value) => {
    if (value > 70) return "#4CAF50";
    if (value > 40) return "#FFC107";
    return "#F44336";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchData = () => {
      fetch("http://localhost:8080/api/equipment", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(setEquipment)
        .catch(console.error);

      fetch("http://localhost:8080/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(setUsers)
        .catch(console.error);

      fetch("http://localhost:8080/api/utilization", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          // 🔥 FIX: limit % between 0–100
          const fixedData = data.map((item) => ({
            ...item,
            utilizationPercentage: Math.min(
              100,
              Math.max(0, item.utilizationPercentage || 0)
            ),
          }));
          setUtilData(fixedData);
        })
        .catch(console.error);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);

  }, []);

  const totalEquipment = equipment.length;

  const availableEquipment = equipment.filter(
    (item) => item.status === "Available"
  ).length;

  const reservedEquipment = equipment.filter(
    (item) => item.status === "Booked"
  ).length;

  return (
    <div className="dashboard">

      <h2 className="dashboard-title">Lab Resource Dashboard</h2>

      {/* CARDS */}
      <div className="cards">
        <div className="card">
          <h3>Total Equipment</h3>
          <p>{totalEquipment}</p>
        </div>

        <div className="card">
          <h3>Available Equipment</h3>
          <p>{availableEquipment}</p>
        </div>

        <div className="card">
          <h3>Reserved Equipment</h3>
          <p>{reservedEquipment}</p>
        </div>

        <div className="card">
          <h3>Total Users</h3>
          <p>{users.length}</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <h2>Equipment Utilization</h2>

        <table className="util-table">
          <thead>
            <tr>
              <th>Equipment Name</th>
              <th>Used Hours</th>
              <th>Idle Hours</th>
              <th>Utilization %</th>
              <th>Category</th>
              <th>Idle Days</th>
            </tr>
          </thead>

          <tbody>
            {utilData.map((item, index) => (
              <tr key={index}>
                <td>{item.equipmentName}</td>
                <td>{item.usedHours}</td>
                <td>{item.idleHours}</td>

                <td
                  style={{
                    backgroundColor: getUtilColor(item.utilizationPercentage),
                    color: "#fff",
                    fontWeight: "bold"
                  }}
                >
                  {Number(item.utilizationPercentage).toFixed(1)}%
                </td>

                <td>{item.category}</td>
                <td>{item.idleDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔥 IMPROVED CHART */}
      <div className="chart-container">
        <h2>Utilization Chart</h2>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={utilData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="equipmentName"
              angle={-20}
              textAnchor="end"
              interval={0}
            />

            {/* 🔥 FIX: Y-axis 0–100 */}
            <YAxis domain={[0, 100]} />

            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "10px",
                border: "1px solid #ddd"
              }}
            />

            <Bar
              dataKey="utilizationPercentage"
              fill="#4CAF50"
              radius={[10, 10, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default Dashboard;