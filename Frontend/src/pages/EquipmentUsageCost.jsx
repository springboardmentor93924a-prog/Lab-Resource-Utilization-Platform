
import React, { useEffect, useState } from "react";
import api from "../services/api";

function EquipmentUsageCost() {
  const [costs, setCosts] = useState([]);
  const [selectedCostId, setSelectedCostId] = useState("");

  const [usageHours, setUsageHours] = useState(0);
  const [ratePerHour, setRatePerHour] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  const [loading, setLoading] = useState(false);
  const [loadingCosts, setLoadingCosts] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD COST RECORDS
  // =========================================================

  useEffect(() => {
    loadCosts();
  }, []);

  const loadCosts = async () => {
    try {
      setLoadingCosts(true);
      setError("");

      const response = await api.get("/costs");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setCosts(data);
    } catch (err) {
      console.error("Failed to load cost records:", err);

      setError(
        "Unable to load equipment cost records."
      );
    } finally {
      setLoadingCosts(false);
    }
  };

  // =========================================================
  // SELECT COST RECORD
  // =========================================================

  const handleCostSelection = (event) => {
    const id = event.target.value;

    setSelectedCostId(id);
    setSuccess("");
    setError("");

    if (!id) {
      setUsageHours(0);
      setRatePerHour(0);
      setTotalCost(0);
      return;
    }

    const selectedCost =
      costs.find(
        (cost) => String(cost.id) === String(id)
      );

    if (selectedCost) {
      setUsageHours(
        Number(selectedCost.usageHours || 0)
      );

      setRatePerHour(
        Number(selectedCost.ratePerHour || 0)
      );

      setTotalCost(
        Number(selectedCost.totalCost || 0)
      );
    }
  };

  // =========================================================
  // CALCULATE USAGE-BASED COST
  // =========================================================

  const calculateUsageCost = async () => {
    if (!selectedCostId) {
      setError(
        "Please select an equipment cost record."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // -----------------------------------------------------
      // BACKEND CALCULATION
      // -----------------------------------------------------

      const response = await api.post(
        `/costs/${selectedCostId}/calculate`
      );

      const calculatedTotalCost =
        Number(response.data || 0);

      setTotalCost(
        calculatedTotalCost
      );

      // -----------------------------------------------------
      // REFRESH COST RECORD
      // -----------------------------------------------------

      const costResponse =
        await api.get(
          `/costs/${selectedCostId}`
        );

      const updatedCost =
        costResponse.data;

      setUsageHours(
        Number(updatedCost.usageHours || 0)
      );

      setRatePerHour(
        Number(updatedCost.ratePerHour || 0)
      );

      setTotalCost(
        Number(updatedCost.totalCost || 0)
      );

      // -----------------------------------------------------
      // REFRESH ALL COSTS
      // -----------------------------------------------------

      await loadCosts();

      setSuccess(
        "Equipment usage cost calculated successfully."
      );

    } catch (err) {

      console.error(
        "Failed to calculate usage cost:",
        err
      );

      setError(
        err.response?.data ||
        "Unable to calculate equipment usage cost."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // =========================================================
  // SELECTED COST
  // =========================================================

  const selectedCost =
    costs.find(
      (cost) =>
        String(cost.id) ===
        String(selectedCostId)
    );

  // =========================================================
  // LOADING
  // =========================================================

  if (loadingCosts) {
    return (
      <div className="page-container">
        <div className="loading-state">
          Loading equipment usage cost...
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="page-container">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="page-header">

        <div>
          <h1>
            Equipment Usage Cost
          </h1>

          <p>
            Calculate equipment cost automatically
            from actual utilization hours.
          </p>
        </div>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="error-state">
          {error}
        </div>
      )}

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {success && (
        <div className="success-state">
          {success}
        </div>
      )}

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="dashboard-card">

        <div className="card-header">

          <div>
            <h2>
              Usage-Based Cost Calculation
            </h2>

            <p>
              Usage hours are retrieved from
              equipment utilization records.
            </p>
          </div>

        </div>

        {/* ===================================================
            EQUIPMENT / COST SELECTION
        =================================================== */}

        <div className="form-group">

          <label>
            Equipment Cost Record
          </label>

          <select
            value={selectedCostId}
            onChange={handleCostSelection}
            className="form-control"
          >

            <option value="">
              Select equipment
            </option>

            {costs.map((cost) => (

              <option
                key={cost.id}
                value={cost.id}
              >

                {cost.equipment?.name ||
                  cost.equipment?.assetTag ||
                  "Unknown Equipment"}

                {" — "}

                {cost.equipment?.assetTag ||
                  "No Asset Tag"}

              </option>

            ))}

          </select>

        </div>

        {/* ===================================================
            EQUIPMENT DETAILS
        =================================================== */}

        {selectedCost && (

          <div className="dashboard-grid">

            {/* EQUIPMENT */}

            <div className="stat-card">

              <div className="stat-icon">
                🔬
              </div>

              <div>

                <span>
                  Equipment
                </span>

                <h2>
                  {selectedCost.equipment?.name ||
                    "Unknown"}
                </h2>

              </div>

            </div>

            {/* RATE */}

            <div className="stat-card">

              <div className="stat-icon">
                ₹
              </div>

              <div>

                <span>
                  Cost Per Hour
                </span>

                <h2>
                  {formatCurrency(
                    ratePerHour
                  )}
                </h2>

              </div>

            </div>

            {/* USAGE */}

            <div className="stat-card">

              <div className="stat-icon">
                ⏱
              </div>

              <div>

                <span>
                  Usage Hours
                </span>

                <h2>
                  {Number(
                    usageHours
                  ).toFixed(2)}
                </h2>

              </div>

            </div>

            {/* TOTAL */}

            <div className="stat-card">

              <div className="stat-icon">
                💰
              </div>

              <div>

                <span>
                  Calculated Cost
                </span>

                <h2>
                  {formatCurrency(
                    totalCost
                  )}
                </h2>

              </div>

            </div>

          </div>

        )}

        {/* ===================================================
            CALCULATION FORMULA
        =================================================== */}

        {selectedCost && (

          <div className="dashboard-card">

            <h3>
              Cost Calculation
            </h3>

            <p>
              Usage Hours × Cost Per Hour =
              Calculated Cost
            </p>

            <div className="analysis-row">

              <span>
                {Number(
                  usageHours
                ).toFixed(2)}
                {" × "}
                {formatCurrency(
                  ratePerHour
                )}
              </span>

              <strong>
                {formatCurrency(
                  totalCost
                )}
              </strong>

            </div>

          </div>

        )}

        {/* ===================================================
            CALCULATE BUTTON
        =================================================== */}

        <div className="form-actions">

          <button
            className="primary-button"
            onClick={calculateUsageCost}
            disabled={
              loading ||
              !selectedCostId
            }
          >

            {loading
              ? "Calculating..."
              : "Calculate Usage Cost"}

          </button>

        </div>

      </div>

    </div>
  );
}

export default EquipmentUsageCost;
