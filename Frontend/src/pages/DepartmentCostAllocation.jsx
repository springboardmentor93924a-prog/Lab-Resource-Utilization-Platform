import React, { useEffect, useMemo, useState } from "react";
import { getDepartmentCostAllocation } from "../services/costApi";
import "./DepartmentCostAllocation.css";

const DepartmentCostAllocation = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDepartmentAllocation();
  }, []);

  const loadDepartmentAllocation = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDepartmentCostAllocation();

      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading department cost allocation:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load department-wise cost allocation."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // SUMMARY CALCULATIONS
  // ---------------------------------------------------------

  const totalCost = useMemo(() => {
    return departments.reduce(
      (sum, department) => sum + Number(department.totalCost || 0),
      0
    );
  }, [departments]);

  const totalUsageHours = useMemo(() => {
    return departments.reduce(
      (sum, department) => sum + Number(department.usageHours || 0),
      0
    );
  }, [departments]);

  const highestDepartment = useMemo(() => {
    if (departments.length === 0) {
      return null;
    }

    return departments.reduce((highest, current) => {
      return Number(current.totalCost || 0) >
        Number(highest.totalCost || 0)
        ? current
        : highest;
    });
  }, [departments]);

  // ---------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatHours = (value) => {
    return `${Number(value || 0).toFixed(2)} hrs`;
  };

  const getPercentage = (cost) => {
    if (totalCost === 0) {
      return 0;
    }

    return (Number(cost || 0) / totalCost) * 100;
  };

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div className="department-cost-page">
        <div className="department-cost-loading">
          <div className="department-loading-spinner"></div>
          <p>Loading department cost allocation...</p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // PAGE
  // ---------------------------------------------------------

  return (
    <div className="department-cost-page">

      {/* PAGE HEADER */}
      <div className="department-cost-header">
        <div>
          <h1>Department-Wise Cost Allocation</h1>
          <p>
            Monitor equipment usage and cost allocation across departments.
          </p>
        </div>

        <button
          className="department-refresh-btn"
          onClick={loadDepartmentAllocation}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="department-error">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="department-summary-grid">

        <div className="department-summary-card">
          <div className="department-card-icon cost-icon">
            ₹
          </div>

          <div>
            <p>Total Allocated Cost</p>
            <h2>{formatCurrency(totalCost)}</h2>
          </div>
        </div>

        <div className="department-summary-card">
          <div className="department-card-icon hours-icon">
            ⏱
          </div>

          <div>
            <p>Total Usage Hours</p>
            <h2>{formatHours(totalUsageHours)}</h2>
          </div>
        </div>

        <div className="department-summary-card">
          <div className="department-card-icon department-icon">
            #
          </div>

          <div>
            <p>Total Departments</p>
            <h2>{departments.length}</h2>
          </div>
        </div>

        <div className="department-summary-card">
          <div className="department-card-icon highest-icon">
            ★
          </div>

          <div>
            <p>Highest Cost Department</p>
            <h2>
              {highestDepartment
                ? highestDepartment.departmentName
                : "N/A"}
            </h2>
          </div>
        </div>

      </div>

      {/* EMPTY STATE */}
      {departments.length === 0 ? (
        <div className="department-empty-state">
          <div className="department-empty-icon">📊</div>
          <h2>No Department Cost Data</h2>
          <p>
            There is currently no cost allocation data available for
            departments.
          </p>
        </div>
      ) : (
        <>
          {/* DEPARTMENT COST BREAKDOWN */}
          <div className="department-breakdown-card">

            <div className="department-section-header">
              <div>
                <h2>Cost Distribution</h2>
                <p>
                  Department-wise share of the total allocated cost.
                </p>
              </div>
            </div>

            <div className="department-bars">

              {departments.map((department) => {
                const percentage = getPercentage(department.totalCost);

                return (
                  <div
                    className="department-bar-row"
                    key={department.departmentId}
                  >

                    <div className="department-bar-info">
                      <span className="department-bar-name">
                        {department.departmentName || "Unknown Department"}
                      </span>

                      <span className="department-bar-value">
                        {formatCurrency(department.totalCost)}
                      </span>
                    </div>

                    <div className="department-progress-track">
                      <div
                        className="department-progress-fill"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                        }}
                      ></div>
                    </div>

                    <div className="department-bar-percentage">
                      {percentage.toFixed(1)}%
                    </div>

                  </div>
                );
              })}

            </div>
          </div>

          {/* TABLE */}
          <div className="department-table-card">

            <div className="department-section-header">
              <div>
                <h2>Department Cost Allocation</h2>
                <p>
                  Detailed utilization and cost information by department.
                </p>
              </div>
            </div>

            <div className="department-table-wrapper">

              <table className="department-cost-table">

                <thead>
                  <tr>
                    <th>#</th>
                    <th>Department</th>
                    <th>Usage Hours</th>
                    <th>Total Cost</th>
                    <th>Cost Share</th>
                  </tr>
                </thead>

                <tbody>

                  {departments.map((department, index) => {
                    const percentage = getPercentage(
                      department.totalCost
                    );

                    return (
                      <tr key={department.departmentId}>

                        <td>{index + 1}</td>

                        <td>
                          <div className="department-name-cell">
                            <div className="department-avatar">
                              {(department.departmentName || "D")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {department.departmentName ||
                                  "Unknown Department"}
                              </strong>

                              <small>
                                ID: {department.departmentId ?? "N/A"}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="usage-hours-badge">
                            {formatHours(department.usageHours)}
                          </span>
                        </td>

                        <td>
                          <strong className="department-cost-value">
                            {formatCurrency(department.totalCost)}
                          </strong>
                        </td>

                        <td>
                          <div className="cost-share-cell">

                            <div className="cost-share-track">
                              <div
                                className="cost-share-fill"
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
                  })}

                </tbody>

              </table>

            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default DepartmentCostAllocation;