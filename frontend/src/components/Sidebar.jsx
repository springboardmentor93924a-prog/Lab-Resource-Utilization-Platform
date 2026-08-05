 import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  // State to manage sidebar open/close toggle
  const [isOpen, setIsOpen] = useState(true);

  // Toggle function for sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("fullName");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <>
      {/* Toggle Button to open/close sidebar */}
      <button style={toggleBtnStyle} onClick={toggleSidebar}>
        {isOpen ? "✕ Close Menu" : "☰ Open Menu"}
      </button>

      {/* Sidebar Container */}
      <div
        style={{
          ...sidebarStyle,
          width: isOpen ? "260px" : "0px",
          padding: isOpen ? "25px 20px" : "0px",
          borderRight: isOpen ? "1px solid #1e293b" : "none",
        }}
      >
        <h3 style={{ ...logoStyle, opacity: isOpen ? 1 : 0 }}>
          <span>🔬</span> Lab Menu
        </h3>

        {/* Navigation Links with Icons and Equal Spacing */}
        <div style={menuItemsStyle}>
          {/* Dashboard */}
          <Link to="/dashboard" style={linkStyle}>
            <span style={iconStyle}>🏠</span> <span>Dashboard</span>
          </Link>

          {/* Equipment */}
          {(role === "ADMIN" ||
            role === "FACULTY" ||
            role === "STUDENT" ||
            role === "LAB_TECHNICIAN") && (
            <Link to="/equipment" style={linkStyle}>
              <span style={iconStyle}>⚙️</span> <span>Equipment</span>
            </Link>
          )}

          {/* Reservations */}
          {(role === "ADMIN" || role === "FACULTY" || role === "STUDENT") && (
            <Link to="/reservations" style={linkStyle}>
              <span style={iconStyle}>📅</span> <span>Reservations</span>
            </Link>
          )}

          {/* Reports */}
          {(role === "ADMIN" || role === "FACULTY" || role === "LAB_TECHNICIAN") && (
            <Link to="/reports" style={linkStyle}>
              <span style={iconStyle}>📊</span> <span>Reports</span>
            </Link>
          )}

          {/* User Management */}
          {role === "ADMIN" && (
            <Link to="/user" style={linkStyle}>
              <span style={iconStyle}>👥</span> <span>User Management</span>
            </Link>
          )}
        </div>

        <hr style={dividerStyle} />

        {/* Logout Button */}
        {isOpen && (
          <button onClick={handleLogout} style={logoutBtnStyle}>
            🚪 Logout
          </button>
        )}
      </div>
    </>
  );
}

/* ================== CSS STYLES ================== */

const sidebarStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  height: "100vh",
  backgroundColor: "#0f172a", // Sleek Dark/Black background
  color: "#f8fafc",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  boxShadow: "4px 0 15px rgba(0, 0, 0, 0.3)",
  transition: "all 0.3s ease-in-out",
  overflowX: "hidden",
  zIndex: 1100,
  display: "flex",
  flexDirection: "column",
};

const logoStyle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "30px",
  paddingBottom: "15px",
  borderBottom: "1px solid #1e293b",
  whiteSpace: "nowrap",
  transition: "opacity 0.2s",
  margin: "0 0 25px 0",
};

const menuItemsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px", // Equal spacing between navigation items
  width: "100%",
  flex: 1,
};

const linkStyle = {
  textDecoration: "none", // Completely removes the underline
  color: "#94a3b8", // Muted text color for dark theme
  fontSize: "15px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 14px",
  borderRadius: "8px",
  transition: "all 0.2s ease-in-out",
  whiteSpace: "nowrap",
};

const iconStyle = {
  fontSize: "18px",
  display: "flex",
  alignItems: "center",
};

const dividerStyle = {
  borderColor: "#1e293b",
  margin: "20px 0",
};

const toggleBtnStyle = {
  position: "fixed",
  top: "15px",
  left: "20px",
  zIndex: 1200,
  backgroundColor: "#1e293b",
  color: "#ffffff",
  border: "none",
  padding: "8px 14px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
};

const logoutBtnStyle = {
  backgroundColor: "#ef4444",
  color: "#ffffff",
  border: "none",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  transition: "background-color 0.2s",
  width: "100%",
  whiteSpace: "nowrap",
};

export default Sidebar;