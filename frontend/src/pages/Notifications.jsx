import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getMyNotifications, markRead, markAllRead } from "../services/notificationService";

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id) {
    try {
      await markRead(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllRead();
      loadData();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#020b1c", color: "#fff" }}>
      <aside className="sidebar">
        <Sidebar />
      </aside>
      <main style={{ flex: 1, padding: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700 }}>Notifications</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              style={{
                background: "#1557a8",
                color: "#fff",
                border: "1px solid #38bdf8",
                borderRadius: "7px",
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              Mark all as read
            </button>
          )}
<button onClick={() => navigate("/profile")} title="My Profile" aria-label="My Profile" style={{ width: 38, height: 38, borderRadius: "50%", background: "#dbeafe", border: "2px solid #93c5fd", color: "#312e81", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.3 0-9.8 1.6-9.8 4.9v2.1c0 .7.5 1.2 1.2 1.2h17.2c.7 0 1.2-.5 1.2-1.2v-2.1c0-3.3-6.5-4.9-9.8-4.9z"/></svg></button>
</div>
</div>

        {loading && <p>Loading notifications...</p>}
        {error && <p style={{ color: "#f87171" }}>{error}</p>}

        {!loading && !error && (
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", overflow: "hidden" }}>
            {notifications.length === 0 && (
              <p style={{ padding: "20px", color: "#94a3b8" }}>No notifications yet.</p>
            )}
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkRead(n.id)}
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #1f2937",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: n.isRead ? "transparent" : "#0F1B2D",
                  cursor: n.isRead ? "default" : "pointer",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: n.isRead ? 400 : 600 }}>{n.message}</p>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.isRead && (
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#38bdf8", flexShrink: 0 }}></span>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
