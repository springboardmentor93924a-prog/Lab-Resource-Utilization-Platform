import "./Sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCurrentUserRole } from "../utils/auth";
import { getUnreadCount } from "../services/notificationService";
import { useAuth } from "../context/AuthContext";
import Settings from "./Settings";

// roles: undefined = visible to everyone.
// Otherwise, only listed roles see it.
const navItems = [
  {
    label: "Dashboard",
    icon: "bi-speedometer2",
    path: "/dashboard",
  },
  {
    label: "Equipment",
    icon: "bi-box-seam",
    path: "/equipment",
  },
  {
    label: "Bookings",
    icon: "bi-calendar-check",
    path: "/bookings",
    roles: [
      "STUDENT",
      "RESEARCHER",
      "LAB_MANAGER",
      "DEPARTMENT_HEAD",
      "INSTITUTION_ADMIN",
      "SYSTEM_ADMIN",
    ],
  },
  {
    label: "My bookings",
    icon: "bi-list-check",
    path: "/my-bookings",
    roles: [
      "STUDENT",
      "RESEARCHER",
      "LAB_MANAGER",
      "DEPARTMENT_HEAD",
      "INSTITUTION_ADMIN",
      "SYSTEM_ADMIN",
    ],
  },
  {
    label: "My waitlist",
    icon: "bi-hourglass-split",
    path: "/my-waitlist",
    roles: [
      "STUDENT",
      "RESEARCHER",
      "LAB_MANAGER",
      "DEPARTMENT_HEAD",
      "INSTITUTION_ADMIN",
      "SYSTEM_ADMIN",
    ],
  },
  {
    label: "Sharing",
    icon: "bi-share",
    path: "/sharing",
    roles: [
      "STUDENT",
      "RESEARCHER",
      "LAB_MANAGER",
      "DEPARTMENT_HEAD",
      "INSTITUTION_ADMIN",
      "SYSTEM_ADMIN",
    ],
  },
  {
    label: "Utilization",
    icon: "bi-graph-up",
    path: "/utilization",
    roles: [
      "LAB_MANAGER",
      "DEPARTMENT_HEAD",
      "INSTITUTION_ADMIN",
      "SYSTEM_ADMIN",
    ],
  },
  {
    label: "Heatmap",
    icon: "bi-grid-3x3-gap",
    path: "/heatmap",
    roles: [
      "LAB_MANAGER",
      "DEPARTMENT_HEAD",
      "INSTITUTION_ADMIN",
      "SYSTEM_ADMIN",
    ],
  },
  {
    label: "Booking approval",
    icon: "bi-check2-square",
    path: "/booking-approval",
    roles: [
      "LAB_MANAGER",
      "DEPARTMENT_HEAD",
      "INSTITUTION_ADMIN",
      "SYSTEM_ADMIN",
    ],
  },
  {
    label: "Maintenance",
    icon: "bi-tools",
    path: "/maintenance",
    roles: [
      "LAB_TECHNICIAN",
      "LAB_MANAGER",
      "DEPARTMENT_HEAD",
      "INSTITUTION_ADMIN",
      "SYSTEM_ADMIN",
    ],
  },
  {
    label: "My tasks",
    icon: "bi-clipboard-check",
    path: "/my-tasks",
    roles: ["LAB_TECHNICIAN"],
  },
  {
    label: "Analytics",
    icon: "bi-bar-chart",
    path: "/analytics",
    roles: [
      "STUDENT",
      "RESEARCHER",
      "LAB_MANAGER",
      "DEPARTMENT_HEAD",
      "INSTITUTION_ADMIN",
      "SYSTEM_ADMIN",
    ],
  },
  {
    label: "Billing",
    icon: "bi-cash-coin",
    path: "/billing",
    roles: [
      "LAB_MANAGER",
      "DEPARTMENT_HEAD",
      "INSTITUTION_ADMIN",
      "SYSTEM_ADMIN",
    ],
  },
  {
    label: "Reports",
    icon: "bi-file-earmark-bar-graph",
    path: "/reports",
    roles: [
      "LAB_MANAGER",
      "DEPARTMENT_HEAD",
      "INSTITUTION_ADMIN",
      "SYSTEM_ADMIN",
    ],
  },
  {
    label: "Notifications",
    icon: "bi-bell",
    path: "/notifications",
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const role = getCurrentUserRole();

  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

    function toggleMobileSidebar() {
    setMobileOpen((prev) => !prev);
  }

  function closeMobileSidebar() {
    setMobileOpen(false);
  }

  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");

    if (sidebar) {
      sidebar.classList.toggle("sidebar-open", mobileOpen);
    }

    return () => {
      if (sidebar) {
        sidebar.classList.remove("sidebar-open");
      }
    };
  }, [mobileOpen]);

  // Fetch unread notification count
  useEffect(() => {
    async function fetchUnread() {
      try {
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Failed to fetch unread notifications:", error);
        setUnreadCount(0);
      }
    }

    // Fetch immediately
    fetchUnread();

    // Refresh every 30 seconds
    const interval = setInterval(fetchUnread, 5000);
    
    // Cleanup when Sidebar unmounts
    return () => clearInterval(interval);
  }, []);

  function handleLogout() {
  if (window.confirm("Are you sure you want to log out?")) {
    closeMobileSidebar();
    logout();
    navigate("/login");
  }
}
  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
  <>
    {/* Mobile menu button */}
    <button
      className="mobile-menu-btn"
      onClick={toggleMobileSidebar}
      aria-label="Open navigation menu"
    >
      <i className="bi bi-list"></i>
    </button>

    {/* Mobile overlay */}
    {mobileOpen && (
      <div
        className="sidebar-overlay"
        onClick={closeMobileSidebar}
      ></div>
    )}

    <div className="logo">
      LAB PLATFORM

      <button
        className="mobile-close-btn"
        onClick={closeMobileSidebar}
        aria-label="Close navigation menu"
      >
        ×
      </button>
    </div>

      <ul>
        {visibleItems.map((item) => (
          <li
            key={item.path}
            className={
              location.pathname === item.path ? "active" : ""
            }
          >
            <Link
  to={item.path}
  className="sidebar-link"
  onClick={closeMobileSidebar}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <i className={`bi ${item.icon}`}></i>
                {item.label}
              </span>

              {item.path === "/notifications" && unreadCount > 0 && (
                <span
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: 700,
                    minWidth: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 5px",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {/* =================================================
    SETTINGS
================================================= */}

<Settings />


{/* =================================================
    LOGOUT
================================================= */}

<div
  className="sidebar-logout"
  onClick={handleLogout}
  role="button"
  tabIndex={0}
  onKeyDown={(event) => {

    if (event.key === "Enter") {
      handleLogout();
    }

  }}
>

  <i className="bi bi-box-arrow-right"></i>

  <span>
    Logout
  </span>

</div>
    </>
  );
}