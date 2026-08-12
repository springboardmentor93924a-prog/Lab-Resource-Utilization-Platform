import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const canAccessEquipment = [
    "STUDENT",
    "LAB_TECHNICIAN",
    "LAB_MANAGER",
    "DEPARTMENT_HEAD",
    "INSTITUTION_ADMIN",
    "SYSTEM_ADMIN"
  ].includes(role);

  const canAccessBookings = [
    "STUDENT",
    "LAB_MANAGER",
    "DEPARTMENT_HEAD",
    "INSTITUTION_ADMIN",
    "SYSTEM_ADMIN"
  ].includes(role);

  const canAccessMaintenance = [
    "LAB_TECHNICIAN",
    "LAB_MANAGER",
    "DEPARTMENT_HEAD",
    "INSTITUTION_ADMIN",
    "SYSTEM_ADMIN"
  ].includes(role);

  const canAccessUtilization = [
    "LAB_MANAGER",
    "DEPARTMENT_HEAD",
    "INSTITUTION_ADMIN",
    "SYSTEM_ADMIN"
  ].includes(role);

  const canAccessReports = [
    "LAB_MANAGER",
    "DEPARTMENT_HEAD",
    "INSTITUTION_ADMIN",
    "SYSTEM_ADMIN"
  ].includes(role);

  const canAccessUsers = [
    "INSTITUTION_ADMIN",
    "SYSTEM_ADMIN"
  ].includes(role);

  return (
    <aside className="sidebar">

      <div className="sidebar-header">
        <div className="sidebar-logo">🔬</div>

        <div>
          <h2>Lab Platform</h2>
          <span>
            {role
              ? role.replaceAll("_", " ")
              : "User"}
          </span>
        </div>
      </div>

      <nav className="sidebar-menu">

        <Link
          to="/dashboard"
          className={`sidebar-link ${
            isActive("/dashboard") ? "active" : ""
          }`}
        >
          <span>🏠</span>
          Dashboard
        </Link>

        {canAccessEquipment && (
          <Link
            to="/equipment"
            className={`sidebar-link ${
              isActive("/equipment") ? "active" : ""
            }`}
          >
            <span>⚙️</span>
            Equipment
          </Link>
        )}

        {canAccessBookings && (
          <Link
            to="/reservations"
            className={`sidebar-link ${
              isActive("/reservations") ? "active" : ""
            }`}
          >
            <span>📅</span>
            Bookings
          </Link>
        )}

        {canAccessUtilization && (
          <Link
            to="/utilization"
            className={`sidebar-link ${
              isActive("/utilization") ? "active" : ""
            }`}
          >
            <span>📈</span>
            Utilization
          </Link>
        )}

        {canAccessUtilization && (
          <Link
            to="/heatmap"
            className={`sidebar-link ${
              isActive("/heatmap") ? "active" : ""
            }`}
          >
            <span>🔥</span>
            Heatmap
          </Link>
        )}

        {canAccessMaintenance && (
          <Link
            to="/maintenance"
            className={`sidebar-link ${
              isActive("/maintenance") ? "active" : ""
            }`}
          >
            <span>🔧</span>
            Maintenance
          </Link>
        )}

        {canAccessReports && (
          <Link
            to="/reports"
            className={`sidebar-link ${
              isActive("/reports") ? "active" : ""
            }`}
          >
            <span>📊</span>
            Reports
          </Link>
        )}

        {canAccessUsers && (
          <Link
            to="/users"
            className={`sidebar-link ${
              isActive("/users") ? "active" : ""
            }`}
          >
            <span>👥</span>
            Users
          </Link>
        )}

      </nav>

      <div className="sidebar-bottom">

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <span>🚪</span>
          Logout
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;