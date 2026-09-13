import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ResearcherAnalyticsDashboard from "./ResearcherAnalyticsDashboard";

import {
  getUtilizationReport,
  getEquipmentRanking,
  getDemandAnalysis,
  getDemandTrends,
} from "../services/analyticsApi";

function AnalyticsDashboard() {

  // =========================================================
  // DATE HELPERS
  // =========================================================

  const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 6);

    return date.toISOString().split("T")[0];
  };

  const getToday = () => {
    return new Date().toISOString().split("T")[0];
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

  const [rankingData, setRankingData] = useState([]);

  const [demandData, setDemandData] = useState([]);

  const [trendData, setTrendData] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // =========================================================
  // LOAD ANALYTICS DATA
  // =========================================================

  const loadAnalytics = async () => {

    if (!startDate || !endDate) {
      setError(
        "Please select both start and end dates."
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

      // -----------------------------------------------------
      // LOAD ALL ANALYTICS APIs
      // -----------------------------------------------------

      const [
        reportResponse,
        rankingResponse,
        demandResponse,
        trendsResponse,
      ] = await Promise.all([

        getUtilizationReport(
          startDate,
          endDate
        ),

        getEquipmentRanking(
          startDate,
          endDate
        ),

        getDemandAnalysis(
          startDate,
          endDate
        ),

        getDemandTrends(
          startDate,
          endDate
        ),

      ]);

      // -----------------------------------------------------
      // UTILIZATION REPORT
      // -----------------------------------------------------

      setReport(
        reportResponse?.data ??
        reportResponse ??
        null
      );

      // -----------------------------------------------------
      // EQUIPMENT RANKING
      // -----------------------------------------------------

      const ranking =
        rankingResponse?.data ??
        rankingResponse ??
        [];

      setRankingData(
        Array.isArray(ranking)
          ? ranking
          : []
      );

      // -----------------------------------------------------
      // DEMAND ANALYSIS
      // -----------------------------------------------------

      const demand =
        demandResponse?.data ??
        demandResponse ??
        [];

      setDemandData(
        Array.isArray(demand)
          ? demand
          : []
      );

      // -----------------------------------------------------
      // DEMAND TRENDS
      // -----------------------------------------------------

      const trends =
        trendsResponse?.data ??
        trendsResponse ??
        [];

      setTrendData(
        Array.isArray(trends)
          ? trends
          : []
      );

    } catch (err) {

      console.error(
        "Analytics loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Unable to load analytics data."
      );

      setReport(null);
      setRankingData([]);
      setDemandData([]);
      setTrendData([]);

    } finally {

      setLoading(false);

    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    loadAnalytics();

  }, []);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = () => {

    loadAnalytics();

  };

  // =========================================================
  // DEMAND COUNTS
  // =========================================================

  const getDemandCounts = () => {

    let high = 0;
    let medium = 0;
    let low = 0;

    demandData.forEach((item) => {

      const demand = (
        item.demandLevel ||
        item.demand ||
        item.level ||
        ""
      )
        .toString()
        .toUpperCase();

      if (demand === "HIGH") {

        high++;

      } else if (demand === "MEDIUM") {

        medium++;

      } else if (demand === "LOW") {

        low++;

      }

    });

    return {
      high,
      medium,
      low,
    };
  };

  const demandCounts =
    getDemandCounts();

  // =========================================================
  // UTILIZATION LEVEL
  // =========================================================

  const getUtilizationClass = (
    value
  ) => {

    if (value >= 70) {
      return "high";
    }

    if (value >= 40) {
      return "medium";
    }

    return "low";
  };

  const getUtilizationLabel = (
    value
  ) => {

    if (value >= 70) {
      return "High";
    }

    if (value >= 40) {
      return "Medium";
    }

    return "Low";
  };

  // =========================================================
  // SAFE NUMBER
  // =========================================================

  const numberValue = (
    value
  ) => {

    const number =
      Number(value);

    return Number.isFinite(number)
      ? number
      : 0;
  };


  const storedUser = localStorage.getItem("user");

let currentRole = "";

if (storedUser) {
  try {
    const parsedUser = JSON.parse(storedUser);

    currentRole = (
      parsedUser?.role ||
      parsedUser?.user?.role ||
      ""
    )
      .toString()
      .toUpperCase();
  } catch (error) {
    console.error(
      "Unable to read logged-in user:",
      error
    );
  }
}

if (currentRole === "RESEARCHER") {
  return <ResearcherAnalyticsDashboard />;
}

  // =========================================================
  // PAGE
  // =========================================================

  return (

    // <div className="app-layout">

    //   {/* =====================================================
    //       SIDEBAR
    //   ===================================================== */}

    //   <Sidebar />

    //   <div className="main-area">

    //     {/* ===================================================
    //         TOPBAR
    //     =================================================== */}

    //     <Topbar />

        <main className="main-content">

          <div className="analytics-dashboard">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="analytics-header">

              <div>

                <h1>
                  Analytics Dashboard
                </h1>

                <p>
                  Monitor equipment utilization,
                  demand and resource performance.
                </p>

              </div>

              <button
                className="analytics-refresh-button"
                onClick={handleRefresh}
                disabled={loading}
              >

                {loading
                  ? "Refreshing..."
                  : "↻ Refresh"}

              </button>

            </div>


            {/* =================================================
                DATE FILTER
            ================================================= */}

            <div className="analytics-filter-card">

              <div className="filter-group">

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


              <div className="filter-group">

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
                className="apply-filter-button"
                onClick={loadAnalytics}
                disabled={loading}
              >

                {loading
                  ? "Loading..."
                  : "Apply Filter"}

              </button>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <div className="analytics-error">

                {error}

              </div>

            )}


            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="analytics-summary-grid">

              {/* Average Utilization */}

              <div className="analytics-summary-card">

                <div className="summary-icon">
                  📊
                </div>

                <div>

                  <span>
                    Average Utilization
                  </span>

                  <strong>

                    {numberValue(
                      report?.averageUtilization
                    ).toFixed(2)}
                    %

                  </strong>

                </div>

              </div>


              {/* Total Equipment */}

              <div className="analytics-summary-card">

                <div className="summary-icon">
                  🔬
                </div>

                <div>

                  <span>
                    Total Equipment
                  </span>

                  <strong>

                    {numberValue(
                      report?.totalEquipment
                    )}

                  </strong>

                </div>

              </div>


              {/* Total Bookings */}

              <div className="analytics-summary-card">

                <div className="summary-icon">
                  📅
                </div>

                <div>

                  <span>
                    Total Bookings
                  </span>

                  <strong>

                    {numberValue(
                      report?.totalBookings
                    )}

                  </strong>

                </div>

              </div>


              {/* Highest Utilization */}

              <div className="analytics-summary-card">

                <div className="summary-icon">
                  ↑
                </div>

                <div>

                  <span>
                    Highest Utilization
                  </span>

                  <strong>

                    {numberValue(
                      report
                        ?.highestUtilizedEquipment
                        ?.utilizationPercentage
                    ).toFixed(2)}
                    %

                  </strong>

                </div>

              </div>


              {/* Lowest Utilization */}

              <div className="analytics-summary-card">

                <div className="summary-icon">
                  ↓
                </div>

                <div>

                  <span>
                    Lowest Utilization
                  </span>

                  <strong>

                    {numberValue(
                      report
                        ?.lowestUtilizedEquipment
                        ?.utilizationPercentage
                    ).toFixed(2)}
                    %

                  </strong>

                </div>

              </div>

            </div>


            {/* =================================================
                DEMAND ANALYSIS
            ================================================= */}

            <div className="section-title">

              <div>

                <h2>
                  Demand Analysis
                </h2>

                <p>
                  Equipment demand classification
                  for the selected period.
                </p>

              </div>

            </div>


            <div className="demand-summary-grid">

              {/* High */}

              <div className="demand-card high-demand">

                <span>
                  High Demand
                </span>

                <strong>
                  {report?.highDemandEquipment ??
                    demandCounts.high}
                </strong>

              </div>


              {/* Medium */}

              <div className="demand-card medium-demand">

                <span>
                  Medium Demand
                </span>

                <strong>
                  {report?.mediumDemandEquipment ??
                    demandCounts.medium}
                </strong>

              </div>


              {/* Low */}

              <div className="demand-card low-demand">

                <span>
                  Low Demand
                </span>

                <strong>
                  {report?.lowDemandEquipment ??
                    demandCounts.low}
                </strong>

              </div>

            </div>


            {/* =================================================
                MOST UTILIZED EQUIPMENT
            ================================================= */}

            <div className="section-title">

              <div>

                <h2>
                  Most Utilized Equipment
                </h2>

                <p>
                  Equipment with the highest
                  utilization during the selected period.
                </p>

              </div>

            </div>


            {report?.highestUtilizedEquipment && (

              <div className="utilization-card">

                <div className="utilization-card-header">

                  <div>

                    <h3>
                      {
                        report
                          .highestUtilizedEquipment
                          .equipmentName
                      }
                    </h3>

                    <span>
                      {
                        report
                          .highestUtilizedEquipment
                          .assetTag
                      }
                    </span>

                  </div>

                  <span className="utilization-level high">

                    Highest

                  </span>

                </div>


                <div className="utilization-value">

                  {numberValue(
                    report
                      .highestUtilizedEquipment
                      .utilizationPercentage
                  ).toFixed(2)}
                  %

                </div>


                <div className="utilization-bar">

                  <div
                    className="utilization-progress high"
                    style={{
                      width: `${Math.min(
                        numberValue(
                          report
                            .highestUtilizedEquipment
                            .utilizationPercentage
                        ),
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

            )}


            {/* =================================================
                EQUIPMENT RANKING
            ================================================= */}

            <div className="section-title">

              <div>

                <h2>
                  Equipment Ranking
                </h2>

                <p>
                  Most and least utilized equipment
                  based on utilization percentage.
                </p>

              </div>

            </div>


            {rankingData.length === 0 ? (

              <div className="analytics-empty">

                <div className="empty-icon">
                  📊
                </div>

                <h3>
                  No Ranking Data
                </h3>

                <p>
                  No equipment ranking data is
                  available for this period.
                </p>

              </div>

            ) : (

              <div className="utilization-grid">

                {rankingData.map(
                  (item, index) => {

                    const value =
                      numberValue(
                        item.utilizationPercentage
                      );

                    const level =
                      getUtilizationClass(
                        value
                      );

                    return (

                      <div
                        className="utilization-card"
                        key={
                          item.equipmentId ||
                          item.id ||
                          index
                        }
                      >

                        <div className="utilization-card-header">

                          <div>

                            <h3>

                              #{item.rank ||
                                index + 1}{" "}

                              {item.equipmentName ||
                                item.name ||
                                "Equipment"}

                            </h3>

                            <span>

                              {item.assetTag ||
                                "No asset tag"}

                            </span>

                          </div>


                          <span
                            className={`utilization-level ${level}`}
                          >

                            {getUtilizationLabel(
                              value
                            )}

                          </span>

                        </div>


                        <div className="utilization-value">

                          {value.toFixed(2)}%

                        </div>


                        <div className="utilization-bar">

                          <div
                            className={`utilization-progress ${level}`}
                            style={{
                              width: `${Math.min(
                                value,
                                100
                              )}%`,
                            }}
                          />

                        </div>


                        <div className="utilization-footer">

                          <span>
                            Utilization
                          </span>

                          <strong>
                            {value.toFixed(2)}%
                          </strong>

                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            )}


            {/* =================================================
                DEMAND DETAILS
            ================================================= */}

            <div className="section-title">

              <div>

                <h2>
                  Demand Details
                </h2>

                <p>
                  Booking demand for each equipment item.
                </p>

              </div>

            </div>


            {demandData.length === 0 ? (

              <div className="analytics-empty">

                <div className="empty-icon">
                  📋
                </div>

                <h3>
                  No Demand Data
                </h3>

                <p>
                  No demand information is
                  available for this period.
                </p>

              </div>

            ) : (

              <div className="utilization-grid">

                {demandData.map(
                  (item, index) => {

                    const demand =
                      (
                        item.demandLevel ||
                        item.demand ||
                        item.level ||
                        "LOW"
                      )
                        .toString()
                        .toUpperCase();

                    let demandClass = "low";

                    if (demand === "HIGH") {
                      demandClass = "high";
                    } else if (
                      demand === "MEDIUM"
                    ) {
                      demandClass = "medium";
                    }

                    return (

                      <div
                        className="utilization-card"
                        key={
                          item.equipmentId ||
                          index
                        }
                      >

                        <div className="utilization-card-header">

                          <div>

                            <h3>

                              {item.equipmentName ||
                                "Equipment"}

                            </h3>

                            <span>

                              {item.assetTag ||
                                "No asset tag"}

                            </span>

                          </div>


                          <span
                            className={`utilization-level ${demandClass}`}
                          >

                            {demand}

                          </span>

                        </div>


                        <div className="utilization-value">

                          {numberValue(
                            item.bookingCount
                          )}

                        </div>


                        <div className="utilization-footer">

                          <span>
                            Total Bookings
                          </span>

                          <strong>
                            {numberValue(
                              item.bookingCount
                            )}
                          </strong>

                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            )}


            {/* =================================================
                DEMAND TRENDS
            ================================================= */}

            <div className="section-title">

              <div>

                <h2>
                  Demand Trends
                </h2>

                <p>
                  Booking activity during the selected period.
                </p>

              </div>

            </div>


            {trendData.length === 0 ? (

              <div className="analytics-empty">

                <div className="empty-icon">
                  📈
                </div>

                <h3>
                  No Trend Data
                </h3>

                <p>
                  No booking trend data is available
                  for the selected period.
                </p>

              </div>

            ) : (

              <div className="utilization-grid">

                {trendData.map(
                  (item, index) => {

                    const bookingCount =
                      numberValue(
                        item.bookingCount ??
                        item.count ??
                        item.totalBookings
                      );

                    const date =
                      item.date ||
                      item.bookingDate ||
                      item.period ||
                      item.label ||
                      `Period ${index + 1}`;

                    return (

                      <div
                        className="utilization-card"
                        key={index}
                      >

                        <div className="utilization-card-header">

                          <div>

                            <h3>
                              {date}
                            </h3>

                            <span>
                              Booking activity
                            </span>

                          </div>

                        </div>


                        <div className="utilization-value">

                          {bookingCount}

                        </div>


                        <div className="utilization-footer">

                          <span>
                            Bookings
                          </span>

                          <strong>
                            {bookingCount}
                          </strong>

                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            )}

          </div>

        </main>

    //   </div>

    // </div>

  );
}

export default AnalyticsDashboard;