import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getMyAnalytics } from "../services/analyticsService";

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
   ANALYTICS PAGE
========================================================= */

export default function Analytics() {

  const navigate = useNavigate();

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


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
                    data.institutionTotalEquipment ?? 0
                  }
                  description="Registered equipment"
                  gradient="linear-gradient(135deg, #2563eb, #4f46e5)"
                  glow="rgba(37,99,235,0.35)"
                />


                <StatCard
                  icon="bi-calendar-check-fill"
                  label="TOTAL BOOKINGS"
                  value={
                    data.institutionTotalBookings ?? 0
                  }
                  description="Bookings across laboratory"
                  gradient="linear-gradient(135deg, #059669, #0f766e)"
                  glow="rgba(5,150,105,0.35)"
                />


                <StatCard
                  icon="bi-speedometer"
                  label="AVG UTILIZATION"
                  value={
                    `${data.institutionAvgUtilization ?? 0}%`
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