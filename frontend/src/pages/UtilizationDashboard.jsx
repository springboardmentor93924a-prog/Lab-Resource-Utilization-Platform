import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getEquipmentUtilization } from "../services/equipmentService";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


// =========================================================
// STATUS COLORS
// =========================================================

function getStatusColor(status) {
  switch (status) {
    case "AVAILABLE":
      return "#22c55e";

    case "IN_USE":
      return "#f59e0b";

    case "MAINTENANCE":
      return "#ef4444";

    default:
      return "#94a3b8";
  }
}


// =========================================================
// COMMON CARD STYLE
// =========================================================

const cardStyle = {
  borderRadius: "12px",
  padding: "20px",
  color: "#ffffff",
  boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
};


// =========================================================
// COMPONENT
// =========================================================

export default function UtilizationDashboard() {
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(true);


  // =======================================================
  // LOAD DATA EVERY 5 SECONDS
  // DO NOT REMOVE THIS
  // =======================================================

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 5000);

    return () => clearInterval(interval);
  }, []);


  async function loadData() {
    try {
      const data = await getEquipmentUtilization();

      setEquipment(data);

      // REAL CURRENT TIME
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }


  // =======================================================
  // CALCULATIONS
  // =======================================================

  const total = equipment.length;

  const available = equipment.filter(
    (e) => e.status === "AVAILABLE"
  ).length;

  const inUse = equipment.filter(
    (e) => e.status === "IN_USE"
  ).length;

  const maintenance = equipment.filter(
    (e) => e.status === "MAINTENANCE"
  ).length;


  const avgUtilization =
    total === 0
      ? 0
      : (
          equipment.reduce(
            (sum, e) => sum + (e.utilizationRate || 0),
            0
          ) / total
        ).toFixed(1);


  // =======================================================
  // CHART DATA
  // =======================================================

  const chartData = {
    labels: equipment.map((e) => e.equipmentName),

    datasets: [
      {
        label: "Usage Hours",

        data: equipment.map((e) => e.usageHours),

        backgroundColor: "#2DD4BF",

        borderRadius: 3,
      },
    ],
  };


  // =======================================================
  // CHART OPTIONS
  // =======================================================

  const chartOptions = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        labels: {
          color: "#0f1b2d",
          font: {
            size: 13,
          },
        },
      },

      title: {
        display: false,
      },

      tooltip: {
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        backgroundColor: "#0f1b2d",
      },
    },

    scales: {
      x: {
        ticks: {
          color: "#334155",
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11,
          },
        },

        grid: {
          color: "rgba(15, 23, 42, 0.10)",
        },
      },

      y: {
        ticks: {
          color: "#334155",
        },

        grid: {
          color: "rgba(15, 23, 42, 0.10)",
        },

        beginAtZero: true,
      },
    },
  };


  // =======================================================
  // RETURN
  // =======================================================

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#020b1c",
      }}
    >

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">
        <Sidebar />
      </aside>


      {/* =================================================
          MAIN
      ================================================= */}

      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: "30px",
          background: "#020b1c",
          color: "#ffffff",
        }}
      >

        {/* =================================================
            PAGE TITLE
        ================================================= */}

        <h2
          style={{
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: "4px",
            fontSize: "22px",
          }}
        >
          Utilization Dashboard
        </h2>


        {/* =================================================
            LAST UPDATED
            THIS REMAINS REAL-TIME
        ================================================= */}

        <p
          style={{
            color: "#a9c3df",
            marginBottom: "25px",
            fontSize: "14px",
          }}
        >
          Last updated:{" "}
          <strong
            style={{
              color: "#ffffff",
            }}
          >
            {lastUpdated}
          </strong>
        </p>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <p
            style={{
              color: "#ffffff",
              fontSize: "15px",
            }}
          >
            Loading utilization data...
          </p>
        )}


        {!loading && (
          <>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginBottom: "25px",
              }}
            >

              {/* TOTAL EQUIPMENT */}

              <div
                onClick={() => navigate("/equipment")}
                style={{
                  ...cardStyle,
                  background: "#2563eb",
                  cursor: "pointer",
                }}
              >
                <h1
                  style={{
                    margin: 0,
                    fontSize: "36px",
                    color: "#ffffff",
                  }}
                >
                  {total}
                </h1>

                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "16px",
                    color: "#ffffff",
                    fontWeight: 600,
                  }}
                >
                  Total Equipment
                </p>
              </div>


              {/* AVAILABLE */}

              <div
                onClick={() =>
                  navigate("/equipment?status=AVAILABLE")
                }
                style={{
                  ...cardStyle,
                  background: "#22c55e",
                  cursor: "pointer",
                }}
              >
                <h1
                  style={{
                    margin: 0,
                    fontSize: "36px",
                    color: "#ffffff",
                  }}
                >
                  {available}
                </h1>

                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "16px",
                    color: "#ffffff",
                    fontWeight: 600,
                  }}
                >
                  Available
                </p>
              </div>


              {/* IN USE */}

              <div
                onClick={() =>
                  navigate("/equipment?status=IN_USE")
                }
                style={{
                  ...cardStyle,
                  background: "#f59e0b",
                  cursor: "pointer",
                }}
              >
                <h1
                  style={{
                    margin: 0,
                    fontSize: "36px",
                    color: "#ffffff",
                  }}
                >
                  {inUse}
                </h1>

                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "16px",
                    color: "#ffffff",
                    fontWeight: 600,
                  }}
                >
                  In use
                </p>
              </div>


              {/* MAINTENANCE */}

              <div
                onClick={() => navigate("/maintenance")}
                style={{
                  ...cardStyle,
                  background: "#ef4444",
                  cursor: "pointer",
                }}
              >
                <h1
                  style={{
                    margin: 0,
                    fontSize: "36px",
                    color: "#ffffff",
                  }}
                >
                  {maintenance}
                </h1>

                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "16px",
                    color: "#ffffff",
                    fontWeight: 600,
                  }}
                >
                  Maintenance
                </p>
              </div>

            </div>


            {/* =================================================
                AVERAGE UTILIZATION
            ================================================= */}

            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "25px",
                boxShadow:
                  "0 6px 18px rgba(0,0,0,0.20)",
                maxWidth: "320px",
              }}
            >

              <h5
                style={{
                  color: "#0f1b2d",
                  marginBottom: "8px",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                Average Utilization
              </h5>

              <h1
                style={{
                  margin: 0,
                  color: "#0f1b2d",
                  fontSize: "30px",
                }}
              >
                {avgUtilization}%
              </h1>

            </div>


            {/* =================================================
                HIGH DEMAND EQUIPMENT
            ================================================= */}

            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "25px",
                boxShadow:
                  "0 6px 18px rgba(0,0,0,0.20)",
              }}
            >

              <h5
                style={{
                  color: "#0f1b2d",
                  marginBottom: "15px",
                  fontSize: "17px",
                  fontWeight: 700,
                }}
              >
                High demand equipment
              </h5>


              {equipment.filter((e) => e.highDemand).length ===
                0 && (
                <p
                  style={{
                    color: "#475569",
                  }}
                >
                  No equipment currently flagged as high demand.
                </p>
              )}


              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >

                {equipment
                  .filter((e) => e.highDemand)
                  .map((e) => (
                    <span
                      key={e.id}
                      style={{
                        background: "#fb923c",
                        color: "#ffffff",
                        padding: "6px 14px",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      {e.equipmentName} ({e.totalBookings} bookings)
                    </span>
                  ))}

              </div>

            </div>


            {/* =================================================
                IDLE EQUIPMENT
            ================================================= */}

            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "25px",
                boxShadow:
                  "0 6px 18px rgba(0,0,0,0.20)",
              }}
            >

              <h5
                style={{
                  color: "#0f1b2d",
                  marginBottom: "15px",
                  fontSize: "17px",
                  fontWeight: 700,
                }}
              >
                Idle equipment
              </h5>


              {equipment.filter((e) => e.isIdle).length ===
                0 && (
                <p
                  style={{
                    color: "#475569",
                  }}
                >
                  No equipment currently flagged as idle.
                </p>
              )}


              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >

                {equipment
                  .filter((e) => e.isIdle)
                  .map((e) => (
                    <span
                      key={e.id}
                      style={{
                        background: "#94a3b8",
                        color: "#ffffff",
                        padding: "6px 14px",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      {e.equipmentName} (
                      {e.daysIdle != null
                        ? `${e.daysIdle} days idle`
                        : "never booked"}
                      )
                    </span>
                  ))}

              </div>

            </div>


            {/* =================================================
                EQUIPMENT USAGE HOURS CHART
            ================================================= */}

            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "25px",
                boxShadow:
                  "0 6px 18px rgba(0,0,0,0.20)",
                height: "520px",
              }}
            >

              <h4
                style={{
                  color: "#0f1b2d",
                  marginBottom: "20px",
                  fontSize: "18px",
                  fontWeight: 700,
                }}
              >
                Equipment Usage Hours
              </h4>


              <div
                style={{
                  height: "430px",
                }}
              >
                <Bar
                  data={chartData}
                  options={chartOptions}
                />
              </div>

            </div>

          </>
        )}

      </main>
    </div>
  );
}