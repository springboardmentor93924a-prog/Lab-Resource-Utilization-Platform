import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// import Sidebar from "../components/Sidebar";
// import Topbar from "../components/Topbar";

function ExternalBookings() {

  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [cancellingId, setCancellingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // GET EXTERNAL USER EMAIL
  // =========================================================

  const getExternalEmail = () => {

    /*
     * We first check localStorage.
     *
     * The ExternalBooking page should store the email
     * after a successful booking request.
     */

    const storedEmail =
      localStorage.getItem("externalEmail");

    if (storedEmail) {
      return storedEmail;
    }

    /*
     * Fallback:
     * If your application stores external user information
     * inside "user", try to read the email from there.
     */

    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    try {

      const user = JSON.parse(storedUser);

      return (
        user.email ||
        user.externalEmail ||
        user.user?.email ||
        user.user?.externalEmail ||
        null
      );

    } catch (err) {

      console.error(
        "Unable to parse stored user:",
        err
      );

      return null;
    }
  };

  // =========================================================
  // LOAD BOOKINGS
  // =========================================================

  useEffect(() => {

    loadBookings();

  }, []);

  const loadBookings = async (showLoader = true) => {

    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");
    setSuccess("");

    try {

      const email = getExternalEmail();

      console.log(
        "External booking email:",
        email
      );

      if (!email) {

        setError(
          "External email not found. Please submit a booking request first."
        );

        setBookings([]);

        return;
      }

      // =====================================================
      // GET BOOKINGS BY EMAIL
      // =====================================================

      const response = await api.get(
        `/external-bookings/email/${encodeURIComponent(email)}`
      );

      console.log(
        "External bookings response:",
        response.data
      );

      const data = response.data;

      // =====================================================
      // HANDLE RESPONSE
      // =====================================================

      if (Array.isArray(data)) {

        setBookings(data);

      } else if (Array.isArray(data?.bookings)) {

        setBookings(data.bookings);

      } else if (Array.isArray(data?.data)) {

        setBookings(data.data);

      } else {

        console.warn(
          "Unexpected external bookings response:",
          data
        );

        setBookings([]);
      }

    } catch (err) {

      console.error(
        "External bookings API error:",
        err
      );

      console.error(
        "Status:",
        err.response?.status
      );

      console.error(
        "Server response:",
        err.response?.data
      );

      const message =
        err.response?.data;

      setError(
        typeof message === "string"
          ? message
          : "Unable to load external booking history."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = async () => {

    await loadBookings(false);

  };

  // =========================================================
  // CANCEL BOOKING
  // =========================================================

  const handleCancel = async (bookingId) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this booking request?"
      );

    if (!confirmed) {
      return;
    }

    setCancellingId(bookingId);

    setError("");
    setSuccess("");

    try {

      console.log(
        "Cancelling external booking:",
        bookingId
      );

      const response = await api.put(
        `/external-bookings/${bookingId}/cancel`
      );

      console.log(
        "Cancel response:",
        response.data
      );

      setSuccess(
        "Booking request cancelled successfully."
      );

      // =====================================================
      // UPDATE UI IMMEDIATELY
      // =====================================================

      setBookings((previous) =>
        previous.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: "CANCELLED"
              }
            : booking
        )
      );

    } catch (err) {

      console.error(
        "Cancel external booking error:",
        err
      );

      console.error(
        "Server response:",
        err.response?.data
      );

      const message =
        err.response?.data;

      setError(
        typeof message === "string"
          ? message
          : "Unable to cancel booking."
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
      return "unknown";
    }

    return status
      .toString()
      .toLowerCase()
      .replaceAll("_", "-")
      .replaceAll(" ", "-");
  };

  // =========================================================
  // STATUS TEXT
  // =========================================================

  const getStatusText = (status) => {

    if (!status) {
      return "UNKNOWN";
    }

    return status
      .toString()
      .replaceAll("_", " ");
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {

    if (!date) {
      return "Not specified";
    }

    try {

      return new Date(
        `${date}T00:00:00`
      ).toLocaleDateString();

    } catch {

      return date;
    }
  };

  // =========================================================
  // TIME FORMAT
  // =========================================================

  const formatTime = (time) => {

    if (!time) {
      return "--:--";
    }

    return time.substring(0, 5);
  };

  // =========================================================
  // CREATED DATE
  // =========================================================

  const formatCreatedAt = (createdAt) => {

    if (!createdAt) {
      return "Not available";
    }

    try {

      return new Date(
        createdAt
      ).toLocaleString();

    } catch {

      return createdAt;
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      // <div className="app-layout">

      //   <Sidebar />

      //   <div className="main-area">

      //     <Topbar />

          <main className="main-content">

            <div className="external-bookings-page">

              <div className="external-bookings-loading">

                Loading your external bookings...

              </div>

            </div>

          </main>

      //   </div>

      // </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (

    // <div className="app-layout">

    //   <Sidebar />

    //   <div className="main-area">

    //     <Topbar />

        <main className="main-content">

          <div className="external-bookings-page">

            <div className="external-bookings-container">

              {/* =================================================
                  HEADER
              ================================================= */}

              <div className="external-bookings-header">

                <div>

                  <h1>
                    My External Bookings
                  </h1>

                  <p>
                    View and manage your external
                    equipment booking requests.
                  </p>

                </div>

                <div className="external-bookings-header-actions">

                  <button
                    type="button"
                    className="external-refresh-button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    {refreshing
                      ? "Refreshing..."
                      : "↻ Refresh"}
                  </button>

                  <button
                    type="button"
                    className="external-new-booking-button"
                    onClick={() =>
                      navigate("/external-booking")
                    }
                  >
                    + New Booking
                  </button>

                </div>

              </div>

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (

                <div className="external-bookings-error">
                  {error}
                </div>

              )}

              {/* =================================================
                  SUCCESS
              ================================================= */}

              {success && (

                <div className="external-bookings-success">
                  {success}
                </div>

              )}

              {/* =================================================
                  EMAIL INFORMATION
              ================================================= */}

              {getExternalEmail() && (

                <div className="external-bookings-email-info">

                  <span className="email-info-icon">
                    ✉
                  </span>

                  <div>

                    <span className="email-info-label">
                      Booking history for
                    </span>

                    <strong>
                      {getExternalEmail()}
                    </strong>

                  </div>

                </div>

              )}

              {/* =================================================
                  EMPTY STATE
              ================================================= */}

              {bookings.length === 0 && !error && (

                <div className="external-bookings-empty">

                  <div className="external-empty-icon">
                    📅
                  </div>

                  <h2>
                    No External Bookings
                  </h2>

                  <p>
                    You have not submitted any
                    external equipment booking requests yet.
                  </p>

                  <button
                    type="button"
                    className="external-new-booking-button"
                    onClick={() =>
                      navigate("/external-booking")
                    }
                  >
                    Create Booking Request
                  </button>

                </div>

              )}

              {/* =================================================
                  BOOKING LIST
              ================================================= */}

              {bookings.length > 0 && (

                <div className="external-bookings-list">

                  {bookings.map((booking) => {

                    // =================================================
                    // EQUIPMENT
                    // =================================================

                    const equipment =
                      booking.equipment || {};

                    const equipmentName =
                      equipment.name ||
                      booking.equipmentName ||
                      "Equipment";

                    const equipmentCategory =
                      equipment.category ||
                      booking.equipmentCategory ||
                      "Laboratory Equipment";

                    const assetTag =
                      equipment.assetTag ||
                      booking.equipmentAssetTag ||
                      "";

                    const imageUrl =
                      equipment.imageUrl ||
                      booking.equipmentImageUrl ||
                      null;

                    // =================================================
                    // STATUS
                    // =================================================

                    const status =
                      booking.status ||
                      "PENDING";

                    const normalizedStatus =
                      status
                        .toString()
                        .toUpperCase();

                    const isCancelled =
                      normalizedStatus ===
                      "CANCELLED";

                    const isCompleted =
                      normalizedStatus ===
                      "COMPLETED";

                    const canCancel =
                      !isCancelled &&
                      !isCompleted;

                    return (

                      <div
                        className={`external-booking-card ${
                          isCancelled
                            ? "cancelled"
                            : ""
                        }`}
                        key={booking.id}
                      >

                        {/* =================================================
                            EQUIPMENT
                        ================================================= */}

                        <div className="external-booking-equipment">

                          {imageUrl ? (

                            <img
                              src={imageUrl}
                              alt={equipmentName}
                              className="external-booking-image"
                            />

                          ) : (

                            <div className="external-booking-placeholder">
                              🔬
                            </div>

                          )}

                          <div className="external-booking-equipment-info">

                            <h2>
                              {equipmentName}
                            </h2>

                            <p>
                              {equipmentCategory}
                            </p>

                            {assetTag && (

                              <span>
                                Asset Tag: {assetTag}
                              </span>

                            )}

                          </div>

                        </div>

                        {/* =================================================
                            DETAILS
                        ================================================= */}

                        <div className="external-booking-details">

                          <div className="external-detail-item">

                            <span className="external-detail-label">
                              Date
                            </span>

                            <strong>
                              {formatDate(
                                booking.bookingDate
                              )}
                            </strong>

                          </div>

                          <div className="external-detail-item">

                            <span className="external-detail-label">
                              Time
                            </span>

                            <strong>

                              {formatTime(
                                booking.startTime
                              )}

                              {" - "}

                              {formatTime(
                                booking.endTime
                              )}

                            </strong>

                          </div>

                          <div className="external-detail-item">

                            <span className="external-detail-label">
                              Status
                            </span>

                            <span
                              className={`external-booking-status ${getStatusClass(
                                status
                              )}`}
                            >
                              {getStatusText(status)}
                            </span>

                          </div>

                          <div className="external-detail-item">

                            <span className="external-detail-label">
                              Requested
                            </span>

                            <strong>
                              {formatCreatedAt(
                                booking.createdAt
                              )}
                            </strong>

                          </div>

                        </div>

                        {/* =================================================
                            PURPOSE + REMARKS
                        ================================================= */}

                        <div className="external-booking-extra">

                          <div className="external-purpose">

                            <span className="external-detail-label">
                              Purpose
                            </span>

                            <p>
                              {booking.purpose ||
                                "Not specified"}
                            </p>

                          </div>

                          {booking.adminRemarks && (

                            <div className="external-admin-remarks">

                              <span className="external-detail-label">
                                Admin Remarks
                              </span>

                              <p>
                                {booking.adminRemarks}
                              </p>

                            </div>

                          )}

                        </div>

                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <div className="external-booking-actions">

                          {canCancel ? (

                            <button
                              type="button"
                              className="external-cancel-button"
                              onClick={() =>
                                handleCancel(
                                  booking.id
                                )
                              }
                              disabled={
                                cancellingId ===
                                booking.id
                              }
                            >

                              {cancellingId ===
                              booking.id
                                ? "Cancelling..."
                                : "Cancel Booking"}

                            </button>

                          ) : isCancelled ? (

                            <span className="external-cancelled-info">
                              ✓ Booking cancelled
                            </span>

                          ) : (

                            <span className="external-completed-info">
                              ✓ Booking completed
                            </span>

                          )}

                        </div>

                      </div>

                    );
                  })}

                </div>

              )}

            </div>

          </div>

        </main>

    //   </div>

    // </div>
  );
}

export default ExternalBookings;