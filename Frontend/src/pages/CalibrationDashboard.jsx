import React, { useEffect, useState } from "react";

import {
  getAllCalibrations,
  getUpcomingCalibrations,
  getExpiredCalibrations,
  getUpcomingCertifications,
  getExpiredCertifications,
  getCalibrationReminders,
  getCertificationReminders,
} from "../services/calibrationApi";

const CalibrationDashboard = () => {
  const [calibrations, setCalibrations] = useState([]);
  const [upcomingCalibrations, setUpcomingCalibrations] = useState([]);
  const [expiredCalibrations, setExpiredCalibrations] = useState([]);

  const [upcomingCertifications, setUpcomingCertifications] =
    useState([]);

  const [expiredCertifications, setExpiredCertifications] =
    useState([]);

  const [calibrationReminders, setCalibrationReminders] =
    useState([]);

  const [certificationReminders, setCertificationReminders] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD DASHBOARD DATA
  // =========================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const today = new Date();

      const startDate = formatDate(today);

      const reminderEndDate = new Date(today);
      reminderEndDate.setDate(
        reminderEndDate.getDate() + 30
      );

      const endDate = formatDate(reminderEndDate);

      const [
        allData,
        upcomingCalibrationData,
        expiredCalibrationData,
        upcomingCertificationData,
        expiredCertificationData,
        calibrationReminderData,
        certificationReminderData,
      ] = await Promise.all([
        getAllCalibrations(),

        getUpcomingCalibrations(
          startDate,
          endDate
        ),

        getExpiredCalibrations(
          startDate
        ),

        getUpcomingCertifications(
          startDate,
          endDate
        ),

        getExpiredCertifications(
          startDate
        ),

        getCalibrationReminders(),

        getCertificationReminders(),
      ]);

      setCalibrations(
        Array.isArray(allData)
          ? allData
          : []
      );

      setUpcomingCalibrations(
        Array.isArray(upcomingCalibrationData)
          ? upcomingCalibrationData
          : []
      );

      setExpiredCalibrations(
        Array.isArray(expiredCalibrationData)
          ? expiredCalibrationData
          : []
      );

      setUpcomingCertifications(
        Array.isArray(upcomingCertificationData)
          ? upcomingCertificationData
          : []
      );

      setExpiredCertifications(
        Array.isArray(expiredCertificationData)
          ? expiredCertificationData
          : []
      );

      setCalibrationReminders(
        Array.isArray(calibrationReminderData)
          ? calibrationReminderData
          : []
      );

      setCertificationReminders(
        Array.isArray(
          certificationReminderData
        )
          ? certificationReminderData
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load calibration dashboard:",
        err
      );

      setError(
        "Failed to load calibration dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  // =========================================================
  // EQUIPMENT NAME
  // =========================================================

  const getEquipmentName = (equipment) => {
    if (!equipment) {
      return "N/A";
    }

    return (
      equipment.name ||
      equipment.equipmentName ||
      `Equipment #${equipment.id}`
    );
  };

  // =========================================================
  // DATE DISPLAY
  // =========================================================

  const formatDisplayDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString();
  };

  // =========================================================
  // STATUS
  // =========================================================

  const getCalibrationStatus = (calibration) => {
    if (
      !calibration.nextCalibrationDate
    ) {
      return "Not Scheduled";
    }

    const today = new Date();

    const nextDate = new Date(
      calibration.nextCalibrationDate
    );

    if (nextDate < today) {
      return "Expired";
    }

    return "Valid";
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="calibration-dashboard">
        <div className="calibration-loading">
          <div className="calibration-spinner"></div>

          <p>
            Loading calibration dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="calibration-dashboard">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="calibration-dashboard-header">

        <div>
          <h1>
            Calibration & Certification
          </h1>

          <p>
            Monitor equipment calibration,
            certification validity and renewal
            reminders.
          </p>
        </div>

        <button
          className="calibration-refresh-btn"
          onClick={loadDashboard}
        >
          ↻ Refresh
        </button>

      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="calibration-error">
          {error}
        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="calibration-summary-grid">

        <div className="calibration-card">

          <div className="calibration-card-icon">
            📋
          </div>

          <div>
            <span>
              Total Calibrations
            </span>

            <strong>
              {calibrations.length}
            </strong>
          </div>

        </div>


        <div className="calibration-card upcoming">

          <div className="calibration-card-icon">
            📅
          </div>

          <div>
            <span>
              Upcoming Calibration
            </span>

            <strong>
              {upcomingCalibrations.length}
            </strong>
          </div>

        </div>


        <div className="calibration-card expired">

          <div className="calibration-card-icon">
            ⚠️
          </div>

          <div>
            <span>
              Expired Calibration
            </span>

            <strong>
              {expiredCalibrations.length}
            </strong>
          </div>

        </div>


        <div className="calibration-card certification">

          <div className="calibration-card-icon">
            📜
          </div>

          <div>
            <span>
              Upcoming Certification
            </span>

            <strong>
              {upcomingCertifications.length}
            </strong>
          </div>

        </div>


        <div className="calibration-card expired">

          <div className="calibration-card-icon">
            ❌
          </div>

          <div>
            <span>
              Expired Certification
            </span>

            <strong>
              {expiredCertifications.length}
            </strong>
          </div>

        </div>

      </div>


      {/* =====================================================
          REMINDER SECTION
      ====================================================== */}

      <div className="calibration-reminder-grid">

        <div className="calibration-reminder-card">

          <div className="reminder-header">

            <div>
              <h3>
                Calibration Renewal Reminders
              </h3>

              <p>
                Calibration due within 30 days
              </p>
            </div>

            <span className="reminder-count">
              {calibrationReminders.length}
            </span>

          </div>

          {calibrationReminders.length === 0 ? (

            <div className="empty-state">
              No calibration renewals due soon.
            </div>

          ) : (

            <div className="reminder-list">

              {calibrationReminders.map(
                (calibration) => (

                  <div
                    className="reminder-item"
                    key={calibration.id}
                  >

                    <div>

                      <strong>
                        {getEquipmentName(
                          calibration.equipment
                        )}
                      </strong>

                      <span>
                        Next calibration:{" "}
                        {formatDisplayDate(
                          calibration.nextCalibrationDate
                        )}
                      </span>

                    </div>

                    <span className="warning-badge">
                      Due Soon
                    </span>

                  </div>

                )
              )}

            </div>

          )}

        </div>


        <div className="calibration-reminder-card">

          <div className="reminder-header">

            <div>
              <h3>
                Certification Renewal
              </h3>

              <p>
                Certification expiring within 30 days
              </p>
            </div>

            <span className="reminder-count">
              {certificationReminders.length}
            </span>

          </div>

          {certificationReminders.length === 0 ? (

            <div className="empty-state">
              No certification renewals due soon.
            </div>

          ) : (

            <div className="reminder-list">

              {certificationReminders.map(
                (calibration) => (

                  <div
                    className="reminder-item"
                    key={calibration.id}
                  >

                    <div>

                      <strong>
                        {getEquipmentName(
                          calibration.equipment
                        )}
                      </strong>

                      <span>
                        Certificate:{" "}
                        {calibration.certificateNumber ||
                          "N/A"}
                      </span>

                      <span>
                        Expires:{" "}
                        {formatDisplayDate(
                          calibration.certificationExpiryDate
                        )}
                      </span>

                    </div>

                    <span className="warning-badge">
                      Renew Soon
                    </span>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>


      {/* =====================================================
          UPCOMING CALIBRATIONS
      ====================================================== */}

      <section className="calibration-section">

        <div className="section-header">

          <div>
            <h2>
              Upcoming Calibrations
            </h2>

            <p>
              Equipment requiring calibration
              within the next 30 days.
            </p>
          </div>

        </div>

        <div className="calibration-table-container">

          <table className="calibration-table">

            <thead>

              <tr>
                <th>ID</th>
                <th>Equipment</th>
                <th>Last Calibration</th>
                <th>Next Calibration</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              {upcomingCalibrations.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="table-empty"
                  >
                    No upcoming calibrations.
                  </td>

                </tr>

              ) : (

                upcomingCalibrations.map(
                  (calibration) => (

                    <tr key={calibration.id}>

                      <td>
                        #{calibration.id}
                      </td>

                      <td>
                        {getEquipmentName(
                          calibration.equipment
                        )}
                      </td>

                      <td>
                        {formatDisplayDate(
                          calibration.lastCalibrationDate
                        )}
                      </td>

                      <td>
                        {formatDisplayDate(
                          calibration.nextCalibrationDate
                        )}
                      </td>

                      <td>
                        <span className="status-badge upcoming-status">
                          {getCalibrationStatus(
                            calibration
                          )}
                        </span>
                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* =====================================================
          EXPIRED CALIBRATIONS
      ====================================================== */}

      <section className="calibration-section">

        <div className="section-header">

          <div>
            <h2>
              Expired Calibrations
            </h2>

            <p>
              Equipment with overdue calibration.
            </p>
          </div>

        </div>

        <div className="calibration-table-container">

          <table className="calibration-table">

            <thead>

              <tr>
                <th>ID</th>
                <th>Equipment</th>
                <th>Last Calibration</th>
                <th>Next Calibration</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              {expiredCalibrations.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="table-empty"
                  >
                    No expired calibrations.
                  </td>

                </tr>

              ) : (

                expiredCalibrations.map(
                  (calibration) => (

                    <tr key={calibration.id}>

                      <td>
                        #{calibration.id}
                      </td>

                      <td>
                        {getEquipmentName(
                          calibration.equipment
                        )}
                      </td>

                      <td>
                        {formatDisplayDate(
                          calibration.lastCalibrationDate
                        )}
                      </td>

                      <td>
                        {formatDisplayDate(
                          calibration.nextCalibrationDate
                        )}
                      </td>

                      <td>
                        <span className="status-badge expired-status">
                          Expired
                        </span>
                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* =====================================================
          CERTIFICATION STATUS
      ====================================================== */}

      <section className="calibration-section">

        <div className="section-header">

          <div>
            <h2>
              Certification Status
            </h2>

            <p>
              Track equipment certification
              expiry dates.
            </p>
          </div>

        </div>

        <div className="calibration-table-container">

          <table className="calibration-table">

            <thead>

              <tr>
                <th>ID</th>
                <th>Equipment</th>
                <th>Certificate</th>
                <th>Expiry Date</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              {[
                ...upcomingCertifications,
                ...expiredCertifications,
              ].length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="table-empty"
                  >
                    No certification records found.
                  </td>

                </tr>

              ) : (

                [
                  ...upcomingCertifications,
                  ...expiredCertifications,
                ].map((calibration) => {

                  const isExpired =
                    expiredCertifications.some(
                      (item) =>
                        item.id === calibration.id
                    );

                  return (
                    <tr key={calibration.id}>

                      <td>
                        #{calibration.id}
                      </td>

                      <td>
                        {getEquipmentName(
                          calibration.equipment
                        )}
                      </td>

                      <td>
                        {calibration.certificateNumber ||
                          "N/A"}
                      </td>

                      <td>
                        {formatDisplayDate(
                          calibration.certificationExpiryDate
                        )}
                      </td>

                      <td>

                        <span
                          className={`status-badge ${
                            isExpired
                              ? "expired-status"
                              : "upcoming-status"
                          }`}
                        >
                          {isExpired
                            ? "Expired"
                            : "Valid / Upcoming"}
                        </span>

                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
};

export default CalibrationDashboard;