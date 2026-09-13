import React, { useEffect, useMemo, useState } from "react";
import {
  getAllCosts,
  calculateCost,
  deleteCost,
} from "../services/costApi";
import "./CostDashboard.css";

const BILLING_STATUSES = [
  "PENDING",
  "GENERATED",
  "PAID",
  "CANCELLED",
];

const CostDashboard = () => {
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [billingFilter, setBillingFilter] = useState("ALL");
  const [costTypeFilter, setCostTypeFilter] = useState("ALL");

  const [calculatingId, setCalculatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // =========================================================
  // LOAD COSTS
  // =========================================================

  const loadCosts = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getAllCosts();

      setCosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading costs:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Failed to load cost records."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCosts();
  }, []);

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (value) => {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // =========================================================
  // FORMAT NUMBER
  // =========================================================

  const formatNumber = (value) => {
    return Number(value || 0).toFixed(2);
  };

  // =========================================================
  // GET EQUIPMENT NAME
  // =========================================================

  const getEquipmentName = (cost) => {
    if (!cost?.equipment) {
      return "N/A";
    }

    return (
      cost.equipment.name ||
      cost.equipment.equipmentName ||
      cost.equipment.assetTag ||
      `Equipment #${cost.equipment.id || "-"}`
    );
  };

  // =========================================================
  // GET DEPARTMENT NAME
  // =========================================================

  const getDepartmentName = (cost) => {
    if (!cost?.department) {
      return "Not Assigned";
    }

    return (
      cost.department.name ||
      cost.department.departmentName ||
      `Department #${cost.department.id || "-"}`
    );
  };

  // =========================================================
  // GET INSTITUTION NAME
  // =========================================================

  const getInstitutionName = (cost) => {
    if (!cost?.institution) {
      return "Not Assigned";
    }

    return (
      cost.institution.name ||
      cost.institution.institutionName ||
      `Institution #${cost.institution.id || "-"}`
    );
  };

  // =========================================================
  // GET UNIQUE COST TYPES
  // =========================================================

  const costTypes = useMemo(() => {
    return [
      ...new Set(
        costs
          .map((cost) => cost?.costType)
          .filter(Boolean)
      ),
    ].sort();
  }, [costs]);

  // =========================================================
  // FILTER COSTS
  // =========================================================

  const filteredCosts = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return costs.filter((cost) => {
      const equipmentName = getEquipmentName(cost).toLowerCase();
      const departmentName = getDepartmentName(cost).toLowerCase();
      const institutionName = getInstitutionName(cost).toLowerCase();
      const costType = String(cost?.costType || "").toLowerCase();
      const description = String(
        cost?.description || ""
      ).toLowerCase();

      const matchesSearch =
        !searchText ||
        equipmentName.includes(searchText) ||
        departmentName.includes(searchText) ||
        institutionName.includes(searchText) ||
        costType.includes(searchText) ||
        description.includes(searchText) ||
        String(cost?.id || "").includes(searchText);

      const matchesBilling =
        billingFilter === "ALL" ||
        cost?.billingStatus === billingFilter;

      const matchesCostType =
        costTypeFilter === "ALL" ||
        cost?.costType === costTypeFilter;

      return (
        matchesSearch &&
        matchesBilling &&
        matchesCostType
      );
    });
  }, [
    costs,
    search,
    billingFilter,
    costTypeFilter,
  ]);

  // =========================================================
  // DASHBOARD STATISTICS
  // =========================================================

  const statistics = useMemo(() => {
    const totalCost = costs.reduce(
      (sum, cost) =>
        sum + Number(cost?.totalCost || 0),
      0
    );

    const totalUsageHours = costs.reduce(
      (sum, cost) =>
        sum + Number(cost?.usageHours || 0),
      0
    );

    const pendingCost = costs
      .filter(
        (cost) =>
          cost?.billingStatus === "PENDING"
      )
      .reduce(
        (sum, cost) =>
          sum + Number(cost?.totalCost || 0),
        0
      );

    const generatedCost = costs
      .filter(
        (cost) =>
          cost?.billingStatus === "GENERATED"
      )
      .reduce(
        (sum, cost) =>
          sum + Number(cost?.totalCost || 0),
        0
      );

    const paidCost = costs
      .filter(
        (cost) =>
          cost?.billingStatus === "PAID"
      )
      .reduce(
        (sum, cost) =>
          sum + Number(cost?.totalCost || 0),
        0
      );

    const cancelledCost = costs
      .filter(
        (cost) =>
          cost?.billingStatus === "CANCELLED"
      )
      .reduce(
        (sum, cost) =>
          sum + Number(cost?.totalCost || 0),
        0
      );

    const pendingRecords = costs.filter(
      (cost) =>
        cost?.billingStatus === "PENDING"
    ).length;

    const generatedRecords = costs.filter(
      (cost) =>
        cost?.billingStatus === "GENERATED"
    ).length;

    const paidRecords = costs.filter(
      (cost) =>
        cost?.billingStatus === "PAID"
    ).length;

    const cancelledRecords = costs.filter(
      (cost) =>
        cost?.billingStatus === "CANCELLED"
    ).length;

    return {
      totalCost,
      totalUsageHours,
      pendingCost,
      generatedCost,
      paidCost,
      cancelledCost,
      totalRecords: costs.length,
      pendingRecords,
      generatedRecords,
      paidRecords,
      cancelledRecords,
    };
  }, [costs]);

  // =========================================================
  // CALCULATE COST
  // =========================================================

  const handleCalculate = async (id) => {
    if (!id) {
      return;
    }

    try {
      setCalculatingId(id);
      setError("");
      setSuccess("");

      await calculateCost(id);

      setSuccess(
        "Cost calculated successfully."
      );

      await loadCosts();
    } catch (err) {
      console.error(
        "Error calculating cost:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Failed to calculate cost."
      );
    } finally {
      setCalculatingId(null);
    }
  };

  // =========================================================
  // DELETE COST
  // =========================================================

  const handleDelete = async (id) => {
    if (!id) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this cost record?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      await deleteCost(id);

      setSuccess(
        "Cost record deleted successfully."
      );

      setCosts((previousCosts) =>
        previousCosts.filter(
          (cost) => cost.id !== id
        )
      );
    } catch (err) {
      console.error(
        "Error deleting cost:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Failed to delete cost record."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = async () => {
    setSuccess("");
    await loadCosts(true);
  };

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearch("");
    setBillingFilter("ALL");
    setCostTypeFilter("ALL");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    billingFilter !== "ALL" ||
    costTypeFilter !== "ALL";

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getBillingStatusClass = (status) => {
    return `billing-${String(
      status || "UNKNOWN"
    ).toLowerCase()}`;
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="cost-dashboard">
        <div className="cost-loading">
          <div className="cost-spinner"></div>
          <p>Loading cost records...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="cost-dashboard">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="cost-page-header">

        <div className="cost-header-content">
          <div className="cost-title-row">
            <div className="cost-title-icon">
              ₹
            </div>

            <div>
              <h1>Cost Management</h1>

              <p>
                Monitor equipment usage costs,
                billing and financial information.
              </p>
            </div>
          </div>
        </div>

        <button
          className="cost-refresh-btn"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <span
            className={
              refreshing
                ? "refresh-icon refresh-spin"
                : "refresh-icon"
            }
          >
            ↻
          </span>

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>

      {/* =====================================================
          ALERTS
      ====================================================== */}

      {error && (
        <div className="cost-alert cost-alert-error">
          <span className="alert-icon">⚠</span>

          <span className="alert-message">
            {error}
          </span>

          <button
            className="alert-close"
            onClick={() => setError("")}
            aria-label="Close error"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="cost-alert cost-alert-success">
          <span className="alert-icon">✓</span>

          <span className="alert-message">
            {success}
          </span>

          <button
            className="alert-close"
            onClick={() => setSuccess("")}
            aria-label="Close success"
          >
            ×
          </button>
        </div>
      )}

      {/* =====================================================
          MAIN STATISTICS
      ====================================================== */}

      <div className="cost-stat-grid">

        <div className="cost-stat-card">

          <div className="cost-stat-icon">
            ₹
          </div>

          <div className="cost-stat-content">
            <p>Total Cost</p>

            <h2>
              {formatCurrency(
                statistics.totalCost
              )}
            </h2>

            <span className="cost-stat-subtext">
              All cost records
            </span>
          </div>

        </div>

        <div className="cost-stat-card">

          <div className="cost-stat-icon">
            ◷
          </div>

          <div className="cost-stat-content">
            <p>Usage Hours</p>

            <h2>
              {formatNumber(
                statistics.totalUsageHours
              )}
            </h2>

            <span className="cost-stat-subtext">
              Equipment usage
            </span>
          </div>

        </div>

        <div className="cost-stat-card">

          <div className="cost-stat-icon cost-icon-warning">
            ⏳
          </div>

          <div className="cost-stat-content">
            <p>Pending Cost</p>

            <h2>
              {formatCurrency(
                statistics.pendingCost
              )}
            </h2>

            <span className="cost-stat-subtext">
              {statistics.pendingRecords} record
              {statistics.pendingRecords !== 1
                ? "s"
                : ""}
            </span>
          </div>

        </div>

        <div className="cost-stat-card">

          <div className="cost-stat-icon cost-icon-generated">
            $
          </div>

          <div className="cost-stat-content">
            <p>Generated Cost</p>

            <h2>
              {formatCurrency(
                statistics.generatedCost
              )}
            </h2>

            <span className="cost-stat-subtext">
              {statistics.generatedRecords} record
              {statistics.generatedRecords !== 1
                ? "s"
                : ""}
            </span>
          </div>

        </div>

        <div className="cost-stat-card">

          <div className="cost-stat-icon cost-icon-success">
            ✓
          </div>

          <div className="cost-stat-content">
            <p>Paid Cost</p>

            <h2>
              {formatCurrency(
                statistics.paidCost
              )}
            </h2>

            <span className="cost-stat-subtext">
              {statistics.paidRecords} record
              {statistics.paidRecords !== 1
                ? "s"
                : ""}
            </span>
          </div>

        </div>

      </div>

      {/* =====================================================
          SECONDARY STATUS SUMMARY
      ====================================================== */}

      <div className="cost-status-summary">

        <div className="cost-status-summary-header">
          <div>
            <h2>Billing Overview</h2>

            <p>
              Current billing status distribution
            </p>
          </div>

          <span className="cost-record-count">
            {statistics.totalRecords} total records
          </span>
        </div>

        <div className="cost-status-grid">

          <div className="cost-status-item">
            <div className="status-item-left">
              <span className="status-dot status-dot-pending"></span>

              <div>
                <strong>Pending</strong>
                <small>
                  {statistics.pendingRecords} records
                </small>
              </div>
            </div>

            <strong>
              {formatCurrency(
                statistics.pendingCost
              )}
            </strong>
          </div>

          <div className="cost-status-item">
            <div className="status-item-left">
              <span className="status-dot status-dot-generated"></span>

              <div>
                <strong>Generated</strong>
                <small>
                  {statistics.generatedRecords} records
                </small>
              </div>
            </div>

            <strong>
              {formatCurrency(
                statistics.generatedCost
              )}
            </strong>
          </div>

          <div className="cost-status-item">
            <div className="status-item-left">
              <span className="status-dot status-dot-paid"></span>

              <div>
                <strong>Paid</strong>
                <small>
                  {statistics.paidRecords} records
                </small>
              </div>
            </div>

            <strong>
              {formatCurrency(
                statistics.paidCost
              )}
            </strong>
          </div>

          <div className="cost-status-item">
            <div className="status-item-left">
              <span className="status-dot status-dot-cancelled"></span>

              <div>
                <strong>Cancelled</strong>
                <small>
                  {statistics.cancelledRecords} records
                </small>
              </div>
            </div>

            <strong>
              {formatCurrency(
                statistics.cancelledCost
              )}
            </strong>
          </div>

        </div>

      </div>

      {/* =====================================================
          FILTERS
      ====================================================== */}

      <div className="cost-filter-card">

        <div className="cost-filter-top">

          <div className="cost-search-wrapper">

            <span className="cost-search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search equipment, department, institution, cost type..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            {search && (
              <button
                className="cost-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}

          </div>

          <select
            value={billingFilter}
            onChange={(event) =>
              setBillingFilter(
                event.target.value
              )
            }
          >
            <option value="ALL">
              All Billing Status
            </option>

            {BILLING_STATUSES.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}
          </select>

          <select
            value={costTypeFilter}
            onChange={(event) =>
              setCostTypeFilter(
                event.target.value
              )
            }
          >
            <option value="ALL">
              All Cost Types
            </option>

            {costTypes.map((type) => (
              <option
                key={type}
                value={type}
              >
                {type}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              className="clear-filter-btn"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}

        </div>

        <div className="cost-filter-info">

          <span>
            Showing{" "}
            <strong>
              {filteredCosts.length}
            </strong>{" "}
            of{" "}
            <strong>
              {costs.length}
            </strong>{" "}
            cost records
          </span>

          {hasActiveFilters && (
            <span className="filter-active-text">
              Filters active
            </span>
          )}

        </div>

      </div>

      {/* =====================================================
          TABLE
      ====================================================== */}

      <div className="cost-table-card">

        <div className="cost-table-header">

          <div>
            <h2>Cost Records</h2>

            <p>
              Equipment usage cost and billing
              information
            </p>
          </div>

          <div className="table-header-count">
            {filteredCosts.length}{" "}
            {filteredCosts.length === 1
              ? "record"
              : "records"}
          </div>

        </div>

        {filteredCosts.length === 0 ? (

          <div className="cost-empty">

            <div className="cost-empty-icon">
              ₹
            </div>

            <h3>
              No cost records found
            </h3>

            <p>
              {costs.length === 0
                ? "There are currently no cost records in the system."
                : "No cost records match your current filters."}
            </p>

            {hasActiveFilters && (
              <button
                className="empty-clear-btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}

          </div>

        ) : (

          <div className="cost-table-container">

            <table className="cost-table">

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Equipment</th>
                  <th>Department</th>
                  <th>Institution</th>
                  <th>Cost Type</th>
                  <th>Usage Hours</th>
                  <th>Rate / Hour</th>
                  <th>Total Cost</th>
                  <th>Billing Status</th>
                  <th>Cost Date</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredCosts.map(
                  (cost) => (

                    <tr key={cost.id}>

                      {/* ID */}

                      <td>
                        <span className="cost-id">
                          #{cost.id}
                        </span>
                      </td>

                      {/* EQUIPMENT */}

                      <td>

                        <div className="cost-equipment">

                          <div className="equipment-mini-icon">
                            ⚙
                          </div>

                          <div>
                            <strong>
                              {getEquipmentName(
                                cost
                              )}
                            </strong>

                            {cost?.equipment
                              ?.assetTag && (
                              <small>
                                {
                                  cost.equipment
                                    .assetTag
                                }
                              </small>
                            )}
                          </div>

                        </div>

                      </td>

                      {/* DEPARTMENT */}

                      <td>
                        <span className="table-text">
                          {getDepartmentName(
                            cost
                          )}
                        </span>
                      </td>

                      {/* INSTITUTION */}

                      <td>
                        <span className="table-text">
                          {getInstitutionName(
                            cost
                          )}
                        </span>
                      </td>

                      {/* COST TYPE */}

                      <td>
                        <span className="cost-type-badge">
                          {cost?.costType ||
                            "N/A"}
                        </span>
                      </td>

                      {/* USAGE HOURS */}

                      <td>
                        <span className="number-value">
                          {formatNumber(
                            cost?.usageHours
                          )}
                        </span>
                      </td>

                      {/* RATE */}

                      <td>
                        <span className="money-value">
                          {formatCurrency(
                            cost?.ratePerHour
                          )}
                        </span>
                      </td>

                      {/* TOTAL COST */}

                      <td>
                        <strong className="total-cost-value">
                          {formatCurrency(
                            cost?.totalCost
                          )}
                        </strong>
                      </td>

                      {/* BILLING STATUS */}

                      <td>

                        <span
                          className={`billing-status ${getBillingStatusClass(
                            cost?.billingStatus
                          )}`}
                        >
                          <span className="status-badge-dot"></span>

                          {cost?.billingStatus ||
                            "UNKNOWN"}
                        </span>

                      </td>

                      {/* DATE */}

                      <td>
                        <span className="date-value">
                          {cost?.costDate ||
                            "N/A"}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="cost-actions">

                          <button
                            className="calculate-btn"
                            title="Calculate Cost"
                            disabled={
                              calculatingId ===
                              cost.id ||
                              deletingId ===
                              cost.id
                            }
                            onClick={() =>
                              handleCalculate(
                                cost.id
                              )
                            }
                          >
                            {calculatingId ===
                            cost.id
                              ? (
                                <>
                                  <span className="button-spinner"></span>
                                  Calculating
                                </>
                              )
                              : "Calculate"}
                          </button>

                          <button
                            className="delete-btn"
                            title="Delete Cost"
                            disabled={
                              deletingId ===
                              cost.id ||
                              calculatingId ===
                              cost.id
                            }
                            onClick={() =>
                              handleDelete(
                                cost.id
                              )
                            }
                          >
                            {deletingId ===
                            cost.id
                              ? (
                                <>
                                  <span className="button-spinner"></span>
                                  Deleting
                                </>
                              )
                              : "Delete"}
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
};

export default CostDashboard;