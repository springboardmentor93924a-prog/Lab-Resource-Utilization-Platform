import { useEffect, useMemo, useState } from "react";
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
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      setError(null);

      const userId = getCurrentUserId();
      const data = await getBookingsByUser(userId);

      setBookings(data || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to load bookings"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id) {
    if (!window.confirm("Cancel this booking?")) return;

    try {
      await cancelBooking(id);
      alert("Booking cancelled.");
      await loadBookings();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to cancel booking."
      );
    }
  }

  function getStatusConfig(status) {
    switch (status) {
      case "CONFIRMED":
        return {
          icon: "bi-check-circle-fill",
          label: "Confirmed",
          className: "status-confirmed",
        };

      case "PENDING":
        return {
          icon: "bi-hourglass-split",
          label: "Pending",
          className: "status-pending",
        };

      case "CANCELLED":
        return {
          icon: "bi-x-circle-fill",
          label: "Cancelled",
          className: "status-cancelled",
        };

      case "COMPLETED":
        return {
          icon: "bi-check2-all",
          label: "Completed",
          className: "status-completed",
        };

      default:
        return {
          icon: "bi-info-circle-fill",
          label: status || "Unknown",
          className: "status-default",
        };
    }
  }

  const filteredBookings = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return bookings;

    return bookings.filter((booking) =>
      `${booking.equipmentName || ""} ${booking.purpose || ""} ${
        booking.bookingStatus || ""
      }`
        .toLowerCase()
        .includes(term)
    );
  }, [bookings, search]);

  const confirmedCount = bookings.filter(
    (b) => b.bookingStatus === "CONFIRMED"
  ).length;

  const pendingCount = bookings.filter(
    (b) => b.bookingStatus === "PENDING"
  ).length;

  return (
    <div className="my-bookings-wrapper">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <Sidebar />
      </aside>

      {/* MAIN */}
      <main className="my-bookings-content">

        {/* HEADER */}
        <header className="my-bookings-header">

          <div className="my-bookings-title-area">

            <div className="my-bookings-title-icon">
              <i className="bi bi-calendar2-check-fill"></i>
              <span className="title-sparkle">✦</span>
            </div>

            <div>
              <h2>My Bookings</h2>

              <p>
                Manage and track your laboratory reservations
              </p>
            </div>

          </div>

          <div className="my-bookings-header-right">

            <div className="booking-search-wrapper">
              <i className="bi bi-search"></i>

              <input
                type="text"
                placeholder="Search bookings..."
                className="my-bookings-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              className="profile-circle"
              onClick={() => navigate("/profile")}
              title="My Profile"
            >
              <i className="bi bi-person-fill"></i>
            </button>

          </div>
        </header>


        <div className="my-bookings-body">

          {/* SUMMARY */}
          <section className="bookings-summary-card">

            <div className="summary-orb summary-orb-one"></div>
            <div className="summary-orb summary-orb-two"></div>

            <div className="summary-left">

              <div className="summary-icon">
                <i className="bi bi-calendar-heart-fill"></i>
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

              <div className="summary-stat total-stat">
                <span className="summary-stat-icon">
                  <i className="bi bi-calendar-event-fill"></i>
                </span>

                <div>
                  <strong>{bookings.length}</strong>
                  <small>Total</small>
                </div>
              </div>

              <div className="summary-stat confirmed-stat">
                <span className="summary-stat-icon">
                  <i className="bi bi-check-circle-fill"></i>
                </span>

                <div>
                  <strong>{confirmedCount}</strong>
                  <small>Confirmed</small>
                </div>
              </div>

              <div className="summary-stat pending-stat">
                <span className="summary-stat-icon">
                  <i className="bi bi-hourglass-split"></i>
                </span>

                <div>
                  <strong>{pendingCount}</strong>
                  <small>Pending</small>
                </div>
              </div>

            </div>
          </section>


          {/* SECTION HEADER */}
          <div className="bookings-section-header">

            <div>
              <div className="section-title-row">

                <span className="section-title-icon">
                  <i className="bi bi-stars"></i>
                </span>

                <h3>Your Reservations</h3>

              </div>

              <p>
                View your upcoming and previous equipment bookings
              </p>
            </div>

            <div className="booking-count-badge">
              <i className="bi bi-layers-fill"></i>

              {filteredBookings.length} Booking
              {filteredBookings.length !== 1 ? "s" : ""}
            </div>

          </div>


          {/* LOADING */}
          {loading && (
            <div className="special-state loading-state">

              <div className="state-icon spinning">
                <i className="bi bi-stars"></i>
              </div>

              <h3>Loading your bookings...</h3>

              <p>
                Fetching your latest laboratory reservations.
              </p>

            </div>
          )}


          {/* ERROR */}
          {!loading && error && (
            <div className="special-state error-state">

              <div className="state-icon">
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>

              <h3>Unable to load bookings</h3>

              <p>{error}</p>

              <button
                className="retry-btn"
                onClick={loadBookings}
              >
                <i className="bi bi-arrow-clockwise"></i>
                Try Again
              </button>

            </div>
          )}


          {/* EMPTY */}
          {!loading &&
            !error &&
            filteredBookings.length === 0 && (
              <div className="special-state empty-bookings-state">

                <div className="empty-booking-icon">
                  <i className="bi bi-calendar-x-fill"></i>
                </div>

                <h3>
                  {search
                    ? "No matching bookings"
                    : "No bookings yet"}
                </h3>

                <p>
                  {search
                    ? "Try searching for another equipment or booking."
                    : "You don't have any laboratory equipment reservations right now."}
                </p>

                {!search && (
                  <button
                    className="browse-equipment-btn"
                    onClick={() => navigate("/bookings")}
                  >
                    <i className="bi bi-search"></i>
                    Browse Equipment
                  </button>
                )}

              </div>
            )}


          {/* BOOKINGS */}
          {!loading &&
            !error &&
            filteredBookings.length > 0 && (

              <div className="booking-list">

                {filteredBookings.map((b, index) => {

                  const status = getStatusConfig(
                    b.bookingStatus
                  );

                  return (
                    <article
                      className="booking-item"
                      key={b.id}
                    >

                      {/* CARD GLOW */}
                      <div className="booking-card-glow"></div>

                      <div className="booking-card-sparkle">
                        ✦
                      </div>


                      {/* EQUIPMENT ICON */}
                      <div className="booking-equipment-icon">
                        <i className="bi bi-cpu-fill"></i>
                      </div>


                      {/* INFORMATION */}
                      <div className="booking-info">

                        <div className="equipment-heading">

                          <div>
                            <strong className="equipment-name">
                              {b.equipmentName || "Equipment Name Unavailable"}
                            </strong>

                            <span className="booking-number">
                              Reservation #{index + 1}
                            </span>
                          </div>

                          {b.priorityBooking && (
                            <span className="priority">
                              <i className="bi bi-stars"></i>
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


                      {/* ACTIONS */}
                      <div className="booking-actions">

                        <div
                          className={`booking-status ${status.className}`}
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


                        {/* FEEDBACK BUTTON */}
                        {b.bookingStatus === "COMPLETED" && (

                          <button
                            className="give-feedback-btn"
                            onClick={() =>
                              navigate(
                                "/equipment-feedback",
                                {
                                  state: {
                                    bookingId: b.id,
                                    equipmentId:
                                      b.equipmentId,
                                    equipmentName:
                                      b.equipmentName,
                                  },
                                }
                              )
                            }
                            title="Give feedback"
                          >

                            <span className="feedback-btn-stars">
                              ✦
                            </span>

                            <span className="feedback-btn-icon">
                              <i className="bi bi-chat-heart-fill"></i>
                            </span>

                            <span className="feedback-btn-text">
                              Give
                              <br />
                              Feedback
                            </span>

                            <span className="feedback-btn-sparkle">
                              ✧
                            </span>

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