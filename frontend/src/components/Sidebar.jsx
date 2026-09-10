import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./Sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isAdmin } from "../utils/auth";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", icon: "bi-speedometer2", path: "/dashboard" },
  { label: "Equipment", icon: "bi-box-seam", path: "/equipment" },
  { label: "Bookings", icon: "bi-calendar-check", path: "/bookings" },
  { label: "My bookings", icon: "bi-list-check", path: "/my-bookings" },
  { label: "Sharing", icon: "bi-share", path: "/sharing" },
  { label: "Utilization", icon: "bi-graph-up", path: "/utilization" },
  { label: "Heatmap", icon: "bi-grid-3x3-gap", path: "/heatmap" },
  { label: "Booking approval", icon: "bi-check2-square", path: "/booking-approval", adminOnly: true },
  { label: "My waitlist", icon: "bi-hourglass-split", path: "/my-waitlist" },
  { label: "My tasks", icon: "bi-clipboard-check", path: "/my-tasks" },
  { label: "Maintenance", icon: "bi-tools", path: "/maintenance" },
  { label: "Cost & billing", icon: "bi-cash-coin", path: "/cost-billing" },
  { label: "Analytics", icon: "bi-bar-chart", path: "/analytics" },
  { label: "Notifications", icon: "bi-bell", path: "/notifications" },
];

function NavList({ userIsAdmin, location, onNavClick, onLogout }) {
  return (
    <ul>
      {navItems
        .filter((item) => !item.adminOnly || userIsAdmin)
        .map((item) => (
          <li key={item.path} className={location.pathname === item.path ? "active" : ""}>
            <Link to={item.path} className="sidebar-link" onClick={onNavClick}>
              <i className={`bi ${item.icon}`}></i>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          </li>
        ))}
      <li onClick={onLogout} style={{ cursor: "pointer" }}>
        <span className="sidebar-link">
          <i className="bi bi-box-arrow-right"></i>
          <span className="sidebar-label">Logout</span>
        </span>
      </li>
    </ul>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const userIsAdmin = isAdmin();
  const { logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  const mobilePortal = createPortal(
    <>
      <button
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle menu"
        className="mobile-hamburger-btn"
      >
        <i className="bi bi-list"></i>
      </button>
      {mobileOpen && (
        <div className="mobile-drawer-backdrop" onClick={closeMobile}>
          <nav className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="logo">
              <span>LAB PLATFORM</span>
            </div>
            <NavList
              userIsAdmin={userIsAdmin}
              location={location}
              onNavClick={closeMobile}
              onLogout={() => { closeMobile(); handleLogout(); }}
            />
          </nav>
        </div>
      )}
    </>,
    document.body
  );

  return (
    <>
      {mobilePortal}
      <div className="desktop-sidebar-content">
        <div className="logo">
          <span>LAB PLATFORM</span>
        </div>
        <NavList
          userIsAdmin={userIsAdmin}
          location={location}
          onNavClick={undefined}
          onLogout={handleLogout}
        />
      </div>
    </>
  );
}
