 import { Link } from "react-router-dom"; // If you are using React Router

function Navbar() {
  return (
    <nav style={navContainerStyle}>
      {/* Brand Logo and Title */}
      <div style={logoStyle}>
        <span style={{ fontSize: "20px" }}>🔬</span> Lab Platform
      </div>

      {/* Navigation Links with Equal Spacing and Icons */}
      <div style={menuItemsStyle}>
        <Link to="/dashboard" style={linkStyle}>
          <span style={iconStyle}>🏠</span> Dashboard
        </Link>
        <Link to="/equipment" style={linkStyle}>
          <span style={iconStyle}>⚙️</span> Equipment
        </Link>
        <Link to="/reservations" style={linkStyle}>
          <span style={iconStyle}>📅</span> Reservations
        </Link>
        <Link to="/reports" style={linkStyle}>
          <span style={iconStyle}>📊</span> Reports
        </Link>
        <Link to="/users" style={linkStyle}>
          <span style={iconStyle}>👥</span> User Management
        </Link>
      </div>
    </nav>
  );
}

/* ================== CSS STYLES ================== */

const navContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#ffffff",
  padding: "15px 30px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  position: "sticky",
  top: 0,
  zIndex: 1000,
};

const logoStyle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#1e293b",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const menuItemsStyle = {
  display: "flex",
  gap: "25px", // Proper and equal spacing between menu items
  alignItems: "center",
  flexWrap: "wrap",
};

const linkStyle = {
  textDecoration: "none", // Completely removes the underline
  color: "#475569",
  fontSize: "14px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "8px 12px",
  borderRadius: "6px",
  transition: "all 0.2s ease-in-out",
};

const iconStyle = {
  fontSize: "16px",
  display: "flex",
  alignItems: "center",
};

export default Navbar;