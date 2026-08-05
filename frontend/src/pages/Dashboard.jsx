 import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("fullName");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div style={sidebarStyle}>
      <h2 style={logoStyle}>
        <span>🔬</span> Lab Panel
      </h2>

      {/* Navigation Links */}
      <div style={menuItemsStyle}>
        <Link to="/dashboard" style={linkStyle}>
          <span style={iconStyle}>📊</span> <span>Dashboard</span>
        </Link>

        {(role === "ADMIN" ||
          role === "FACULTY" ||
          role === "STUDENT" ||
          role === "LAB_TECHNICIAN") && (
          <Link to="/equipment" style={linkStyle}>
            <span style={iconStyle}>🧪</span> <span>Equipment</span>
          </Link>
        )}

        {(role === "ADMIN" || role === "FACULTY" || role === "STUDENT") && (
          <Link to="/reservations" style={linkStyle}>
            <span style={iconStyle}>📅</span> <span>Reservations</span>
          </Link>
        )}

        {(role === "ADMIN" || role === "FACULTY" || role === "LAB_TECHNICIAN") && (
          <Link to="/reports" style={linkStyle}>
            <span style={iconStyle}>📈</span> <span>Reports</span>
          </Link>
        )}

        {role === "ADMIN" && (
          <Link to="/user" style={linkStyle}>
            <span style={iconStyle}>👤</span> <span>User Management</span>
          </Link>
        )}
      </div>

      <hr style={dividerStyle} />

      <button onClick={handleLogout} style={logoutBtnStyle}>
        🚪 Logout
      </button>
    </div>
  );
}

/* ================== CSS STYLES ================== */

const sidebarStyle = {
  width: "270px",
  backgroundColor: "#0f172a",
  color: "#ffffff",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  flexShrink: 0,
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: 100,
  boxShadow: "4px 0 10px rgba(0, 0, 0, 0.05)",
  padding: "0",
};

const logoStyle = {
  padding: "24px 20px",
  margin: "0",
  fontSize: "1.4rem",
  backgroundColor: "#020617",
  borderBottom: "1px solid #1e293b",
  letterSpacing: "0.5px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const menuItemsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  padding: "20px 16px",
  flex: 1,
};

const linkStyle = {
  textDecoration: "none",
  padding: "14px 18px",
  display: "flex",
  alignItems: "center",
  gap: "14px",
  color: "#94a3b8",
  fontSize: "1.05rem",
  fontWeight: "500",
  borderRadius: "10px",
  transition: "all 0.2s ease-in-out",
};

const iconStyle = {
  fontSize: "1.1rem",
  display: "flex",
  alignItems: "center",
};

const dividerStyle = {
  borderColor: "#1e293b",
  margin: "0 16px",
};

const logoutBtnStyle = {
  margin: "20px 16px",
  backgroundColor: "#ef4444",
  color: "#ffffff",
  border: "none",
  padding: "12px 18px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  transition: "background-color 0.2s",
};

export default Sidebar;