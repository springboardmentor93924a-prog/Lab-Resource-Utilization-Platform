import { useEffect, useMemo, useState } from "react";
// import Sidebar from "../components/Sidebar";
// import Topbar from "../components/Topbar";
import api from "../services/api";
import "./ManagerAnalyticsDashboard.css";

function ManagerAnalyticsDashboard() {
  // =========================================================
  // DATE HELPERS
  // =========================================================

  const getToday = () => {
    return new Date().toISOString().split("T")[0];
  };

  const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return date.toISOString().split("T")[0];
  };

  // =========================================================
  // STATE
  // =========================================================

  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getToday());

  const [report, setReport] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [demand, setDemand] = useState([]);
  const [trends, setTrends] = useState([]);

  const [bookings, setBookings] = useState([]);
  const [equipment, setEquipment] = useState([]);

  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);

  const [accessRequests, setAccessRequests] = useState([]);
  const [sharedEquipment, setSharedEquipment] = useState([]);
  const [billing, setBilling] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // HELPERS
  // =========================================================

  const unwrap = (response) => {
    const data = response?.data ?? response;

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data?.content)) {
      return data.content;
    }

    return data;
  };

  const arrayData = (response) => {
    const data = unwrap(response);
    return Array.isArray(data) ? data : [];
  };

  const numberValue = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  };

  const getStatus = (item) => {
    return (
      item?.status ||
      item?.bookingStatus ||
      item?.maintenanceStatus ||
      item?.workOrderStatus ||
      item?.billingStatus ||
      ""
    )
      .toString()
      .toUpperCase();
  };

  const isBetweenDates = (dateValue) => {
    if (!dateValue) return false;

    const date = String(dateValue).substring(0, 10);

    return date >= startDate && date <= endDate;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getHours = (start, end) => {
    if (!start || !end) return 0;

    const [sh, sm = 0] = String(start)
      .substring(0, 5)
      .split(":")
      .map(Number);

    const [eh, em = 0] = String(end)
      .substring(0, 5)
      .split(":")
      .map(Number);

    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

    let difference = endMinutes - startMinutes;

    if (difference < 0) {
      difference += 24 * 60;
    }

    return difference / 60;
  };

  const getBookingHours = (booking) => {
    if (booking?.usageHours !== undefined) {
      return numberValue(booking.usageHours);
    }

    return getHours(
      booking?.startTime,
      booking?.endTime
    );
  };

  const getEquipmentName = (item) => {
    return (
      item?.equipmentName ||
      item?.equipment?.name ||
      "Unknown Equipment"
    );
  };

  const getEquipmentId = (item) => {
    return (
      item?.equipmentId ||
      item?.equipment?.id ||
      null
    );
  };

  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadDashboard = async () => {
    if (!startDate || !endDate) {
      setError("Please select both dates.");
      return;
    }

    if (endDate < startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        api.get(
          `/analytics/report?startDate=${startDate}&endDate=${endDate}`
        ),

        api.get(
          `/analytics/ranking?startDate=${startDate}&endDate=${endDate}`
        ),

        api.get(
          `/analytics/demand?startDate=${startDate}&endDate=${endDate}`
        ),

        api.get(
          `/analytics/trends?startDate=${startDate}&endDate=${endDate}`
        ),

        api.get("/bookings"),

        api.get("/equipment"),

        api.get("/maintenance/requests"),

        api.get("/maintenance/work-orders"),

        api.get("/access-requests/pending"),

        api.get("/shared-equipment"),

        api.get("/inter-institution-billing"),
      ]);

      const [
        reportResult,
        rankingResult,
        demandResult,
        trendResult,
        bookingResult,
        equipmentResult,
        maintenanceResult,
        workOrderResult,
        accessResult,
        sharedResult,
        billingResult,
      ] = results;

      if (reportResult.status === "fulfilled") {
        setReport(unwrap(reportResult.value));
      }

      if (rankingResult.status === "fulfilled") {
        setRanking(arrayData(rankingResult.value));
      }

      if (demandResult.status === "fulfilled") {
        setDemand(arrayData(demandResult.value));
      }

      if (trendResult.status === "fulfilled") {
        setTrends(arrayData(trendResult.value));
      }

      if (bookingResult.status === "fulfilled") {
        setBookings(arrayData(bookingResult.value));
      }

      if (equipmentResult.status === "fulfilled") {
        setEquipment(arrayData(equipmentResult.value));
      }

      if (maintenanceResult.status === "fulfilled") {
        setMaintenanceRequests(
          arrayData(maintenanceResult.value)
        );
      }

      if (workOrderResult.status === "fulfilled") {
        setWorkOrders(
          arrayData(workOrderResult.value)
        );
      }

      if (accessResult.status === "fulfilled") {
        setAccessRequests(
          arrayData(accessResult.value)
        );
      }

      if (sharedResult.status === "fulfilled") {
        setSharedEquipment(
          arrayData(sharedResult.value)
        );
      }

      if (billingResult.status === "fulfilled") {
        setBilling(
          arrayData(billingResult.value)
        );
      }

      const failed = results.filter(
        (result) => result.status === "rejected"
      );

      if (failed.length === results.length) {
        setError(
          "Unable to load management analytics data."
        );
      }
    } catch (err) {
      console.error(
        "Manager analytics error:",
        err
      );

      setError(
        err?.response?.data?.message ||
        "Unable to load analytics data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // =========================================================
  // FILTERED BOOKINGS
  // =========================================================

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const date =
        booking?.bookingDate ||
        booking?.date;

      return isBetweenDates(date);
    });
  }, [bookings, startDate, endDate]);

  // =========================================================
  // BOOKING ANALYTICS
  // =========================================================

  const bookingStats = useMemo(() => {
    let confirmed = 0;
    let completed = 0;
    let noShow = 0;
    let cancelled = 0;
    let active = 0;
    let totalHours = 0;

    filteredBookings.forEach((booking) => {
      const status = getStatus(booking);

      totalHours += getBookingHours(booking);

      if (status === "CONFIRMED") {
        confirmed++;
      }

      if (status === "COMPLETED") {
        completed++;
      }

      if (status === "NO_SHOW") {
        noShow++;
      }

      if (status === "CANCELLED") {
        cancelled++;
      }

      if (
        status === "CONFIRMED" ||
        status === "IN_USE"
      ) {
        active++;
      }
    });

    const noShowRate =
      filteredBookings.length > 0
        ? (noShow / filteredBookings.length) * 100
        : 0;

    return {
      total: filteredBookings.length,
      confirmed,
      completed,
      noShow,
      cancelled,
      active,
      totalHours,
      noShowRate,
    };
  }, [filteredBookings]);

  // =========================================================
  // MAINTENANCE ANALYTICS
  // =========================================================

  const maintenanceStats = useMemo(() => {
    const requests = maintenanceRequests.filter(
      (item) => {
        const date =
          item?.createdAt ||
          item?.requestDate ||
          item?.maintenanceDate;

        return !date || isBetweenDates(date);
      }
    );

    let pending = 0;
    let inProgress = 0;
    let completed = 0;

    requests.forEach((item) => {
      const status = getStatus(item);

      if (
        status === "PENDING" ||
        status === "PENDING_APPROVAL"
      ) {
        pending++;
      }

      if (
        status === "IN_PROGRESS" ||
        status === "IN PROGRESS"
      ) {
        inProgress++;
      }

      if (
        status === "COMPLETED" ||
        status === "CLOSED"
      ) {
        completed++;
      }
    });

    const workInProgress = workOrders.filter(
      (item) => {
        const status = getStatus(item);

        return (
          status === "IN_PROGRESS" ||
          status === "ASSIGNED" ||
          status === "STARTED"
        );
      }
    ).length;

    return {
      total: requests.length,
      pending,
      inProgress,
      completed,
      workInProgress,
    };
  }, [
    maintenanceRequests,
    workOrders,
    startDate,
    endDate,
  ]);

  // =========================================================
  // ACCESS REQUESTS
  // =========================================================

  const accessStats = useMemo(() => {
    const pending = accessRequests.length;

    const approved = accessRequests.filter(
      (item) =>
        getStatus(item) === "APPROVED"
    ).length;

    const rejected = accessRequests.filter(
      (item) =>
        getStatus(item) === "REJECTED"
    ).length;

    return {
      pending,
      approved,
      rejected,
    };
  }, [accessRequests]);

  // =========================================================
  // SHARING
  // =========================================================

  const sharingStats = useMemo(() => {
    const total = sharedEquipment.length;

    const available = sharedEquipment.filter(
      (item) => {
        const status = getStatus(item);

        return (
          status === "AVAILABLE" ||
          item?.available === true ||
          item?.isAvailable === true
        );
      }
    ).length;

    const bills = billing.filter((item) => {
      const date =
        item?.billingDate ||
        item?.createdAt;

      return !date || isBetweenDates(date);
    });

    const billingAmount = bills.reduce(
      (sum, item) =>
        sum +
        numberValue(
          item?.amount ??
          item?.billingAmount ??
          item?.totalAmount
        ),
      0
    );

    return {
      total,
      available,
      billingAmount,
    };
  }, [
    sharedEquipment,
    billing,
    startDate,
    endDate,
  ]);

  // =========================================================
  // HIGH DEMAND
  // =========================================================

  const highDemandEquipment = useMemo(() => {
    return demand
      .filter(
        (item) =>
          String(
            item?.demandLevel ||
            item?.demand ||
            item?.level ||
            ""
          ).toUpperCase() === "HIGH"
      )
      .sort(
        (a, b) =>
          numberValue(b.bookingCount) -
          numberValue(a.bookingCount)
      )
      .slice(0, 6);
  }, [demand]);

  // =========================================================
  // HEATMAP
  // =========================================================

  const heatmapDates = useMemo(() => {
    const dates = [];

    const current = new Date(
      `${startDate}T00:00:00`
    );

    const end = new Date(
      `${endDate}T00:00:00`
    );

    while (current <= end && dates.length < 14) {
      dates.push(
        current.toISOString().split("T")[0]
      );

      current.setDate(
        current.getDate() + 1
      );
    }

    return dates;
  }, [startDate, endDate]);

  const heatmapEquipment = useMemo(() => {
    const map = new Map();

    filteredBookings.forEach((booking) => {
      const equipmentId = getEquipmentId(booking);

      if (!equipmentId) return;

      const name = getEquipmentName(booking);

      if (!map.has(String(equipmentId))) {
        map.set(String(equipmentId), {
          id: equipmentId,
          name,
          usage: {},
        });
      }

      const row = map.get(String(equipmentId));
      const date =
        booking?.bookingDate ||
        booking?.date;

      if (!date) return;

      const hours = getBookingHours(booking);

      row.usage[date] =
        (row.usage[date] || 0) + hours;
    });

    return Array.from(map.values())
      .sort(
        (a, b) =>
          Object.values(b.usage).reduce(
            (sum, value) => sum + value,
            0
          ) -
          Object.values(a.usage).reduce(
            (sum, value) => sum + value,
            0
          )
      )
      .slice(0, 8);
  }, [filteredBookings]);

  const getHeatLevel = (hours) => {
    if (hours >= 7) return "heat-4";
    if (hours >= 5) return "heat-3";
    if (hours >= 3) return "heat-2";
    if (hours > 0) return "heat-1";
    return "heat-0";
  };

  // =========================================================
  // UTILIZATION
  // =========================================================

  const averageUtilization =
    numberValue(
      report?.averageUtilization ??
      report?.averageUtilizationPercentage
    );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    // <div className="manager-analytics-layout">
    //   <Sidebar />

    //   <div className="manager-analytics-main">
    //     <Topbar />

        <main className="manager-analytics-content">

          {/* HEADER */}

          <div className="manager-analytics-header">
            <div>
              <h1>
                Lab Management Analytics
              </h1>

              <p>
                Monitor utilization, bookings,
                maintenance, demand and resource
                sharing.
              </p>
            </div>

            <button
              className="manager-refresh-btn"
              onClick={loadDashboard}
              disabled={loading}
            >
              {loading
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>
          </div>

          {/* FILTERS */}

          <section className="manager-filter-card">

            <div className="manager-filter-group">
              <label>
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
              />
            </div>

            <div className="manager-filter-group">
              <label>
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
              />
            </div>

            <button
              className="manager-apply-btn"
              onClick={loadDashboard}
              disabled={loading}
            >
              Apply Filter
            </button>

          </section>

          {error && (
            <div className="manager-error">
              {error}
            </div>
          )}

          {/* SUMMARY */}

          <section className="manager-summary-grid">

            <div className="manager-summary-card">
              <span>
                Total Utilization
              </span>

              <strong>
                {averageUtilization.toFixed(1)}%
              </strong>

              <small>
                Average equipment utilization
              </small>
            </div>

            <div className="manager-summary-card">
              <span>
                Total Bookings
              </span>

              <strong>
                {bookingStats.total}
              </strong>

              <small>
                Selected date range
              </small>
            </div>

            <div className="manager-summary-card">
              <span>
                No-Show Rate
              </span>

              <strong>
                {bookingStats.noShowRate.toFixed(1)}%
              </strong>

              <small>
                Booking attendance
              </small>
            </div>

            <div className="manager-summary-card">
              <span>
                Maintenance
              </span>

              <strong>
                {maintenanceStats.total}
              </strong>

              <small>
                Maintenance requests
              </small>
            </div>

            <div className="manager-summary-card">
              <span>
                Access Requests
              </span>

              <strong>
                {accessStats.pending}
              </strong>

              <small>
                Currently pending
              </small>
            </div>

            <div className="manager-summary-card">
              <span>
                Shared Equipment
              </span>

              <strong>
                {sharingStats.total}
              </strong>

              <small>
                Inter-institution resources
              </small>
            </div>

          </section>

          {/* BOOKING ANALYTICS */}

          <section className="manager-section">

            <div className="manager-section-heading">
              <div>
                <h2>
                  Booking Analytics
                </h2>

                <p>
                  Booking activity and attendance
                  for the selected period.
                </p>
              </div>
            </div>

            <div className="booking-stat-grid">

              <div className="booking-stat">
                <span>Total</span>
                <strong>
                  {bookingStats.total}
                </strong>
              </div>

              <div className="booking-stat">
                <span>Confirmed</span>
                <strong>
                  {bookingStats.confirmed}
                </strong>
              </div>

              <div className="booking-stat">
                <span>Completed</span>
                <strong>
                  {bookingStats.completed}
                </strong>
              </div>

              <div className="booking-stat">
                <span>No Show</span>
                <strong>
                  {bookingStats.noShow}
                </strong>
              </div>

              <div className="booking-stat">
                <span>Cancelled</span>
                <strong>
                  {bookingStats.cancelled}
                </strong>
              </div>

              <div className="booking-stat">
                <span>Usage Hours</span>
                <strong>
                  {bookingStats.totalHours.toFixed(1)}
                </strong>
              </div>

            </div>

            <div className="manager-trend-list">

              {trends.length === 0 ? (
                <div className="manager-empty">
                  No booking trend data available.
                </div>
              ) : (
                trends.slice(-10).map(
                  (item, index) => {

                    const count =
                      numberValue(
                        item?.bookingCount ??
                        item?.count
                      );

                    const max =
                      Math.max(
                        ...trends.map(
                          (trend) =>
                            numberValue(
                              trend?.bookingCount ??
                              trend?.count
                            )
                        ),
                        1
                      );

                    return (
                      <div
                        className="trend-row"
                        key={index}
                      >
                        <span>
                          {formatDate(
                            item?.date
                          )}
                        </span>

                        <div className="trend-bar-bg">
                          <div
                            className="trend-bar"
                            style={{
                              width: `${Math.min(
                                100,
                                (count / max) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>

                        <strong>
                          {count}
                        </strong>
                      </div>
                    );
                  }
                )
              )}

            </div>

          </section>

          {/* UTILIZATION HEATMAP */}

          <section className="manager-section">

            <div className="manager-section-heading">
              <div>
                <h2>
                  Utilization Heatmap
                </h2>

                <p>
                  Equipment usage calculated from
                  existing booking data.
                </p>
              </div>
            </div>

            {heatmapEquipment.length === 0 ? (
              <div className="manager-empty">
                No equipment booking data available
                for this period.
              </div>
            ) : (
              <div className="heatmap-wrapper">

                <div className="heatmap">

                  <div className="heatmap-row heatmap-header">
                    <div className="heatmap-equipment">
                      Equipment
                    </div>

                    {heatmapDates.map(
                      (date) => (
                        <div
                          key={date}
                          className="heatmap-date"
                          title={formatDate(date)}
                        >
                          {new Date(
                            `${date}T00:00:00`
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                            }
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {heatmapEquipment.map(
                    (item) => (
                      <div
                        className="heatmap-row"
                        key={item.id}
                      >

                        <div className="heatmap-equipment">
                          {item.name}
                        </div>

                        {heatmapDates.map(
                          (date) => {

                            const hours =
                              numberValue(
                                item.usage[
                                  date
                                ]
                              );

                            return (
                              <div
                                key={date}
                                className={`heatmap-cell ${getHeatLevel(
                                  hours
                                )}`}
                                title={`${item.name} • ${formatDate(
                                  date
                                )} • ${hours.toFixed(
                                  1
                                )} hours`}
                              >
                                {hours > 0
                                  ? hours.toFixed(1)
                                  : ""}
                              </div>
                            );
                          }
                        )}

                      </div>
                    )
                  )}

                </div>

                <div className="heatmap-legend">
                  <span>Low</span>
                  <i className="heat-0" />
                  <i className="heat-1" />
                  <i className="heat-2" />
                  <i className="heat-3" />
                  <i className="heat-4" />
                  <span>High</span>
                </div>

              </div>
            )}

          </section>

          {/* MAINTENANCE + ACCESS */}

          <div className="manager-two-column">

            <section className="manager-section">

              <div className="manager-section-heading">
                <div>
                  <h2>
                    Maintenance Overview
                  </h2>

                  <p>
                    Current maintenance workload.
                  </p>
                </div>
              </div>

              <div className="maintenance-grid">

                <div>
                  <span>Pending</span>
                  <strong>
                    {maintenanceStats.pending}
                  </strong>
                </div>

                <div>
                  <span>In Progress</span>
                  <strong>
                    {maintenanceStats.inProgress}
                  </strong>
                </div>

                <div>
                  <span>Completed</span>
                  <strong>
                    {maintenanceStats.completed}
                  </strong>
                </div>

                <div>
                  <span>Active Work Orders</span>
                  <strong>
                    {maintenanceStats.workInProgress}
                  </strong>
                </div>

              </div>

            </section>

            <section className="manager-section">

              <div className="manager-section-heading">
                <div>
                  <h2>
                    Access Requests
                  </h2>

                  <p>
                    Resource access workflow.
                  </p>
                </div>
              </div>

              <div className="access-summary">

                <div className="access-item">
                  <span>Pending</span>
                  <strong>
                    {accessStats.pending}
                  </strong>
                </div>

                <div className="access-item">
                  <span>Approved</span>
                  <strong>
                    {accessStats.approved}
                  </strong>
                </div>

                <div className="access-item">
                  <span>Rejected</span>
                  <strong>
                    {accessStats.rejected}
                  </strong>
                </div>

              </div>

            </section>

          </div>

          {/* HIGH DEMAND + SHARING */}

          <div className="manager-two-column">

            <section className="manager-section">

              <div className="manager-section-heading">
                <div>
                  <h2>
                    High-Demand Equipment
                  </h2>

                  <p>
                    Equipment requiring attention
                    due to high booking demand.
                  </p>
                </div>
              </div>

              {highDemandEquipment.length === 0 ? (
                <div className="manager-empty">
                  No high-demand equipment found.
                </div>
              ) : (
                <div className="demand-list">

                  {highDemandEquipment.map(
                    (item, index) => (
                      <div
                        className="demand-item"
                        key={
                          item.equipmentId ??
                          index
                        }
                      >

                        <div>
                          <strong>
                            {item.equipmentName ||
                              "Equipment"}
                          </strong>

                          <small>
                            {item.assetTag ||
                              "No asset tag"}
                          </small>
                        </div>

                        <span>
                          {numberValue(
                            item.bookingCount
                          )}{" "}
                          bookings
                        </span>

                      </div>
                    )
                  )}

                </div>
              )}

            </section>

            <section className="manager-section">

              <div className="manager-section-heading">
                <div>
                  <h2>
                    Inter-Institution Sharing
                  </h2>

                  <p>
                    Shared resources and billing.
                  </p>
                </div>
              </div>

              <div className="sharing-grid">

                <div>
                  <span>
                    Shared Resources
                  </span>
                  <strong>
                    {sharingStats.total}
                  </strong>
                </div>

                <div>
                  <span>
                    Available
                  </span>
                  <strong>
                    {sharingStats.available}
                  </strong>
                </div>

                <div>
                  <span>
                    Billing
                  </span>
                  <strong>
                    ₹
                    {sharingStats.billingAmount.toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 2,
                      }
                    )}
                  </strong>
                </div>

              </div>

            </section>

          </div>

          {/* TOP UTILIZATION */}

          <section className="manager-section">

            <div className="manager-section-heading">
              <div>
                <h2>
                  Equipment Utilization Ranking
                </h2>

                <p>
                  Highest utilized equipment in
                  the selected period.
                </p>
              </div>
            </div>

            {ranking.length === 0 ? (
              <div className="manager-empty">
                No ranking data available.
              </div>
            ) : (
              <div className="manager-table-wrapper">

                <table className="manager-table">

                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Equipment</th>
                      <th>Asset Tag</th>
                      <th>Utilization</th>
                    </tr>
                  </thead>

                  <tbody>

                    {ranking
                      .slice(0, 10)
                      .map((item, index) => {

                        const utilization =
                          numberValue(
                            item?.utilizationPercentage ??
                            item?.utilization
                          );

                        return (
                          <tr
                            key={
                              item.equipmentId ??
                              index
                            }
                          >

                            <td>
                              #{item.rank ??
                                index + 1}
                            </td>

                            <td>
                              <strong>
                                {item.equipmentName ||
                                  "Equipment"}
                              </strong>
                            </td>

                            <td>
                              {item.assetTag ||
                                "-"}
                            </td>

                            <td>

                              <div className="utilization-table-cell">

                                <div className="utilization-progress">
                                  <div
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        Math.max(
                                          0,
                                          utilization
                                        )
                                      )}%`,
                                    }}
                                  />
                                </div>

                                <span>
                                  {utilization.toFixed(
                                    1
                                  )}%
                                </span>

                              </div>

                            </td>

                          </tr>
                        );
                      })}

                  </tbody>

                </table>

              </div>
            )}

          </section>

          <div className="manager-footer-note">
            Data is loaded from the existing
            equipment, booking, maintenance,
            access-request and sharing APIs.
          </div>

        </main>
    //   </div>
    // </div>
  );
}

export default ManagerAnalyticsDashboard;