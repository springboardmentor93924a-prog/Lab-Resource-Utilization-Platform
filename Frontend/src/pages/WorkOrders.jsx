import React, { useEffect, useState } from "react";
import {
  getAllWorkOrders,
  startWorkOrder,
  updateWorkOrderStatus,
  completeWorkOrder,
  calculateDowntime,
} from "../services/maintenanceApi";
import "./WorkOrders.css";

// __define-ocg__

const WorkOrders = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [downtimeLoading, setDowntimeLoading] = useState({});
  const [downtimeData, setDowntimeData] = useState({});

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [completionNotes, setCompletionNotes] = useState("");

  useEffect(() => {
    loadWorkOrders();
  }, []);

  /*
   * Live downtime refresh.
   *
   * This makes IN_PROGRESS downtime update automatically.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setDowntimeData((previous) => {
        const updated = { ...previous };

        workOrders.forEach((workOrder) => {
          if (workOrder.actualStart) {
            updated[workOrder.id] = calculateDowntimeLocally(workOrder);
          }
        });

        return updated;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [workOrders]);

  const loadWorkOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllWorkOrders();

      const orders = Array.isArray(data) ? data : [];

      setWorkOrders(orders);

      /*
       * Calculate downtime immediately from the actual timestamps.
       * This avoids depending on the backend downtime response shape.
       */
      const calculatedDowntime = {};

      orders.forEach((workOrder) => {
        if (workOrder.actualStart) {
          calculatedDowntime[workOrder.id] =
            calculateDowntimeLocally(workOrder);
        }
      });

      setDowntimeData(calculatedDowntime);
    } catch (err) {
      console.error("Error loading work orders:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load work orders."
      );
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMessage = (message) => {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  // =========================================================
  // DOWNTIME CALCULATION
  // =========================================================

  /*
   * Correct downtime calculation:
   *
   * Started + completed:
   * actualEnd - actualStart
   *
   * Started + not completed:
   * current time - actualStart
   *
   * Not started:
   * "Not Started"
   */
  const calculateDowntimeLocally = (workOrder) => {
    if (!workOrder?.actualStart) {
      return {
        status: "NOT_STARTED",
        hours: null,
        minutes: null,
      };
    }

    const start = new Date(workOrder.actualStart);

    if (isNaN(start.getTime())) {
      return {
        status: "NOT_STARTED",
        hours: null,
        minutes: null,
      };
    }

    let end;

    if (workOrder.actualEnd) {
      end = new Date(workOrder.actualEnd);
    } else {
      end = new Date();
    }

    if (isNaN(end.getTime())) {
      return {
        status: "NOT_STARTED",
        hours: null,
        minutes: null,
      };
    }

    const difference = end.getTime() - start.getTime();

    if (difference <= 0) {
      return {
        status: "CALCULATED",
        hours: 0,
        minutes: 0,
      };
    }

    const totalMinutes = Math.floor(
      difference / (1000 * 60)
    );

    const hours = totalMinutes / 60;

    return {
      status: workOrder.actualEnd
        ? "COMPLETED"
        : "IN_PROGRESS",
      hours,
      minutes: totalMinutes,
    };
  };

  /*
   * Format downtime consistently everywhere.
   */
  const formatDowntimeValue = (downtime) => {
    if (!downtime) {
      return "Not Started";
    }

    if (downtime.status === "NOT_STARTED") {
      return "Not Started";
    }

    const totalMinutes =
      downtime.minutes ??
      Math.round((downtime.hours || 0) * 60);

    if (totalMinutes <= 0) {
      return "0 min";
    }

    const days = Math.floor(totalMinutes / 1440);

    const remainingAfterDays =
      totalMinutes % 1440;

    const hours = Math.floor(
      remainingAfterDays / 60
    );

    const minutes =
      remainingAfterDays % 60;

    const parts = [];

    if (days > 0) {
      parts.push(
        `${days} day${days !== 1 ? "s" : ""}`
      );
    }

    if (hours > 0) {
      parts.push(`${hours} hr`);
    }

    if (minutes > 0) {
      parts.push(`${minutes} min`);
    }

    return parts.length > 0
      ? parts.join(" ")
      : "0 min";
  };

  const getDowntimeHours = (downtime) => {
    if (
      !downtime ||
      downtime.status === "NOT_STARTED"
    ) {
      return null;
    }

    if (
      downtime.hours === null ||
      downtime.hours === undefined
    ) {
      return null;
    }

    return Number(downtime.hours);
  };

  /*
   * Recalculate one work order.
   *
   * The backend endpoint is still called so your existing
   * API integration remains available, but the displayed
   * value is calculated from actualStart / actualEnd.
   */
  const handleCalculateDowntime = async (workOrder) => {
    const workOrderId = workOrder.id;

    try {
      setDowntimeLoading((previous) => ({
        ...previous,
        [workOrderId]: true,
      }));

      setError("");

      /*
       * Calculate immediately from frontend timestamps.
       */
      const localResult =
        calculateDowntimeLocally(workOrder);

      setDowntimeData((previous) => ({
        ...previous,
        [workOrderId]: localResult,
      }));

      /*
       * Call existing backend endpoint as well.
       *
       * We intentionally do not use its response as the
       * displayed downtime because the controller returns
       * the WorkOrder object.
       */
      try {
        await calculateDowntime(workOrderId);
      } catch (backendError) {
        console.warn(
          "Backend downtime endpoint returned an error. Using local calculation.",
          backendError
        );
      }

      showSuccessMessage(
        `Downtime calculated for Work Order #${workOrderId}.`
      );
    } catch (err) {
      console.error(
        "Error calculating downtime:",
        err
      );

      setError(
        err.response?.data?.message ||
          `Failed to calculate downtime for Work Order #${workOrderId}.`
      );
    } finally {
      setDowntimeLoading((previous) => ({
        ...previous,
        [workOrderId]: false,
      }));
    }
  };

  // =========================================================
  // START WORK
  // =========================================================

  const handleStartWork = async (workOrderId) => {
    if (!window.confirm("Start this work order?")) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await startWorkOrder(workOrderId);

      showSuccessMessage(
        "Work order started successfully."
      );

      await loadWorkOrders();
    } catch (err) {
      console.error(
        "Error starting work order:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to start work order."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const handleStatusChange = async (
    workOrderId,
    newStatus
  ) => {
    try {
      setActionLoading(true);
      setError("");

      await updateWorkOrderStatus(
        workOrderId,
        newStatus
      );

      showSuccessMessage(
        `Work order status updated to ${formatStatus(
          newStatus
        )}.`
      );

      await loadWorkOrders();
    } catch (err) {
      console.error(
        "Error updating work order status:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update work order status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // COMPLETE MODAL
  // =========================================================

  const openCompleteModal = (workOrder) => {
    setSelectedWorkOrder(workOrder);
    setCompletionNotes(
      workOrder.completionNotes || ""
    );
    setShowCompleteModal(true);
    setError("");
  };

  const closeCompleteModal = () => {
    setShowCompleteModal(false);
    setSelectedWorkOrder(null);
    setCompletionNotes("");
  };

  // =========================================================
  // COMPLETE WORK
  // =========================================================

  const handleCompleteWork = async () => {
    if (!selectedWorkOrder) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await completeWorkOrder(
        selectedWorkOrder.id,
        completionNotes.trim()
      );

      closeCompleteModal();

      showSuccessMessage(
        "Work order completed successfully."
      );

      await loadWorkOrders();
    } catch (err) {
      console.error(
        "Error completing work order:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to complete work order."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "CREATED":
        return "status-created";

      case "ASSIGNED":
        return "status-assigned";

      case "IN_PROGRESS":
        return "status-progress";

      case "COMPLETED":
        return "status-completed";

      case "CANCELLED":
        return "status-cancelled";

      default:
        return "";
    }
  };

  const getEquipmentName = (workOrder) => {
    return (
      workOrder?.equipment?.name ||
      workOrder?.equipment?.equipmentName ||
      workOrder?.equipmentName ||
      `Equipment #${
        workOrder?.equipment?.id || "N/A"
      }`
    );
  };

  const getTechnicianName = (workOrder) => {
    const technician =
      workOrder?.technician;

    if (!technician) {
      return "Unassigned";
    }

    if (
      technician.firstName ||
      technician.lastName
    ) {
      return `${technician.firstName || ""} ${
        technician.lastName || ""
      }`.trim();
    }

    return (
      technician.name ||
      technician.fullName ||
      technician.username ||
      technician.email ||
      `Technician #${
        technician.id || "N/A"
      }`
    );
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return "—";
    }

    try {
      const date = new Date(dateTime);

      if (isNaN(date.getTime())) {
        return dateTime;
      }

      return date.toLocaleString();
    } catch {
      return dateTime;
    }
  };

  if (loading) {
    return (
      <div className="work-orders-page">
        <div className="work-orders-loading">
          Loading work orders...
        </div>
      </div>
    );
  }

  return (
    <div className="work-orders-page">

      {/* HEADER */}
      <div className="work-orders-header">
        <div>
          <h1>Work Orders</h1>
          <p>
            Manage maintenance work, technicians
            and completion status.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={loadWorkOrders}
          disabled={actionLoading}
        >
          ↻ Refresh
        </button>
      </div>

      {/* SUCCESS */}
      {success && (
        <div className="work-order-alert success-alert">
          ✓ {success}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="work-order-alert error-alert">
          ⚠ {error}
        </div>
      )}

      {/* SUMMARY */}
      <div className="work-order-summary">

        <div className="summary-card">
          <span>Total</span>
          <strong>
            {workOrders.length}
          </strong>
        </div>

        <div className="summary-card">
          <span>Created</span>
          <strong>
            {
              workOrders.filter(
                (order) =>
                  order.status === "CREATED"
              ).length
            }
          </strong>
        </div>

        <div className="summary-card">
          <span>Assigned</span>
          <strong>
            {
              workOrders.filter(
                (order) =>
                  order.status === "ASSIGNED"
              ).length
            }
          </strong>
        </div>

        <div className="summary-card">
          <span>In Progress</span>
          <strong>
            {
              workOrders.filter(
                (order) =>
                  order.status ===
                  "IN_PROGRESS"
              ).length
            }
          </strong>
        </div>

        <div className="summary-card">
          <span>Completed</span>
          <strong>
            {
              workOrders.filter(
                (order) =>
                  order.status === "COMPLETED"
              ).length
            }
          </strong>
        </div>

      </div>

      {/* TABLE */}
      <div className="work-orders-card">

        <div className="table-header">
          <h2>
            Work Order Management
          </h2>

          <span>
            {workOrders.length} work order
            {workOrders.length !== 1
              ? "s"
              : ""}
          </span>
        </div>

        {workOrders.length === 0 ? (
          <div className="empty-work-orders">
            No work orders found.
          </div>
        ) : (
          <div className="table-container">

            <table className="work-orders-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Equipment</th>
                  <th>Work Description</th>
                  <th>Technician</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th>Downtime</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {workOrders.map(
                  (workOrder) => {

                    const downtime =
                      downtimeData[
                        workOrder.id
                      ];

                    return (
                      <tr
                        key={
                          workOrder.id
                        }
                      >

                        <td>
                          <strong>
                            #{workOrder.id}
                          </strong>
                        </td>

                        <td>
                          {getEquipmentName(
                            workOrder
                          )}
                        </td>

                        <td>
                          <div className="work-description">
                            {workOrder.workDescription ||
                              "—"}
                          </div>
                        </td>

                        <td>
                          {getTechnicianName(
                            workOrder
                          )}
                        </td>

                        <td>
                          <div className="schedule-info">

                            <span>
                              Start:{" "}
                              {formatDateTime(
                                workOrder.scheduledStart
                              )}
                            </span>

                            <span>
                              End:{" "}
                              {formatDateTime(
                                workOrder.scheduledEnd
                              )}
                            </span>

                          </div>
                        </td>

                        <td>
                          <span
                            className={`status-badge ${getStatusClass(
                              workOrder.status
                            )}`}
                          >
                            {formatStatus(
                              workOrder.status
                            )}
                          </span>
                        </td>

                        {/* DOWNTIME */}
                        <td>

                          <div className="downtime-cell">

                            {downtime !==
                            undefined ? (

                              <div className="downtime-result">

                                <span className="downtime-value">
                                  {formatDowntimeValue(
                                    downtime
                                  )}
                                </span>

                                {getDowntimeHours(
                                  downtime
                                ) !== null && (
                                  <span className="downtime-hours">
                                    {getDowntimeHours(
                                      downtime
                                    ).toFixed(
                                      2
                                    )}{" "}
                                    hours
                                  </span>
                                )}

                              </div>

                            ) : (

                              <button
                                className="downtime-btn"
                                onClick={() =>
                                  handleCalculateDowntime(
                                    workOrder
                                  )
                                }
                                disabled={
                                  downtimeLoading[
                                    workOrder.id
                                  ]
                                }
                              >
                                {downtimeLoading[
                                  workOrder.id
                                ]
                                  ? "Calculating..."
                                  : "Calculate"}
                              </button>

                            )}

                          </div>

                        </td>

                        {/* ACTIONS */}
                        <td>

                          <div className="work-order-actions">

                            {workOrder.status ===
                              "ASSIGNED" && (
                              <button
                                className="action-btn start-btn"
                                onClick={() =>
                                  handleStartWork(
                                    workOrder.id
                                  )
                                }
                                disabled={
                                  actionLoading
                                }
                              >
                                ▶ Start Work
                              </button>
                            )}

                            {workOrder.status !==
                              "COMPLETED" &&
                              workOrder.status !==
                                "CANCELLED" && (

                              <select
                                className="status-select"
                                value={
                                  workOrder.status ||
                                  ""
                                }
                                onChange={(event) =>
                                  handleStatusChange(
                                    workOrder.id,
                                    event.target.value
                                  )
                                }
                                disabled={
                                  actionLoading
                                }
                              >

                                <option value="CREATED">
                                  Created
                                </option>

                                <option value="ASSIGNED">
                                  Assigned
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
                            )}

                            {workOrder.status ===
                              "IN_PROGRESS" && (

                              <button
                                className="action-btn complete-btn"
                                onClick={() =>
                                  openCompleteModal(
                                    workOrder
                                  )
                                }
                                disabled={
                                  actionLoading
                                }
                              >
                                ✓ Complete
                              </button>

                            )}

                            {workOrder.status ===
                              "COMPLETED" && (

                              <span className="completed-label">
                                ✓ Completed
                              </span>

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

      </div>

      {/* COMPLETE WORK MODAL */}
      {showCompleteModal &&
        selectedWorkOrder && (

        <div className="complete-modal-overlay">

          <div className="complete-modal">

            <div className="complete-modal-header">

              <div>
                <h2>
                  Complete Work Order
                </h2>

                <p>
                  Work Order #
                  {selectedWorkOrder.id}
                </p>
              </div>

              <button
                className="modal-close-btn"
                onClick={
                  closeCompleteModal
                }
                disabled={
                  actionLoading
                }
              >
                ×
              </button>

            </div>

            <div className="complete-modal-body">

              <div className="completion-info">
                <strong>
                  Equipment:
                </strong>

                <span>
                  {getEquipmentName(
                    selectedWorkOrder
                  )}
                </span>
              </div>

              <div className="completion-info">
                <strong>
                  Technician:
                </strong>

                <span>
                  {getTechnicianName(
                    selectedWorkOrder
                  )}
                </span>
              </div>

              <label htmlFor="completionNotes">
                Completion Notes
              </label>

              <textarea
                id="completionNotes"
                value={
                  completionNotes
                }
                onChange={(event) =>
                  setCompletionNotes(
                    event.target.value
                  )
                }
                placeholder="Enter details about the completed maintenance work..."
                rows="6"
                maxLength="2000"
                disabled={
                  actionLoading
                }
              />

              <div className="character-count">
                {completionNotes.length}
                /2000
              </div>

            </div>

            <div className="complete-modal-footer">

              <button
                className="cancel-modal-btn"
                onClick={
                  closeCompleteModal
                }
                disabled={
                  actionLoading
                }
              >
                Cancel
              </button>

              <button
                className="confirm-complete-btn"
                onClick={
                  handleCompleteWork
                }
                disabled={
                  actionLoading
                }
              >
                {actionLoading
                  ? "Completing..."
                  : "Complete Work"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default WorkOrders;