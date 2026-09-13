import React, {
  useEffect,
  useState,
} from "react";

import {
  getAllMaintenanceRequests,
  getAllWorkOrders,
  calculateDowntime,
} from "../services/maintenanceApi";

import "./MaintenanceHistory.css";

// __define-ocg__

const MaintenanceHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedItem, setSelectedItem] =
    useState(null);

  const [downtimeData, setDowntimeData] =
    useState({});

  const [downtimeLoading, setDowntimeLoading] =
    useState({});

  useEffect(() => {
    loadHistory();
  }, []);

  /*
   * Keep IN_PROGRESS downtime live.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setDowntimeData((previous) => {
        const updated = { ...previous };

        history.forEach((item) => {
          const workOrder =
            item.workOrder;

          if (
            workOrder?.actualStart &&
            !workOrder?.actualEnd
          ) {
            updated[workOrder.id] =
              calculateDowntimeLocally(
                workOrder
              );
          }
        });

        return updated;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [history]);

  // =========================================================
  // LOAD HISTORY
  // =========================================================

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        requests,
        workOrders,
      ] = await Promise.all([
        getAllMaintenanceRequests(),
        getAllWorkOrders(),
      ]);

      const requestList =
        Array.isArray(requests)
          ? requests
          : [];

      const workOrderList =
        Array.isArray(workOrders)
          ? workOrders
          : [];

      /*
       * Combine maintenance requests
       * with their corresponding work orders.
       */
      const combinedHistory =
        requestList.map(
          (request) => {

            const workOrder =
              workOrderList.find(
                (order) =>
                  order
                    .maintenanceRequest
                    ?.id === request.id ||
                  order.maintenanceRequestId ===
                    request.id
              );

            return {
              request,
              workOrder:
                workOrder || null,
            };
          }
        );

      /*
       * Include work orders whose
       * maintenance request wasn't
       * returned.
       */
      workOrderList.forEach(
        (workOrder) => {

          const requestId =
            workOrder
              .maintenanceRequest
              ?.id ||
            workOrder.maintenanceRequestId;

          const alreadyIncluded =
            combinedHistory.some(
              (item) =>
                item.request?.id ===
                requestId
            );

          if (!alreadyIncluded) {
            combinedHistory.push({
              request:
                workOrder.maintenanceRequest ||
                null,
              workOrder,
            });
          }
        }
      );

      /*
       * Most recent first.
       */
      combinedHistory.sort(
        (a, b) => {

          const dateA =
            a.workOrder?.actualEnd ||
            a.workOrder?.actualStart ||
            a.workOrder?.scheduledEnd ||
            a.request?.createdAt ||
            "";

          const dateB =
            b.workOrder?.actualEnd ||
            b.workOrder?.actualStart ||
            b.workOrder?.scheduledEnd ||
            b.request?.createdAt ||
            "";

          return (
            new Date(dateB) -
            new Date(dateA)
          );
        }
      );

      setHistory(
        combinedHistory
      );

      /*
       * Calculate downtime immediately
       * for every work order that has
       * actually started.
       */
      const calculatedDowntime = {};

      workOrderList.forEach(
        (workOrder) => {

          if (
            workOrder.actualStart
          ) {
            calculatedDowntime[
              workOrder.id
            ] =
              calculateDowntimeLocally(
                workOrder
              );
          }
        }
      );

      setDowntimeData(
        calculatedDowntime
      );

    } catch (err) {
      console.error(
        "Error loading maintenance history:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load maintenance history."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DOWNTIME CALCULATION
  // =========================================================

  /*
   * Same calculation used by WorkOrders.jsx.
   *
   * This is important because both pages
   * must display exactly the same value.
   */
  const calculateDowntimeLocally = (
    workOrder
  ) => {

    /*
     * No actual start = work has not started.
     */
    if (!workOrder?.actualStart) {
      return {
        status: "NOT_STARTED",
        hours: null,
        minutes: null,
      };
    }

    const start = new Date(
      workOrder.actualStart
    );

    if (isNaN(start.getTime())) {
      return {
        status: "NOT_STARTED",
        hours: null,
        minutes: null,
      };
    }

    /*
     * Completed work uses actualEnd.
     *
     * In-progress work uses current time.
     */
    let end;

    if (workOrder.actualEnd) {
      end = new Date(
        workOrder.actualEnd
      );
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

    const difference =
      end.getTime() -
      start.getTime();

    if (difference <= 0) {
      return {
        status: "CALCULATED",
        hours: 0,
        minutes: 0,
      };
    }

    const totalMinutes =
      Math.floor(
        difference /
          (1000 * 60)
      );

    const hours =
      totalMinutes / 60;

    return {
      status:
        workOrder.actualEnd
          ? "COMPLETED"
          : "IN_PROGRESS",

      hours,
      minutes:
        totalMinutes,
    };
  };

  /*
   * Display:
   *
   * 0 min
   * 45 min
   * 2 hr 15 min
   * 1 day 3 hr 20 min
   * Not Started
   */
  const formatDowntime = (
    downtime
  ) => {

    if (!downtime) {
      return "Not Started";
    }

    if (
      downtime.status ===
      "NOT_STARTED"
    ) {
      return "Not Started";
    }

    const totalMinutes =
      downtime.minutes ??
      Math.round(
        (downtime.hours || 0) *
          60
      );

    if (totalMinutes <= 0) {
      return "0 min";
    }

    const days =
      Math.floor(
        totalMinutes / 1440
      );

    const remainingAfterDays =
      totalMinutes % 1440;

    const hours =
      Math.floor(
        remainingAfterDays / 60
      );

    const minutes =
      remainingAfterDays % 60;

    const parts = [];

    if (days > 0) {
      parts.push(
        `${days} day${
          days !== 1
            ? "s"
            : ""
        }`
      );
    }

    if (hours > 0) {
      parts.push(
        `${hours} hr`
      );
    }

    if (minutes > 0) {
      parts.push(
        `${minutes} min`
      );
    }

    return parts.length > 0
      ? parts.join(" ")
      : "0 min";
  };

  const getDowntimeHours = (
    downtime
  ) => {

    if (
      !downtime ||
      downtime.status ===
        "NOT_STARTED"
    ) {
      return null;
    }

    if (
      downtime.hours ===
        null ||
      downtime.hours ===
        undefined
    ) {
      return null;
    }

    return Number(
      downtime.hours
    );
  };

  /*
   * Calculate downtime for a
   * particular work order.
   */
  const handleCalculateDowntime = async (
    workOrder
  ) => {

    const workOrderId =
      workOrder.id;

    try {
      setDowntimeLoading(
        (previous) => ({
          ...previous,
          [workOrderId]:
            true,
        })
      );

      setError("");

      /*
       * Frontend calculation is the
       * source used for display.
       */
      const localResult =
        calculateDowntimeLocally(
          workOrder
        );

      setDowntimeData(
        (previous) => ({
          ...previous,
          [workOrderId]:
            localResult,
        })
      );

      /*
       * Keep existing backend API call.
       * We don't use the returned WorkOrder
       * as the downtime value.
       */
      try {
        await calculateDowntime(
          workOrderId
        );
      } catch (backendError) {
        console.warn(
          "Backend downtime endpoint returned an error. Using local calculation.",
          backendError
        );
      }

    } catch (err) {
      console.error(
        "Error calculating downtime:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to calculate downtime."
      );
    } finally {
      setDowntimeLoading(
        (previous) => ({
          ...previous,
          [workOrderId]:
            false,
        })
      );
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getEquipmentName = (
    item
  ) => {

    const equipment =
      item.workOrder?.equipment ||
      item.request?.equipment;

    return (
      equipment?.name ||
      equipment?.equipmentName ||
      item.workOrder
        ?.equipmentName ||
      item.request
        ?.equipmentName ||
      (equipment?.id
        ? `Equipment #${equipment.id}`
        : "—")
    );
  };

  const getTechnicianName = (
    item
  ) => {

    const technician =
      item.workOrder?.technician;

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
        technician.id ||
        "N/A"
      }`
    );
  };

  const formatStatus = (
    status
  ) => {

    if (!status) {
      return "—";
    }

    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  };

  const getStatusClass = (
    status
  ) => {

    switch (status) {

      case "CREATED":
      case "PENDING":
        return "history-status-created";

      case "ASSIGNED":
        return "history-status-assigned";

      case "IN_PROGRESS":
        return "history-status-progress";

      case "COMPLETED":
        return "history-status-completed";

      case "CANCELLED":
        return "history-status-cancelled";

      default:
        return "";
    }
  };

  const formatDateTime = (
    value
  ) => {

    if (!value) {
      return "—";
    }

    try {

      const date =
        new Date(value);

      if (
        isNaN(date.getTime())
      ) {
        return value;
      }

      return date.toLocaleString();

    } catch {
      return value;
    }
  };

  // =========================================================
  // SERVICE LOG
  // =========================================================

  const getServiceLog = (
    item
  ) => {

    const request =
      item.request;

    const workOrder =
      item.workOrder;

    const logs = [];

    if (request) {

      logs.push({
        type: "request",

        title:
          "Maintenance Request Created",

        description:
          request.description ||
          "Maintenance request submitted.",

        date:
          request.createdAt,

        icon: "📋",
      });
    }

    if (workOrder) {

      logs.push({
        type: "created",

        title:
          "Work Order Created",

        description:
          workOrder.workDescription ||
          "Work order created.",

        date:
          workOrder.createdAt ||
          workOrder.scheduledStart,

        icon: "🛠️",
      });

      if (workOrder.technician) {

        logs.push({
          type: "assigned",

          title:
            "Technician Assigned",

          description:
            `Assigned to ${getTechnicianName(
              item
            )}.`,

          date:
            workOrder.assignedAt ||
            workOrder.scheduledStart,

          icon: "👨‍🔧",
        });
      }

      if (workOrder.actualStart) {

        logs.push({
          type: "started",

          title:
            "Maintenance Work Started",

          description:
            "Technician started working on the equipment.",

          date:
            workOrder.actualStart,

          icon: "▶️",
        });
      }

      if (workOrder.actualEnd) {

        logs.push({
          type: "completed",

          title:
            "Maintenance Work Completed",

          description:
            workOrder.completionNotes ||
            "Maintenance work completed.",

          date:
            workOrder.actualEnd,

          icon: "✅",
        });
      }
    }

    return logs
      .filter(
        (log) => log.date
      )
      .sort(
        (a, b) =>
          new Date(a.date) -
          new Date(b.date)
      );
  };

  // =========================================================
  // DETAILS
  // =========================================================

  const openDetails = (
    item
  ) => {

    setSelectedItem(item);

    /*
     * Calculate immediately.
     */
    if (
      item.workOrder?.id
    ) {

      const result =
        calculateDowntimeLocally(
          item.workOrder
        );

      setDowntimeData(
        (previous) => ({
          ...previous,
          [item.workOrder.id]:
            result,
        })
      );

      /*
       * Also call existing endpoint.
       */
      handleCalculateDowntime(
        item.workOrder
      );
    }
  };

  const closeDetails = () => {
    setSelectedItem(null);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="maintenance-history-page">

        <div className="history-loading">
          Loading maintenance history...
        </div>

      </div>
    );
  }

  return (
    <div className="maintenance-history-page">

      {/* HEADER */}
      <div className="history-header">

        <div>
          <h1>
            Maintenance History
          </h1>

          <p>
            View maintenance requests,
            work orders, technicians
            and service records.
          </p>
        </div>

        <button
          className="history-refresh-btn"
          onClick={
            loadHistory
          }
        >
          ↻ Refresh
        </button>

      </div>

      {/* ERROR */}
      {error && (
        <div className="history-alert error">
          ⚠ {error}
        </div>
      )}

      {/* SUMMARY */}
      <div className="history-summary">

        <div className="history-summary-card">
          <span>
            Total Records
          </span>

          <strong>
            {history.length}
          </strong>
        </div>

        <div className="history-summary-card">
          <span>
            Work Orders
          </span>

          <strong>
            {
              history.filter(
                (item) =>
                  item.workOrder
              ).length
            }
          </strong>
        </div>

        <div className="history-summary-card">
          <span>
            Completed
          </span>

          <strong>
            {
              history.filter(
                (item) =>
                  item.workOrder
                    ?.status ===
                    "COMPLETED" ||
                  item.request
                    ?.status ===
                    "COMPLETED"
              ).length
            }
          </strong>
        </div>

        <div className="history-summary-card">
          <span>
            In Progress
          </span>

          <strong>
            {
              history.filter(
                (item) =>
                  item.workOrder
                    ?.status ===
                    "IN_PROGRESS" ||
                  item.request
                    ?.status ===
                    "IN_PROGRESS"
              ).length
            }
          </strong>
        </div>

      </div>

      {/* TABLE */}
      <div className="history-card">

        <div className="history-card-header">

          <h2>
            Service History
          </h2>

          <span>
            {history.length} record
            {history.length !== 1
              ? "s"
              : ""}
          </span>

        </div>

        {history.length === 0 ? (

          <div className="history-empty">
            No maintenance history found.
          </div>

        ) : (

          <div className="history-table-container">

            <table className="history-table">

              <thead>

                <tr>
                  <th>Request</th>
                  <th>Equipment</th>
                  <th>
                    Work Description
                  </th>
                  <th>Technician</th>
                  <th>Status</th>
                  <th>Actual Start</th>
                  <th>Actual End</th>
                  <th>Downtime</th>
                  <th>Details</th>
                </tr>

              </thead>

              <tbody>

                {history.map(
                  (
                    item,
                    index
                  ) => {

                    const workOrder =
                      item.workOrder;

                    const request =
                      item.request;

                    const downtime =
                      workOrder
                        ? downtimeData[
                            workOrder.id
                          ]
                        : null;

                    return (
                      <tr
                        key={
                          workOrder?.id ||
                          request?.id ||
                          index
                        }
                      >

                        <td>
                          <strong>
                            {request?.id
                              ? `#${request.id}`
                              : "—"}
                          </strong>
                        </td>

                        <td>
                          {getEquipmentName(
                            item
                          )}
                        </td>

                        <td>
                          <div className="history-description">

                            {workOrder
                              ?.workDescription ||
                              request
                                ?.description ||
                              "—"}

                          </div>
                        </td>

                        <td>
                          {getTechnicianName(
                            item
                          )}
                        </td>

                        <td>

                          <span
                            className={`history-status ${getStatusClass(
                              workOrder
                                ?.status ||
                                request
                                  ?.status
                            )}`}
                          >
                            {formatStatus(
                              workOrder
                                ?.status ||
                                request
                                  ?.status
                            )}
                          </span>

                        </td>

                        <td>
                          {formatDateTime(
                            workOrder
                              ?.actualStart
                          )}
                        </td>

                        <td>
                          {formatDateTime(
                            workOrder
                              ?.actualEnd
                          )}
                        </td>

                        {/* DOWNTIME */}
                        <td>

                          {workOrder ? (

                            downtime !==
                            undefined ? (

                              <div className="history-downtime-container">

                                <span className="history-downtime">
                                  {formatDowntime(
                                    downtime
                                  )}
                                </span>

                                {getDowntimeHours(
                                  downtime
                                ) !== null && (

                                  <small>
                                    {getDowntimeHours(
                                      downtime
                                    ).toFixed(
                                      2
                                    )}{" "}
                                    hours
                                  </small>

                                )}

                              </div>

                            ) : (

                              <button
                                className="history-downtime-btn"
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
                                  ? "..."
                                  : "Calculate"}
                              </button>

                            )

                          ) : (
                            "—"
                          )}

                        </td>

                        <td>

                          <button
                            className="history-details-btn"
                            onClick={() =>
                              openDetails(
                                item
                              )
                            }
                          >
                            View Details
                          </button>

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

      {/* DETAILS MODAL */}
      {selectedItem && (

        <div className="history-modal-overlay">

          <div className="history-modal">

            <div className="history-modal-header">

              <div>

                <h2>
                  Maintenance Details
                </h2>

                <p>
                  {selectedItem
                    .request?.id
                    ? `Request #${selectedItem.request.id}`
                    : "Maintenance Record"}
                </p>

              </div>

              <button
                className="history-modal-close"
                onClick={
                  closeDetails
                }
              >
                ×
              </button>

            </div>

            <div className="history-modal-body">

              {/* OVERVIEW */}
              <div className="service-log-section">

                <div className="service-log-section-title">
                  <span>📌</span>
                  <h3>
                    Maintenance Overview
                  </h3>
                </div>

                <div className="history-detail-grid">

                  <div className="history-detail-item">
                    <label>
                      Request ID
                    </label>

                    <span>
                      {selectedItem
                        .request?.id
                        ? `#${selectedItem.request.id}`
                        : "—"}
                    </span>
                  </div>

                  <div className="history-detail-item">
                    <label>
                      Work Order ID
                    </label>

                    <span>
                      {selectedItem
                        .workOrder?.id
                        ? `#${selectedItem.workOrder.id}`
                        : "—"}
                    </span>
                  </div>

                  <div className="history-detail-item">
                    <label>
                      Equipment
                    </label>

                    <span>
                      {getEquipmentName(
                        selectedItem
                      )}
                    </span>
                  </div>

                  <div className="history-detail-item">
                    <label>
                      Technician
                    </label>

                    <span>
                      {getTechnicianName(
                        selectedItem
                      )}
                    </span>
                  </div>

                  <div className="history-detail-item">
                    <label>
                      Request Status
                    </label>

                    <span>
                      {formatStatus(
                        selectedItem
                          .request
                          ?.status
                      )}
                    </span>
                  </div>

                  <div className="history-detail-item">
                    <label>
                      Work Order Status
                    </label>

                    <span>
                      {formatStatus(
                        selectedItem
                          .workOrder
                          ?.status
                      )}
                    </span>
                  </div>

                </div>

              </div>

              {/* SCHEDULE */}
              <div className="service-log-section">

                <div className="service-log-section-title">
                  <span>📅</span>
                  <h3>
                    Maintenance Schedule
                  </h3>
                </div>

                <div className="history-detail-grid">

                  <div className="history-detail-item">
                    <label>
                      Scheduled Start
                    </label>

                    <span>
                      {formatDateTime(
                        selectedItem
                          .workOrder
                          ?.scheduledStart
                      )}
                    </span>
                  </div>

                  <div className="history-detail-item">
                    <label>
                      Scheduled End
                    </label>

                    <span>
                      {formatDateTime(
                        selectedItem
                          .workOrder
                          ?.scheduledEnd
                      )}
                    </span>
                  </div>

                  <div className="history-detail-item">
                    <label>
                      Actual Start
                    </label>

                    <span>
                      {formatDateTime(
                        selectedItem
                          .workOrder
                          ?.actualStart
                      )}
                    </span>
                  </div>

                  <div className="history-detail-item">
                    <label>
                      Actual End
                    </label>

                    <span>
                      {formatDateTime(
                        selectedItem
                          .workOrder
                          ?.actualEnd
                      )}
                    </span>
                  </div>

                  <div className="history-detail-item">
                    <label>
                      Downtime
                    </label>

                    <span className="service-log-downtime">

                      {selectedItem
                        .workOrder?.id &&
                      downtimeData[
                        selectedItem
                          .workOrder
                          .id
                      ] !== undefined
                        ? formatDowntime(
                            downtimeData[
                              selectedItem
                                .workOrder
                                .id
                            ]
                          )
                        : "Not Started"}

                    </span>
                  </div>

                </div>

              </div>

              {/* DESCRIPTION */}
              <div className="service-log-section">

                <div className="service-log-section-title">
                  <span>📝</span>
                  <h3>
                    Maintenance Details
                  </h3>
                </div>

                <div className="history-detail-section">

                  <label>
                    Maintenance Description
                  </label>

                  <p>
                    {selectedItem
                      .request
                      ?.description ||
                      "No maintenance description available."}
                  </p>

                </div>

                <div className="history-detail-section">

                  <label>
                    Work Description
                  </label>

                  <p>
                    {selectedItem
                      .workOrder
                      ?.workDescription ||
                      "No work description available."}
                  </p>

                </div>

                <div className="history-detail-section">

                  <label>
                    Maintenance Notes
                  </label>

                  <p>
                    {selectedItem
                      .request
                      ?.notes ||
                      "No maintenance notes available."}
                  </p>

                </div>

                <div className="history-detail-section">

                  <label>
                    Completion Notes
                  </label>

                  <p>
                    {selectedItem
                      .workOrder
                      ?.completionNotes ||
                      "No completion notes available."}
                  </p>

                </div>

              </div>

              {/* SERVICE TIMELINE */}
              <div className="service-log-section">

                <div className="service-log-section-title">
                  <span>🔄</span>
                  <h3>
                    Service Activity
                  </h3>
                </div>

                <div className="service-timeline">

                  {getServiceLog(
                    selectedItem
                  ).length ===
                  0 ? (

                    <div className="service-timeline-empty">
                      No service activity recorded yet.
                    </div>

                  ) : (

                    getServiceLog(
                      selectedItem
                    ).map(
                      (
                        log,
                        index
                      ) => (

                        <div
                          className="service-timeline-item"
                          key={`${log.type}-${index}`}
                        >

                          <div className="service-timeline-icon">
                            {log.icon}
                          </div>

                          <div className="service-timeline-content">

                            <div className="service-timeline-header">

                              <strong>
                                {log.title}
                              </strong>

                              <span>
                                {formatDateTime(
                                  log.date
                                )}
                              </span>

                            </div>

                            <p>
                              {log.description}
                            </p>

                          </div>

                        </div>

                      )
                    )

                  )}

                </div>

              </div>

            </div>

            <div className="history-modal-footer">

              <button
                className="history-close-btn"
                onClick={
                  closeDetails
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default MaintenanceHistory;