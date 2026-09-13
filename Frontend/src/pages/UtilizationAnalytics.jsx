
import { useEffect, useState } from "react";
import api from "../services/api";
// import "./UtilizationAnalytics.css";

function UtilizationAnalytics() {
  const [analytics, setAnalytics] = useState([]);
  const [idleEquipment, setIdleEquipment] = useState([]);

  const [loading, setLoading] = useState(true);
  const [idleLoading, setIdleLoading] = useState(true);

  const [error, setError] = useState("");
  const [idleError, setIdleError] = useState("");

  // =========================================================
  // LOAD ANALYTICS
  // =========================================================

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/utilization/analytics"
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setAnalytics(data);
      } else if (Array.isArray(data.analytics)) {
        setAnalytics(data.analytics);
      } else if (Array.isArray(data.data)) {
        setAnalytics(data.data);
      } else {
        setAnalytics([]);
      }
    } catch (err) {
      console.error(
        "Analytics loading error:",
        err
      );

      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Unable to load utilization analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD IDLE EQUIPMENT
  // =========================================================

  const loadIdleEquipment = async () => {
    try {
      setIdleLoading(true);
      setIdleError("");

      const response = await api.get(
        "/utilization/idle"
      );

      console.log(
        "Idle equipment response:",
        response.data
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setIdleEquipment(data);
      } else if (Array.isArray(data.idleEquipment)) {
        setIdleEquipment(data.idleEquipment);
      } else if (Array.isArray(data.data)) {
        setIdleEquipment(data.data);
      } else {
        setIdleEquipment([]);
      }
    } catch (err) {
      console.error(
        "Idle equipment loading error:",
        err
      );

      setIdleError(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Unable to load idle equipment."
      );

      setIdleEquipment([]);
    } finally {
      setIdleLoading(false);
    }
  };

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    loadAnalytics();
    loadIdleEquipment();
  }, []);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = async () => {
    await Promise.all([
      loadAnalytics(),
      loadIdleEquipment(),
    ]);
  };

  // =========================================================
  // FORMAT NUMBER
  // =========================================================

  const formatNumber = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) {
      return "0";
    }

    return number.toFixed(2);
  };

  // =========================================================
  // FORMAT HOURS
  // =========================================================

  const formatHours = (value) => {
    const hours = Number(value);

    if (Number.isNaN(hours) || hours <= 0) {
      return "0h";
    }

    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }

    const wholeHours = Math.floor(hours);
    const minutes = Math.round(
      (hours - wholeHours) * 60
    );

    if (minutes === 0) {
      return `${wholeHours}h`;
    }

    return `${wholeHours}h ${minutes}m`;
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (value) => {
    if (!value) {
      return "Never";
    }

    try {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleString();
    } catch {
      return value;
    }
  };

  // =========================================================
  // GET EQUIPMENT NAME
  // =========================================================

  const getEquipmentName = (item) => {
    return (
      item.equipmentName ||
      item.name ||
      item.equipment?.name ||
      "Equipment"
    );
  };

  // =========================================================
  // GET STATUS
  // =========================================================

  const getStatus = (item) => {
    return (
      item.status ||
      item.equipmentStatus ||
      item.equipment?.status ||
      "AVAILABLE"
    )
      .toString()
      .toUpperCase();
  };

  // =========================================================
  // GET LAST USED
  // =========================================================

  const getLastUsed = (item) => {
    return (
      item.lastUsed ||
      item.lastUsedAt ||
      item.lastUsage ||
      item.endedAt ||
      item.lastUsageDate ||
      null
    );
  };

  // =========================================================
  // GET IDLE HOURS
  // =========================================================

  const getIdleHours = (item) => {
    if (item.idleHours !== undefined) {
      return item.idleHours;
    }

    if (item.idleDuration !== undefined) {
      return item.idleDuration;
    }

    return 0;
  };

  // =========================================================
  // GET UTILIZATION %
  // =========================================================

  const getUtilizationPercentage = (item) => {
    return (
      item.utilizationPercentage ??
      item.utilizationPercent ??
      item.utilizationRate ??
      item.utilization ??
      0
    );
  };

  // =========================================================
  // UTILIZATION CLASS
  // =========================================================

  const getUtilizationClass = (value) => {
    const percentage = Number(value);

    if (percentage >= 70) {
      return "high";
    }

    if (percentage >= 40) {
      return "medium";
    }

    return "low";
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    return status
      .toLowerCase()
      .replaceAll("_", "-")
      .replaceAll(" ", "-");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="utilization-analytics-page">
        <div className="loading">
          Loading utilization analytics...
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="utilization-analytics-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="analytics-page-header">

        <div>
          <h1>
            Utilization Analytics
          </h1>

          <p>
            Monitor equipment utilization and identify
            equipment that remains idle.
          </p>
        </div>

        <button
          type="button"
          className="analytics-refresh-button"
          onClick={handleRefresh}
        >
          ↻ Refresh
        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="analytics-error">
          {error}
        </div>
      )}

      {/* =====================================================
          UTILIZATION SUMMARY
      ===================================================== */}

      <div className="utilization-summary-grid">

        <div className="utilization-summary-card">

          <span>
            Total Equipment
          </span>

          <strong>
            {analytics.length}
          </strong>

        </div>

        <div className="utilization-summary-card">

          <span>
            Total Usage Hours
          </span>

          <strong>
            {formatHours(
              analytics.reduce(
                (total, item) =>
                  total +
                  Number(
                    item.totalUsageHours ||
                    item.usageHours ||
                    0
                  ),
                0
              )
            )}
          </strong>

        </div>

        <div className="utilization-summary-card">

          <span>
            Idle Equipment
          </span>

          <strong>
            {idleEquipment.length}
          </strong>

        </div>

      </div>

      {/* =====================================================
          EXISTING HEATMAP / UTILIZATION SECTION
      ===================================================== */}

      <section className="utilization-section">

        <div className="section-header">

          <div>
            <h2>
              Equipment Utilization
            </h2>

            <p>
              Utilization percentage and usage hours
              for each equipment.
            </p>
          </div>

        </div>

        {analytics.length === 0 ? (

          <div className="analytics-empty-state">
            <div className="empty-icon">
              📊
            </div>

            <h3>
              No utilization data
            </h3>

            <p>
              Start using equipment to generate
              utilization data.
            </p>
          </div>

        ) : (

          <div className="utilization-table-container">

            <table className="utilization-table">

              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Usage Hours</th>
                  <th>Idle Hours</th>
                  <th>Utilization</th>
                  <th>Level</th>
                </tr>
              </thead>

              <tbody>

                {analytics.map((item, index) => {

                  const percentage =
                    getUtilizationPercentage(item);

                  const utilizationClass =
                    getUtilizationClass(
                      percentage
                    );

                  return (
                    <tr
                      key={
                        item.equipmentId ||
                        item.id ||
                        index
                      }
                    >

                      <td>
                        <strong>
                          {getEquipmentName(item)}
                        </strong>
                      </td>

                      <td>
                        {formatHours(
                          item.totalUsageHours ||
                          item.usageHours ||
                          0
                        )}
                      </td>

                      <td>
                        {formatHours(
                          item.idleHours || 0
                        )}
                      </td>

                      <td>
                        <strong>
                          {formatNumber(
                            percentage
                          )}
                          %
                        </strong>
                      </td>

                      <td>

                        <span
                          className={`utilization-level ${utilizationClass}`}
                        >
                          {utilizationClass
                            .toUpperCase()}
                        </span>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* =====================================================
          5.13.6 IDLE EQUIPMENT SECTION
      ===================================================== */}

      <section className="idle-equipment-section">

        <div className="section-header">

          <div>

            <h2>
              Idle Equipment
            </h2>

            <p>
              Equipment that has remained unused
              longer than the configured idle threshold.
            </p>

          </div>

          <div className="idle-equipment-count">
            {idleEquipment.length} idle
          </div>

        </div>

        {/* ===================================================
            IDLE ERROR
        =================================================== */}

        {idleError && (
          <div className="analytics-error">
            {idleError}
          </div>
        )}

        {/* ===================================================
            IDLE LOADING
        =================================================== */}

        {idleLoading ? (

          <div className="idle-loading">
            Loading idle equipment...
          </div>

        ) : idleEquipment.length === 0 ? (

          /* ================================================
             EMPTY STATE
          ================================================ */

          <div className="idle-empty-state">

            <div className="idle-empty-icon">
              ✓
            </div>

            <h3>
              No Idle Equipment
            </h3>

            <p>
              All equipment is being utilized within
              the configured idle threshold.
            </p>

          </div>

        ) : (

          /* ================================================
             IDLE EQUIPMENT CARDS
          ================================================ */

          <div className="idle-equipment-grid">

            {idleEquipment.map(
              (item, index) => {

                const equipmentName =
                  getEquipmentName(item);

                const status =
                  getStatus(item);

                const lastUsed =
                  getLastUsed(item);

                const idleHours =
                  getIdleHours(item);

                const utilization =
                  getUtilizationPercentage(item);

                const utilizationClass =
                  getUtilizationClass(
                    utilization
                  );

                return (

                  <div
                    className="idle-equipment-card"
                    key={
                      item.equipmentId ||
                      item.id ||
                      index
                    }
                  >

                    {/* ==================================
                        CARD HEADER
                    ================================== */}

                    <div className="idle-card-header">

                      <div>

                        <h3>
                          {equipmentName}
                        </h3>

                        {item.assetTag && (
                          <span className="idle-asset-tag">
                            {item.assetTag}
                          </span>
                        )}

                      </div>

                      <span
                        className={`equipment-status ${getStatusClass(
                          status
                        )}`}
                      >
                        {status.replaceAll(
                          "_",
                          " "
                        )}
                      </span>

                    </div>

                    {/* ==================================
                        CARD DETAILS
                    ================================== */}

                    <div className="idle-card-details">

                      <div className="idle-detail">

                        <span>
                          Last Used
                        </span>

                        <strong>
                          {formatDate(
                            lastUsed
                          )}
                        </strong>

                      </div>

                      <div className="idle-detail">

                        <span>
                          Idle Duration
                        </span>

                        <strong className="idle-duration">
                          {formatHours(
                            idleHours
                          )}
                        </strong>

                      </div>

                      <div className="idle-detail">

                        <span>
                          Utilization
                        </span>

                        <strong>
                          {formatNumber(
                            utilization
                          )}
                          %
                        </strong>

                      </div>

                    </div>

                    {/* ==================================
                        UTILIZATION BAR
                    ================================== */}

                    <div className="idle-utilization-bar">

                      <div
                        className={`idle-utilization-fill ${utilizationClass}`}
                        style={{
                          width: `${Math.min(
                            Math.max(
                              Number(
                                utilization
                              ) || 0,
                              0
                            ),
                            100
                          )}%`,
                        }}
                      />

                    </div>

                    {/* ==================================
                        IDLE INDICATOR
                    ================================== */}

                    <div className="idle-card-footer">

                      <span>
                        ● Idle
                      </span>

                      <span>
                        Low utilization
                      </span>

                    </div>

                  </div>

                );
              }
            )}

          </div>
        )}

      </section>

    </div>
  );
}

export default UtilizationAnalytics;
