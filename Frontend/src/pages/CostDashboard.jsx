
import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function CostDashboard() {
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // 3.7.1 - LOAD COST DATA
  // =========================================================

  useEffect(() => {
    loadCosts();
  }, []);

  const loadCosts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/costs");

      setCosts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load cost data:", err);
      setError("Unable to load cost data.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // 3.7.2 - SUMMARY CALCULATIONS
  // =========================================================

  const summary = useMemo(() => {
    const totalCost = costs.reduce(
      (sum, cost) => sum + Number(cost.totalCost || 0),
      0
    );

    const totalUsageHours = costs.reduce(
      (sum, cost) => sum + Number(cost.usageHours || 0),
      0
    );

    const pendingBilling = costs
      .filter(
        (cost) =>
          String(cost.billingStatus || "").toUpperCase() === "PENDING"
      )
      .reduce(
        (sum, cost) => sum + Number(cost.totalCost || 0),
        0
      );

    return {
      totalCost,
      totalUsageHours,
      records: costs.length,
      pendingBilling,
    };
  }, [costs]);

  // =========================================================
  // 3.7.3 - DEPARTMENT-WISE COST
  // =========================================================

  const departmentCosts = useMemo(() => {
    const grouped = {};

    costs.forEach((cost) => {
      const departmentName =
        cost.department?.name ||
        cost.department?.departmentName ||
        "Unknown Department";

      if (!grouped[departmentName]) {
        grouped[departmentName] = 0;
      }

      grouped[departmentName] += Number(cost.totalCost || 0);
    });

    return Object.entries(grouped)
      .map(([name, amount]) => ({
        name,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [costs]);

  // =========================================================
  // 3.7.4 - EQUIPMENT-WISE COST
  // =========================================================

  const equipmentCosts = useMemo(() => {
    const grouped = {};

    costs.forEach((cost) => {
      const equipmentName =
        cost.equipment?.name ||
        cost.equipment?.assetTag ||
        "Unknown Equipment";

      if (!grouped[equipmentName]) {
        grouped[equipmentName] = 0;
      }

      grouped[equipmentName] += Number(cost.totalCost || 0);
    });

    return Object.entries(grouped)
      .map(([name, amount]) => ({
        name,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [costs]);

  // =========================================================
  // 3.7.5 - FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          Loading cost dashboard...
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="page-container">
        <div className="error-state">
          <p>{error}</p>

          <button onClick={loadCosts}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <div className="page-container">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="page-header">

        <div>
          <h1>Cost Management Dashboard</h1>

          <p>
            Equipment usage and billing cost overview
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadCosts}
        >
          ↻ Refresh
        </button>

      </div>


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">
            ₹
          </div>

          <div>
            <span>Total Cost</span>

            <h2>
              {formatCurrency(summary.totalCost)}
            </h2>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">
            ⏱
          </div>

          <div>
            <span>Total Usage Hours</span>

            <h2>
              {summary.totalUsageHours.toFixed(2)}
            </h2>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">
            📋
          </div>

          <div>
            <span>Cost Records</span>

            <h2>
              {summary.records}
            </h2>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">
            ⏳
          </div>

          <div>
            <span>Pending Billing</span>

            <h2>
              {formatCurrency(summary.pendingBilling)}
            </h2>
          </div>
        </div>

      </div>


      {/* =====================================================
          ANALYSIS SECTION
      ===================================================== */}

      <div className="dashboard-grid">

        {/* DEPARTMENT */}

        <div className="dashboard-card">

          <div className="card-header">
            <h2>Department-wise Cost</h2>
          </div>

          {departmentCosts.length === 0 ? (
            <div className="empty-state">
              No department cost data available.
            </div>
          ) : (
            <div className="analysis-list">

              {departmentCosts.map((item) => (

                <div
                  className="analysis-row"
                  key={item.name}
                >

                  <span>
                    {item.name}
                  </span>

                  <strong>
                    {formatCurrency(item.amount)}
                  </strong>

                </div>

              ))}

            </div>
          )}

        </div>


        {/* EQUIPMENT */}

        <div className="dashboard-card">

          <div className="card-header">
            <h2>Equipment-wise Cost</h2>
          </div>

          {equipmentCosts.length === 0 ? (
            <div className="empty-state">
              No equipment cost data available.
            </div>
          ) : (
            <div className="analysis-list">

              {equipmentCosts.map((item) => (

                <div
                  className="analysis-row"
                  key={item.name}
                >

                  <span>
                    {item.name}
                  </span>

                  <strong>
                    {formatCurrency(item.amount)}
                  </strong>

                </div>

              ))}

            </div>
          )}

        </div>

      </div>


      {/* =====================================================
          COST RECORDS
      ===================================================== */}

      <div className="dashboard-card cost-records-card">

        <div className="card-header">

          <div>
            <h2>Cost Records</h2>

            <p>
              Actual cost records from the database
            </p>
          </div>

        </div>


        {costs.length === 0 ? (

          <div className="empty-state">
            No cost records found.
          </div>

        ) : (

          <div className="table-container">

            <table className="data-table">

              <thead>

                <tr>
                  <th>Equipment</th>
                  <th>Department</th>
                  <th>Usage Hours</th>
                  <th>Rate / Hour</th>
                  <th>Total Cost</th>
                  <th>Cost Type</th>
                  <th>Billing Status</th>
                </tr>

              </thead>


              <tbody>

                {costs.map((cost) => (

                  <tr key={cost.id}>

                    <td>
                      {cost.equipment?.name ||
                        cost.equipment?.assetTag ||
                        "—"}
                    </td>

                    <td>
                      {cost.department?.name ||
                        cost.department?.departmentName ||
                        "—"}
                    </td>

                    <td>
                      {Number(cost.usageHours || 0).toFixed(2)}
                    </td>

                    <td>
                      {formatCurrency(cost.ratePerHour)}
                    </td>

                    <td>
                      <strong>
                        {formatCurrency(cost.totalCost)}
                      </strong>
                    </td>

                    <td>
                      {cost.costType || "—"}
                    </td>

                    <td>

                      <span
                        className={`status-badge ${
                          String(
                            cost.billingStatus || ""
                          ).toLowerCase()
                        }`}
                      >
                        {cost.billingStatus || "—"}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default CostDashboard;
