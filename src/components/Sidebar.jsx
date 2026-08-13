function Sidebar({ currentPage, setPage, role, onLogout }) {

  const roleMenus = {
    RESEARCHER: [
  { id: "dashboard", label: "Dashboard" },
  { id: "equipment", label: "Equipment" },
  { id: "external-booking", label:  "Booking" },
  { id: "bookings", label: "My Bookings" },
  { id: "waitlist", label: "Waitlist" },
  { id: "profile", label: "Profile" }
],
    LAB_MANAGER: [
  { id: "dashboard", label: "Dashboard" },
  { id: "equipment", label: "Equipment" },
  { id: "bookings", label: "Bookings" },
  { id: "utilization", label: "Utilization" },
  { id: "heatmap", label: "Heatmap" },
  { id: "resource-sharing", label: "Resource Sharing" },
  { id: "demand-analysis", label: "Demand Analysis" },
  { id: "waitlist", label: "Waitlist Requests" },
  { id: "maintenance", label: "Maintenance" },
  { id: "reports", label: "Reports" }
],
    LAB_TECHNICIAN: [
      { id: "dashboard", label: "Dashboard" },
      { id: "equipment", label: "Equipment" },
      { id: "maintenance", label: "Maintenance" },
      { id: "bookings", label: "Bookings" }
    ],

    DEPARTMENT_HEAD: [
  { id: "dashboard", label: "Dashboard" },
  { id: "departments", label: "Departments" },
  { id: "equipment", label: "Equipment" },
  { id: "bookings", label: "Bookings" },
  { id: "utilization", label: "Utilization" },
  { id: "heatmap", label: "Heatmap" },
  { id: "resource-sharing", label: "Resource Sharing" },
  { id: "demand-analysis", label: "Demand Analysis" },
  { id: "reports", label: "Reports" }
],

    INSTITUTION_ADMIN: [
  { id: "dashboard", label: "Dashboard" },
  { id: "institutions", label: "Institutions" },
  { id: "departments", label: "Departments" },
  { id: "equipment", label: "Equipment" },
  { id: "utilization", label: "Utilization" },
  { id: "resource-sharing", label: "Resource Sharing" },
  { id: "users", label: "Users" },
  { id: "reports", label: "Reports" }
],

    SYSTEM_ADMIN: [
      { id: "dashboard", label: "Dashboard" },
      { id: "institutions", label: "Institutions" },
      { id: "departments", label: "Departments" },
      { id: "equipment", label: "Equipment" },
      { id: "categories", label: "Categories" },
      { id: "bookings", label: "Bookings" },
      { id: "users", label: "Users" },
      { id: "reports", label: "Reports" }
    ]
  };

  const menuItems = roleMenus[role] || roleMenus.RESEARCHER;
  console.log("Current role:", role);

  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <h2>Lab Resource</h2>
        <p>Utilization Platform</p>
      </div>

      <div className="user-role">
        <span>Logged in as</span>
        <strong>{role}</strong>
      </div>

      <nav className="sidebar-nav">

        {menuItems.map((item) => (
          <button
            key={item.id}
            className={currentPage === item.id ? "active" : ""}
            onClick={() => setPage(item.id)}
          >
            {item.label}
          </button>
        ))}

      </nav>

      <div className="sidebar-bottom">
        <button onClick={onLogout}>
          Logout
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;