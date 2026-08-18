import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  getEquipmentUtilization,
  getCalibrationAlerts,
} from "../services/equipmentService";

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
// COMPONENT
// =========================================================

export default function UtilizationDashboard() {
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(true);
  const [calibrationAlerts, setCalibrationAlerts] = useState([]);


  // =======================================================
  // LOAD DATA EVERY 5 SECONDS
  // DO NOT REMOVE THIS
  // =======================================================

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getEquipmentUtilization();

        setEquipment(data);

        setLastUpdated(new Date().toLocaleTimeString());

        const alerts = await getCalibrationAlerts();

        setCalibrationAlerts(alerts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    // Load immediately when the page opens
    loadData();

    // Refresh every 5 seconds
    const interval = setInterval(loadData, 5000);

    return () => clearInterval(interval);
  }, []);


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
  // TOTAL USAGE HOURS
  // =======================================================

  const totalUsageHours = equipment
    .reduce(
      (sum, e) => sum + (e.usageHours || 0),
      0
    )
    .toFixed(1);


  // =======================================================
  // HIGH DEMAND COUNT
  // =======================================================

  const highDemandEquipment = equipment.filter(
    (e) => e.highDemand
  );

  const idleEquipment = equipment.filter(
    (e) => e.isIdle
  );


  // =======================================================
  // CHART DATA
  // =======================================================

  const chartData = {
    labels: equipment.map(
      (e) => e.equipmentName
    ),

    datasets: [
      {
        label: "Usage Hours",

        data: equipment.map(
          (e) => e.usageHours || 0
        ),

        backgroundColor:
          "rgba(45, 212, 191, 0.85)",

        borderColor: "#14b8a6",

        borderWidth: 1,

        borderRadius: 8,

        borderSkipped: false,

        barThickness: 18,

        maxBarThickness: 22,
      },
    ],
  };


  // =======================================================
  // CHART OPTIONS
  // =======================================================

  const chartOptions = {
    responsive: true,

    maintainAspectRatio: false,

    /*
     * Horizontal bars make long equipment names
     * much easier to read.
     */
    indexAxis: "y",

    interaction: {
      mode: "index",
      intersect: false,
    },

    plugins: {
      legend: {
        display: false,
      },

      title: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#0f172a",

        titleColor: "#ffffff",

        bodyColor: "#cbd5e1",

        borderColor: "#334155",

        borderWidth: 1,

        padding: 12,

        displayColors: false,

        callbacks: {
          label: function (context) {
            return ` Usage: ${context.raw || 0} hours`;
          },
        },
      },
    },

    scales: {
      x: {
        beginAtZero: true,

        ticks: {
          color: "#64748b",

          font: {
            size: 11,
            weight: "600",
          },

          callback: function (value) {
            return `${value}h`;
          },
        },

        grid: {
          color:
            "rgba(15, 23, 42, 0.08)",

          drawBorder: false,
        },
      },

      y: {
        ticks: {
          color: "#334155",

          font: {
            size: 11,
            weight: "600",
          },

          padding: 8,
        },

        grid: {
          display: false,
        },
      },
    },

    animation: {
      duration: 700,

      easing: "easeOutQuart",
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
                PREMIUM SUMMARY CARDS
            ================================================= */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(4, minmax(200px, 1fr))",
                gap: "20px",
                marginBottom: "25px",
              }}
            >

              {/* =================================================
                  TOTAL EQUIPMENT
              ================================================= */}

              <div
                className="util-kpi-card"
                onClick={() =>
                  navigate("/equipment")
                }
                style={{
                  position: "relative",
                  overflow: "hidden",
                  minHeight: "145px",
                  padding: "24px",
                  borderRadius: "18px",
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #1d4ed8 55%, #1e40af 100%)",
                  color: "#ffffff",
                  boxShadow:
                    "0 10px 25px rgba(37, 99, 235, 0.25)",
                  cursor: "pointer",
                }}
              >

                {/* Decorative circle */}

                <div
                  style={{
                    position: "absolute",
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    background:
                      "rgba(255,255,255,0.10)",
                    right: "-35px",
                    top: "-35px",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background:
                      "rgba(255,255,255,0.06)",
                    right: "45px",
                    bottom: "-25px",
                  }}
                />

                <div
                  style={{
                    position: "relative",
                    zIndex: 2,
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "flex-start",
                  }}
                >

                  <div>

                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "1px",
                        opacity: 0.85,
                        marginBottom: "10px",
                      }}
                    >
                      TOTAL EQUIPMENT
                    </div>

                    <div
                      style={{
                        fontSize: "42px",
                        lineHeight: 1,
                        fontWeight: 800,
                        letterSpacing: "-1px",
                      }}
                    >
                      {total}
                    </div>

                    <div
                      style={{
                        marginTop: "12px",
                        fontSize: "12px",
                        opacity: 0.85,
                      }}
                    >
                      Registered in platform
                    </div>

                  </div>

                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background:
                        "rgba(255,255,255,0.16)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      boxShadow:
                        "0 4px 12px rgba(0,0,0,0.12)",
                    }}
                  >
                    <i className="bi bi-box-seam-fill"></i>
                  </div>

                </div>

                <div
                  style={{
                    position: "absolute",
                    bottom: "14px",
                    left: "24px",
                    fontSize: "10px",
                    opacity: 0.65,
                    letterSpacing: "0.5px",
                  }}
                >
                  CLICK TO VIEW EQUIPMENT
                </div>

              </div>


              {/* =================================================
                  AVAILABLE
              ================================================= */}

              <div
                className="util-kpi-card"
                onClick={() =>
                  navigate(
                    "/equipment?status=AVAILABLE"
                  )
                }
                style={{
                  position: "relative",
                  overflow: "hidden",
                  minHeight: "145px",
                  padding: "24px",
                  borderRadius: "18px",
                  background:
                    "linear-gradient(135deg, #16a34a 0%, #15803d 55%, #166534 100%)",
                  color: "#ffffff",
                  boxShadow:
                    "0 10px 25px rgba(22, 163, 74, 0.23)",
                  cursor: "pointer",
                }}
              >

                <div
                  style={{
                    position: "absolute",
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    background:
                      "rgba(255,255,255,0.10)",
                    right: "-35px",
                    top: "-35px",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background:
                      "rgba(255,255,255,0.06)",
                    right: "45px",
                    bottom: "-25px",
                  }}
                />

                <div
                  style={{
                    position: "relative",
                    zIndex: 2,
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "flex-start",
                  }}
                >

                  <div>

                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "1px",
                        opacity: 0.85,
                        marginBottom: "10px",
                      }}
                    >
                      AVAILABLE
                    </div>

                    <div
                      style={{
                        fontSize: "42px",
                        lineHeight: 1,
                        fontWeight: 800,
                        letterSpacing: "-1px",
                      }}
                    >
                      {available}
                    </div>

                    <div
                      style={{
                        marginTop: "12px",
                        fontSize: "12px",
                        opacity: 0.85,
                      }}
                    >
                      Ready for booking
                    </div>

                  </div>

                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background:
                        "rgba(255,255,255,0.16)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      boxShadow:
                        "0 4px 12px rgba(0,0,0,0.12)",
                    }}
                  >
                    <i className="bi bi-check-circle-fill"></i>
                  </div>

                </div>

                <div
                  style={{
                    position: "absolute",
                    bottom: "14px",
                    left: "24px",
                    fontSize: "10px",
                    opacity: 0.65,
                    letterSpacing: "0.5px",
                  }}
                >
                  READY FOR USE
                </div>

              </div>


              {/* =================================================
                  IN USE
              ================================================= */}

              <div
                className="util-kpi-card"
                onClick={() =>
                  navigate(
                    "/equipment?status=IN_USE"
                  )
                }
                style={{
                  position: "relative",
                  overflow: "hidden",
                  minHeight: "145px",
                  padding: "24px",
                  borderRadius: "18px",
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 55%, #b45309 100%)",
                  color: "#ffffff",
                  boxShadow:
                    "0 10px 25px rgba(245, 158, 11, 0.23)",
                  cursor: "pointer",
                }}
              >

                <div
                  style={{
                    position: "absolute",
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    background:
                      "rgba(255,255,255,0.10)",
                    right: "-35px",
                    top: "-35px",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background:
                      "rgba(255,255,255,0.06)",
                    right: "45px",
                    bottom: "-25px",
                  }}
                />

                <div
                  style={{
                    position: "relative",
                    zIndex: 2,
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "flex-start",
                  }}
                >

                  <div>

                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "1px",
                        opacity: 0.85,
                        marginBottom: "10px",
                      }}
                    >
                      IN USE
                    </div>

                    <div
                      style={{
                        fontSize: "42px",
                        lineHeight: 1,
                        fontWeight: 800,
                        letterSpacing: "-1px",
                      }}
                    >
                      {inUse}
                    </div>

                    <div
                      style={{
                        marginTop: "12px",
                        fontSize: "12px",
                        opacity: 0.85,
                      }}
                    >
                      Currently being used
                    </div>

                  </div>

                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background:
                        "rgba(255,255,255,0.16)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      boxShadow:
                        "0 4px 12px rgba(0,0,0,0.12)",
                    }}
                  >
                    <i className="bi bi-activity"></i>
                  </div>

                </div>

                <div
                  style={{
                    position: "absolute",
                    bottom: "14px",
                    left: "24px",
                    fontSize: "10px",
                    opacity: 0.65,
                    letterSpacing: "0.5px",
                  }}
                >
                  CURRENTLY ACTIVE
                </div>

              </div>


              {/* =================================================
                  MAINTENANCE
              ================================================= */}

              <div
                className="util-kpi-card"
                onClick={() =>
                  navigate("/maintenance")
                }
                style={{
                  position: "relative",
                  overflow: "hidden",
                  minHeight: "145px",
                  padding: "24px",
                  borderRadius: "18px",
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #dc2626 55%, #b91c1c 100%)",
                  color: "#ffffff",
                  boxShadow:
                    "0 10px 25px rgba(239, 68, 68, 0.23)",
                  cursor: "pointer",
                }}
              >

                <div
                  style={{
                    position: "absolute",
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    background:
                      "rgba(255,255,255,0.10)",
                    right: "-35px",
                    top: "-35px",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background:
                      "rgba(255,255,255,0.06)",
                    right: "45px",
                    bottom: "-25px",
                  }}
                />

                <div
                  style={{
                    position: "relative",
                    zIndex: 2,
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "flex-start",
                  }}
                >

                  <div>

                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "1px",
                        opacity: 0.85,
                        marginBottom: "10px",
                      }}
                    >
                      MAINTENANCE
                    </div>

                    <div
                      style={{
                        fontSize: "42px",
                        lineHeight: 1,
                        fontWeight: 800,
                        letterSpacing: "-1px",
                      }}
                    >
                      {maintenance}
                    </div>

                    <div
                      style={{
                        marginTop: "12px",
                        fontSize: "12px",
                        opacity: 0.85,
                      }}
                    >
                      Requires attention
                    </div>

                  </div>

                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background:
                        "rgba(255,255,255,0.16)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      boxShadow:
                        "0 4px 12px rgba(0,0,0,0.12)",
                    }}
                  >
                    <i className="bi bi-tools"></i>
                  </div>

                </div>

                <div
                  style={{
                    position: "absolute",
                    bottom: "14px",
                    left: "24px",
                    fontSize: "10px",
                    opacity: 0.65,
                    letterSpacing: "0.5px",
                  }}
                >
                  NEEDS ATTENTION
                </div>

              </div>

            </div>


            {/* =================================================
                AVERAGE UTILIZATION - PREMIUM CARD
            ================================================= */}

            <div
              style={{
                position: "relative",
                overflow: "hidden",
                width: "100%",
                maxWidth: "520px",
                minHeight: "145px",
                padding: "24px",
                marginBottom: "25px",
                borderRadius: "18px",
                background:
                  "linear-gradient(135deg, #0f766e 0%, #0d9488 55%, #14b8a6 100%)",
                color: "#ffffff",
                boxShadow:
                  "0 10px 25px rgba(20, 184, 166, 0.20)",
              }}
            >

              {/* Decorative circles */}

              <div
                style={{
                  position: "absolute",
                  width: "140px",
                  height: "140px",
                  borderRadius: "50%",
                  background:
                    "rgba(255,255,255,0.08)",
                  right: "-40px",
                  top: "-55px",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  background:
                    "rgba(255,255,255,0.06)",
                  right: "100px",
                  bottom: "-35px",
                }}
              />

              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                }}
              >

                <div>

                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "1px",
                      opacity: 0.85,
                      marginBottom: "10px",
                    }}
                  >
                    AVERAGE UTILIZATION
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "4px",
                    }}
                  >

                    <span
                      style={{
                        fontSize: "42px",
                        lineHeight: 1,
                        fontWeight: 800,
                        letterSpacing: "-1px",
                      }}
                    >
                      {avgUtilization}
                    </span>

                    <span
                      style={{
                        fontSize: "24px",
                        fontWeight: 700,
                        opacity: 0.9,
                      }}
                    >
                      %
                    </span>

                  </div>

                  <div
                    style={{
                      marginTop: "12px",
                      fontSize: "12px",
                      opacity: 0.85,
                    }}
                  >
                    Overall equipment usage
                  </div>

                </div>


                {/* ICON */}

                <div
                  style={{
                    width: "58px",
                    height: "58px",
                    borderRadius: "16px",
                    background:
                      "rgba(255,255,255,0.16)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "25px",
                    boxShadow:
                      "0 4px 12px rgba(0,0,0,0.12)",
                  }}
                >
                  <i className="bi bi-speedometer2"></i>
                </div>

              </div>


              {/* Bottom label */}

              <div
                style={{
                  position: "absolute",
                  bottom: "14px",
                  left: "24px",
                  fontSize: "10px",
                  opacity: 0.65,
                  letterSpacing: "0.5px",
                }}
              >
                PLATFORM PERFORMANCE
              </div>

            </div>


            {/* =================================================
                HIGH DEMAND EQUIPMENT
            ================================================= */}

            <div
              style={{
                background: "#ffffff",
                borderRadius: "18px",
                padding: "25px",
                marginBottom: "25px",
                boxShadow:
                  "0 8px 24px rgba(15, 23, 42, 0.12)",
                border: "1px solid #e2e8f0",
              }}
            >

              {/* HEADER */}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >

                <div>

                  <h5
                    style={{
                      color: "#0f1b2d",
                      margin: 0,
                      fontSize: "18px",
                      fontWeight: 800,
                    }}
                  >
                    High Demand Equipment
                  </h5>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    Equipment receiving the highest
                    booking activity
                  </p>

                </div>


                {/* COUNT */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    background: "#fff7ed",
                    color: "#ea580c",
                    border:
                      "1px solid #fed7aa",
                    padding: "8px 13px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >

                  <i className="bi bi-fire"></i>

                  {highDemandEquipment.length}{" "}
                  High Demand

                </div>

              </div>


              {/* EMPTY STATE */}

              {highDemandEquipment.length === 0 ? (

                <div
                  style={{
                    padding: "30px",
                    textAlign: "center",
                    background: "#f8fafc",
                    borderRadius: "14px",
                    color: "#64748b",
                  }}
                >

                  <i
                    className="bi bi-graph-down"
                    style={{
                      fontSize: "28px",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  ></i>

                  No equipment currently flagged
                  as high demand.

                </div>

              ) : (

                /* EQUIPMENT GRID */

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "14px",
                  }}
                >

                  {highDemandEquipment.map(
                    (e) => (

                      <div
                        key={e.id}
                        style={{
                          position: "relative",
                          padding: "16px",
                          borderRadius: "14px",
                          background:
                            "linear-gradient(135deg, #fff7ed, #ffffff)",
                          border:
                            "1px solid #fed7aa",
                          boxShadow:
                            "0 3px 10px rgba(15,23,42,0.05)",
                          transition:
                            "transform 0.2s ease, box-shadow 0.2s ease",
                        }}
                      >

                        {/* TOP ROW */}

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                              "space-between",
                            gap: "10px",
                          }}
                        >

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "11px",
                              minWidth: 0,
                            }}
                          >

                            {/* ICON */}

                            <div
                              style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "12px",
                                background:
                                  "#ffedd5",
                                color: "#ea580c",
                                display: "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                flexShrink: 0,
                              }}
                            >
                              <i className="bi bi-fire"></i>
                            </div>


                            <div
                              style={{
                                minWidth: 0,
                              }}
                            >

                              <div
                                style={{
                                  color: "#0f172a",
                                  fontSize: "14px",
                                  fontWeight: 800,
                                  whiteSpace:
                                    "nowrap",
                                  overflow:
                                    "hidden",
                                  textOverflow:
                                    "ellipsis",
                                }}
                              >
                                {e.equipmentName}
                              </div>

                              <div
                                style={{
                                  color: "#64748b",
                                  fontSize: "11px",
                                  marginTop: "3px",
                                }}
                              >
                                {e.category ||
                                  "Equipment"}
                              </div>

                            </div>

                          </div>


                          {/* BOOKING COUNT */}

                          <div
                            style={{
                              textAlign: "right",
                              flexShrink: 0,
                            }}
                          >

                            <div
                              style={{
                                color: "#ea580c",
                                fontSize: "20px",
                                fontWeight: 800,
                                lineHeight: 1,
                              }}
                            >
                              {e.totalBookings}
                            </div>

                            <div
                              style={{
                                color: "#94a3b8",
                                fontSize: "10px",
                                marginTop: "4px",
                              }}
                            >
                              BOOKINGS
                            </div>

                          </div>

                        </div>


                        {/* ACTIVITY BAR */}

                        <div
                          style={{
                            marginTop: "14px",
                            height: "5px",
                            background: "#fed7aa",
                            borderRadius: "999px",
                            overflow: "hidden",
                          }}
                        >

                          <div
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  12,
                                  (e.totalBookings /
                                    5) *
                                    100
                                )
                              )}%`,
                              height: "100%",
                              background:
                                "linear-gradient(90deg, #fb923c, #ea580c)",
                              borderRadius:
                                "999px",
                            }}
                          />

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>


            {/* =================================================
                IDLE EQUIPMENT
            ================================================= */}

            <div
              style={{
                background: "#ffffff",
                borderRadius: "18px",
                padding: "25px",
                marginBottom: "25px",
                boxShadow:
                  "0 8px 24px rgba(15, 23, 42, 0.12)",
                border: "1px solid #e2e8f0",
              }}
            >

              {/* HEADER */}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >

                <div>

                  <h5
                    style={{
                      color: "#0f1b2d",
                      margin: 0,
                      fontSize: "18px",
                      fontWeight: 800,
                    }}
                  >
                    Idle Equipment
                  </h5>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    Equipment with little or no recent
                    booking activity
                  </p>

                </div>


                {/* COUNT */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    background: "#f1f5f9",
                    color: "#64748b",
                    border:
                      "1px solid #cbd5e1",
                    padding: "8px 13px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >

                  <i className="bi bi-hourglass-split"></i>

                  {idleEquipment.length} Idle

                </div>

              </div>


              {/* EMPTY STATE */}

              {idleEquipment.length === 0 ? (

                <div
                  style={{
                    padding: "30px",
                    textAlign: "center",
                    background: "#f0fdf4",
                    border:
                      "1px solid #bbf7d0",
                    borderRadius: "14px",
                  }}
                >

                  <i
                    className="bi bi-check-circle"
                    style={{
                      fontSize: "28px",
                      color: "#16a34a",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  ></i>

                  <span
                    style={{
                      color: "#166534",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    No idle equipment
                  </span>

                </div>

              ) : (

                /* EQUIPMENT GRID */

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "14px",
                  }}
                >

                  {idleEquipment.map(
                    (e) => (

                      <div
                        key={e.id}
                        style={{
                          position: "relative",
                          padding: "16px",
                          borderRadius: "14px",
                          background:
                            "linear-gradient(135deg, #f8fafc, #ffffff)",
                          border:
                            "1px solid #cbd5e1",
                          boxShadow:
                            "0 3px 10px rgba(15,23,42,0.05)",
                        }}
                      >

                        {/* EQUIPMENT INFO */}

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "11px",
                          }}
                        >

                          {/* ICON */}

                          <div
                            style={{
                              width: "42px",
                              height: "42px",
                              borderRadius: "12px",
                              background:
                                "#e2e8f0",
                              color: "#64748b",
                              display: "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              flexShrink: 0,
                              fontSize: "18px",
                            }}
                          >
                            <i className="bi bi-pause-circle-fill"></i>
                          </div>


                          <div
                            style={{
                              minWidth: 0,
                              flex: 1,
                            }}
                          >

                            <div
                              style={{
                                color: "#0f172a",
                                fontSize: "14px",
                                fontWeight: 800,
                                whiteSpace:
                                  "nowrap",
                                overflow:
                                  "hidden",
                                textOverflow:
                                  "ellipsis",
                              }}
                            >
                              {e.equipmentName}
                            </div>

                            <div
                              style={{
                                color: "#64748b",
                                fontSize: "11px",
                                marginTop: "3px",
                              }}
                            >
                              {e.category ||
                                "Equipment"}
                            </div>

                          </div>

                        </div>


                        {/* STATUS */}

                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            alignItems: "center",
                            marginTop: "15px",
                            paddingTop: "12px",
                            borderTop:
                              "1px solid #e2e8f0",
                          }}
                        >

                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              color: "#94a3b8",
                              letterSpacing:
                                "0.5px",
                            }}
                          >
                            STATUS
                          </span>

                          <span
                            style={{
                              display: "flex",
                              alignItems:
                                "center",
                              gap: "5px",
                              color: "#64748b",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >

                            <span
                              style={{
                                width: "7px",
                                height: "7px",
                                borderRadius:
                                  "50%",
                                background:
                                  "#94a3b8",
                              }}
                            />

                            {e.daysIdle != null
                              ? `${e.daysIdle} days idle`
                              : "Never booked"}

                          </span>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>


            {/* =================================================
                CALIBRATION ALERTS
            ================================================= */}

            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "26px",
                marginTop: "26px",
                marginBottom: "26px",
                boxShadow:
                  "0 6px 20px rgba(15, 23, 42, 0.08)",
                border:
                  "1px solid #e2e8f0",
              }}
            >

              {/* HEADER */}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: "22px",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >

                <div>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: "21px",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    Calibration Alerts
                  </h2>

                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    Equipment requiring upcoming
                    calibration attention
                  </p>

                </div>


                {/* ALERT COUNT */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#fff7ed",
                    border:
                      "1px solid #fed7aa",
                    color: "#c2410c",
                    padding: "9px 14px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >

                  <i className="bi bi-bell-fill"></i>

                  {calibrationAlerts.length}{" "}
                  Alert
                  {calibrationAlerts.length !==
                  1
                    ? "s"
                    : ""}

                </div>

              </div>


              {/* NO ALERTS */}

              {calibrationAlerts.length === 0 ? (

                <div
                  style={{
                    padding: "35px 20px",
                    textAlign: "center",
                    background: "#f0fdf4",
                    border:
                      "1px solid #bbf7d0",
                    borderRadius: "12px",
                  }}
                >

                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      margin:
                        "0 auto 12px",
                      borderRadius: "50%",
                      background:
                        "#dcfce7",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >

                    <i
                      className="bi bi-check-lg"
                      style={{
                        fontSize: "24px",
                        color: "#16a34a",
                      }}
                    ></i>

                  </div>

                  <h3
                    style={{
                      margin: "0 0 5px",
                      color: "#166534",
                      fontSize: "16px",
                    }}
                  >
                    All equipment is up to date
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    No calibration alerts at
                    the moment.
                  </p>

                </div>

              ) : (

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "16px",
                  }}
                >

                  {calibrationAlerts.map(
                    (alert, index) => {

                      const days =
                        alert.daysUntilDue ??
                        0;

                      const overdue =
                        days < 0;

                      const urgent =
                        days >= 0 &&
                        days <= 7;

                      const warning =
                        days > 7 &&
                        days <= 30;

                      let accent =
                        "#16a34a";

                      let background =
                        "#f0fdf4";

                      let border =
                        "#bbf7d0";

                      let icon =
                        "bi-check-circle-fill";

                      let label =
                        "On schedule";

                      if (overdue) {

                        accent = "#dc2626";

                        background =
                          "#fef2f2";

                        border =
                          "#fecaca";

                        icon =
                          "bi-exclamation-octagon-fill";

                        label = "Overdue";

                      } else if (urgent) {

                        accent = "#ea580c";

                        background =
                          "#fff7ed";

                        border =
                          "#fed7aa";

                        icon =
                          "bi-exclamation-triangle-fill";

                        label = "Due soon";

                      } else if (warning) {

                        accent = "#ca8a04";

                        background =
                          "#fefce8";

                        border =
                          "#fef08a";

                        icon =
                          "bi-clock-fill";

                        label = "Upcoming";
                      }

                      return (

                        <div
                          key={
                            alert.id ??
                            index
                          }
                          style={{
                            position:
                              "relative",
                            background:
                              "#ffffff",
                            border:
                              `1px solid ${border}`,
                            borderRadius:
                              "14px",
                            padding:
                              "18px",
                            overflow:
                              "hidden",
                            boxShadow:
                              "0 3px 10px rgba(15,23,42,0.05)",
                          }}
                        >

                          {/* TOP ACCENT */}

                          <div
                            style={{
                              position:
                                "absolute",
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: "5px",
                              background:
                                accent,
                            }}
                          />


                          {/* CARD HEADER */}

                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              alignItems:
                                "flex-start",
                              gap: "12px",
                              marginBottom:
                                "16px",
                            }}
                          >

                            <div
                              style={{
                                display:
                                  "flex",
                                gap: "12px",
                                alignItems:
                                  "center",
                              }}
                            >

                              <div
                                style={{
                                  width: "42px",
                                  height: "42px",
                                  borderRadius:
                                    "10px",
                                  background:
                                    background,
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  flexShrink:
                                    0,
                                }}
                              >

                                <i
                                  className={`bi ${icon}`}
                                  style={{
                                    fontSize:
                                      "20px",
                                    color:
                                      accent,
                                  }}
                                ></i>

                              </div>


                              <div>

                                <h3
                                  style={{
                                    margin: 0,
                                    fontSize:
                                      "16px",
                                    fontWeight:
                                      800,
                                    color:
                                      "#0f172a",
                                  }}
                                >
                                  {
                                    alert.equipmentName
                                  }
                                </h3>

                                <p
                                  style={{
                                    margin:
                                      "4px 0 0",
                                    fontSize:
                                      "12px",
                                    color:
                                      "#64748b",
                                  }}
                                >
                                  {alert.category ||
                                    "Equipment"}
                                </p>

                              </div>

                            </div>


                            {/* STATUS */}

                            <span
                              style={{
                                background:
                                  background,
                                color:
                                  accent,
                                border:
                                  `1px solid ${border}`,
                                padding:
                                  "5px 9px",
                                borderRadius:
                                  "999px",
                                fontSize:
                                  "11px",
                                fontWeight:
                                  800,
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {label}
                            </span>

                          </div>


                          {/* DATE INFORMATION */}

                          <div
                            style={{
                              background:
                                "#f8fafc",
                              borderRadius:
                                "10px",
                              padding:
                                "12px 14px",
                              marginBottom:
                                "14px",
                            }}
                          >

                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: "8px",
                                marginBottom:
                                  "5px",
                              }}
                            >

                              <i
                                className="bi bi-calendar-event"
                                style={{
                                  color:
                                    "#475569",
                                  fontSize:
                                    "15px",
                                }}
                              ></i>

                              <span
                                style={{
                                  fontSize:
                                    "12px",
                                  color:
                                    "#64748b",
                                  fontWeight:
                                    600,
                                }}
                              >
                                Next calibration
                              </span>

                            </div>

                            <strong
                              style={{
                                fontSize:
                                  "15px",
                                color:
                                  "#0f172a",
                              }}
                            >
                              {new Date(
                                alert.calibrationDueDate
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </strong>

                          </div>


                          {/* URGENCY */}

                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              alignItems:
                                "center",
                            }}
                          >

                            <span
                              style={{
                                fontSize:
                                  "12px",
                                color:
                                  "#64748b",
                              }}
                            >
                              Calibration status
                            </span>

                            <strong
                              style={{
                                fontSize:
                                  "13px",
                                color:
                                  accent,
                              }}
                            >
                              {overdue
                                ? `${Math.abs(
                                    days
                                  )} days overdue`
                                : `Due in ${days} days`}
                            </strong>

                          </div>


                          {/* PROGRESS BAR */}

                          <div
                            style={{
                              marginTop:
                                "10px",
                              height: "6px",
                              background:
                                "#e2e8f0",
                              borderRadius:
                                "999px",
                              overflow:
                                "hidden",
                            }}
                          >

                            <div
                              style={{
                                height:
                                  "100%",
                                width:
                                  overdue
                                    ? "100%"
                                    : `${Math.min(
                                        100,
                                        Math.max(
                                          10,
                                          100 -
                                            (days /
                                              90) *
                                              100
                                        )
                                      )}%`,
                                background:
                                  accent,
                                borderRadius:
                                  "999px",
                                transition:
                                  "width 0.3s ease",
                              }}
                            />

                          </div>

                        </div>

                      );
                    }
                  )}

                </div>

              )}

            </div>


            {/* =================================================
                EQUIPMENT USAGE HOURS - PREMIUM ANALYTICS
            ================================================= */}

            <div
              style={{
                position: "relative",
                background: "#ffffff",
                borderRadius: "20px",
                padding: "26px",
                marginBottom: "25px",
                boxShadow:
                  "0 10px 30px rgba(15, 23, 42, 0.12)",
                border:
                  "1px solid #e2e8f0",
                overflow: "hidden",
              }}
            >

              {/* TOP DECORATIVE GLOW */}

              <div
                style={{
                  position: "absolute",
                  width: "220px",
                  height: "220px",
                  borderRadius: "50%",
                  background:
                    "rgba(45, 212, 191, 0.07)",
                  right: "-80px",
                  top: "-100px",
                  pointerEvents: "none",
                }}
              />


              {/* HEADER */}

              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                  flexWrap: "wrap",
                  gap: "15px",
                }}
              >

                {/* LEFT SIDE */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >

                  {/* ICON */}

                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background:
                        "linear-gradient(135deg, #ccfbf1, #99f6e4)",
                      color: "#0f766e",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      fontSize: "21px",
                      boxShadow:
                        "0 5px 12px rgba(20,184,166,0.15)",
                    }}
                  >
                    <i className="bi bi-bar-chart-fill"></i>
                  </div>


                  {/* TITLE */}

                  <div>

                    <h4
                      style={{
                        color: "#0f172a",
                        margin: 0,
                        fontSize: "19px",
                        fontWeight: 800,
                      }}
                    >
                      Equipment Usage Hours
                    </h4>

                    <p
                      style={{
                        margin:
                          "5px 0 0",
                        color: "#64748b",
                        fontSize: "13px",
                      }}
                    >
                      Track equipment utilization
                      across the laboratory
                    </p>

                  </div>

                </div>


                {/* TOTAL HOURS */}

                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "9px",
                    background:
                      "#f0fdfa",
                    border:
                      "1px solid #99f6e4",
                    color: "#0f766e",
                    padding:
                      "9px 14px",
                    borderRadius:
                      "999px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >

                  <i className="bi bi-clock-history"></i>

                  {totalUsageHours} total hours

                </div>

              </div>


              {/* CHART */}

              <div
                style={{
                  position:
                    "relative",
                  zIndex: 2,
                  height:
                    Math.max(
                      420,
                      equipment.length *
                        34
                    ),
                  padding:
                    "10px 5px 5px 0",
                }}
              >

                {equipment.length ===
                0 ? (

                  <div
                    style={{
                      height:
                        "100%",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      flexDirection:
                        "column",
                      color:
                        "#64748b",
                    }}
                  >

                    <i
                      className="bi bi-bar-chart"
                      style={{
                        fontSize:
                          "38px",
                        marginBottom:
                          "10px",
                      }}
                    ></i>

                    <span
                      style={{
                        fontSize:
                          "14px",
                        fontWeight:
                          600,
                      }}
                    >
                      No usage data
                      available
                    </span>

                  </div>

                ) : (

                  <Bar
                    data={chartData}
                    options={chartOptions}
                  />

                )}

              </div>


              {/* FOOTER */}

              <div
                style={{
                  position:
                    "relative",
                  zIndex: 2,
                  marginTop:
                    "16px",
                  paddingTop:
                    "15px",
                  borderTop:
                    "1px solid #e2e8f0",
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  flexWrap:
                    "wrap",
                  gap: "10px",
                }}
              >

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "8px",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                  }}
                >

                  <span
                    style={{
                      width: "9px",
                      height: "9px",
                      borderRadius:
                        "50%",
                      background:
                        "#2DD4BF",
                      display:
                        "inline-block",
                    }}
                  />

                  Usage hours

                </div>


                <span
                  style={{
                    color:
                      "#94a3b8",
                    fontSize:
                      "11px",
                  }}
                >
                  Updated automatically every
                  5 seconds
                </span>

              </div>

            </div>

          </>
        )}

      </main>

    </div>
  );
}