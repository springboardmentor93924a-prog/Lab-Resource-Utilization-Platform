import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  getMyNotifications,
  markAsRead,
} from "../services/notificationService";

function typeIcon(type) {
  switch (type) {
    case "BOOKING_APPROVED":
      return "bi-calendar-check";
    case "BOOKING_REJECTED":
      return "bi-calendar-x";
    case "WAITLIST_SLOT_OPEN":
      return "bi-hourglass-split";
    case "WORK_ORDER_ASSIGNED":
      return "bi-tools";
    default:
      return "bi-bell";
  }
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load notifications when the page opens
  useEffect(() => {
    getMyNotifications()
      .then((data) => {
        setNotifications(data);
      })
      .catch((err) => {
        console.error("Failed to load notifications:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Reload notifications after marking one as read
  async function loadNotifications() {
    try {
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }

  async function handleMarkRead(id) {
    try {
      await markAsRead(id);
      await loadNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#020d20",
      }}
    >
      {/* Sidebar */}
      <aside className="sidebar">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: "30px",
          minHeight: "100vh",
          background: "#020d20",
        }}
      >
        {/* Heading */}
        <h2
          style={{
            margin: 0,
            marginBottom: "25px",
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 800,
          }}
        >
          Notifications
        </h2>

        {/* Loading */}
        {loading && (
          <p
            style={{
              color: "#cbd5e1",
              fontSize: "15px",
            }}
          >
            Loading...
          </p>
        )}

        {/* Empty State */}
        {!loading && notifications.length === 0 && (
          <p
            style={{
              color: "#cbd5e1",
              fontSize: "15px",
            }}
          >
            No notifications yet.
          </p>
        )}

        {/* Notifications List */}
        {!loading && notifications.length > 0 && (
          <div
            style={{
              background: "#071a33",
              borderRadius: "12px",
              padding: "10px",
              border: "1px solid #183858",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.25)",
            }}
          >
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.isRead) {
                    handleMarkRead(n.id);
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  padding: "16px",
                  borderBottom: "1px solid #183858",
                  background: n.isRead ? "#071a33" : "#0b2942",
                  cursor: n.isRead ? "default" : "pointer",
                }}
              >
                {/* Notification Icon */}
                <i
                  className={`bi ${typeIcon(n.type)}`}
                  style={{
                    fontSize: "20px",
                    color: "#2DD4BF",
                    marginTop: "2px",
                    flexShrink: 0,
                  }}
                ></i>

                {/* Notification Content */}
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: 0,
                      color: "#ffffff",
                      fontSize: "15px",
                      lineHeight: "1.5",
                      fontWeight: n.isRead ? 400 : 600,
                    }}
                  >
                    {n.message}
                  </p>

                  <span
                    style={{
                      display: "block",
                      marginTop: "5px",
                      color: "#94a3b8",
                      fontSize: "12px",
                    }}
                  >
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Unread Indicator */}
                {!n.isRead && (
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#2DD4BF",
                      marginTop: "8px",
                      flexShrink: 0,
                    }}
                  ></span>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}