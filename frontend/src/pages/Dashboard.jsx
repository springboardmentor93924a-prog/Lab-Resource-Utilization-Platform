import "./Dashboard.css";
import { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [equipment, setEquipment] = useState([]);
  const [users, setUsers] = useState([]);
  const [utilData, setUtilData] = useState([]);

  const role = localStorage.getItem("role");
  const canViewUtilization = [
    "LAB_MANAGER",
    "DEPARTMENT_HEAD",
    "INSTITUTION_ADMIN",
    "SYSTEM_ADMIN",
  ].includes(role);

  const getUtilColor = (value) => {
    if (value >= 70) return "#22c55e";
    if (value >= 30) return "#f59e0b";
    return "#ef4444";
  };

  const getHeatmapClass = (level) => {
    switch (level) {
      case "HIGH":
        return "heat-high";
      case "MEDIUM":
        return "heat-medium";
      case "LOW":
        return "heat-low";
      default:
        return "heat-idle";
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchData = () => {
      fetch("http://localhost:8080/api/equipment", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then(setEquipment)
        .catch(console.error);

      fetch("http://localhost:8080/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then(setUsers)
        .catch(console.error);

      fetch("http://localhost:8080/api/utilization", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
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

  const idleEquipment = utilData.filter(
    (item) => item.idleDays >= 3
  );

  return (
    <div className="dashboard">

      {/* =========================
          PAGE HEADER
         ========================= */}

      <div className="dashboard-header">
        <div>
          <h2>Lab Resource Dashboard</h2>
          <p>
            Equipment utilization, idle time and usage analysis
          </p>
        </div>
      </div>


      {/* =========================
          SUMMARY CARDS
         ========================= */}

      <div className="cards">

        <div className="card">
          <span className="card-label">
            Total Equipment
          </span>

          <strong className="card-value">
            {totalEquipment}
          </strong>
        </div>


        <div className="card">
          <span className="card-label">
            Available Equipment
          </span>

          <strong className="card-value">
            {availableEquipment}
          </strong>
        </div>


        <div className="card">
          <span className="card-label">
            Booked Equipment
          </span>

          <strong className="card-value">
            {reservedEquipment}
          </strong>
        </div>


        <div className="card">
          <span className="card-label">
            Total Users
          </span>

          <strong className="card-value">
            {users.length}
          </strong>
        </div>

      </div>


      {/* =========================
          UTILIZATION TABLE
         ========================= */}

      {canViewUtilization && (
        <div className="dashboard-section">

          <div className="section-header">
            <div>
              <h2>Equipment Utilization</h2>
              <p>
                Utilization calculated for the last 7 days
              </p>
            </div>
          </div>


          <div className="table-wrapper">

            <table className="util-table">

              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Used Hours</th>
                  <th>Idle Hours</th>
                  <th>Utilization</th>
                  <th>Category</th>
                  <th>Idle Days</th>
                </tr>
              </thead>


              <tbody>

                {utilData.length === 0 ? (

                  <tr>
                    <td
                      colSpan="6"
                      className="empty-state"
                    >
                      No utilization data available
                    </td>
                  </tr>

                ) : (

                  utilData.map((item, index) => (

                    <tr key={index}>

                      <td className="equipment-name">
                        {item.equipmentName}
                      </td>

                      <td>
                        {item.usedHours} h
                      </td>

                      <td>
                        {item.idleHours} h
                      </td>

                      <td>

                        <div className="utilization-cell">

                          <div className="utilization-bar">

                            <div
                              className="utilization-fill"
                              style={{
                                width: `${item.utilizationPercentage}%`,
                                backgroundColor:
                                  getUtilColor(
                                    item.utilizationPercentage
                                  ),
                              }}
                            />

                          </div>

                          <span>
                            {Number(
                              item.utilizationPercentage
                            ).toFixed(1)}
                            %
                          </span>

                        </div>

                      </td>

                      <td>
                        <span
                          className={`category-badge ${item.category?.toLowerCase()}`}
                        >
                          {item.category}
                        </span>
                      </td>

                      <td>
                        {item.idleDays} days
                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>
      )}


      {/* =========================
          HEATMAP
         ========================= */}

      {canViewUtilization && (
        <div className="dashboard-section">

          <div className="section-header">

            <div>
              <h2>Weekly Utilization Heatmap</h2>

              <p>
                Equipment usage intensity from Monday to Friday
              </p>
            </div>


            <div className="heatmap-legend">

              <span>
                <i className="legend-box heat-high"></i>
                High
              </span>

              <span>
                <i className="legend-box heat-medium"></i>
                Medium
              </span>

              <span>
                <i className="legend-box heat-low"></i>
                Low
              </span>

              <span>
                <i className="legend-box heat-idle"></i>
                Idle
              </span>

            </div>

          </div>


          <div className="heatmap-wrapper">

            <div className="heatmap-grid">

              <div className="heatmap-header equipment-column">
                Equipment
              </div>

              <div className="heatmap-header">
                Monday
              </div>

              <div className="heatmap-header">
                Tuesday
              </div>

              <div className="heatmap-header">
                Wednesday
              </div>

              <div className="heatmap-header">
                Thursday
              </div>

              <div className="heatmap-header">
                Friday
              </div>


              {utilData.map((item, index) => (

                <div
                  className="heatmap-row"
                  key={index}
                >

                  <div className="equipment-column equipment-name">
                    {item.equipmentName}
                  </div>

                  <div
                    className={`heat-cell ${getHeatmapClass(
                      item.monday
                    )}`}
                  >
                    {item.monday || "IDLE"}
                  </div>

                  <div
                    className={`heat-cell ${getHeatmapClass(
                      item.tuesday
                    )}`}
                  >
                    {item.tuesday || "IDLE"}
                  </div>

                  <div
                    className={`heat-cell ${getHeatmapClass(
                      item.wednesday
                    )}`}
                  >
                    {item.wednesday || "IDLE"}
                  </div>

                  <div
                    className={`heat-cell ${getHeatmapClass(
                      item.thursday
                    )}`}
                  >
                    {item.thursday || "IDLE"}
                  </div>

                  <div
                    className={`heat-cell ${getHeatmapClass(
                      item.friday
                    )}`}
                  >
                    {item.friday || "IDLE"}
                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>
      )}


      {/* =========================
          IDLE EQUIPMENT
         ========================= */}

      {canViewUtilization && (
        <div className="dashboard-section">

          <div className="section-header">

            <div>
              <h2>Idle Equipment</h2>

              <p>
                Equipment that has not been used recently
              </p>
            </div>

          </div>


          {idleEquipment.length === 0 ? (

            <div className="empty-card">
              No equipment has been idle for 3 or more days.
            </div>

          ) : (

            <div className="idle-grid">

              {idleEquipment.map((item, index) => (

                <div
                  className="idle-card"
                  key={index}
                >

                  <div className="idle-icon">
                    💤
                  </div>

                  <div>

                    <h3>
                      {item.equipmentName}
                    </h3>

                    <p>
                      Idle for{" "}
                      <strong>
                        {item.idleDays} days
                      </strong>
                    </p>

                    <span>
                      Utilization:{" "}
                      {Number(
                        item.utilizationPercentage
                      ).toFixed(1)}
                      %
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>
      )}


      {/* =========================
          UTILIZATION CHART
         ========================= */}

      {canViewUtilization && (
        <div className="dashboard-section">

          <div className="section-header">

            <div>
              <h2>Utilization Comparison</h2>

              <p>
                Equipment utilization percentage
              </p>
            </div>

          </div>


          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height={350}
            >

              <BarChart
                data={utilData}
                margin={{
                  top: 20,
                  right: 20,
                  left: 0,
                  bottom: 60,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="equipmentName"
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />

                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />

                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toFixed(1)}%`,
                    "Utilization",
                  ]}
                />

                <Bar
                  dataKey="utilizationPercentage"
                  fill="#4f46e5"
                  radius={[8, 8, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>
      )}

    </div>
  );
}

export default Dashboard;