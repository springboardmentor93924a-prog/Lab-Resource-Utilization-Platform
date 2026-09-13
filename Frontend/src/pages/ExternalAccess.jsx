
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";


function ExternalAccess() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedBooking, setSelectedBooking] = useState(null);

  // =========================================================
  // LOAD APPROVED EXTERNAL BOOKINGS
  // =========================================================

  useEffect(() => {
    loadApprovedBookings();
  }, []);

  const loadApprovedBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        "/external-bookings/status/APPROVED"
      );

      console.log(
        "Approved external bookings:",
        response.data
      );

      setBookings(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "External access loading error:",
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
          : "Unable to load external access records."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // HELPER FUNCTIONS
  // =========================================================

  const getInstitutionName = (booking) => {
    return (
      booking.institution?.name ||
      booking.institutionName ||
      "External Institution"
    );
  };

  const getEquipmentName = (booking) => {
    return (
      booking.equipment?.name ||
      booking.equipmentName ||
      "Equipment"
    );
  };

  const getEquipmentCategory = (booking) => {
    return (
      booking.equipment?.category ||
      booking.category ||
      "-"
    );
  };

  const getAssetTag = (booking) => {
    return (
      booking.equipment?.assetTag ||
      booking.assetTag ||
      "-"
    );
  };

  const formatStatus = (status) => {
    if (!status) {
      return "UNKNOWN";
    }

    return status
      .toString()
      .replaceAll("_", " ")
      .toUpperCase();
  };

  // =========================================================
  // ACCESS STATUS
  // =========================================================

  const getAccessStatus = (booking) => {
    if (booking.status === "APPROVED") {
      return "ACTIVE";
    }

    if (booking.status === "COMPLETED") {
      return "EXPIRED";
    }

    if (booking.status === "CANCELLED") {
      return "CANCELLED";
    }

    if (booking.status === "REJECTED") {
      return "DENIED";
    }

    return "PENDING";
  };

  const getAccessClass = (booking) => {
    const status = getAccessStatus(booking);

    return status
      .toLowerCase()
      .replaceAll(" ", "-");
  };

  // =========================================================
  // VIEW ACCESS DETAILS
  // =========================================================

  const handleViewAccess = (booking) => {
    setSelectedBooking(booking);
    setSuccess("");
  };

  // =========================================================
  // CLOSE DETAILS
  // =========================================================

  const handleCloseDetails = () => {
    setSelectedBooking(null);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="app-layout">

        <Sidebar />

        <div className="main-area">

          <Topbar />

          <main className="main-content">

            <div className="external-access-page">

              <div className="external-access-loading">
                Loading external access records...
              </div>

            </div>

          </main>

        </div>

      </div>
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

          <div className="external-access-page">

            <div className="external-access-container">

              {/* =================================================
                  HEADER
              ================================================= */}

              <div className="external-access-header">

                <div>

                  <h1>
                    External Access
                  </h1>

                  <p>
                    Manage approved external users and
                    their equipment access.
                  </p>

                </div>

                <div className="access-summary">

                  <span className="summary-number">
                    {bookings.length}
                  </span>

                  <span className="summary-label">
                    Active Access
                  </span>

                </div>

              </div>

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div className="external-access-error">
                  {error}
                </div>
              )}

              {/* =================================================
                  SUCCESS
              ================================================= */}

              {success && (
                <div className="external-access-success">
                  {success}
                </div>
              )}

              {/* =================================================
                  EMPTY STATE
              ================================================= */}

              {bookings.length === 0 && !error && (

                <div className="external-access-empty">

                  <div className="external-access-empty-icon">
                    🔐
                  </div>

                  <h2>
                    No Active External Access
                  </h2>

                  <p>
                    There are currently no approved
                    external booking requests.
                  </p>

                </div>

              )}

              {/* =================================================
                  ACCESS LIST
              ================================================= */}

              {bookings.length > 0 && (

                <div className="external-access-list">

                  {bookings.map((booking) => {

                    const accessStatus =
                      getAccessStatus(booking);

                    const accessClass =
                      getAccessClass(booking);

                    return (

                      <div
                        className="external-access-card"
                        key={booking.id}
                      >

                        {/* ======================================
                            USER / EQUIPMENT
                        ====================================== */}

                        <div className="external-access-user">

                          <div className="external-access-avatar">
                            {booking.externalName
                              ?.charAt(0)
                              ?.toUpperCase() || "E"}
                          </div>

                          <div className="external-access-user-info">

                            <h2>
                              {booking.externalName}
                            </h2>

                            <p>
                              {booking.externalEmail}
                            </p>

                            <span>
                              {booking.externalPhone}
                            </span>

                          </div>

                        </div>

                        {/* ======================================
                            ACCESS DETAILS
                        ====================================== */}

                        <div className="external-access-details">

                          <div className="access-detail">

                            <span>
                              Institution
                            </span>

                            <strong>
                              {getInstitutionName(
                                booking
                              )}
                            </strong>

                          </div>

                          <div className="access-detail">

                            <span>
                              Equipment
                            </span>

                            <strong>
                              {getEquipmentName(
                                booking
                              )}
                            </strong>

                          </div>

                          <div className="access-detail">

                            <span>
                              Category
                            </span>

                            <strong>
                              {getEquipmentCategory(
                                booking
                              )}
                            </strong>

                          </div>

                          <div className="access-detail">

                            <span>
                              Asset Tag
                            </span>

                            <strong>
                              {getAssetTag(
                                booking
                              )}
                            </strong>

                          </div>

                          <div className="access-detail">

                            <span>
                              Access Date
                            </span>

                            <strong>
                              {booking.bookingDate ||
                                "-"}
                            </strong>

                          </div>

                          <div className="access-detail">

                            <span>
                              Access Time
                            </span>

                            <strong>
                              {booking.startTime || "-"}
                              {" - "}
                              {booking.endTime || "-"}
                            </strong>

                          </div>

                        </div>

                        {/* ======================================
                            STATUS + ACTION
                        ====================================== */}

                        <div className="external-access-actions">

                          <span
                            className={`access-status ${accessClass}`}
                          >
                            {accessStatus}
                          </span>

                          <button
                            type="button"
                            className="view-access-button"
                            onClick={() =>
                              handleViewAccess(
                                booking
                              )
                            }
                          >
                            View Access
                          </button>

                        </div>

                      </div>

                    );

                  })}

                </div>

              )}

            </div>

          </div>


      {/* </div> */}

      

      {selectedBooking && (

        <div
          className="access-modal-overlay"
          onClick={handleCloseDetails}
        >

          <div
            className="access-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="access-modal-header">

              <div>

                <h2>
                  External Access Details
                </h2>

                <p>
                  Booking #{selectedBooking.id}
                </p>

              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={handleCloseDetails}
              >
                ×
              </button>

            </div>

            <div className="access-modal-body">

              <div className="modal-section">

                <h3>
                  External User
                </h3>

                <div className="modal-grid">

                  <div>
                    <span>Name</span>
                    <strong>
                      {selectedBooking.externalName}
                    </strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>
                      {selectedBooking.externalEmail}
                    </strong>
                  </div>

                  <div>
                    <span>Phone</span>
                    <strong>
                      {selectedBooking.externalPhone}
                    </strong>
                  </div>

                </div>

              </div>

              <div className="modal-section">

                <h3>
                  Institution
                </h3>

                <div className="modal-grid">

                  <div>
                    <span>Institution</span>
                    <strong>
                      {getInstitutionName(
                        selectedBooking
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>City</span>
                    <strong>
                      {selectedBooking
                        .institution?.city || "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Country</span>
                    <strong>
                      {selectedBooking
                        .institution?.country || "-"}
                    </strong>
                  </div>

                </div>

              </div>

              <div className="modal-section">

                <h3>
                  Equipment Access
                </h3>

                <div className="modal-grid">

                  <div>
                    <span>Equipment</span>
                    <strong>
                      {getEquipmentName(
                        selectedBooking
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Asset Tag</span>
                    <strong>
                      {getAssetTag(
                        selectedBooking
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Category</span>
                    <strong>
                      {getEquipmentCategory(
                        selectedBooking
                      )}
                    </strong>
                  </div>

                </div>

              </div>

              <div className="modal-section">

                <h3>
                  Access Validity
                </h3>

                <div className="modal-validity">

                  <div>
                    <span>Date</span>
                    <strong>
                      {selectedBooking.bookingDate}
                    </strong>
                  </div>

                  <div>
                    <span>Start</span>
                    <strong>
                      {selectedBooking.startTime}
                    </strong>
                  </div>

                  <div>
                    <span>End</span>
                    <strong>
                      {selectedBooking.endTime}
                    </strong>
                  </div>

                  <div>
                    <span>Status</span>
                    <strong
                      className={`modal-status ${getAccessClass(
                        selectedBooking
                      )}`}
                    >
                      {getAccessStatus(
                        selectedBooking
                      )}
                    </strong>
                  </div>

                </div>

              </div>

              <div className="modal-section">

                <h3>
                  Purpose
                </h3>

                <p className="modal-purpose">
                  {selectedBooking.purpose ||
                    "No purpose provided."}
                </p>

              </div>

              {selectedBooking.adminRemarks && (

                <div className="modal-section">

                  <h3>
                    Admin Remarks
                  </h3>

                  <p className="modal-purpose">
                    {selectedBooking.adminRemarks}
                  </p>

                </div>

              )}

            </div>

            <div className="access-modal-footer">

              <button
                type="button"
                className="modal-done-button"
                onClick={handleCloseDetails}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}
    </main>
    // </div>
  );
}

export default ExternalAccess;
