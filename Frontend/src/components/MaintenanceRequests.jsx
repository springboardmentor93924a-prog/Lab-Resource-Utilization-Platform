import React, { useEffect, useMemo, useState } from "react";
import {
  getAllMaintenanceRequests,
  updateMaintenanceRequestStatus,
} from "../services/maintenanceApi";
import "./MaintenanceRequests.css";

function MaintenanceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD REQUESTS
  // =========================================================

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllMaintenanceRequests();

      setRequests(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Failed to load maintenance requests:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load maintenance requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // =========================================================
  // FILTER REQUESTS
  // =========================================================

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const equipmentName =
        request.equipment?.name ||
        request.equipment?.equipmentName ||
        "";

      const description =
        request.description || "";

      const searchText =
        `${equipmentName} ${description} ${request.id}`
          .toLowerCase();

      const matchesSearch =
        searchText.includes(
          search.toLowerCase()
        );

      const matchesStatus =
        statusFilter === "ALL" ||
        request.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        request.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    requests,
    search,
    statusFilter,
    priorityFilter,
  ]);

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const handleStatusUpdate = async (
    requestId,
    newStatus
  ) => {
    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      await updateMaintenanceRequestStatus(
        requestId,
        newStatus
      );

      await loadRequests();

      setSelectedRequest(null);

      setSuccess(
        "Maintenance request status updated successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);

    } catch (err) {
      console.error(
        "Failed to update request status:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update request status."
      );
    } finally {
      setUpdating(false);
    }
  };

  // =========================================================
  // STATUS LABEL
  // =========================================================

  const getStatusClass = (status) => {
    if (!status) return "";

    return status
      .toLowerCase()
      .replaceAll("_", "-");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="maintenance-requests-page">
        <div className="maintenance-requests-loading">
          Loading maintenance requests...
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="maintenance-requests-page">

      {/* HEADER */}

      <div className="maintenance-requests-header">

        <div>
          <span className="maintenance-eyebrow">
            MAINTENANCE MANAGEMENT
          </span>

          <h1>
            Maintenance Requests
          </h1>

          <p>
            Search, filter and manage maintenance requests.
          </p>
        </div>

        <button
          type="button"
          className="maintenance-request-refresh"
          onClick={loadRequests}
        >
          Refresh
        </button>

      </div>

      {/* MESSAGES */}

      {success && (
        <div className="maintenance-request-success">
          {success}
        </div>
      )}

      {error && (
        <div className="maintenance-request-error">
          {error}
        </div>
      )}

      {/* FILTERS */}

      <div className="maintenance-request-filters">

        <div className="maintenance-search">

          <span>🔍</span>

          <input
            type="text"
            placeholder="Search by equipment, description or ID..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="ALL">
            All Status
          </option>

          <option value="PENDING">
            Pending
          </option>

          <option value="IN_PROGRESS">
            In Progress
          </option>

          <option value="COMPLETED">
            Completed
          </option>

          <option value="CANCELLED">
            Cancelled
          </option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(e.target.value)
          }
        >
          <option value="ALL">
            All Priority
          </option>

          <option value="LOW">
            Low
          </option>

          <option value="MEDIUM">
            Medium
          </option>

          <option value="HIGH">
            High
          </option>

          <option value="CRITICAL">
            Critical
          </option>
        </select>

      </div>

      {/* RESULT COUNT */}

      <div className="maintenance-request-result-count">
        Showing{" "}
        <strong>
          {filteredRequests.length}
        </strong>{" "}
        of{" "}
        <strong>
          {requests.length}
        </strong>{" "}
        requests
      </div>

      {/* TABLE */}

      <div className="maintenance-request-table-wrapper">

        <table className="maintenance-request-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Equipment</th>
              <th>Description</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filteredRequests.length === 0 ? (

              <tr>
                <td
                  colSpan="7"
                  className="maintenance-request-empty"
                >
                  No maintenance requests found.
                </td>
              </tr>

            ) : (

              filteredRequests.map((request) => (

                <tr key={request.id}>

                  <td>
                    #{request.id}
                  </td>

                  <td>
                    <strong>
                      {request.equipment?.name ||
                        request.equipment?.equipmentName ||
                        `Equipment #${
                          request.equipment?.id ||
                          "-"
                        }`}
                    </strong>
                  </td>

                  <td>
                    <div className="maintenance-description-cell">
                      {request.description ||
                        "No description"}
                    </div>
                  </td>

                  <td>
                    <span
                      className={`maintenance-priority-badge ${
                        request.priority
                          ?.toLowerCase() || ""
                      }`}
                    >
                      {request.priority || "-"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`maintenance-request-status ${getStatusClass(
                        request.status
                      )}`}
                    >
                      {request.status
                        ?.replaceAll("_", " ") ||
                        "-"}
                    </span>
                  </td>

                  <td>
                    {request.createdAt
                      ? new Date(
                          request.createdAt
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>

                    <button
                      type="button"
                      className="maintenance-view-button"
                      onClick={() =>
                        setSelectedRequest(
                          request
                        )
                      }
                    >
                      View Details
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedRequest && (

        <div
          className="maintenance-request-modal-overlay"
          onClick={() =>
            !updating &&
            setSelectedRequest(null)
          }
        >

          <div
            className="maintenance-request-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="maintenance-request-modal-header">

              <div>
                <h2>
                  Maintenance Request #
                  {selectedRequest.id}
                </h2>

                <p>
                  Request details and status management
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRequest(null)
                }
                disabled={updating}
              >
                ×
              </button>

            </div>

            <div className="maintenance-request-details">

              <div className="maintenance-detail-row">
                <span>Equipment</span>
                <strong>
                  {selectedRequest.equipment?.name ||
                    selectedRequest.equipment?.equipmentName ||
                    `Equipment #${
                      selectedRequest.equipment?.id ||
                      "-"
                    }`}
                </strong>
              </div>

              <div className="maintenance-detail-row">
                <span>Description</span>
                <strong>
                  {selectedRequest.description ||
                    "No description"}
                </strong>
              </div>

              <div className="maintenance-detail-row">
                <span>Priority</span>
                <strong>
                  {selectedRequest.priority ||
                    "-"}
                </strong>
              </div>

              <div className="maintenance-detail-row">
                <span>Current Status</span>
                <strong>
                  {selectedRequest.status ||
                    "-"}
                </strong>
              </div>

              <div className="maintenance-detail-row">
                <span>Notes</span>
                <strong>
                  {selectedRequest.notes ||
                    "No notes"}
                </strong>
              </div>

              <div className="maintenance-detail-row">
                <span>Created</span>
                <strong>
                  {selectedRequest.createdAt
                    ? new Date(
                        selectedRequest.createdAt
                      ).toLocaleString()
                    : "-"}
                </strong>
              </div>

            </div>

            {/* STATUS ACTIONS */}

            <div className="maintenance-status-actions">

              <h3>
                Update Status
              </h3>

              <div className="maintenance-status-buttons">

                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    handleStatusUpdate(
                      selectedRequest.id,
                      "PENDING"
                    )
                  }
                >
                  Pending
                </button>

                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    handleStatusUpdate(
                      selectedRequest.id,
                      "IN_PROGRESS"
                    )
                  }
                >
                  In Progress
                </button>

                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    handleStatusUpdate(
                      selectedRequest.id,
                      "COMPLETED"
                    )
                  }
                >
                  Completed
                </button>

                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    handleStatusUpdate(
                      selectedRequest.id,
                      "CANCELLED"
                    )
                  }
                >
                  Cancelled
                </button>

              </div>

            </div>

            <div className="maintenance-request-modal-footer">

              <button
                type="button"
                onClick={() =>
                  setSelectedRequest(null)
                }
                disabled={updating}
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

export default MaintenanceRequests;