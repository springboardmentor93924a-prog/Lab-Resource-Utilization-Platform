 import { Link, useNavigate } from "react-router-dom";

function Sidebar() {

  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{
      width: "220px",
      background: "#f8fafc",
      minHeight: "100vh",
      padding: "20px"
    }}>

      <h3>Menu</h3>

      {/* Dashboard - sabko */}
      <p><Link to="/dashboard">Dashboard</Link></p>

      {/* Equipment - sab roles */}
      {["ADMIN","FACULTY","STUDENT","LAB_TECHNICIAN"].includes(role) && (
        <p><Link to="/equipment">Equipment</Link></p>
      )}

      {/* Reservations - no technician */}
      {["ADMIN","FACULTY","STUDENT"].includes(role) && (
        <p><Link to="/reservations">Reservations</Link></p>
      )}

      {/* Reports - no student */}
      {["ADMIN","FACULTY","LAB_TECHNICIAN"].includes(role) && (
        <p><Link to="/reports">Reports</Link></p>
      )}

      {/* User Management - only admin */}
      {role === "ADMIN" && (
        <p><Link to="/users">User Management</Link></p>
      )}

      <hr />

      <button onClick={handleLogout}>Logout</button>

    </div>
  );
}

export default Sidebar;