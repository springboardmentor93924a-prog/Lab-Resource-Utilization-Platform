import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import { getMyWaitlistEntries } from "../services/waitlistService";

import "./MyWaitlist.css";


/* =========================================================
   STATUS CONFIGURATION
========================================================= */

function getStatusConfig(status) {

  switch (status) {

    case "NOTIFIED":
      return {
        color: "#16a34a",
        light: "#dcfce7",
        border: "#86efac",
        gradient:
          "linear-gradient(135deg, #16a34a, #15803d)",
        icon: "bi-bell-fill",
        label: "Notified",
      };


    case "EXPIRED":
      return {
        color: "#64748b",
        light: "#f1f5f9",
        border: "#cbd5e1",
        gradient:
          "linear-gradient(135deg, #64748b, #475569)",
        icon: "bi-clock-history",
        label: "Expired",
      };


    default:
      return {
        color: "#d97706",
        light: "#fef3c7",
        border: "#fcd34d",
        gradient:
          "linear-gradient(135deg, #f59e0b, #d97706)",
        icon: "bi-hourglass-split",
        label: "Waiting",
      };

  }
}


export default function MyWaitlist() {

  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);


  /* =======================================================
     LOAD WAITLIST
  ======================================================= */

  useEffect(() => {

    getMyWaitlistEntries()

      .then((data) => {
        setEntries(data);
      })

      .catch((err) => {
        console.error(
          "Failed to load waitlist entries:",
          err
        );
      })

      .finally(() => {
        setLoading(false);
      });

  }, []);


  /* =======================================================
     COUNTS
  ======================================================= */

  const notifiedCount =
    entries.filter(
      (entry) => entry.status === "NOTIFIED"
    ).length;


  const waitingCount =
    entries.filter(
      (entry) =>
        entry.status !== "NOTIFIED" &&
        entry.status !== "EXPIRED"
    ).length;


  const expiredCount =
    entries.filter(
      (entry) => entry.status === "EXPIRED"
    ).length;


  /* =======================================================
     RETURN
  ======================================================= */

  return (

    <div className="my-waitlist-wrapper">


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">
        <Sidebar />
      </aside>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="my-waitlist-content">


        {/* ===================================================
            PAGE HEADER
        =================================================== */}

        <header className="waitlist-header">

          <div className="waitlist-title-area">

            <div className="waitlist-title-icon">
              <i className="bi bi-hourglass-split"></i>
            </div>

            <div>

              <h2>My Waitlist</h2>

              <p>
                Track equipment availability and booking alerts
              </p>

            </div>

          </div>


          {/* PROFILE */}

          <button
            className="waitlist-profile"
            onClick={() => navigate("/profile")}
            title="My Profile"
          >
            <i className="bi bi-person-fill"></i>
          </button>

        </header>


        {/* ===================================================
            PAGE BODY
        =================================================== */}

        <div className="my-waitlist-body">


          {/* =================================================
              HERO SUMMARY
          ================================================= */}

          <section className="waitlist-hero">

            {/* Decorative circles */}

            <div className="hero-circle hero-circle-one"></div>

            <div className="hero-circle hero-circle-two"></div>

            <div className="hero-circle hero-circle-three"></div>


            <div className="hero-left">

              <div className="hero-icon">

                <i className="bi bi-hourglass-split"></i>

              </div>


              <div>

                <span className="hero-label">
                  WAITLIST MANAGEMENT
                </span>

                <h1>
                  {entries.length}
                  <span>
                    {" "}
                    active entr
                    {entries.length === 1 ? "y" : "ies"}
                  </span>
                </h1>

                <p>
                  We'll keep you informed when your
                  requested equipment becomes available.
                </p>

              </div>

            </div>


            {/* =================================================
                SUMMARY STATS
            ================================================= */}

            <div className="waitlist-stats">


              {/* WAITING */}

              <div className="waitlist-stat">

                <div className="stat-icon waiting-icon">
                  <i className="bi bi-hourglass-split"></i>
                </div>

                <div>

                  <strong>
                    {waitingCount}
                  </strong>

                  <small>
                    Waiting
                  </small>

                </div>

              </div>


              {/* NOTIFIED */}

              <div className="waitlist-stat">

                <div className="stat-icon notified-icon">
                  <i className="bi bi-bell-fill"></i>
                </div>

                <div>

                  <strong>
                    {notifiedCount}
                  </strong>

                  <small>
                    Notified
                  </small>

                </div>

              </div>


              {/* EXPIRED */}

              <div className="waitlist-stat">

                <div className="stat-icon expired-icon">
                  <i className="bi bi-clock-history"></i>
                </div>

                <div>

                  <strong>
                    {expiredCount}
                  </strong>

                  <small>
                    Expired
                  </small>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              SECTION HEADER
          ================================================= */}

          <div className="waitlist-section-header">

            <div>

              <div className="waitlist-section-title">

                <span>
                  <i className="bi bi-list-check"></i>
                </span>

                <h3>
                  Your Waitlist Entries
                </h3>

              </div>

              <p>
                Equipment requests you're currently tracking
              </p>

            </div>


            <div className="waitlist-count-badge">

              <i className="bi bi-layers-fill"></i>

              {entries.length} Entry
              {entries.length !== 1 ? "ies" : ""}

            </div>

          </div>


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (

            <div className="waitlist-special-state">

              <div className="waitlist-state-icon loading">

                <i className="bi bi-arrow-repeat"></i>

              </div>

              <h3>
                Loading your waitlist...
              </h3>

              <p>
                Checking your equipment availability requests.
              </p>

            </div>

          )}


          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading &&
            entries.length === 0 && (

              <div className="waitlist-special-state empty-state">

                <div className="empty-circle-one"></div>
                <div className="empty-circle-two"></div>

                <div className="empty-waitlist-icon">

                  <i className="bi bi-hourglass-bottom"></i>

                </div>

                <h3>
                  Your waitlist is empty
                </h3>

                <p>
                  You're not waiting for any laboratory
                  equipment right now.
                </p>

                <button
                  className="browse-equipment-btn"
                  onClick={() =>
                    navigate("/bookings")
                  }
                >

                  <i className="bi bi-search"></i>

                  Browse Equipment

                </button>

              </div>

            )}


          {/* =================================================
              WAITLIST ENTRIES
          ================================================= */}

          {!loading &&
            entries.length > 0 && (

              <div className="waitlist-grid">

                {entries.map((entry, index) => {

                  const status =
                    getStatusConfig(
                      entry.status
                    );


                  return (

                    <article
                      className={`waitlist-card ${entry.status.toLowerCase()}`}
                      key={entry.id}
                    >


                      {/* CARD GLOW */}

                      <div className="waitlist-card-glow"></div>


                      {/* TOP ACCENT */}

                      <div
                        className="waitlist-card-accent"
                        style={{
                          background:
                            status.gradient,
                        }}
                      ></div>


                      {/* =================================================
                          CARD HEADER
                      ================================================= */}

                      <div className="waitlist-card-header">


                        <div className="equipment-block">


                          {/* EQUIPMENT ICON */}

                          <div
                            className="waitlist-equipment-icon"
                            style={{
                              background:
                                status.gradient,
                            }}
                          >

                            <i className="bi bi-cpu-fill"></i>

                          </div>


                          <div>

                            <h3>
                              {entry.equipmentName}
                            </h3>

                            <span>
                              Waitlist entry #{index + 1}
                            </span>

                          </div>

                        </div>


                        {/* STATUS */}

                        <div
                          className="waitlist-status"
                          style={{
                            color: status.color,
                            background: status.light,
                            borderColor: status.border,
                          }}
                        >

                          <i
                            className={`bi ${status.icon}`}
                          ></i>

                          {status.label}

                        </div>

                      </div>


                      {/* =================================================
                          DATE / TIME
                      ================================================= */}

                      <div className="waitlist-details">


                        {/* DATE */}

                        <div className="waitlist-detail">

                          <div
                            className="waitlist-detail-icon date"
                          >
                            <i className="bi bi-calendar3"></i>
                          </div>

                          <div>

                            <small>
                              Requested Date
                            </small>

                            <strong>
                              {entry.requestedDate}
                            </strong>

                          </div>

                        </div>


                        {/* TIME */}

                        <div className="waitlist-detail">

                          <div
                            className="waitlist-detail-icon time"
                          >
                            <i className="bi bi-clock-fill"></i>
                          </div>

                          <div>

                            <small>
                              Requested Time
                            </small>

                            <strong>
                              {entry.startTime}
                              {" – "}
                              {entry.endTime}
                            </strong>

                          </div>

                        </div>

                      </div>


                      {/* =================================================
                          NOTIFIED MESSAGE
                      ================================================= */}

                      {entry.status === "NOTIFIED" && (

                        <div className="waitlist-notification">

                          <div className="notification-icon">

                            <i className="bi bi-bell-fill"></i>

                          </div>


                          <div>

                            <strong>
                              Your slot is available!
                            </strong>

                            <p>
                              A slot has opened up —
                              try booking again now.
                            </p>

                          </div>


                          <button
                            className="book-now-btn"
                            onClick={() =>
                              navigate("/bookings")
                            }
                          >

                            Book Now

                            <i className="bi bi-arrow-right"></i>

                          </button>

                        </div>

                      )}


                      {/* =================================================
                          WAITING MESSAGE
                      ================================================= */}

                      {entry.status !== "NOTIFIED" &&
                        entry.status !== "EXPIRED" && (

                          <div className="waiting-message">

                            <i className="bi bi-hourglass-split"></i>

                            <span>
                              Waiting for this equipment
                              to become available.
                            </span>

                          </div>

                        )}


                      {/* =================================================
                          EXPIRED MESSAGE
                      ================================================= */}

                      {entry.status === "EXPIRED" && (

                        <div className="expired-message">

                          <i className="bi bi-clock-history"></i>

                          <span>
                            This waitlist request has expired.
                          </span>

                        </div>

                      )}

                    </article>

                  );

                })}

              </div>

            )}

        </div>

      </main>

    </div>

  );
}