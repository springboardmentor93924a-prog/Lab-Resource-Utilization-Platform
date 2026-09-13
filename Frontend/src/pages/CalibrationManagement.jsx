import React, { useEffect, useMemo, useState } from "react";

import {
  createCalibration,
  getAllCalibrations,
  updateCalibration,
  deleteCalibration,
  getCalibrationsByEquipment,
} from "../services/calibrationApi";

import api from "../services/api";

import "./CalibrationManagement.css";

const varOcg = {
  upcomingDays: 30,
};

const emptyForm = {
  id: "",
  equipmentId: "",
  lastCalibrationDate: "",
  nextCalibrationDate: "",
  certificateNumber: "",
  certificationDetails: "",
  certificationExpiryDate: "",
  performedBy: "",
  remarks: "",
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

const getToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
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
    (nextDate.getTime() - today.getTime()) /
    (1000 * 60 * 60 * 24);

  if (difference < 0) return "Expired";

  if (difference <= varOcg.upcomingDays) {
    return "Upcoming";
  }

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

  const expiryDate = parseDate(
    calibration.certificationExpiryDate
  );

  if (!expiryDate) return "No Expiry";

  const difference =
    (expiryDate.getTime() - today.getTime()) /
    (1000 * 60 * 60 * 24);

  if (difference < 0) return "Expired";

  if (difference <= varOcg.upcomingDays) {
    return "Expiring Soon";
  }

  return "Valid";
};

/* =========================================================
   CALIBRATION MANAGEMENT
========================================================= */

