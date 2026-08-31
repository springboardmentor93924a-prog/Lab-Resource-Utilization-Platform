import React, { useEffect, useState } from "react";
import {
  getAllCosts,
  calculateCost,
  deleteCost,
} from "../services/costApi";

function Cost() {
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD COSTS
  // =========================================================

  const loadCosts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllCosts();

      setCosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load costs:", err);

      setError(
        err.response?.data?.message ||
        "Failed to load cost records."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadCosts();
  }, []);

  // =========================================================
  // CALCULATE COST
  // =========================================================

  const handleCalculate = async (id) => {
    try {
      await calculateCost(id);

      await loadCosts();
    } catch (err) {
      console.error("Failed to calculate cost:", err);

      setError(
        err.response?.data?.message ||
        "Failed to calculate cost."
      );
    }
  };

  // =========================================================
  // DELETE COST
  // =========================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this cost record?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCost(id);

      await loadCosts();
    } catch (err) {
      console.error("Failed to delete cost:", err);

      setError(
        err.response?.data?.message ||
        "Failed to delete cost."
      );
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="page-container">
        <h1>Cost Management</h1>
        <p>Loading cost records...</p>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <h1>Cost Management</h1>
          <p>
            Track equipment usage costs and billing information.
          </p>
        </div>

        <button
          type="button"
          onClick={loadCosts}
          className="btn-primary"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="cost-summary">

        <div className="summary-card">
          <h3>Total Records</h3>
          <p>{costs.length}</p>
        </div>

        <div className="summary-card">
          <h3>Total Cost</h3>
          <p>
            ₹
            {costs
              .reduce(
                (sum, cost) =>
                  sum + Number(cost.totalCost || 0),
                0
              )
              .toFixed(2)}
          </p>
        </div>

        <div className="summary-card">
          <h3>Pending</h3>
          <p>
            {
              costs.filter(
                (cost) =>
                  cost.billingStatus === "PENDING"
              ).length
            }
          </p>
        </div>

        <div className="summary-card">
          <h3>Paid</h3>
          <p>
            {
              costs.filter(
                (cost) =>
                  cost.billingStatus === "PAID"
              ).length
            }
          </p>
        </div>

      </div>

      <div className="table-container">

        <table className="data-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Equipment</th>
              <th>Department</th>
              <th>Institution</th>
              <th>Type</th>
              <th>Usage Hours</th>
              <th>Rate / Hour</th>
              <th>Total Cost</th>
              <th>Billing Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {costs.length === 0 ? (

              <tr>
                <td colSpan="11">
                  No cost records found.
                </td>
              </tr>

            ) : (

              costs.map((cost) => (

                <tr key={cost.id}>

                  <td>
                    {cost.id}
                  </td>

                  <td>
                    {cost.equipment?.name ||
                      `Equipment #${cost.equipment?.id || "-"}`}
                  </td>

                  <td>
                    {cost.department?.name ||
                      `Department #${cost.department?.id || "-"}`}
                  </td>

                  <td>
                    {cost.institution?.name ||
                      `Institution #${cost.institution?.id || "-"}`}
                  </td>

                  <td>
                    {cost.costType || "-"}
                  </td>

                  <td>
                    {cost.usageHours ?? 0}
                  </td>

                  <td>
                    ₹{Number(
                      cost.ratePerHour || 0
                    ).toFixed(2)}
                  </td>

                  <td>
                    <strong>
                      ₹{Number(
                        cost.totalCost || 0
                      ).toFixed(2)}
                    </strong>
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        cost.billingStatus
                          ?.toLowerCase() || ""
                      }`}
                    >
                      {cost.billingStatus || "-"}
                    </span>
                  </td>

                  <td>
                    {cost.costDate || "-"}
                  </td>

                  <td>

                    <div className="action-buttons">

                      <button
                        type="button"
                        onClick={() =>
                          handleCalculate(cost.id)
                        }
                        className="btn-secondary"
                      >
                        Calculate
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(cost.id)
                        }
                        className="btn-danger"
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Cost;