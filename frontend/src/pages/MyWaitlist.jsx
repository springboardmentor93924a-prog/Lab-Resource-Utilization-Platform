import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getBookingsByUser } from "../services/bookingService";
import { getCurrentUserId } from "../utils/auth";


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


  useEffect(() => {
    loadEntries();
  }, []);


  async function loadEntries() {
    try {
      const userId = getCurrentUserId();
      const data = await getBookingsByUser(userId);
      const waitlisted = data.filter((b) => b.bookingStatus === "WAITLISTED");
      setEntries(waitlisted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }


  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#020b1c",
      }}
    >

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">
        <Sidebar />
      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

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
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: "25px",
            fontSize: "22px",
          }}
        >
          My waitlist
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


        {/* EMPTY WAITLIST */}

        {!loading && entries.length === 0 && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "25px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.20)",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#0f1b2d",
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
              background: "#ffffff",
              borderRadius: "12px",
              padding: "10px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.20)",
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
                      : "1px solid #e2e8f0",
                  gap: "20px",
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
                      color: "#0f1b2d",
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
                      color: "#475569",
                      fontWeight: 500,
                    }}
                  >
                   {entry.bookingDate}, {entry.startTime}–
                    {entry.endTime}
                  </div>


                  {/* NOTIFICATION MESSAGE */}

                 {entry.bookingStatus === "NOTIFIED" && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#15803d",
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
                    background: statusColor(entry.bookingStatus),
                    color: "#ffffff",
                    padding: "7px 15px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.12)",
                  }}
                >
                 {entry.bookingStatus}
                </span>

              </div>
            ))}

          </div>
        )}

      </main>
    </div>
  );
}
