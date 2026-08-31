import React, { useEffect, useState } from "react";

import {
  getAllCalibrations,
  createCalibration,
  updateCalibration,
  deleteCalibration,
  getCalibrationsByEquipment,
} from "../services/calibrationApi";

import api from "../services/api";

const CalibrationManagement = () => {

  // =========================================================
  // STATE
  // =========================================================

  const [calibrations, setCalibrations] = useState([]);
  const [equipment, setEquipment] = useState([]);

  const [selectedEquipmentId, setSelectedEquipmentId] =
    useState("");

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingId, setEditingId] = useState(null);

  // =========================================================
  // TASK 2.10 - CERTIFICATION DETAILS STATE
  // =========================================================

  const [showCertificationModal, setShowCertificationModal] =
    useState(false);

  const [selectedCertification, setSelectedCertification] =
    useState(null);

  // =========================================================
  // TASK 2.11 - RENEWAL REMINDER STATE
  // =========================================================

  const [showAllReminders, setShowAllReminders] =
    useState(false);

  // =========================================================
  // FORM DATA
  // =========================================================

  const [formData, setFormData] = useState({
    equipmentId: "",
    lastCalibrationDate: "",
    nextCalibrationDate: "",
    certificateNumber: "",
    certificationDetails: "",
    certificationExpiryDate: "",
    performedBy: "",
    remarks: "",
  });

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {

      setLoading(true);
      setError("");

      const [
        calibrationData,
        equipmentResponse,
      ] = await Promise.all([
        getAllCalibrations(),
        api.get("/equipment"),
      ]);

      setCalibrations(
        Array.isArray(calibrationData)
          ? calibrationData
          : []
      );

      setEquipment(
        Array.isArray(equipmentResponse.data)
          ? equipmentResponse.data
          : []
      );

    } catch (err) {

      console.error(
        "Failed to load calibration data:",
        err
      );

      setError(
        "Failed to load calibration data."
      );

    } finally {

      setLoading(false);

    }
  };

  // =========================================================
  // FORM HANDLING
  // =========================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {

    setFormData({
      equipmentId: "",
      lastCalibrationDate: "",
      nextCalibrationDate: "",
      certificateNumber: "",
      certificationDetails: "",
      certificationExpiryDate: "",
      performedBy: "",
      remarks: "",
    });

    setEditingId(null);
  };

  // =========================================================
  // OPEN CREATE MODAL
  // =========================================================

  const openCreateModal = () => {

    resetForm();

    setShowModal(true);

    setError("");
    setSuccess("");
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditModal = (calibration) => {

    setEditingId(calibration.id);

    setFormData({

      equipmentId:
        calibration.equipment?.id ||
        calibration.equipmentId ||
        "",

      lastCalibrationDate:
        calibration.lastCalibrationDate || "",

      nextCalibrationDate:
        calibration.nextCalibrationDate || "",

      certificateNumber:
        calibration.certificateNumber || "",

      certificationDetails:
        calibration.certificationDetails || "",

      certificationExpiryDate:
        calibration.certificationExpiryDate || "",

      performedBy:
        calibration.performedBy || "",

      remarks:
        calibration.remarks || "",
    });

    setShowModal(true);

    setError("");
    setSuccess("");
  };

  // =========================================================
  // TASK 2.10
  // OPEN CERTIFICATION DETAILS
  // =========================================================

  const openCertificationDetails = (calibration) => {

    setSelectedCertification(calibration);

    setShowCertificationModal(true);

    setError("");
  };

  // =========================================================
  // CLOSE CERTIFICATION DETAILS
  // =========================================================

  const closeCertificationDetails = () => {

    setShowCertificationModal(false);

    setSelectedCertification(null);
  };

  // =========================================================
  // CREATE / UPDATE CALIBRATION
  // =========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setError("");
      setSuccess("");

      // -----------------------------------------------------
      // EQUIPMENT VALIDATION
      // -----------------------------------------------------

      if (!formData.equipmentId) {

        setError(
          "Please select equipment."
        );

        return;
      }

      // -----------------------------------------------------
      // CALIBRATION DATE VALIDATION
      // -----------------------------------------------------

      if (
        formData.lastCalibrationDate &&
        formData.nextCalibrationDate &&
        formData.lastCalibrationDate >
          formData.nextCalibrationDate
      ) {

        setError(
          "Next calibration date cannot be before last calibration date."
        );

        return;
      }

      // -----------------------------------------------------
      // CERTIFICATION DATE VALIDATION
      // -----------------------------------------------------

      if (
        formData.lastCalibrationDate &&
        formData.certificationExpiryDate &&
        formData.certificationExpiryDate <
          formData.lastCalibrationDate
      ) {

        setError(
          "Certification expiry date cannot be before last calibration date."
        );

        return;
      }

      // -----------------------------------------------------
      // PAYLOAD
      // -----------------------------------------------------

      const payload = {

        equipment: {
          id: Number(
            formData.equipmentId
          ),
        },

        lastCalibrationDate:
          formData.lastCalibrationDate ||
          null,

        nextCalibrationDate:
          formData.nextCalibrationDate ||
          null,

        certificateNumber:
          formData.certificateNumber?.trim() ||
          "",

        certificationDetails:
          formData.certificationDetails?.trim() ||
          "",

        certificationExpiryDate:
          formData.certificationExpiryDate ||
          null,

        performedBy:
          formData.performedBy?.trim() ||
          "",

        remarks:
          formData.remarks?.trim() ||
          "",
      };

      // -----------------------------------------------------
      // CREATE / UPDATE
      // -----------------------------------------------------

      if (editingId) {

        await updateCalibration(
          editingId,
          payload
        );

        setSuccess(
          "Calibration updated successfully."
        );

      } else {

        await createCalibration(
          payload
        );

        setSuccess(
          "Calibration created successfully."
        );
      }

      setShowModal(false);

      resetForm();

      await loadData();

    } catch (err) {

      console.error(
        "Calibration save error:",
        err
      );

      setError(
        err?.response?.data ||
        err?.message ||
        "Failed to save calibration."
      );
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (id) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this calibration record?"
      );

    if (!confirmed) {
      return;
    }

    try {

      setError("");
      setSuccess("");

      await deleteCalibration(id);

      setSuccess(
        "Calibration deleted successfully."
      );

      await loadData();

      setHistory([]);

    } catch (err) {

      console.error(
        "Delete calibration error:",
        err
      );

      setError(
        err?.response?.data ||
        "Failed to delete calibration."
      );
    }
  };

  // =========================================================
  // EQUIPMENT HISTORY
  // =========================================================

  const loadHistory = async (equipmentId) => {

    if (!equipmentId) {

      setHistory([]);

      setSelectedEquipmentId("");

      return;
    }

    try {

      setHistoryLoading(true);
      setError("");

      const data =
        await getCalibrationsByEquipment(
          equipmentId
        );

      setHistory(
        Array.isArray(data)
          ? data
          : []
      );

      setSelectedEquipmentId(
        equipmentId
      );

    } catch (err) {

      console.error(
        "History loading error:",
        err
      );

      setError(
        "Failed to load calibration history."
      );

    } finally {

      setHistoryLoading(false);
    }
  };

  // =========================================================
  // EQUIPMENT NAME
  // =========================================================

  const getEquipmentName = (item) => {

    if (!item) {
      return "N/A";
    }

    return (
      item.name ||
      item.equipmentName ||
      `Equipment #${item.id}`
    );
  };

  // =========================================================
  // CALIBRATION STATUS
  // =========================================================

  const getCalibrationStatus = (nextDate) => {

    if (!nextDate) {
      return "NO DATE";
    }

    const today = new Date();
    const date = new Date(nextDate);

    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date < today) {
      return "EXPIRED";
    }

    const difference =
      date.getTime() -
      today.getTime();

    const days =
      Math.ceil(
        difference /
        (1000 * 60 * 60 * 24)
      );

    if (days <= 30) {
      return "UPCOMING";
    }

    return "VALID";
  };

  // =========================================================
  // CERTIFICATION STATUS
  // =========================================================

  const getCertificationStatus = (expiryDate) => {

    if (!expiryDate) {
      return "NO DATE";
    }

    const today = new Date();
    const date = new Date(expiryDate);

    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date < today) {
      return "EXPIRED";
    }

    const difference =
      date.getTime() -
      today.getTime();

    const days =
      Math.ceil(
        difference /
        (1000 * 60 * 60 * 24)
      );

    if (days <= 30) {
      return "UPCOMING";
    }

    return "VALID";
  };

  // =========================================================
  // TASK 2.11
  // GET DAYS UNTIL DATE
  // =========================================================

  const getDaysUntil = (dateValue) => {

    if (!dateValue) {
      return null;
    }

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const targetDate =
      new Date(dateValue);

    targetDate.setHours(
      0,
      0,
      0,
      0
    );

    const difference =
      targetDate.getTime() -
      today.getTime();

    return Math.ceil(
      difference /
      (1000 * 60 * 60 * 24)
    );
  };

  // =========================================================
  // TASK 2.11
  // CALIBRATION REMINDER STATUS
  // =========================================================

  const getCalibrationReminderStatus = (
    dateValue
  ) => {

    const days =
      getDaysUntil(dateValue);

    if (days === null) {
      return "NO DATE";
    }

    if (days < 0) {
      return "EXPIRED";
    }

    if (days <= 30) {
      return "DUE SOON";
    }

    return "VALID";
  };


  // =========================================================
  // TASK 2.11
  // REMINDER MESSAGE
  // =========================================================

  const getReminderMessage = (
    type,
    dateValue
  ) => {

    const days =
      getDaysUntil(dateValue);

    if (days === null) {

      return (
        `No ${type.toLowerCase()} date available.`
      );
    }

    if (days < 0) {

      const overdueDays =
        Math.abs(days);

      return (
        `${type} expired ${overdueDays} day${
          overdueDays === 1
            ? ""
            : "s"
        } ago.`
      );
    }

    if (days === 0) {

      return (
        `${type} is due today.`
      );
    }

    return (
      `${type} is due in ${days} day${
        days === 1
          ? ""
          : "s"
      }.`
    );
  };

  // =========================================================
  // TASK 2.11
  // BUILD RENEWAL REMINDERS
  // =========================================================

  const getRenewalReminders = () => {

    const reminders = [];

    calibrations.forEach(
      (calibration) => {

        const equipmentName =
          getEquipmentName(
            calibration.equipment
          );

        // ===================================================
        // CALIBRATION REMINDER
        // ===================================================

        const calibrationDays =
          getDaysUntil(
            calibration.nextCalibrationDate
          );

        if (
          calibrationDays !== null &&
          calibrationDays <= 30
        ) {

          reminders.push({

            id:
              `calibration-${calibration.id}`,

            calibrationId:
              calibration.id,

            type:
              "CALIBRATION",

            title:
              calibrationDays < 0
                ? "Calibration Expired"
                : "Calibration Due Soon",

            equipment:
              equipmentName,

            date:
              calibration.nextCalibrationDate,

            days:
              calibrationDays,

            status:
              calibrationDays < 0
                ? "EXPIRED"
                : "DUE SOON",

            message:
              getReminderMessage(
                "Calibration",
                calibration.nextCalibrationDate
              ),

            certificateNumber:
              calibration.certificateNumber ||
              "N/A",

          });

        }

        // ===================================================
        // CERTIFICATION REMINDER
        // ===================================================

        const certificationDays =
          getDaysUntil(
            calibration.certificationExpiryDate
          );

        if (
          certificationDays !== null &&
          certificationDays <= 30
        ) {

          reminders.push({

            id:
              `certification-${calibration.id}`,

            calibrationId:
              calibration.id,

            type:
              "CERTIFICATION",

            title:
              certificationDays < 0
                ? "Certification Expired"
                : "Certification Expiring Soon",

            equipment:
              equipmentName,

            date:
              calibration.certificationExpiryDate,

            days:
              certificationDays,

            status:
              certificationDays < 0
                ? "EXPIRED"
                : "EXPIRING SOON",

            message:
              getReminderMessage(
                "Certification",
                calibration.certificationExpiryDate
              ),

            certificateNumber:
              calibration.certificateNumber ||
              "N/A",

          });

        }

      }
    );

    // =======================================================
    // SORT
    // Most urgent / expired items appear first
    // =======================================================

    reminders.sort(
      (a, b) => a.days - b.days
    );

    return reminders;
  };

  // =========================================================
  // TASK 2.11
  // RENEWAL REMINDERS DATA
  // =========================================================

  const renewalReminders =
    getRenewalReminders();

  const expiredReminders =
    renewalReminders.filter(
      (item) =>
        item.status === "EXPIRED"
    );

  const upcomingReminders =
    renewalReminders.filter(
      (item) =>
        item.status === "DUE SOON" ||
        item.status === "EXPIRING SOON"
    );

  const calibrationReminders =
    renewalReminders.filter(
      (item) =>
        item.type === "CALIBRATION"
    );

  const certificationReminders =
    renewalReminders.filter(
      (item) =>
        item.type === "CERTIFICATION"
    );

  const displayedReminders =
    showAllReminders
      ? renewalReminders
      : renewalReminders.slice(0, 6);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="calibration-page">

        <h2>
          Calibration Management
        </h2>

        <p>
          Loading calibration records...
        </p>

      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (

    <div className="calibration-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="calibration-header">

        <div>

          <h2>
            Calibration Management
          </h2>

          <p>
            Manage equipment calibration,
            certification and history.
          </p>

        </div>

        <button
          className="primary-button"
          onClick={openCreateModal}
        >
          + Add Calibration
        </button>

      </div>

      {/* =====================================================
          ALERTS
      ====================================================== */}

      {error && (
        <div className="alert error-alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert success-alert">
          {success}
        </div>
      )}

      {/* =====================================================
          TASK 2.11 - RENEWAL REMINDER SUMMARY
      ====================================================== */}

      <div className="calibration-card renewal-summary-card">

        <div className="section-header">

          <div>

            <h3>
              Renewal Reminders
            </h3>

            <p>
              Calibration and certification
              renewal alerts.
            </p>

          </div>

          <span>
            {renewalReminders.length} Alerts
          </span>

        </div>

        <div className="reminder-summary-grid">

          {/* Total */}

          <div className="reminder-summary-item">

            <div className="reminder-summary-icon">
              🔔
            </div>

            <div>

              <span>
                Total Alerts
              </span>

              <strong>
                {renewalReminders.length}
              </strong>

            </div>

          </div>

          {/* Expired */}

          <div className="reminder-summary-item expired-summary">

            <div className="reminder-summary-icon">
              ⚠
            </div>

            <div>

              <span>
                Expired
              </span>

              <strong>
                {expiredReminders.length}
              </strong>

            </div>

          </div>

          {/* Upcoming */}

          <div className="reminder-summary-item upcoming-summary">

            <div className="reminder-summary-icon">
              ⏰
            </div>

            <div>

              <span>
                Due Soon
              </span>

              <strong>
                {upcomingReminders.length}
              </strong>

            </div>

          </div>

          {/* Calibration */}

          <div className="reminder-summary-item">

            <div className="reminder-summary-icon">
              🛠
            </div>

            <div>

              <span>
                Calibration
              </span>

              <strong>
                {calibrationReminders.length}
              </strong>

            </div>

          </div>

          {/* Certification */}

          <div className="reminder-summary-item">

            <div className="reminder-summary-icon">
              📜
            </div>

            <div>

              <span>
                Certification
              </span>

              <strong>
                {certificationReminders.length}
              </strong>

            </div>

          </div>

        </div>

      </div>

      

      {/* =====================================================
          CALIBRATION RECORDS
      ====================================================== */}

      <div className="calibration-card">

        <div className="section-header">

          <h3>
            Calibration Records
          </h3>

          <span>
            {calibrations.length} Records
          </span>

        </div>

        <div className="table-container">

          <table className="calibration-table">

            <thead>

              <tr>

                <th>ID</th>
                <th>Equipment</th>
                <th>Last Calibration</th>
                <th>Next Calibration</th>
                <th>Calibration Status</th>
                <th>Certificate</th>
                <th>Certification Expiry</th>
                <th>Certification Status</th>
                <th>Certification</th>
                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {calibrations.length === 0 ? (

                <tr>

                  <td
                    colSpan="10"
                    className="empty-cell"
                  >
                    No calibration records found.
                  </td>

                </tr>

              ) : (

                calibrations.map(
                  (calibration) => (

                    <tr
                      key={calibration.id}
                    >

                      <td>
                        #{calibration.id}
                      </td>

                      <td>
                        {getEquipmentName(
                          calibration.equipment
                        )}
                      </td>

                      <td>
                        {calibration.lastCalibrationDate ||
                          "N/A"}
                      </td>

                      <td>
                        {calibration.nextCalibrationDate ||
                          "N/A"}
                      </td>

                      <td>

                        <span
                          className={`status-badge ${getCalibrationStatus(
                            calibration.nextCalibrationDate
                          ).toLowerCase().replace(" ", "-")}`}
                        >
                          {getCalibrationStatus(
                            calibration.nextCalibrationDate
                          )}
                        </span>

                      </td>

                      <td>
                        {calibration.certificateNumber ||
                          "N/A"}
                      </td>

                      <td>
                        {calibration.certificationExpiryDate ||
                          "N/A"}
                      </td>

                      <td>

                        <span
                          className={`status-badge ${getCertificationStatus(
                            calibration.certificationExpiryDate
                          ).toLowerCase().replace(" ", "-")}`}
                        >
                          {getCertificationStatus(
                            calibration.certificationExpiryDate
                          )}
                        </span>

                      </td>

                      <td>

                        <button
                          type="button"
                          className="view-certification-button"
                          onClick={() =>
                            openCertificationDetails(
                              calibration
                            )
                          }
                        >
                          View Details
                        </button>

                      </td>

                      <td>

                        <div className="action-buttons">

                          <button
                            type="button"
                            className="edit-button"
                            onClick={() =>
                              openEditModal(
                                calibration
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              handleDelete(
                                calibration.id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          TASK 2.10 - CERTIFICATION DETAILS SECTION
      ====================================================== */}

      <div className="calibration-card certification-section">

        <div className="section-header">

          <div>

            <h3>
              Certification Details
            </h3>

            <p>
              Review certification information
              associated with calibration records.
            </p>

          </div>

          <span>

            {
              calibrations.filter(
                (item) =>
                  item.certificateNumber ||
                  item.certificationDetails ||
                  item.certificationExpiryDate
              ).length
            } Certifications

          </span>

        </div>

        {calibrations.length === 0 ? (

          <div className="empty-cell">
            No certification records available.
          </div>

        ) : (

          <div className="certification-grid">

            {calibrations.map(
              (calibration) => (

                <div
                  className="certification-card"
                  key={calibration.id}
                >

                  <div className="certification-card-header">

                    <div>

                      <span className="certification-label">
                        Certificate
                      </span>

                      <h4>
                        {calibration.certificateNumber ||
                          "Not Available"}
                      </h4>

                    </div>

                    <span
                      className={`status-badge ${getCertificationStatus(
                        calibration.certificationExpiryDate
                      ).toLowerCase().replace(" ", "-")}`}
                    >
                      {getCertificationStatus(
                        calibration.certificationExpiryDate
                      )}
                    </span>

                  </div>

                  <div className="certification-info">

                    <div className="certification-info-row">

                      <span>
                        Equipment
                      </span>

                      <strong>
                        {getEquipmentName(
                          calibration.equipment
                        )}
                      </strong>

                    </div>

                    <div className="certification-info-row">

                      <span>
                        Expiry Date
                      </span>

                      <strong>
                        {calibration.certificationExpiryDate ||
                          "N/A"}
                      </strong>

                    </div>

                    <div className="certification-info-row">

                      <span>
                        Performed By
                      </span>

                      <strong>
                        {calibration.performedBy ||
                          "N/A"}
                      </strong>

                    </div>

                  </div>

                  <div className="certification-details-preview">

                    <span>
                      Certification Details
                    </span>

                    <p>
                      {calibration.certificationDetails ||
                        "No certification details available."}
                    </p>

                  </div>

                  <button
                    type="button"
                    className="view-certification-button full-width"
                    onClick={() =>
                      openCertificationDetails(
                        calibration
                      )
                    }
                  >
                    View Certification
                  </button>

                </div>

              )
            )}

          </div>

        )}

      </div>


    

{/* =====================================================
    TASK 2.11.2 - RENEWAL ALERTS
====================================================== */}

<div className="calibration-card renewal-alerts-section">

  <div className="section-header">

    <div>
      <h3>
        Renewal Alerts
      </h3>

      <p>
        Calibration and certification renewal
        reminders requiring attention.
      </p>
    </div>

    <span>
      {renewalReminders.length} Alerts
    </span>

  </div>

  {/* ===================================================
      NO ALERTS
  ==================================================== */}

  {renewalReminders.length === 0 ? (

    <div className="no-renewal-alerts">

      <div className="no-alert-icon">
        ✓
      </div>

      <h4>
        No Renewal Alerts
      </h4>

      <p>
        All calibration and certification records
        are currently up to date.
      </p>

    </div>

  ) : (

    <>
      {/* =================================================
          RENEWAL ALERT CARDS
      ================================================== */}

      <div className="renewal-alerts-grid">

        {displayedReminders.map(
          (reminder) => (

            <div
              className={`renewal-alert-card ${
                reminder.status === "EXPIRED"
                  ? "renewal-alert-expired"
                  : "renewal-alert-upcoming"
              }`}
              key={reminder.id}
            >

              {/* =========================================
                  ALERT HEADER
              ========================================== */}

              <div className="renewal-alert-header">

                <div className="renewal-alert-title">

                  <span className="renewal-alert-type">
                    {reminder.type}
                  </span>

                  <h4>
                    {reminder.title}
                  </h4>

                </div>

                <span
                  className={`renewal-alert-status ${
                    reminder.status === "EXPIRED"
                      ? "expired"
                      : reminder.status === "DUE SOON"
                      ? "due-soon"
                      : "expiring-soon"
                  }`}
                >
                  {reminder.status}
                </span>

              </div>

              {/* =========================================
                  ALERT INFORMATION
              ========================================== */}

              <div className="renewal-alert-info">

                <div className="renewal-alert-info-item">

                  <span>
                    Equipment
                  </span>

                  <strong>
                    {reminder.equipment}
                  </strong>

                </div>

                <div className="renewal-alert-info-item">

                  <span>
                    Renewal Date
                  </span>

                  <strong>
                    {reminder.date || "N/A"}
                  </strong>

                </div>

                <div className="renewal-alert-info-item">

                  <span>
                    Certificate Number
                  </span>

                  <strong>
                    {reminder.certificateNumber}
                  </strong>

                </div>

              </div>

              {/* =========================================
                  REMINDER MESSAGE
              ========================================== */}

              <div className="renewal-alert-message">

                <span>
                  {reminder.message}
                </span>

              </div>

              {/* =========================================
                  VIEW DETAILS
              ========================================== */}

              <button
                type="button"
                className="renewal-alert-button"
                onClick={() => {

                  const calibration =
                    calibrations.find(
                      (item) =>
                        item.id ===
                        reminder.calibrationId
                    );

                  if (calibration) {

                    openCertificationDetails(
                      calibration
                    );

                  }

                }}
              >
                View Details
              </button>

            </div>

          )
        )}

      </div>

      {/* =================================================
          SHOW ALL / SHOW LESS
      ================================================== */}

      {renewalReminders.length > 6 && (

        <div className="renewal-alerts-footer">

          <button
            type="button"
            className="renewal-show-more-button"
            onClick={() =>
              setShowAllReminders(
                (previous) => !previous
              )
            }
          >

            {showAllReminders
              ? "Show Less"
              : `Show All Alerts (${renewalReminders.length})`}

          </button>

        </div>

      )}

    </>

  )}

</div>


      {/* =====================================================
          CALIBRATION HISTORY
      ====================================================== */}

      <div className="calibration-card history-card">

        <div className="section-header">

          <div>

            <h3>
              Calibration History
            </h3>

            <p>
              View calibration history for
              selected equipment.
            </p>

          </div>

        </div>

        <div className="history-selector">

          <select
            value={selectedEquipmentId}
            onChange={(e) =>
              loadHistory(
                e.target.value
              )
            }
          >

            <option value="">
              Select Equipment
            </option>

            {equipment.map(
              (item) => (

                <option
                  key={item.id}
                  value={item.id}
                >
                  {getEquipmentName(item)}
                </option>

              )
            )}

          </select>

        </div>

        {historyLoading ? (

          <p>
            Loading history...
          </p>

        ) : history.length === 0 ? (

          <p className="empty-history">
            Select equipment to view
            calibration history.
          </p>

        ) : (

          <div className="history-list">

            {history.map(
              (item) => (

                <div
                  className="history-item"
                  key={item.id}
                >

                  <div>

                    <strong>
                      Calibration #{item.id}
                    </strong>

                    <p>
                      Last Calibration:{" "}
                      {item.lastCalibrationDate ||
                        "N/A"}
                    </p>

                    <p>
                      Next Calibration:{" "}
                      {item.nextCalibrationDate ||
                        "N/A"}
                    </p>

                  </div>

                  <div>

                    <p>
                      Certificate:{" "}
                      {item.certificateNumber ||
                        "N/A"}
                    </p>

                    <p>
                      Certification Expiry:{" "}
                      {item.certificationExpiryDate ||
                        "N/A"}
                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

      {/* =====================================================
          CREATE / EDIT CALIBRATION MODAL
      ====================================================== */}

      {showModal && (

        <div className="modal-overlay">

          <div className="calibration-modal">

            <div className="modal-header">

              <h3>
                {editingId
                  ? "Edit Calibration"
                  : "Add Calibration"}
              </h3>

              <button
                type="button"
                className="close-button"
                onClick={() => {

                  setShowModal(false);

                  resetForm();

                }}
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="calibration-form"
            >

              {/* Equipment */}

              <div className="form-group">

                <label>
                  Equipment *
                </label>

                <select
                  name="equipmentId"
                  value={formData.equipmentId}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Equipment
                  </option>

                  {equipment.map(
                    (item) => (

                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {getEquipmentName(item)}
                      </option>

                    )
                  )}

                </select>

              </div>

              {/* Calibration Dates */}

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Last Calibration Date
                  </label>

                  <input
                    type="date"
                    name="lastCalibrationDate"
                    value={
                      formData.lastCalibrationDate
                    }
                    onChange={handleChange}
                  />

                </div>

                <div className="form-group">

                  <label>
                    Next Calibration Date
                  </label>

                  <input
                    type="date"
                    name="nextCalibrationDate"
                    value={
                      formData.nextCalibrationDate
                    }
                    min={
                      formData.lastCalibrationDate ||
                      undefined
                    }
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* Certificate Number */}

              <div className="form-group">

                <label>
                  Certificate Number
                </label>

                <input
                  type="text"
                  name="certificateNumber"
                  value={
                    formData.certificateNumber
                  }
                  onChange={handleChange}
                  placeholder="Certificate number"
                />

              </div>

              {/* Certification Details */}

              <div className="form-group">

                <label>
                  Certification Details
                </label>

                <textarea
                  name="certificationDetails"
                  value={
                    formData.certificationDetails
                  }
                  onChange={handleChange}
                  placeholder="Certification details"
                  rows="3"
                />

              </div>

              {/* Certification Expiry */}

              <div className="form-group">

                <label>
                  Certification Expiry Date
                </label>

                <input
                  type="date"
                  name="certificationExpiryDate"
                  value={
                    formData.certificationExpiryDate
                  }
                  min={
                    formData.lastCalibrationDate ||
                    undefined
                  }
                  onChange={handleChange}
                />

              </div>

              {/* Performed By */}

              <div className="form-group">

                <label>
                  Performed By
                </label>

                <input
                  type="text"
                  name="performedBy"
                  value={
                    formData.performedBy
                  }
                  onChange={handleChange}
                  placeholder="Technician / Organization"
                />

              </div>

              {/* Remarks */}

              <div className="form-group">

                <label>
                  Remarks
                </label>

                <textarea
                  name="remarks"
                  value={
                    formData.remarks
                  }
                  onChange={handleChange}
                  placeholder="Additional remarks"
                  rows="3"
                />

              </div>

              {/* Modal Buttons */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {

                    setShowModal(false);

                    resetForm();

                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  {editingId
                    ? "Update Calibration"
                    : "Create Calibration"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          TASK 2.10 - CERTIFICATION DETAILS MODAL
      ====================================================== */}

      {showCertificationModal &&
        selectedCertification && (

        <div
          className="modal-overlay"
          onClick={
            closeCertificationDetails
          }
        >

          <div
            className="certification-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Modal Header */}

            <div className="modal-header">

              <div>

                <span className="modal-subtitle">
                  Certification Record
                </span>

                <h3>
                  Certification Details
                </h3>

              </div>

              <button
                type="button"
                className="close-button"
                onClick={
                  closeCertificationDetails
                }
              >
                ×
              </button>

            </div>

            {/* Certification Content */}

            <div className="certification-detail-content">

              {/* Certificate Summary */}

              <div className="certificate-summary">

                <div className="certificate-icon">
                  ✓
                </div>

                <div>

                  <span>
                    Certificate Number
                  </span>

                  <h2>
                    {selectedCertification.certificateNumber ||
                      "Not Available"}
                  </h2>

                </div>

                <span
                  className={`status-badge ${getCertificationStatus(
                    selectedCertification.certificationExpiryDate
                  ).toLowerCase().replace(" ", "-")}`}
                >
                  {getCertificationStatus(
                    selectedCertification.certificationExpiryDate
                  )}
                </span>

              </div>

              {/* Certification Information */}

              <div className="certification-detail-grid">

                <div className="detail-item">

                  <span>
                    Equipment
                  </span>

                  <strong>
                    {getEquipmentName(
                      selectedCertification.equipment
                    )}
                  </strong>

                </div>

                <div className="detail-item">

                  <span>
                    Certificate Number
                  </span>

                  <strong>
                    {selectedCertification.certificateNumber ||
                      "N/A"}
                  </strong>

                </div>

                <div className="detail-item">

                  <span>
                    Certification Expiry
                  </span>

                  <strong>
                    {selectedCertification.certificationExpiryDate ||
                      "N/A"}
                  </strong>

                </div>

                <div className="detail-item">

                  <span>
                    Performed By
                  </span>

                  <strong>
                    {selectedCertification.performedBy ||
                      "N/A"}
                  </strong>

                </div>

                <div className="detail-item">

                  <span>
                    Last Calibration
                  </span>

                  <strong>
                    {selectedCertification.lastCalibrationDate ||
                      "N/A"}
                  </strong>

                </div>

                <div className="detail-item">

                  <span>
                    Next Calibration
                  </span>

                  <strong>
                    {selectedCertification.nextCalibrationDate ||
                      "N/A"}
                  </strong>

                </div>

              </div>

              {/* Certification Details */}

              <div className="certification-description">

                <h4>
                  Certification Details
                </h4>

                <p>
                  {selectedCertification.certificationDetails ||
                    "No certification details available."}
                </p>

              </div>

              {/* Remarks */}

              <div className="certification-description">

                <h4>
                  Remarks
                </h4>

                <p>
                  {selectedCertification.remarks ||
                    "No remarks available."}
                </p>

              </div>

            </div>

            {/* Modal Footer */}

            <div className="modal-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={
                  closeCertificationDetails
                }
              >
                Close
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={() => {

                  const certification =
                    selectedCertification;

                  closeCertificationDetails();

                  openEditModal(
                    certification
                  );

                }}
              >
                Edit Certification
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default CalibrationManagement;