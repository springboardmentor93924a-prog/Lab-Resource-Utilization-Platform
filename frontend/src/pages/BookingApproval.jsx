import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  getAllBookings,
  approveBooking,
  rejectBooking,
} from "../services/bookingService";
import { useNavigate } from "react-router-dom";
import { isAdmin } from "../utils/auth";
import "./BookingApproval.css";

export default function BookingApproval() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin()) {
      alert("You don't have permission to view this page.");
      navigate("/dashboard");
    }
  }, [navigate]);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
      alert("Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    try {
      await approveBooking(id);
      alert("Booking approved successfully.");
      loadBookings();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to approve booking."
      );
    }
  }

  async function handleReject(id) {
    try {
      await rejectBooking(id);
      alert("Booking rejected successfully.");
      loadBookings();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to reject booking."
      );
    }
  }

  function getStatusClass(status) {
    switch (status) {
      case "CONFIRMED":
        return "status-confirmed";

      case "CANCELLED":
        return "status-cancelled";

      case "COMPLETED":
        return "status-completed";

      case "PENDING":
        return "status-pending";

      default:
        return "status-default";
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case "CONFIRMED":
        return "bi-check-circle-fill";

      case "CANCELLED":
        return "bi-x-circle-fill";

      case "COMPLETED":
        return "bi-check2-all";

      case "PENDING":
        return "bi-hourglass-split";

      default:
        return "bi-circle";
    }
  }

  const pendingCount = bookings.filter(
    (booking) => booking.bookingStatus === "PENDING"
  ).length;

  const confirmedCount = bookings.filter(
    (booking) => booking.bookingStatus === "CONFIRMED"
  ).length;

  const completedCount = bookings.filter(
    (booking) => booking.bookingStatus === "COMPLETED"
  ).length;

  return (
    <div className="booking-approval-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">
        <Sidebar />
      </aside>

      {/* ================= MAIN ================= */}

      <main className="booking-approval-content">

        {/* ================= HERO ================= */}

        <section className="approval-hero">

          <div className="hero-glow glow-one"></div>
          <div className="hero-glow glow-two"></div>

          <div className="approval-hero-icon">
            <i className="bi bi-shield-check"></i>
            <span className="spark spark-one">✦</span>
            <span className="spark spark-two">✧</span>
          </div>

          <div className="approval-hero-text">
            <div className="hero-label">
              <i className="bi bi-stars"></i>
              MANAGEMENT CENTER
            </div>

            <h1>Booking Approval</h1>

            <p>
              Review and manage laboratory equipment
              reservation requests.
            </p>
          </div>

          <div className="approval-hero-orb">
            <i className="bi bi-calendar2-check"></i>
          </div>

        </section>


        {/* ================= STATISTICS ================= */}

        <section className="approval-stats">

          <div className="approval-stat-card stat-total">
            <div className="stat-icon">
              <i className="bi bi-calendar3"></i>
            </div>

            <div>
              <span className="stat-label">
                TOTAL BOOKINGS
              </span>

              <strong>{bookings.length}</strong>

              <small>All reservations</small>
            </div>
          </div>


          <div className="approval-stat-card stat-pending">
            <div className="stat-icon">
              <i className="bi bi-hourglass-split"></i>
            </div>

            <div>
              <span className="stat-label">
                PENDING
              </span>

              <strong>{pendingCount}</strong>

              <small>Awaiting approval</small>
            </div>
          </div>


          <div className="approval-stat-card stat-confirmed">
            <div className="stat-icon">
              <i className="bi bi-patch-check-fill"></i>
            </div>

            <div>
              <span className="stat-label">
                CONFIRMED
              </span>

              <strong>{confirmedCount}</strong>

              <small>Approved bookings</small>
            </div>
          </div>


          <div className="approval-stat-card stat-completed">
            <div className="stat-icon">
              <i className="bi bi-check2-all"></i>
            </div>

            <div>
              <span className="stat-label">
                COMPLETED
              </span>

              <strong>{completedCount}</strong>

              <small>Finished bookings</small>
            </div>
          </div>

        </section>


        {/* ================= SECTION HEADER ================= */}

        <section className="approval-section-header">

          <div className="section-title-area">

            <div className="section-icon">
              <i className="bi bi-inboxes-fill"></i>
            </div>

            <div>
              <h2>Reservation Requests</h2>

              <p>
                Review incoming laboratory equipment bookings
              </p>
            </div>

          </div>

          <div className="booking-count-badge">
            <i className="bi bi-layers-fill"></i>
            {bookings.length} Bookings
          </div>

        </section>


        {/* ================= LOADING ================= */}

        {loading && (
          <div className="approval-loading">

            <div className="loading-orbit">
              <i className="bi bi-arrow-repeat"></i>
            </div>

            <h3>Loading reservations...</h3>

            <p>
              Gathering the latest booking requests.
            </p>

          </div>
        )}


        {/* ================= BOOKINGS ================= */}

        {!loading && (

          <div className="approval-table-card">

            {bookings.length === 0 ? (

              <div className="no-bookings">

                <div className="empty-icon">
                  <i className="bi bi-calendar-x"></i>
                </div>

                <h3>No bookings found</h3>

                <p>
                  There are currently no equipment reservations.
                </p>

              </div>

            ) : (

              <div className="approval-table-wrapper">

                <table className="booking-table">

                  <thead>
                    <tr>

                      <th>
                        <span>
                          <i className="bi bi-hash"></i>
                          ID
                        </span>
                      </th>

                      <th>
                        <span>
                          <i className="bi bi-person-circle"></i>
                          USER
                        </span>
                      </th>

                      <th>
                        <span>
                          <i className="bi bi-cpu"></i>
                          EQUIPMENT
                        </span>
                      </th>

                      <th>
                        <span>
                          <i className="bi bi-calendar-event"></i>
                          BOOKING DATE
                        </span>
                      </th>

                      <th>
                        <span>
                          <i className="bi bi-activity"></i>
                          STATUS
                        </span>
                      </th>

                      <th>
                        <span>
                          <i className="bi bi-lightning-charge"></i>
                          ACTION
                        </span>
                      </th>

                    </tr>
                  </thead>


                  <tbody>

                    {bookings.map((booking) => (

                      <tr key={booking.id}>

                        {/* ID */}

                        <td>
                          <div className="booking-id">
                            #{booking.id}
                          </div>
                        </td>


                        {/* USER */}

                        <td>

                          <div className="user-cell">

                            <div className="user-avatar">
                              <i className="bi bi-person-fill"></i>
                            </div>

                            <div>
                              <strong>
                                {booking.userFullName}
                              </strong>

                              <small>
                                Reservation requester
                              </small>
                            </div>

                          </div>

                        </td>


                        {/* EQUIPMENT */}

                        <td>

                          <div className="equipment-cell">

                            <div className="equipment-icon">
                              <i className="bi bi-cpu-fill"></i>
                            </div>

                            <div>
                              <strong>
                                {booking.equipmentName}
                              </strong>

                              <small>
                                Laboratory equipment
                              </small>
                            </div>

                          </div>

                        </td>


                        {/* DATE */}

                        <td>

                          <div className="date-cell">

                            <div className="date-icon">
                              <i className="bi bi-calendar3"></i>
                            </div>

                            <div>
                              <strong>
                                {booking.bookingDate}
                              </strong>

                              <small>
                                Requested date
                              </small>
                            </div>

                          </div>

                        </td>


                        {/* STATUS */}

                        <td>

                          <div
                            className={`booking-status ${getStatusClass(
                              booking.bookingStatus
                            )}`}
                          >

                            <i
                              className={`bi ${getStatusIcon(
                                booking.bookingStatus
                              )}`}
                            ></i>

                            {booking.bookingStatus}

                          </div>

                        </td>


                        {/* ACTION */}

                        <td>

                          {booking.bookingStatus ===
                          "PENDING" ? (

                            <div className="approval-actions">

                              <button
                                className="approve-button"
                                onClick={() =>
                                  handleApprove(
                                    booking.id
                                  )
                                }
                              >

                                <i className="bi bi-check-lg"></i>

                                <span>
                                  Approve
                                </span>

                              </button>


                              <button
                                className="reject-button"
                                onClick={() =>
                                  handleReject(
                                    booking.id
                                  )
                                }
                              >

                                <i className="bi bi-x-lg"></i>

                                <span>
                                  Reject
                                </span>

                              </button>

                            </div>

                          ) : (

                            <div className="no-action">
                              <i className="bi bi-shield-check"></i>
                              Reviewed
                            </div>

                          )}

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        )}

      </main>

    </div>
  );
}