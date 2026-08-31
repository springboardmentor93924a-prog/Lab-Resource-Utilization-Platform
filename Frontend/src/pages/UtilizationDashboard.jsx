
import { useEffect, useState } from "react";
import api from "../services/api";

function UtilizationDashboard() {

  const [utilization, setUtilization] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // Last successful update time
  const [lastUpdated, setLastUpdated] = useState(null);

  // =========================================================
  // LOAD UTILIZATION DATA
  // =========================================================

  useEffect(() => {

    // Initial load
    loadUtilization();

    // =======================================================
    // REAL-TIME POLLING
    // Refresh every 10 seconds
    // =======================================================

    const interval = setInterval(() => {

      loadUtilization(true);

    }, 10000);

    // Cleanup interval when page is closed
    return () => {

      clearInterval(interval);

    };

  }, []);

  // =========================================================
  // GET UTILIZATION DATA
  // =========================================================

  const loadUtilization = async (background = false) => {

    if (!background) {

      setLoading(true);

    }

    try {

      console.log(
        "Loading utilization data..."
      );

      const response =
        await api.get("/utilization");

      console.log(
        "Utilization API Response:",
        response.data
      );

      let data = response.data;

      // =====================================================
      // HANDLE ARRAY RESPONSE
      // =====================================================

      if (Array.isArray(data)) {

        setUtilization(data);

        setLastUpdated(new Date());

      }

      // =====================================================
      // HANDLE { data: [] }
      // =====================================================

      else if (Array.isArray(data.data)) {

        setUtilization(data.data);

        setLastUpdated(new Date());

      }

      // =====================================================
      // HANDLE { utilization: [] }
      // =====================================================

      else if (
        Array.isArray(data.utilization)
      ) {

        setUtilization(data.utilization);

        setLastUpdated(new Date());

      }

      // =====================================================
      // INVALID RESPONSE
      // =====================================================

      else {

        console.warn(
          "Unexpected utilization response:",
          data
        );

        setUtilization([]);

        setLastUpdated(new Date());

      }

      // Clear previous error after successful request
      setError("");

    } catch (err) {

      console.error(
        "Utilization API Error:",
        err
      );

      console.error(
        "Status:",
        err.response?.status
      );

      console.error(
        "Server response:",
        err.response?.data
      );

      // During background polling, don't remove
      // currently displayed data.
      if (!background) {

        setError(
          typeof err.response?.data === "string"
            ? err.response.data
            : "Unable to load utilization data."
        );

      }

    } finally {

      if (!background) {

        setLoading(false);

      }

    }

  };

  // =========================================================
  // MANUAL REFRESH
  // =========================================================

  const handleRefresh = async () => {

    setRefreshing(true);

    setError("");

    try {

      await loadUtilization(true);

    } finally {

      setRefreshing(false);

    }

  };

  // =========================================================
  // GET EQUIPMENT STATUS
  // =========================================================

  const getStatus = (item) => {

    return (

      item.status ||

      item.equipmentStatus ||

      item.currentStatus ||

      "AVAILABLE"

    )
      .toString()
      .toUpperCase();

  };

  // =========================================================
  // STATUS COUNTS
  // =========================================================

  const totalEquipment =
    utilization.length;

  const availableCount =
    utilization.filter(
      (item) =>
        getStatus(item) === "AVAILABLE"
    ).length;

  const inUseCount =
    utilization.filter(
      (item) =>
        getStatus(item) === "IN_USE"
    ).length;

  const bookedCount =
    utilization.filter(
      (item) =>
        getStatus(item) === "BOOKED"
    ).length;

  const maintenanceCount =
    utilization.filter(
      (item) =>
        getStatus(item) ===
        "UNDER_MAINTENANCE"
    ).length;

  // =========================================================
  // STATUS TEXT
  // =========================================================

  const getStatusText = (status) => {

    if (!status) {

      return "Unknown";

    }

    return status
      .toString()
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );

  };

  // =========================================================
  // STATUS CSS CLASS
  // =========================================================

  const getStatusClass = (status) => {

    if (!status) {

      return "unknown";

    }

    return status
      .toString()
      .toLowerCase()
      .replaceAll("_", "-");

  };

  // =========================================================
  // EQUIPMENT NAME
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
  // ASSET TAG
  // =========================================================

  const getAssetTag = (item) => {

    return (

      item.assetTag ||

      item.equipmentAssetTag ||

      item.equipment?.assetTag ||

      ""

    );

  };

  // =========================================================
  // USAGE HOURS
  // =========================================================

  const getUsageHours = (item) => {

    const hours =

      item.usageHours ??

      item.totalUsageHours ??

      item.totalHours ??

      0;

    const numericHours =
      Number(hours);

    if (Number.isNaN(numericHours)) {

      return "0.00";

    }

    return numericHours.toFixed(2);

  };

  // =========================================================
  // USAGE START TIME
  // =========================================================

  const getStartTime = (item) => {

    return (

      item.startTime ||

      item.usageStartTime ||

      item.startedAt ||

      null

    );

  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="utilization-page">

        <div className="loading">

          Loading utilization dashboard...

        </div>

      </div>

    );

  }

  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="utilization-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="page-header">

        <div>

          <h1>
            Equipment Utilization
          </h1>

          <p>
            Monitor real-time equipment
            usage and availability.
          </p>

          {/* LAST UPDATED */}

          {lastUpdated && (

            <small className="last-updated">

              Last updated:{" "}

              {lastUpdated.toLocaleTimeString()}

            </small>

          )}

        </div>

        {/* REFRESH BUTTON */}

        <button
          type="button"
          className="secondary-button"
          onClick={handleRefresh}
          disabled={refreshing}
        >

          {refreshing
            ? "Refreshing..."
            : "↻ Refresh"}

        </button>

      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (

        <div className="error-message">

          {error}

        </div>

      )}

      {/* ===================================================
          SUMMARY CARDS
      =================================================== */}

      <div className="utilization-summary-grid">

        {/* TOTAL */}

        <div className="utilization-summary-card">

          <div className="utilization-card-icon">

            🔬

          </div>

          <div>

            <span>
              Total Equipment
            </span>

            <strong>
              {totalEquipment}
            </strong>

          </div>

        </div>

        {/* AVAILABLE */}

        <div
          className="
            utilization-summary-card
            available-card
          "
        >

          <div className="utilization-card-icon">

            ✓

          </div>

          <div>

            <span>
              Available
            </span>

            <strong>
              {availableCount}
            </strong>

          </div>

        </div>

        {/* IN USE */}

        <div
          className="
            utilization-summary-card
            in-use-card
          "
        >

          <div className="utilization-card-icon">

            ▶

          </div>

          <div>

            <span>
              In Use
            </span>

            <strong>
              {inUseCount}
            </strong>

          </div>

        </div>

        {/* BOOKED */}

        <div
          className="
            utilization-summary-card
            booked-card
          "
        >

          <div className="utilization-card-icon">

            📅

          </div>

          <div>

            <span>
              Booked
            </span>

            <strong>
              {bookedCount}
            </strong>

          </div>

        </div>

        {/* MAINTENANCE */}

        <div
          className="
            utilization-summary-card
            maintenance-card
          "
        >

          <div className="utilization-card-icon">

            🔧

          </div>

          <div>

            <span>
              Under Maintenance
            </span>

            <strong>
              {maintenanceCount}
            </strong>

          </div>

        </div>

      </div>

      {/* ===================================================
          CURRENTLY ACTIVE EQUIPMENT
      =================================================== */}

      <div className="utilization-section">

        <div className="section-header">

          <div>

            <h2>
              Currently Active Equipment
            </h2>

            <p>
              Equipment currently being used
              in the laboratory.
            </p>

          </div>

          {/* LIVE INDICATOR */}

          <span className="live-indicator">

            ● Live

          </span>

        </div>

        {/* =================================================
            NO ACTIVE EQUIPMENT
        ================================================= */}

        {inUseCount === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">

              🔬

            </div>

            <h2>
              No Equipment Currently In Use
            </h2>

            <p>
              There is no equipment currently
              being used.
            </p>

          </div>

        ) : (

          <div className="active-equipment-grid">

            {utilization

              .filter(
                (item) =>
                  getStatus(item) ===
                  "IN_USE"
              )

              .map((item, index) => (

                <div
                  className="active-equipment-card"
                  key={
                    item.id ||
                    item.equipmentId ||
                    index
                  }
                >

                  {/* CARD HEADER */}

                  <div
                    className="
                      active-equipment-header
                    "
                  >

                    <div>

                      <h3>
                        {getEquipmentName(item)}
                      </h3>

                      {getAssetTag(item) && (

                        <span className="asset-tag">

                          {getAssetTag(item)}

                        </span>

                      )}

                    </div>

                    <span
                      className="
                        utilization-status
                        in-use
                      "
                    >

                      IN USE

                    </span>

                  </div>

                  {/* DETAILS */}

                  <div
                    className="
                      active-equipment-details
                    "
                  >

                    <div>

                      <span>
                        Usage Hours
                      </span>

                      <strong>

                        {getUsageHours(item)}
                        {" "}hrs

                      </strong>

                    </div>

                    {getStartTime(item) && (

                      <div>

                        <span>
                          Started
                        </span>

                        <strong>
                          {getStartTime(item)}
                        </strong>

                      </div>

                    )}

                  </div>

                </div>

              ))}

          </div>

        )}

      </div>

      {/* ===================================================
          ALL EQUIPMENT STATUS
      =================================================== */}

      <div className="utilization-section">

        <div className="section-header">

          <div>

            <h2>
              Equipment Status
            </h2>

            <p>
              Current status of all laboratory
              equipment.
            </p>

          </div>

        </div>

        {/* =================================================
            NO DATA
        ================================================= */}

        {utilization.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">

              📭

            </div>

            <h2>
              No Equipment Data
            </h2>

            <p>
              No utilization records are available.
            </p>

          </div>

        ) : (

          <div className="utilization-table-container">

            <table className="utilization-table">

              <thead>

                <tr>

                  <th>
                    #
                  </th>

                  <th>
                    Equipment
                  </th>

                  <th>
                    Asset Tag
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Usage Hours
                  </th>

                </tr>

              </thead>

              <tbody>

                {utilization.map(
                  (item, index) => {

                    const status =
                      getStatus(item);

                    return (

                      <tr
                        key={
                          item.id ||
                          item.equipmentId ||
                          index
                        }
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>

                          <strong>
                            {getEquipmentName(item)}
                          </strong>

                        </td>

                        <td>

                          {getAssetTag(item) ||
                            "—"}

                        </td>

                        <td>

                          <span
                            className={`
                              utilization-status
                              ${getStatusClass(status)}
                            `}
                          >

                            {getStatusText(status)}

                          </span>

                        </td>

                        <td>

                          {getUsageHours(item)}
                          {" "}hrs

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ===================================================
          REAL-TIME INFORMATION
      =================================================== */}

      <div className="utilization-live-info">

        <span className="live-dot">
          ●
        </span>

        <span>
          Dashboard automatically updates
          every 10 seconds.
        </span>

      </div>

    </div>

  );

}

export default UtilizationDashboard;
