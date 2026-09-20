import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useNotifications from "../hooks/useNotifications";
import "./NotificationBell.css";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

function timeAgo(dateString) {
  if (!dateString) return "just now";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Static type -> button label + destination map. referenceId's MEANING
// depends on the type (equipmentId vs bookingId vs calibrationId etc) —
// this is documented per-entry since the backend doesn't send that
// distinction explicitly.
const STATIC_ACTIONS = {
  BOOKING_CONFIRMATION: { label: "View Booking", path: () => "/reservations" },
  BOOKING_REMINDER: { label: "View Booking", path: () => "/reservations" },
  BOOKING_APPROVED: { label: "View Booking", path: () => "/reservations" },
  BOOKING_REJECTED: { label: "View Booking", path: () => "/reservations" },
  BOOKING_COMPLETED: { label: "View Booking", path: () => "/reservations" },
  CROSS_INSTITUTION_BOOKING_REQUEST: { label: "Review Request", path: () => "/reservations" },
  CROSS_INSTITUTION_BOOKING_REVIEWED: { label: "View Booking", path: () => "/reservations" },
  BOOKING_MANAGER_APPROVAL_REQUIRED: { label: "Review Request", path: () => "/reservations" },
  WAITLIST_AVAILABLE: { label: "Book Now", path: (n) => `/reservations?equipmentId=${n.referenceId}` },
  EQUIPMENT_IN_CALIBRATION: { label: "Join Waitlist", path: (n) => `/waitlist?equipmentId=${n.referenceId}` },
  EQUIPMENT_ISSUE_REPORTED: { label: "View Waitlist", path: () => "/waitlist" },
  WAITLIST_MISSED_WINDOW: { label: "Decide Now", path: () => "/waitlist" },
  WAITLIST_AUTO_CANCELLED: { label: "View Waitlist", path: () => "/waitlist" },
  CALIBRATION_DUE_SOON: { label: "Go to Calibration", path: () => "/calibration" },
  CALIBRATION_OVERDUE: { label: "Go to Calibration", path: () => "/calibration" },
  CERTIFICATION_EXPIRING: { label: "Go to Certification", path: () => "/certification" },
  CERTIFICATION_EXPIRED: { label: "Go to Certification", path: () => "/certification" },
  MAINTENANCE_DUE_SOON: { label: "Go to Maintenance", path: () => "/maintenance" },
  MAINTENANCE_VERIFICATION_REQUIRED: { label: "Verify Work", path: () => "/maintenance" },
  MAINTENANCE_VERIFIED: { label: "Go to Maintenance", path: () => "/maintenance" },
  MAINTENANCE_REJECTED: { label: "Redo Work", path: () => "/maintenance" },
  MAINTENANCE_OVERDUE: { label: "Go to Maintenance", path: () => "/maintenance" },
  IDLE_EQUIPMENT: { label: "View Equipment", path: () => "/equipment" },
  SHARING_REQUEST_RECEIVED: { label: "View Requests", path: () => "/resource-sharing" },
  SHARING_REQUEST_APPROVED: { label: "View Requests", path: () => "/resource-sharing" },
  SHARING_REQUEST_REJECTED: { label: "View Requests", path: () => "/resource-sharing" },
  // The old standalone /feedback page no longer exists - issue reports are
  // handled from the Maintenance page now.
  EQUIPMENT_FEEDBACK_REPORTED: { label: "Solve Error", path: () => "/maintenance" },
};

// Which roles can actually open each page (mirrors AppRoutes.jsx). A
// notification's action button is only shown when the logged-in role can
// open its destination - otherwise the click would just bounce to the
// dashboard.
const PATH_ROLES = {
  "/reservations": ["STUDENT", "LAB_MANAGER", "DEPARTMENT_HEAD", "INSTITUTION_ADMIN", "SYSTEM_ADMIN"],
  "/waitlist": ["STUDENT", "LAB_MANAGER", "SYSTEM_ADMIN"],
  "/calibration": ["LAB_TECHNICIAN", "SYSTEM_ADMIN"],
  "/certification": ["LAB_TECHNICIAN", "LAB_MANAGER", "SYSTEM_ADMIN"],
  "/maintenance": ["LAB_TECHNICIAN", "LAB_MANAGER", "SYSTEM_ADMIN"],
  "/resource-sharing": ["LAB_MANAGER", "DEPARTMENT_HEAD", "INSTITUTION_ADMIN", "SYSTEM_ADMIN"],
};

function canOpenPath(path, role) {
  const allowed = PATH_ROLES[path.split("?")[0]];
  return !allowed || allowed.includes(role);
}

// Types where referenceId is an equipmentId and the "right" next step
// genuinely depends on whether that equipment is bookable right now —
// so instead of a fixed destination, check live status first.
const SMART_EQUIPMENT_TYPES = new Set(["EQUIPMENT_ISSUE_RESOLVED"]);

function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = async (n) => {
    if (!n.isRead) markAsRead(n.notificationId);
    setOpen(false);

    if (SMART_EQUIPMENT_TYPES.has(n.notificationType)) {
      // Dynamic action: check the equipment's live status, then route
      // to Reservations (book) if it's free, or Waitlist if it's not.
      setResolvingId(n.notificationId);
      try {
        const res = await fetch(`${API_BASE_URL}/equipment/${n.referenceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Equipment lookup failed");
        const equipment = await res.json();

        if (equipment.status === "Available") {
          navigate(`/reservations?equipmentId=${n.referenceId}`);
        } else {
          navigate(`/waitlist?equipmentId=${n.referenceId}`);
        }
      } catch {
        // EDGE CASE: lookup failed (equipment deleted, network error) —
        // fall back to the waitlist page rather than dead-ending the click
        navigate("/waitlist");
      } finally {
        setResolvingId(null);
      }
      return;
    }

    const action = STATIC_ACTIONS[n.notificationType];
    if (action) {
      navigate(action.path(n));
    }
    // EDGE CASE: unrecognized/future notification type — no button is
    // rendered for it at all (see render logic below), so this branch
    // is just a safety net and intentionally does nothing.
  };

  return (
    <div className="notification-bell-container" ref={containerRef}>
      <button className="notification-bell-btn" onClick={() => setOpen((o) => !o)} aria-label="Notifications">
        🔔
        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header"><strong>Notifications</strong></div>

          <div className="notification-list">
            {notifications.length === 0 && (
              <div className="notification-empty">You're all caught up.</div>
            )}

            {notifications.map((n) => {
              const staticAction = STATIC_ACTIONS[n.notificationType];
              const hasAction = SMART_EQUIPMENT_TYPES.has(n.notificationType)
                ? role === "STUDENT"
                : staticAction && canOpenPath(staticAction.path(n), role);

              return (
                <div key={n.notificationId} className={`notification-item ${n.isRead ? "" : "unread"}`}>
                  <div className="notification-item-text">
                    <strong>{n.title}</strong>
                    <p>{n.message}</p>
                    <span className="notification-time">{timeAgo(n.createdAt)}</span>

                    <div className="notification-item-buttons">
                      {hasAction && (
                        <button
                          className="notification-action-btn"
                          disabled={resolvingId === n.notificationId}
                          onClick={() => handleAction(n)}
                        >
                          {resolvingId === n.notificationId
                            ? "Checking..."
                            : STATIC_ACTIONS[n.notificationType]?.label || "Take Action"}
                        </button>
                      )}
                      {!n.isRead && (
                        <button className="notification-mark-read-btn" onClick={() => markAsRead(n.notificationId)}>
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;