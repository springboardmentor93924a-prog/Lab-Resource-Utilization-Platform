import { useEffect, useState } from "react";
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
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  loadTasks();
}, []);

async function handleComplete(id) {
  try {
    await markComplete(id);
    alert("Marked as complete.");

    // Reload tasks after completing the work order
    const data = await getMyAssignedWorkOrders();
    setTasks(data);
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
        <h2
          style={{
            fontWeight: 700,
            fontSize: "22px",
            color: "#ffffff",
            marginBottom: "25px",
          }}
        >
          My assigned tasks
        </h2>

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