import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useNotifications from "../hooks/useNotifications";

// Notifications Center: the full list of a user's notifications (the bell
// in the top bar only shows the latest ones), with read / unread filters
// and desktop (browser) push notifications.

const TYPE_LABELS = [
  ["BOOKING", "Booking"],
  ["WAITLIST", "Waitlist"],
  ["MAINTENANCE", "Maintenance"],
  ["CALIBRATION", "Calibration"],
  ["CERTIFICATION", "Certification"],
  ["SHARING", "Sharing"],
  ["IDLE", "Idle equipment"],
  ["REGISTRATION", "Registration"],
  ["EQUIPMENT", "Equipment"],
];

// where "Open" goes, per notification type prefix - and who may open it.
const DESTINATIONS = [
  ["BOOKING", "/reservations", ["STUDENT", "LAB_MANAGER", "DEPARTMENT_HEAD", "INSTITUTION_ADMIN", "SYSTEM_ADMIN"]],
  ["CROSS_INSTITUTION", "/reservations", ["STUDENT", "LAB_MANAGER", "DEPARTMENT_HEAD", "INSTITUTION_ADMIN", "SYSTEM_ADMIN"]],
  ["WAITLIST", "/waitlist", ["STUDENT", "LAB_MANAGER", "SYSTEM_ADMIN"]],
  ["MAINTENANCE", "/maintenance", ["LAB_TECHNICIAN", "LAB_MANAGER", "SYSTEM_ADMIN"]],
  ["CALIBRATION", "/calibration", ["LAB_TECHNICIAN", "SYSTEM_ADMIN"]],
  ["CERTIFICATION", "/certification", ["LAB_TECHNICIAN", "LAB_MANAGER", "SYSTEM_ADMIN"]],
  ["SHARING", "/resource-sharing", ["LAB_MANAGER", "DEPARTMENT_HEAD", "INSTITUTION_ADMIN", "SYSTEM_ADMIN"]],
  ["RESOURCE_SHARING", "/resource-sharing", ["LAB_MANAGER", "DEPARTMENT_HEAD", "INSTITUTION_ADMIN", "SYSTEM_ADMIN"]],
  ["IDLE", "/equipment", null],
];

const findDestination = (type, role) => {
  const hit = DESTINATIONS.find(([prefix]) => (type || "").startsWith(prefix));
  if (!hit) return null;
  const [, path, roles] = hit;
  return !roles || roles.includes(role) ? path : null;
};

const categoryOf = (type) => {
  const hit = TYPE_LABELS.find(([prefix]) => (type || "").includes(prefix));
  return hit ? hit[1] : "Other";
};

const formatTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value).replace("T", " ").slice(0, 16) : d.toLocaleString();
};

function Notifications() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const role = sessionStorage.getItem("role");

  const [filter, setFilter] = useState("ALL");
  const [pushState, setPushState] = useState(
    typeof window !== "undefined" && "Notification" in window
      ? window.Notification.permission
      : "unsupported"
  );

  const enablePush = async () => {
    try {
      const result = await window.Notification.requestPermission();
      setPushState(result);
    } catch {
      setPushState("denied");
    }
  };

  const markAllRead = () => {
    notifications.filter((n) => !n.isRead).forEach((n) => markAsRead(n.notificationId));
  };

  const visible = notifications.filter((n) => (filter === "UNREAD" ? !n.isRead : true));

  const chip = (active) => ({
    padding: "6px 14px",
    borderRadius: "999px",
    border: "1px solid #cbd5e1",
    background: active ? "#1d4ed8" : "#fff",
    color: active ? "#fff" : "#334155",
    cursor: "pointer",
    fontSize: "13px",
  });

  return (
    <div style={{ padding: "24px", maxWidth: "820px" }}>
      <h2 style={{ margin: 0 }}>Notifications</h2>
      <p style={{ color: "#64748b", marginTop: "6px" }}>
        Everything the platform has told you: bookings, waitlist, maintenance,
        calibration, sharing and more.
      </p>

      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", margin: "14px 0" }}>
        <button style={chip(filter === "ALL")} onClick={() => setFilter("ALL")}>
          All ({notifications.length})
        </button>
        <button style={chip(filter === "UNREAD")} onClick={() => setFilter("UNREAD")}>
          Unread ({unreadCount})
        </button>

        <span style={{ flex: 1 }} />

        {unreadCount > 0 && (
          <button
            style={{ ...chip(false), border: "1px solid #94a3b8" }}
            onClick={markAllRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      {pushState === "default" && (
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "13px", color: "#1e3a8a" }}>
            Get desktop notifications the moment something happens, even when this tab is in the background.
          </span>
          <button
            onClick={enablePush}
            style={{ padding: "6px 12px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            Turn on
          </button>
        </div>
      )}
      {pushState === "granted" && (
        <p style={{ fontSize: "12px", color: "#166534", margin: "0 0 12px" }}>
          Desktop notifications are on.
        </p>
      )}
      {pushState === "denied" && (
        <p style={{ fontSize: "12px", color: "#92400e", margin: "0 0 12px" }}>
          Desktop notifications are blocked in this browser. Allow them in the site settings to turn them on.
        </p>
      )}

      {visible.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px", color: "#64748b" }}>
          {filter === "UNREAD" ? "You're all caught up." : "No notifications yet."}
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
          {visible.map((n) => {
            const destination = findDestination(n.notificationType, role);

            return (
              <div
                key={n.notificationId}
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "14px 16px",
                  borderBottom: "1px solid #f1f5f9",
                  background: n.isRead ? "#fff" : "#f8fafc",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    marginTop: "7px",
                    background: n.isRead ? "transparent" : "#2563eb",
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: n.isRead ? 500 : 700 }}>{n.title}</div>
                  <div style={{ fontSize: "14px", color: "#475569", marginTop: "2px" }}>{n.message}</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                    {categoryOf(n.notificationType)} · {formatTime(n.createdAt)}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {destination && (
                    <button
                      onClick={() => {
                        if (!n.isRead) markAsRead(n.notificationId);
                        navigate(destination);
                      }}
                      style={{ padding: "4px 10px", fontSize: "12px", border: "1px solid #cbd5e1", background: "#fff", borderRadius: "6px", cursor: "pointer" }}
                    >
                      Open
                    </button>
                  )}
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n.notificationId)}
                      style={{ padding: "4px 10px", fontSize: "12px", border: "none", background: "transparent", color: "#2563eb", cursor: "pointer" }}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;