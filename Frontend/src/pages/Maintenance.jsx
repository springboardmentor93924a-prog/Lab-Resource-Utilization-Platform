import React, { useEffect, useMemo, useState } from "react";
import {
  getAllMaintenanceRequests,
  getAllWorkOrders,
  calculateDowntime,
} from "../services/maintenanceApi";

import CreateMaintenanceRequestModal from "../components/CreateMaintenanceRequestModal";

import CreateWorkOrderModal from "../components/CreateWorkOrderModal";
import "./Maintenance.css";

function Maintenance() {
  const [requests, setRequests] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [downtime, setDowntime] = useState(0);
  const [downtimeLoading, setDowntimeLoading] = useState(false);

  // =========================================================
  // CREATE REQUEST MODAL
  // =========================================================

  const [showRequestModal, setShowRequestModal] =
    useState(false);

    const [showWorkOrderModal, setShowWorkOrderModal] =
  useState(false);

  // =========================================================
  // LOAD MAINTENANCE DATA
  // =========================================================

  const loadMaintenanceData = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [requestData, workOrderData] =
        await Promise.all([
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
        "Failed to load maintenance data:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load maintenance data."
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadMaintenanceData();
  }, []);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = async () => {
    setSuccess("");

    await loadMaintenanceData(true);

    setSuccess(
      "Maintenance data refreshed successfully."
    );

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  // =========================================================
  // REQUEST CREATED SUCCESS
  // =========================================================

  const handleRequestCreated = async () => {
    await loadMaintenanceData(true);

    setSuccess(
      "Maintenance request created successfully."
    );

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  // =========================================================
// CALCULATE TOTAL DOWNTIME
// =========================================================

const CalculateDowntime = async () => {
  try {
    setDowntimeLoading(true);
    setError("");
    setSuccess("");

    if (!Array.isArray(workOrders) || workOrders.length === 0) {
      setDowntime(0);
      setError("No work orders available to calculate downtime.");
      return;
    }

    let totalMinutes = 0;

    workOrders.forEach((order) => {
      if (!order?.id) {
        return;
      }

      const actualStart = order.actualStart
        ? new Date(order.actualStart)
        : null;

      const actualEnd = order.actualEnd
        ? new Date(order.actualEnd)
        : null;

      // Work has not started
      if (!actualStart || Number.isNaN(actualStart.getTime())) {
        return;
      }

      // Completed work
      if (actualEnd && !Number.isNaN(actualEnd.getTime())) {
        const diff =
          actualEnd.getTime() - actualStart.getTime();

        if (diff > 0) {
          totalMinutes += Math.floor(diff / 60000);
        }

        return;
      }

      // Work is still in progress
      if (
        order.status === "IN_PROGRESS" ||
        order.status === "STARTED"
      ) {
        const now = new Date();

        const diff =
          now.getTime() - actualStart.getTime();

        if (diff > 0) {
          totalMinutes += Math.floor(diff / 60000);
        }
      }
    });

    const totalHours = totalMinutes / 60;

    setDowntime(totalHours);

    setSuccess(
      "Equipment downtime calculated successfully."
    );

    setTimeout(() => {
      setSuccess("");
    }, 3000);

  } catch (err) {
    console.error(
      "Failed to calculate downtime:",
      err
    );

    setError(
      err.response?.data?.message ||
        "Failed to calculate equipment downtime."
    );
  } finally {
    setDowntimeLoading(false);
  }
};

  // =========================================================
  // DASHBOARD COUNTS
  // =========================================================

  const pendingRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status === "PENDING"
      ).length,
    [requests]
  );

  const inProgressRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status === "IN_PROGRESS"
      ).length,
    [requests]
  );

  const completedRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status === "COMPLETED"
      ).length,
    [requests]
  );

  const openWorkOrders = useMemo(
    () =>
      workOrders.filter(
        (order) =>
          order.status !== "COMPLETED"
      ).length,
    [workOrders]
  );

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="maintenance-page">

        <div className="maintenance-loading">

          <div className="maintenance-spinner"></div>

          <p>
            Loading maintenance data...
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="maintenance-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="maintenance-header">

        <div>
          <span className="maintenance-eyebrow">
            MAINTENANCE MANAGEMENT
          </span>

          <h1>
            Maintenance Dashboard
          </h1>

          <p>
            Manage maintenance requests,
            work orders and equipment downtime.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >

          <button
            type="button"
            className="maintenance-refresh-button"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <button
            type="button"
            className="maintenance-primary-button"
            onClick={() =>
              setShowRequestModal(true)
            }
          >
            + Create Request
          </button>

          <button
            type="button"
            className="maintenance-create-button"
            onClick={() => setShowWorkOrderModal(true)}
          >
            + Create Work Order
          </button>

        </div>

      </div>

      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {success && (
        <div className="maintenance-success">
          {success}
        </div>
      )}

      {error && (
        <div className="maintenance-error">
          {error}
        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="maintenance-summary-grid">

        <div className="maintenance-summary-card">

          <div className="maintenance-card-label">
            Total Requests
          </div>

          <div className="maintenance-card-value">
            {requests.length}
          </div>

        </div>

        <div className="maintenance-summary-card pending">

          <div className="maintenance-card-label">
            Pending Requests
          </div>

          <div className="maintenance-card-value">
            {pendingRequests}
          </div>

        </div>

        <div className="maintenance-summary-card progress">

          <div className="maintenance-card-label">
            In Progress
          </div>

          <div className="maintenance-card-value">
            {inProgressRequests}
          </div>

        </div>

        <div className="maintenance-summary-card completed">

          <div className="maintenance-card-label">
            Completed
          </div>

          <div className="maintenance-card-value">
            {completedRequests}
          </div>

        </div>

        <div className="maintenance-summary-card work-order">

          <div className="maintenance-card-label">
            Open Work Orders
          </div>

          <div className="maintenance-card-value">
            {openWorkOrders}
          </div>

        </div>

        <div className="maintenance-summary-card downtime">

          <div className="maintenance-card-label">
            Downtime
          </div>

          <div className="maintenance-card-value">

            {Number(downtime || 0).toFixed(2)}

            <span>
              {" "}hrs
            </span>

          </div>

        </div>

      </div>

      {/* =====================================================
          DOWNTIME
      ===================================================== */}

      <div className="maintenance-downtime-card">

        <div>

          <h2>
            Equipment Downtime
          </h2>

          <p>
            Calculate total equipment downtime
            from maintenance records.
          </p>

        </div>

        <button
          type="button"
          className="maintenance-primary-button"
          onClick={CalculateDowntime}
          disabled={downtimeLoading}
        >
          {downtimeLoading
            ? "Calculating..."
            : "Calculate Downtime"}
        </button>

      </div>

      {/* =====================================================
          QUICK OVERVIEW
      ===================================================== */}

      <div className="maintenance-overview-grid">

        {/* ===================================================
            MAINTENANCE REQUESTS
        =================================================== */}

        <div className="maintenance-panel">

          <div className="maintenance-panel-header">

            <div>

              <h2>
                Maintenance Requests
              </h2>

              <p>
                Current maintenance request
                overview.
              </p>

            </div>

            <span className="maintenance-count">
              {requests.length}
            </span>

          </div>

          {requests.length === 0 ? (

            <div className="maintenance-empty">
              No maintenance requests found.
            </div>

          ) : (

            <div className="maintenance-mini-list">

              {requests
                .slice(0, 5)
                .map((request) => (

                  <div
                    className="maintenance-mini-item"
                    key={request.id}
                  >

                    <div>

                      <strong>
                        {request.equipment?.name ||
                          `Equipment #${
                            request.equipment?.id ||
                            "-"
                          }`}
                      </strong>

                      <span>
                        {request.description ||
                          "No description"}
                      </span>

                    </div>

                    <span
                      className={`maintenance-status ${
                        request.status
                          ?.toLowerCase()
                          .replace("_", "-") ||
                        ""
                      }`}
                    >
                      {request.status || "-"}
                    </span>

                  </div>

                ))}

            </div>

          )}

        </div>

        {/* ===================================================
            WORK ORDERS
        =================================================== */}

        <div className="maintenance-panel">

          <div className="maintenance-panel-header">

            <div>

              <h2>
                Work Orders
              </h2>

              <p>
                Recent maintenance work orders.
              </p>

            </div>

            <span className="maintenance-count">
              {workOrders.length}
            </span>

          </div>

          {workOrders.length === 0 ? (

            <div className="maintenance-empty">
              No work orders found.
            </div>

          ) : (

            <div className="maintenance-mini-list">

              {workOrders
                .slice(0, 5)
                .map((order) => (

                  <div
                    className="maintenance-mini-item"
                    key={order.id}
                  >

                    <div>

                      <strong>
                        Work Order #{order.id}
                      </strong>

                      <span>
                        {order.workDescription ||
                          order.description ||
                          "No description"}
                      </span>

                    </div>

                    <span
                      className={`maintenance-status ${
                        order.status
                          ?.toLowerCase()
                          .replace("_", "-") ||
                        ""
                      }`}
                    >
                      {order.status || "-"}
                    </span>

                  </div>

                ))}

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          CREATE MAINTENANCE REQUEST MODAL
      ===================================================== */}

      <CreateMaintenanceRequestModal
        show={showRequestModal}
        onClose={() =>
          setShowRequestModal(false)
        }
        onSuccess={handleRequestCreated}
      />

      <CreateWorkOrderModal
        show={showWorkOrderModal}
        onClose={() =>
          setShowWorkOrderModal(false)
        }
        onSuccess={() => {
          loadMaintenanceData(true);
        }}
      />

    </div>
  );
}

export default Maintenance;