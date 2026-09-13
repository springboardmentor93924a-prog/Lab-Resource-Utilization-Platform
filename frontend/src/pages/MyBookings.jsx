import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getBookingsByUser, cancelBooking } from "../services/bookingService";
import { getCurrentUserId } from "../utils/auth";
import "./MyBookings.css";

export default function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const userId = getCurrentUserId();
      const data = await getBookingsByUser(userId);
      setBookings(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id) {
    if (!window.confirm("Cancel this booking?")) return;

    try {
      await cancelBooking(id);
      alert("Booking cancelled.");
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking.");
    }
  }

  return (
    <div className="my-bookings-wrapper my-bookings-page">

      <aside className="sidebar">
        <Sidebar />
      </aside>

      <main className="my-bookings-content">

        {/* HEADER */}
        <header className="my-bookings-header">
          <h2>My bookings</h2>

          <div className="my-bookings-header-right">

            <input
              type="text"
              placeholder="Search..."
              className="my-bookings-search"
            />

            <button
              className="profile-circle"
              onClick={() => navigate("/profile")}
              title="My Profile"
              aria-label="My Profile"
            >
              ðŸ‘¤
            </button>

          </div>
        </header>

        <div className="my-bookings-body">

          {loading && (
            <p className="loading-text">Loading bookings...</p>
          )}

          {error && (
            <p className="error-text">{error}</p>
          )}

          {!loading && !error && bookings.length === 0 && (
            <p className="empty-text">
              You have no bookings yet.
            </p>
          )}

          {!loading && !error && bookings.length > 0 && (
            <div className="booking-list">

              {bookings.map((b) => (

                <div className="booking-item" key={b.id}>

                  <div className="booking-info">

                    <strong className="equipment-name">
                      {b.equipmentName}
                    </strong>

                    <div className="booking-time">
                      {b.bookingDate}, {b.startTime}â€“{b.endTime}

                      {b.priorityBooking && (
                        <span className="priority">
                          â€¢ Priority
                        </span>
                      )}
                    </div>

                    <div className="booking-purpose">
                      {b.purpose}
                    </div>

                  </div>

                  <div className="booking-actions">

                    <span
                      className="booking-status"
                      style={{
                        background:
                          b.bookingStatus === "CANCELLED"
                            ? "#64748b"
                            : b.bookingStatus === "CONFIRMED"
                            ? "#16a34a"
                            : b.bookingStatus === "COMPLETED"
                            ? "#475569"
                            : "#f59e0b",
                      }}
                    >
                      {b.bookingStatus}
                    </span>

                    {(b.bookingStatus === "PENDING" ||
                      b.bookingStatus === "CONFIRMED") && (

                      <button
                        className="cancel-booking-btn"
                        onClick={() => handleCancel(b.id)}
                      >
                        Cancel
                      </button>

                    )}

                  </div>

                </div>

              ))}

            </div>
          )}

        </div>

      </main>

    </div>
  );
}
