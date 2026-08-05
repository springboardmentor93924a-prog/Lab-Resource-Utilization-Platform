 import "./Dashboard.css";
import { useEffect, useState } from "react";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [equipment, setEquipment] = useState([]);
  const [users, setUsers] = useState([]);

  const fullName = localStorage.getItem("fullName") || "Lab Admin";
  const role = localStorage.getItem("role") || "Manager";

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8080/api/equipment", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setEquipment(Array.isArray(data) ? data : []))
      .catch(err => console.log(err));

    fetch("http://localhost:8080/api/users", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(err => console.log(err));

  }, []);

  const totalEquipment = equipment.length;
  const availableEquipment = equipment.filter(e => e.status === "Available").length;
  const reservedEquipment = equipment.filter(e => e.status === "Reserved").length;

  return (
    <div className="layout">

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "active" : ""}`}>
        <h2>Lab Panel</h2>
        <ul>
          <li 
            className={activeTab === "dashboard" ? "active-tab" : ""} 
            onClick={() => setActiveTab("dashboard")}
          >
            📊 Dashboard
          </li>
          <li 
            className={activeTab === "equipment" ? "active-tab" : ""} 
            onClick={() => setActiveTab("equipment")}
          >
            🧪 Equipment
          </li>
          <li 
            className={activeTab === "reservations" ? "active-tab" : ""} 
            onClick={() => setActiveTab("reservations")}
          >
            📅 Reservations
          </li>
          <li 
            className={activeTab === "users" ? "active-tab" : ""} 
            onClick={() => setActiveTab("users")}
          >
            👤 Users
          </li>
        </ul>
      </div>

      {/* Main Container */}
      <div className="main">

        {/* Navbar */}
        <div className="navbar">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>

          <div className="profile">
            <div className="avatar">{fullName ? fullName.charAt(0).toUpperCase() : "U"}</div>
            <div>
              <p className="name">{fullName}</p>
              <span className="role">{role}</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="content-area">

          {activeTab === "dashboard" && (
            <>
              {/* Cards */}
              <div className="cards">
                <div className="card blue">
                  <h4>Total Equipment</h4>
                  <p>{totalEquipment}</p>
                </div>

                <div className="card green">
                  <h4>Available</h4>
                  <p>{availableEquipment}</p>
                </div>

                <div className="card orange">
                  <h4>Reserved</h4>
                  <p>{reservedEquipment}</p>
                </div>

                <div className="card purple">
                  <h4>Users</h4>
                  <p>{users.length}</p>
                </div>
              </div>

              {/* Table */}
              <div className="table-box">
                <h3>Equipment List</h3>
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipment.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{item.name}</td>
                          <td>
                            <span className={`status-badge ${item.status ? item.status.toLowerCase() : ""}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === "equipment" && (
            <div className="table-box">
              <h3>Equipment Management</h3>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipment.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                        <td>{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "reservations" && (
            <div className="table-box">
              <h3>Reservations Schedule</h3>
              <p style={{ color: "#64748b", padding: "10px 0" }}>No active reservations to display.</p>
            </div>
          )}

          {activeTab === "users" && (
            <div className="table-box">
              <h3>System Users</h3>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.fullName || u.name}</td>
                        <td>{u.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default Dashboard;