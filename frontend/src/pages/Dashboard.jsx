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

  // 🔥 HEATMAP COLOR LOGIC
  const getColor = (value) => {
    const percentage = Number(value || 0);

    if (percentage > 70) return "#ff4d4d"; // RED
    if (percentage > 40) return "#ffd633"; // YELLOW
    return "#66cc66"; // GREEN
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 🔥 API CALL FUNCTION (REAL-TIME UPDATE के लिए)
    const fetchData = () => {
      // Equipment
      fetch("http://localhost:8080/api/equipment", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(setEquipment)
        .catch((err) => console.error(err));

      // Users
      fetch("http://localhost:8080/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(setUsers)
        .catch((err) => console.error(err));

      // Utilization
      fetch("http://localhost:8080/api/utilization", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(setUtilData)
        .catch((err) => console.error(err));
    };

    // 🔥 FIRST LOAD
    fetchData();

    // 🔥 REAL-TIME UPDATE START (हर 5 सेकंड में refresh)
    const interval = setInterval(fetchData, 5000);

    // 🔥 CLEANUP (important)
    return () => clearInterval(interval);

  }, []);

  const totalEquipment = equipment.length;

  const availableEquipment = equipment.filter(
    (item) => item.status === "Available"
  ).length;

  const reservedEquipment = equipment.filter(
    (item) => item.status === "Reserved"
  ).length;

  return (
    <div className="dashboard">

      <h2>Dashboard</h2>

      {/* 🔥 CARDS */}
      <div className="cards">
        <div className="card">
          <h3>Total Equipment</h3>
          <p>{totalEquipment}</p>
        </div>

        <div className="card">
          <h3>Available</h3>
          <p>{availableEquipment}</p>
        </div>

        <div className="card">
          <h3>Reserved</h3>
          <p>{reservedEquipment}</p>
        </div>

        <div className="card">
          <h3>Users</h3>
          <p>{users.length}</p>
        </div>
      </div>

      {/* 🔥 HEATMAP TABLE */}
      <div style={{ marginTop: "40px" }}>
        <h2>Utilization Heatmap</h2>

        <table border="1" cellPadding="10" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Used Hours</th>
              <th>Idle Hours</th>
              <th>Utilization (%)</th>
              <th>Category</th>
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
                    backgroundColor: getColor(item.utilizationPercentage),
                    fontWeight: "bold"
                  }}
                >
                  {Number(item.utilizationPercentage || 0).toFixed(2)}
                </td>

                <td>{item.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔥 BAR CHART */}
      <div style={{ marginTop: "50px" }}>
        <h2>Utilization Chart</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={utilData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis dataKey="equipmentName" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="utilizationPercentage" fill="#4CAF50" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default Dashboard;