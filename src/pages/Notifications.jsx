import { useEffect, useState } from "react";
import { getMyNotifications, markNotificationAsRead, runReminderCheck } from "../api/notificationApi";
import { extractErrorMessage } from "../api/client";
import { page, headerRow, h1Style, subStyle, card, errorText, emptyText, pill, primaryBtn } from "../styles/shared";

const REMINDER_ROLES = ["SYSTEM_ADMIN", "INSTITUTION_ADMIN"];

function Notifications({ userRole, showToast }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    getMyNotifications()
      .then((data) => setNotifications(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
      .catch((err) => setError(extractErrorMessage(err, "Failed to load notifications.")))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleMarkRead = async (n) => {
    try {
      await markNotificationAsRead(n.notificationId);
      setNotifications((prev) => prev.map((x) => x.notificationId === n.notificationId ? { ...x, read: true } : x));
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Failed to update notification."), "warning");
    }
  };

  const handleRunReminders = async () => {
    try {
      await runReminderCheck();
      showToast?.("Reminder check triggered.", "success");
      load();
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Failed to run reminder check."), "warning");
    }
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>Notifications</h1>
          <p style={subStyle}>{unread} unread notification{unread === 1 ? "" : "s"}</p>
        </div>
        {REMINDER_ROLES.includes(userRole) && (
          <button onClick={handleRunReminders} style={primaryBtn}>Run Reminder Check</button>
        )}
      </div>

      {error && <p style={errorText}>{error}</p>}

      <div style={card}>
        {loading ? (
          <p style={{ padding: 20 }}>Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p style={emptyText}>No notifications yet.</p>
        ) : (
          <div>
            {notifications.map((n) => (
              <div
                key={n.notificationId}
                onClick={() => !n.read && handleMarkRead(n)}
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #f0f2f6",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  cursor: n.read ? "default" : "pointer",
                  background: n.read ? "white" : "#f8fafc",
                }}
              >
                <div>
                  <span style={pill("#eaf2ff", "#2563eb")}>{n.type}</span>
                  <p style={{ margin: "8px 0 4px", fontSize: 14, color: "#334155" }}>{n.message}</p>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                  </span>
                </div>
                {!n.read && <span style={pill("#fff4df", "#b56a00")}>New — click to mark read</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
