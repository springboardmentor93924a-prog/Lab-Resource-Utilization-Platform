import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getEquipmentUtilization } from "../services/equipmentService";

function getColor(rate) {
  if (rate <= 40) return "#22c55e";
  if (rate <= 70) return "#f59e0b";
  return "#ef4444";
}

export default function UtilizationHeatmap() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEquipment();

    const interval = setInterval(loadEquipment, 5000);

    return () => clearInterval(interval);
  }, []);

  async function loadEquipment() {
    try {
      const data = await getEquipmentUtilization();
      setEquipment(data);
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
      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        <Sidebar />
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main
        style={{
          flex: 1,
          padding: "30px",
          background: "#020b1c",
          color: "#ffffff",
          minWidth: 0,
        }}
      >
        {/* ================= PAGE TITLE ================= */}
        <h2
          style={{
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: "25px",
            fontSize: "22px",
          }}
        >
          Equipment Utilization Heatmap
        </h2>

        {/* ================= LOADING ================= */}
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

        {/* ================= EQUIPMENT GRID ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {equipment.map((item) => {
            const color = getColor(item.utilizationRate);

            return (
              <div
                key={item.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "18px",
                  borderTop: `5px solid ${color}`,
                  boxShadow:
                    "0 6px 18px rgba(0,0,0,0.25)",
                  color: "#0f1b2d",
                  overflow: "hidden",
                }}
              >
                {/* ================= EQUIPMENT IMAGE ================= */}
                <div
                  style={{
                    width: "100%",
                    height: "160px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    background: "#e2e8f0",
                    marginBottom: "15px",
                  }}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.equipmentName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#64748b",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      No image available
                    </div>
                  )}
                </div>

                {/* ================= NAME + BADGES ================= */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  {/* EQUIPMENT NAME */}
                  <h4
                    style={{
                      color: "#0f1b2d",
                      margin: 0,
                      fontSize: "17px",
                      fontWeight: 700,
                      lineHeight: "1.3",
                      flex: 1,
                    }}
                  >
                    {item.equipmentName}
                  </h4>

                  {/* BADGES */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                      alignItems: "flex-end",
                    }}
                  >
                    {/* HIGH DEMAND */}
                    {item.highDemand && (
                      <span
                        style={{
                          background: "#fb923c",
                          color: "#ffffff",
                          padding: "5px 10px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        High demand
                      </span>
                    )}

                    {/* IDLE */}
                    {item.isIdle && (
                      <span
                        style={{
                          background: "#64748b",
                          color: "#ffffff",
                          padding: "5px 10px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Idle
                      </span>
                    )}
                  </div>
                </div>

                {/* ================= DIVIDER ================= */}
                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid #dbe3ec",
                    margin: "15px 0",
                  }}
                />

                {/* ================= DETAILS ================= */}
                <div
                  style={{
                    color: "#1e293b",
                    fontSize: "14px",
                    lineHeight: "1.8",
                  }}
                >
                  <p style={{ margin: "4px 0" }}>
                    <strong style={{ color: "#0f1b2d" }}>
                      Category:
                    </strong>{" "}
                    {item.category}
                  </p>

                  <p style={{ margin: "4px 0" }}>
                    <strong style={{ color: "#0f1b2d" }}>
                      Status:
                    </strong>{" "}
                    {item.status}
                  </p>

                  <p style={{ margin: "4px 0" }}>
                    <strong style={{ color: "#0f1b2d" }}>
                      Usage hours:
                    </strong>{" "}
                    {item.usageHours}
                  </p>

                  <p style={{ margin: "4px 0" }}>
                    <strong style={{ color: "#0f1b2d" }}>
                      Total bookings:
                    </strong>{" "}
                    {item.totalBookings}
                  </p>
                </div>

                {/* ================= UTILIZATION BAR ================= */}
                <div
                  style={{
                    position: "relative",
                    background: "#e2e8f0",
                    borderRadius: "6px",
                    height: "24px",
                    overflow: "hidden",
                    marginTop: "15px",
                  }}
                >
                  {/* FILLED PORTION */}
                  <div
                    style={{
                      width: `${item.utilizationRate}%`,
                      background: color,
                      height: "100%",
                      transition: "width 0.4s ease",
                    }}
                  />

                  {/* PERCENTAGE TEXT */}
                  <span
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#0f1b2d",
                    }}
                  >
                    {item.utilizationRate}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}