import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getMyAnalytics } from "../services/analyticsService";
import { getAllEquipment, getUtilizationHeatmap } from "../services/equipmentService";
import { getMyWaitlistEntries } from "../services/waitlistService";
import { getUnreadCount } from "../services/notificationService";

import "./Analytics.css";

/* =========================================================
   GENERIC ICON HELPER
========================================================= */

function Icon({ name }) {
  return <i className={`bi ${name}`}></i>;
}


/* =========================================================
   EQUIPMENT ICON HELPER
========================================================= */

function getEquipmentIcon(equipmentName = "") {
  const name = equipmentName.toLowerCase();

  if (name.includes("microscope")) return "bi-microscope";

  if (
    name.includes("spectrometer") ||
    name.includes("spectroscopy")
  ) {
    return "bi-bar-chart-fill";
  }

  if (name.includes("centrifuge")) {
    return "bi-gear-wide-connected";
  }

  if (
    name.includes("autoclave") ||
    name.includes("sterilizer") ||
    name.includes("sterilization")
  ) {
    return "bi-virus";
  }

  if (
    name.includes("station") ||
    name.includes("prep")
  ) {
    return "bi-diagram-3-fill";
  }

  if (
    name.includes("printer") ||
    name.includes("3d printer")
  ) {
    return "bi-printer-fill";
  }

  if (
    name.includes("analyzer") ||
    name.includes("analysis")
  ) {
    return "bi-graph-up";
  }

  if (
    name.includes("oven") ||
    name.includes("incubator") ||
    name.includes("heater")
  ) {
    return "bi-thermometer-half";
  }

  if (
    name.includes("balance") ||
    name.includes("weighing")
  ) {
    return "bi-speedometer2";
  }

  if (
    name.includes("chromatograph") ||
    name.includes("chromatography")
  ) {
    return "bi-droplet-half";
  }

  if (name.includes("laser")) {
    return "bi-lightning-charge-fill";
  }

  if (name.includes("pcr")) {
    return "bi-beaker-fill";
  }

  if (
    name.includes("ph meter") ||
    name.includes("meter")
  ) {
    return "bi-activity";
  }

  if (name.includes("camera")) {
    return "bi-camera-fill";
  }

  if (
    name.includes("computer") ||
    name.includes("workstation")
  ) {
    return "bi-pc-display";
  }

  if (
    name.includes("freezer") ||
    name.includes("refrigerator")
  ) {
    return "bi-snow";
  }

  if (name.includes("pump")) {
    return "bi-droplet-fill";
  }

  if (name.includes("generator")) {
    return "bi-lightning-charge";
  }

  return "bi-flask-fill";
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  description,
  gradient,
  glow,
}) {
  return (
    <div
      className="analytics-stat-card"
      style={{
        "--card-gradient": gradient,
        "--card-glow": glow,
      }}
    >
      <div className="analytics-card-circle circle-one"></div>
      <div className="analytics-card-circle circle-two"></div>

      <div className="analytics-stat-icon">
        <Icon name={icon} />
      </div>

      <div className="analytics-stat-content">
        <span className="analytics-stat-label">
          {label}
        </span>

        <strong className="analytics-stat-value">
          {value}
        </strong>

        <span className="analytics-stat-description">
          {description}
        </span>
      </div>
    </div>
  );
}


/* =========================================================
   BOOKING METRIC CARD
========================================================= */

function BookingMetricCard({
  icon,
  title,
  value,
  description,
  gradient,
  className = "",
}) {
  return (
    <div
      className={`booking-metric-card ${className}`}
      style={{
        "--metric-gradient": gradient,
      }}
    >
      <div className="booking-card-orb orb-one"></div>
      <div className="booking-card-orb orb-two"></div>

      <div className="booking-metric-top">
        <div className="booking-metric-icon">
          <Icon name={icon} />
        </div>

        <span className="booking-metric-title">
          {title}
        </span>
      </div>

      <div className="booking-metric-content">
        <strong className="booking-metric-value">
          {value}
        </strong>

        <span className="booking-metric-description">
          {description}
        </span>
      </div>

      <div className="booking-card-shine"></div>
    </div>
  );
}


/* =========================================================
   BOOKING RATE CARD
========================================================= */

function BookingRateCard({
  type,
  icon,
  title,
  subtitle,
  value,
}) {
  const numericValue = Math.min(
    Math.max(Number(value) || 0, 0),
    100
  );

  const isCompletion = type === "completion";

  return (
    <div
      className={`booking-rate-card ${
        isCompletion
          ? "completion-rate-card"
          : "no-show-rate-card"
      }`}
    >
      <div className="booking-rate-top">

        <div className="booking-rate-title-area">

          <div className={`booking-rate-icon ${type}`}>
            <Icon name={icon} />
          </div>

          <div>
            <h4>{title}</h4>

            <p>{subtitle}</p>
          </div>

        </div>

        <strong className="booking-rate-value">
          {numericValue.toFixed(1)}%
        </strong>

      </div>

      <div className="booking-progress-track">

        <div
          className={`booking-progress-fill ${type}`}
          style={{
            width: `${numericValue}%`,
          }}
        ></div>

      </div>

      <div className="booking-rate-footer">

        <span>
          {isCompletion
            ? "Successful bookings"
            : "Missed bookings"}
        </span>

        <span>
          {numericValue.toFixed(1)}%
        </span>

      </div>

    </div>
  );
}


/* =========================================================
   BOOKING PERFORMANCE / NO-SHOW ANALYTICS
========================================================= */

