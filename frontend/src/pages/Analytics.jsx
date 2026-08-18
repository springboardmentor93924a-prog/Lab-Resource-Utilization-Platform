import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getMyAnalytics } from "../services/analyticsService";

import "./Analytics.css";


/* =========================================================
   ICON HELPER
========================================================= */

function Icon({ name }) {
  return <i className={`bi ${name}`}></i>;
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

      {/* Decorative circles */}
      <div className="analytics-card-circle circle-one"></div>
      <div className="analytics-card-circle circle-two"></div>

      {/* ICON */}

      <div className="analytics-stat-icon">
        <Icon name={icon} />
      </div>


      {/* CONTENT */}

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

      {/* RANK */}

      <div
        className="equipment-rank"
        style={{
          background: theme.gradient,
        }}
      >
        #{index + 1}
      </div>


      {/* ICON */}

      <div
        className="equipment-icon"
        style={{
          background: theme.gradient,
        }}
      >
        <Icon name={theme.icon} />
      </div>


      {/* NAME */}

      <div className="equipment-card-info">

        <strong>
          {equipment.equipmentName}
        </strong>

        <span>
          Equipment utilization
        </span>

      </div>


      {/* BOOKINGS */}

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
   ANALYTICS PAGE
========================================================= */

export default function Analytics() {

  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);


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

      } catch (err) {

        console.error(
          "Analytics error:",
          err
        );

      } finally {

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
              <Icon name="bi-bar-chart-fill" />
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


  return (

    <div className="analytics-wrapper">


      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside className="sidebar">
        <Sidebar />
      </aside>


      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <main className="analytics-content">


        {/* =================================================
            HEADER
        ================================================= */}

        <header className="analytics-header">

          <div className="analytics-header-left">

            <div className="analytics-header-icon">
              <Icon name="bi-bar-chart-fill" />
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


          {/* PROFILE */}

          <button
            className="analytics-profile"
            onClick={() =>
              navigate("/profile")
            }
            title="My Profile"
          >
            <Icon name="bi-person-fill" />
          </button>

        </header>


        {/* =================================================
            BODY
        ================================================= */}

        <div className="analytics-body">


          {/* =================================================
              RESEARCHER
          ================================================= */}

          {data?.viewType === "RESEARCHER" && (

            <>

              {/* PAGE INTRO */}

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
                  <Icon name="bi-person-workspace" />
                </div>

              </section>


              {/* STAT CARDS */}

              <div className="analytics-stat-grid">


                <StatCard
                  icon="bi-calendar-check-fill"
                  label="TOTAL BOOKINGS"
                  value={data.myTotalBookings}
                  description="Bookings made by you"
                  gradient="linear-gradient(135deg, #2563eb, #1d4ed8)"
                  glow="rgba(37,99,235,0.35)"
                />


                <StatCard
                  icon="bi-clock-fill"
                  label="HOURS USED"
                  value={data.myTotalUsageHours}
                  description="Total equipment usage"
                  gradient="linear-gradient(135deg, #059669, #047857)"
                  glow="rgba(5,150,105,0.35)"
                />

              </div>


              {/* FAVORITE EQUIPMENT */}

              <section className="analytics-panel">

                <div className="analytics-panel-header">

                  <div className="panel-title-icon blue">
                    <Icon name="bi-star-fill" />
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
                    <Icon name="bi-graph-up-arrow" />
                    Personal
                  </div>

                </div>


                {data.myFavoriteEquipment?.length === 0 ? (

                  <div className="analytics-empty">

                    <div>
                      <Icon name="bi-box-seam" />
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
                  <Icon name="bi-speedometer2" />
                </div>

              </section>


              {/* ADMIN STAT CARDS */}

              <div className="analytics-stat-grid admin-grid">


                <StatCard
                  icon="bi-box-seam-fill"
                  label="EQUIPMENT"
                  value={
                    data.institutionTotalEquipment
                  }
                  description="Registered equipment"
                  gradient="linear-gradient(135deg, #2563eb, #4f46e5)"
                  glow="rgba(37,99,235,0.35)"
                />


                <StatCard
                  icon="bi-calendar-check-fill"
                  label="TOTAL BOOKINGS"
                  value={
                    data.institutionTotalBookings
                  }
                  description="Bookings across laboratory"
                  gradient="linear-gradient(135deg, #059669, #0f766e)"
                  glow="rgba(5,150,105,0.35)"
                />


                <StatCard
                  icon="bi-speedometer"
                  label="AVG UTILIZATION"
                  value={
                    `${data.institutionAvgUtilization}%`
                  }
                  description="Equipment utilization"
                  gradient="linear-gradient(135deg, #7c3aed, #9333ea)"
                  glow="rgba(124,58,237,0.35)"
                />


                <StatCard
                  icon="bi-tools"
                  label="OPEN WORK ORDERS"
                  value={
                    data.institutionOpenWorkOrders
                  }
                  description="Maintenance requiring attention"
                  gradient="linear-gradient(135deg, #dc2626, #ea580c)"
                  glow="rgba(220,38,38,0.35)"
                />

              </div>


              {/* TOP EQUIPMENT */}

              <section className="analytics-panel">

                <div className="analytics-panel-header">

                  <div className="panel-title-icon orange">
                    <Icon name="bi-trophy-fill" />
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
                    <Icon name="bi-fire" />
                    High Demand
                  </div>

                </div>


                {data.institutionTopEquipment?.length ===
                0 ? (

                  <div className="analytics-empty">

                    <div>
                      <Icon name="bi-box-seam" />
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
                  <Icon name="bi-globe2" />
                </div>

              </section>


              {/* SYSTEM STATS */}

              <div className="analytics-stat-grid system-grid">


                <StatCard
                  icon="bi-buildings-fill"
                  label="INSTITUTIONS"
                  value={
                    data.systemTotalInstitutions
                  }
                  description="Connected institutions"
                  gradient="linear-gradient(135deg, #2563eb, #4f46e5)"
                  glow="rgba(37,99,235,0.35)"
                />


                <StatCard
                  icon="bi-box-seam-fill"
                  label="TOTAL EQUIPMENT"
                  value={
                    data.systemTotalEquipment
                  }
                  description="Equipment registered"
                  gradient="linear-gradient(135deg, #059669, #0f766e)"
                  glow="rgba(5,150,105,0.35)"
                />


                <StatCard
                  icon="bi-calendar2-check-fill"
                  label="TOTAL BOOKINGS"
                  value={
                    data.systemTotalBookings
                  }
                  description="Platform-wide bookings"
                  gradient="linear-gradient(135deg, #7c3aed, #9333ea)"
                  glow="rgba(124,58,237,0.35)"
                />


                <StatCard
                  icon="bi-arrow-left-right"
                  label="CROSS-INSTITUTION"
                  value={
                    data.systemCrossInstitutionBookings
                  }
                  description="Shared resource bookings"
                  gradient="linear-gradient(135deg, #dc2626, #ea580c)"
                  glow="rgba(220,38,38,0.35)"
                />

              </div>


              {/* SYSTEM INSIGHT */}

              <section className="system-insight-panel">

                <div className="system-insight-icon">

                  <Icon name="bi-stars" />

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
                      {data.systemTotalInstitutions}
                    </strong>{" "}
                    institutions with{" "}
                    <strong>
                      {data.systemTotalEquipment}
                    </strong>{" "}
                    pieces of laboratory equipment
                    and{" "}
                    <strong>
                      {data.systemTotalBookings}
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

                <Icon name="bi-bar-chart-line" />

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