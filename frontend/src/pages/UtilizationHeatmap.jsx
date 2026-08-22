import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getUtilizationHeatmap } from "../services/equipmentService";
import "./UtilizationHeatmap.css";

// ============================================================
// HEATMAP COLOR
// ============================================================

function getHeatColor(rate) {
  if (rate === 0) return "heat-zero";
  if (rate <= 20) return "heat-very-low";
  if (rate <= 40) return "heat-low";
  if (rate <= 70) return "heat-medium";
  if (rate <= 90) return "heat-high";
  return "heat-critical";
}

// ============================================================
// HEATMAP LABEL
// ============================================================

function getHeatLabel(rate) {
  if (rate === 0) return "No Usage";
  if (rate <= 20) return "Very Low";
  if (rate <= 40) return "Low";
  if (rate <= 70) return "Medium";
  if (rate <= 90) return "High";
  return "Very High";
}

// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

// ============================================================
// DAY NAME
// ============================================================

function getDayName(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
  });
}

// ============================================================
// EQUIPMENT ICON
// ============================================================

function getEquipmentIcon(category = "", equipmentName = "") {
  const value =
    `${category} ${equipmentName}`.toLowerCase();

  if (
    value.includes("microscope") ||
    value.includes("confocal")
  ) {
    return "🔬";
  }

  if (
    value.includes("spectro") ||
    value.includes("spectrometer")
  ) {
    return "📡";
  }

  if (value.includes("centrif")) {
    return "⚙️";
  }

  if (
    value.includes("autoclave") ||
    value.includes("steril")
  ) {
    return "🧫";
  }

  if (
    value.includes("chromat") ||
    value.includes("hplc")
  ) {
    return "🧪";
  }

  if (
    value.includes("prep") ||
    value.includes("sample")
  ) {
    return "🧬";
  }

  if (
    value.includes("uv") ||
    value.includes("measurement")
  ) {
    return "☀️";
  }

  if (value.includes("laser")) {
    return "🔦";
  }

  return "🧪";
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function UtilizationHeatmap() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // CURRENT WEEK
  // ==========================================================

  const getCurrentWeek = () => {
    const today = new Date();

    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      from: monday.toISOString().split("T")[0],
      to: sunday.toISOString().split("T")[0],
    };
  };

  const initialWeek = getCurrentWeek();

  const [fromDate, setFromDate] =
    useState(initialWeek.from);

  const [toDate, setToDate] =
    useState(initialWeek.to);

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getUtilizationHeatmap(
            fromDate,
            toDate
          );

        if (!cancelled) {
          setEquipment(
            Array.isArray(data)
              ? data
              : []
          );
        }
      } catch (err) {
        console.error(
          "Failed to load utilization heatmap:",
          err
        );

        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              "Unable to load utilization data."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    const interval =
      setInterval(fetchData, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [fromDate, toDate]);

  // ==========================================================
  // DATES
  // ==========================================================

  const dates = useMemo(() => {
    const result = [];

    const start =
      new Date(`${fromDate}T00:00:00`);

    const end =
      new Date(`${toDate}T00:00:00`);

    let current = new Date(start);

    while (current <= end) {
      result.push(
        current.toISOString().split("T")[0]
      );

      current.setDate(
        current.getDate() + 1
      );
    }

    return result;
  }, [fromDate, toDate]);

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const statistics = useMemo(() => {
    if (!equipment.length) {
      return {
        average: 0,
        highest: 0,
        totalBookings: 0,
        totalHours: 0,
      };
    }

    let totalUtilization = 0;
    let totalBookings = 0;
    let totalHours = 0;
    let highest = 0;

    equipment.forEach((item) => {
      totalUtilization += Number(
        item.averageUtilization || 0
      );

      item.dailyUtilization?.forEach(
        (day) => {
          totalBookings += Number(
            day.bookings || 0
          );

          totalHours += Number(
            day.usageHours || 0
          );

          highest = Math.max(
            highest,
            Number(day.utilization || 0)
          );
        }
      );
    });

    return {
      average:
        Math.round(
          (totalUtilization /
            equipment.length) *
            10
        ) / 10,

      highest,
      totalBookings,
      totalHours,
    };
  }, [equipment]);

  // ==========================================================
  // CURRENT WEEK
  // ==========================================================

  const setCurrentWeek = () => {
    const week = getCurrentWeek();

    setFromDate(week.from);
    setToDate(week.to);
  };

  // ==========================================================
  // SHIFT WEEK
  // ==========================================================

  const shiftWeek = (direction) => {
    const start =
      new Date(`${fromDate}T00:00:00`);

    const end =
      new Date(`${toDate}T00:00:00`);

    start.setDate(
      start.getDate() +
        direction * 7
    );

    end.setDate(
      end.getDate() +
        direction * 7
    );

    setFromDate(
      start.toISOString().split("T")[0]
    );

    setToDate(
      end.toISOString().split("T")[0]
    );
  };

  // ==========================================================
  // GRID TEMPLATE
  // ==========================================================

  const gridTemplate =
    `minmax(320px, 2.4fr) ` +
    `repeat(${dates.length}, minmax(82px, 1fr)) ` +
    `95px`;

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="heatmap-page">

      {/* SIDEBAR */}

      <aside className="sidebar">
        <Sidebar />
      </aside>

      {/* MAIN */}

      <main className="heatmap-main">

        {/* ==================================================
            HEADER
        ================================================== */}

        <section className="heatmap-header">

          <div className="heatmap-title-wrapper">

            <div className="heatmap-title-icon">
              📊
            </div>

            <div>

              <div className="heatmap-eyebrow">
                RESOURCE ANALYTICS
              </div>

              <h1>
                Utilization Heatmap
              </h1>

              <p>
                Visualize laboratory equipment
                usage and identify high-demand
                resources.
              </p>

            </div>

          </div>

          <div className="live-indicator">
            <span className="live-dot"></span>
            Live Data
          </div>

        </section>

        {/* ==================================================
            DATE CONTROLS
        ================================================== */}

        <section className="heatmap-controls">

          <div className="control-title">

            <span className="control-icon">
              📅
            </span>

            <div>
              <strong>
                Analysis Period
              </strong>

              <small>
                Select the period you want to analyze
              </small>
            </div>

          </div>

          <div className="date-controls">

            <button
              className="week-arrow"
              onClick={() =>
                shiftWeek(-1)
              }
            >
              ←
            </button>

            <div className="date-field">

              <label>
                FROM
              </label>

              <input
                type="date"
                value={fromDate}
                onChange={(e) =>
                  setFromDate(
                    e.target.value
                  )
                }
              />

            </div>

            <span className="date-separator">
              →
            </span>

            <div className="date-field">

              <label>
                TO
              </label>

              <input
                type="date"
                value={toDate}
                onChange={(e) =>
                  setToDate(
                    e.target.value
                  )
                }
              />

            </div>

            <button
              className="week-arrow"
              onClick={() =>
                shiftWeek(1)
              }
            >
              →
            </button>

            <button
              className="current-week-btn"
              onClick={setCurrentWeek}
            >
              ✨ This Week
            </button>

          </div>

        </section>

        {/* ERROR */}

        {error && (
          <div className="heatmap-error">
            ⚠️ {error}
          </div>
        )}

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <section className="heatmap-summary">

          <div className="summary-card blue-card">
            <div className="summary-icon">
              📊
            </div>

            <div>
              <span>
                AVERAGE UTILIZATION
              </span>

              <strong>
                {statistics.average}%
              </strong>

              <small>
                Across all equipment
              </small>
            </div>
          </div>

          <div className="summary-card purple-card">
            <div className="summary-icon">
              ⚡
            </div>

            <div>
              <span>
                PEAK UTILIZATION
              </span>

              <strong>
                {statistics.highest}%
              </strong>

              <small>
                Highest recorded usage
              </small>
            </div>
          </div>

          <div className="summary-card green-card">
            <div className="summary-icon">
              ⏱
            </div>

            <div>
              <span>
                USAGE HOURS
              </span>

              <strong>
                {statistics.totalHours}
              </strong>

              <small>
                Total equipment hours
              </small>
            </div>
          </div>

          <div className="summary-card orange-card">
            <div className="summary-icon">
              📋
            </div>

            <div>
              <span>
                BOOKINGS
              </span>

              <strong>
                {statistics.totalBookings}
              </strong>

              <small>
                Confirmed & completed
              </small>
            </div>
          </div>

        </section>

        {/* ==================================================
            HEATMAP
        ================================================== */}

        <section className="heatmap-card">

          {/* CARD HEADER */}

          <div className="heatmap-card-header">

            <div className="section-heading">

              <div className="section-heading-icon">
                🔥
              </div>

              <div>

                <h2>
                  Equipment Utilization
                </h2>

                <p>
                  Daily resource utilization
                  by equipment
                </p>

              </div>

            </div>

            {/* LEGEND */}

            <div className="heatmap-legend">

              <span>
                Utilization
              </span>

              <div className="legend-item">
                <i className="legend-dot heat-zero"></i>
                0%
              </div>

              <div className="legend-item">
                <i className="legend-dot heat-very-low"></i>
                1–20%
              </div>

              <div className="legend-item">
                <i className="legend-dot heat-low"></i>
                21–40%
              </div>

              <div className="legend-item">
                <i className="legend-dot heat-medium"></i>
                41–70%
              </div>

              <div className="legend-item">
                <i className="legend-dot heat-high"></i>
                71–90%
              </div>

              <div className="legend-item">
                <i className="legend-dot heat-critical"></i>
                91–100%
              </div>

            </div>

          </div>

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading ? (

            <div className="heatmap-loading">

              <div className="loading-orb">
                ✨
              </div>

              <h3>
                Loading utilization data...
              </h3>

              <p>
                Fetching laboratory resource
                activity
              </p>

            </div>

          ) : equipment.length === 0 ? (

            <div className="heatmap-empty">

              <div className="empty-icon">
                🔍
              </div>

              <h3>
                No equipment data
              </h3>

              <p>
                No utilization information is
                available for the selected period.
              </p>

            </div>

          ) : (

            <div className="heatmap-scroll">

              {/* ==================================================
                  TABLE HEADER
              ================================================== */}

              <div
                className="heatmap-header-grid"
                style={{
                  gridTemplateColumns:
                    gridTemplate,
                }}
              >

                <div className="equipment-header">
                  <span className="header-icon">
                    ✦
                  </span>

                  <span>
                    EQUIPMENT
                  </span>
                </div>

                {dates.map((date) => (
                  <div
                    key={date}
                    className="date-header"
                  >
                    <strong>
                      {getDayName(date)}
                    </strong>

                    <span>
                      {formatDate(date)}
                    </span>
                  </div>
                ))}

                <div className="average-header">
                  AVG
                </div>

              </div>

              {/* ==================================================
                  EQUIPMENT ROWS
              ================================================== */}

              <div className="equipment-rows">

                {equipment.map((item) => {

                  const dailyMap = {};

                  item.dailyUtilization?.forEach(
                    (day) => {
                      dailyMap[day.date] = day;
                    }
                  );

                  return (

                    <div
                      className="equipment-row"
                      key={item.equipmentId}
                      style={{
                        gridTemplateColumns:
                          gridTemplate,
                      }}
                    >

                      {/* ==================================================
                          EQUIPMENT INFORMATION
                      ================================================== */}

                      <div className="equipment-info-cell">

                        <div className="equipment-icon">
                          {getEquipmentIcon(
                            item.category,
                            item.equipmentName
                          )}
                        </div>

                        <div className="equipment-details">

                          <div className="equipment-name">
                            {item.equipmentName}
                          </div>

                          <div className="equipment-category">
                            {item.category ||
                              "Laboratory Equipment"}
                          </div>

                        </div>

                      </div>

                      {/* ==================================================
                          DAILY CELLS
                      ================================================== */}

                      {dates.map((date) => {

                        const day =
                          dailyMap[date];

                        const rate =
                          Number(
                            day?.utilization || 0
                          );

                        return (

                          <div
                            key={`${item.equipmentId}-${date}`}
                            className={`heat-cell ${getHeatColor(
                              rate
                            )}`}
                          >

                            <span className="heat-cell-value">
                              {rate}%
                            </span>

                            <div className="heat-tooltip">

                              <strong>
                                {item.equipmentName}
                              </strong>

                              <span>
                                📅{" "}
                                {formatDate(date)}
                              </span>

                              <span>
                                ⚡ {rate}%
                                utilization
                              </span>

                              <span>
                                ⏱{" "}
                                {day?.usageHours ||
                                  0}{" "}
                                hours
                              </span>

                              <span>
                                📋{" "}
                                {day?.bookings ||
                                  0}{" "}
                                bookings
                              </span>

                              <small>
                                {getHeatLabel(rate)}
                              </small>

                            </div>

                          </div>

                        );
                      })}

                      {/* ==================================================
                          AVERAGE
                      ================================================== */}

                      <div className="average-cell">

                        <strong>
                          {Number(
                            item.averageUtilization ||
                              0
                          ).toFixed(1)}
                          %
                        </strong>

                      </div>

                    </div>
                  );
                })}

              </div>

            </div>
          )}

        </section>

        {/* ==================================================
            INSIGHT
        ================================================== */}

        {!loading &&
          equipment.length > 0 && (

            <section className="heatmap-insight">

              <div className="insight-icon">
                ✨
              </div>

              <div>

                <strong>
                  Resource Optimization Insight
                </strong>

                <p>
                  Use this heatmap to identify
                  highly utilized equipment,
                  detect underused resources,
                  and make better scheduling
                  and resource-sharing decisions.
                </p>

              </div>

            </section>

          )}

      </main>
    </div>
  );
}