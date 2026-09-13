import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./SystemAnalyticsDashboard.css";

function SystemAnalyticsDashboard() {
  const getToday = () =>
    new Date().toISOString().split("T")[0];

  const getStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return date.toISOString().split("T")[0];
  };

  const [startDate, setStartDate] =
    useState(getStartDate());

  const [endDate, setEndDate] =
    useState(getToday());

  const [report, setReport] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [demand, setDemand] = useState([]);
  const [trends, setTrends] = useState([]);

  const [equipment, setEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [maintenanceRequests, setMaintenanceRequests] =
    useState([]);

  const [workOrders, setWorkOrders] =
    useState([]);

  const [sharedEquipment, setSharedEquipment] =
    useState([]);

  const [billing, setBilling] = useState([]);
  const [costs, setCosts] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =====================================================
     HELPERS
  ===================================================== */

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

  const toArray = (response) => {
    const data = unwrap(response);

    return Array.isArray(data)
      ? data
      : [];
  };

  const numberValue = (value) => {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : 0;
  };

  const getStatus = (item) => {
    return (
      item?.status ||
      item?.bookingStatus ||
      item?.maintenanceStatus ||
      item?.workOrderStatus ||
      item?.billingStatus ||
      item?.budgetStatus ||
      ""
    )
      .toString()
      .toUpperCase();
  };

  const isWithinPeriod = (value) => {
    if (!value) {
      return true;
    }

    const date = String(value).substring(0, 10);

    return (
      date >= startDate &&
      date <= endDate
    );
  };

  const getBookingHours = (booking) => {
    if (
      booking?.usageHours !== undefined &&
      booking?.usageHours !== null
    ) {
      return numberValue(
        booking.usageHours
      );
    }

    const start = booking?.startTime;
    const end = booking?.endTime;

    if (!start || !end) {
      return 0;
    }

    const startParts = String(start)
      .substring(0, 5)
      .split(":")
      .map(Number);

    const endParts = String(end)
      .substring(0, 5)
      .split(":")
      .map(Number);

    const startMinutes =
      startParts[0] * 60 +
      (startParts[1] || 0);

    const endMinutes =
      endParts[0] * 60 +
      (endParts[1] || 0);

    let minutes =
      endMinutes - startMinutes;

    if (minutes < 0) {
      minutes += 1440;
    }

    return minutes / 60;
  };

  const formatCurrency = (value) => {
    return `₹${numberValue(
      value
    ).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  /* =====================================================
     LOAD SYSTEM DATA
  ===================================================== */

  const loadDashboard = async () => {
    if (!startDate || !endDate) {
      setError(
        "Please select both dates."
      );
      return;
    }

    if (endDate < startDate) {
      setError(
        "End date cannot be before start date."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const results =
        await Promise.allSettled([
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

          api.get("/equipment"),
          api.get("/bookings"),

          api.get("/maintenance/requests"),
          api.get("/maintenance/work-orders"),

          api.get("/shared-equipment"),

          api.get(
            "/inter-institution-billing"
          ),

          api.get("/costs"),
          api.get("/budgets"),
        ]);

      const [
        reportResult,
        rankingResult,
        demandResult,
        trendsResult,
        equipmentResult,
        bookingsResult,
        maintenanceResult,
        workOrderResult,
        sharedResult,
        billingResult,
        costsResult,
        budgetsResult,
      ] = results;

      if (
        reportResult.status ===
        "fulfilled"
      ) {
        setReport(
          unwrap(reportResult.value)
        );
      }

      if (
        rankingResult.status ===
        "fulfilled"
      ) {
        setRanking(
          toArray(rankingResult.value)
        );
      }

      if (
        demandResult.status ===
        "fulfilled"
      ) {
        setDemand(
          toArray(demandResult.value)
        );
      }

      if (
        trendsResult.status ===
        "fulfilled"
      ) {
        setTrends(
          toArray(trendsResult.value)
        );
      }

      if (
        equipmentResult.status ===
        "fulfilled"
      ) {
        setEquipment(
          toArray(
            equipmentResult.value
          )
        );
      }

      if (
        bookingsResult.status ===
        "fulfilled"
      ) {
        setBookings(
          toArray(
            bookingsResult.value
          )
        );
      }

      if (
        maintenanceResult.status ===
        "fulfilled"
      ) {
        setMaintenanceRequests(
          toArray(
            maintenanceResult.value
          )
        );
      }

      if (
        workOrderResult.status ===
        "fulfilled"
      ) {
        setWorkOrders(
          toArray(
            workOrderResult.value
          )
        );
      }

      if (
        sharedResult.status ===
        "fulfilled"
      ) {
        setSharedEquipment(
          toArray(
            sharedResult.value
          )
        );
      }

      if (
        billingResult.status ===
        "fulfilled"
      ) {
        setBilling(
          toArray(
            billingResult.value
          )
        );
      }

      if (
        costsResult.status ===
        "fulfilled"
      ) {
        setCosts(
          toArray(
            costsResult.value
          )
        );
      }

      if (
        budgetsResult.status ===
        "fulfilled"
      ) {
        setBudgets(
          toArray(
            budgetsResult.value
          )
        );
      }

      const successful =
        results.filter(
          (item) =>
            item.status ===
            "fulfilled"
        );

      if (successful.length === 0) {
        setError(
          "Unable to load system analytics."
        );
      }
    } catch (err) {
      console.error(
        "System analytics error:",
        err
      );

      setError(
        err?.response?.data?.message ||
        "Unable to load system analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* =====================================================
     EQUIPMENT
  ===================================================== */

  const equipmentStats = useMemo(() => {
    const available =
      equipment.filter(
        (item) =>
          getStatus(item) ===
          "AVAILABLE"
      ).length;

    const inUse =
      equipment.filter(
        (item) =>
          getStatus(item) ===
          "IN_USE"
      ).length;

    const booked =
      equipment.filter(
        (item) =>
          getStatus(item) ===
          "BOOKED"
      ).length;

    const maintenance =
      equipment.filter(
        (item) => {
          const status =
            getStatus(item);

          return (
            status ===
              "UNDER_MAINTENANCE" ||
            status ===
              "MAINTENANCE"
          );
        }
      ).length;

    return {
      total: equipment.length,
      available,
      inUse,
      booked,
      maintenance,
    };
  }, [equipment]);

  /* =====================================================
     BOOKINGS
  ===================================================== */

  const bookingStats = useMemo(() => {
    const filtered =
      bookings.filter(
        (booking) =>
          isWithinPeriod(
            booking?.bookingDate ||
            booking?.date
          )
      );

    let usageHours = 0;

    filtered.forEach(
      (booking) => {
        usageHours +=
          getBookingHours(
            booking
          );
      }
    );

    const confirmed =
      filtered.filter(
        (item) =>
          getStatus(item) ===
          "CONFIRMED"
      ).length;

    const completed =
      filtered.filter(
        (item) =>
          getStatus(item) ===
          "COMPLETED"
      ).length;

    const noShow =
      filtered.filter(
        (item) =>
          getStatus(item) ===
          "NO_SHOW"
      ).length;

    const cancelled =
      filtered.filter(
        (item) =>
          getStatus(item) ===
          "CANCELLED"
      ).length;

    const noShowRate =
      filtered.length > 0
        ? (noShow /
            filtered.length) *
          100
        : 0;

    return {
      total: filtered.length,
      confirmed,
      completed,
      noShow,
      cancelled,
      usageHours,
      noShowRate,
    };
  }, [
    bookings,
    startDate,
    endDate,
  ]);

  /* =====================================================
     MAINTENANCE
  ===================================================== */

  const maintenanceStats =
    useMemo(() => {
      const pending =
        maintenanceRequests.filter(
          (item) => {
            const status =
              getStatus(item);

            return (
              status === "PENDING" ||
              status ===
                "PENDING_APPROVAL"
            );
          }
        ).length;

      const inProgress =
        maintenanceRequests.filter(
          (item) =>
            getStatus(item) ===
            "IN_PROGRESS"
        ).length;

      const completed =
        maintenanceRequests.filter(
          (item) =>
            getStatus(item) ===
            "COMPLETED"
        ).length;

      const activeWorkOrders =
        workOrders.filter(
          (item) => {
            const status =
              getStatus(item);

            return (
              status ===
                "IN_PROGRESS" ||
              status === "ASSIGNED" ||
              status === "STARTED"
            );
          }
        ).length;

      return {
        total:
          maintenanceRequests.length,
        pending,
        inProgress,
        completed,
        activeWorkOrders,
      };
    }, [
      maintenanceRequests,
      workOrders,
    ]);

  /* =====================================================
     SHARING
  ===================================================== */

  const sharingStats =
    useMemo(() => {
      const billingRecords =
        billing.filter(
          (item) =>
            isWithinPeriod(
              item?.billingDate ||
              item?.createdAt
            )
        );

      const amount =
        billingRecords.reduce(
          (sum, item) =>
            sum +
            numberValue(
              item?.amount
            ),
          0
        );

      const pending =
        billingRecords.filter(
          (item) =>
            getStatus(item) ===
            "PENDING"
        ).length;

      const paid =
        billingRecords.filter(
          (item) =>
            getStatus(item) ===
            "PAID"
        ).length;

      return {
        shared:
          sharedEquipment.length,
        billingRecords:
          billingRecords.length,
        amount,
        pending,
        paid,
      };
    }, [
      sharedEquipment,
      billing,
      startDate,
      endDate,
    ]);

  /* =====================================================
     COST
  ===================================================== */

  const costStats = useMemo(() => {
    const filtered =
      costs.filter(
        (item) =>
          isWithinPeriod(
            item?.costDate ||
            item?.createdAt
          )
      );

    const total =
      filtered.reduce(
        (sum, item) =>
          sum +
          numberValue(
            item?.totalCost
          ),
        0
      );

    const usage =
      filtered
        .filter(
          (item) =>
            String(
              item?.costType ||
              ""
            )
              .toUpperCase()
              .includes("USAGE")
        )
        .reduce(
          (sum, item) =>
            sum +
            numberValue(
              item?.totalCost
            ),
          0
        );

    const maintenance =
      filtered
        .filter(
          (item) =>
            String(
              item?.costType ||
              ""
            )
              .toUpperCase()
              .includes(
                "MAINTENANCE"
              )
        )
        .reduce(
          (sum, item) =>
            sum +
            numberValue(
              item?.totalCost
            ),
          0
        );

    return {
      total,
      usage,
      maintenance,
      records: filtered.length,
    };
  }, [
    costs,
    startDate,
    endDate,
  ]);

  /* =====================================================
     BUDGET
  ===================================================== */

  const budgetStats = useMemo(() => {
    const total =
      budgets.reduce(
        (sum, item) =>
          sum +
          numberValue(
            item?.budgetAmount
          ),
        0
      );

    const used =
      budgets.reduce(
        (sum, item) =>
          sum +
          numberValue(
            item?.usedAmount
          ),
        0
      );

    const remaining =
      Math.max(
        0,
        total - used
      );

    const utilization =
      total > 0
        ? (used / total) * 100
        : 0;

    return {
      total,
      used,
      remaining,
      utilization,
    };
  }, [budgets]);

  /* =====================================================
     SYSTEM EFFICIENCY
  ===================================================== */

  const efficiency = useMemo(() => {
    const averageUtilization =
      numberValue(
        report?.averageUtilization ??
        report?.averageUtilizationPercentage
      );

    const costPerHour =
      bookingStats.usageHours >
      0
        ? costStats.total /
          bookingStats.usageHours
        : 0;

    return {
      averageUtilization,
      costPerHour,
    };
  }, [
    report,
    bookingStats,
    costStats,
  ]);

  /* =====================================================
     HIGH DEMAND
  ===================================================== */

  const highDemand =
    useMemo(() => {
      return demand
        .filter(
          (item) =>
            String(
              item?.demandLevel ||
              item?.demand ||
              ""
            ).toUpperCase() ===
            "HIGH"
        )
        .sort(
          (a, b) =>
            numberValue(
              b?.bookingCount
            ) -
            numberValue(
              a?.bookingCount
            )
        )
        .slice(0, 8);
    }, [demand]);

  /* =====================================================
     LOW UTILIZATION
  ===================================================== */

  const lowUtilization =
    useMemo(() => {
      return [...ranking]
        .sort(
          (a, b) =>
            numberValue(
              a?.utilizationPercentage
            ) -
            numberValue(
              b?.utilizationPercentage
            )
        )
        .slice(0, 8);
    }, [ranking]);

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main className="system-analytics-content">

      {/* HEADER */}

      <div className="system-header">

        <div>
          <h1>
            System Administrator Analytics
          </h1>

          <p>
            Platform-wide utilization,
            operations, resource sharing
            and financial intelligence.
          </p>
        </div>

        <button
          className="system-refresh-btn"
          onClick={loadDashboard}
          disabled={loading}
        >
          {loading
            ? "Refreshing..."
            : "↻ Refresh"}
        </button>

      </div>

      {/* FILTER */}

      <section className="system-filter">

        <div>
          <label>
            Start Date
          </label>

          <input
            type="date"
            value={startDate}
            onChange={(e) =>
              setStartDate(
                e.target.value
              )
            }
          />
        </div>

        <div>
          <label>
            End Date
          </label>

          <input
            type="date"
            value={endDate}
            onChange={(e) =>
              setEndDate(
                e.target.value
              )
            }
          />
        </div>

        <button
          onClick={loadDashboard}
          disabled={loading}
        >
          Apply Filter
        </button>

      </section>

      {error && (
        <div className="system-error">
          {error}
        </div>
      )}

      {/* PLATFORM SUMMARY */}

      <section className="system-summary">

        <div className="system-card">
          <span>
            Total Equipment
          </span>

          <strong>
            {equipmentStats.total}
          </strong>

          <small>
            Platform resources
          </small>
        </div>

        <div className="system-card">
          <span>
            Average Utilization
          </span>

          <strong>
            {efficiency.averageUtilization.toFixed(
              1
            )}
            %
          </strong>

          <small>
            Selected period
          </small>
        </div>

        <div className="system-card">
          <span>
            Total Bookings
          </span>

          <strong>
            {bookingStats.total}
          </strong>

          <small>
            Platform-wide
          </small>
        </div>

        <div className="system-card">
          <span>
            Usage Hours
          </span>

          <strong>
            {bookingStats.usageHours.toFixed(
              1
            )}
          </strong>

          <small>
            Booking duration
          </small>
        </div>

        <div className="system-card">
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

        <div className="system-card">
          <span>
            Shared Equipment
          </span>

          <strong>
            {sharingStats.shared}
          </strong>

          <small>
            Cross-institution resources
          </small>
        </div>

        <div className="system-card">
          <span>
            Total Costs
          </span>

          <strong>
            {formatCurrency(
              costStats.total
            )}
          </strong>

          <small>
            Selected period
          </small>
        </div>

        <div className="system-card">
          <span>
            Budget Utilization
          </span>

          <strong>
            {budgetStats.utilization.toFixed(
              1
            )}
            %
          </strong>

          <small>
            Platform budgets
          </small>
        </div>

      </section>

      {/* BOOKING ANALYTICS */}

      <section className="system-section">

        <div className="system-section-title">
          <h2>
            Platform Booking Analytics
          </h2>

          <p>
            Booking activity and attendance
            across the platform.
          </p>
        </div>

        <div className="system-metric-grid">

          <div>
            <span>Total</span>
            <strong>
              {bookingStats.total}
            </strong>
          </div>

          <div>
            <span>Confirmed</span>
            <strong>
              {bookingStats.confirmed}
            </strong>
          </div>

          <div>
            <span>Completed</span>
            <strong>
              {bookingStats.completed}
            </strong>
          </div>

          <div>
            <span>No Shows</span>
            <strong>
              {bookingStats.noShow}
            </strong>
          </div>

          <div>
            <span>Cancelled</span>
            <strong>
              {bookingStats.cancelled}
            </strong>
          </div>

          <div>
            <span>No-Show Rate</span>
            <strong>
              {bookingStats.noShowRate.toFixed(
                1
              )}
              %
            </strong>
          </div>

        </div>

      </section>

      {/* EQUIPMENT STATUS */}

      <section className="system-section">

        <div className="system-section-title">
          <h2>
            Platform Equipment Status
          </h2>

          <p>
            Current status of equipment
            registered across the platform.
          </p>
        </div>

        <div className="system-status-grid">

          <div>
            <span>Total</span>
            <strong>
              {equipmentStats.total}
            </strong>
          </div>

          <div>
            <span>Available</span>
            <strong>
              {equipmentStats.available}
            </strong>
          </div>

          <div>
            <span>In Use</span>
            <strong>
              {equipmentStats.inUse}
            </strong>
          </div>

          <div>
            <span>Booked</span>
            <strong>
              {equipmentStats.booked}
            </strong>
          </div>

          <div>
            <span>Maintenance</span>
            <strong>
              {equipmentStats.maintenance}
            </strong>
          </div>

        </div>

      </section>

      {/* MAINTENANCE */}

      <section className="system-section">

        <div className="system-section-title">
          <h2>
            Maintenance Operations
          </h2>

          <p>
            Platform-wide equipment
            maintenance workload.
          </p>
        </div>

        <div className="system-metric-grid">

          <div>
            <span>Total Requests</span>
            <strong>
              {maintenanceStats.total}
            </strong>
          </div>

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
              {maintenanceStats.activeWorkOrders}
            </strong>
          </div>

        </div>

      </section>

      {/* TWO COLUMNS */}

      <div className="system-two-column">

        {/* RESOURCE SHARING */}

        <section className="system-section">

          <div className="system-section-title">
            <h2>
              Resource Sharing
            </h2>

            <p>
              Cross-institution resource
              sharing and billing.
            </p>
          </div>

          <div className="system-small-grid">

            <div>
              <span>
                Shared Equipment
              </span>

              <strong>
                {sharingStats.shared}
              </strong>
            </div>

            <div>
              <span>
                Billing Records
              </span>

              <strong>
                {sharingStats.billingRecords}
              </strong>
            </div>

            <div>
              <span>
                Billing Amount
              </span>

              <strong>
                {formatCurrency(
                  sharingStats.amount
                )}
              </strong>
            </div>

            <div>
              <span>
                Pending
              </span>

              <strong>
                {sharingStats.pending}
              </strong>
            </div>

            <div>
              <span>
                Paid
              </span>

              <strong>
                {sharingStats.paid}
              </strong>
            </div>

          </div>

        </section>

        {/* FINANCE */}

        <section className="system-section">

          <div className="system-section-title">
            <h2>
              Financial Overview
            </h2>

            <p>
              Platform-wide cost
              intelligence.
            </p>
          </div>

          <div className="system-small-grid">

            <div>
              <span>
                Total Cost
              </span>

              <strong>
                {formatCurrency(
                  costStats.total
                )}
              </strong>
            </div>

            <div>
              <span>
                Usage Cost
              </span>

              <strong>
                {formatCurrency(
                  costStats.usage
                )}
              </strong>
            </div>

            <div>
              <span>
                Maintenance Cost
              </span>

              <strong>
                {formatCurrency(
                  costStats.maintenance
                )}
              </strong>
            </div>

            <div>
              <span>
                Cost / Usage Hour
              </span>

              <strong>
                {formatCurrency(
                  efficiency.costPerHour
                )}
              </strong>
            </div>

          </div>

        </section>

      </div>

      {/* BUDGET */}

      <section className="system-section">

        <div className="system-section-title">
          <h2>
            Platform Budget Utilization
          </h2>

          <p>
            Consolidated budget consumption
            across available budget records.
          </p>
        </div>

        <div className="budget-header">

          <div>
            <span>
              Used
            </span>

            <strong>
              {formatCurrency(
                budgetStats.used
              )}
            </strong>
          </div>

          <div>
            <span>
              Total Budget
            </span>

            <strong>
              {formatCurrency(
                budgetStats.total
              )}
            </strong>
          </div>

          <div>
            <span>
              Remaining
            </span>

            <strong>
              {formatCurrency(
                budgetStats.remaining
              )}
            </strong>
          </div>

          <div>
            <span>
              Utilization
            </span>

            <strong>
              {budgetStats.utilization.toFixed(
                1
              )}
              %
            </strong>
          </div>

        </div>

        <div className="system-progress-bg">
          <div
            className="system-progress"
            style={{
              width: `${Math.min(
                100,
                budgetStats.utilization
              )}%`,
            }}
          />
        </div>

      </section>

      {/* PROCUREMENT */}

      <div className="system-two-column">

        <section className="system-section">

          <div className="system-section-title">
            <h2>
              High-Demand Resources
            </h2>

            <p>
              Equipment that may require
              additional capacity.
            </p>
          </div>

          {highDemand.length === 0 ? (
            <div className="system-empty">
              No high-demand equipment
              found.
            </div>
          ) : (
            <div className="system-list">

              {highDemand.map(
                (item, index) => (
                  <div
                    className="system-list-row"
                    key={
                      item?.equipmentId ??
                      index
                    }
                  >

                    <div>
                      <strong>
                        {
                          item?.equipmentName ||
                          "Equipment"
                        }
                      </strong>

                      <small>
                        {
                          item?.assetTag ||
                          "No asset tag"
                        }
                      </small>
                    </div>

                    <span>
                      {numberValue(
                        item?.bookingCount
                      )}{" "}
                      bookings
                    </span>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        <section className="system-section">

          <div className="system-section-title">
            <h2>
              Under-Utilized Resources
            </h2>

            <p>
              Equipment with the lowest
              utilization.
            </p>
          </div>

          {lowUtilization.length === 0 ? (
            <div className="system-empty">
              No utilization data available.
            </div>
          ) : (
            <div className="system-list">

              {lowUtilization.map(
                (item, index) => {

                  const utilization =
                    numberValue(
                      item?.utilizationPercentage ??
                      item?.utilization
                    );

                  return (
                    <div
                      className="system-list-row"
                      key={
                        item?.equipmentId ??
                        index
                      }
                    >

                      <div>
                        <strong>
                          {
                            item?.equipmentName ||
                            "Equipment"
                          }
                        </strong>

                        <small>
                          {
                            item?.assetTag ||
                            "No asset tag"
                          }
                        </small>
                      </div>

                      <span>
                        {utilization.toFixed(
                          1
                        )}
                        %
                      </span>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

      </div>

      {/* EQUIPMENT RANKING */}

      <section className="system-section">

        <div className="system-section-title">
          <h2>
            Platform Equipment Ranking
          </h2>

          <p>
            Utilization ranking across all
            available equipment records.
          </p>
        </div>

        {ranking.length === 0 ? (
          <div className="system-empty">
            No equipment ranking data
            available.
          </div>
        ) : (
          <div className="system-table-wrapper">

            <table className="system-table">

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
                  .slice(0, 15)
                  .map(
                    (item, index) => {

                      const utilization =
                        numberValue(
                          item?.utilizationPercentage ??
                          item?.utilization
                        );

                      return (
                        <tr
                          key={
                            item?.equipmentId ??
                            index
                          }
                        >

                          <td>
                            #
                            {item?.rank ??
                              index + 1}
                          </td>

                          <td>
                            <strong>
                              {
                                item?.equipmentName ||
                                "Equipment"
                              }
                            </strong>
                          </td>

                          <td>
                            {
                              item?.assetTag ||
                              "-"
                            }
                          </td>

                          <td>

                            <div className="system-utilization">

                              <div className="system-progress-small-bg">

                                <div
                                  className="system-progress-small"
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
                                )}
                                %
                              </span>

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

      </section>

      <div className="system-footer">
        System Administrator view combines
        existing platform equipment, booking,
        utilization, maintenance, sharing,
        billing, cost and budget data.
      </div>

    </main>
  );
}

export default SystemAnalyticsDashboard;