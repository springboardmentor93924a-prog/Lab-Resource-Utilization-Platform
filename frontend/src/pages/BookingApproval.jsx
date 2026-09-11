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

  // Check admin permission
  useEffect(() => {
    if (!isAdmin()) {
      alert("You don't have permission to view this page.");
      navigate("/dashboard");
    }
  }, [navigate]);

  // Load bookings
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

  // Approve booking
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

  // Reject booking
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

  // Status colors
  function statusColor(status) {
    switch (status) {
      case "CONFIRMED":
        return "#22c55e";

      case "CANCELLED":
        return "#ef4444";

      case "COMPLETED":
        return "#94a3b8";

      case "PENDING":
        return "#f59e0b";

      default:
        return "#64748b";
    }
  }

  return (
    <div className="booking-approval-page">

      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        <Sidebar />
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="booking-approval-content">

        {/* PAGE TITLE */}
        <h2 className="booking-approval-title">
          Booking Approval
        </h2>

        {/* LOADING */}
        {loading && (
          <p className="booking-loading">
            Loading bookings...
          </p>
        )}

        {/* TABLE */}
        {!loading && (
          <div className="booking-table-container">

            <table className="booking-table">

              {/* TABLE HEADER */}
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Equipment</th>
                  <th>Booking Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody>

                {bookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="no-bookings"
                    >
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id}>

                      {/* ID */}
                      <td>
                        {booking.id}
                      </td>

                      {/* USER */}
                      <td>
                        {booking.userFullName}
                      </td>

                      {/* EQUIPMENT */}
                      <td>
                        {booking.equipmentName}
                      </td>

                      {/* BOOKING DATE */}
                      <td>
                        {booking.bookingDate}
                      </td>

                      {/* STATUS */}
                      <td>
                        <span
                          className="booking-status"
                          style={{
                            background:
                              statusColor(
                                booking.bookingStatus
                              ),
                          }}
                        >
                          {booking.bookingStatus}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td>

                        {booking.bookingStatus ===
                          "PENDING" && (
                          <>
                            <button
                              className="approve-button"
                              onClick={() =>
                                handleApprove(
                                  booking.id
                                )
                              }
                            >
                              Approve
                            </button>

                            <button
                              className="reject-button"
                              onClick={() =>
                                handleReject(
                                  booking.id
                                )
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}

                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>
        )}

      </main>
    </div>
  );
}
