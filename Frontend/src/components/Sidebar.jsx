import { NavLink } from "react-router-dom";
import Settings from "./Settings";

import {
  FaThLarge,
  FaCog,
  FaCalendarAlt,
  FaClock,
  FaChartBar,
  FaFlask,
  FaClipboardList,
  FaGlobe,
  FaBell,
  FaTools,
  FaWrench,
  FaHistory,
  FaFileAlt,
  FaVial,
  FaBuilding,
  FaMoneyBillWave,
  FaStopwatch,
  FaFileInvoiceDollar,
  FaChartLine,
  FaUser,
  FaCheck,
  FaLock,
} from "react-icons/fa";

function Sidebar() {

  // =========================================================
  // GET LOGGED-IN USER
  // =========================================================

  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    console.error("Invalid user data:", error);
  }


  // =========================================================
  // GET USER ROLE
  // =========================================================

  const role = (
    user?.role ||
    user?.user?.role ||
    ""
  )
    .toString()
    .toUpperCase();


  // =========================================================
  // RESEARCHER MENU
  // =========================================================

  const researcherMenuItems = [

    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaThLarge />,
    },

    {
      name: "Equipment",
      path: "/equipment",
      icon: <FaCog />,
    },

    {
      name: "My Bookings",
      path: "/my-bookings",
      icon: <FaCalendarAlt />,
    },

    {
      name: "My Waitlist",
      path: "/my-waitlist",
      icon: <FaClock />,
    },

    {
      name: "Calendar",
      path: "/calendar",
      icon: <FaCalendarAlt />,
    },

    {
      name: "Utilization Analytics",
      path: "/analytics",
      icon: <FaChartBar />,
    },

    {
      name: "Shared Equipment",
      path: "/shared-equipment",
      icon: <FaFlask />,
    },

    {
      name: "Analytics Dashboard",
      path: "/analytics-dashboard",
      icon: <FaChartLine />,
    },

    {
      name: "My Access Requests",
      path: "/my-access-requests",
      icon: <FaClipboardList />,
    },

    {
      name: "External Booking",
      path: "/external-booking",
      icon: <FaGlobe />,
    },

    {
      name: "My External Booking",
      path: "/external-bookings",
      icon: <FaClipboardList />,
    },

    {
      name: "Notifications",
      path: "/notifications",
      icon: <FaBell />,
    },
  ];


  // =========================================================
  // LAB TECHNICIAN MENU
  // =========================================================

  const labTechnicianMenuItems = [

    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaThLarge />,
    },

    {
      name: "Equipment",
      path: "/equipment",
      icon: <FaCog />,
    },

    {
      name: "Calendar",
      path: "/calendar",
      icon: <FaCalendarAlt />,
    },

    {
      name: "Utilization",
      path: "/utilization",
      icon: <FaChartBar />,
    },

    {
      name: "Maintenance",
      path: "/maintenance",
      icon: <FaWrench />,
    },

    {
      name: "Maintenance Requests",
      path: "/maintenance/requests",
      icon: <FaTools />,
    },

    {
      name: "Work Orders",
      path: "/work-orders",
      icon: <FaClipboardList />,
    },

    {
      name: "Maintenance History",
      path: "/maintenance-history",
      icon: <FaHistory />,
    },

    {
      name: "Calibration & Certification",
      path: "/calibration",
      icon: <FaFileAlt />,
    },

    {
      name: "Calibration Management",
      path: "/calibration-management",
      icon: <FaVial />,
    },

    {
      name: "Notifications",
      path: "/notifications",
      icon: <FaBell />,
    },

  ];


  // =========================================================
  // LAB MANAGER MENU
  // =========================================================

  const labManagerMenuItems = [

    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaThLarge />,
    },

    {
      name: "Equipment",
      path: "/equipment",
      icon: <FaCog />,
    },

    {
      name: "My Bookings",
      path: "/my-bookings",
      icon: <FaCalendarAlt />,
    },

    {
      name: "Booking Approval",
      path: "/booking-approval",
      icon: <FaCheck />,
    },

    {
      name: "External Booking Approval",
      path: "/external-booking-approval",
      icon: <FaGlobe />,
    },

    {
      name: "Utilization",
      path: "/utilization",
      icon: <FaChartBar />,
    },

    {
      name: "Waitlist Management",
      path: "/admin-waitlists",
      icon: <FaClock />,
    },

    {
      name: "Calendar",
      path: "/calendar",
      icon: <FaCalendarAlt />,
    },

    {
      name: "Utilization Analytics",
      path: "/analytics",
      icon: <FaChartBar />,
    },

    {
      name: "Analytics Dashboard",
      path: "/analytics-dashboard",
      icon: <FaChartLine />,
    },

    {
      name: "Shared Equipment",
      path: "/admin-shared-equipment",
      icon: <FaFlask />,
    },

    {
      name: "Access Requests",
      path: "/access-requests",
      icon: <FaLock />,
    },

    {
      name: "External Access",
      path: "/external-access",
      icon: <FaLock />,
    },

    {
      name: "Maintenance Dashboard",
      path: "/maintenance",
      icon: <FaWrench />,
    },

    {
      name: "Maintenance Requests",
      path: "/maintenance/requests",
      icon: <FaTools />,
    },

    {
      name: "Work Orders",
      path: "/work-orders",
      icon: <FaClipboardList />,
    },

    {
      name: "Maintenance History",
      path: "/maintenance-history",
      icon: <FaHistory />,
    },

    {
      name: "Calibration & Certification",
      path: "/calibration",
      icon: <FaFileAlt />,
    },

    {
      name: "Calibration Management",
      path: "/calibration-management",
      icon: <FaVial />,
    },

    {
      name: "Department Cost Allocation",
      path: "/department-cost-allocation",
      icon: <FaBuilding />,
    },

    {
      name: "Cost Dashboard",
      path: "/cost-dashboard",
      icon: <FaMoneyBillWave />,
    },

    {
      name: "Equipment Usage Cost",
      path: "/equipment-usage-cost",
      icon: <FaStopwatch />,
    },

    {
      name: "Inter-Institution Billing",
      path: "/inter-institution-billing",
      icon: <FaFileInvoiceDollar />,
    },

    {
      name: "Cost Recovery",
      path: "/cost-recovery",
      icon: <FaMoneyBillWave />,
    },

    {
      name: "Budget Utilization",
      path: "/budget-utilization",
      icon: <FaChartLine />,
    },

    {
      name: "Reports",
      path: "/reports",
      icon: <FaFileAlt />,
    },

    {
      name: "Notifications",
      path: "/notifications",
      icon: <FaBell />,
    },
  ];


  // =========================================================
  // DEPARTMENT HEAD MENU
  // =========================================================

  const departmentHeadMenuItems = [

    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaThLarge />,
    },

    {
      name: "Equipment",
      path: "/equipment",
      icon: <FaCog />,
    },

    {
      name: "Booking Approval",
      path: "/booking-approval",
      icon: <FaCheck />,
    },

    {
      name: "Utilization",
      path: "/utilization",
      icon: <FaChartBar />,
    },

    {
      name: "Utilization Analytics",
      path: "/analytics",
      icon: <FaChartBar />,
    },

    {
      name: "Analytics Dashboard",
      path: "/analytics-dashboard",
      icon: <FaChartLine />,
    },

    {
      name: "Shared Equipment",
      path: "/admin-shared-equipment",
      icon: <FaFlask />,
    },

    {
      name: "Access Requests",
      path: "/access-requests",
      icon: <FaLock />,
    },

    {
      name: "Maintenance Dashboard",
      path: "/maintenance",
      icon: <FaWrench />,
    },

    {
      name: "Maintenance Requests",
      path: "/maintenance/requests",
      icon: <FaTools />,
    },

    {
      name: "Work Orders",
      path: "/work-orders",
      icon: <FaClipboardList />,
    },

    {
      name: "Maintenance History",
      path: "/maintenance-history",
      icon: <FaHistory />,
    },

    {
      name: "Calibration & Certification",
      path: "/calibration",
      icon: <FaFileAlt />,
    },

    {
      name: "Calibration Management",
      path: "/calibration-management",
      icon: <FaVial />,
    },

    {
      name: "Department Cost Allocation",
      path: "/department-cost-allocation",
      icon: <FaBuilding />,
    },

    {
      name: "Cost Dashboard",
      path: "/cost-dashboard",
      icon: <FaMoneyBillWave />,
    },

    {
      name: "Equipment Usage Cost",
      path: "/equipment-usage-cost",
      icon: <FaStopwatch />,
    },

    {
      name: "Inter-Institution Billing",
      path: "/inter-institution-billing",
      icon: <FaFileInvoiceDollar />,
    },

    {
      name: "Budget Utilization",
      path: "/budget-utilization",
      icon: <FaChartLine />,
    },

    {
      name: "Reports",
      path: "/reports",
      icon: <FaFileAlt />,
    },

    {
      name: "Notifications",
      path: "/notifications",
      icon: <FaBell />,
    },

  ];


  // =========================================================
  // INSTITUTION ADMIN MENU
  // =========================================================

  const institutionAdminMenuItems = [

    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaThLarge />,
    },

    {
      name: "Equipment",
      path: "/equipment",
      icon: <FaCog />,
    },

    {
      name: "Booking Approval",
      path: "/booking-approval",
      icon: <FaCheck />,
    },

    {
      name: "Utilization",
      path: "/utilization",
      icon: <FaChartBar />,
    },

    {
      name: "Utilization Analytics",
      path: "/analytics",
      icon: <FaChartBar />,
    },

    {
      name: "Analytics Dashboard",
      path: "/analytics-dashboard",
      icon: <FaChartLine />,
    },

    {
      name: "Shared Equipment",
      path: "/admin-shared-equipment",
      icon: <FaFlask />,
    },

    {
      name: "Access Requests",
      path: "/access-requests",
      icon: <FaLock />,
    },

    {
      name: "External Access",
      path: "/external-access",
      icon: <FaLock />,
    },

    {
      name: "Maintenance Dashboard",
      path: "/maintenance",
      icon: <FaWrench />,
    },

    {
      name: "Maintenance History",
      path: "/maintenance-history",
      icon: <FaHistory />,
    },

    {
      name: "Calibration & Certification",
      path: "/calibration",
      icon: <FaFileAlt />,
    },

    {
      name: "Calibration Management",
      path: "/calibration-management",
      icon: <FaVial />,
    },

    {
      name: "Department Cost Allocation",
      path: "/department-cost-allocation",
      icon: <FaBuilding />,
    },

    {
      name: "Cost Dashboard",
      path: "/cost-dashboard",
      icon: <FaMoneyBillWave />,
    },

    {
      name: "Equipment Usage Cost",
      path: "/equipment-usage-cost",
      icon: <FaStopwatch />,
    },

    {
      name: "Inter-Institution Billing",
      path: "/inter-institution-billing",
      icon: <FaFileInvoiceDollar />,
    },

    {
      name: "Cost Recovery",
      path: "/cost-recovery",
      icon: <FaMoneyBillWave />,
    },

    {
      name: "Budget Utilization",
      path: "/budget-utilization",
      icon: <FaChartLine />,
    },

    {
      name: "Reports",
      path: "/reports",
      icon: <FaFileAlt />,
    },

    {
      name: "Notifications",
      path: "/notifications",
      icon: <FaBell />,
    },
  ];


  // =========================================================
  // SYSTEM ADMIN MENU
  // =========================================================

  const systemAdminMenuItems = [

    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaThLarge />,
    },

    {
      name: "Equipment",
      path: "/equipment",
      icon: <FaCog />,
    },

    {
      name: "My Bookings",
      path: "/my-bookings",
      icon: <FaCalendarAlt />,
    },

    {
      name: "Booking Approval",
      path: "/booking-approval",
      icon: <FaCheck />,
    },

    {
      name: "External Booking Approval",
      path: "/external-booking-approval",
      icon: <FaGlobe />,
    },

    {
      name: "Utilization",
      path: "/utilization",
      icon: <FaChartBar />,
    },

    {
      name: "Waitlist Management",
      path: "/admin-waitlists",
      icon: <FaClock />,
    },

    {
      name: "Calendar",
      path: "/calendar",
      icon: <FaCalendarAlt />,
    },

    {
      name: "Utilization Analytics",
      path: "/analytics",
      icon: <FaChartBar />,
    },

    {
      name: "Analytics Dashboard",
      path: "/analytics-dashboard",
      icon: <FaChartLine />,
    },

    {
      name: "Shared Equipment",
      path: "/admin-shared-equipment",
      icon: <FaFlask />,
    },

    {
      name: "Access Requests",
      path: "/access-requests",
      icon: <FaLock />,
    },

    {
      name: "External Access",
      path: "/external-access",
      icon: <FaLock />,
    },

    {
      name: "Maintenance Dashboard",
      path: "/maintenance",
      icon: <FaWrench />,
    },

    {
      name: "Maintenance Requests",
      path: "/maintenance/requests",
      icon: <FaTools />,
    },

    {
      name: "Work Orders",
      path: "/work-orders",
      icon: <FaClipboardList />,
    },

    {
      name: "Maintenance History",
      path: "/maintenance-history",
      icon: <FaHistory />,
    },

    {
      name: "Calibration & Certification",
      path: "/calibration",
      icon: <FaFileAlt />,
    },

    {
      name: "Calibration Management",
      path: "/calibration-management",
      icon: <FaVial />,
    },

    {
      name: "Department Cost Allocation",
      path: "/department-cost-allocation",
      icon: <FaBuilding />,
    },

    {
      name: "Cost Dashboard",
      path: "/cost-dashboard",
      icon: <FaMoneyBillWave />,
    },

    {
      name: "Equipment Usage Cost",
      path: "/equipment-usage-cost",
      icon: <FaStopwatch />,
    },

    {
      name: "Inter-Institution Billing",
      path: "/inter-institution-billing",
      icon: <FaFileInvoiceDollar />,
    },

    {
      name: "Cost Recovery",
      path: "/cost-recovery",
      icon: <FaMoneyBillWave />,
    },

    {
      name: "Budget Utilization",
      path: "/budget-utilization",
      icon: <FaChartLine />,
    },

    {
      name: "Reports",
      path: "/reports",
      icon: <FaFileAlt />,
    },

    {
      name: "Notifications",
      path: "/notifications",
      icon: <FaBell />,
    },
  ];


  // =========================================================
  // SELECT MENU BASED ON ROLE
  // =========================================================

  let menuItems = researcherMenuItems;

  switch (role) {

    case "RESEARCHER":
      menuItems = researcherMenuItems;
      break;

    case "LAB_TECHNICIAN":
      menuItems = labTechnicianMenuItems;
      break;

    case "LAB_MANAGER":
      menuItems = labManagerMenuItems;
      break;

    case "DEPARTMENT_HEAD":
      menuItems = departmentHeadMenuItems;
      break;

    case "INSTITUTION_ADMIN":
      menuItems = institutionAdminMenuItems;
      break;

    case "SYSTEM_ADMIN":
      menuItems = systemAdminMenuItems;
      break;

    default:
      menuItems = researcherMenuItems;
      break;
  }


  // =========================================================
  // SIDEBAR
  // =========================================================

  return (
    <aside className="sidebar">

      {/* =====================================================
          LOGO / BRAND
      ===================================================== */}

      <div className="sidebar-brand">

        <div className="brand-icon">
          <FaFlask />
        </div>

        <div>
          <h2>LabResource</h2>

          <span>
            Resource Platform
          </span>
        </div>

      </div>


      {/* =====================================================
          USER ROLE
      ===================================================== */}

      {/* <div className="sidebar-role">

        <span className="role-label">
          ROLE
        </span>

        <span className="role-value">
          {role
            ? role.replaceAll("_", " ")
            : "USER"}
        </span>

      </div> */}


      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="sidebar-nav">

        <p className="sidebar-section-title">
          MAIN MENU
        </p>

        {menuItems.map((item) => (

          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >

            <span className="sidebar-icon">
              {item.icon}
            </span>

            <span>
              {item.name}
            </span>

          </NavLink>

        ))}

      </nav>


      {/* =====================================================
          BOTTOM SECTION
      ===================================================== */}

      <div className="sidebar-bottom">

        <Settings />

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `sidebar-link ${
              isActive
                ? "active"
                : ""
            }`
          }
        >

          <span className="sidebar-icon">
            <FaUser />
          </span>

          <span>
            Profile
          </span>

        </NavLink>

      </div>

    </aside>
  );
}

export default Sidebar;