function BookingAnalytics({ data }) {

  const noShowRate =
    Number(data?.institutionNoShowRate ?? 0);

  const completionRate =
    Number(data?.institutionCompletionRate ?? 0);

  const confirmed =
    Number(
      data?.institutionConfirmedBookings ?? 0
    );

  const completed =
    Number(
      data?.institutionCompletedBookings ?? 0
    );

  const cancelled =
    Number(
      data?.institutionCancelledBookings ?? 0
    );

  const noShows =
    Number(
      data?.institutionNoShowBookings ?? 0
    );


  let insightTitle = "Booking activity is being tracked";
  let insightText = (
    <>
      Your laboratory currently has a{" "}
      <strong>
        {completionRate.toFixed(1)}%
      </strong>{" "}
      booking completion rate.
    </>
  );

  let insightIcon = "bi-stars";
  let insightClass = "neutral";

  if (noShowRate > 10) {

    insightTitle = "Attention needed";

    insightText = (
      <>
        The no-show rate is{" "}
        <strong>
          {noShowRate.toFixed(1)}%
        </strong>
        . Consider sending reminders before
        scheduled equipment bookings.
      </>
    );

    insightIcon = "bi-exclamation-diamond-fill";
    insightClass = "warning";

  } else if (completionRate >= 80) {

    insightTitle = "Excellent booking performance";

    insightText = (
      <>
        Your laboratory has achieved a{" "}
        <strong>
          {completionRate.toFixed(1)}%
        </strong>{" "}
        completion rate. Keep up the great work!
      </>
    );

    insightIcon = "bi-trophy-fill";
    insightClass = "success";

  } else if (completionRate >= 50) {

    insightTitle = "Good booking activity";

    insightText = (
      <>
        Your laboratory has a{" "}
        <strong>
          {completionRate.toFixed(1)}%
        </strong>{" "}
        completion rate. There is room for further improvement.
      </>
    );

    insightIcon = "bi-graph-up-arrow";
    insightClass = "info";
  }


  return (
    <section className="analytics-panel booking-analytics-panel">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="booking-performance-header">

        <div className="booking-header-left">

          <div className="booking-header-icon">
            <Icon name="bi-calendar2-check-fill" />
          </div>

          <div>

            <span className="booking-section-label">
              BOOKING ANALYTICS
            </span>

            <h3>
              Booking Performance
            </h3>

            <p>
              Monitor booking outcomes, completion
              and no-show activity across your laboratory.
            </p>

          </div>

        </div>


        <div className="booking-live-badge">
          <span className="live-dot"></span>
          Live Insights
        </div>

      </div>


      {/* =====================================================
          METRIC CARDS
      ===================================================== */}

      <div className="booking-metrics-grid">

        <BookingMetricCard
          icon="bi-check-circle-fill"
          title="CONFIRMED"
          value={confirmed}
          description="Approved bookings"
          gradient="linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)"
        />


        <BookingMetricCard
          icon="bi-check2-all"
          title="COMPLETED"
          value={completed}
          description="Successfully completed"
          gradient="linear-gradient(135deg, #059669 0%, #0d9488 100%)"
        />


        <BookingMetricCard
          icon="bi-x-circle-fill"
          title="CANCELLED"
          value={cancelled}
          description="Cancelled bookings"
          gradient="linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
        />


        <BookingMetricCard
          icon="bi-person-x-fill"
          title="NO-SHOWS"
          value={noShows}
          description="Missed bookings"
          gradient="linear-gradient(135deg, #dc2626 0%, #be123c 100%)"
          className={
            noShowRate > 10
              ? "booking-warning-card"
              : ""
          }
        />

      </div>


      {/* =====================================================
          RATE CARDS
      ===================================================== */}

      <div className="booking-rates-section">

        <BookingRateCard
          type="completion"
          icon="bi-trophy-fill"
          title="Completion Rate"
          subtitle="Successful booking completion"
          value={completionRate}
        />


        <BookingRateCard
          type="no-show"
          icon="bi-exclamation-triangle-fill"
          title="No-Show Rate"
          subtitle="Percentage of missed bookings"
          value={noShowRate}
        />

      </div>


      {/* =====================================================
          SMART INSIGHT
      ===================================================== */}

      <div
        className={`booking-insight ${insightClass}`}
      >

        <div className="booking-insight-icon">
          <Icon name={insightIcon} />
        </div>

        <div className="booking-insight-content">

          <span>
            SMART INSIGHT
          </span>

          <h4>
            {insightTitle}
          </h4>

          <p>
            {insightText}
          </p>

        </div>

        <div className="booking-insight-sparkles">
          ✦
        </div>

      </div>

    </section>
  );
}


/* =========================================================
   EQUIPMENT CARD
========================================================= */

