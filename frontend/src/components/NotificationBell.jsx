import { useState, useRef, useEffect } from "react";
import useNotifications from "../hooks/useNotifications";
import "./NotificationBell.css";

function timeAgo(dateString) {
  // EDGE CASE: missing/invalid date — don't crash, just say "just now"
  if (!dateString) return "just now";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close the dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="notification-bell-container" ref={containerRef}>
      <button
        className="notification-bell-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <strong>Notifications</strong>
          </div>

          <div className="notification-list">
            {/* EDGE CASE: no notifications yet */}
            {notifications.length === 0 && (
              <div className="notification-empty">You're all caught up.</div>
            )}

            {notifications.map((n) => (
              <div
                key={n.notificationId}
                className={`notification-item ${n.isRead ? "" : "unread"}`}
              >
                <div className="notification-item-text">
                  <strong>{n.title}</strong>
                  <p>{n.message}</p>
                  <span className="notification-time">{timeAgo(n.createdAt)}</span>
                </div>

                {/* Button, not a link/text — matches your preference for
                    structured clickable actions over free text */}
                {!n.isRead && (
                  <button
                    className="notification-mark-read-btn"
                    onClick={() => markAsRead(n.notificationId)}
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;