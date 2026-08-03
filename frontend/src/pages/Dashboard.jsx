 import "./Dashboard.css";

export default function Dashboard() {
  // Retrieve the user role saved during login from local storage
  const userRole = localStorage.getItem("role");

  return (
    <div className="dashboard-container">
      {/* Welcome Header Section */}
      <div className="dashboard-header">
        <h2>Welcome to Dashboard</h2>
        <p>
          Current User Role: <span className="role-badge">{userRole || "GUEST"}</span>
        </p>
      </div>

      {/* Cards Grid Section */}
      <div className="cards-grid">
        {/* If the user is an ADMIN, show admin controls card */}
        {userRole === "ROLE_ADMIN" && (
          <div className="card admin-card">
            <div className="card-icon">👑</div>
            <div className="card-content">
              <h3>Admin Controls</h3>
              <p>Manage lab resources, approve or reject all user bookings, and oversee system reports.</p>
            </div>
          </div>
        )}

        {/* If the user is a STUDENT, show student portal card */}
        {userRole === "ROLE_STUDENT" && (
          <div className="card student-card">
            <div className="card-icon">🎓</div>
            <div className="card-content">
              <h3>Student Portal</h3>
              <p>Explore available lab equipment and send new requests to book resources easily.</p>
            </div>
          </div>
        )}

        {/* General Quick Info Card visible to all */}
        <div className="card info-card">
          <div className="card-icon">⚡</div>
          <div className="card-content">
            <h3>Quick Status</h3>
            <p>System is running smoothly. Ensure all safety guidelines are followed inside the lab.</p>
          </div>
        </div>
      </div>
    </div>
  );
}