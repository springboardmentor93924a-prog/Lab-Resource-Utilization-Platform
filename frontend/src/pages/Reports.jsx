import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  getUtilizationCostReport,
  downloadUtilizationCostReportCsv,
} from "../services/equipmentService";

import { getDepartmentUsageReport } from "../services/bookingService";

import { isAdmin } from "../utils/auth";

import "./Report.css";

export default function Reports() {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [equipmentRows, setEquipmentRows] = useState([]);
  const [departmentRows, setDepartmentRows] = useState([]);

  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  // =========================================================
  // RBAC
  // =========================================================

  useEffect(() => {
    if (!isAdmin()) {
      alert("You don't have permission to view reports.");
      navigate("/dashboard");
    }
  }, [navigate]);

  // =========================================================
  // GENERATE ALL REPORTS
  // =========================================================

  async function handleGenerate() {
    if (!from || !to) {
      alert("Please select both a start and end date.");
      return;
    }

    if (from > to) {
      alert("The From date cannot be after the To date.");
      return;
    }

    try {
      setLoading(true);

      // Run both reports together
      const [equipmentData, departmentData] =
        await Promise.all([
          getUtilizationCostReport(from, to),
          getDepartmentUsageReport(from, to),
        ]);

      setEquipmentRows(equipmentData || []);
      setDepartmentRows(departmentData || []);

      setGenerated(true);
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Failed to generate reports."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // DOWNLOAD EQUIPMENT CSV
  // =========================================================

  async function handleDownload() {
    if (!from || !to) {
      alert("Please select both a start and end date.");
      return;
    }

    if (from > to) {
      alert("The From date cannot be after the To date.");
      return;
    }

    try {
      await downloadUtilizationCostReportCsv(from, to);
    } catch (err) {
      console.error(err);
      alert("Failed to download CSV.");
    }
  }

  // =========================================================
  // SUMMARY CALCULATIONS
  // =========================================================

  const totalEquipment =
    equipmentRows.length;

  const totalBookings =
    equipmentRows.reduce(
      (sum, row) =>
        sum + Number(row.totalBookings || 0),
      0
    );

  const totalUsageHours =
    equipmentRows.reduce(
      (sum, row) =>
        sum + Number(row.usageHours || 0),
      0
    );

  const totalCost =
    equipmentRows.reduce(
      (sum, row) =>
        sum + Number(row.totalCost || 0),
      0
    );

  const averageUtilization =
    equipmentRows.length > 0
      ? (
          equipmentRows.reduce(
            (sum, row) =>
              sum +
              Number(
                row.utilizationRate || 0
              ),
            0
          ) / equipmentRows.length
        ).toFixed(1)
      : "0.0";

  const totalDepartments =
    departmentRows.length;

  const totalDepartmentEquipment =
    departmentRows.reduce(
      (sum, row) =>
        sum + Number(row.equipmentCount || 0),
      0
    );

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="reports-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">
        <Sidebar />
      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="reports-content">

        {/* ===================================================
            HEADER
        =================================================== */}

        <section className="reports-header">

          <div className="reports-title-wrapper">

            <div className="reports-icon">
              ✦
            </div>

            <div>

              <h1>
                Reports & Analytics
              </h1>

              <p>
                Generate insights about laboratory
                resources, utilization and costs.
              </p>

            </div>

          </div>

        </section>


        {/* ===================================================
            REPORT TYPES
        =================================================== */}

        <section className="report-types">

          {/* EQUIPMENT */}

          <div className="report-type-card active">

            <div className="report-type-icon blue">
              📊
            </div>

            <div>

              <h3>
                Equipment Utilization
              </h3>

              <p>
                Usage, bookings, utilization
                and operating cost.
              </p>

            </div>

            <span className="active-badge">
              Available
            </span>

          </div>


          {/* DEPARTMENT */}

          <div className="report-type-card active">

            <div className="report-type-icon purple">
              🏢
            </div>

            <div>

              <h3>
                Department Usage
              </h3>

              <p>
                Analyze department and
                resource usage.
              </p>

            </div>

            <span className="active-badge">
              Available
            </span>

          </div>


          {/* MAINTENANCE */}

          <div className="report-type-card">

            <div className="report-type-icon orange">
              🛠
            </div>

            <div>

              <h3>
                Maintenance & Downtime
              </h3>

              <p>
                Maintenance activity,
                downtime and service history.
              </p>

            </div>

            <span className="coming-badge">
              Coming Soon
            </span>

          </div>


          {/* SHARING */}

          <div className="report-type-card">

            <div className="report-type-icon cyan">
              🔗
            </div>

            <div>

              <h3>
                Inter-Institution Sharing
              </h3>

              <p>
                Shared equipment and
                cross-institution usage.
              </p>

            </div>

            <span className="coming-badge">
              Coming Soon
            </span>

          </div>


          {/* PROCUREMENT */}

          <div className="report-type-card">

            <div className="report-type-icon green">
              💰
            </div>

            <div>

              <h3>
                Procurement & Cost
              </h3>

              <p>
                Procurement and cost
                analysis reports.
              </p>

            </div>

            <span className="coming-badge">
              Coming Soon
            </span>

          </div>

        </section>


        {/* ===================================================
            REPORT GENERATOR
        =================================================== */}

        <section className="report-generator">

          <div className="generator-heading">

            <div className="generator-icon">
              ⚡
            </div>

            <div>

              <h2>
                Laboratory Reports
              </h2>

              <p>
                Select a date range to generate
                utilization and department reports.
              </p>

            </div>

          </div>


          <div className="generator-controls">

            {/* FROM */}

            <div className="date-field">

              <label>
                FROM DATE
              </label>

              <input
                type="date"
                value={from}
                onChange={(e) =>
                  setFrom(e.target.value)
                }
              />

            </div>


            {/* TO */}

            <div className="date-field">

              <label>
                TO DATE
              </label>

              <input
                type="date"
                value={to}
                onChange={(e) =>
                  setTo(e.target.value)
                }
              />

            </div>


            {/* GENERATE */}

            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={loading}
            >

              <span>
                {loading ? "⏳" : "✦"}
              </span>

              {loading
                ? "Generating..."
                : "Generate Reports"}

            </button>


            {/* DOWNLOAD */}

            <button
              className="download-btn"
              onClick={handleDownload}
            >
              📥
              Download CSV
            </button>

          </div>

        </section>


        {/* ===================================================
            SUMMARY CARDS
        =================================================== */}

        {generated && (

          <section className="summary-grid">

            {/* EQUIPMENT */}

            <div className="summary-card blue-card">

              <div className="summary-card-icon">
                🧪
              </div>

              <div>

                <span>
                  EQUIPMENT
                </span>

                <strong>
                  {totalEquipment}
                </strong>

                <small>
                  equipment analyzed
                </small>

              </div>

            </div>


            {/* BOOKINGS */}

            <div className="summary-card purple-card">

              <div className="summary-card-icon">
                📅
              </div>

              <div>

                <span>
                  BOOKINGS
                </span>

                <strong>
                  {totalBookings}
                </strong>

                <small>
                  total bookings
                </small>

              </div>

            </div>


            {/* USAGE */}

            <div className="summary-card cyan-card">

              <div className="summary-card-icon">
                ⏱
              </div>

              <div>

                <span>
                  USAGE HOURS
                </span>

                <strong>
                  {totalUsageHours}
                </strong>

                <small>
                  total equipment usage
                </small>

              </div>

            </div>


            {/* COST */}

            <div className="summary-card green-card">

              <div className="summary-card-icon">
                💰
              </div>

              <div>

                <span>
                  TOTAL COST
                </span>

                <strong>
                  ₹{totalCost.toFixed(2)}
                </strong>

                <small>
                  estimated usage cost
                </small>

              </div>

            </div>

          </section>

        )}


        {/* ===================================================
            UTILIZATION OVERVIEW
        =================================================== */}

        {generated &&
          equipmentRows.length > 0 && (

          <section className="utilization-overview">

            <div className="overview-heading">

              <div>

                <h2>
                  Utilization Overview
                </h2>

                <p>
                  Equipment performance during
                  the selected period.
                </p>

              </div>

              <div className="average-utilization">

                <span>
                  Average Utilization
                </span>

                <strong>
                  {averageUtilization}%
                </strong>

              </div>

            </div>


            <div className="utilization-list">

              {equipmentRows.map((row) => (

                <div
                  className="utilization-item"
                  key={row.equipmentId}
                >

                  <div className="equipment-info">

                    <div className="equipment-mini-icon">
                      ⚙
                    </div>

                    <div>

                      <strong>
                        {row.equipmentName}
                      </strong>

                      <span>
                        {row.category ||
                          "Equipment"}
                      </span>

                    </div>

                  </div>


                  <div className="utilization-bar-wrapper">

                    <div className="utilization-bar">

                      <div
                        className="utilization-fill"
                        style={{
                          width: `${Math.min(
                            Number(
                              row.utilizationRate ||
                                0
                            ),
                            100
                          )}%`,
                        }}
                      />

                    </div>

                    <span>
                      {row.utilizationRate}%
                    </span>

                  </div>

                </div>

              ))}

            </div>

          </section>

        )}


        {/* ===================================================
            EQUIPMENT REPORT TABLE
        =================================================== */}

        {generated && (

          <section className="report-table-card">

            <div className="table-header">

              <div>

                <h2>
                  Equipment Utilization & Cost
                </h2>

                <p>
                  Equipment usage and cost
                  breakdown.
                </p>

              </div>

              <div className="date-range-display">
                📅 {from} → {to}
              </div>

            </div>


            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      EQUIPMENT
                    </th>

                    <th>
                      CATEGORY
                    </th>

                    <th>
                      BOOKINGS
                    </th>

                    <th>
                      USAGE HOURS
                    </th>

                    <th>
                      UTILIZATION
                    </th>

                    <th>
                      COST
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {equipmentRows.length === 0 ? (

                    <tr>

                      <td
                        colSpan="6"
                        className="empty-row"
                      >

                        <div>
                          ✦
                        </div>

                        No equipment data
                        available for this
                        date range.

                      </td>

                    </tr>

                  ) : (

                    equipmentRows.map((row) => (

                      <tr
                        key={row.equipmentId}
                      >

                        <td>

                          <div className="table-equipment">

                            <div>
                              ⚙
                            </div>

                            <strong>
                              {row.equipmentName}
                            </strong>

                          </div>

                        </td>


                        <td>

                          <span className="category-badge">
                            {row.category ||
                              "General"}
                          </span>

                        </td>


                        <td>
                          {row.totalBookings}
                        </td>


                        <td>
                          {row.usageHours}
                        </td>


                        <td>

                          <span className="utilization-badge">
                            {row.utilizationRate}%
                          </span>

                        </td>


                        <td>

                          <strong className="cost-value">
                            ₹
                            {Number(
                              row.totalCost || 0
                            ).toFixed(2)}
                          </strong>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          </section>

        )}


        {/* ===================================================
            DEPARTMENT USAGE REPORT
        =================================================== */}

        {generated && (

          <section className="report-table-card department-report-card">

            <div className="table-header">

              <div>

                <h2>
                  🏢 Department / Resource Usage
                </h2>

                <p>
                  Department-level equipment
                  usage and resource utilization.
                </p>

              </div>

              <div className="department-summary-badge">
                {totalDepartments} Departments
              </div>

            </div>


            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      DEPARTMENT
                    </th>

                    <th>
                      TOTAL BOOKINGS
                    </th>

                    <th>
                      USAGE HOURS
                    </th>

                    <th>
                      EQUIPMENT
                    </th>

                    <th>
                      UTILIZATION
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {departmentRows.length === 0 ? (

                    <tr>

                      <td
                        colSpan="5"
                        className="empty-row"
                      >

                        <div>
                          🏢
                        </div>

                        No department usage
                        data available for this
                        date range.

                      </td>

                    </tr>

                  ) : (

                    departmentRows.map(
                      (row, index) => (

                        <tr
                          key={
                            row.department ||
                            index
                          }
                        >

                          <td>

                            <div className="table-department">

                              <div className="department-icon">
                                🏢
                              </div>

                              <strong>
                                {row.department ||
                                  "Unknown"}
                              </strong>

                            </div>

                          </td>


                          <td>
                            {row.totalBookings}
                          </td>


                          <td>
                            {row.usageHours}
                          </td>


                          <td>
                            {row.equipmentCount}
                          </td>


                          <td>

                            <span className="department-utilization-badge">
                              {Number(
                                row.utilizationRate ||
                                  0
                              ).toFixed(1)}
                              %
                            </span>

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>


            {departmentRows.length > 0 && (

              <div className="department-footer">

                <span>
                  📊
                </span>

                {totalDepartmentEquipment}
                equipment distributed across
                {totalDepartments}
                departments.

              </div>

            )}

          </section>

        )}


        {/* ===================================================
            FOOTER
        =================================================== */}

        <div className="reports-footer">

          <span>
            ✦
          </span>

          Reports help optimize laboratory
          resources and improve operational
          efficiency.

        </div>

      </main>

    </div>
  );
}