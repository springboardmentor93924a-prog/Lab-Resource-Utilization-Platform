import React, { useEffect, useState } from "react";
import api from "../services/api";

function DepartmentCostAllocation() {

  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD DEPARTMENT COST ALLOCATION
  // =========================================================

  const loadAllocation = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await api.get(
        "/costs/department-allocation"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setAllocations(data);

    } catch (err) {

      console.error(
        "Failed to load department cost allocation:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load department cost allocation."
      );

    } finally {

      setLoading(false);

    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadAllocation();
  }, []);

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
  // TOTALS
  // =========================================================

  const totalDepartments = allocations.length;

  const totalUsage = allocations.reduce(
    (sum, item) =>
      sum + Number(item.usageHours || 0),
    0
  );

  const totalCost = allocations.reduce(
    (sum, item) =>
      sum + Number(item.totalCost || 0),
    0
  );

  const averageCost =
    totalDepartments > 0
      ? totalCost / totalDepartments
      : 0;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="department-cost-page">

        <div className="department-cost-loading">

          <div className="loading-spinner"></div>

          <h3>
            Loading department costs...
          </h3>

          <p>
            Fetching cost allocation data.
          </p>

        </div>

      </div>
    );

  }

  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="department-cost-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="department-cost-header">

        <div>

          <span className="page-eyebrow">
            COST MANAGEMENT
          </span>

          <h1>
            Department-wise Cost Allocation
          </h1>

          <p>
            View equipment usage and total cost
            allocated to each department.
          </p>

        </div>

        <button
          type="button"
          className="allocation-refresh-button"
          onClick={loadAllocation}
        >
          ↻ Refresh
        </button>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="allocation-error">

          <span>⚠</span>

          <div>
            <strong>
              Unable to load data
            </strong>

            <p>
              {error}
            </p>
          </div>

        </div>

      )}


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="allocation-summary">

        <div className="allocation-summary-card">

          <div className="summary-icon department-icon">
            🏢
          </div>

          <div>

            <span>
              Total Departments
            </span>

            <h2>
              {totalDepartments}
            </h2>

          </div>

        </div>


        <div className="allocation-summary-card">

          <div className="summary-icon usage-icon">
            ⏱
          </div>

          <div>

            <span>
              Total Usage
            </span>

            <h2>
              {totalUsage.toFixed(2)}
              <small> hrs</small>
            </h2>

          </div>

        </div>


        <div className="allocation-summary-card">

          <div className="summary-icon cost-icon">
            ₹
          </div>

          <div>

            <span>
              Total Cost
            </span>

            <h2>
              {formatCurrency(totalCost)}
            </h2>

          </div>

        </div>


        <div className="allocation-summary-card">

          <div className="summary-icon average-icon">
            📊
          </div>

          <div>

            <span>
              Average Department Cost
            </span>

            <h2>
              {formatCurrency(averageCost)}
            </h2>

          </div>

        </div>

      </div>


      {/* =====================================================
          MAIN TABLE CARD
      ===================================================== */}

      <div className="allocation-card">

        <div className="allocation-card-header">

          <div>

            <h2>
              Department Cost Allocation
            </h2>

            <p>
              Cost distribution based on equipment
              utilization records.
            </p>

          </div>

          <span className="allocation-count">
            {allocations.length} departments
          </span>

        </div>


        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="allocation-table-wrapper">

          <table className="allocation-table">

            <thead>

              <tr>

                <th>
                  #
                </th>

                <th>
                  Department
                </th>

                <th>
                  Usage Hours
                </th>

                <th>
                  Total Cost
                </th>

                <th>
                  Cost / Hour
                </th>

                <th>
                  Allocation
                </th>

              </tr>

            </thead>


            <tbody>

              {allocations.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="empty-allocation"
                  >

                    <div className="empty-icon">
                      📊
                    </div>

                    <strong>
                      No department cost data
                    </strong>

                    <p>
                      There are currently no
                      department cost records.
                    </p>

                  </td>

                </tr>

              ) : (

                allocations.map(
                  (allocation, index) => {

                    const usage =
                      Number(
                        allocation.usageHours || 0
                      );

                    const cost =
                      Number(
                        allocation.totalCost || 0
                      );

                    const costPerHour =
                      usage > 0
                        ? cost / usage
                        : 0;

                    const percentage =
                      totalCost > 0
                        ? (cost / totalCost) * 100
                        : 0;

                    return (

                      <tr
                        key={
                          allocation.departmentId ||
                          index
                        }
                      >

                        <td>
                          <span className="row-number">
                            {index + 1}
                          </span>
                        </td>


                        <td>

                          <div className="department-cell">

                            <div className="department-avatar">
                              {(
                                allocation.departmentName ||
                                "D"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>

                              <strong>
                                {
                                  allocation.departmentName ||
                                  "Unknown Department"
                                }
                              </strong>

                              <span>
                                Department ID:{" "}
                                {
                                  allocation.departmentId ??
                                  "-"
                                }
                              </span>

                            </div>

                          </div>

                        </td>


                        <td>

                          <div className="usage-cell">

                            <strong>
                              {usage.toFixed(2)}
                            </strong>

                            <span>
                              hours
                            </span>

                          </div>

                        </td>


                        <td>

                          <strong className="cost-value">
                            {formatCurrency(cost)}
                          </strong>

                        </td>


                        <td>

                          <span className="rate-value">
                            {formatCurrency(
                              costPerHour
                            )}
                            <small>
                              /hr
                            </small>
                          </span>

                        </td>


                        <td>

                          <div className="allocation-progress">

                            <div className="progress-track">

                              <div
                                className="progress-fill"
                                style={{
                                  width: `${Math.min(
                                    percentage,
                                    100
                                  )}%`,
                                }}
                              ></div>

                            </div>

                            <span>
                              {percentage.toFixed(1)}%
                            </span>

                          </div>

                        </td>

                      </tr>

                    );

                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}

export default DepartmentCostAllocation;