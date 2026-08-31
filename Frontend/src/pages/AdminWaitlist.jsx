import { useEffect, useState } from "react";
import api from "../services/api";

function AdminWaitlist() {
  const [waitlists, setWaitlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const [selectedWaitlist, setSelectedWaitlist] = useState(null);

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD ALL ACTIVE WAITLISTS
  // =========================================================

  useEffect(() => {
    loadWaitlists();
  }, []);

  const loadWaitlists = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("Loading all waitlists...");

      const response = await api.get("/waitlists");

      console.log(
        "Admin Waitlist API Response:",
        response.data
      );

      let data = response.data;
      let list = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data.waitlists)) {
        list = data.waitlists;
      } else if (Array.isArray(data.data)) {
        list = data.data;
      } else {
        console.warn(
          "Unexpected waitlist response:",
          data
        );
        list = [];
      }

      // =====================================================
      // IMPORTANT:
      // Do NOT display cancelled waitlists in admin page
      // =====================================================

      const activeWaitlists = list.filter(
        (waitlist) =>
          waitlist.status
            ?.toString()
            .toUpperCase() !== "CANCELLED"
      );

      setWaitlists(activeWaitlists);

    } catch (err) {
      console.error(
        "Admin waitlist loading error:",
        err
      );

      console.error(
        "Server response:",
        err.response?.data
      );

      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Unable to load waitlist requests."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = async () => {
    setRefreshing(true);
    setError("");
    setSuccess("");

    try {
      console.log("Refreshing admin waitlists...");

      const response =
        await api.get("/waitlists");

      let data = response.data;
      let list = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data.waitlists)) {
        list = data.waitlists;
      } else if (Array.isArray(data.data)) {
        list = data.data;
      }

      // =====================================================
      // REMOVE CANCELLED REQUESTS
      // =====================================================

      const activeWaitlists = list.filter(
        (waitlist) =>
          waitlist.status
            ?.toString()
            .toUpperCase() !== "CANCELLED"
      );

      setWaitlists(activeWaitlists);

      setSuccess(
        "Waitlist list refreshed successfully."
      );

    } catch (err) {
      console.error(
        "Refresh waitlist error:",
        err
      );

      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Unable to refresh waitlists."
      );

    } finally {
      setRefreshing(false);
    }
  };

  // =========================================================
  // CANCEL WAITLIST
  // =========================================================

  const handleCancel = async (waitlistId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this waitlist request?"
    );

    if (!confirmed) {
      return;
    }

    setCancellingId(waitlistId);
    setError("");
    setSuccess("");

    try {
      console.log(
        "Admin cancelling waitlist:",
        waitlistId
      );

      const response = await api.put(
        `/waitlists/${waitlistId}/cancel`
      );

      console.log(
        "Cancel response:",
        response.data
      );

      // =====================================================
      // IMPORTANT:
      // REMOVE THE CANCELLED REQUEST FROM THE PAGE
      // =====================================================

      setWaitlists((previous) =>
        previous.filter(
          (waitlist) =>
            waitlist.id !== waitlistId
        )
      );

      // Close details modal if it was open
      if (
        selectedWaitlist &&
        selectedWaitlist.id === waitlistId
      ) {
        setSelectedWaitlist(null);
      }

      setSuccess(
        "Waitlist request cancelled and removed successfully."
      );

    } catch (err) {
      console.error(
        "Cancel waitlist error:",
        err
      );

      console.error(
        "Server response:",
        err.response?.data
      );

      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Unable to cancel waitlist request."
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
  // FILTER WAITLISTS
  // =========================================================

  const filteredWaitlists =
    statusFilter === "ALL"
      ? waitlists
      : waitlists.filter(
          (waitlist) =>
            waitlist.status
              ?.toString()
              .toUpperCase() === statusFilter
        );

  // =========================================================
  // VIEW DETAILS
  // =========================================================

  const handleViewDetails = (waitlist) => {
    setSelectedWaitlist(waitlist);
  };

  // =========================================================
  // CLOSE DETAILS
  // =========================================================

  const closeDetails = () => {
    setSelectedWaitlist(null);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="admin-waitlist-page">
        <div className="loading">
          Loading waitlist requests...
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="admin-waitlist-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="page-header">

        <div>
          <h1>
            Waitlist Management
          </h1>

          <p>
            View and manage equipment waitlist requests.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing
            ? "Refreshing..."
            : "↻ Refresh"}
        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {/* =====================================================
          FILTER
      ===================================================== */}

      <div className="waitlist-filter-section">

        <div>

          <label>
            Filter by Status
          </label>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >

            <option value="ALL">
              All Requests
            </option>

            <option value="WAITING">
              Waiting
            </option>

            <option value="NOTIFIED">
              Notified
            </option>

            <option value="BOOKED">
              Booked
            </option>

            {/* 
              CANCELLED option removed because cancelled
              requests are no longer displayed.
            */}

          </select>

        </div>

        <div className="waitlist-count">

          Showing{" "}
          <strong>
            {filteredWaitlists.length}
          </strong>{" "}
          of{" "}
          <strong>
            {waitlists.length}
          </strong>{" "}
          active requests

        </div>

      </div>

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {filteredWaitlists.length === 0 && (

        <div className="empty-state">

          <div className="empty-icon">
            ⏳
          </div>

          <h2>
            No Waitlist Requests
          </h2>

          <p>
            There are no active waitlist requests
            matching the selected filter.
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={handleRefresh}
          >
            Refresh
          </button>

        </div>
      )}

      {/* =====================================================
          WAITLIST TABLE
      ===================================================== */}

      {filteredWaitlists.length > 0 && (

        <div className="admin-waitlist-table-container">

          <table className="admin-waitlist-table">

            <thead>

              <tr>

                <th>
                  #
                </th>

                <th>
                  Equipment
                </th>

                <th>
                  User
                </th>

                <th>
                  Date
                </th>

                <th>
                  Time
                </th>

                <th>
                  Purpose
                </th>

                <th>
                  Status
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredWaitlists.map(
                (waitlist, index) => {

                  const equipment =
                    waitlist.equipment || {};

                  const user =
                    waitlist.user || {};

                  const equipmentName =
                    waitlist.equipmentName ||
                    equipment.name ||
                    "Equipment";

                  const equipmentAssetTag =
                    waitlist.equipmentAssetTag ||
                    equipment.assetTag ||
                    "";

                  const userName =
                    waitlist.userName ||
                    waitlist.fullName ||
                    user.fullName ||
                    "User";

                  const userEmail =
                    waitlist.userEmail ||
                    user.email ||
                    "";

                  const status =
                    waitlist.status ||
                    "UNKNOWN";

                  const normalizedStatus =
                    status
                      .toString()
                      .toUpperCase();

                  return (

                    <tr key={waitlist.id}>

                      {/* NUMBER */}

                      <td>
                        {index + 1}
                      </td>

                      {/* EQUIPMENT */}

                      <td>

                        <div className="admin-equipment-info">

                          <strong>
                            {equipmentName}
                          </strong>

                          {equipmentAssetTag && (
                            <span>
                              {equipmentAssetTag}
                            </span>
                          )}

                        </div>

                      </td>

                      {/* USER */}

                      <td>

                        <div className="admin-user-info">

                          <strong>
                            {userName}
                          </strong>

                          {userEmail && (
                            <span>
                              {userEmail}
                            </span>
                          )}

                        </div>

                      </td>

                      {/* DATE */}

                      <td>
                        {waitlist.bookingDate ||
                          waitlist.date ||
                          "—"}
                      </td>

                      {/* TIME */}

                      <td>

                        {waitlist.startTime ||
                          "--:--"}

                        {" - "}

                        {waitlist.endTime ||
                          "--:--"}

                      </td>

                      {/* PURPOSE */}

                      <td>

                        <span className="purpose-text">

                          {waitlist.purpose ||
                            "Not specified"}

                        </span>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`waitlist-status ${getStatusClass(
                            status
                          )}`}
                        >
                          {getStatusText(status)}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="admin-waitlist-actions">

                          <button
                            type="button"
                            className="view-button"
                            onClick={() =>
                              handleViewDetails(
                                waitlist
                              )
                            }
                          >
                            View
                          </button>

                          {normalizedStatus !==
                            "CANCELLED" && (

                            <button
                              type="button"
                              className="cancel-button"
                              onClick={() =>
                                handleCancel(
                                  waitlist.id
                                )
                              }
                              disabled={
                                cancellingId ===
                                waitlist.id
                              }
                            >

                              {cancellingId ===
                              waitlist.id
                                ? "Cancelling..."
                                : "Cancel"}

                            </button>

                          )}

                        </div>

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>
      )}

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedWaitlist && (

        <div
          className="waitlist-modal-overlay"
          onClick={closeDetails}
        >

          <div
            className="waitlist-details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <h2>
                  Waitlist Details
                </h2>

                <p>
                  Request #{selectedWaitlist.id}
                </p>

              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={closeDetails}
              >
                ×
              </button>

            </div>

            {/* MODAL DETAILS */}

            <div className="modal-details">

              {/* EQUIPMENT */}

              <div className="modal-detail">

                <span>
                  Equipment
                </span>

                <strong>
                  {selectedWaitlist.equipmentName ||
                    selectedWaitlist.equipment?.name ||
                    "Equipment"}
                </strong>

              </div>

              {/* ASSET TAG */}

              <div className="modal-detail">

                <span>
                  Asset Tag
                </span>

                <strong>
                  {selectedWaitlist.equipmentAssetTag ||
                    selectedWaitlist.equipment?.assetTag ||
                    "—"}
                </strong>

              </div>

              {/* USER */}

              <div className="modal-detail">

                <span>
                  User
                </span>

                <strong>
                  {selectedWaitlist.userName ||
                    selectedWaitlist.fullName ||
                    selectedWaitlist.user?.fullName ||
                    "User"}
                </strong>

              </div>

              {/* EMAIL */}

              <div className="modal-detail">

                <span>
                  Email
                </span>

                <strong>
                  {selectedWaitlist.userEmail ||
                    selectedWaitlist.user?.email ||
                    "—"}
                </strong>

              </div>

              {/* BOOKING DATE */}

              <div className="modal-detail">

                <span>
                  Booking Date
                </span>

                <strong>
                  {selectedWaitlist.bookingDate ||
                    "—"}
                </strong>

              </div>

              {/* TIME */}

              <div className="modal-detail">

                <span>
                  Time
                </span>

                <strong>

                  {selectedWaitlist.startTime ||
                    "--:--"}

                  {" - "}

                  {selectedWaitlist.endTime ||
                    "--:--"}

                </strong>

              </div>

              {/* STATUS */}

              <div className="modal-detail">

                <span>
                  Status
                </span>

                <span
                  className={`waitlist-status ${getStatusClass(
                    selectedWaitlist.status
                  )}`}
                >
                  {getStatusText(
                    selectedWaitlist.status
                  )}
                </span>

              </div>

              {/* PURPOSE */}

              <div className="modal-detail modal-purpose">

                <span>
                  Purpose
                </span>

                <p>
                  {selectedWaitlist.purpose ||
                    "Not specified"}
                </p>

              </div>

              {/* CREATED AT */}

              <div className="modal-detail">

                <span>
                  Created At
                </span>

                <strong>
                  {selectedWaitlist.createdAt ||
                    "—"}
                </strong>

              </div>

            </div>

            {/* MODAL ACTIONS */}

            <div className="modal-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={() =>
                  handleCancel(
                    selectedWaitlist.id
                  )
                }
                disabled={
                  cancellingId ===
                  selectedWaitlist.id
                }
              >

                {cancellingId ===
                selectedWaitlist.id
                  ? "Cancelling..."
                  : "Cancel Waitlist"}

              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={closeDetails}
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminWaitlist;