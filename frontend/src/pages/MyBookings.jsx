import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  getBookingsByUser,
  cancelBooking,
} from "../services/bookingService";

import { getCurrentUserId } from "../utils/auth";

import "./MyBookings.css";

export default function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =========================================================
  // LOAD BOOKINGS
  // =========================================================

  useEffect(() => {
    const userId = getCurrentUserId();

    getBookingsByUser(userId)
      .then((data) => {
        setBookings(data);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Failed to load bookings"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // =========================================================
  // REFRESH BOOKINGS
  // =========================================================

  async function refreshBookings() {
    try {
      const userId = getCurrentUserId();

      const data = await getBookingsByUser(userId);

      setBookings(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load bookings"
      );
    }
  }

  // =========================================================
  // CANCEL BOOKING
  // =========================================================

  async function handleCancel(id) {
    if (!window.confirm("Cancel this booking?")) return;

    try {
      await cancelBooking(id);

      alert("Booking cancelled.");

      await refreshBookings();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to cancel booking."
      );
    }
  }

  // =========================================================
  // STATUS CONFIG
  // =========================================================

  function getStatusConfig(status) {
    switch (status) {
      case "CONFIRMED":
        return {
          color: "#16a34a",
          light: "#dcfce7",
          border: "#86efac",
          icon: "bi-check-circle-fill",
          label: "Confirmed",
        };

      case "PENDING":
        return {
          color: "#d97706",
          light: "#fef3c7",
          border: "#fcd34d",
          icon: "bi-hourglass-split",
          label: "Pending",
        };

      case "CANCELLED":
        return {
          color: "#64748b",
          light: "#e2e8f0",
          border: "#cbd5e1",
          icon: "bi-x-circle-fill",
          label: "Cancelled",
        };

      case "COMPLETED":
        return {
          color: "#475569",
          light: "#f1f5f9",
          border: "#cbd5e1",
          icon: "bi-check2-all",
          label: "Completed",
        };

      default:
        return {
          color: "#7c3aed",
          light: "#ede9fe",
          border: "#c4b5fd",
          icon: "bi-info-circle-fill",
          label: status || "Unknown",
        };
    }
  }

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="my-bookings-wrapper">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">
        <Sidebar />
      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="my-bookings-content">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="my-bookings-header">

          <div className="my-bookings-title-area">

            <div className="my-bookings-title-icon">
              <i className="bi bi-calendar2-check-fill"></i>
            </div>

            <div>
              <h2>My Bookings</h2>

              <p>
                Manage and track your laboratory reservations
              </p>
            </div>

          </div>


          <div className="my-bookings-header-right">

            {/* SEARCH */}

            <div className="booking-search-wrapper">

              <i className="bi bi-search"></i>

              <input
                type="text"
                placeholder="Search bookings..."
                className="my-bookings-search"
              />

            </div>


            {/* PROFILE */}

            <button
              className="profile-circle"
              onClick={() => navigate("/profile")}
              title="My Profile"
              aria-label="My Profile"
            >
              <i className="bi bi-person-fill"></i>
            </button>

          </div>

        </header>


        {/* ===================================================
            PAGE BODY
        =================================================== */}

        <div className="my-bookings-body">


          {/* =================================================
              HERO / SUMMARY
          ================================================= */}

          <section className="bookings-summary-card">

            <div className="summary-glow summary-glow-one"></div>
            <div className="summary-glow summary-glow-two"></div>

            <div className="summary-left">

              <div className="summary-icon">
                <i className="bi bi-calendar-check-fill"></i>
              </div>

              <div>
                <span className="summary-label">
                  YOUR RESERVATIONS
                </span>

                <h1>
                  {bookings.length}
                  <span> bookings</span>
                </h1>

                <p>
                  Keep track of your laboratory equipment
                  reservations in one place.
                </p>
              </div>

            </div>


            <div className="summary-stats">

              <div className="summary-stat">
                <span className="summary-stat-icon blue">
                  <i className="bi bi-calendar-event-fill"></i>
                </span>

                <div>
                  <strong>{bookings.length}</strong>
                  <small>Total</small>
                </div>
              </div>


              <div className="summary-stat">
                <span className="summary-stat-icon green">
                  <i className="bi bi-check-circle-fill"></i>
                </span>

                <div>
                  <strong>
                    {
                      bookings.filter(
                        (b) => b.bookingStatus === "CONFIRMED"
                      ).length
                    }
                  </strong>

                  <small>Confirmed</small>
                </div>
              </div>


              <div className="summary-stat">
                <span className="summary-stat-icon orange">
                  <i className="bi bi-hourglass-split"></i>
                </span>

                <div>
                  <strong>
                    {
                      bookings.filter(
                        (b) => b.bookingStatus === "PENDING"
                      ).length
                    }
                  </strong>

                  <small>Pending</small>
                </div>
              </div>

            </div>

          </section>


          {/* =================================================
              SECTION HEADER
          ================================================= */}

          <div className="bookings-section-header">

            <div>

              <div className="section-title-row">

                <span className="section-title-icon">
                  <i className="bi bi-journal-bookmark-fill"></i>
                </span>

                <h3>Your Reservations</h3>

              </div>

              <p>
                View your upcoming and previous equipment bookings
              </p>

            </div>


            <div className="booking-count-badge">
              <i className="bi bi-layers-fill"></i>

              {bookings.length} Booking
              {bookings.length !== 1 ? "s" : ""}
            </div>

          </div>


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (

            <div className="special-state loading-state">

              <div className="state-icon spinning">
                <i className="bi bi-arrow-repeat"></i>
              </div>

              <h3>Loading your bookings...</h3>

              <p>
                Fetching your latest laboratory reservations.
              </p>

            </div>

          )}


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="special-state error-state">

              <div className="state-icon">
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>

              <h3>Unable to load bookings</h3>

              <p>{error}</p>

              <button
                className="retry-btn"
                onClick={() => window.location.reload()}
              >
                <i className="bi bi-arrow-clockwise"></i>
                Try Again
              </button>

            </div>

          )}


          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {!loading &&
            !error &&
            bookings.length === 0 && (

              <div className="special-state empty-bookings-state">

                <div className="empty-decoration empty-one"></div>
                <div className="empty-decoration empty-two"></div>

                <div className="empty-booking-icon">

                  <i className="bi bi-calendar-x-fill"></i>

                </div>

                <h3>No bookings yet</h3>

                <p>
                  You don't have any laboratory equipment
                  reservations right now.
                </p>

                <button
                  className="browse-equipment-btn"
                  onClick={() => navigate("/bookings")}
                >
                  <i className="bi bi-search"></i>
                  Browse Equipment
                </button>

              </div>

            )}


          {/* =================================================
              BOOKINGS
          ================================================= */}

          {!loading &&
            !error &&
            bookings.length > 0 && (

              <div className="booking-list">

                {bookings.map((b, index) => {

                  const status = getStatusConfig(
                    b.bookingStatus
                  );

                  return (

                    <article
                      className="booking-item"
                      key={b.id}
                    >

                      {/* =====================================
                          CARD DECORATION
                      ===================================== */}

                      <div className="booking-card-glow"></div>


                      {/* =====================================
                          EQUIPMENT ICON
                      ===================================== */}

                      <div className="booking-equipment-icon">

                        <i className="bi bi-cpu-fill"></i>

                      </div>


                      {/* =====================================
                          BOOKING INFORMATION
                      ===================================== */}

                      <div className="booking-info">

                        <div className="equipment-heading">

                          <div>

                            <strong className="equipment-name">
                              {b.equipmentName}
                            </strong>

                            <span className="booking-number">
                              Reservation #{index + 1}
                            </span>

                          </div>


                          {b.priorityBooking && (

                            <span className="priority">

                              <i className="bi bi-star-fill"></i>

                              Priority

                            </span>

                          )}

                        </div>


                        {/* DATE + TIME */}

                        <div className="booking-details-row">

                          <div className="booking-detail">

                            <span className="detail-icon blue">
                              <i className="bi bi-calendar3"></i>
                            </span>

                            <div>
                              <small>Date</small>

                              <strong>
                                {b.bookingDate}
                              </strong>
                            </div>

                          </div>


                          <div className="booking-detail">

                            <span className="detail-icon purple">
                              <i className="bi bi-clock-fill"></i>
                            </span>

                            <div>
                              <small>Time</small>

                              <strong>
                                {b.startTime} – {b.endTime}
                              </strong>
                            </div>

                          </div>

                        </div>


                        {/* PURPOSE */}

                        <div className="booking-purpose-box">

                          <span className="purpose-icon">
                            <i className="bi bi-pencil-square"></i>
                          </span>

                          <div>

                            <small>Purpose / Notes</small>

                            <p>
                              {b.purpose ||
                                "No purpose or notes provided."}
                            </p>

                          </div>

                        </div>

                      </div>


                      {/* =====================================
                          ACTIONS
                      ===================================== */}

                      <div className="booking-actions">

                        {/* STATUS */}

                        <div
                          className="booking-status"
                          style={{
                            background: status.light,
                            color: status.color,
                            borderColor: status.border,
                          }}
                        >

                          <i
                            className={`bi ${status.icon}`}
                          ></i>

                          {status.label}

                        </div>


                        {/* CANCEL */}

                        {(b.bookingStatus === "PENDING" ||
                          b.bookingStatus === "CONFIRMED") && (

                          <button
                            className="cancel-booking-btn"
                            onClick={() =>
                              handleCancel(b.id)
                            }
                          >

                            <i className="bi bi-x-lg"></i>

                            Cancel

                          </button>

                        )}

                      </div>

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