function CalibrationManagementView() {
  const [calibrations, setCalibrations] = useState([]);
  const [equipment, setEquipment] = useState([]);

  const [loading, setLoading] = useState(true);
  const [equipmentLoading, setEquipmentLoading] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadCalibrations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllCalibrations();

      setCalibrations(normalizeArray(response));
    } catch (err) {
      console.error("Calibration management error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load calibration records."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadEquipment = async () => {
    try {
      setEquipmentLoading(true);

      const response = await api.get("/equipment");

      setEquipment(normalizeArray(response));
    } catch (err) {
      console.error("Equipment loading error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load equipment."
      );
    } finally {
      setEquipmentLoading(false);
    }
  };

  useEffect(() => {
    loadCalibrations();
    loadEquipment();
  }, []);

  const statistics = useMemo(() => {
    const total = calibrations.length;

    const upcoming = calibrations.filter(
      (item) => getCalibrationStatus(item) === "Upcoming"
    ).length;

    const expired = calibrations.filter(
      (item) => getCalibrationStatus(item) === "Expired"
    ).length;

    const valid = calibrations.filter(
      (item) => getCalibrationStatus(item) === "Valid"
    ).length;

    return {
      total,
      upcoming,
      expired,
      valid,
    };
  }, [calibrations]);

  const openCreateModal = () => {
    setEditing(false);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (calibration) => {
    setEditing(true);

    setForm({
      id: calibration.id || "",
      equipmentId: calibration?.equipment?.id || "",
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
      performedBy: calibration.performedBy || "",
      remarks: calibration.remarks || "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditing(false);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.equipmentId) {
      setError("Please select equipment.");
      return;
    }

    if (!form.lastCalibrationDate) {
      setError("Please select last calibration date.");
      return;
    }

    if (!form.nextCalibrationDate) {
      setError("Please select next calibration date.");
      return;
    }

    const lastDate = parseDate(form.lastCalibrationDate);
    const nextDate = parseDate(form.nextCalibrationDate);

    if (lastDate && nextDate && nextDate < lastDate) {
      setError(
        "Next calibration date cannot be before last calibration date."
      );
      return;
    }

    if (form.certificationExpiryDate) {
      const certificationExpiry = parseDate(
        form.certificationExpiryDate
      );

      if (
        certificationExpiry &&
        lastDate &&
        certificationExpiry < lastDate
      ) {
        setError(
          "Certification expiry date cannot be before last calibration date."
        );
        return;
      }
    }

    const payload = {
      ...(editing && form.id
        ? { id: form.id }
        : {}),

      equipment: {
        id: Number(form.equipmentId),
      },

      lastCalibrationDate:
        form.lastCalibrationDate,

      nextCalibrationDate:
        form.nextCalibrationDate,

      certificateNumber:
        form.certificateNumber.trim() || null,

      certificationDetails:
        form.certificationDetails.trim() || null,

      certificationExpiryDate:
        form.certificationExpiryDate || null,

      performedBy:
        form.performedBy.trim() || null,

      remarks:
        form.remarks.trim() || null,
    };

    try {
      setSaving(true);

      if (editing) {
        await updateCalibration(form.id, payload);

        setSuccess(
          "Calibration record updated successfully."
        );
      } else {
        await createCalibration(payload);

        setSuccess(
          "Calibration record created successfully."
        );
      }

      setShowModal(false);
      setEditing(false);
      setForm(emptyForm);

      await loadCalibrations();
    } catch (err) {
      console.error("Save calibration error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to save calibration record."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await deleteCalibration(deleteTarget.id);

      setSuccess(
        "Calibration record deleted successfully."
      );

      setDeleteTarget(null);

      await loadCalibrations();
    } catch (err) {
      console.error("Delete calibration error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to delete calibration record."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading || equipmentLoading) {
    return (
      <div className="calibration-management-page">
        <div className="management-loading">
          Loading calibration management...
        </div>
      </div>
    );
  }

  return (
    <div className="calibration-management-page">
      <div className="management-header">
        <div>
          <h1>Calibration Management</h1>
          <p>
            Create, update and manage equipment calibration
            records.
          </p>
        </div>

        <button
          className="management-add-btn"
          onClick={openCreateModal}
        >
          + Add Calibration
        </button>
      </div>

      {success && (
        <div className="management-success">
          {success}
        </div>
      )}

      {error && (
        <div className="management-error">
          {error}
        </div>
      )}

      <div className="management-summary-grid">
        <div className="management-summary-card">
          <span>Total Records</span>
          <strong>{statistics.total}</strong>
        </div>

        <div className="management-summary-card">
          <span>Valid</span>
          <strong>{statistics.valid}</strong>
        </div>

        <div className="management-summary-card">
          <span>Upcoming</span>
          <strong>{statistics.upcoming}</strong>
        </div>

        <div className="management-summary-card">
          <span>Expired</span>
          <strong>{statistics.expired}</strong>
        </div>
      </div>

      <div className="management-table-wrapper">
        <table className="management-table">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Last Calibration</th>
              <th>Next Calibration</th>
              <th>Status</th>
              <th>Certificate</th>
              <th>Certificate Expiry</th>
              <th>Performed By</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {calibrations.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="management-empty"
                >
                  No calibration records available.
                </td>
              </tr>
            ) : (
              calibrations.map((item) => {
                const status =
                  getCalibrationStatus(item);

                return (
                  <tr key={item.id}>
                    <td>
                      <strong>{getEquipmentName(item)}</strong>
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
                        className={`management-status ${status
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {status}
                      </span>
                    </td>

                    <td>
                      {item.certificateNumber || "-"}
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
                      {item.remarks || "-"}
                    </td>

                    <td>
                      <div className="management-actions">
                        <button
                          className="management-edit-btn"
                          onClick={() =>
                            openEditModal(item)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="management-delete-btn"
                          onClick={() =>
                            setDeleteTarget(item)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="management-modal-overlay">
          <div className="management-modal">
            <div className="management-modal-header">
              <div>
                <h2>
                  {editing
                    ? "Edit Calibration"
                    : "Add Calibration"}
                </h2>

                <p>
                  Enter calibration and certification details.
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
              >
                ✕
              </button>
            </div>

            <form
              className="management-form"
              onSubmit={handleSubmit}
            >
              <div className="management-form-grid">
                <div className="management-form-group">
                  <label>Equipment *</label>

                  <select
                    name="equipmentId"
                    value={form.equipmentId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select Equipment
                    </option>

                    {equipment.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name ||
                          item.equipmentName ||
                          `Equipment #${item.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="management-form-group">
                  <label>Last Calibration Date *</label>

                  <input
                    type="date"
                    name="lastCalibrationDate"
                    value={form.lastCalibrationDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="management-form-group">
                  <label>Next Calibration Date *</label>

                  <input
                    type="date"
                    name="nextCalibrationDate"
                    value={form.nextCalibrationDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="management-form-group">
                  <label>Certificate Number</label>

                  <input
                    type="text"
                    name="certificateNumber"
                    value={form.certificateNumber}
                    onChange={handleChange}
                    placeholder="Enter certificate number"
                  />
                </div>

                <div className="management-form-group">
                  <label>Certification Expiry Date</label>

                  <input
                    type="date"
                    name="certificationExpiryDate"
                    value={form.certificationExpiryDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="management-form-group">
                  <label>Performed By</label>

                  <input
                    type="text"
                    name="performedBy"
                    value={form.performedBy}
                    onChange={handleChange}
                    placeholder="Technician / organization"
                  />
                </div>

                <div className="management-form-group full-width">
                  <label>Certification Details</label>

                  <textarea
                    name="certificationDetails"
                    value={form.certificationDetails}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter certification details"
                  />
                </div>

                <div className="management-form-group full-width">
                  <label>Remarks</label>

                  <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter remarks"
                  />
                </div>
              </div>

              <div className="management-form-actions">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editing
                    ? "Update Calibration"
                    : "Save Calibration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="management-modal-overlay">
          <div className="delete-confirm-modal">
            <h2>Delete Calibration?</h2>

            <p>
              Are you sure you want to delete the calibration
              record for{" "}
              <strong>
                {getEquipmentName(deleteTarget)}
              </strong>
              ?
            </p>

            <div className="delete-confirm-actions">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   CALIBRATION HISTORY
========================================================= */

function CalibrationHistoryView() {
  const [calibrations, setCalibrations] = useState([]);
  const [equipmentHistory, setEquipmentHistory] =
    useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedCalibration, setSelectedCalibration] =
    useState(null);

  const [selectedEquipmentId, setSelectedEquipmentId] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] =
    useState(false);

  const [error, setError] = useState("");

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllCalibrations();

      setCalibrations(normalizeArray(response));
    } catch (err) {
      console.error("Calibration history error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load calibration history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredCalibrations = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return calibrations.filter((item) => {
      const calibrationStatus =
        getCalibrationStatus(item);

      const certificationStatus =
        getCertificationStatus(item);

      let matchesStatus = true;

      if (statusFilter === "Valid") {
        matchesStatus = calibrationStatus === "Valid";
      }

      if (statusFilter === "Upcoming") {
        matchesStatus = calibrationStatus === "Upcoming";
      }

      if (statusFilter === "Expired") {
        matchesStatus = calibrationStatus === "Expired";
      }

      if (statusFilter === "Certification Expiring") {
        matchesStatus =
          certificationStatus === "Expiring Soon";
      }

      const equipmentName =
        getEquipmentName(item).toLowerCase();

      const equipmentId =
        String(getEquipmentId(item)).toLowerCase();

      const certificate = (
        item.certificateNumber || ""
      ).toLowerCase();

      const performedBy = (
        item.performedBy || ""
      ).toLowerCase();

      const matchesSearch =
        !search ||
        equipmentName.includes(search) ||
        equipmentId.includes(search) ||
        certificate.includes(search) ||
        performedBy.includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [calibrations, searchTerm, statusFilter]);

  const statistics = useMemo(() => {
    return {
      total: calibrations.length,

      upcoming: calibrations.filter(
        (item) =>
          getCalibrationStatus(item) === "Upcoming"
      ).length,

      expired: calibrations.filter(
        (item) =>
          getCalibrationStatus(item) === "Expired"
      ).length,

      valid: calibrations.filter(
        (item) =>
          getCalibrationStatus(item) === "Valid"
      ).length,

      certificates: calibrations.filter(
        (item) => item.certificateNumber
      ).length,

      expiredCertificates: calibrations.filter(
        (item) =>
          getCertificationStatus(item) === "Expired"
      ).length,
    };
  }, [calibrations]);

  const handleEquipmentHistory = async (equipmentId) => {
    setSelectedEquipmentId(equipmentId);

    if (!equipmentId) {
      setEquipmentHistory([]);
      return;
    }

    try {
      setHistoryLoading(true);

      const response =
        await getCalibrationsByEquipment(
          Number(equipmentId)
        );

      const records = normalizeArray(response);

      setEquipmentHistory(records);
    } catch (err) {
      console.error(
        "Equipment history loading error:",
        err
      );

      const fallback = calibrations.filter(
        (item) =>
          String(item?.equipment?.id) ===
          String(equipmentId)
      );

      setEquipmentHistory(fallback);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="calibration-history-page">
        <div className="history-loading">
          Loading calibration history...
        </div>
      </div>
    );
  }

  return (
    <div className="calibration-history-page">
      <div className="history-header">
        <div>
          <h1>Calibration History</h1>
          <p>
            View historical calibration and certification
            records for equipment.
          </p>
        </div>

        <button
          className="history-refresh-btn"
          onClick={loadHistory}
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="history-error">
          {error}
        </div>
      )}

      <div className="history-statistics-grid">
        <div className="history-stat-card">
          <span>Total Records</span>
          <strong>{statistics.total}</strong>
        </div>

        <div className="history-stat-card">
          <span>Valid</span>
          <strong>{statistics.valid}</strong>
        </div>

        <div className="history-stat-card">
          <span>Upcoming</span>
          <strong>{statistics.upcoming}</strong>
        </div>

        <div className="history-stat-card">
          <span>Expired</span>
          <strong>{statistics.expired}</strong>
        </div>

        <div className="history-stat-card">
          <span>Certificates</span>
          <strong>{statistics.certificates}</strong>
        </div>

        <div className="history-stat-card">
          <span>Expired Certificates</span>
          <strong>
            {statistics.expiredCertificates}
          </strong>
        </div>
      </div>

      <div className="history-filters">
        <input
          type="text"
          placeholder="Search equipment, ID, certificate or technician..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="All">All Status</option>
          <option value="Valid">Valid</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Expired">Expired</option>
          <option value="Certification Expiring">
            Certification Expiring
          </option>
        </select>

        <select
          value={selectedEquipmentId}
          onChange={(e) =>
            handleEquipmentHistory(e.target.value)
          }
        >
          <option value="">
            Select Equipment History
          </option>

          {[
            ...new Map(
              calibrations
                .filter((item) => item?.equipment?.id)
                .map((item) => [
                  item.equipment.id,
                  item.equipment,
                ])
            ).values(),
          ].map((item) => (
            <option
              key={item.id}
              value={item.id}
            >
              {item.name ||
                item.equipmentName ||
                `Equipment #${item.id}`}
            </option>
          ))}
        </select>
      </div>

      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Last Calibration</th>
              <th>Next Calibration</th>
              <th>Calibration Status</th>
              <th>Certificate</th>
              <th>Certificate Expiry</th>
              <th>Performed By</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredCalibrations.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="history-empty"
                >
                  No calibration history found.
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
                        className={`history-status ${calibrationStatus
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
                      <div>
                        {formatDate(
                          item.certificationExpiryDate
                        )}
                      </div>

                      <small>
                        {certificationStatus}
                      </small>
                    </td>

                    <td>
                      {item.performedBy || "-"}
                    </td>

                    <td>
                      <div className="history-actions">
                        <button
                          className="history-view-btn"
                          onClick={() =>
                            setSelectedCalibration(item)
                          }
                        >
                          View
                        </button>

                        <button
                          className="history-equipment-btn"
                          onClick={() =>
                            handleEquipmentHistory(
                              item?.equipment?.id
                            )
                          }
                        >
                          Equipment
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedEquipmentId && (
        <div className="equipment-history-card">
          <div className="equipment-history-header">
            <div>
              <h2>Equipment Calibration History</h2>
              <p>
                Equipment ID: {selectedEquipmentId}
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedEquipmentId("");
                setEquipmentHistory([]);
              }}
            >
              ✕
            </button>
          </div>

          {historyLoading ? (
            <div className="history-loading">
              Loading equipment history...
            </div>
          ) : equipmentHistory.length === 0 ? (
            <div className="history-empty">
              No calibration history available.
            </div>
          ) : (
            <div className="history-timeline">
              {equipmentHistory.map((record) => (
                <div
                  className="history-timeline-item"
                  key={record.id}
                >
                  <div className="timeline-dot" />

                  <div className="timeline-content">
                    <div className="timeline-date">
                      {formatDate(
                        record.lastCalibrationDate
                      )}
                      {" → "}
                      {formatDate(
                        record.nextCalibrationDate
                      )}
                    </div>

                    <strong>
                      {record.certificateNumber
                        ? `Certificate: ${record.certificateNumber}`
                        : "Calibration Record"}
                    </strong>

                    <span>
                      Performed by:{" "}
                      {record.performedBy || "-"}
                    </span>

                    {record.remarks && (
                      <p>{record.remarks}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedCalibration && (
        <div
          className="history-modal-overlay"
          onClick={() =>
            setSelectedCalibration(null)
          }
        >
          <div
            className="history-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="history-modal-header">
              <div>
                <h2>Calibration Record</h2>
                <p>
                  {getEquipmentName(
                    selectedCalibration
                  )}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedCalibration(null)
                }
              >
                ✕
              </button>
            </div>

            <div className="history-details-grid">
              <div>
                <label>Equipment</label>
                <strong>
                  {getEquipmentName(
                    selectedCalibration
                  )}
                </strong>
              </div>

              <div>
                <label>Equipment ID</label>
                <strong>
                  {getEquipmentId(
                    selectedCalibration
                  )}
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
                  {getCalibrationStatus(
                    selectedCalibration
                  )}
                </strong>
              </div>

              <div>
                <label>Certificate Number</label>
                <strong>
                  {selectedCalibration.certificateNumber ||
                    "-"}
                </strong>
              </div>

              <div>
                <label>Certification Expiry</label>
                <strong>
                  {formatDate(
                    selectedCalibration.certificationExpiryDate
                  )}
                </strong>
              </div>

              <div>
                <label>Certification Status</label>
                <strong>
                  {getCertificationStatus(
                    selectedCalibration
                  )}
                </strong>
              </div>

              <div>
                <label>Performed By</label>
                <strong>
                  {selectedCalibration.performedBy ||
                    "-"}
                </strong>
              </div>
            </div>

            {selectedCalibration.certificationDetails && (
              <div className="history-detail-section">
                <label>Certification Details</label>
                <p>
                  {selectedCalibration.certificationDetails}
                </p>
              </div>
            )}

            {selectedCalibration.remarks && (
              <div className="history-detail-section">
                <label>Remarks</label>
                <p>{selectedCalibration.remarks}</p>
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

export default function CalibrationManagement({
  view = "management",
}) {
  if (view === "history") {
    return <CalibrationHistoryView />;
  }

  return <CalibrationManagementView />;
}