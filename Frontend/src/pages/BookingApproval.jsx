
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";

function BookingApproval() {

  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [processingId, setProcessingId] =
    useState(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");


  // =========================================================
  // LOAD PENDING BOOKINGS
  // =========================================================

  useEffect(() => {
    loadPendingBookings();
  }, []);


  const loadPendingBookings = async () => {

    setLoading(true);
    setError("");

    try {

      const response =
        await api.get("/bookings/pending");

      console.log(
        "Pending booking response:",
        response.data
      );

      const data =
        Array.isArray(response.data)
          ? response.data
          : [];

      setBookings(data);

    } catch (err) {

      console.error(
        "Pending bookings error:",
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
          : "Unable to load pending booking requests."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================================================
  // GET EQUIPMENT
  // =========================================================

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


  // =========================================================
  // GET USER
  // =========================================================

  const getUserName = (booking) => {

    return (
      booking.user?.name ||
      booking.user?.fullName ||
      booking.userName ||
      booking.researcherName ||
      "Researcher"
    );

  };


  // =========================================================
  // FORMAT STATUS
  // =========================================================

  const formatStatus = (status) => {

    if (!status) {
      return "PENDING";
    }

    return status
      .toString()
      .replaceAll("_", " ")
      .toUpperCase();

  };


  // =========================================================
  // APPROVE BOOKING
  // =========================================================

  const handleApprove = async (bookingId) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to approve this booking?"
      );

    if (!confirmed) {
      return;
    }

    setProcessingId(bookingId);

    setError("");
    setSuccess("");

    try {

      console.log(
        "Approving booking:",
        bookingId
      );

      const response =
        await api.put(
          `/bookings/${bookingId}/approve`
        );

      console.log(
        "Approve response:",
        response.data
      );

      // Remove approved booking from pending list

      setBookings((previous) =>
        previous.filter(
          (booking) =>
            booking.id !== bookingId
        )
      );

      setSuccess(
        "Booking approved successfully."
      );

    } catch (err) {

      console.error(
        "Approve booking error:",
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
          : "Unable to approve booking."
      );

    } finally {

      setProcessingId(null);

    }
  };


  // =========================================================
  // REJECT BOOKING
  // =========================================================

  const handleReject = async (bookingId) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to reject this booking?"
      );

    if (!confirmed) {
      return;
    }

    setProcessingId(bookingId);

    setError("");
    setSuccess("");

    try {

      console.log(
        "Rejecting booking:",
        bookingId
      );

      const response =
        await api.put(
          `/bookings/${bookingId}/reject`
        );

      console.log(
        "Reject response:",
        response.data
      );

      // Remove rejected booking from pending list

      setBookings((previous) =>
        previous.filter(
          (booking) =>
            booking.id !== bookingId
        )
      );

      setSuccess(
        "Booking rejected successfully."
      );

    } catch (err) {

      console.error(
        "Reject booking error:",
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
          : "Unable to reject booking."
      );

    } finally {

      setProcessingId(null);

    }
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

            <div className="booking-approval-loading">

              Loading booking requests...

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

          <div className="booking-approval-page">

            <div className="booking-approval-container">


              {/* =================================================
                  HEADER
              ================================================= */}

              <div className="booking-approval-header">

                <div>

                  <h1>
                    Booking Approval
                  </h1>

                  <p>
                    Review and manage researcher
                    equipment booking requests.
                  </p>

                </div>

              </div>


              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (

                <div className="error-message">

                  {error}

                </div>

              )}


              {/* =================================================
                  SUCCESS
              ================================================= */}

              {success && (

                <div className="success-message">

                  {success}

                </div>

              )}


              {/* =================================================
                  NO REQUESTS
              ================================================= */}

              {bookings.length === 0 && !error && (

                <div className="empty-approval">

                  <div className="empty-icon">
                    ✓
                  </div>

                  <h2>
                    No Pending Booking Requests
                  </h2>

                  <p>
                    There are currently no booking
                    requests waiting for approval.
                  </p>

                </div>

              )}


              {/* =================================================
                  BOOKING REQUESTS
              ================================================= */}

              {bookings.length > 0 && (

                <div className="approval-list">

                  {bookings.map((booking) => {

                    const status =
                      formatStatus(
                        booking.status
                      );

                    const isProcessing =
                      processingId ===
                      booking.id;

                    return (

                      <div
                        className="approval-card"
                        key={booking.id}
                      >


                        {/* ======================================
                            CARD HEADER
                        ====================================== */}

                        <div className="approval-card-header">

                          <div>

                            <h2>

                              {getEquipmentName(
                                booking
                              )}

                            </h2>

                            <p>

                              Requested by{" "}

                              <strong>
                                {getUserName(
                                  booking
                                )}
                              </strong>

                            </p>

                          </div>


                          <span className="booking-status pending-approval">

                            {status}

                          </span>

                        </div>


                        {/* ======================================
                            BOOKING DETAILS
                        ====================================== */}

                        <div className="approval-details">


                          <div className="approval-detail">

                            <span>
                              Booking Date
                            </span>

                            <strong>
                              {booking.bookingDate ||
                                "-"}
                            </strong>

                          </div>


                          <div className="approval-detail">

                            <span>
                              Start Time
                            </span>

                            <strong>
                              {booking.startTime ||
                                "-"}
                            </strong>

                          </div>


                          <div className="approval-detail">

                            <span>
                              End Time
                            </span>

                            <strong>
                              {booking.endTime ||
                                "-"}
                            </strong>

                          </div>


                          <div className="approval-detail">

                            <span>
                              Category
                            </span>

                            <strong>
                              {getEquipmentCategory(
                                booking
                              )}
                            </strong>

                          </div>


                          <div className="approval-detail">

                            <span>
                              Asset Tag
                            </span>

                            <strong>
                              {getAssetTag(
                                booking
                              )}
                            </strong>

                          </div>


                          <div className="approval-detail">

                            <span>
                              Booking ID
                            </span>

                            <strong>
                              #{booking.id}
                            </strong>

                          </div>


                        </div>


                        {/* ======================================
                            PURPOSE
                        ====================================== */}

                        <div className="approval-purpose">

                          <strong>
                            Purpose of Booking
                          </strong>

                          <p>
                            {booking.purpose ||
                              "No purpose provided."}
                          </p>

                        </div>


                        {/* ======================================
                            ACTIONS
                        ====================================== */}

                        <div className="approval-actions">


                          <button
                            type="button"
                            className="reject-button"
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
                            className="approve-button"
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

                    );

                  })}

                </div>

              )}

            </div>

          </div>

  );

}

export default BookingApproval;
