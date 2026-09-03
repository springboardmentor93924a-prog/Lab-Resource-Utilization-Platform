import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const role = sessionStorage.getItem("role");

  const handleLogout = () => {
    sessionStorage.clear();
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

  // PDF Section 11 gives Waitlist to Researcher/Student only.
  const canAccessWaitlist = [
    "STUDENT",
    "SYSTEM_ADMIN"
  ].includes(role);

  // PDF gives Bookings to Lab Manager and Department Head, but not
  // Lab Technician or Institution Admin (neither nav list has it).
  const canAccessBookings = [
    "STUDENT",
    "LAB_MANAGER",
    "DEPARTMENT_HEAD",
    "SYSTEM_ADMIN"
  ].includes(role);

  // PDF gives Maintenance to Lab Technician and Lab Manager only —
  // Department Head and Institution Admin's nav lists don't include it.
  const canAccessMaintenance = [
    "LAB_TECHNICIAN",
    "LAB_MANAGER",
    "SYSTEM_ADMIN"
  ].includes(role);

  // PDF gives Calibration to Lab Technician only. Lab Manager,
  // Department Head, and Institution Admin lose it here (System Admin
  // left untouched — out of scope for this trim).
const canAccessCalibration = [
  "LAB_TECHNICIAN",
  "SYSTEM_ADMIN"
].includes(role);

  // Utilization itself stays for all four (it's in every one of their
  // PDF nav lists) — Heatmap and Demand Analysis are split out below
  // since Institution Admin's list doesn't include those two.
  const canAccessUtilization = [
    "LAB_MANAGER",
    "DEPARTMENT_HEAD",
    "INSTITUTION_ADMIN",
    "SYSTEM_ADMIN"
  ].includes(role);

  // PDF lists Heatmap and Demand Analysis for Lab Manager and
  // Department Head only — Institution Admin's nav has neither.
  const canAccessHeatmap = [
    "LAB_MANAGER",
    "DEPARTMENT_HEAD",
    "SYSTEM_ADMIN"
  ].includes(role);

  const canAccessDemandAnalysis = [
    "LAB_MANAGER",
    "DEPARTMENT_HEAD",
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

  const canAccessResourceSharing = [
    "LAB_MANAGER",
    "DEPARTMENT_HEAD",
    "INSTITUTION_ADMIN",
    "SYSTEM_ADMIN"
  ].includes(role);

  // The standalone /feedback page and its nav link are gone. Students
  // submit inline from My Bookings (Actions column, within 1 hour of a
  // booking completing); staff now work the same Equipment Issue Reports
  // queue from inside the Maintenance page (Maintenance.jsx) instead, so
  // there's no separate link to show them here either.

// Restricted to Lab Technician + Lab Manager (System Admin untouched
// per earlier instruction). Department Head, Institution Admin, and
// Student no longer get Certification.
const canAccessCertification = [
  "LAB_TECHNICIAN",
  "LAB_MANAGER",
  "SYSTEM_ADMIN"
].includes(role);
  // PDF's "Cost Analysis" and "Analytics" nav entries only appear
  // under Institution Administrator — Lab Manager and Department Head
  // lose both here (System Admin left untouched).
  const canAccessCostManagement = [
    "INSTITUTION_ADMIN",
    "SYSTEM_ADMIN"
  ].includes(role);

  const canAccessAnalytics = [
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

        {/* Dashboard */}
        <Link
          to="/dashboard"
          className={`sidebar-link ${
            isActive("/dashboard") ? "active" : ""
          }`}
        >
          <span>🏠</span>
          Dashboard
        </Link>

        {/* Equipment */}
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

        {/* Bookings */}
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

        {/* Waitlist */}
        {canAccessWaitlist && (
          <Link
            to="/waitlist"
            className={`sidebar-link ${
              isActive("/waitlist") ? "active" : ""
            }`}
          >
            <span>⏳</span>
            Waitlist
          </Link>
        )}

        {/* Utilization */}
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

        {/* Heatmap */}
        {canAccessHeatmap && (
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

        {/* Demand Analysis */}
        {canAccessDemandAnalysis && (
          <Link
            to="/demand-analysis"
            className={`sidebar-link ${
              isActive("/demand-analysis") ? "active" : ""
            }`}
          >
            <span>📊</span>
            Demand Analysis
          </Link>
        )}

        {/* Maintenance */}
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

        {/* Calibration - Task 2 (NEW) */}
        {canAccessCalibration && (
          <Link
            to="/calibration"
            className={`sidebar-link ${
              isActive("/calibration") ? "active" : ""
            }`}
          >
            <span>🧪</span>
            Calibration
          </Link>
        )}

{canAccessCertification && (
  <Link to="/certification" className={`sidebar-link ${isActive("/certification") ? "active" : ""}`}>
    <span>📜</span>
    Certification
  </Link>
)}

        {/* Resource Sharing */}
        {canAccessResourceSharing && (
          <Link
            to="/resource-sharing"
            className={`sidebar-link ${
              isActive("/resource-sharing") ? "active" : ""
            }`}
          >
            <span>🤝</span>
            Resource Sharing
          </Link>
        )}

        {/* Reports */}
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

        {/* Cost Management - Task 3 */}
        {canAccessCostManagement && (
          <Link
            to="/cost-management"
            className={`sidebar-link ${
              isActive("/cost-management") ? "active" : ""
            }`}
          >
            <span>💰</span>
            Cost Management
          </Link>
        )}

        {/* Analytics Dashboard - Task 4 */}
        {canAccessAnalytics && (
          <Link
            to="/analytics"
            className={`sidebar-link ${
              isActive("/analytics") ? "active" : ""
            }`}
          >
            <span>📈</span>
            Analytics
          </Link>
        )}

        {/* Users */}
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