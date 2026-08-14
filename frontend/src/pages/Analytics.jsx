import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getMyAnalytics } from "../services/analyticsService";

// =========================
// COLORS
// =========================
const PAGE_BG = "#0B1730";
const CARD_BG = "#FFFFFF";
const DARK_TEXT = "#0F1B2D";
const SECONDARY_TEXT = "#475569";
const BORDER = "#E2E8F0";

// =========================
// WHITE CARD STYLE
// =========================
const cardStyle = {
  background: CARD_BG,
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
  color: DARK_TEXT,
};

// =========================
// STAT CARD STYLE
// =========================
const statBox = (color) => ({
  borderRadius: "12px",
  padding: "20px",
  color: "#FFFFFF",
  background: color,
  boxShadow: "0 4px 12px rgba(0,0,0,0.20)",
});

// =========================
// LIST ITEM STYLE
// =========================
const itemStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 0",
  borderBottom: `1px solid ${BORDER}`,
  color: DARK_TEXT,
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getMyAnalytics();

        console.log("Analytics response:", result);

        setData(result);
      } catch (err) {
        console.error("Analytics error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: PAGE_BG,
        }}
      >
        <aside className="sidebar">
          <Sidebar />
        </aside>

        <main
          style={{
            flex: 1,
            padding: "30px",
            background: PAGE_BG,
            minHeight: "100vh",
            color: "#FFFFFF",
          }}
        >
          <h6
            style={{
              fontWeight: 700,
              color: "#FFFFFF",
              marginBottom: "25px",
              fontSize: "22px",
            }}
          >
            Analytics
          </h6>

          <p style={{ color: "#CBD5E1" }}>
            Loading analytics...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: PAGE_BG,
      }}
    >
      {/* SIDEBAR */}
      <aside className="sidebar">
        <Sidebar />
      </aside>

      {/* MAIN ANALYTICS AREA */}
      <main
        style={{
          flex: 1,
          padding: "30px",
          background: PAGE_BG,
          minHeight: "100vh",
          color: "#FFFFFF",
        }}
      >
        {/* PAGE TITLE */}
        <h2
          style={{
            fontWeight: 700,
            color: "#FFFFFF",
            marginBottom: "25px",
          }}
        >
          Analytics
        </h2>

        {/* ================================================= */}
        {/* RESEARCHER */}
        {/* ================================================= */}
        {data?.viewType === "RESEARCHER" && (
          <>
            {/* STAT CARDS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginBottom: "25px",
              }}
            >
              {/* TOTAL BOOKINGS */}
              <div style={statBox("#2563EB")}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "32px",
                    color: "#FFFFFF",
                  }}
                >
                  {data.myTotalBookings}
                </h1>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#FFFFFF",
                    fontWeight: 500,
                  }}
                >
                  Total bookings
                </p>
              </div>

              {/* HOURS USED */}
              <div style={statBox("#0F766E")}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "32px",
                    color: "#FFFFFF",
                  }}
                >
                  {data.myTotalUsageHours}
                </h1>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#FFFFFF",
                    fontWeight: 500,
                  }}
                >
                  Hours used
                </p>
              </div>
            </div>

            {/* WHITE TABLE/CARD */}
            <div style={cardStyle}>
              <h5
                style={{
                  color: DARK_TEXT,
                  marginBottom: "15px",
                  fontWeight: 600,
                }}
              >
                Your most-booked equipment
              </h5>

              {data.myFavoriteEquipment?.length === 0 && (
                <p
                  style={{
                    color: SECONDARY_TEXT,
                    margin: 0,
                  }}
                >
                  No bookings yet.
                </p>
              )}

              {data.myFavoriteEquipment?.map((e, i) => (
                <div key={i} style={itemStyle}>
                  <span
                    style={{
                      color: DARK_TEXT,
                      fontWeight: 500,
                    }}
                  >
                    {e.equipmentName}
                  </span>

                  <strong
                    style={{
                      color: DARK_TEXT,
                    }}
                  >
                    {e.bookingCount} bookings
                  </strong>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ================================================= */}
        {/* LAB MANAGER / ADMIN */}
        {/* ================================================= */}
        {data?.viewType === "ADMIN" && (
          <>
            {/* STAT CARDS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginBottom: "25px",
              }}
            >
              {/* EQUIPMENT */}
              <div style={statBox("#2563EB")}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "32px",
                    color: "#FFFFFF",
                  }}
                >
                  {data.institutionTotalEquipment}
                </h1>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#FFFFFF",
                    fontWeight: 500,
                  }}
                >
                  Equipment
                </p>
              </div>

              {/* TOTAL BOOKINGS */}
              <div style={statBox("#0F766E")}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "32px",
                    color: "#FFFFFF",
                  }}
                >
                  {data.institutionTotalBookings}
                </h1>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#FFFFFF",
                    fontWeight: 500,
                  }}
                >
                  Total bookings
                </p>
              </div>

              {/* UTILIZATION */}
              <div style={statBox("#7C3AED")}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "32px",
                    color: "#FFFFFF",
                  }}
                >
                  {data.institutionAvgUtilization}%
                </h1>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#FFFFFF",
                    fontWeight: 500,
                  }}
                >
                  Avg utilization
                </p>
              </div>

              {/* WORK ORDERS */}
              <div style={statBox("#DC2626")}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "32px",
                    color: "#FFFFFF",
                  }}
                >
                  {data.institutionOpenWorkOrders}
                </h1>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#FFFFFF",
                    fontWeight: 500,
                  }}
                >
                  Open work orders
                </p>
              </div>
            </div>

            {/* =============================== */}
            {/* WHITE TABLE/CARD */}
            {/* =============================== */}
            <div style={cardStyle}>
              <h5
                style={{
                  color: DARK_TEXT,
                  marginBottom: "15px",
                  fontWeight: 600,
                }}
              >
                Top equipment by bookings
              </h5>

              {data.institutionTopEquipment?.length === 0 && (
                <p
                  style={{
                    color: SECONDARY_TEXT,
                    margin: 0,
                  }}
                >
                  No bookings yet.
                </p>
              )}

              {data.institutionTopEquipment?.map((e, i) => (
                <div key={i} style={itemStyle}>
                  <span
                    style={{
                      color: DARK_TEXT,
                      fontWeight: 500,
                    }}
                  >
                    {e.equipmentName}
                  </span>

                  <strong
                    style={{
                      color: DARK_TEXT,
                    }}
                  >
                    {e.bookingCount} bookings
                  </strong>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ================================================= */}
        {/* SYSTEM ADMIN */}
        {/* ================================================= */}
        {data?.viewType === "SYSTEM" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >
            {/* INSTITUTIONS */}
            <div style={statBox("#2563EB")}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "32px",
                  color: "#FFFFFF",
                }}
              >
                {data.systemTotalInstitutions}
              </h1>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#FFFFFF",
                  fontWeight: 500,
                }}
              >
                Institutions
              </p>
            </div>

            {/* EQUIPMENT */}
            <div style={statBox("#0F766E")}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "32px",
                  color: "#FFFFFF",
                }}
              >
                {data.systemTotalEquipment}
              </h1>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#FFFFFF",
                  fontWeight: 500,
                }}
              >
                Total equipment
              </p>
            </div>

            {/* BOOKINGS */}
            <div style={statBox("#7C3AED")}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "32px",
                  color: "#FFFFFF",
                }}
              >
                {data.systemTotalBookings}
              </h1>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#FFFFFF",
                  fontWeight: 500,
                }}
              >
                Total bookings
              </p>
            </div>

            {/* CROSS-INSTITUTION */}
            <div style={statBox("#DC2626")}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "32px",
                  color: "#FFFFFF",
                }}
              >
                {data.systemCrossInstitutionBookings}
              </h1>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#FFFFFF",
                  fontWeight: 500,
                }}
              >
                Cross-institution bookings
              </p>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* NO DATA */}
        {/* ================================================= */}
        {!data?.viewType && (
          <div style={cardStyle}>
            <p
              style={{
                color: SECONDARY_TEXT,
                margin: 0,
              }}
            >
              No analytics data is available for this account.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}