import React, { useEffect, useMemo, useState } from "react";
import {
  getAllCalibrations,
  getCalibrationReminders,
  getCertificationReminders,
  getUpcomingCalibrations,
  getExpiredCalibrations,
  getUpcomingCertifications,
  getExpiredCertifications,
  getCalibrationsByEquipment,
} from "../services/calibrationApi";

import "./Calibration.css";

const varOcg = {
  upcomingDays: 30,
  defaultDays: 30,
};

const normalizeArray = (response) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  return [];
};

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const parseDate = (value) => {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = parseDate(value);

  if (!date) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getEquipmentName = (calibration) => {
  return (
    calibration?.equipment?.name ||
    calibration?.equipment?.equipmentName ||
    `Equipment #${calibration?.equipment?.id || "-"}`
  );
};

const getEquipmentId = (calibration) => {
  return calibration?.equipment?.id || "-";
};

const getCalibrationStatus = (calibration) => {
  if (!calibration?.nextCalibrationDate) {
    return "No Date";
  }

  const today = getToday();
  const nextDate = parseDate(calibration.nextCalibrationDate);

  if (!nextDate) return "No Date";

  const difference =
    (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  if (difference < 0) return "Expired";
  if (difference <= varOcg.upcomingDays) return "Upcoming";

  return "Valid";
};

const getCertificationStatus = (calibration) => {
  if (!calibration?.certificateNumber) {
    return "No Certificate";
  }

  if (!calibration?.certificationExpiryDate) {
    return "No Expiry";
  }

  const today = getToday();
  const expiryDate = parseDate(calibration.certificationExpiryDate);

  if (!expiryDate) return "No Expiry";

  const difference =
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  if (difference < 0) return "Expired";
  if (difference <= varOcg.upcomingDays) return "Expiring Soon";

  return "Valid";
};

/* =========================================================
   DASHBOARD
========================================================= */

function CalibrationDashboard() {
  const [calibrations, setCalibrations] = useState([]);
  const [calibrationReminders, setCalibrationReminders] = useState([]);
  const [certificationReminders, setCertificationReminders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        calibrationResponse,
        calibrationReminderResponse,
        certificationReminderResponse,
      ] = await Promise.all([
        getAllCalibrations(),
        getCalibrationReminders(),
        getCertificationReminders(),
      ]);

      setCalibrations(normalizeArray(calibrationResponse));
      setCalibrationReminders(
        normalizeArray(calibrationReminderResponse)
      );
      setCertificationReminders(
        normalizeArray(certificationReminderResponse)
      );
    } catch (err) {
      console.error("Calibration dashboard error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load calibration dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const statistics = useMemo(() => {
    const total = calibrations.length;

    const expired = calibrations.filter(
      (item) => getCalibrationStatus(item) === "Expired"
    ).length;

    const upcoming = calibrations.filter(
      (item) => getCalibrationStatus(item) === "Upcoming"
    ).length;

    const valid = calibrations.filter(
      (item) => getCalibrationStatus(item) === "Valid"
    ).length;

    const noCalibrationDate = calibrations.filter(
      (item) => getCalibrationStatus(item) === "No Date"
    ).length;

    const certificateExpired = calibrations.filter(
      (item) => getCertificationStatus(item) === "Expired"
    ).length;

    const certificateExpiring = calibrations.filter(
      (item) => getCertificationStatus(item) === "Expiring Soon"
    ).length;

    const certificateValid = calibrations.filter(
      (item) => getCertificationStatus(item) === "Valid"
    ).length;

    const noCertificate = calibrations.filter(
      (item) =>
        getCertificationStatus(item) === "No Certificate"
    ).length;

    const noCertificateExpiry = calibrations.filter(
      (item) =>
        getCertificationStatus(item) === "No Expiry"
    ).length;

    const calibrationCoverage =
      total > 0
        ? Math.round(((valid + upcoming) / total) * 100)
        : 0;

    const certificationCoverage =
      total > 0
        ? Math.round(
            ((certificateValid + certificateExpiring) / total) *
              100
          )
        : 0;

    return {
      total,
      expired,
      upcoming,
      valid,
      noCalibrationDate,
      certificateExpired,
      certificateExpiring,
      certificateValid,
      noCertificate,
      noCertificateExpiry,
      calibrationCoverage,
      certificationCoverage,
    };
  }, [calibrations]);

  const recentRecords = useMemo(() => {
    return [...calibrations]
      .sort((a, b) => {
        const dateA = a?.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;

        const dateB = b?.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;

        return dateB - dateA;
      })
      .slice(0, 8);
  }, [calibrations]);

  const urgentCalibrationRecords = useMemo(() => {
    return calibrations
      .filter(
        (item) =>
          getCalibrationStatus(item) === "Expired"
      )
      .slice(0, 5);
  }, [calibrations]);

  const urgentCertificationRecords = useMemo(() => {
    return calibrations
      .filter(
        (item) =>
          getCertificationStatus(item) === "Expired"
      )
      .slice(0, 5);
  }, [calibrations]);

  if (loading) {
    return (
      <div className="calibration-page">
        <div className="calibration-loading">
          <div className="calibration-loading-icon">
            ⚙️
          </div>

          <h3>Loading Calibration Dashboard</h3>

          <p>
            Fetching calibration and certification information...
          </p>

          <div className="calibration-loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="calibration-page">

      {/* ================= HEADER ================= */}

      <div className="calibration-header">
        <div>
          <div className="calibration-title-row">
            <span className="calibration-title-icon">
              🧪
            </span>

            <div>
              <h1>Calibration & Certification Dashboard</h1>

              <p>
                Monitor equipment calibration schedules,
                certification validity and maintenance
                requirements.
              </p>
            </div>
          </div>
        </div>

        <button
          className="calibration-refresh-btn"
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <span className="button-spinner"></span>
              Refreshing...
            </>
          ) : (
            <>🔄 Refresh Data</>
          )}
        </button>
      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="calibration-error">
          <div className="calibration-error-content">
            <span className="calibration-error-icon">
              ⚠️
            </span>

            <div>
              <strong>Unable to load dashboard</strong>
              <p>{error}</p>
            </div>
          </div>

          <button onClick={() => loadDashboard()}>
            Retry
          </button>
        </div>
      )}

      {/* ================= CALIBRATION SUMMARY ================= */}

      <section className="dashboard-section">

        <div className="dashboard-section-heading">
          <div>
            <h2>Calibration Overview</h2>
            <p>
              Current status of all equipment calibration
              records.
            </p>
          </div>
        </div>

        <div className="calibration-summary-grid">

          <div className="calibration-summary-card total">
            <div className="summary-icon">
              📋
            </div>

            <div>
              <span>Total Calibrations</span>
              <strong>{statistics.total}</strong>
              <small>Registered records</small>
            </div>
          </div>

          <div className="calibration-summary-card valid">
            <div className="summary-icon">
              ✅
            </div>

            <div>
              <span>Valid</span>
              <strong>{statistics.valid}</strong>
              <small>
                {statistics.calibrationCoverage}% healthy
              </small>
            </div>
          </div>

          <div className="calibration-summary-card upcoming">
            <div className="summary-icon">
              📅
            </div>

            <div>
              <span>Upcoming</span>
              <strong>{statistics.upcoming}</strong>
              <small>Next {varOcg.upcomingDays} days</small>
            </div>
          </div>

          <div className="calibration-summary-card expired">
            <div className="summary-icon">
              🚨
            </div>

            <div>
              <span>Expired</span>
              <strong>{statistics.expired}</strong>
              <small>Needs attention</small>
            </div>
          </div>

          <div className="calibration-summary-card">
            <div className="summary-icon">
              ❓
            </div>

            <div>
              <span>Missing Date</span>
              <strong>
                {statistics.noCalibrationDate}
              </strong>
              <small>Incomplete records</small>
            </div>
          </div>

        </div>
      </section>

      {/* ================= CERTIFICATION SUMMARY ================= */}

      <section className="dashboard-section">

        <div className="dashboard-section-heading">
          <div>
            <h2>Certification Overview</h2>
            <p>
              Track certificate validity and expiry status.
            </p>
          </div>
        </div>

        <div className="calibration-summary-grid">

          <div className="calibration-summary-card valid">
            <div className="summary-icon">
              📜
            </div>

            <div>
              <span>Valid Certificates</span>
              <strong>
                {statistics.certificateValid}
              </strong>
              <small>
                {statistics.certificationCoverage}% covered
              </small>
            </div>
          </div>

          <div className="calibration-summary-card upcoming">
            <div className="summary-icon">
              ⏳
            </div>

            <div>
              <span>Expiring Soon</span>
              <strong>
                {statistics.certificateExpiring}
              </strong>
              <small>Next 30 days</small>
            </div>
          </div>

          <div className="calibration-summary-card expired">
            <div className="summary-icon">
              🚨
            </div>

            <div>
              <span>Expired Certificates</span>
              <strong>
                {statistics.certificateExpired}
              </strong>
              <small>Immediate attention</small>
            </div>
          </div>

          <div className="calibration-summary-card">
            <div className="summary-icon">
              📄
            </div>

            <div>
              <span>No Certificate</span>
              <strong>
                {statistics.noCertificate}
              </strong>
              <small>Certificate unavailable</small>
            </div>
          </div>

          <div className="calibration-summary-card">
            <div className="summary-icon">
              🗓️
            </div>

            <div>
              <span>No Expiry Date</span>
              <strong>
                {statistics.noCertificateExpiry}
              </strong>
              <small>Review required</small>
            </div>
          </div>

        </div>
      </section>

      {/* ================= HEALTH OVERVIEW ================= */}

      <section className="dashboard-health-grid">

        <div className="dashboard-health-card">

          <div className="health-card-header">
            <div>
              <h3>Calibration Health</h3>
              <p>Current calibration compliance</p>
            </div>

            <span className="health-percentage">
              {statistics.calibrationCoverage}%
            </span>
          </div>

          <div className="health-progress">
            <div
              className="health-progress-fill"
              style={{
                width: `${statistics.calibrationCoverage}%`,
              }}
            ></div>
          </div>

          <div className="health-card-footer">
            <span>
              <i className="health-dot valid"></i>
              Valid / Upcoming
            </span>

            <span>
              {statistics.valid + statistics.upcoming} of{" "}
              {statistics.total}
            </span>
          </div>
        </div>

        <div className="dashboard-health-card">

          <div className="health-card-header">
            <div>
              <h3>Certification Health</h3>
              <p>Certificate coverage status</p>
            </div>

            <span className="health-percentage">
              {statistics.certificationCoverage}%
            </span>
          </div>

          <div className="health-progress">
            <div
              className="health-progress-fill"
              style={{
                width: `${statistics.certificationCoverage}%`,
              }}
            ></div>
          </div>

          <div className="health-card-footer">
            <span>
              <i className="health-dot valid"></i>
              Valid / Expiring Soon
            </span>

            <span>
              {statistics.certificateValid +
                statistics.certificateExpiring}{" "}
              of {statistics.total}
            </span>
          </div>
        </div>

      </section>

      {/* ================= URGENT ATTENTION ================= */}

      <section className="dashboard-urgent-grid">

        <div className="dashboard-urgent-panel">

          <div className="panel-header">
            <div>
              <h2>🚨 Expired Calibrations</h2>
              <p>Equipment requiring immediate calibration</p>
            </div>

            <span className="urgent-count">
              {statistics.expired}
            </span>
          </div>

          {urgentCalibrationRecords.length === 0 ? (
            <div className="empty-state success-empty">
              <span>✅</span>
              <p>No expired calibration records.</p>
            </div>
          ) : (
            <div className="reminder-list">

              {urgentCalibrationRecords.map((item) => (
                <div
                  className="reminder-item urgent"
                  key={`expired-calibration-${item.id}`}
                >
                  <div>
                    <strong>
                      {getEquipmentName(item)}
                    </strong>

                    <small>
                      Equipment ID:{" "}
                      {getEquipmentId(item)}
                    </small>
                  </div>

                  <div className="reminder-date danger">
                    <span>Expired</span>
                    <strong>
                      {formatDate(
                        item.nextCalibrationDate
                      )}
                    </strong>
                  </div>
                </div>
              ))}

            </div>
          )}

        </div>

        <div className="dashboard-urgent-panel">

          <div className="panel-header">
            <div>
              <h2>📜 Expired Certificates</h2>
              <p>Certificates requiring renewal</p>
            </div>

            <span className="urgent-count">
              {statistics.certificateExpired}
            </span>
          </div>

          {urgentCertificationRecords.length === 0 ? (
            <div className="empty-state success-empty">
              <span>✅</span>
              <p>No expired certificates.</p>
            </div>
          ) : (
            <div className="reminder-list">

              {urgentCertificationRecords.map((item) => (
                <div
                  className="reminder-item urgent"
                  key={`expired-certificate-${item.id}`}
                >
                  <div>
                    <strong>
                      {getEquipmentName(item)}
                    </strong>

                    <small>
                      Certificate:{" "}
                      {item.certificateNumber || "-"}
                    </small>
                  </div>

                  <div className="reminder-date danger">
                    <span>Expired</span>
                    <strong>
                      {formatDate(
                        item.certificationExpiryDate
                      )}
                    </strong>
                  </div>
                </div>
              ))}

            </div>
          )}

        </div>

      </section>

      {/* ================= REMINDERS ================= */}

      <section className="dashboard-reminder-grid">

        <div className="calibration-reminder-panel">

          <div className="panel-header">

            <div>
              <h2>📅 Calibration Reminders</h2>
              <p>
                Calibration due within the next{" "}
                {varOcg.upcomingDays} days.
              </p>
            </div>

            <span className="reminder-count">
              {calibrationReminders.length}
            </span>

          </div>

          {calibrationReminders.length === 0 ? (
            <div className="empty-state success-empty">
              <span>✓</span>
              <p>No calibration reminders.</p>
            </div>
          ) : (
            <div className="reminder-list">

              {calibrationReminders
                .slice(0, 5)
                .map((item) => (
                  <div
                    className="reminder-item"
                    key={`calibration-reminder-${item.id}`}
                  >
                    <div>
                      <strong>
                        {getEquipmentName(item)}
                      </strong>

                      <small>
                        Equipment ID:{" "}
                        {getEquipmentId(item)}
                      </small>
                    </div>

                    <div className="reminder-date warning">
                      <span>Due</span>

                      <strong>
                        {formatDate(
                          item.nextCalibrationDate
                        )}
                      </strong>
                    </div>
                  </div>
                ))}

            </div>
          )}

        </div>

        <div className="calibration-reminder-panel">

          <div className="panel-header">

            <div>
              <h2>📜 Certification Reminders</h2>
              <p>
                Certificates expiring within the next{" "}
                {varOcg.upcomingDays} days.
              </p>
            </div>

            <span className="reminder-count">
              {certificationReminders.length}
            </span>

          </div>

          {certificationReminders.length === 0 ? (
            <div className="empty-state success-empty">
              <span>✓</span>
              <p>No certification reminders.</p>
            </div>
          ) : (
            <div className="reminder-list">

              {certificationReminders
                .slice(0, 5)
                .map((item) => (
                  <div
                    className="reminder-item"
                    key={`certification-reminder-${item.id}`}
                  >
                    <div>
                      <strong>
                        {getEquipmentName(item)}
                      </strong>

                      <small>
                        Certificate:{" "}
                        {item.certificateNumber || "-"}
                      </small>
                    </div>

                    <div className="reminder-date warning">
                      <span>Expires</span>

                      <strong>
                        {formatDate(
                          item.certificationExpiryDate
                        )}
                      </strong>
                    </div>
                  </div>
                ))}

            </div>
          )}

        </div>

      </section>

      {/* ================= RECENT RECORDS ================= */}

      <section className="calibration-table-section">

        <div className="section-header">

          <div>
            <h2>Recent Calibration Records</h2>

            <p>
              Latest calibration activity registered in
              the system.
            </p>
          </div>

          <span>Latest 8 records</span>

        </div>

        {recentRecords.length === 0 ? (
          <div className="empty-state">
            <span>📋</span>
            <p>No calibration records available.</p>
          </div>
        ) : (
          <div className="table-responsive">

            <table className="calibration-table">

              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Last Calibration</th>
                  <th>Next Calibration</th>
                  <th>Status</th>
                  <th>Certificate</th>
                  <th>Certificate Expiry</th>
                  <th>Performed By</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>

                {recentRecords.map((item) => {

                  const status =
                    getCalibrationStatus(item);

                  const certificationStatus =
                    getCertificationStatus(item);

                  return (
                    <tr key={item.id}>

                      <td>
                        <strong>
                          {getEquipmentName(item)}
                        </strong>

                        <small>
                          ID: {getEquipmentId(item)}
                        </small>
                      </td>

                      <td>
                        {formatDate(
                          item.lastCalibrationDate
                        )}
                      </td>

                      <td>
                        {formatDate(
                          item.nextCalibrationDate
                        )}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td>
                        <div className="certificate-cell">
                          <strong>
                            {item.certificateNumber || "-"}
                          </strong>

                          {item.certificateNumber && (
                            <span
                              className={`certificate-mini-status ${certificationStatus
                                .toLowerCase()
                                .replace(
                                  /\s+/g,
                                  "-"
                                )}`}
                            >
                              {certificationStatus}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        {formatDate(
                          item.certificationExpiryDate
                        )}
                      </td>

                      <td>
                        {item.performedBy || "-"}
                      </td>

                      <td>
                        {item.createdAt
                          ? new Date(
                              item.createdAt
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </section>

    </div>
  );
}

/* =========================================================
   CALIBRATION TRACKING
========================================================= */

function CalibrationTrackingView() {
  const [calibrations, setCalibrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedCalibration, setSelectedCalibration] =
    useState(null);

  const [equipmentRecords, setEquipmentRecords] = useState([]);
  const [equipmentLoading, setEquipmentLoading] = useState(false);

  const loadCalibrations = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getAllCalibrations();
      setCalibrations(normalizeArray(response));
    } catch (err) {
      console.error("Tracking error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to load calibration tracking data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCalibrations();
  }, []);

  const filteredCalibrations = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return calibrations.filter((item) => {
      const calibrationStatus = getCalibrationStatus(item);
      const certificationStatus = getCertificationStatus(item);

      const matchesStatus =
        statusFilter === "All" ||
        calibrationStatus === statusFilter ||
        (statusFilter === "Certification Expiring" &&
          certificationStatus === "Expiring Soon");

      const equipmentName = getEquipmentName(item).toLowerCase();
      const equipmentId = String(getEquipmentId(item)).toLowerCase();
      const certificate = (
        item.certificateNumber || ""
      ).toLowerCase();

      const matchesSearch =
        !searchValue ||
        equipmentName.includes(searchValue) ||
        equipmentId.includes(searchValue) ||
        certificate.includes(searchValue);

      return matchesStatus && matchesSearch;
    });
  }, [calibrations, search, statusFilter]);

  const statistics = useMemo(() => {
    return {
      total: calibrations.length,
      valid: calibrations.filter(
        (item) => getCalibrationStatus(item) === "Valid"
      ).length,
      upcoming: calibrations.filter(
        (item) => getCalibrationStatus(item) === "Upcoming"
      ).length,
      expired: calibrations.filter(
        (item) => getCalibrationStatus(item) === "Expired"
      ).length,
    };
  }, [calibrations]);

  const openDetails = async (calibration) => {
    setSelectedCalibration(calibration);
    setEquipmentRecords([]);

    const equipmentId = calibration?.equipment?.id;

    if (!equipmentId) return;

    try {
      setEquipmentLoading(true);

      const response =
        await getCalibrationsByEquipment(equipmentId);

      setEquipmentRecords(normalizeArray(response));
    } catch (err) {
      console.error("Equipment calibration history error:", err);

      const fallback = calibrations.filter(
        (item) => item?.equipment?.id === equipmentId
      );

      setEquipmentRecords(fallback);
    } finally {
      setEquipmentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="calibration-tracking-page">
        <div className="tracking-loading">
          Loading calibration tracking...
        </div>
      </div>
    );
  }

  return (
    <div className="calibration-tracking-page">
      <div className="tracking-header">
        <div>
          <h1>Calibration Tracking</h1>
          <p>
            Track calibration schedules and equipment certification
            status.
          </p>
        </div>

        <button
          className="tracking-refresh-btn"
          onClick={() => loadCalibrations(true)}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "🔄 Refresh"}
        </button>
      </div>

      {error && (
        <div className="tracking-error">
          {error}
          <button onClick={() => loadCalibrations()}>
            Retry
          </button>
        </div>
      )}

      <div className="tracking-summary-grid">
        <div className="tracking-summary-card">
          <span>Total</span>
          <strong>{statistics.total}</strong>
        </div>

        <div className="tracking-summary-card">
          <span>Valid</span>
          <strong>{statistics.valid}</strong>
        </div>

        <div className="tracking-summary-card">
          <span>Upcoming</span>
          <strong>{statistics.upcoming}</strong>
        </div>

        <div className="tracking-summary-card">
          <span>Expired</span>
          <strong>{statistics.expired}</strong>
        </div>
      </div>

      <div className="tracking-toolbar">
        <input
          type="text"
          placeholder="Search equipment, ID or certificate..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Valid">Valid</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Expired">Expired</option>
          <option value="Certification Expiring">
            Certification Expiring
          </option>
        </select>

        {(search || statusFilter !== "All") && (
          <button
            className="tracking-clear-btn"
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
            }}
          >
            Clear
          </button>
        )}
      </div>

      <div className="tracking-table-wrapper">
        <table className="tracking-table">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Last Calibration</th>
              <th>Next Calibration</th>
              <th>Calibration Status</th>
              <th>Certificate</th>
              <th>Certificate Expiry</th>
              <th>Certification Status</th>
              <th>Performed By</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredCalibrations.length === 0 ? (
              <tr>
                <td colSpan="9" className="tracking-empty">
                  No calibration records found.
                </td>
              </tr>
            ) : (
              filteredCalibrations.map((item) => {
                const calibrationStatus =
                  getCalibrationStatus(item);

                const certificationStatus =
                  getCertificationStatus(item);

                return (
                  <tr key={item.id}>
                    <td>
                      <strong>{getEquipmentName(item)}</strong>
                      <small>
                        ID: {getEquipmentId(item)}
                      </small>
                    </td>

                    <td>
                      {formatDate(item.lastCalibrationDate)}
                    </td>

                    <td>
                      {formatDate(item.nextCalibrationDate)}
                    </td>

                    <td>
                      <span
                        className={`tracking-status ${calibrationStatus
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {calibrationStatus}
                      </span>
                    </td>

                    <td>
                      {item.certificateNumber || "-"}
                    </td>

                    <td>
                      {formatDate(item.certificationExpiryDate)}
                    </td>

                    <td>
                      <span
                        className={`tracking-status ${certificationStatus
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {certificationStatus}
                      </span>
                    </td>

                    <td>
                      {item.performedBy || "-"}
                    </td>

                    <td>
                      <button
                        className="tracking-view-btn"
                        onClick={() => openDetails(item)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedCalibration && (
        <div
          className="tracking-modal-overlay"
          onClick={() => setSelectedCalibration(null)}
        >
          <div
            className="tracking-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tracking-modal-header">
              <div>
                <h2>Calibration Details</h2>
                <p>{getEquipmentName(selectedCalibration)}</p>
              </div>

              <button
                onClick={() => setSelectedCalibration(null)}
              >
                ✕
              </button>
            </div>

            <div className="tracking-details-grid">
              <div>
                <label>Equipment</label>
                <strong>
                  {getEquipmentName(selectedCalibration)}
                </strong>
              </div>

              <div>
                <label>Equipment ID</label>
                <strong>
                  {getEquipmentId(selectedCalibration)}
                </strong>
              </div>

              <div>
                <label>Last Calibration</label>
                <strong>
                  {formatDate(
                    selectedCalibration.lastCalibrationDate
                  )}
                </strong>
              </div>

              <div>
                <label>Next Calibration</label>
                <strong>
                  {formatDate(
                    selectedCalibration.nextCalibrationDate
                  )}
                </strong>
              </div>

              <div>
                <label>Calibration Status</label>
                <strong>
                  {getCalibrationStatus(selectedCalibration)}
                </strong>
              </div>

              <div>
                <label>Certificate Number</label>
                <strong>
                  {selectedCalibration.certificateNumber || "-"}
                </strong>
              </div>

              <div>
                <label>Certificate Expiry</label>
                <strong>
                  {formatDate(
                    selectedCalibration.certificationExpiryDate
                  )}
                </strong>
              </div>

              <div>
                <label>Certification Status</label>
                <strong>
                  {getCertificationStatus(selectedCalibration)}
                </strong>
              </div>
            </div>

            {selectedCalibration.certificationDetails && (
              <div className="tracking-detail-section">
                <label>Certification Details</label>
                <p>
                  {selectedCalibration.certificationDetails}
                </p>
              </div>
            )}

            {selectedCalibration.remarks && (
              <div className="tracking-detail-section">
                <label>Remarks</label>
                <p>{selectedCalibration.remarks}</p>
              </div>
            )}

            <div className="tracking-history-section">
              <h3>Equipment Calibration History</h3>

              {equipmentLoading ? (
                <p>Loading history...</p>
              ) : equipmentRecords.length === 0 ? (
                <p>No history available.</p>
              ) : (
                <div className="tracking-history-list">
                  {equipmentRecords.map((record) => (
                    <div
                      className="tracking-history-item"
                      key={record.id}
                    >
                      <strong>
                        {formatDate(record.lastCalibrationDate)}
                        {" → "}
                        {formatDate(record.nextCalibrationDate)}
                      </strong>

                      <span>
                        Certificate:{" "}
                        {record.certificateNumber || "-"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   CALIBRATION ALERTS
========================================================= */

function CalibrationAlertsView() {
  const [upcomingCalibrations, setUpcomingCalibrations] =
    useState([]);

  const [expiredCalibrations, setExpiredCalibrations] =
    useState([]);

  const [upcomingCertifications, setUpcomingCertifications] =
    useState([]);

  const [expiredCertifications, setExpiredCertifications] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const getDateRange = () => {
    const today = getToday();

    const endDate = new Date(today);
    endDate.setDate(
      endDate.getDate() + varOcg.defaultDays
    );

    const toApiDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    return {
      startDate: toApiDate(today),
      endDate: toApiDate(endDate),
      date: toApiDate(today),
    };
  };

  const loadAlerts = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const { startDate, endDate, date } = getDateRange();

      const [
        upcomingCalibrationResponse,
        expiredCalibrationResponse,
        upcomingCertificationResponse,
        expiredCertificationResponse,
      ] = await Promise.all([
        getUpcomingCalibrations(startDate, endDate),
        getExpiredCalibrations(date),
        getUpcomingCertifications(startDate, endDate),
        getExpiredCertifications(date),
      ]);

      setUpcomingCalibrations(
        normalizeArray(upcomingCalibrationResponse)
      );

      setExpiredCalibrations(
        normalizeArray(expiredCalibrationResponse)
      );

      setUpcomingCertifications(
        normalizeArray(upcomingCertificationResponse)
      );

      setExpiredCertifications(
        normalizeArray(expiredCertificationResponse)
      );
    } catch (err) {
      console.error("Calibration alerts error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load calibration alerts."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const alertRecords = useMemo(() => {
    const records = [];

    upcomingCalibrations.forEach((item) => {
      records.push({
        ...item,
        alertType: "calibration",
        alertLabel: "Calibration Upcoming",
        alertClass: "upcoming",
        alertDate: item.nextCalibrationDate,
      });
    });

    expiredCalibrations.forEach((item) => {
      records.push({
        ...item,
        alertType: "calibration",
        alertLabel: "Calibration Expired",
        alertClass: "expired",
        alertDate: item.nextCalibrationDate,
      });
    });

    upcomingCertifications.forEach((item) => {
      records.push({
        ...item,
        alertType: "certificate",
        alertLabel: "Certificate Expiring",
        alertClass: "upcoming",
        alertDate: item.certificationExpiryDate,
      });
    });

    expiredCertifications.forEach((item) => {
      records.push({
        ...item,
        alertType: "certificate",
        alertLabel: "Certificate Expired",
        alertClass: "expired",
        alertDate: item.certificationExpiryDate,
      });
    });

    return records;
  }, [
    upcomingCalibrations,
    expiredCalibrations,
    upcomingCertifications,
    expiredCertifications,
  ]);

  const filteredAlerts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return alertRecords.filter((record) => {
      let matchesTab = true;

      if (activeTab === "upcoming") {
        matchesTab = record.alertClass === "upcoming";
      }

      if (activeTab === "expired") {
        matchesTab = record.alertClass === "expired";
      }

      if (activeTab === "calibration") {
        matchesTab = record.alertType === "calibration";
      }

      if (activeTab === "certificate") {
        matchesTab = record.alertType === "certificate";
      }

      const equipmentName =
        getEquipmentName(record).toLowerCase();

      const equipmentId =
        String(getEquipmentId(record)).toLowerCase();

      const certificate = (
        record.certificateNumber || ""
      ).toLowerCase();

      const matchesSearch =
        !searchValue ||
        equipmentName.includes(searchValue) ||
        equipmentId.includes(searchValue) ||
        certificate.includes(searchValue);

      return matchesTab && matchesSearch;
    });
  }, [alertRecords, activeTab, search]);

  const statistics = {
    upcoming:
      upcomingCalibrations.length +
      upcomingCertifications.length,

    expired:
      expiredCalibrations.length +
      expiredCertifications.length,

    total: alertRecords.length,

    calibration:
      upcomingCalibrations.length +
      expiredCalibrations.length,

    certificate:
      upcomingCertifications.length +
      expiredCertifications.length,
  };

  if (loading) {
    return (
      <div className="calibration-alerts-page">
        <div className="alerts-loading">
          Loading calibration alerts...
        </div>
      </div>
    );
  }

  return (
    <div className="calibration-alerts-page">
      <div className="alerts-header">
        <div>
          <h1>Calibration Alerts</h1>
          <p>
            Monitor upcoming and expired calibration and
            certification records.
          </p>
        </div>

        <button
          className="alerts-refresh-btn"
          onClick={() => loadAlerts(true)}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "🔄 Refresh"}
        </button>
      </div>

      {error && (
        <div className="alerts-error">
          {error}
          <button onClick={() => loadAlerts()}>
            Retry
          </button>
        </div>
      )}

      <div className="alerts-summary-grid">
        <div className="alerts-summary-card">
          <span>Total Alerts</span>
          <strong>{statistics.total}</strong>
        </div>

        <div className="alerts-summary-card">
          <span>Upcoming</span>
          <strong>{statistics.upcoming}</strong>
        </div>

        <div className="alerts-summary-card">
          <span>Expired</span>
          <strong>{statistics.expired}</strong>
        </div>

        <div className="alerts-summary-card">
          <span>Calibration Alerts</span>
          <strong>{statistics.calibration}</strong>
        </div>

        <div className="alerts-summary-card">
          <span>Certificate Alerts</span>
          <strong>{statistics.certificate}</strong>
        </div>
      </div>

      <div className="alerts-toolbar">
        <input
          type="text"
          placeholder="Search equipment, ID or certificate..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className={activeTab === "all" ? "active" : ""}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>

        <button
          className={activeTab === "upcoming" ? "active" : ""}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming
        </button>

        <button
          className={activeTab === "expired" ? "active" : ""}
          onClick={() => setActiveTab("expired")}
        >
          Expired
        </button>

        <button
          className={
            activeTab === "calibration" ? "active" : ""
          }
          onClick={() => setActiveTab("calibration")}
        >
          Calibration
        </button>

        <button
          className={
            activeTab === "certificate" ? "active" : ""
          }
          onClick={() => setActiveTab("certificate")}
        >
          Certificate
        </button>
      </div>

      <div className="alerts-table-wrapper">
        <table className="alerts-table">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Alert Type</th>
              <th>Alert</th>
              <th>Date</th>
              <th>Certificate</th>
              <th>Performed By</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan="7" className="alerts-empty">
                  No alerts found.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((record, index) => (
                <tr
                  key={`${record.alertType}-${record.id}-${index}`}
                >
                  <td>
                    <strong>{getEquipmentName(record)}</strong>
                    <small>
                      ID: {getEquipmentId(record)}
                    </small>
                  </td>

                  <td>
                    {record.alertType === "calibration"
                      ? "Calibration"
                      : "Certificate"}
                  </td>

                  <td>
                    <span
                      className={`alert-badge ${record.alertClass}`}
                    >
                      {record.alertLabel}
                    </span>
                  </td>

                  <td>{formatDate(record.alertDate)}</td>

                  <td>
                    {record.certificateNumber || "-"}
                  </td>

                  <td>
                    {record.performedBy || "-"}
                  </td>

                  <td>
                    <button
                      className="alerts-view-btn"
                      onClick={() =>
                        setSelectedRecord(record)
                      }
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedRecord && (
        <div
          className="alerts-modal-overlay"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="alerts-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="alerts-modal-header">
              <div>
                <h2>Alert Details</h2>
                <p>{getEquipmentName(selectedRecord)}</p>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
              >
                ✕
              </button>
            </div>

            <div className="alerts-details-grid">
              <div>
                <label>Equipment</label>
                <strong>
                  {getEquipmentName(selectedRecord)}
                </strong>
              </div>

              <div>
                <label>Equipment ID</label>
                <strong>
                  {getEquipmentId(selectedRecord)}
                </strong>
              </div>

              <div>
                <label>Alert Type</label>
                <strong>
                  {selectedRecord.alertType === "calibration"
                    ? "Calibration"
                    : "Certificate"}
                </strong>
              </div>

              <div>
                <label>Alert</label>
                <strong>
                  {selectedRecord.alertLabel}
                </strong>
              </div>

              <div>
                <label>Alert Date</label>
                <strong>
                  {formatDate(selectedRecord.alertDate)}
                </strong>
              </div>

              <div>
                <label>Certificate</label>
                <strong>
                  {selectedRecord.certificateNumber || "-"}
                </strong>
              </div>

              <div>
                <label>Performed By</label>
                <strong>
                  {selectedRecord.performedBy || "-"}
                </strong>
              </div>

              <div>
                <label>Record ID</label>
                <strong>{selectedRecord.id || "-"}</strong>
              </div>
            </div>

            {selectedRecord.certificationDetails && (
              <div className="alerts-detail-section">
                <label>Certification Details</label>
                <p>
                  {selectedRecord.certificationDetails}
                </p>
              </div>
            )}

            {selectedRecord.remarks && (
              <div className="alerts-detail-section">
                <label>Remarks</label>
                <p>{selectedRecord.remarks}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Calibration({ view = "dashboard" }) {
  if (view === "tracking") {
    return <CalibrationTrackingView />;
  }

  if (view === "alerts") {
    return <CalibrationAlertsView />;
  }

  return <CalibrationDashboard />;
}