 import { Link } from "react-router-dom";

function Navbar() {

  const role = localStorage.getItem("role");

  return (
    <nav style={navContainerStyle}>

      <div style={logoStyle}>
        🔬 Lab Platform
      </div>

      <div style={menuItemsStyle}>

        <Link to="/dashboard" style={linkStyle}>🏠 Dashboard</Link>

        {["ADMIN","FACULTY","STUDENT","LAB_TECHNICIAN"].includes(role) && (
          <Link to="/equipment" style={linkStyle}>⚙️ Equipment</Link>
        )}

        {["ADMIN","FACULTY","STUDENT"].includes(role) && (
          <Link to="/reservations" style={linkStyle}>📅 Reservations</Link>
        )}

        {["ADMIN","FACULTY","LAB_TECHNICIAN"].includes(role) && (
          <Link to="/reports" style={linkStyle}>📊 Reports</Link>
        )}

        {role === "ADMIN" && (
          <Link to="/users" style={linkStyle}>👥 Users</Link>
        )}

      </div>
    </nav>
  );
}

/* CSS */
const navContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "15px 30px",
  background: "#ffffff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
};

const logoStyle = {
  fontWeight: "700",
  fontSize: "18px"
};

const menuItemsStyle = {
  display: "flex",
  gap: "20px"
};

const linkStyle = {
  textDecoration: "none",
  color: "#334155",
  fontWeight: "600"
};

export default Navbar;