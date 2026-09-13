import React, { useEffect, useMemo, useState } from "react";
import {
  getAllRecoveries,
  createRecovery,
  updateRecoveredAmount,
  markAsRecovered,
  deleteRecovery,
} from "../services/costRecoveryApi";
import api from "../services/api";
import "./CostRecovery.css";

const STATUS_OPTIONS = [
  "PENDING",
  "PARTIAL",
  "RECOVERED",
  "CANCELLED",
];

const emptyForm = {
  costId: "",
  departmentId: "",
  institutionId: "",
  equipmentId: "",
  recoverableAmount: "",
  recoveredAmount: "0",
  recoveryDate: new Date().toISOString().split("T")[0],
  description: "",
};

const getName = (item, fallback = "Unknown") => {
  if (!item) return fallback;

  return (
    item.name ||
    item.departmentName ||
    item.institutionName ||
    item.equipmentName ||
    item.costName ||
    `ID: ${item.id ?? "-"}`
  );
};

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatStatus = (status) => {
  if (!status) return "-";

  return status
    .toLowerCase()
    .replace("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

function CostRecovery() {
  const [recoveries, setRecoveries] = useState([]);
  const [costs, setCosts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [equipment, setEquipment] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [showRecoveredModal, setShowRecoveredModal] = useState(false);

  const [selectedRecovery, setSelectedRecovery] = useState(null);
  const [recoveredAmount, setRecoveredAmount] = useState("");

  const [formData, setFormData] = useState(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD DATA
  // =========================================================
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        recoveryResponse,
        costResponse,
        departmentResponse,
        institutionResponse,
        equipmentResponse,
      ] = await Promise.all([
        getAllRecoveries(),
        api.get("/costs"),
        api.get("/departments"),
        api.get("/institutions"),
        api.get("/equipment"),
      ]);

      setRecoveries(recoveryResponse || []);
      setCosts(costResponse.data || []);
      setDepartments(departmentResponse.data || []);
      setInstitutions(institutionResponse.data || []);
      setEquipment(equipmentResponse.data || []);
    } catch (err) {
      console.error("Cost recovery loading error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load cost recovery data."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SUMMARY
  // =========================================================
  const summary = useMemo(() => {
    const totalRecoverable = recoveries.reduce(
      (sum, item) => sum + Number(item.recoverableAmount || 0),
      0
    );

    const totalRecovered = recoveries.reduce(
      (sum, item) => sum + Number(item.recoveredAmount || 0),
      0
    );

    const outstandingAmount = recoveries.reduce(
      (sum, item) => sum + Number(item.outstandingAmount || 0),
      0
    );

    return {
      totalRecoverable,
      totalRecovered,
      outstandingAmount,
      pending: recoveries.filter(
        (item) => item.chargebackStatus === "PENDING"
      ).length,
      partial: recoveries.filter(
        (item) => item.chargebackStatus === "PARTIAL"
      ).length,
      recovered: recoveries.filter(
        (item) => item.chargebackStatus === "RECOVERED"
      ).length,
      cancelled: recoveries.filter(
        (item) => item.chargebackStatus === "CANCELLED"
      ).length,
    };
  }, [recoveries]);

  // =========================================================
  // SEARCH + FILTER
  // =========================================================
  const filteredRecoveries = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return recoveries.filter((item) => {
      const costName = getName(item.cost, "");
      const departmentName = getName(item.department, "");
      const institutionName = getName(item.institution, "");
      const equipmentName = getName(item.equipment, "");

      const matchesSearch =
        !searchValue ||
        String(item.id || "").includes(searchValue) ||
        costName.toLowerCase().includes(searchValue) ||
        departmentName.toLowerCase().includes(searchValue) ||
        institutionName.toLowerCase().includes(searchValue) ||
        equipmentName.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        item.chargebackStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [recoveries, search, statusFilter]);

  // =========================================================
  // FORM HANDLING
  // =========================================================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openCreateModal = () => {
    setFormData(emptyForm);
    setError("");
    setShowModal(true);
  };

  const closeCreateModal = () => {
    if (!submitting) {
      setShowModal(false);
    }
  };

  // =========================================================
  // CREATE RECOVERY
  // =========================================================
  const handleCreateRecovery = async (event) => {
    event.preventDefault();

    if (!formData.costId) {
      setError("Please select a cost record.");
      return;
    }

    if (!formData.departmentId) {
      setError("Please select a department.");
      return;
    }

    if (!formData.institutionId) {
      setError("Please select an institution.");
      return;
    }

    if (!formData.equipmentId) {
      setError("Please select equipment.");
      return;
    }

    const recoverable = Number(formData.recoverableAmount);
    const recovered = Number(formData.recoveredAmount || 0);

    if (Number.isNaN(recoverable) || recoverable < 0) {
      setError("Recoverable amount must be a valid positive amount.");
      return;
    }

    if (Number.isNaN(recovered) || recovered < 0) {
      setError("Recovered amount must be a valid amount.");
      return;
    }

    if (recovered > recoverable) {
      setError(
        "Recovered amount cannot be greater than recoverable amount."
      );
      return;
    }

    const recovery = {
      cost: {
        id: Number(formData.costId),
      },

      department: {
        id: Number(formData.departmentId),
      },

      institution: {
        id: Number(formData.institutionId),
      },

      equipment: {
        id: Number(formData.equipmentId),
      },

      recoverableAmount: recoverable,
      recoveredAmount: recovered,

      recoveryDate: formData.recoveryDate,

      description: formData.description.trim(),

      chargebackStatus:
        recovered === recoverable && recoverable > 0
          ? "RECOVERED"
          : recovered > 0
          ? "PARTIAL"
          : "PENDING",
    };

    try {
      setSubmitting(true);
      setError("");

      await createRecovery(recovery);

      setSuccess("Cost recovery created successfully.");
      setShowModal(false);
      setFormData(emptyForm);

      await loadData();
    } catch (err) {
      console.error("Create recovery error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to create cost recovery."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // UPDATE RECOVERED AMOUNT
  // =========================================================
  const openRecoveredModal = (recovery) => {
    setSelectedRecovery(recovery);
    setRecoveredAmount(
      Number(recovery.recoveredAmount || 0).toString()
    );
    setError("");
    setShowRecoveredModal(true);
  };

  const closeRecoveredModal = () => {
    if (!submitting) {
      setShowRecoveredModal(false);
      setSelectedRecovery(null);
      setRecoveredAmount("");
    }
  };

  const handleUpdateRecoveredAmount = async (event) => {
    event.preventDefault();

    if (!selectedRecovery) return;

    const amount = Number(recoveredAmount);
    const recoverable = Number(
      selectedRecovery.recoverableAmount || 0
    );

    if (Number.isNaN(amount) || amount < 0) {
      setError("Please enter a valid recovered amount.");
      return;
    }

    if (amount > recoverable) {
      setError(
        "Recovered amount cannot exceed recoverable amount."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await updateRecoveredAmount(
        selectedRecovery.id,
        amount
      );

      setSuccess("Recovered amount updated successfully.");

      closeRecoveredModal();
      await loadData();
    } catch (err) {
      console.error("Update recovered amount error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to update recovered amount."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // MARK AS RECOVERED
  // =========================================================
  const handleMarkRecovered = async (recovery) => {
    const confirmed = window.confirm(
      `Mark recovery #${recovery.id} as fully recovered?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await markAsRecovered(recovery.id);

      setSuccess("Recovery marked as recovered.");
      await loadData();
    } catch (err) {
      console.error("Mark recovered error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to mark recovery as recovered."
      );
    }
  };

  // =========================================================
  // DELETE
  // =========================================================
  const handleDelete = async (recovery) => {
    const confirmed = window.confirm(
      `Delete recovery #${recovery.id}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteRecovery(recovery.id);

      setSuccess("Recovery deleted successfully.");
      await loadData();
    } catch (err) {
      console.error("Delete recovery error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to delete recovery."
      );
    }
  };

  // =========================================================
  // AUTO SUCCESS MESSAGE CLEAR
  // =========================================================
  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [success]);

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="cost-recovery-page">
      {/* HEADER */}
      <div className="cost-recovery-header">
        <div>
          <h1>Cost Recovery</h1>
          <p>
            Manage inter-department and inter-institution
            cost recovery records.
          </p>
        </div>

        <button
          className="cr-primary-btn"
          onClick={openCreateModal}
        >
          + Create Recovery
        </button>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="cr-alert cr-alert-error">
          <span>⚠️</span>
          <span>{error}</span>

          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {success && (
        <div className="cr-alert cr-alert-success">
          <span>✅</span>
          <span>{success}</span>

          <button onClick={() => setSuccess("")}>×</button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="cr-summary-grid">
        <div className="cr-summary-card">
          <div className="cr-card-icon">💰</div>

          <div>
            <span>Total Recoverable</span>
            <strong>{money(summary.totalRecoverable)}</strong>
          </div>
        </div>

        <div className="cr-summary-card">
          <div className="cr-card-icon">✅</div>

          <div>
            <span>Total Recovered</span>
            <strong>{money(summary.totalRecovered)}</strong>
          </div>
        </div>

        <div className="cr-summary-card">
          <div className="cr-card-icon">⚠️</div>

          <div>
            <span>Outstanding</span>
            <strong>{money(summary.outstandingAmount)}</strong>
          </div>
        </div>

        <div className="cr-summary-card">
          <div className="cr-card-icon">⏳</div>

          <div>
            <span>Pending</span>
            <strong>{summary.pending}</strong>
          </div>
        </div>

        <div className="cr-summary-card">
          <div className="cr-card-icon">🔄</div>

          <div>
            <span>Partial</span>
            <strong>{summary.partial}</strong>
          </div>
        </div>

        <div className="cr-summary-card">
          <div className="cr-card-icon">✔️</div>

          <div>
            <span>Recovered</span>
            <strong>{summary.recovered}</strong>
          </div>
        </div>

        <div className="cr-summary-card">
          <div className="cr-card-icon">❌</div>

          <div>
            <span>Cancelled</span>
            <strong>{summary.cancelled}</strong>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="cr-table-card">
        <div className="cr-table-header">
          <div>
            <h2>Recovery Records</h2>
            <span>
              {filteredRecoveries.length} record
              {filteredRecoveries.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="cr-filters">
            <div className="cr-search">
              <span>🔍</span>

              <input
                type="text"
                placeholder="Search recovery..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="ALL">All Statuses</option>

              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="cr-loading">
            <div className="cr-spinner"></div>
            <p>Loading recovery records...</p>
          </div>
        ) : filteredRecoveries.length === 0 ? (
          <div className="cr-empty">
            <div>💰</div>
            <h3>No recovery records found</h3>
            <p>
              Create a cost recovery record to see it here.
            </p>
          </div>
        ) : (
          <div className="cr-table-wrapper">
            <table className="cr-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cost</th>
                  <th>Department</th>
                  <th>Institution</th>
                  <th>Equipment</th>
                  <th>Recoverable</th>
                  <th>Recovered</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecoveries.map((recovery) => (
                  <tr key={recovery.id}>
                    <td>
                      <strong>#{recovery.id}</strong>
                    </td>

                    <td>
                      {getName(recovery.cost)}
                    </td>

                    <td>
                      {getName(recovery.department)}
                    </td>

                    <td>
                      {getName(recovery.institution)}
                    </td>

                    <td>
                      {getName(recovery.equipment)}
                    </td>

                    <td>
                      <strong>
                        {money(recovery.recoverableAmount)}
                      </strong>
                    </td>

                    <td>
                      {money(recovery.recoveredAmount)}
                    </td>

                    <td>
                      <strong className="cr-outstanding">
                        {money(recovery.outstandingAmount)}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`cr-status cr-status-${String(
                          recovery.chargebackStatus || ""
                        ).toLowerCase()}`}
                      >
                        {formatStatus(
                          recovery.chargebackStatus
                        )}
                      </span>
                    </td>

                    <td>
                      {recovery.recoveryDate || "-"}
                    </td>

                    <td>
                      <div className="cr-actions">
                        {recovery.chargebackStatus !==
                          "RECOVERED" &&
                          recovery.chargebackStatus !==
                            "CANCELLED" && (
                            <>
                              <button
                                className="cr-action-btn cr-action-edit"
                                title="Update recovered amount"
                                onClick={() =>
                                  openRecoveredModal(
                                    recovery
                                  )
                                }
                              >
                                💵
                              </button>

                              <button
                                className="cr-action-btn cr-action-success"
                                title="Mark as recovered"
                                onClick={() =>
                                  handleMarkRecovered(
                                    recovery
                                  )
                                }
                              >
                                ✓
                              </button>
                            </>
                          )}

                        <button
                          className="cr-action-btn cr-action-delete"
                          title="Delete recovery"
                          onClick={() =>
                            handleDelete(recovery)
                          }
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================
          CREATE RECOVERY MODAL
      ===================================================== */}
      {showModal && (
        <div className="cr-modal-overlay">
          <div className="cr-modal">
            <div className="cr-modal-header">
              <div>
                <h2>Create Cost Recovery</h2>
                <p>
                  Add a new recovery / chargeback record.
                </p>
              </div>

              <button
                className="cr-modal-close"
                onClick={closeCreateModal}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreateRecovery}
              className="cr-form"
            >
              <div className="cr-form-grid">
                {/* COST */}
                <div className="cr-form-group">
                  <label>
                    Cost Record <span>*</span>
                  </label>

                  <select
                    name="costId"
                    value={formData.costId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select cost record
                    </option>

                    {costs.map((cost) => (
                      <option key={cost.id} value={cost.id}>
                        #{cost.id} —{" "}
                        {getName(cost.equipment, "Equipment")} —{" "}
                        {money(cost.totalCost)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DEPARTMENT */}
                <div className="cr-form-group">
                  <label>
                    Department <span>*</span>
                  </label>

                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select department
                    </option>

                    {departments.map((department) => (
                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {getName(department)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* INSTITUTION */}
                <div className="cr-form-group">
                  <label>
                    Institution <span>*</span>
                  </label>

                  <select
                    name="institutionId"
                    value={formData.institutionId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select institution
                    </option>

                    {institutions.map((institution) => (
                      <option
                        key={institution.id}
                        value={institution.id}
                      >
                        {getName(institution)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* EQUIPMENT */}
                <div className="cr-form-group">
                  <label>
                    Equipment <span>*</span>
                  </label>

                  <select
                    name="equipmentId"
                    value={formData.equipmentId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select equipment
                    </option>

                    {equipment.map((item) => (
                      <option key={item.id} value={item.id}>
                        {getName(item)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* RECOVERABLE */}
                <div className="cr-form-group">
                  <label>
                    Recoverable Amount <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="recoverableAmount"
                    min="0"
                    step="0.01"
                    placeholder="Enter amount"
                    value={formData.recoverableAmount}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* RECOVERED */}
                <div className="cr-form-group">
                  <label>Initial Recovered Amount</label>

                  <input
                    type="number"
                    name="recoveredAmount"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.recoveredAmount}
                    onChange={handleChange}
                  />
                </div>

                {/* DATE */}
                <div className="cr-form-group">
                  <label>Recovery Date</label>

                  <input
                    type="date"
                    name="recoveryDate"
                    value={formData.recoveryDate}
                    onChange={handleChange}
                  />
                </div>

                {/* DESCRIPTION */}
                <div className="cr-form-group cr-form-full">
                  <label>Description</label>

                  <textarea
                    name="description"
                    rows="4"
                    placeholder="Enter recovery details..."
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>

              {/* PREVIEW */}
              <div className="cr-amount-preview">
                <div>
                  <span>Recoverable</span>
                  <strong>
                    {money(formData.recoverableAmount)}
                  </strong>
                </div>

                <div>
                  <span>Recovered</span>
                  <strong>
                    {money(formData.recoveredAmount)}
                  </strong>
                </div>

                <div>
                  <span>Outstanding</span>
                  <strong>
                    {money(
                      Math.max(
                        0,
                        Number(formData.recoverableAmount || 0) -
                          Number(formData.recoveredAmount || 0)
                      )
                    )}
                  </strong>
                </div>
              </div>

              <div className="cr-modal-footer">
                <button
                  type="button"
                  className="cr-secondary-btn"
                  onClick={closeCreateModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="cr-primary-btn"
                  disabled={submitting}
                >
                  {submitting
                    ? "Creating..."
                    : "Create Recovery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          UPDATE RECOVERED AMOUNT MODAL
      ===================================================== */}
      {showRecoveredModal && selectedRecovery && (
        <div className="cr-modal-overlay">
          <div className="cr-modal cr-small-modal">
            <div className="cr-modal-header">
              <div>
                <h2>Update Recovered Amount</h2>

                <p>
                  Recovery #{selectedRecovery.id}
                </p>
              </div>

              <button
                className="cr-modal-close"
                onClick={closeRecoveredModal}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleUpdateRecoveredAmount}
              className="cr-form"
            >
              <div className="cr-recovery-info">
                <div>
                  <span>Recoverable</span>
                  <strong>
                    {money(
                      selectedRecovery.recoverableAmount
                    )}
                  </strong>
                </div>

                <div>
                  <span>Current Recovered</span>
                  <strong>
                    {money(
                      selectedRecovery.recoveredAmount
                    )}
                  </strong>
                </div>

                <div>
                  <span>Current Outstanding</span>
                  <strong>
                    {money(
                      selectedRecovery.outstandingAmount
                    )}
                  </strong>
                </div>
              </div>

              <div className="cr-form-group">
                <label>
                  New Recovered Amount <span>*</span>
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={recoveredAmount}
                  onChange={(event) =>
                    setRecoveredAmount(
                      event.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="cr-amount-preview">
                <div>
                  <span>New Outstanding</span>

                  <strong>
                    {money(
                      Math.max(
                        0,
                        Number(
                          selectedRecovery.recoverableAmount ||
                            0
                        ) -
                          Number(recoveredAmount || 0)
                      )
                    )}
                  </strong>
                </div>
              </div>

              <div className="cr-modal-footer">
                <button
                  type="button"
                  className="cr-secondary-btn"
                  onClick={closeRecoveredModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="cr-primary-btn"
                  disabled={submitting}
                >
                  {submitting
                    ? "Updating..."
                    : "Update Amount"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CostRecovery;