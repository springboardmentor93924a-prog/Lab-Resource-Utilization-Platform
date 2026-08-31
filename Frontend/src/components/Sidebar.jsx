import { NavLink } from "react-router-dom";

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
      icon: "▦",
    },

    {
      name: "Equipment",
      path: "/equipment",
      icon: "⚙",
    },

    {
      name: "My Bookings",
      path: "/my-bookings",
      icon: "📅",
    },

    {
      name: "My Waitlist",
      path: "/my-waitlist",
      icon: "⏳",
    },

    {
      name: "Calendar",
      path: "/calendar",
      icon: "▣",
    },

    {
      name: "Utilization Analytics",
      path: "/analytics",
      icon: "▥",
    },

    {
      name: "Shared Equipment",
      path: "/shared-equipment",
      icon: "🔬",
    },

    {
      name: "Analytics Dashboard",
      path: "/analytics-dashboard",
      icon: "▥",
    },

    {
      name: "My Access Requests",
      path: "/my-access-requests",
      icon: "📋",
    },

    {
      name: "External Booking",
      path: "/external-booking",
      icon: "🌐",
    },

    {
      name: "My External Booking",
      path: "/external-bookings",
      icon: "📋",
    },

    // {
    //   name: "Cost Management",
    //   path: "/cost",
    //   icon: "💰",
    // },

  ];


  // =========================================================
  // LAB TECHNICIAN MENU
  // =========================================================

  const labTechnicianMenuItems = [

    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "▦",
    },

    {
      name: "Equipment",
      path: "/equipment",
      icon: "⚙",
    },

    {
      name: "Calendar",
      path: "/calendar",
      icon: "▣",
    },

    {
      name: "Utilization",
      path: "/utilization",
      icon: "📊",
    },

    {
      name: "Maintenance",
      path: "/maintenance-dashboard",
      icon: "🔧",
    },

    {
      name: "Maintenance Requests",
      path: "/maintenance-requests",
      icon: "🛠",
    },

    {
      name: "Work Orders",
      path: "/work-orders",
      icon: "📋",
    },

    {
      name: "Maintenance History",
      path: "/maintenance-history",
      icon: "🕒",
    },

    {
      name: "Calibration & Certification",
      path: "/calibration",
      icon: "📜",
    },

    {
      name: "Calibration Management",
      path: "/calibration-management",
      icon: "🧪",
    },

    // {
    //   name: "Cost Management",
    //   path: "/cost",
    //   icon: "💰",
    // },

  ];


  // =========================================================
  // LAB MANAGER MENU
  // =========================================================

  const labManagerMenuItems = [

    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "▦",
    },

    {
      name: "Equipment",
      path: "/equipment",
      icon: "⚙",
    },

    {
      name: "My Bookings",
      path: "/my-bookings",
      icon: "📅",
    },

    {
      name: "Booking Approval",
      path: "/booking-approval",
      icon: "✓",
    },

    {
      name: "External Booking Approval",
      path: "/external-booking-approval",
      icon: "🌐",
    },

    {
      name: "Utilization",
      path: "/utilization",
      icon: "📊",
    },

    {
      name: "Waitlist Management",
      path: "/admin-waitlists",
      icon: "⏳",
    },

    {
      name: "Calendar",
      path: "/calendar",
      icon: "▣",
    },

    {
      name: "Utilization Analytics",
      path: "/analytics",
      icon: "▥",
    },

    {
      name: "Analytics Dashboard",
      path: "/analytics-dashboard",
      icon: "▥",
    },

    {
      name: "Shared Equipment",
      path: "/admin-shared-equipment",
      icon: "🔬",
    },

    {
      name: "Access Requests",
      path: "/access-requests",
      icon: "🔐",
    },

    {
      name: "External Access",
      path: "/external-access",
      icon: "🔐",
    },

    {
      name: "Maintenance Dashboard",
      path: "/maintenance-dashboard",
      icon: "🔧",
    },

    {
      name: "Maintenance Requests",
      path: "/maintenance-requests",
      icon: "🛠",
    },

    {
      name: "Work Orders",
      path: "/work-orders",
      icon: "📋",
    },

    {
      name: "Maintenance History",
      path: "/maintenance-history",
      icon: "🕒",
    },

    {
      name: "Calibration & Certification",
      path: "/calibration",
      icon: "📜",
    },

    {
      name: "Calibration Management",
      path: "/calibration-management",
      icon: "🧪",
    },

    {
      name: "Cost Management",
      path: "/cost",
      icon: "💰",
    },

    {
      name: "Department Cost Allocation",
      path: "/department-cost-allocation",
      icon: "🏢",
    },

    {
      name: "Cost Dashboard",
      path: "/cost-dashboard",
      icon: "💰",
    },

    {
      name: "Equipment Usage Cost",
      path: "/equipment-usage-cost",
      icon: "⏱️",
    },

    {
      name: "Inter-Institution Billing",
      path: "/inter-institution-billing",
      icon: "💰",
    },

    {
      name: "Cost Recovery",
      path: "/cost-recovery",
      icon: "💰",
    },
  ];


  // =========================================================
  // DEPARTMENT HEAD MENU
  // =========================================================

  const departmentHeadMenuItems = [

    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "▦",
    },

    {
      name: "Equipment",
      path: "/equipment",
      icon: "⚙",
    },

    {
      name: "Booking Approval",
      path: "/booking-approval",
      icon: "✓",
    },

    {
      name: "Utilization",
      path: "/utilization",
      icon: "📊",
    },

    {
      name: "Utilization Analytics",
      path: "/analytics",
      icon: "▥",
    },

    {
      name: "Analytics Dashboard",
      path: "/analytics-dashboard",
      icon: "▥",
    },

    {
      name: "Shared Equipment",
      path: "/admin-shared-equipment",
      icon: "🔬",
    },

    {
      name: "Access Requests",
      path: "/access-requests",
      icon: "🔐",
    },

    {
      name: "Maintenance Dashboard",
      path: "/maintenance-dashboard",
      icon: "🔧",
    },

    {
      name: "Maintenance Requests",
      path: "/maintenance-requests",
      icon: "🛠",
    },

    {
      name: "Work Orders",
      path: "/work-orders",
      icon: "📋",
    },

    {
      name: "Maintenance History",
      path: "/maintenance-history",
      icon: "🕒",
    },

    {
      name: "Calibration & Certification",
      path: "/calibration",
      icon: "📜",
    },

    {
      name: "Calibration Management",
      path: "/calibration-management",
      icon: "🧪",
    },

    {
      name: "Cost Management",
      path: "/cost",
      icon: "💰",
    },

    {
      name: "Department Cost Allocation",
      path: "/department-cost-allocation",
      icon: "🏢",
    },

    {
      name: "Cost Dashboard",
      path: "/cost-dashboard",
      icon: "💰",
    },

    {
      name: "Equipment Usage Cost",
      path: "/equipment-usage-cost",
      icon: "⏱️",
    },

    {
      name: "Inter-Institution Billing",
      path: "/inter-institution-billing",
      icon: "💰",
    },

    
  ];


  // =========================================================
  // INSTITUTION ADMIN MENU
  // =========================================================

  const institutionAdminMenuItems = [

    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "▦",
    },

    {
      name: "Equipment",
      path: "/equipment",
      icon: "⚙",
    },

    {
      name: "Booking Approval",
      path: "/booking-approval",
      icon: "✓",
    },

    {
      name: "Utilization",
      path: "/utilization",
      icon: "📊",
    },

    {
      name: "Utilization Analytics",
      path: "/analytics",
      icon: "▥",
    },

    {
      name: "Analytics Dashboard",
      path: "/analytics-dashboard",
      icon: "▥",
    },

    {
      name: "Shared Equipment",
      path: "/admin-shared-equipment",
      icon: "🔬",
    },

    {
      name: "Access Requests",
      path: "/access-requests",
      icon: "🔐",
    },

    {
      name: "External Access",
      path: "/external-access",
      icon: "🔐",
    },

    {
      name: "Maintenance Dashboard",
      path: "/maintenance-dashboard",
      icon: "🔧",
    },

    {
      name: "Maintenance History",
      path: "/maintenance-history",
      icon: "🕒",
    },

    {
      name: "Calibration & Certification",
      path: "/calibration",
      icon: "📜",
    },

    {
      name: "Calibration Management",
      path: "/calibration-management",
      icon: "🧪",
    },

    {
      name: "Cost Management",
      path: "/cost",
      icon: "💰",
    },

    {
      name: "Department Cost Allocation",
      path: "/department-cost-allocation",
      icon: "🏢",
    },

    {
      name: "Cost Dashboard",
      path: "/cost-dashboard",
      icon: "💰",
    },

    {
      name: "Equipment Usage Cost",
      path: "/equipment-usage-cost",
      icon: "⏱️",
    },

    {
      name: "Inter-Institution Billing",
      path: "/inter-institution-billing",
      icon: "💰",
    },

    {
      name: "ICost Recovery",
      path: "/cost-recovery",
      icon: "💰",
    },
  ];


  // =========================================================
  // SYSTEM ADMIN MENU
  // =========================================================

  const systemAdminMenuItems = [

    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "▦",
    },

    {
      name: "Equipment",
      path: "/equipment",
      icon: "⚙",
    },

    {
      name: "My Bookings",
      path: "/my-bookings",
      icon: "📅",
    },

    {
      name: "Booking Approval",
      path: "/booking-approval",
      icon: "✓",
    },

    {
      name: "External Booking Approval",
      path: "/external-booking-approval",
      icon: "🌐",
    },

    {
      name: "Utilization",
      path: "/utilization",
      icon: "📊",
    },

    {
      name: "Waitlist Management",
      path: "/admin-waitlists",
      icon: "⏳",
    },

    {
      name: "Calendar",
      path: "/calendar",
      icon: "▣",
    },

    {
      name: "Utilization Analytics",
      path: "/analytics",
      icon: "▥",
    },

    {
      name: "Analytics Dashboard",
      path: "/analytics-dashboard",
      icon: "▥",
    },

    {
      name: "Shared Equipment",
      path: "/admin-shared-equipment",
      icon: "🔬",
    },

    {
      name: "Access Requests",
      path: "/access-requests",
      icon: "🔐",
    },

    {
      name: "External Access",
      path: "/external-access",
      icon: "🔐",
    },

    {
      name: "Maintenance Dashboard",
      path: "/maintenance-dashboard",
      icon: "🔧",
    },

    {
      name: "Maintenance Requests",
      path: "/maintenance-requests",
      icon: "🛠",
    },

    {
      name: "Work Orders",
      path: "/work-orders",
      icon: "📋",
    },

    {
      name: "Maintenance History",
      path: "/maintenance-history",
      icon: "🕒",
    },

    {
      name: "Calibration & Certification",
      path: "/calibration",
      icon: "📜",
    },

    {
      name: "Calibration Management",
      path: "/calibration-management",
      icon: "🧪",
    },

    {
      name: "Cost Management",
      path: "/cost",
      icon: "💰",
    },

    {
      name: "Department Cost Allocation",
      path: "/department-cost-allocation",
      icon: "🏢",
    },

    {
      name: "Cost Dashboard",
      path: "/cost-dashboard",
      icon: "💰",
    },

    {
      name: "Equipment Usage Cost",
      path: "/equipment-usage-cost",
      icon: "⏱️",
    },

    {
      name: "Inter-Institution Billing",
      path: "/inter-institution-billing",
      icon: "💰",
    },

    {
      name: "ICost Recovery",
      path: "/cost-recovery",
      icon: "💰",
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
          🔬
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

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `sidebar-link ${
              isActive ? "active" : ""
            }`
          }
        >

          <span className="sidebar-icon">
            👤
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