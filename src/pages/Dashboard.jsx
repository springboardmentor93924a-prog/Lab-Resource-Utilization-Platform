import "./Dashboard.css";

function Dashboard({ role }) {

  const dashboardData = {

    RESEARCHER: {
      title: "Researcher Dashboard",
      subtitle: "Find equipment, manage bookings and track your resource usage",

      stats: [
        {
          title: "My Bookings",
          value: "3",
          description: "Upcoming reservations",
          icon: "▣",
          type: "blue",
        },
        {
          title: "Available Equipment",
          value: "3",
          description: "Ready to book",
          icon: "✓",
          type: "green",
        },
        {
          title: "Waitlist",
          value: "2",
          description: "Active requests",
          icon: "◷",
          type: "purple",
        },
        {
          title: "Completed",
          value: "8",
          description: "Previous bookings",
          icon: "●",
          type: "orange",
        },
      ],

      sectionTitle: "Recent Bookings",

      activities: [
        {
          title: "Oscilloscope",
          subtitle: "EQ001 • ECE • Lab 101",
          status: "Confirmed",
          date: "12 Aug 2026",
        },
        {
          title: "3D Printer",
          subtitle: "EQ003 • Mechanical • Lab 201",
          status: "Pending",
          date: "14 Aug 2026",
        },
        {
          title: "Spectrometer",
          subtitle: "EQ005 • Physics • Lab 301",
          status: "Completed",
          date: "08 Aug 2026",
        },
      ],
    },


    LAB_TECHNICIAN: {
      title: "Lab Technician Dashboard",
      subtitle: "Monitor equipment and manage maintenance activities",

      stats: [
        {
          title: "Assigned Equipment",
          value: "5",
          description: "Laboratory resources",
          icon: "▣",
          type: "blue",
        },
        {
          title: "Maintenance",
          value: "1",
          description: "Currently under maintenance",
          icon: "⚙",
          type: "orange",
        },
        {
          title: "Active Tasks",
          value: "2",
          description: "Tasks requiring attention",
          icon: "◷",
          type: "purple",
        },
        {
          title: "Available",
          value: "3",
          description: "Operational equipment",
          icon: "✓",
          type: "green",
        },
      ],

      sectionTitle: "Maintenance Overview",

      activities: [
        {
          title: "CNC Machine",
          subtitle: "EQ004 • Mechanical • Workshop",
          status: "Maintenance",
          date: "Due today",
        },
        {
          title: "Digital Multimeter",
          subtitle: "EQ002 • ECE • Lab 102",
          status: "Available",
          date: "Calibration due",
        },
        {
          title: "Oscilloscope",
          subtitle: "EQ001 • ECE • Lab 101",
          status: "Operational",
          date: "No action required",
        },
      ],
    },


    LAB_MANAGER: {
      title: "Lab Manager Dashboard",
      subtitle: "Monitor laboratory resources, utilization and bookings",

      stats: [
        {
          title: "Total Equipment",
          value: "5",
          description: "Laboratory resources",
          icon: "▣",
          type: "blue",
        },
        {
          title: "In Use",
          value: "1",
          description: "Currently being used",
          icon: "●",
          type: "green",
        },
        {
          title: "Booked",
          value: "1",
          description: "Upcoming bookings",
          icon: "◷",
          type: "purple",
        },
        {
          title: "Utilization",
          value: "45%",
          description: "Overall utilization",
          icon: "%",
          type: "orange",
        },
      ],

      sectionTitle: "Resource Overview",

      activities: [
        {
          title: "Oscilloscope",
          subtitle: "EQ001 • ECE • Lab 101",
          status: "In Use",
          date: "82% utilization",
        },
        {
          title: "3D Printer",
          subtitle: "EQ003 • Mechanical • Lab 201",
          status: "Booked",
          date: "68% utilization",
        },
        {
          title: "CNC Machine",
          subtitle: "EQ004 • Mechanical • Workshop",
          status: "Maintenance",
          date: "18% utilization",
        },
      ],
    },


    DEPARTMENT_HEAD: {
      title: "Department Head Dashboard",
      subtitle: "Monitor department resources, bookings and utilization",

      stats: [
        {
          title: "Department Equipment",
          value: "5",
          description: "Available resources",
          icon: "▣",
          type: "blue",
        },
        {
          title: "Active Bookings",
          value: "2",
          description: "Current reservations",
          icon: "◷",
          type: "purple",
        },
        {
          title: "Utilization",
          value: "45%",
          description: "Department utilization",
          icon: "%",
          type: "green",
        },
        {
          title: "Maintenance",
          value: "1",
          description: "Equipment requiring attention",
          icon: "⚙",
          type: "orange",
        },
      ],

      sectionTitle: "Department Resource Status",

      activities: [
        {
          title: "Oscilloscope",
          subtitle: "ECE • Lab 101",
          status: "In Use",
          date: "82% utilization",
        },
        {
          title: "Digital Multimeter",
          subtitle: "ECE • Lab 102",
          status: "Available",
          date: "35% utilization",
        },
        {
          title: "3D Printer",
          subtitle: "Mechanical • Lab 201",
          status: "Booked",
          date: "68% utilization",
        },
      ],
    },


    INSTITUTION_ADMIN: {
      title: "Institution Administrator",
      subtitle: "Manage your institution's resources and organization",

      stats: [
        {
          title: "Institution",
          value: "1",
          description: "Registered institution",
          icon: "◆",
          type: "blue",
        },
        {
          title: "Departments",
          value: "3",
          description: "Within your institution",
          icon: "▦",
          type: "purple",
        },
        {
          title: "Equipment",
          value: "5",
          description: "Laboratory resources",
          icon: "▣",
          type: "green",
        },
        {
          title: "Active Bookings",
          value: "2",
          description: "Current reservations",
          icon: "◷",
          type: "orange",
        },
      ],

      sectionTitle: "Institution Overview",

      activities: [
        {
          title: "Equipment Inventory",
          subtitle: "5 laboratory resources registered",
          status: "Active",
          date: "Current",
        },
        {
          title: "Resource Utilization",
          subtitle: "Average laboratory utilization",
          status: "45%",
          date: "Current",
        },
        {
          title: "Maintenance",
          subtitle: "1 equipment currently under maintenance",
          status: "Attention",
          date: "Current",
        },
      ],
    },


    SYSTEM_ADMIN: {
      title: "System Administrator",
      subtitle: "Monitor and manage the Lab Resource Utilization Platform",

      stats: [
        {
          title: "Institutions",
          value: "1",
          description: "Registered institution",
          icon: "◆",
          type: "blue",
        },
        {
          title: "Departments",
          value: "3",
          description: "Across the institution",
          icon: "▦",
          type: "purple",
        },
        {
          title: "Equipment",
          value: "5",
          description: "Registered resources",
          icon: "▣",
          type: "green",
        },
        {
          title: "Active Bookings",
          value: "2",
          description: "Currently active",
          icon: "◷",
          type: "orange",
        },
      ],

      sectionTitle: "System Overview",

      activities: [
        {
          title: "Institution",
          subtitle: "1 institution currently registered",
          status: "Active",
          date: "Current",
        },
        {
          title: "Equipment",
          subtitle: "5 laboratory resources registered",
          status: "Active",
          date: "Current",
        },
        {
          title: "Bookings",
          subtitle: "2 active equipment reservations",
          status: "Active",
          date: "Current",
        },
      ],
    },
  };


  const data =
    dashboardData[role] ||
    dashboardData.RESEARCHER;


  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <div className="dashboard-header">

        <div>
          <h1>{data.title}</h1>

          <p>
            {data.subtitle}
          </p>
        </div>

        <div className="dashboard-role">
          {role.replaceAll("_", " ")}
        </div>

      </div>


      {/* STAT CARDS */}

      <div className="dashboard-stats">

        {data.stats.map((stat, index) => (

          <div
            className="dashboard-stat-card"
            key={index}
          >

            <div
              className={`dashboard-stat-icon ${stat.type}`}
            >
              {stat.icon}
            </div>

            <div className="dashboard-stat-content">

              <span>
                {stat.title}
              </span>

              <strong>
                {stat.value}
              </strong>

              <small>
                {stat.description}
              </small>

            </div>

          </div>

        ))}

      </div>


      {/* MAIN CONTENT */}

      <div className="dashboard-content">

        <div className="dashboard-section">

          <div className="dashboard-section-header">

            <div>
              <h2>
                {data.sectionTitle}
              </h2>

              <p>
                Current status and recent activity
              </p>
            </div>

          </div>


          <div className="dashboard-list">

            {data.activities.map(
              (activity, index) => (

                <div
                  className="dashboard-list-item"
                  key={index}
                >

                  <div className="dashboard-item-icon">
                    {activity.title.charAt(0)}
                  </div>

                  <div className="dashboard-item-info">

                    <strong>
                      {activity.title}
                    </strong>

                    <span>
                      {activity.subtitle}
                    </span>

                  </div>

                  <div className="dashboard-item-date">
                    {activity.date}
                  </div>

                  <div
                    className={`dashboard-status ${activity.status
                      .toLowerCase()
                      .replaceAll(" ", "-")
                      .replace("%", "percent")}`}
                  >
                    {activity.status}
                  </div>

                </div>

              )
            )}

          </div>

        </div>


        {/* QUICK ACTIONS */}

        <div className="dashboard-actions">

          <h2>Quick Actions</h2>

          <p>
            Common actions for your role
          </p>

          {role === "RESEARCHER" && (
            <>
              <button>Browse Equipment</button>
              <button>Make a Booking</button>
              <button>View My Bookings</button>
              <button>View Waitlist</button>
            </>
          )}

          {role === "LAB_MANAGER" && (
            <>
              <button>View Equipment</button>
              <button>View Utilization</button>
              <button>View Bookings</button>
              <button>View Reports</button>
            </>
          )}

          {role === "LAB_TECHNICIAN" && (
            <>
              <button>View Equipment</button>
              <button>Maintenance Tasks</button>
              <button>Maintenance History</button>
              <button>View Bookings</button>
            </>
          )}

          {role === "DEPARTMENT_HEAD" && (
            <>
              <button>Department Equipment</button>
              <button>View Utilization</button>
              <button>Demand Analysis</button>
              <button>View Reports</button>
            </>
          )}

          {role === "INSTITUTION_ADMIN" && (
            <>
              <button>View Departments</button>
              <button>View Equipment</button>
              <button>View Users</button>
              <button>View Reports</button>
            </>
          )}

          {role === "SYSTEM_ADMIN" && (
            <>
              <button>View Institutions</button>
              <button>View Equipment</button>
              <button>Manage Users</button>
              <button>View Reports</button>
            </>
          )}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;