function EquipmentCard({
  equipment,
  index,
}) {

  const colors = [
    {
      gradient:
        "linear-gradient(135deg, #2563eb, #4f46e5)",
      light: "#dbeafe",
      icon: "bi-microscope",
    },

    {
      gradient:
        "linear-gradient(135deg, #7c3aed, #9333ea)",
      light: "#ede9fe",
      icon: "bi-cpu",
    },

    {
      gradient:
        "linear-gradient(135deg, #0891b2, #0e7490)",
      light: "#cffafe",
      icon: "bi-beaker",
    },

    {
      gradient:
        "linear-gradient(135deg, #059669, #0f766e)",
      light: "#d1fae5",
      icon: "bi-flask",
    },

    {
      gradient:
        "linear-gradient(135deg, #ea580c, #dc2626)",
      light: "#ffedd5",
      icon: "bi-activity",
    },
  ];

  const theme =
    colors[index % colors.length];

  return (
    <div className="analytics-equipment-card">

      <div
        className="equipment-rank"
        style={{
          background: theme.gradient,
        }}
      >
        #{index + 1}
      </div>


      <div
        className="equipment-icon"
        style={{
          background: theme.gradient,
        }}
      >
        <Icon name={theme.icon} />
      </div>


      <div className="equipment-card-info">

        <strong>
          {equipment.equipmentName}
        </strong>

        <span>
          Equipment utilization
        </span>

      </div>


      <div className="equipment-booking-count">

        <strong>
          {equipment.bookingCount}
        </strong>

        <span>
          bookings
        </span>

      </div>

    </div>
  );
}


/* =========================================================
   USAGE HISTORY
========================================================= */

function UsageHistory({ history }) {

  if (!history || history.length === 0) {

    return (
      <section className="analytics-panel usage-history-panel">

        <div className="analytics-panel-header">

          <div className="panel-title-icon teal usage-history-title-icon">
            <Icon name="bi-clock-history" />
          </div>

          <div>
            <h3>
              Usage History
            </h3>

            <p>
              Your recent laboratory equipment usage
            </p>
          </div>

          <div className="panel-badge usage-history-badge">
            <Icon name="bi-person-check-fill" />
            Personal
          </div>

        </div>


        <div className="analytics-empty usage-empty">

          <div className="usage-empty-icon">
            <Icon name="bi-stars" />
          </div>

          <h3>
            No usage history
          </h3>

          <p>
            Your completed and confirmed equipment
            bookings will appear here.
          </p>

        </div>

      </section>
    );
  }


  return (
    <section className="analytics-panel usage-history-panel">

      <div className="analytics-panel-header">

        <div className="panel-title-icon teal usage-history-title-icon">
          <Icon name="bi-clock-history" />
        </div>

        <div>
          <h3>
            Usage History
          </h3>

          <p>
            Your recent laboratory equipment usage
          </p>
        </div>

        <div className="panel-badge usage-history-badge">
          <Icon name="bi-activity" />
          Recent
        </div>

      </div>


      <div className="usage-history-list">

        {history.map((item, index) => {

          const status =
            String(
              item.status || "Unknown"
            ).toLowerCase();


          const equipmentIcon =
            getEquipmentIcon(
              item.equipmentName ||
              item.equipment?.equipmentName ||
              ""
            );


          return (

            <div
              className="usage-history-item"
              key={item.id || index}
            >

              <div className="usage-history-icon">

                <div className="usage-icon-glow"></div>

                <span className="usage-equipment-symbol">

                  <Icon
                    name={equipmentIcon}
                  />

                </span>

              </div>


              <div className="usage-history-info">

                <strong>
                  {
                    item.equipmentName ||
                    item.equipment?.equipmentName ||
                    "Unknown Equipment"
                  }
                </strong>


                <div className="usage-history-meta">

                  <span>

                    <Icon
                      name="bi-calendar3"
                    />

                    {
                      item.bookingDate ||
                      "Date unavailable"
                    }

                  </span>


                  {item.purpose && (

                    <span>

                      <Icon
                        name="bi-lightning-charge-fill"
                      />

                      {item.purpose}

                    </span>

                  )}

                </div>

              </div>


              <div className="usage-history-duration">

                <div className="duration-icon">

                  <Icon
                    name="bi-clock-fill"
                  />

                </div>


                <div>

                  <strong>
                    {item.durationHours ?? 0}
                  </strong>

                  <span>
                    {
                      item.durationHours === 1
                        ? "hour"
                        : "hours"
                    }
                  </span>

                </div>

              </div>


              <div
                className={`usage-history-status ${status.replace(
                  /\s+/g,
                  "-"
                )}`}
              >

                <span className="status-dot"></span>

                {item.status || "Unknown"}

              </div>

            </div>

          );

        })}

      </div>

    </section>
  );
}



/* =========================================================
   RESEARCHER AVAILABILITY / WAITLIST / NOTIFICATIONS
========================================================= */

