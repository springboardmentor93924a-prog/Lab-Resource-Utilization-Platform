import React, { useEffect, useState } from "react";

import {
  getAllMaintenanceRequests,
  getAllWorkOrders,
  formatDowntime,
} from "../services/maintenanceApi";


const MaintenanceHistory = () => {
  const [requests, setRequests] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  // ============================================================
  // LOAD HISTORY
  // ============================================================

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const [requestData, workOrderData] = await Promise.all([
        getAllMaintenanceRequests(),
        getAllWorkOrders(),
      ]);

      setRequests(
        Array.isArray(requestData)
          ? requestData
          : []
      );

      setWorkOrders(
        Array.isArray(workOrderData)
          ? workOrderData
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load maintenance history:",
        err
      );

      setError(
        "Failed to load maintenance history."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // EQUIPMENT NAME
  // ============================================================

  const getEquipmentName = (equipment) => {
    if (!equipment) {
      return "N/A";
    }

    return (
      equipment.name ||
      equipment.equipmentName ||
      `Equipment #${equipment.id}`
    );
  };

  // ============================================================
  // TECHNICIAN NAME
  // ============================================================

  const getTechnicianName = (technician) => {
    if (!technician) {
      return "Not Assigned";
    }

    return (
      technician.name ||
      technician.fullName ||
      technician.email ||
      `Technician #${technician.id}`
    );
  };

  // ============================================================
  // STATUS CLASS
  // ============================================================

  const getStatusClass = (status) => {
    if (!status) {
      return "";
    }

    return `history-status-${status
      .toLowerCase()
      .replace(/_/g, "-")}`;
  };

  // ============================================================
  // PRIORITY CLASS
  // ============================================================

  const getPriorityClass = (priority) => {
    if (!priority) {
      return "";
    }

    return `history-priority-${priority
      .toLowerCase()
      .replace(/_/g, "-")}`;
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="maintenance-history-page">
        <div className="maintenance-history-loading">
          <div className="maintenance-history-spinner"></div>
          Loading maintenance history...
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="maintenance-history-page">

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="maintenance-history-header">

        <div className="maintenance-history-title-section">

          <h1>
            Maintenance History
          </h1>

          <p>
            Complete maintenance and work-order history
          </p>

        </div>

        <button
          className="maintenance-history-refresh-btn"
          onClick={loadHistory}
          disabled={loading}
        >
          Refresh
        </button>

      </div>

      {/* ======================================================
          ERROR
      ======================================================= */}

      {error && (
        <div className="maintenance-history-error">
          {error}
        </div>
      )}

      {/* ======================================================
          SUMMARY CARDS
      ======================================================= */}

      <div className="maintenance-history-summary">

        <div className="maintenance-history-card">

          <div className="maintenance-history-card-label">
            Total Requests
          </div>

          <div className="maintenance-history-card-value">
            {requests.length}
          </div>

        </div>


        <div className="maintenance-history-card">

          <div className="maintenance-history-card-label">
            Total Work Orders
          </div>

          <div className="maintenance-history-card-value">
            {workOrders.length}
          </div>

        </div>


        <div className="maintenance-history-card">

          <div className="maintenance-history-card-label">
            Completed Work
          </div>

          <div className="maintenance-history-card-value">
            {
              workOrders.filter(
                (workOrder) =>
                  workOrder.status === "COMPLETED"
              ).length
            }
          </div>

        </div>


        <div className="maintenance-history-card">

          <div className="maintenance-history-card-label">
            In Progress
          </div>

          <div className="maintenance-history-card-value">
            {
              workOrders.filter(
                (workOrder) =>
                  workOrder.status === "IN_PROGRESS"
              ).length
            }
          </div>

        </div>

      </div>

      {/* ======================================================
          MAINTENANCE REQUEST HISTORY
      ======================================================= */}

      <div className="maintenance-history-table-container work-order-history-container">

        <div className="maintenance-history-table-header">

          <h2>
            Maintenance Requests
          </h2>

        </div>

        <div className="maintenance-history-table-wrapper">

          <table className="maintenance-history-table">

            <thead>

              <tr>

                <th>
                  Request ID
                </th>

                <th>
                  Equipment
                </th>

                <th>
                  Description
                </th>

                <th>
                  Priority
                </th>

                <th>
                  Status
                </th>

                <th>
                  Requested At
                </th>

              </tr>

            </thead>


            <tbody>

              {requests.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                  >

                    <div className="maintenance-history-empty">

                      <div className="maintenance-history-empty-icon">
                        🔧
                      </div>

                      <h3>
                        No Maintenance Requests
                      </h3>

                      <p>
                        No maintenance request history is available.
                      </p>

                    </div>

                  </td>

                </tr>

              ) : (

                requests.map((request) => (

                  <tr key={request.id}>

                    {/* Request ID */}

                    <td>
                      #{request.id}
                    </td>


                    {/* Equipment */}

                    <td>

                      <div className="history-equipment-name">
                        {getEquipmentName(
                          request.equipment
                        )}
                      </div>

                      {request.equipment?.id && (
                        <span className="history-equipment-id">
                          Equipment #{request.equipment.id}
                        </span>
                      )}

                    </td>


                    {/* Description */}

                    <td>

                      <div className="history-description">
                        {request.description || "N/A"}
                      </div>

                    </td>


                    {/* Priority */}

                    <td>

                      <span
                        className={`history-priority-badge ${getPriorityClass(
                          request.priority
                        )}`}
                      >
                        {request.priority || "N/A"}
                      </span>

                    </td>


                    {/* Status */}

                    <td>

                      <span
                        className={`history-status-badge ${getStatusClass(
                          request.status
                        )}`}
                      >
                        {request.status || "N/A"}
                      </span>

                    </td>


                    {/* Requested At */}

                    <td>

                      <div className="history-date">

                        {request.requestedAt
                          ? new Date(
                              request.requestedAt
                            ).toLocaleDateString()
                          : "N/A"}

                        {request.requestedAt && (
                          <span className="history-date-time">
                            {new Date(
                              request.requestedAt
                            ).toLocaleTimeString()}
                          </span>
                        )}

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ======================================================
          WORK ORDER HISTORY
      ======================================================= */}

      <div
        className="maintenance-history-table-container"
        style={{
          marginTop: "24px",
        }}
      >

        <div className="maintenance-history-table-header">

          <h2>
            Work Order History
          </h2>

        </div>


        <div className="maintenance-history-table-wrapper">

          <table className="maintenance-history-table">

            <thead>

              <tr>

                <th>
                  Work Order
                </th>

                <th>
                  Equipment
                </th>

                <th>
                  Technician
                </th>

                <th>
                  Status
                </th>

                <th>
                  Actual Start
                </th>

                <th>
                  Actual End
                </th>

                <th>
                  Downtime
                </th>

                <th>
                  Completion Notes
                </th>

              </tr>

            </thead>


            <tbody>

              {workOrders.length === 0 ? (

                <tr>

                  <td
                    colSpan="8"
                  >

                    <div className="maintenance-history-empty">

                      <div className="maintenance-history-empty-icon">
                        🛠️
                      </div>

                      <h3>
                        No Work Orders
                      </h3>

                      <p>
                        No work order history is available.
                      </p>

                    </div>

                  </td>

                </tr>

              ) : (

                workOrders.map((workOrder) => (

                  <tr key={workOrder.id}>

                    {/* Work Order ID */}

                    <td>
                      #{workOrder.id}
                    </td>


                    {/* Equipment */}

                    <td>

                      <div className="history-equipment-name">
                        {getEquipmentName(
                          workOrder.equipment
                        )}
                      </div>

                      {workOrder.equipment?.id && (
                        <span className="history-equipment-id">
                          Equipment #{workOrder.equipment.id}
                        </span>
                      )}

                    </td>


                    {/* Technician */}

                    <td>

                      {getTechnicianName(
                        workOrder.technician
                      )}

                    </td>


                    {/* Status */}

                    <td>

                      <span
                        className={`history-status-badge ${getStatusClass(
                          workOrder.status
                        )}`}
                      >
                        {workOrder.status || "N/A"}
                      </span>

                    </td>


                    {/* Actual Start */}

                    <td>

                      <div className="history-date">

                        {workOrder.actualStart
                          ? new Date(
                              workOrder.actualStart
                            ).toLocaleDateString()
                          : "N/A"}

                        {workOrder.actualStart && (
                          <span className="history-date-time">
                            {new Date(
                              workOrder.actualStart
                            ).toLocaleTimeString()}
                          </span>
                        )}

                      </div>

                    </td>


                    {/* Actual End */}

                    <td>

                      <div className="history-date">

                        {workOrder.actualEnd
                          ? new Date(
                              workOrder.actualEnd
                            ).toLocaleDateString()
                          : "Running"}

                        {workOrder.actualEnd && (
                          <span className="history-date-time">
                            {new Date(
                              workOrder.actualEnd
                            ).toLocaleTimeString()}
                          </span>
                        )}

                      </div>

                    </td>


                    {/* Downtime */}

                    <td>

                      <span className="history-downtime">

                        {formatDowntime(
                          workOrder.actualStart,
                          workOrder.actualEnd
                        )}

                      </span>

                    </td>


                    {/* Completion Notes */}

                    <td>

                      <div className="history-description">

                        {workOrder.completionNotes ||
                          "—"}

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default MaintenanceHistory;