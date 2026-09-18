import { useEffect, useState } from "react";
import "./Dashboard.css";
import StatsCard from "../components/StatsCard";
import { getAllEquipment } from "../api/equipmentApi";
import { getAllBookings } from "../api/bookingApi";
import { getUnreadCount } from "../api/notificationApi";
import { getUtilizationAnalytics } from "../api/utilizationApi";
import { getPendingUsers } from "../api/userApi";
import { getPendingSharingRequests } from "../api/sharingApi";
import { getAllMaintenanceRequests } from "../api/maintenanceApi";
import { ROLE_LABELS } from "../utils/constants";

// Roles allowed to call GET /api/utilization/analytics per SecurityConfig
const ANALYTICS_ROLES = [
  "SYSTEM_ADMIN",
  "INSTITUTION_ADMIN",
  "DEPARTMENT_HEAD",
  "LAB_MANAGER",
  "LAB_TECHNICIAN",
];
const ADMIN_ROLES = ["SYSTEM_ADMIN", "INSTITUTION_ADMIN"];
const SHARING_ROLES = ["LAB_MANAGER", "DEPARTMENT_HEAD", "INSTITUTION_ADMIN"];

function Dashboard({ role, user }) {
  const [equipment, setEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [analytics, setAnalytics] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingSharing, setPendingSharing] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const tasks = [
      getAllEquipment().then((d) => !cancelled && setEquipment(d)).catch(() => {}),
      getAllBookings().then((d) => !cancelled && setBookings(d)).catch(() => {}),
      getUnreadCount().then((d) => !cancelled && setUnreadCount(d)).catch(() => {}),
      getAllMaintenanceRequests()
        .then((d) => !cancelled && setMaintenanceRequests(d))
        .catch(() => {}),
    ];

    if (ANALYTICS_ROLES.includes(role)) {
      tasks.push(
        getUtilizationAnalytics().then((d) => !cancelled && setAnalytics(d)).catch(() => {})
      );
    }
    if (ADMIN_ROLES.includes(role)) {
      tasks.push(
        getPendingUsers().then((d) => !cancelled && setPendingUsers(d)).catch(() => {})
      );
    }
    if (SHARING_ROLES.includes(role)) {
      tasks.push(
        getPendingSharingRequests()
          .then((d) => !cancelled && setPendingSharing(d))
          .catch(() => {})
      );
    }

    Promise.allSettled(tasks).finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [role]);

  const available = equipment.filter((e) => e.status === "AVAILABLE").length;
  const inUse = equipment.filter((e) => e.status === "IN_USE" || e.status === "BOOKED").length;
  const underMaintenance = equipment.filter((e) => e.status === "UNDER_MAINTENANCE").length;

  const myBookings = user?.userId
    ? bookings.filter((b) => b.requestedById === user.userId)
    : [];
  const pendingBookings = bookings.filter((b) => b.status === "PENDING_APPROVAL").length;

  const avgUtilization =
    analytics.length > 0
      ? (
          analytics.reduce((sum, a) => sum + (a.utilizationPercentage || 0), 0) /
          analytics.length
        ).toFixed(1)
      : null;

  const openMaintenance = maintenanceRequests.filter(
    (r) => r.status === "PENDING" || r.status === "APPROVED"
  ).length;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""} —{" "}
            {ROLE_LABELS[role] || role}
          </p>
        </div>
      </div>

      {loading && <p>Loading dashboard...</p>}

      <div className="stats-grid">
        <StatsCard
          title="Total Equipment"
          value={equipment.length}
          description={`${available} available`}
        />
        <StatsCard
          title="In Use / Booked"
          value={inUse}
          description={`${underMaintenance} under maintenance`}
        />
        {role === "RESEARCHER" ? (
          <StatsCard
            title="My Bookings"
            value={myBookings.length}
            description="Bookings you've made"
          />
        ) : (
          <StatsCard
            title="Total Bookings"
            value={bookings.length}
            description={`${pendingBookings} pending approval`}
          />
        )}
        <StatsCard
          title="Unread Notifications"
          value={unreadCount}
          description="Check your notifications panel"
        />
        {avgUtilization !== null && (
          <StatsCard
            title="Avg Utilization"
            value={`${avgUtilization}%`}
            description={`${analytics.length} equipment tracked`}
          />
        )}
        {ADMIN_ROLES.includes(role) && (
          <StatsCard
            title="Pending User Approvals"
            value={pendingUsers.length}
            description="Awaiting admin action"
          />
        )}
        {SHARING_ROLES.includes(role) && (
          <StatsCard
            title="Pending Sharing Requests"
            value={pendingSharing.length}
            description="Cross-department/institution"
          />
        )}
        <StatsCard
          title="Open Maintenance"
          value={openMaintenance}
          description={`${maintenanceRequests.length} total requests`}
        />
      </div>

      <div className="dashboard-section">
        <h2>Recent Bookings</h2>
        {bookings.length === 0 ? (
          <p className="dashboard-empty">No bookings yet.</p>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Equipment</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 8).map((b) => (
                <tr key={b.bookingId}>
                  <td>#{b.bookingId}</td>
                  <td>{b.equipmentName || `Equipment ${b.equipId}`}</td>
                  <td>{b.startTime ? new Date(b.startTime).toLocaleString() : "-"}</td>
                  <td>{b.endTime ? new Date(b.endTime).toLocaleString() : "-"}</td>
                  <td>
                    <span className={`status-badge status-${(b.status || "").toLowerCase()}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