function ResearcherResourceOverview({
  availableCount,
  waitlistCount,
  unreadCount,
  onNavigate,
}) {
  return (
    <section className="analytics-panel">
      <div className="analytics-panel-header">
        <div className="panel-title-icon teal">
          <Icon name="bi-grid-1x2-fill" />
        </div>

        <div>
          <h3>Resource Overview</h3>
          <p>
            Equipment availability, waitlist status and notifications
          </p>
        </div>

        <div className="panel-badge">
          <Icon name="bi-person-check-fill" />
          Personal
        </div>
      </div>

      <div className="booking-metrics-grid">
        <div
          className="booking-metric-card"
          style={{
            "--metric-gradient":
              "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
            cursor: "pointer",
          }}
          onClick={() => onNavigate("/equipment?status=AVAILABLE")}
        >
          <div className="booking-metric-top">
            <div className="booking-metric-icon">
              <Icon name="bi-check-circle-fill" />
            </div>
            <span className="booking-metric-title">
              AVAILABLE NOW
            </span>
          </div>

          <div className="booking-metric-content">
            <strong className="booking-metric-value">
              {availableCount}
            </strong>
            <span className="booking-metric-description">
              Equipment currently available
            </span>
          </div>
        </div>

        <div
          className="booking-metric-card"
          style={{
            "--metric-gradient":
              "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            cursor: "pointer",
          }}
          onClick={() => onNavigate("/my-waitlist")}
        >
          <div className="booking-metric-top">
            <div className="booking-metric-icon">
              <Icon name="bi-hourglass-split" />
            </div>
            <span className="booking-metric-title">
              WAITLIST
            </span>
          </div>

          <div className="booking-metric-content">
            <strong className="booking-metric-value">
              {waitlistCount}
            </strong>
            <span className="booking-metric-description">
              Active waitlist entries
            </span>
          </div>
        </div>

        <div
          className="booking-metric-card"
          style={{
            "--metric-gradient":
              "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
            cursor: "pointer",
          }}
          onClick={() => onNavigate("/notifications")}
        >
          <div className="booking-metric-top">
            <div className="booking-metric-icon">
              <Icon name="bi-bell-fill" />
            </div>
            <span className="booking-metric-title">
              NOTIFICATIONS
            </span>
          </div>

          <div className="booking-metric-content">
            <strong className="booking-metric-value">
              {unreadCount}
            </strong>
            <span className="booking-metric-description">
              Unread notifications
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}


/* =========================================================
   LAB MANAGER UTILIZATION HEATMAP
========================================================= */

function ManagerUtilizationHeatmap() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function getCurrentWeek() {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);

    const dates = [];

    for (let i = 0; i < 7; i += 1) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }

    return dates;
  }

  const [dates] = useState(getCurrentWeek);

  function heatClass(rate) {
    if (rate === 0) return "heat-zero";
    if (rate <= 20) return "heat-very-low";
    if (rate <= 40) return "heat-low";
    if (rate <= 70) return "heat-medium";
    if (rate <= 90) return "heat-high";
    return "heat-critical";
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await getUtilizationHeatmap(
          dates[0],
          dates[dates.length - 1]
        );

        if (!cancelled) {
          setEquipment(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Manager heatmap error:", err);
          setError(
            err?.response?.data?.message ||
              "Unable to load utilization heatmap."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [dates]);

  return (
    <section className="analytics-panel">
      <div className="analytics-panel-header">
        <div className="panel-title-icon purple">
          <Icon name="bi-grid-3x3-gap-fill" />
        </div>

        <div>
          <h3>Department Utilization Heatmap</h3>
          <p>
            Equipment utilization across the current week
          </p>
        </div>

        <div className="panel-badge">
          <Icon name="bi-fire" />
          Utilization
        </div>
      </div>

      {loading ? (
        <div className="analytics-empty">
          <div>
            <Icon name="bi-arrow-repeat" />
          </div>
          <h3>Loading heatmap...</h3>
          <p>Fetching current equipment utilization.</p>
        </div>
      ) : error ? (
        <div className="analytics-empty">
          <div>
            <Icon name="bi-exclamation-triangle-fill" />
          </div>
          <h3>Heatmap unavailable</h3>
          <p>{error}</p>
        </div>
      ) : equipment.length === 0 ? (
        <div className="analytics-empty">
          <div>
            <Icon name="bi-bar-chart" />
          </div>
          <h3>No utilization data</h3>
          <p>No equipment activity is available for this week.</p>
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
            padding: "10px 0 4px",
          }}
        >
          <div
            style={{
              minWidth: "760px",
              display: "grid",
              gridTemplateColumns:
                "minmax(180px, 1.8fr) repeat(7, minmax(65px, 1fr))",
              gap: "8px",
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                fontWeight: 800,
                padding: "12px",
                fontSize: "12px",
              }}
            >
              EQUIPMENT
            </div>

            {dates.map((date) => {
              const d = new Date(`${date}T00:00:00`);

              return (
                <div
                  key={date}
                  style={{
                    textAlign: "center",
                    padding: "10px 4px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {d.toLocaleDateString("en-IN", {
                    weekday: "short",
                  })}
                  <br />
                  {d.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  })}
                </div>
              );
            })}

            {equipment.map((item) => {
              const dailyMap = {};

              (item.dailyUtilization || []).forEach((day) => {
                dailyMap[day.date] = day;
              });

              return (
                <div key={item.equipmentId} style={{ display: "contents" }}>
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      background: "#f8fafc",
                      fontWeight: 700,
                      minHeight: "52px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {item.equipmentName}
                  </div>

                  {dates.map((date) => {
                    const rate = Number(
                      dailyMap[date]?.utilization || 0
                    );

                    return (
                      <div
                        key={`${item.equipmentId}-${date}`}
                        className={`heat-cell ${heatClass(rate)}`}
                        title={`${item.equipmentName} • ${rate}% utilization`}
                        style={{
                          minHeight: "52px",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                        }}
                      >
                        {rate}%
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}


/* =========================================================
   ANALYTICS PAGE
========================================================= */

export default function Analytics() {

  const navigate = useNavigate();

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [availableCount, setAvailableCount] =
    useState(0);

  const [waitlistCount, setWaitlistCount] =
    useState(0);

  const [unreadCount, setUnreadCount] =
    useState(0);


  /* =======================================================
     LOAD ANALYTICS
  ======================================================= */

  useEffect(() => {

    async function load() {

      try {

        const result =
          await getMyAnalytics();

        console.log(
          "Analytics response:",
          result
        );

        setData(result);

        // Researcher / Student resource overview
        if (result?.viewType === "RESEARCHER") {
          try {
            const equipment = await getAllEquipment();

            setAvailableCount(
              (equipment || []).filter(
                (item) =>
                  String(item.status || "").toUpperCase() ===
                  "AVAILABLE"
              ).length
            );
          } catch (error) {
            console.error(
              "Failed to load equipment availability:",
              error
            );
            setAvailableCount(0);
          }

          try {
            const waitlist = await getMyWaitlistEntries();

            setWaitlistCount(
              (waitlist || []).filter(
                (entry) =>
                  entry.status !== "EXPIRED"
              ).length
            );
          } catch (error) {
            console.error(
              "Failed to load waitlist:",
              error
            );
            setWaitlistCount(0);
          }

          try {
            const count = await getUnreadCount();
            setUnreadCount(Number(count) || 0);
          } catch (error) {
            console.error(
              "Failed to load notifications:",
              error
            );
            setUnreadCount(0);
          }
        }
      }

      catch (err) {

        console.error(
          "Analytics error:",
          err
        );

      }

      finally {

        setLoading(false);

      }

    }

    load();

  }, []);


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (

      <div className="analytics-wrapper">

        <aside className="sidebar">
          <Sidebar />
        </aside>


        <main className="analytics-content">

          <div className="analytics-loading">

            <div className="analytics-loading-icon">

              <Icon
                name="bi-bar-chart-fill"
              />

            </div>

            <h2>
              Loading Analytics
            </h2>

            <p>
              Preparing your laboratory insights...
            </p>

            <div className="analytics-loader"></div>

          </div>

        </main>

      </div>

    );

  }


  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (

    <div className="analytics-wrapper">

      <aside className="sidebar">
        <Sidebar />
      </aside>


      <main className="analytics-content">


        {/* HEADER */}

        <header className="analytics-header">

          <div className="analytics-header-left">

            <div className="analytics-header-icon">

              <Icon
                name="bi-bar-chart-fill"
              />

            </div>


            <div>

              <h1>
                Analytics
              </h1>

              <p>
                Insights into your laboratory activity
              </p>

            </div>

          </div>


          <button
            className="analytics-profile"
            onClick={() =>
              navigate("/profile")
            }
            title="My Profile"
          >

            <Icon
              name="bi-person-fill"
            />

          </button>

        </header>


        {/* BODY */}

        <div className="analytics-body">


          {/* =================================================
              RESEARCHER
          ================================================= */}

          {data?.viewType === "RESEARCHER" && (

            <>

              <section className="analytics-intro">

                <div>

                  <span>
                    PERSONAL INSIGHTS
                  </span>

                  <h2>
                    Your Laboratory Activity
                  </h2>

                  <p>
                    Track your equipment usage and
                    discover your most frequently
                    booked laboratory resources.
                  </p>

                </div>


                <div className="intro-icon purple">

                  <Icon
                    name="bi-person-workspace"
                  />

                </div>

              </section>


              <div className="analytics-stat-grid">

                <StatCard
                  icon="bi-calendar-check-fill"
                  label="TOTAL BOOKINGS"
                  value={data.myTotalBookings ?? 0}
                  description="Bookings made by you"
                  gradient="linear-gradient(135deg, #2563eb, #1d4ed8)"
                  glow="rgba(37,99,235,0.35)"
                />


                <StatCard
                  icon="bi-clock-fill"
                  label="HOURS USED"
                  value={data.myTotalUsageHours ?? 0}
                  description="Total equipment usage"
                  gradient="linear-gradient(135deg, #059669, #047857)"
                  glow="rgba(5,150,105,0.35)"
                />

              </div>


              <section className="analytics-panel">

                <div className="analytics-panel-header">

                  <div className="panel-title-icon blue">

                    <Icon
                      name="bi-star-fill"
                    />

                  </div>


                  <div>

                    <h3>
                      Your Most-Booked Equipment
                    </h3>

                    <p>
                      Laboratory equipment you use most frequently
                    </p>

                  </div>


                  <div className="panel-badge">

                    <Icon
                      name="bi-graph-up-arrow"
                    />

                    Personal

                  </div>

                </div>


                {data.myFavoriteEquipment?.length === 0 ? (

                  <div className="analytics-empty">

                    <div>
                      <Icon
                        name="bi-box-seam"
                      />
                    </div>

                    <h3>
                      No bookings yet
                    </h3>

                    <p>
                      Start booking equipment to see
                      your analytics here.
                    </p>

                  </div>

                ) : (

                  <div className="equipment-list">

                    {data.myFavoriteEquipment.map(
                      (equipment, index) => (

                        <EquipmentCard
                          key={index}
                          equipment={equipment}
                          index={index}
                        />

                      )
                    )}

                  </div>

                )}

              </section>


              <UsageHistory
                history={data.myUsageHistory}
              />

              <ResearcherResourceOverview
                availableCount={availableCount}
                waitlistCount={waitlistCount}
                unreadCount={unreadCount}
                onNavigate={navigate}
              />

            </>

          )}


          {/* =================================================
              ADMIN / LAB MANAGER
          ================================================= */}

          {data?.viewType === "ADMIN" && (

            <>

              <section className="analytics-intro">

                <div>

                  <span>
                    LAB MANAGER INSIGHTS
                  </span>

                  <h2>
                    Laboratory Performance
                  </h2>

                  <p>
                    Monitor equipment, bookings,
                    utilization and maintenance activity
                    across your laboratory.
                  </p>

                </div>


                <div className="intro-icon teal">

                  <Icon
                    name="bi-speedometer2"
                  />

                </div>

              </section>


              <div className="analytics-stat-grid admin-grid">

                <StatCard
                  icon="bi-box-seam-fill"
                  label="EQUIPMENT"
                  value={
  data.organizationTotalEquipment ?? 0
}
                  description="Registered equipment"
                  gradient="linear-gradient(135deg, #2563eb, #4f46e5)"
                  glow="rgba(37,99,235,0.35)"
                />


                <StatCard
                  icon="bi-calendar-check-fill"
                  label="TOTAL BOOKINGS"
                  value={
  data.organizationTotalBookings ?? 0
}
                  description="Bookings across laboratory"
                  gradient="linear-gradient(135deg, #059669, #0f766e)"
                  glow="rgba(5,150,105,0.35)"
                />


                <StatCard
                  icon="bi-speedometer"
                  label="AVG UTILIZATION"
                  value={
  `${data.organizationAvgUtilization ?? 0}%`
}
                  description="Equipment utilization"
                  gradient="linear-gradient(135deg, #7c3aed, #9333ea)"
                  glow="rgba(124,58,237,0.35)"
                />


                <StatCard
                  icon="bi-tools"
                  label="OPEN WORK ORDERS"
                  value={
                    data.institutionOpenWorkOrders ?? 0
                  }
                  description="Maintenance requiring attention"
                  gradient="linear-gradient(135deg, #dc2626, #ea580c)"
                  glow="rgba(220,38,38,0.35)"
                />

              </div>


              {/* BOOKING PERFORMANCE */}

              <BookingAnalytics
                data={data}
              />

              <ManagerUtilizationHeatmap />

              <section className="analytics-panel">
                <div className="analytics-panel-header">
                  <div className="panel-title-icon orange">
                    <Icon name="bi-tools" />
                  </div>

                  <div>
                    <h3>Maintenance & Resource Sharing</h3>
                    <p>
                      Maintenance workload and sharing requests
                      requiring attention
                    </p>
                  </div>

                  <div className="panel-badge orange-badge">
                    <Icon name="bi-shield-check" />
                    Operations
                  </div>
                </div>

                <div className="booking-metrics-grid">
                  <BookingMetricCard
                    icon="bi-tools"
                    title="OPEN WORK ORDERS"
                    value={data.institutionOpenWorkOrders ?? 0}
                    description="Maintenance requiring attention"
                    gradient="linear-gradient(135deg, #dc2626 0%, #ea580c 100%)"
                  />

                  <BookingMetricCard
                    icon="bi-hourglass-split"
                    title="PENDING SHARING"
                    value={
                      data.institutionPendingSharingRequests ?? 0
                    }
                    description="Sharing requests awaiting approval"
                    gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                  />

                  <BookingMetricCard
                    icon="bi-check-circle-fill"
                    title="APPROVED SHARING"
                    value={
                      data.institutionApprovedSharingRequests ?? 0
                    }
                    description="Approved sharing requests"
                    gradient="linear-gradient(135deg, #059669 0%, #0d9488 100%)"
                  />

                  <BookingMetricCard
                    icon="bi-share-fill"
                    title="TOTAL SHARING"
                    value={data.institutionSharingRequests ?? 0}
                    description="All sharing requests"
                    gradient="linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)"
                  />
                </div>
              </section>


              {/* TOP EQUIPMENT */}

              <section className="analytics-panel top-equipment-panel">

                <div className="analytics-panel-header">

                  <div className="panel-title-icon orange">

                    <Icon
                      name="bi-trophy-fill"
                    />

                  </div>


                  <div>

                    <h3>
                      Top Equipment by Bookings
                    </h3>

                    <p>
                      Most requested equipment across the laboratory
                    </p>

                  </div>


                  <div className="panel-badge orange-badge">

                    <Icon
                      name="bi-fire"
                    />

                    High Demand

                  </div>

                </div>


                {data.institutionTopEquipment?.length === 0 ? (

                  <div className="analytics-empty">

                    <div>

                      <Icon
                        name="bi-box-seam"
                      />

                    </div>

                    <h3>
                      No booking data
                    </h3>

                    <p>
                      Equipment booking activity
                      will appear here.
                    </p>

                  </div>

                ) : (

                  <div className="equipment-list">

                    {data.institutionTopEquipment.map(
                      (equipment, index) => (

                        <EquipmentCard
                          key={index}
                          equipment={equipment}
                          index={index}
                        />

                      )
                    )}

                  </div>

                )}

              </section>

            </>

          )}


          {/* =================================================
              SYSTEM ADMIN
          ================================================= */}

          {data?.viewType === "SYSTEM" && (

            <>

              <section className="analytics-intro">

                <div>

                  <span>
                    SYSTEM OVERVIEW
                  </span>

                  <h2>
                    Platform Analytics
                  </h2>

                  <p>
                    High-level insights across the
                    entire laboratory resource platform.
                  </p>

                </div>


                <div className="intro-icon red">

                  <Icon
                    name="bi-globe2"
                  />

                </div>

              </section>


              <div className="analytics-stat-grid system-grid">

                <StatCard
                  icon="bi-buildings-fill"
                  label="INSTITUTIONS"
                  value={
                    data.systemTotalInstitutions ?? 0
                  }
                  description="Connected institutions"
                  gradient="linear-gradient(135deg, #2563eb, #4f46e5)"
                  glow="rgba(37,99,235,0.35)"
                />


                <StatCard
                  icon="bi-box-seam-fill"
                  label="TOTAL EQUIPMENT"
                  value={
                    data.systemTotalEquipment ?? 0
                  }
                  description="Equipment registered"
                  gradient="linear-gradient(135deg, #059669, #0f766e)"
                  glow="rgba(5,150,105,0.35)"
                />


                <StatCard
                  icon="bi-calendar2-check-fill"
                  label="TOTAL BOOKINGS"
                  value={
                    data.systemTotalBookings ?? 0
                  }
                  description="Platform-wide bookings"
                  gradient="linear-gradient(135deg, #7c3aed, #9333ea)"
                  glow="rgba(124,58,237,0.35)"
                />


                <StatCard
                  icon="bi-arrow-left-right"
                  label="CROSS-INSTITUTION"
                  value={
                    data.systemCrossInstitutionBookings ?? 0
                  }
                  description="Shared resource bookings"
                  gradient="linear-gradient(135deg, #dc2626, #ea580c)"
                  glow="rgba(220,38,38,0.35)"
                />

              </div>


              <section className="system-insight-panel">

                <div className="system-insight-icon">

                  <Icon
                    name="bi-stars"
                  />

                </div>


                <div>

                  <span>
                    PLATFORM OVERVIEW
                  </span>

                  <h3>
                    Resource sharing at a glance
                  </h3>

                  <p>

                    Your platform is currently
                    connecting{" "}

                    <strong>
                      {data.systemTotalInstitutions ?? 0}
                    </strong>{" "}

                    institutions with{" "}

                    <strong>
                      {data.systemTotalEquipment ?? 0}
                    </strong>{" "}

                    pieces of laboratory equipment
                    and{" "}

                    <strong>
                      {data.systemTotalBookings ?? 0}
                    </strong>{" "}

                    bookings.

                  </p>

                </div>

              </section>

            </>

          )}
{/* =================================================
    INSTITUTION ADMINISTRATOR
================================================= */}

{data?.viewType === "INSTITUTION_ADMIN" && (

  <>

    {/* =================================================
        INTRO
    ================================================= */}

    <section className="analytics-intro">

      <div>

        <span>
          INSTITUTION ADMINISTRATOR INSIGHTS
        </span>

        <h2>
          Institution Analytics
        </h2>

        <p>
          Monitor organization-wide utilization,
          resource sharing, costs and equipment lifecycle.
        </p>

      </div>

      <div className="intro-icon purple">

        <Icon
          name="bi-building-fill"
        />

      </div>

    </section>


    {/* =================================================
        MAIN STATISTICS
    ================================================= */}

    <div className="analytics-stat-grid admin-grid">

      <StatCard
        icon="bi-box-seam-fill"
        label="TOTAL EQUIPMENT"
        value={
          data.organizationTotalEquipment ?? 0
        }
        description="Equipment across institution"
        gradient="linear-gradient(135deg, #2563eb, #4f46e5)"
        glow="rgba(37,99,235,0.35)"
      />


      <StatCard
        icon="bi-calendar2-check-fill"
        label="TOTAL BOOKINGS"
        value={
          data.organizationTotalBookings ?? 0
        }
        description="Bookings across institution"
        gradient="linear-gradient(135deg, #059669, #0f766e)"
        glow="rgba(5,150,105,0.35)"
      />


      <StatCard
        icon="bi-speedometer2"
        label="AVG UTILIZATION"
        value={
          `${data.organizationAvgUtilization ?? 0}%`
        }
        description="Organization-wide utilization"
        gradient="linear-gradient(135deg, #7c3aed, #9333ea)"
        glow="rgba(124,58,237,0.35)"
      />


      <StatCard
        icon="bi-graph-up-arrow"
        label="ESTIMATED ROI"
        value={
          `${data.organizationEstimatedROI ?? 0}%`
        }
        description="Estimated equipment return"
        gradient="linear-gradient(135deg, #dc2626, #ea580c)"
        glow="rgba(220,38,38,0.35)"
      />

    </div>


    {/* =================================================
        RESOURCE SHARING
    ================================================= */}

    <section className="analytics-panel">

      <div className="analytics-panel-header">

        <div className="panel-title-icon blue">

          <Icon
            name="bi-share-fill"
          />

        </div>

        <div>

          <h3>
            Resource Sharing
          </h3>

          <p>
            Equipment sharing requests across the institution
          </p>

        </div>

        <div className="panel-badge">

          <Icon
            name="bi-diagram-3-fill"
          />

          Sharing

        </div>

      </div>


      <div className="booking-metrics-grid">

        <BookingMetricCard
          icon="bi-hourglass-split"
          title="PENDING"
          value={
            data.institutionPendingSharingRequests ?? 0
          }
          description="Requests awaiting approval"
          gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
        />


        <BookingMetricCard
          icon="bi-check-circle-fill"
          title="APPROVED"
          value={
            data.institutionApprovedSharingRequests ?? 0
          }
          description="Approved sharing requests"
          gradient="linear-gradient(135deg, #059669 0%, #0d9488 100%)"
        />


        <BookingMetricCard
          icon="bi-x-circle-fill"
          title="REJECTED"
          value={
            data.institutionRejectedSharingRequests ?? 0
          }
          description="Rejected sharing requests"
          gradient="linear-gradient(135deg, #dc2626 0%, #be123c 100%)"
        />


        <BookingMetricCard
          icon="bi-share-fill"
          title="TOTAL"
          value={
            data.institutionSharingRequests ?? 0
          }
          description="All sharing requests"
          gradient="linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)"
        />

      </div>

    </section>


    {/* =================================================
        PROCUREMENT & COST ANALYSIS
    ================================================= */}

    <section className="analytics-panel">

      <div className="analytics-panel-header">

        <div className="panel-title-icon orange">

          <Icon
            name="bi-cash-stack"
          />

        </div>

        <div>

          <h3>
            Procurement & Cost Analysis
          </h3>

          <p>
            Equipment investment and estimated usage value
          </p>

        </div>

        <div className="panel-badge orange-badge">

          <Icon
            name="bi-bar-chart-fill"
          />

          Financial

        </div>

      </div>


      <div className="analytics-stat-grid">

        <StatCard
          icon="bi-cart-check-fill"
          label="PURCHASE COST"
          value={
            `₹${Number(
              data.organizationTotalPurchaseCost ?? 0
            ).toLocaleString("en-IN")}`
          }
          description="Total equipment purchase cost"
          gradient="linear-gradient(135deg, #2563eb, #4f46e5)"
          glow="rgba(37,99,235,0.35)"
        />


        <StatCard
          icon="bi-graph-up"
          label="USAGE VALUE"
          value={
            `₹${Number(
              data.organizationEstimatedUsageValue ?? 0
            ).toLocaleString("en-IN")}`
          }
          description="Estimated value from usage"
          gradient="linear-gradient(135deg, #059669, #0f766e)"
          glow="rgba(5,150,105,0.35)"
        />


        <StatCard
          icon="bi-percent"
          label="ESTIMATED ROI"
          value={
            `${data.organizationEstimatedROI ?? 0}%`
          }
          description="Estimated return on investment"
          gradient="linear-gradient(135deg, #7c3aed, #9333ea)"
          glow="rgba(124,58,237,0.35)"
        />

      </div>

    </section>


    {/* =================================================
        EQUIPMENT LIFECYCLE
    ================================================= */}

    <section className="analytics-panel">

      <div className="analytics-panel-header">

        <div className="panel-title-icon teal">

          <Icon
            name="bi-arrow-repeat"
          />

        </div>

        <div>

          <h3>
            Equipment Lifecycle
          </h3>

          <p>
            Monitor equipment age, calibration and certification
          </p>

        </div>

        <div className="panel-badge">

          <Icon
            name="bi-tools"
          />

          Lifecycle

        </div>

      </div>


      <div className="analytics-stat-grid">

        <StatCard
          icon="bi-calendar3"
          label="AVERAGE AGE"
          value={
            `${(
              Array.isArray(data.organizationLifecycleEquipment) &&
              data.organizationLifecycleEquipment.length > 0
                ? data.organizationLifecycleEquipment.reduce(
                    (sum, item) => sum + (Number(item.ageYears) || 0),
                    0
                  ) / data.organizationLifecycleEquipment.length
                : 0
            ).toFixed(1)} yrs`
          }
          description="Average equipment age"
          gradient="linear-gradient(135deg, #2563eb, #4f46e5)"
          glow="rgba(37,99,235,0.35)"
        />


        <StatCard
          icon="bi-exclamation-triangle-fill"
          label="LIFECYCLE REVIEW"
          value={
            data.organizationOldEquipment ?? 0
          }
          description="Equipment older than 5 years"
          gradient="linear-gradient(135deg, #f97316, #ea580c)"
          glow="rgba(249,115,22,0.35)"
        />


        <StatCard
          icon="bi-wrench-adjustable-circle-fill"
          label="CALIBRATION DUE"
          value={
            data.institutionCalibrationDueSoon ?? 0
          }
          description="Due within 30 days"
          gradient="linear-gradient(135deg, #dc2626, #be123c)"
          glow="rgba(220,38,38,0.35)"
        />


        <StatCard
          icon="bi-patch-check-fill"
          label="CERTIFICATION EXPIRING"
          value={
            data.institutionCertificationExpiringSoon ?? 0
          }
          description="Expiring within 30 days"
          gradient="linear-gradient(135deg, #7c3aed, #9333ea)"
          glow="rgba(124,58,237,0.35)"
        />

      </div>

    </section>


    {/* =================================================
        TOP EQUIPMENT
    ================================================= */}

    <section className="analytics-panel top-equipment-panel">

      <div className="analytics-panel-header">

        <div className="panel-title-icon orange">

          <Icon
            name="bi-trophy-fill"
          />

        </div>

        <div>

          <h3>
            Top Equipment by Bookings
          </h3>

          <p>
            Most requested equipment across the institution
          </p>

        </div>

        <div className="panel-badge orange-badge">

          <Icon
            name="bi-fire"
          />

          High Demand

        </div>

      </div>


      {data.institutionTopEquipment?.length === 0 ? (

        <div className="analytics-empty">

          <div>

            <Icon
              name="bi-box-seam"
            />

          </div>

          <h3>
            No booking data
          </h3>

          <p>
            Equipment booking activity will appear here.
          </p>

        </div>

      ) : (

        <div className="equipment-list">

          {data.institutionTopEquipment?.map(
            (equipment, index) => (

              <EquipmentCard
                key={index}
                equipment={equipment}
                index={index}
              />

            )
          )}

        </div>

      )}

    </section>

  </>

)}

          {/* =================================================
              NO DATA
          ================================================= */}

          {!data?.viewType && (

            <div className="analytics-no-data">

              <div className="no-data-icon">

                <Icon
                  name="bi-bar-chart-line"
                />

              </div>

              <h2>
                No Analytics Available
              </h2>

              <p>
                No analytics data is available
                for this account.
              </p>

            </div>

          )}

        </div>

      </main>

    </div>

  );
}