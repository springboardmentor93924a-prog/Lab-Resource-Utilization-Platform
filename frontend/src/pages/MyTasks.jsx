import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  getMyAssignedWorkOrders,
  markComplete,
} from "../services/maintenanceService";

function statusColor(status) {
  switch (status) {
    case "OPEN":
      return "#ef4444";
    case "IN_PROGRESS":
      return "#f59e0b";
    case "COMPLETED":
      return "#22c55e";
    default:
      return "#94a3b8";
  }
}

export default function MyTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const data = await getMyAssignedWorkOrders();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete(id) {
    try {
      await markComplete(id);
      alert("Marked as complete.");
      loadTasks();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to mark complete."
      );
    }
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        background: "#020b1c",
        color: "#ffffff",
      }}
    >
      {/* SIDEBAR */}
      <aside
        className="sidebar"
        style={{
          flexShrink: 0,
        }}
      >
        <Sidebar />
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          minHeight: "100vh",
          padding: "30px",
          background: "#020b1c",
          color: "#ffffff",
        }}
      >
        {/* PAGE TITLE */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}><h2
          style={{
            fontWeight: 700,
            fontSize: "22px",
            color: "#ffffff",
            }}
        >
          My assigned tasks
        </h2><button onClick={() => navigate("/profile")} title="My Profile" aria-label="My Profile" style={{ width: 38, height: 38, borderRadius: "50%", background: "#dbeafe", border: "2px solid #93c5fd", color: "#312e81", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.3 0-9.8 1.6-9.8 4.9v2.1c0 .7.5 1.2 1.2 1.2h17.2c.7 0 1.2-.5 1.2-1.2v-2.1c0-3.3-6.5-4.9-9.8-4.9z"/></svg></button></div>

        {/* LOADING */}
        {loading && (
          <p
            style={{
              color: "#ffffff",
              fontSize: "15px",
            }}
          >
            Loading...
          </p>
        )}

        {/* NO TASKS */}
        {!loading && tasks.length === 0 && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "25px",
              color: "#0F172A",
              boxShadow: "0 4px 12px rgba(0,0,0,0.20)",
            }}
          >
            No tasks assigned to you.
          </div>
        )}

        {/* TASK LIST */}
        {!loading && tasks.length > 0 && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "10px",
              boxShadow:
                "0 8px 25px rgba(0,0,0,0.25)",
              overflow: "hidden",
            }}
          >
            {tasks.map((t, index) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "20px 18px",
                  borderBottom:
                    index !== tasks.length - 1
                      ? "1px solid #E2E8F0"
                      : "none",
                  background: "#ffffff",
                  color: "#0F172A",
                  minHeight: "95px",
                }}
              >
                {/* TASK INFORMATION */}
                <div
                  style={{
                    flex: 1,
                    paddingRight: "20px",
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#0F172A",
                      marginBottom: "6px",
                    }}
                  >
                    {t.equipmentName}
                  </strong>

                  <div
                    style={{
                      fontSize: "14px",
                      color: "#334155",
                      marginBottom: "5px",
                    }}
                  >
                    {t.issueDescription}
                  </div>

                  <div
                    style={{
                      fontSize: "13px",
                      color: "#64748B",
                    }}
                  >
                    Priority: {t.priority}
                  </div>
                </div>

                {/* STATUS + ACTION */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      background: statusColor(t.status),
                      color: "#ffffff",
                      padding: "7px 15px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.status}
                  </span>

                  {t.status === "IN_PROGRESS" && (
                    <button
                      className="btn btn-outline-dark"
                      onClick={() =>
                        handleComplete(t.id)
                      }
                      style={{
                        fontWeight: 600,
                      }}
                    >
                      Mark complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
