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
  const [myBookings, setMyBookings] = useState([]);
  const [myWaitlist, setMyWaitlist] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);

  const role = sessionStorage.getItem("role");
  const myInstitutionId = sessionStorage.getItem("institutionId");

  const canViewUtilization = [
    "LAB_MANAGER",
    "DEPARTMENT_HEAD",
    "INSTITUTION_ADMIN",
    "SYSTEM_ADMIN",
  ].includes(role);

  const canViewUsers = [
    "INSTITUTION_ADMIN",
    "SYSTEM_ADMIN",
  ].includes(role);

  const isStudent = role === "STUDENT";
  const isTechnician = role === "LAB_TECHNICIAN";

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
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("userId");

    const fetchData = () => {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/equipment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then(setEquipment)
        .catch(console.error);

      // ===== FIX: gated behind canViewUsers (was unconditional before) =====
      if (canViewUsers) {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then(setUsers)
          .catch(console.error);
      }

      const canViewUtilization = [
        "LAB_MANAGER",
        "DEPARTMENT_HEAD",
        "INSTITUTION_ADMIN",
        "SYSTEM_ADMIN",
      ].includes(role);

      // Backend restricts /api/utilization to manager-tier roles —
      // this was firing unconditionally before, so STUDENT/LAB_TECHNICIAN
      // got a repeated failed 403 call every 5s.
      if (canViewUtilization) {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/utilization`, {
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
      }

      if (role === "STUDENT") {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) =>
            setMyBookings(
              data.filter((b) => String(b.user?.userId) === String(userId))
            )
          )
          .catch(console.error);

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/waitlist/my`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then(setMyWaitlist)
          .catch(console.error);
      }

      if (role === "LAB_TECHNICIAN") {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/maintenance`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then(setMaintenanceRecords)
          .catch(console.error);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, [role]);

  // Equipment.jsx and the booking dropdown intentionally show every
  // institution's equipment (needed for cross-college booking), but
  // these Dashboard counts should reflect only the viewer's own
  // institution — otherwise every college's admin sees the same
  // combined platform-wide numbers. SYSTEM_ADMIN sees the real total.
  // Lab Manager / Department Head / Lab Technician are further limited
  // to their own department's equipment.
  const myDepartmentId = sessionStorage.getItem("departmentId");
  const isDepartmentScoped = [
    "LAB_MANAGER",
    "DEPARTMENT_HEAD",
    "LAB_TECHNICIAN",
  ].includes(role);

  const scopedEquipment =
    role === "SYSTEM_ADMIN" || !myInstitutionId
      ? equipment
      : equipment.filter(
          (item) =>
            String(item.institution?.institutionId) === String(myInstitutionId) &&
            (!isDepartmentScoped ||
              String(item.department?.departmentId) === String(myDepartmentId))
        );

  const totalEquipment = scopedEquipment.length;

  const availableEquipment = scopedEquipment.filter(
    (item) => item.status === "Available"
  ).length;

  const reservedEquipment = scopedEquipment.filter(
    (item) => item.status === "Booked"
  ).length;

  const idleEquipment = utilData.filter(
    (item) => item.idleDays >= 3
  );

  const highDemandEquipment = utilData
    .filter(
      (item) =>
        (item.bookingCount || 0) >= 3 || (item.waitlistCount || 0) >= 1
    )
    .sort(
      (a, b) =>
        (b.bookingCount || 0) + (b.waitlistCount || 0) -
        ((a.bookingCount || 0) + (a.waitlistCount || 0))
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

        {canViewUsers && (
          <div className="card">
            <span className="card-label">
              Total Users
            </span>

            <strong className="card-value">
              {users.length}
            </strong>
          </div>
        )}

      </div>


      {/* =========================
          STUDENT: MY BOOKINGS
         ========================= */}

      {isStudent && (
        <div className="dashboard-section">

          <div className="section-header">
            <div>
              <h2>My Bookings</h2>
              <p>Your recent and upcoming equipment bookings</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="util-table">
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Date</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myBookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      You have no bookings yet.
                    </td>
                  </tr>
                ) : (
                  myBookings.slice(0, 5).map((b) => (
                    <tr key={b.bookingId}>
                      <td className="equipment-name">
                        {b.equipment?.equipmentName}
                      </td>
                      <td>{b.bookingDate}</td>
                      <td>{b.startTime?.replace("T", " ")}</td>
                      <td>{b.endTime?.replace("T", " ")}</td>
                      <td>{b.bookingStatus}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* =========================
          STUDENT: MY WAITLIST
         ========================= */}

      {isStudent && (
        <div className="dashboard-section">

          <div className="section-header">
            <div>
              <h2>My Waitlist</h2>
              <p>Equipment you're currently waiting on</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="util-table">
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Requested Start</th>
                  <th>Requested End</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myWaitlist.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-state">
                      You're not on any waitlists right now.
                    </td>
                  </tr>
                ) : (
                  myWaitlist.slice(0, 5).map((w) => (
                    <tr key={w.waitlistId}>
                      <td className="equipment-name">
                        {w.equipment?.equipmentName}
                      </td>
                      <td>{w.requestedStartTime?.replace("T", " ")}</td>
                      <td>{w.requestedEndTime?.replace("T", " ")}</td>
                      <td>{w.waitlistStatus}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* =========================
          TECHNICIAN: MAINTENANCE TASKS
         ========================= */}

      {isTechnician && (
        <div className="dashboard-section">

          <div className="section-header">
            <div>
              <h2>Maintenance Tasks</h2>
              <p>Scheduled and active maintenance records</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="util-table">
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-state">
                      No maintenance records found.
                    </td>
                  </tr>
                ) : (
                  maintenanceRecords.slice(0, 8).map((m) => (
                    <tr key={m.maintenanceId}>
                      <td className="equipment-name">
                        {m.equipment?.equipmentName}
                      </td>
                      <td>{m.maintenanceType}</td>
                      <td>{m.maintenanceDate}</td>
                      <td>{m.maintenanceStatus}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


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
          HIGH-DEMAND EQUIPMENT
         ========================= */}

      {canViewUtilization && (
        <div className="dashboard-section">

          <div className="section-header">

            <div>
              <h2>High-Demand Equipment</h2>

              <p>
                Equipment with heavy bookings or an active waitlist
              </p>
            </div>

          </div>


          {highDemandEquipment.length === 0 ? (

            <div className="empty-card">
              No equipment is currently in high demand.
            </div>

          ) : (

            <div className="idle-grid">

              {highDemandEquipment.map((item, index) => (

                <div
                  className="idle-card"
                  key={index}
                >

                  <div className="idle-icon">
                    🔥
                  </div>

                  <div>

                    <h3>
                      {item.equipmentName}
                    </h3>

                    <p>
                      <strong>
                        {item.bookingCount || 0}
                      </strong>{" "}
                      bookings this week
                    </p>

                    <span>
                      {(item.waitlistCount || 0) > 0
                        ? `${item.waitlistCount} waiting`
                        : "No one waiting"}
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