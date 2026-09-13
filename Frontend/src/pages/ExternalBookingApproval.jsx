
import { useEffect, useState } from "react";
// import Sidebar from "../components/Sidebar";
// import Topbar from "../components/Topbar";
import api from "../services/api";

function ExternalBookingApproval() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD PENDING EXTERNAL BOOKINGS
  // =========================================================

  useEffect(() => {
    loadPendingExternalBookings();
  }, []);

  const loadPendingExternalBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        "/external-bookings/status/PENDING"
      );

      console.log(
        "Pending external bookings:",
        response.data
      );

      setBookings(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "External booking loading error:",
        err
      );

      console.error(
        "Server response:",
        err.response?.data
      );

      const message = err.response?.data;

      setError(
        typeof message === "string"
          ? message
          : "Unable to load external booking requests."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // EQUIPMENT HELPERS
  // =========================================================

  const getEquipmentName = (booking) => {
    return (
      booking.equipment?.name ||
      "Equipment"
    );
  };

  const getEquipmentCategory = (booking) => {
    return (
      booking.equipment?.category ||
      "-"
    );
  };

  const getAssetTag = (booking) => {
    return (
      booking.equipment?.assetTag ||
      "-"
    );
  };

  const getEquipmentImage = (booking) => {
    return booking.equipment?.imageUrl || "";
  };

  // =========================================================
  // INSTITUTION HELPERS
  // =========================================================

  const getInstitutionName = (booking) => {
    return (
      booking.institution?.name ||
      "External Institution"
    );
  };

  const getInstitutionLocation = (booking) => {
    const city =
      booking.institution?.city || "";

    const state =
      booking.institution?.state || "";

    if (city && state) {
      return `${city}, ${state}`;
    }

    return city || state || "-";
  };

  // =========================================================
  // APPROVE EXTERNAL BOOKING
  // =========================================================

  const handleApprove = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this external booking?"
    );

    if (!confirmed) {
      return;
    }

    setProcessingId(bookingId);
    setError("");
    setSuccess("");

    try {
      const response = await api.put(
        `/external-bookings/${bookingId}/approve`
      );

      console.log(
        "External booking approved:",
        response.data
      );

      setBookings((previous) =>
        previous.filter(
          (booking) =>
            booking.id !== bookingId
        )
      );

      setSuccess(
        "External booking approved successfully."
      );
    } catch (err) {
      console.error(
        "Approve external booking error:",
        err
      );

      const message = err.response?.data;

      setError(
        typeof message === "string"
          ? message
          : "Unable to approve external booking."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================================
  // REJECT EXTERNAL BOOKING
  // =========================================================

  const handleReject = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this external booking?"
    );

    if (!confirmed) {
      return;
    }

    setProcessingId(bookingId);
    setError("");
    setSuccess("");

    try {
      const response = await api.put(
        `/external-bookings/${bookingId}/reject`
      );

      console.log(
        "External booking rejected:",
        response.data
      );

      setBookings((previous) =>
        previous.filter(
          (booking) =>
            booking.id !== bookingId
        )
      );

      setSuccess(
        "External booking rejected successfully."
      );
    } catch (err) {
      console.error(
        "Reject external booking error:",
        err
      );

      const message = err.response?.data;

      setError(
        typeof message === "string"
          ? message
          : "Unable to reject external booking."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      return new Date(`${date}T00:00:00`)
        .toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
    } catch {
      return date;
    }
  };

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (time) => {
    if (!time) {
      return "-";
    }

    const [hours, minutes] =
      time.split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0
    );

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
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
            <div className="external-approval-page">

              <div className="external-approval-container">

                <div className="external-approval-loading">

                  <div className="external-loading-spinner">
                    ⏳
                  </div>

                  <h2>
                    Loading External Booking Requests
                  </h2>

                  <p>
                    Please wait while we load pending requests.
                  </p>

                </div>

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

          <div className="external-approval-page">

            <div className="external-approval-container">

              {/* =================================================
                  HEADER
              ================================================= */}

              <div className="external-approval-header">

                <div>
                  <div className="external-approval-label">
                    EXTERNAL ACCESS
                  </div>

                  <h1>
                    External Booking Approval
                  </h1>

                  <p>
                    Review and manage booking requests
                    submitted by external users and institutions.
                  </p>
                </div>

                <button
                  type="button"
                  className="external-refresh-button"
                  onClick={loadPendingExternalBookings}
                >
                  ↻ Refresh
                </button>

              </div>

              {/* =================================================
                  ALERTS
              ================================================= */}

              {error && (
                <div className="external-error-message">
                  <span>⚠</span>
                  <div>
                    {error}
                  </div>
                </div>
              )}

              {success && (
                <div className="external-success-message">
                  <span>✓</span>
                  <div>
                    {success}
                  </div>
                </div>
              )}

              {/* =================================================
                  SUMMARY
              ================================================= */}

              <div className="external-approval-summary">

                <div className="external-summary-card">

                  <div className="external-summary-icon">
                    ⏳
                  </div>

                  <div>
                    <span>
                      Pending Requests
                    </span>

                    <strong>
                      {bookings.length}
                    </strong>
                  </div>

                </div>

                <div className="external-summary-info">
                  External booking requests require
                  admin approval before the equipment
                  can be used.
                </div>

              </div>

              {/* =================================================
                  EMPTY STATE
              ================================================= */}

              {bookings.length === 0 && !error && (
                <div className="external-empty-approval">

                  <div className="external-empty-icon">
                    ✓
                  </div>

                  <h2>
                    No Pending External Requests
                  </h2>

                  <p>
                    There are currently no external
                    booking requests waiting for approval.
                  </p>

                  <button
                    type="button"
                    className="external-empty-refresh"
                    onClick={loadPendingExternalBookings}
                  >
                    Refresh Requests
                  </button>

                </div>
              )}

              {/* =================================================
                  EXTERNAL BOOKING REQUESTS
              ================================================= */}

              {bookings.length > 0 && (
                <div className="external-approval-list">

                  {bookings.map((booking) => {

                    const image =
                      getEquipmentImage(booking);

                    const isProcessing =
                      processingId === booking.id;

                    return (
                      <div
                        className="external-approval-card"
                        key={booking.id}
                      >

                        {/* ======================================
                            CARD TOP
                        ====================================== */}

                        <div className="external-card-top">

                          <div className="external-equipment-section">

                            {image ? (
                              <img
                                src={image}
                                alt={getEquipmentName(
                                  booking
                                )}
                                className="external-equipment-image"
                              />
                            ) : (
                              <div className="external-equipment-placeholder">
                                🔬
                              </div>
                            )}

                            <div className="external-equipment-info">

                              <div className="external-request-label">
                                EQUIPMENT REQUEST
                              </div>

                              <h2>
                                {getEquipmentName(
                                  booking
                                )}
                              </h2>

                              <p>
                                {getEquipmentCategory(
                                  booking
                                )}
                              </p>

                              <span className="external-asset-tag">
                                Asset:{" "}
                                {getAssetTag(
                                  booking
                                )}
                              </span>

                            </div>

                          </div>

                          <span className="external-pending-badge">
                            PENDING
                          </span>

                        </div>

                        {/* ======================================
                            EXTERNAL USER
                        ====================================== */}

                        <div className="external-requester-section">

                          <div className="external-section-title">
                            External Requester
                          </div>

                          <div className="external-requester-grid">

                            <div className="external-requester-item">

                              <span>
                                Name
                              </span>

                              <strong>
                                {booking.externalName ||
                                  "-"}
                              </strong>

                            </div>

                            <div className="external-requester-item">

                              <span>
                                Email
                              </span>

                              <strong>
                                {booking.externalEmail ||
                                  "-"}
                              </strong>

                            </div>

                            <div className="external-requester-item">

                              <span>
                                Phone
                              </span>

                              <strong>
                                {booking.externalPhone ||
                                  "-"}
                              </strong>

                            </div>

                            <div className="external-requester-item">

                              <span>
                                Institution
                              </span>

                              <strong>
                                {getInstitutionName(
                                  booking
                                )}
                              </strong>

                            </div>

                            <div className="external-requester-item">

                              <span>
                                Location
                              </span>

                              <strong>
                                {getInstitutionLocation(
                                  booking
                                )}
                              </strong>

                            </div>

                            <div className="external-requester-item">

                              <span>
                                Request ID
                              </span>

                              <strong>
                                #{booking.id}
                              </strong>

                            </div>

                          </div>

                        </div>

                        {/* ======================================
                            BOOKING INFORMATION
                        ====================================== */}

                        <div className="external-booking-section">

                          <div className="external-section-title">
                            Booking Information
                          </div>

                          <div className="external-booking-grid">

                            <div className="external-info-box">

                              <span>
                                Booking Date
                              </span>

                              <strong>
                                {formatDate(
                                  booking.bookingDate
                                )}
                              </strong>

                            </div>

                            <div className="external-info-box">

                              <span>
                                Start Time
                              </span>

                              <strong>
                                {formatTime(
                                  booking.startTime
                                )}
                              </strong>

                            </div>

                            <div className="external-info-box">

                              <span>
                                End Time
                              </span>

                              <strong>
                                {formatTime(
                                  booking.endTime
                                )}
                              </strong>

                            </div>

                            <div className="external-info-box">

                              <span>
                                Equipment Status
                              </span>

                              <strong>
                                {booking.equipment?.status ||
                                  "AVAILABLE"}
                              </strong>

                            </div>

                          </div>

                        </div>

                        {/* ======================================
                            PURPOSE
                        ====================================== */}

                        <div className="external-purpose-section">

                          <div className="external-section-title">
                            Purpose of Booking
                          </div>

                          <p>
                            {booking.purpose ||
                              "No purpose provided."}
                          </p>

                        </div>

                        {/* ======================================
                            ACTIONS
                        ====================================== */}

                        <div className="external-approval-actions">

                          <div className="external-action-note">
                            Approve this request to allow
                            the external user to access
                            the equipment.
                          </div>

                          <div className="external-action-buttons">

                            <button
                              type="button"
                              className="external-reject-button"
                              disabled={isProcessing}
                              onClick={() =>
                                handleReject(
                                  booking.id
                                )
                              }
                            >
                              {isProcessing
                                ? "Processing..."
                                : "Reject"}
                            </button>

                            <button
                              type="button"
                              className="external-approve-button"
                              disabled={isProcessing}
                              onClick={() =>
                                handleApprove(
                                  booking.id
                                )
                              }
                            >
                              {isProcessing
                                ? "Processing..."
                                : "Approve"}
                            </button>

                          </div>

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

export default ExternalBookingApproval;
