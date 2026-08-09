import "./Sidebar.css";
import { Link, useLocation } from "react-router-dom";
import { isAdmin } from "../utils/auth";

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
  { label: "Maintenance", icon: "bi-tools", path: "/maintenance" },
  { label: "Analytics", icon: "bi-bar-chart", path: "/analytics" },
  { label: "Notifications", icon: "bi-bell", path: "/notifications" },
];

export default function Sidebar() {
  const location = useLocation();

  const userIsAdmin = isAdmin();


  return (
    <>
      <div className="logo">LAB PLATFORM</div>
      <ul>
        {navItems
  .filter((item) => !item.adminOnly || userIsAdmin)
  .map((item) => (
    <li key={item.path} className={location.pathname === item.path ? "active" : ""}>
      <Link to={item.path} className="sidebar-link">
        <i className={`bi ${item.icon}`}></i>
        {item.label}
      </Link>
    </li>
  ))}
      </ul>
    </>
  );
}