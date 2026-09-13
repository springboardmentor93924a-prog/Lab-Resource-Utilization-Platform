import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD USER BOOKINGS
  // =========================================================

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setError("Please login to view your bookings.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);

      // AuthResponse uses userId
      const userId = user.userId || user.id;

      if (!userId) {
        setError("User information is missing. Please login again.");
        setLoading(false);
        return;
      }

      console.log("Loading bookings for user:", userId);

      const response = await api.get(
        `/bookings/user/${userId}`
      );

      console.log("Bookings response:", response.data);

      setBookings(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {
      console.error("Bookings API error:", err);

      setError(
        err.response?.data ||
        "Unable to load your bookings."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CANCEL BOOKING
  // =========================================================

  const handleCancel = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) {
      return;
    }

    setCancellingId(bookingId);
    setError("");
    setSuccess("");

    try {
      console.log(
        "Cancelling booking:",
        bookingId
      );

      const response = await api.put(
        `/bookings/${bookingId}/cancel`
      );

      console.log(
        "Cancel response:",
        response.data
      );

      setSuccess(
        "Booking cancelled successfully."
      );

      // Reload bookings
      await loadBookings();

    } catch (err) {
      console.error(
        "Cancel booking error:",
        err
      );

      setError(
        err.response?.data ||
        "Unable to cancel booking."
      );

    } finally {
      setCancellingId(null);
    }
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    if (!status) {
      return "";
    }

    return status
      .toLowerCase()
      .replaceAll("_", "-");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          Loading your bookings...
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="page-container my-bookings-page">

      <div className="page-header">

        <div>
          <h1>My Bookings</h1>

          <p>
            View and manage your equipment bookings.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => navigate("/equipment")}
        >
          + New Booking
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {/* NO BOOKINGS */}

      {bookings.length === 0 && !error && (
        <div className="empty-state">

          <div className="empty-icon">
            📅
          </div>

          <h2>No Bookings Found</h2>

          <p>
            You have not made any equipment bookings yet.
          </p>

          <button
            className="primary-button"
            onClick={() => navigate("/equipment")}
          >
            Browse Equipment
          </button>

        </div>
      )}

      {/* BOOKINGS */}

      {bookings.length > 0 && (
        <div className="bookings-list">

          {bookings.map((booking) => {

            const equipment =
              booking.equipment;

            const status =
              booking.status;

            const canCancel =
              status === "PENDING_APPROVAL";

            return (
              <div
                className="booking-card"
                key={booking.id}
              >

                {/* EQUIPMENT */}

                <div className="booking-equipment">

                  {booking.equipmentImageUrl ? (
                       <img
                         src={booking.equipmentImageUrl}
                         alt={booking.equipmentName || "Equipment"}
                         className="booking-list-image"
                       />
                     ) : (
                       <div className="booking-list-placeholder">
                         No Image
                       </div>
                     )}
                     
                     <div>
                     
                       <h2>
                         {booking.equipmentName || "Equipment"}
                       </h2>
                     
                       <p>
                         {booking.equipmentCategory || "Equipment"}
                       </p>
                     
                       {booking.equipmentAssetTag && (
                         <span className="asset-tag">
                           Asset Tag: {booking.equipmentAssetTag}
                         </span>
                       )}
                     
                     </div>

                </div>

                {/* BOOKING DETAILS */}

                <div className="booking-details">

                  <div className="detail-item">

                    <span className="detail-label">
                      Date
                    </span>

                    <span>
                      {booking.bookingDate}
                    </span>

                  </div>

                  <div className="detail-item">

                    <span className="detail-label">
                      Time
                    </span>

                    <span>
                      {booking.startTime}
                      {" - "}
                      {booking.endTime}
                    </span>

                  </div>

                  <div className="detail-item">

                    <span className="detail-label">
                      Purpose
                    </span>

                    <span>
                      {booking.purpose ||
                        "Not specified"}
                    </span>

                  </div>

                  <div className="detail-item">

                    <span className="detail-label">
                      Status
                    </span>

                    <span
                      className={`booking-status ${getStatusClass(
                        status
                      )}`}
                    >
                      {status
                        ?.replaceAll("_", " ") ||
                        "UNKNOWN"}
                    </span>

                  </div>

                </div>

                {/* ACTIONS */}

                <div className="booking-actions">

                  {canCancel ? (
                      <button
                        className="cancel-button"
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                      >
                        {cancellingId === booking.id
                          ? "Cancelling..."
                          : "Cancel Booking"}
                      </button>
                    ) : (
                      <span className="booking-action-info">
                        {status === "CONFIRMED"
                          ? "Booking confirmed"
                          : status === "CANCELLED"
                          ? "Booking cancelled"
                          : status === "COMPLETED"
                          ? "Booking completed"
                          : status === "IN_USE"
                          ? "Currently in use"
                          : status === "NO_SHOW"
                          ? "No show"
                          : ""}
                      </span>
                    )}
                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default MyBookings;