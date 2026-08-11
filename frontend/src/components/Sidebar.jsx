import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path
      ? "sidebar-link active"
      : "sidebar-link";
  };

  return (
    <aside className="sidebar">

      {/* Navigation */}
      <nav className="sidebar-nav">

        <div className="sidebar-section-title">
          MAIN MENU
        </div>


        {/* Dashboard */}
        <Link
          to="/dashboard"
          className={isActive("/dashboard")}
        >
          <span className="sidebar-icon">
            🏠
          </span>

          <span>
            Dashboard
          </span>
        </Link>


        {/* Equipment */}
        {[
          "ADMIN",
          "FACULTY",
          "STUDENT",
          "LAB_TECHNICIAN",
        ].includes(role) && (

          <Link
            to="/equipment"
            className={isActive("/equipment")}
          >
            <span className="sidebar-icon">
              ⚙️
            </span>

            <span>
              Equipment
            </span>
          </Link>

        )}


        {/* Reservations */}
        {[
          "ADMIN",
          "FACULTY",
          "STUDENT",
        ].includes(role) && (

          <Link
            to="/reservations"
            className={isActive("/reservations")}
          >
            <span className="sidebar-icon">
              📅
            </span>

            <span>
              Reservations
            </span>
          </Link>

        )}


        {/* Reports */}
        {[
          "ADMIN",
          "FACULTY",
          "LAB_TECHNICIAN",
        ].includes(role) && (

          <Link
            to="/reports"
            className={isActive("/reports")}
          >
            <span className="sidebar-icon">
              📊
            </span>

            <span>
              Reports
            </span>
          </Link>

        )}


        {/* User Management */}
        {role === "ADMIN" && (

          <Link
            to="/users"
            className={isActive("/users")}
          >
            <span className="sidebar-icon">
              👥
            </span>

            <span>
              User Management
            </span>
          </Link>

        )}

      </nav>


      {/* Bottom section */}
      <div className="sidebar-bottom">

        <div className="sidebar-divider"></div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <span className="sidebar-icon">
            ↪
          </span>

          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;
