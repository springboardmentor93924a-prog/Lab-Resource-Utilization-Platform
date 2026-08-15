import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getMyWaitlistEntries } from "../services/waitlistService";

function statusColor(status) {
  switch (status) {
    case "NOTIFIED":
      return "#22c55e";

    case "EXPIRED":
      return "#94a3b8";

    default:
      return "#f59e0b";
  }
}

export default function MyWaitlist() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load waitlist entries when the page opens
  useEffect(() => {
    getMyWaitlistEntries()
      .then((data) => {
        setEntries(data);
      })
      .catch((err) => {
        console.error("Failed to load waitlist entries:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#020b1c",
      }}
    >
      {/* SIDEBAR */}
      <aside className="sidebar">
        <Sidebar />
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: "30px",
          background: "#020b1c",
          color: "#ffffff",
        }}
      >
        {/* PAGE TITLE */}
        <h2
          style={{
            fontWeight: 800,
            color: "#ffffff",
            marginBottom: "25px",
            fontSize: "24px",
          }}
        >
          My waitlist
        </h2>

        {/* LOADING */}
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

        {/* EMPTY WAITLIST */}
        {!loading && entries.length === 0 && (
          <div
            style={{
              background: "#071a33",
              borderRadius: "12px",
              padding: "25px",
              border: "1px solid #183858",
              boxShadow: "0 6px 18px rgba(0,0,0,0.20)",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 500,
              }}
            >
              You're not on any waitlists.
            </p>
          </div>
        )}

        {/* WAITLIST ENTRIES */}
        {!loading && entries.length > 0 && (
          <div
            style={{
              background: "#071a33",
              borderRadius: "12px",
              padding: "10px",
              border: "1px solid #183858",
              boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
              overflow: "hidden",
            }}
          >
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "18px 15px",
                  borderBottom:
                    index === entries.length - 1
                      ? "none"
                      : "1px solid #183858",
                  gap: "20px",
                  background:
                    entry.status === "NOTIFIED" ? "#0b2942" : "#071a33",
                }}
              >
                {/* BOOKING INFORMATION */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {/* EQUIPMENT NAME */}
                  <strong
                    style={{
                      color: "#ffffff",
                      fontSize: "16px",
                      fontWeight: 700,
                      display: "block",
                      marginBottom: "5px",
                    }}
                  >
                    {entry.equipmentName}
                  </strong>

                  {/* DATE AND TIME */}
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#cbd5e1",
                      fontWeight: 500,
                    }}
                  >
                    {entry.requestedDate}, {entry.startTime}–
                    {entry.endTime}
                  </div>

                  {/* NOTIFICATION MESSAGE */}
                  {entry.status === "NOTIFIED" && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#2DD4BF",
                        marginTop: "6px",
                        fontWeight: 600,
                      }}
                    >
                      A slot has opened up — try booking again!
                    </div>
                  )}
                </div>

                {/* STATUS */}
                <span
                  style={{
                    background: statusColor(entry.status),
                    color: "#ffffff",
                    padding: "7px 15px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.20)",
                  }}
                >
                  {entry.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}