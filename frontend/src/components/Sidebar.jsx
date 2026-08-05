
import { Link, useLocation } from "react-router-dom";
import { FaChartBar } from "react-icons/fa";
import { FaShareAlt } from "react-icons/fa";

import {
  FaHome,
  FaFlask,
  FaCalendarAlt,
  FaClipboardList,
  FaUser,
  FaSignOutAlt,
  FaMicrochip
} from "react-icons/fa";

import "../styles/sidebar.css";

function Sidebar() {
  const location = useLocation();

  return (
    <div className="sidebar">

      <h2 className="sidebar-logo">
        Lab Resource
      </h2>

      <ul>

        <Link to="/dashboard" className="sidebar-link">
          <li className={location.pathname === "/dashboard" ? "active" : ""}>
            <FaHome />
            Dashboard
          </li>
        </Link>

        <Link to="/resources" className="sidebar-link">
          <li className={location.pathname === "/resources" ? "active" : ""}>
            <FaFlask />
            Resources
          </li>
        </Link>
         <Link to="/equipment" className="sidebar-link">
  <li className={location.pathname === "/equipment" ? "active" : ""}>
    <FaMicrochip />
    Equipment
  </li>
</Link>
<Link to="/resource-sharing" className="sidebar-link">
  <li className={location.pathname === "/resource-sharing" ? "active" : ""}>
    <FaShareAlt />
    Resource Sharing
  </li>
</Link>
<Link to="/utilization" className="sidebar-link">
  <li className={location.pathname === "/utilization" ? "active" : ""}>
    <FaChartBar />
    Utilization
  </li>
</Link>

        <Link to="/booking" className="sidebar-link">
          <li className={location.pathname === "/booking" ? "active" : ""}>
            <FaCalendarAlt />
            Booking
          </li>
        </Link>

        <Link to="/mybookings" className="sidebar-link">
          <li className={location.pathname === "/mybookings" ? "active" : ""}>
            <FaClipboardList />
            My Bookings
          </li>
        </Link>

        <Link to="/profile" className="sidebar-link">
          <li className={location.pathname === "/profile" ? "active" : ""}>
            <FaUser />
            Profile
          </li>
        </Link>

        <Link to="/manage-labs" className="sidebar-link">
          <li className={location.pathname === "/manage-labs" ? "active" : ""}>
            <FaFlask />
            Manage Labs
          </li>
        </Link>
        <Link to="/manage-equipment" className="sidebar-link">
        <li className={location.pathname === "/manage-equipment" ? "active" : ""}>
           <FaFlask />
            Manage Equipment
          </li>
        </Link>

        <Link to="/" className="sidebar-link">
          <li className="logout">
            <FaSignOutAlt />
            Logout
          </li>
        </Link>

      </ul>

    </div>
  );
}

export default Sidebar;