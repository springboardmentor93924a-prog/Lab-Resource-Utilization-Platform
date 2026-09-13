import { useEffect, useMemo, useState } from "react";
// import Sidebar from "../components/Sidebar";
// import Topbar from "../components/Topbar";
import api from "../services/api";
import "./InstitutionAnalyticsDashboard.css";

function InstitutionAnalyticsDashboard() {
  // =========================================================
  // DATE HELPERS
  // =========================================================

  const getToday = () => {
    return new Date().toISOString().split("T")[0];
  };

  const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return date.toISOString().split("T")[0];
  };

  // =========================================================
  // STATE
  // =========================================================

  const [startDate, setStartDate] = useState(
    getDefaultStartDate()
  );

  const [endDate, setEndDate] = useState(
    getToday()
  );

  const [report, setReport] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [demand, setDemand] = useState([]);
  const [trends, setTrends] = useState([]);

  const [equipment, setEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [maintenanceRequests, setMaintenanceRequests] =
    useState([]);

  const [workOrders, setWorkOrders] = useState([]);

  const [sharedEquipment, setSharedEquipment] =
    useState([]);

  const [billing, setBilling] = useState([]);

  const [costs, setCosts] = useState([]);

  const [budgets, setBudgets] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // DATA HELPERS
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

  const toArray = (response) => {
    const data = unwrap(response);

    return Array.isArray(data) ? data : [];
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

  const getDate = (item) => {
    return (
      item?.bookingDate ||
      item?.date ||
      item?.costDate ||
      item?.billingDate ||
      item?.createdAt ||
      null
    );
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
    return `₹${numberValue(value).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    const date = String(value).substring(
      0,
      10
    );

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

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

          api.get("/inter-institution-billing"),

          api.get("/costs"),

          api.get("/budgets"),
        ]);

      const [
        reportResult,
        rankingResult,
        demandResult,
        trendResult,
        equipmentResult,
        bookingResult,
        maintenanceResult,
        workOrderResult,
        sharedResult,
        billingResult,
        costResult,
        budgetResult,
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
        trendResult.status ===
        "fulfilled"
      ) {
        setTrends(
          toArray(trendResult.value)
        );
      }

      if (
        equipmentResult.status ===
        "fulfilled"
      ) {
        setEquipment(
          toArray(equipmentResult.value)
        );
      }

      if (
        bookingResult.status ===
        "fulfilled"
      ) {
        setBookings(
          toArray(bookingResult.value)
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
        costResult.status ===
        "fulfilled"
      ) {
        setCosts(
          toArray(costResult.value)
        );
      }

      if (
        budgetResult.status ===
        "fulfilled"
      ) {
        setBudgets(
          toArray(
            budgetResult.value
          )
        );
      }

      const successful = results.filter(
        (item) =>
          item.status === "fulfilled"
      );

      if (successful.length === 0) {
        setError(
          "Unable to load institution analytics."
        );
      }
    } catch (err) {
      console.error(
        "Institution analytics error:",
        err
      );

      setError(
        err?.response?.data?.message ||
        "Unable to load institution analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // =========================================================
  // EQUIPMENT OVERVIEW
  // =========================================================

  const equipmentStats = useMemo(() => {
    const total =
      equipment.length;

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

    const maintenance =
      equipment.filter(
        (item) =>
          getStatus(item) ===
            "UNDER_MAINTENANCE" ||
          getStatus(item) ===
            "MAINTENANCE"
      ).length;

    const booked =
      equipment.filter(
        (item) =>
          getStatus(item) ===
          "BOOKED"
      ).length;

    return {
      total,
      available,
      inUse,
      maintenance,
      booked,
    };
  }, [equipment]);

  // =========================================================
  // BOOKING ANALYTICS
  // =========================================================

  const bookingStats = useMemo(() => {
    const filtered =
      bookings.filter((booking) =>
        isWithinPeriod(
          booking?.bookingDate ||
          booking?.date
        )
      );

    let totalHours = 0;

    filtered.forEach(
      (booking) => {
        totalHours +=
          getBookingHours(
            booking
          );
      }
    );

    const noShow =
      filtered.filter(
        (booking) =>
          getStatus(booking) ===
          "NO_SHOW"
      ).length;

    const completed =
      filtered.filter(
        (booking) =>
          getStatus(booking) ===
          "COMPLETED"
      ).length;

    const confirmed =
      filtered.filter(
        (booking) =>
          getStatus(booking) ===
          "CONFIRMED"
      ).length;

    const cancelled =
      filtered.filter(
        (booking) =>
          getStatus(booking) ===
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
      totalHours,
      noShow,
      noShowRate,
      completed,
      confirmed,
      cancelled,
    };
  }, [
    bookings,
    startDate,
    endDate,
  ]);

  // =========================================================
  // DEPARTMENT ANALYTICS
  // =========================================================

  const departmentStats =
    useMemo(() => {
      const map = {};

      bookings
        .filter((booking) =>
          isWithinPeriod(
            booking?.bookingDate ||
            booking?.date
          )
        )
        .forEach((booking) => {
          const department =
            booking?.departmentName ||
            booking?.department?.name ||
            booking?.userDepartment ||
            "Unassigned";

          if (!map[department]) {
            map[department] = {
              name: department,
              bookings: 0,
              hours: 0,
            };
          }

          map[department].bookings++;

          map[department].hours +=
            getBookingHours(
              booking
            );
        });

      return Object.values(map)
        .sort(
          (a, b) =>
            b.hours - a.hours
        )
        .slice(0, 8);
    }, [
      bookings,
      startDate,
      endDate,
    ]);

  // =========================================================
  // COST ANALYSIS
  // =========================================================

  const costStats = useMemo(() => {
    const filtered =
      costs.filter((cost) =>
        isWithinPeriod(
          cost?.costDate ||
          cost?.createdAt
        )
      );

    const totalCost =
      filtered.reduce(
        (sum, cost) =>
          sum +
          numberValue(
            cost?.totalCost
          ),
        0
      );

    const usageCost =
      filtered
        .filter(
          (cost) =>
            String(
              cost?.costType ||
              ""
            ).toUpperCase() ===
            "USAGE"
        )
        .reduce(
          (sum, cost) =>
            sum +
            numberValue(
              cost?.totalCost
            ),
          0
        );

    const maintenanceCost =
      filtered
        .filter(
          (cost) =>
            String(
              cost?.costType ||
              ""
            )
              .toUpperCase()
              .includes(
                "MAINTENANCE"
              )
        )
        .reduce(
          (sum, cost) =>
            sum +
            numberValue(
              cost?.totalCost
            ),
          0
        );

    return {
      totalCost,
      usageCost,
      maintenanceCost,
      records: filtered.length,
    };
  }, [
    costs,
    startDate,
    endDate,
  ]);

  // =========================================================
  // BUDGET ANALYSIS
  // =========================================================

  const budgetStats =
    useMemo(() => {
      const totalBudget =
        budgets.reduce(
          (sum, budget) =>
            sum +
            numberValue(
              budget?.budgetAmount
            ),
          0
        );

      const usedBudget =
        budgets.reduce(
          (sum, budget) =>
            sum +
            numberValue(
              budget?.usedAmount
            ),
          0
        );

      const remaining =
        Math.max(
          0,
          totalBudget -
            usedBudget
        );

      const utilization =
        totalBudget > 0
          ? (usedBudget /
              totalBudget) *
            100
          : 0;

      return {
        totalBudget,
        usedBudget,
        remaining,
        utilization,
      };
    }, [budgets]);

  // =========================================================
  // SHARING ANALYSIS
  // =========================================================

  const sharingStats =
    useMemo(() => {
      const shared =
        sharedEquipment.length;

      const billingRecords =
        billing.filter(
          (item) =>
            isWithinPeriod(
              item?.billingDate ||
              item?.createdAt
            )
        );

      const billingAmount =
        billingRecords.reduce(
          (sum, item) =>
            sum +
            numberValue(
              item?.amount ??
              item?.billingAmount ??
              item?.totalAmount
            ),
          0
        );

      const pendingBilling =
        billingRecords.filter(
          (item) =>
            getStatus(item) ===
            "PENDING"
        ).length;

      const paidBilling =
        billingRecords.filter(
          (item) =>
            getStatus(item) ===
            "PAID"
        ).length;

      return {
        shared,
        billingRecords:
          billingRecords.length,
        billingAmount,
        pendingBilling,
        paidBilling,
      };
    }, [
      sharedEquipment,
      billing,
      startDate,
      endDate,
    ]);

  // =========================================================
  // MAINTENANCE
  // =========================================================

  const maintenanceStats =
    useMemo(() => {
      const pending =
        maintenanceRequests.filter(
          (item) => {
            const status =
              getStatus(item);

            return (
              status ===
                "PENDING" ||
              status ===
                "PENDING_APPROVAL"
            );
          }
        ).length;

      const inProgress =
        maintenanceRequests.filter(
          (item) => {
            const status =
              getStatus(item);

            return (
              status ===
                "IN_PROGRESS" ||
              status ===
                "IN PROGRESS"
            );
          }
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
              status ===
                "ASSIGNED" ||
              status ===
                "STARTED"
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

  // =========================================================
  // HIGH DEMAND
  // =========================================================

  const highDemand =
    useMemo(() => {
      return demand
        .filter((item) => {
          const level =
            String(
              item?.demandLevel ||
              item?.demand ||
              item?.level ||
              ""
            ).toUpperCase();

          return level === "HIGH";
        })
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

  // =========================================================
  // LOW UTILIZATION
  // =========================================================

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
        .slice(0, 6);
    }, [ranking]);

  // =========================================================
  // ROI / RESOURCE EFFICIENCY
  // =========================================================

  const efficiencyStats =
    useMemo(() => {
      const averageUtilization =
        numberValue(
          report?.averageUtilization ??
          report?.averageUtilizationPercentage
        );

      const totalUsageHours =
        bookingStats.totalHours;

      const costPerUsageHour =
        totalUsageHours > 0
          ? costStats.totalCost /
            totalUsageHours
          : 0;

      return {
        averageUtilization,
        totalUsageHours,
        costPerUsageHour,
      };
    }, [
      report,
      bookingStats,
      costStats,
    ]);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    // <div className="institution-analytics-layout">

    //   <Sidebar />

    //   <div className="institution-analytics-main">

    //     <Topbar />

        <main className="institution-analytics-content">

          {/* HEADER */}

          <div className="institution-header">

            <div>
              <h1>
                Institution Analytics
              </h1>

              <p>
                Organization-wide utilization,
                resource sharing, cost and
                equipment intelligence.
              </p>
            </div>

            <button
              className="institution-refresh-btn"
              onClick={loadDashboard}
              disabled={loading}
            >
              {loading
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>

          </div>

          {/* FILTER */}

          <section className="institution-filter">

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
            <div className="institution-error">
              {error}
            </div>
          )}

          {/* ORGANIZATION SUMMARY */}

          <section className="institution-summary">

            <div className="institution-summary-card">
              <span>
                Total Equipment
              </span>

              <strong>
                {equipmentStats.total}
              </strong>

              <small>
                Organization resources
              </small>
            </div>

            <div className="institution-summary-card">
              <span>
                Average Utilization
              </span>

              <strong>
                {efficiencyStats.averageUtilization.toFixed(
                  1
                )}
                %
              </strong>

              <small>
                Selected period
              </small>
            </div>

            <div className="institution-summary-card">
              <span>
                Total Bookings
              </span>

              <strong>
                {bookingStats.total}
              </strong>

              <small>
                Organization-wide
              </small>
            </div>

            <div className="institution-summary-card">
              <span>
                Usage Hours
              </span>

              <strong>
                {bookingStats.totalHours.toFixed(
                  1
                )}
              </strong>

              <small>
                Calculated from bookings
              </small>
            </div>

            <div className="institution-summary-card">
              <span>
                Total Costs
              </span>

              <strong>
                {formatCurrency(
                  costStats.totalCost
                )}
              </strong>

              <small>
                Selected period
              </small>
            </div>

            <div className="institution-summary-card">
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
                Organization budgets
              </small>
            </div>

          </section>

          {/* EQUIPMENT STATUS */}

          <section className="institution-section">

            <div className="institution-section-title">
              <h2>
                Equipment Status Overview
              </h2>

              <p>
                Current organization-wide
                equipment availability.
              </p>
            </div>

            <div className="equipment-status-grid">

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

          {/* DEPARTMENT ANALYTICS */}

          <section className="institution-section">

            <div className="institution-section-title">
              <h2>
                Department-wise Utilization
              </h2>

              <p>
                Booking and resource usage
                across departments.
              </p>
            </div>

            {departmentStats.length === 0 ? (
              <div className="institution-empty">
                Department booking data is not
                available for this period.
              </div>
            ) : (
              <div className="department-list">

                {departmentStats.map(
                  (department, index) => {

                    const maxHours =
                      Math.max(
                        ...departmentStats.map(
                          (item) =>
                            item.hours
                        ),
                        1
                      );

                    const percentage =
                      (department.hours /
                        maxHours) *
                      100;

                    return (
                      <div
                        className="department-row"
                        key={index}
                      >

                        <div className="department-name">
                          <strong>
                            {department.name}
                          </strong>

                          <small>
                            {
                              department.bookings
                            }{" "}
                            bookings
                          </small>
                        </div>

                        <div className="department-bar-area">

                          <div className="department-bar-bg">
                            <div
                              className="department-bar"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>

                          <span>
                            {department.hours.toFixed(
                              1
                            )}{" "}
                            hrs
                          </span>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </section>

          {/* TWO COLUMNS */}

          <div className="institution-two-column">

            {/* COST */}

            <section className="institution-section">

              <div className="institution-section-title">
                <h2>
                  Cost Analysis
                </h2>

                <p>
                  Organization resource
                  expenditure.
                </p>
              </div>

              <div className="cost-grid">

                <div>
                  <span>
                    Total Cost
                  </span>

                  <strong>
                    {formatCurrency(
                      costStats.totalCost
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Usage Cost
                  </span>

                  <strong>
                    {formatCurrency(
                      costStats.usageCost
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Maintenance Cost
                  </span>

                  <strong>
                    {formatCurrency(
                      costStats.maintenanceCost
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Cost / Usage Hour
                  </span>

                  <strong>
                    {formatCurrency(
                      efficiencyStats.costPerUsageHour
                    )}
                  </strong>
                </div>

              </div>

            </section>

            {/* BUDGET */}

            <section className="institution-section">

              <div className="institution-section-title">
                <h2>
                  Budget Utilization
                </h2>

                <p>
                  Organization budget
                  consumption.
                </p>
              </div>

              <div className="budget-display">

                <div className="budget-number">
                  <strong>
                    {formatCurrency(
                      budgetStats.usedBudget
                    )}
                  </strong>

                  <span>
                    used of{" "}
                    {formatCurrency(
                      budgetStats.totalBudget
                    )}
                  </span>
                </div>

                <div className="budget-progress-bg">
                  <div
                    className="budget-progress"
                    style={{
                      width: `${Math.min(
                        100,
                        budgetStats.utilization
                      )}%`,
                    }}
                  />
                </div>

                <div className="budget-footer">
                  <span>
                    Remaining
                  </span>

                  <strong>
                    {formatCurrency(
                      budgetStats.remaining
                    )}
                  </strong>
                </div>

              </div>

            </section>

          </div>

          {/* SHARING */}

          <section className="institution-section">

            <div className="institution-section-title">
              <h2>
                Inter-Institution Resource Sharing
              </h2>

              <p>
                Organization resource sharing
                and billing activity.
              </p>
            </div>

            <div className="sharing-grid">

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
                    sharingStats.billingAmount
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Pending Billing
                </span>

                <strong>
                  {sharingStats.pendingBilling}
                </strong>
              </div>

              <div>
                <span>
                  Paid Billing
                </span>

                <strong>
                  {sharingStats.paidBilling}
                </strong>
              </div>

            </div>

          </section>

          {/* MAINTENANCE */}

          <section className="institution-section">

            <div className="institution-section-title">
              <h2>
                Maintenance & Equipment Lifecycle
              </h2>

              <p>
                Organization maintenance workload
                and equipment health.
              </p>
            </div>

            <div className="maintenance-grid">

              <div>
                <span>
                  Total Requests
                </span>

                <strong>
                  {maintenanceStats.total}
                </strong>
              </div>

              <div>
                <span>
                  Pending
                </span>

                <strong>
                  {maintenanceStats.pending}
                </strong>
              </div>

              <div>
                <span>
                  In Progress
                </span>

                <strong>
                  {maintenanceStats.inProgress}
                </strong>
              </div>

              <div>
                <span>
                  Completed
                </span>

                <strong>
                  {maintenanceStats.completed}
                </strong>
              </div>

              <div>
                <span>
                  Active Work Orders
                </span>

                <strong>
                  {maintenanceStats.activeWorkOrders}
                </strong>
              </div>

            </div>

          </section>

          {/* PROCUREMENT INSIGHTS */}

          <div className="institution-two-column">

            <section className="institution-section">

              <div className="institution-section-title">
                <h2>
                  Procurement Insights
                </h2>

                <p>
                  High-demand equipment that may
                  require additional capacity.
                </p>
              </div>

              {highDemand.length === 0 ? (
                <div className="institution-empty">
                  No high-demand equipment found.
                </div>
              ) : (
                <div className="insight-list">

                  {highDemand.map(
                    (item, index) => (
                      <div
                        className="insight-row"
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

            {/* LOW UTILIZATION */}

            <section className="institution-section">

              <div className="institution-section-title">
                <h2>
                  Under-Utilized Equipment
                </h2>

                <p>
                  Resources with the lowest
                  utilization.
                </p>
              </div>

              {lowUtilization.length === 0 ? (
                <div className="institution-empty">
                  No utilization ranking data.
                </div>
              ) : (
                <div className="insight-list">

                  {lowUtilization.map(
                    (item, index) => {

                      const utilization =
                        numberValue(
                          item?.utilizationPercentage ??
                          item?.utilization
                        );

                      return (
                        <div
                          className="insight-row"
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

          {/* RESOURCE EFFICIENCY */}

          <section className="institution-section">

            <div className="institution-section-title">
              <h2>
                Resource Efficiency & ROI
              </h2>

              <p>
                Key indicators for organization
                resource planning.
              </p>
            </div>

            <div className="roi-grid">

              <div className="roi-card">
                <span>
                  Average Utilization
                </span>

                <strong>
                  {efficiencyStats.averageUtilization.toFixed(
                    1
                  )}
                  %
                </strong>
              </div>

              <div className="roi-card">
                <span>
                  Total Usage Hours
                </span>

                <strong>
                  {efficiencyStats.totalUsageHours.toFixed(
                    1
                  )}
                </strong>
              </div>

              <div className="roi-card">
                <span>
                  Cost / Usage Hour
                </span>

                <strong>
                  {formatCurrency(
                    efficiencyStats.costPerUsageHour
                  )}
                </strong>
              </div>

              <div className="roi-card">
                <span>
                  No-Show Rate
                </span>

                <strong>
                  {bookingStats.noShowRate.toFixed(
                    1
                  )}
                  %
                </strong>
              </div>

            </div>

          </section>

          {/* UTILIZATION RANKING */}

          <section className="institution-section">

            <div className="institution-section-title">
              <h2>
                Organization Equipment Ranking
              </h2>

              <p>
                Equipment utilization across the
                organization.
              </p>
            </div>

            {ranking.length === 0 ? (
              <div className="institution-empty">
                No equipment ranking data available.
              </div>
            ) : (
              <div className="institution-table-wrapper">

                <table className="institution-table">

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
                      .slice(0, 12)
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

                                <div className="institution-utilization">

                                  <div className="institution-progress-bg">

                                    <div
                                      className="institution-progress"
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

          <div className="institution-footer">
            Institution analytics uses existing
            equipment, booking, utilization,
            maintenance, sharing, billing, cost
            and budget data.
          </div>

        </main>

    //   </div>

    // </div>
  );
}

export default InstitutionAnalyticsDashboard;