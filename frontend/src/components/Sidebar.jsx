 import { Link } from "react-router-dom";

export default function Sidebar() {
  // Retrieve user role from local storage to handle conditional sidebar links
  const userRole = localStorage.getItem("role");

  return (
    <div
      style={{
        width: "220px",
        background: "#f4f4f4",
        minHeight: "calc(100vh - 60px)",
        padding: "20px",
      }}
    >
      <h3>Menu</h3>

      <p><Link to="/dashboard">Dashboard</Link></p>
      <p><Link to="/equipment">Equipment</Link></p>
      <p><Link to="/reservations">Reservations</Link></p>

      {/* Show Reports and User links only if the user is an Admin */}
      {userRole === "ROLE_ADMIN" && (
        <>
          <p><Link to="/reports">Reports</Link></p>
          <p><Link to="/user">User Management</Link></p>
        </>
      )}
    </div>
  );
}