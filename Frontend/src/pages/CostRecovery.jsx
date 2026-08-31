import React, { useEffect, useState } from "react";
import api from "../services/api";

function CostRecovery() {

  // =========================================================
  // EXISTING GET DATA
  // =========================================================

  const [recoveries, setRecoveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // CREATE MODAL
  // =========================================================

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  // =========================================================
  // UPDATE MODAL
  // =========================================================

  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);

  // =========================================================
  // RECOVERED AMOUNT MODAL
  // =========================================================

  const [showRecoveredModal, setShowRecoveredModal] = useState(false);
  const [updatingRecovered, setUpdatingRecovered] = useState(false);
  const [recoveredError, setRecoveredError] = useState("");
  const [recoveredAmount, setRecoveredAmount] = useState("");
  const [recoveredId, setRecoveredId] = useState(null);

  // =========================================================
  // ACTION STATE
  // =========================================================

  const [actionLoading, setActionLoading] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  // =========================================================
  // CREATE FORM
  // =========================================================

  const [formData, setFormData] = useState({
    costId: "",
    departmentId: "",
    institutionId: "",
    equipmentId: "",
    recoverableAmount: "",
    recoveredAmount: "0",
    chargebackStatus: "PENDING",
    recoveryDate: new Date()
      .toISOString()
      .split("T")[0],
  });

  // =========================================================
  // EDIT FORM
  // =========================================================

  const [editFormData, setEditFormData] = useState({
    costId: "",
    departmentId: "",
    institutionId: "",
    equipmentId: "",
    recoverableAmount: "",
    recoveredAmount: "",
    chargebackStatus: "PENDING",
    recoveryDate: "",
  });

  // =========================================================
  // LOAD RECOVERIES
  // =========================================================

  const loadRecoveries = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cost-recovery");

      setRecoveries(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load cost recoveries:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load cost recovery records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecoveries();
  }, []);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // EDIT FORM CHANGE
  // =========================================================

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // OPEN CREATE MODAL
  // =========================================================

  const openCreateModal = () => {
    setCreateError("");
    setCreateSuccess("");

    setFormData({
      costId: "",
      departmentId: "",
      institutionId: "",
      equipmentId: "",
      recoverableAmount: "",
      recoveredAmount: "0",
      chargebackStatus: "PENDING",
      recoveryDate: new Date()
        .toISOString()
        .split("T")[0],
    });

    setShowCreateModal(true);
  };

  // =========================================================
  // CLOSE CREATE MODAL
  // =========================================================

  const closeCreateModal = () => {
    if (creating) {
      return;
    }

    setShowCreateModal(false);
    setCreateError("");
    setCreateSuccess("");
  };

  // =========================================================
  // CREATE COST RECOVERY
  // =========================================================

  const handleCreateRecovery = async (event) => {
    event.preventDefault();

    setCreateError("");
    setCreateSuccess("");

    if (
      !formData.costId ||
      !formData.departmentId ||
      !formData.institutionId ||
      !formData.equipmentId
    ) {
      setCreateError(
        "Cost, department, institution and equipment are required."
      );
      return;
    }

    if (
      formData.recoverableAmount === "" ||
      Number(formData.recoverableAmount) < 0
    ) {
      setCreateError(
        "Recoverable amount must be 0 or greater."
      );
      return;
    }

    if (
      formData.recoveredAmount === "" ||
      Number(formData.recoveredAmount) < 0
    ) {
      setCreateError(
        "Recovered amount must be 0 or greater."
      );
      return;
    }

    if (
      Number(formData.recoveredAmount) >
      Number(formData.recoverableAmount)
    ) {
      setCreateError(
        "Recovered amount cannot exceed recoverable amount."
      );
      return;
    }

    try {
      setCreating(true);

      const payload = {
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

        recoverableAmount:
          Number(formData.recoverableAmount),

        recoveredAmount:
          Number(formData.recoveredAmount),

        chargebackStatus:
          formData.chargebackStatus,

        recoveryDate:
          formData.recoveryDate,
      };

      await api.post(
        "/cost-recovery",
        payload
      );

      setCreateSuccess(
        "Cost recovery created successfully."
      );

      await loadRecoveries();

      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccess("");
      }, 800);

    } catch (err) {
      console.error(
        "Failed to create cost recovery:",
        err
      );

      setCreateError(
        err.response?.data?.message ||
        err.response?.data ||
        "Unable to create cost recovery."
      );
    } finally {
      setCreating(false);
    }
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditModal = (recovery) => {
    setEditingId(recovery.id);

    setEditFormData({
      costId: recovery.cost?.id || "",
      departmentId: recovery.department?.id || "",
      institutionId: recovery.institution?.id || "",
      equipmentId: recovery.equipment?.id || "",
      recoverableAmount:
        recovery.recoverableAmount ?? "",
      recoveredAmount:
        recovery.recoveredAmount ?? 0,
      chargebackStatus:
        recovery.chargebackStatus || "PENDING",
      recoveryDate:
        recovery.recoveryDate || "",
    });

    setEditError("");
    setEditSuccess("");
    setShowEditModal(true);
  };

  // =========================================================
  // CLOSE EDIT MODAL
  // =========================================================

  const closeEditModal = () => {
    if (editing) {
      return;
    }

    setShowEditModal(false);
    setEditingId(null);
    setEditError("");
    setEditSuccess("");
  };

  // =========================================================
  // UPDATE RECOVERY
  // =========================================================

  const handleUpdateRecovery = async (event) => {
    event.preventDefault();

    setEditError("");
    setEditSuccess("");

    if (
      !editFormData.costId ||
      !editFormData.departmentId ||
      !editFormData.institutionId ||
      !editFormData.equipmentId
    ) {
      setEditError(
        "Cost, department, institution and equipment are required."
      );
      return;
    }

    if (
      editFormData.recoverableAmount === "" ||
      Number(editFormData.recoverableAmount) < 0
    ) {
      setEditError(
        "Recoverable amount must be 0 or greater."
      );
      return;
    }

    if (
      editFormData.recoveredAmount === "" ||
      Number(editFormData.recoveredAmount) < 0
    ) {
      setEditError(
        "Recovered amount must be 0 or greater."
      );
      return;
    }

    if (
      Number(editFormData.recoveredAmount) >
      Number(editFormData.recoverableAmount)
    ) {
      setEditError(
        "Recovered amount cannot exceed recoverable amount."
      );
      return;
    }

    try {
      setEditing(true);

      const payload = {
        cost: {
          id: Number(editFormData.costId),
        },

        department: {
          id: Number(editFormData.departmentId),
        },

        institution: {
          id: Number(editFormData.institutionId),
        },

        equipment: {
          id: Number(editFormData.equipmentId),
        },

        recoverableAmount:
          Number(editFormData.recoverableAmount),

        recoveredAmount:
          Number(editFormData.recoveredAmount),

        chargebackStatus:
          editFormData.chargebackStatus,

        recoveryDate:
          editFormData.recoveryDate,
      };

      await api.put(
        `/cost-recovery/${editingId}`,
        payload
      );

      setEditSuccess(
        "Cost recovery updated successfully."
      );

      await loadRecoveries();

      setTimeout(() => {
        setShowEditModal(false);
        setEditingId(null);
        setEditSuccess("");
      }, 800);

    } catch (err) {
      console.error(
        "Failed to update cost recovery:",
        err
      );

      setEditError(
        err.response?.data?.message ||
        err.response?.data ||
        "Unable to update cost recovery."
      );
    } finally {
      setEditing(false);
    }
  };

  // =========================================================
  // OPEN RECOVERED AMOUNT MODAL
  // =========================================================

  const openRecoveredModal = (recovery) => {
    setRecoveredId(recovery.id);

    setRecoveredAmount(
      recovery.recoveredAmount ?? 0
    );

    setRecoveredError("");
    setShowRecoveredModal(true);
  };

  // =========================================================
  // CLOSE RECOVERED AMOUNT MODAL
  // =========================================================

  const closeRecoveredModal = () => {
    if (updatingRecovered) {
      return;
    }

    setShowRecoveredModal(false);
    setRecoveredId(null);
    setRecoveredAmount("");
    setRecoveredError("");
  };

  // =========================================================
  // UPDATE RECOVERED AMOUNT
  // =========================================================

  const handleUpdateRecoveredAmount = async (
    event
  ) => {
    event.preventDefault();

    setRecoveredError("");

    const recovery = recoveries.find(
      (item) => item.id === recoveredId
    );

    if (!recovery) {
      setRecoveredError(
        "Recovery record not found."
      );
      return;
    }

    if (
      recoveredAmount === "" ||
      Number(recoveredAmount) < 0
    ) {
      setRecoveredError(
        "Recovered amount must be 0 or greater."
      );
      return;
    }

    if (
      Number(recoveredAmount) >
      Number(recovery.recoverableAmount || 0)
    ) {
      setRecoveredError(
        "Recovered amount cannot exceed recoverable amount."
      );
      return;
    }

    try {
      setUpdatingRecovered(true);

      await api.patch(
        `/cost-recovery/${recoveredId}/recovered-amount`,
        null,
        {
          params: {
            recoveredAmount:
              Number(recoveredAmount),
          },
        }
      );

      await loadRecoveries();

      closeRecoveredModal();

      setActionMessage(
        "Recovered amount updated successfully."
      );

      setTimeout(() => {
        setActionMessage("");
      }, 2000);

    } catch (err) {
      console.error(
        "Failed to update recovered amount:",
        err
      );

      setRecoveredError(
        err.response?.data?.message ||
        err.response?.data ||
        "Unable to update recovered amount."
      );
    } finally {
      setUpdatingRecovered(false);
    }
  };

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const handleStatusChange = async (
    recoveryId,
    status
  ) => {

    try {
      setActionLoading(
        `status-${recoveryId}`
      );

      await api.patch(
        `/cost-recovery/${recoveryId}/status`,
        null,
        {
          params: {
            status,
          },
        }
      );

      await loadRecoveries();

      setActionMessage(
        "Chargeback status updated successfully."
      );

      setTimeout(() => {
        setActionMessage("");
      }, 2000);

    } catch (err) {
      console.error(
        "Failed to update chargeback status:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Unable to update chargeback status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // MARK AS RECOVERED
  // =========================================================

  const handleMarkAsRecovered = async (
    recoveryId
  ) => {

    const confirmed = window.confirm(
      "Are you sure you want to mark this recovery as fully recovered?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(
        `mark-${recoveryId}`
      );

      await api.patch(
        `/cost-recovery/${recoveryId}/mark-recovered`
      );

      await loadRecoveries();

      setActionMessage(
        "Recovery marked as recovered successfully."
      );

      setTimeout(() => {
        setActionMessage("");
      }, 2000);

    } catch (err) {
      console.error(
        "Failed to mark recovery:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Unable to mark recovery as recovered."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // DELETE RECOVERY
  // =========================================================

  const handleDeleteRecovery = async (
    recoveryId
  ) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this cost recovery record?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(
        `delete-${recoveryId}`
      );

      await api.delete(
        `/cost-recovery/${recoveryId}`
      );

      await loadRecoveries();

      setActionMessage(
        "Cost recovery deleted successfully."
      );

      setTimeout(() => {
        setActionMessage("");
      }, 2000);

    } catch (err) {
      console.error(
        "Failed to delete cost recovery:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Unable to delete cost recovery."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // =========================================================
  // TOTALS
  // =========================================================

  const totalRecoverable =
    recoveries.reduce(
      (sum, item) =>
        sum +
        Number(
          item.recoverableAmount || 0
        ),
      0
    );

  const totalRecovered =
    recoveries.reduce(
      (sum, item) =>
        sum +
        Number(
          item.recoveredAmount || 0
        ),
      0
    );

  const totalOutstanding =
    totalRecoverable -
    totalRecovered;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="cost-recovery-page">

        <div className="cost-recovery-loading">

          <div className="loading-spinner"></div>

          <h3>
            Loading cost recovery...
          </h3>

          <p>
            Fetching recovery and chargeback
            records.
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="cost-recovery-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="cost-recovery-header">

        <div>

          <span className="page-eyebrow">
            COST MANAGEMENT
          </span>

          <h1>
            Cost Recovery & Chargeback
          </h1>

          <p>
            Track recoverable costs, recovered
            amounts, outstanding balances and
            chargeback status.
          </p>

        </div>

        <div className="cost-recovery-header-actions">

          <button
            type="button"
            className="recovery-refresh-button"
            onClick={loadRecoveries}
          >
            ↻ Refresh
          </button>

          <button
            type="button"
            className="recovery-create-button"
            onClick={openCreateModal}
          >
            + Create Recovery
          </button>

        </div>

      </div>

      {/* =====================================================
          ACTION SUCCESS
      ===================================================== */}

      {actionMessage && (
        <div className="recovery-action-success">
          <span>✓</span>
          {actionMessage}
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="recovery-error">

          <span>⚠</span>

          <div>

            <strong>
              Unable to load data
            </strong>

            <p>
              {error}
            </p>

          </div>

        </div>
      )}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="recovery-summary">

        <div className="recovery-summary-card">

          <div className="recovery-summary-icon">
            ₹
          </div>

          <div>

            <span>
              Total Recoverable
            </span>

            <h2>
              {formatCurrency(
                totalRecoverable
              )}
            </h2>

          </div>

        </div>

        <div className="recovery-summary-card">

          <div className="recovery-summary-icon">
            ✓
          </div>

          <div>

            <span>
              Total Recovered
            </span>

            <h2>
              {formatCurrency(
                totalRecovered
              )}
            </h2>

          </div>

        </div>

        <div className="recovery-summary-card">

          <div className="recovery-summary-icon">
            !
          </div>

          <div>

            <span>
              Outstanding
            </span>

            <h2>
              {formatCurrency(
                Math.max(
                  totalOutstanding,
                  0
                )
              )}
            </h2>

          </div>

        </div>

        <div className="recovery-summary-card">

          <div className="recovery-summary-icon">
            #
          </div>

          <div>

            <span>
              Recovery Records
            </span>

            <h2>
              {recoveries.length}
            </h2>

          </div>

        </div>

      </div>

      {/* =====================================================
          TABLE CARD
      ===================================================== */}

      <div className="recovery-card">

        <div className="recovery-card-header">

          <div>

            <h2>
              Cost Recovery Records
            </h2>

            <p>
              Recovery and chargeback details
              from the database.
            </p>

          </div>

          <span className="recovery-count">
            {recoveries.length} records
          </span>

        </div>

        <div className="recovery-table-wrapper">

          <table className="recovery-table">

            <thead>

              <tr>

                <th>#</th>

                <th>
                  Department
                </th>

                <th>
                  Institution
                </th>

                <th>
                  Equipment
                </th>

                <th>
                  Recoverable
                </th>

                <th>
                  Recovered
                </th>

                <th>
                  Outstanding
                </th>

                <th>
                  Status
                </th>

                <th>
                  Date
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {recoveries.length === 0 ? (

                <tr>

                  <td
                    colSpan="10"
                    className="empty-recovery"
                  >

                    <div className="empty-icon">
                      ₹
                    </div>

                    <strong>
                      No cost recovery records
                    </strong>

                    <p>
                      There are currently no
                      recovery records available.
                    </p>

                  </td>

                </tr>

              ) : (

                recoveries.map(
                  (recovery, index) => {

                    const recoverable =
                      Number(
                        recovery.recoverableAmount ||
                        0
                      );

                    const recovered =
                      Number(
                        recovery.recoveredAmount ||
                        0
                      );

                    const outstanding =
                      Math.max(
                        recoverable -
                        recovered,
                        0
                      );

                    const currentStatus =
                      recovery.chargebackStatus ||
                      "PENDING";

                    return (

                      <tr
                        key={
                          recovery.id ||
                          index
                        }
                      >

                        <td>

                          <span className="row-number">
                            {index + 1}
                          </span>

                        </td>

                        <td>
                          {
                            recovery
                              .department
                              ?.name ||
                            "-"
                          }
                        </td>

                        <td>
                          {
                            recovery
                              .institution
                              ?.name ||
                            "-"
                          }
                        </td>

                        <td>
                          {
                            recovery
                              .equipment
                              ?.name ||
                            "-"
                          }
                        </td>

                        <td>

                          <strong>
                            {formatCurrency(
                              recoverable
                            )}
                          </strong>

                        </td>

                        <td>

                          <strong className="recovered-value">
                            {formatCurrency(
                              recovered
                            )}
                          </strong>

                        </td>

                        <td>

                          <strong className="outstanding-value">
                            {formatCurrency(
                              outstanding
                            )}
                          </strong>

                        </td>

                        <td>

                          <select
                            className={`recovery-status-select ${currentStatus.toLowerCase()}`}
                            value={currentStatus}
                            disabled={
                              actionLoading ===
                              `status-${recovery.id}`
                            }
                            onChange={(event) =>
                              handleStatusChange(
                                recovery.id,
                                event.target.value
                              )
                            }
                          >

                            <option value="PENDING">
                              PENDING
                            </option>

                            <option value="PARTIAL">
                              PARTIAL
                            </option>

                            <option value="RECOVERED">
                              RECOVERED
                            </option>

                            <option value="CANCELLED">
                              CANCELLED
                            </option>

                          </select>

                        </td>

                        <td>
                          {
                            recovery
                              .recoveryDate ||
                            "-"
                          }
                        </td>

                        <td>

                          <div className="recovery-actions">

                            <button
                              type="button"
                              className="recovery-action-button edit"
                              onClick={() =>
                                openEditModal(
                                  recovery
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="recovery-action-button amount"
                              onClick={() =>
                                openRecoveredModal(
                                  recovery
                                )
                              }
                            >
                              Amount
                            </button>

                            <button
                              type="button"
                              className="recovery-action-button recovered"
                              disabled={
                                actionLoading ===
                                `mark-${recovery.id}` ||
                                currentStatus ===
                                "RECOVERED"
                              }
                              onClick={() =>
                                handleMarkAsRecovered(
                                  recovery.id
                                )
                              }
                            >
                              {actionLoading ===
                              `mark-${recovery.id}`
                                ? "..."
                                : "Mark Recovered"}
                            </button>

                            <button
                              type="button"
                              className="recovery-action-button delete"
                              disabled={
                                actionLoading ===
                                `delete-${recovery.id}`
                              }
                              onClick={() =>
                                handleDeleteRecovery(
                                  recovery.id
                                )
                              }
                            >
                              {actionLoading ===
                              `delete-${recovery.id}`
                                ? "..."
                                : "Delete"}
                            </button>

                          </div>

                        </td>

                      </tr>

                    );

                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          CREATE MODAL
      ===================================================== */}

      {showCreateModal && (

        <div
          className="recovery-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeCreateModal();
            }

          }}
        >

          <div className="recovery-modal">

            <div className="recovery-modal-header">

              <div>

                <span className="modal-eyebrow">
                  COST MANAGEMENT
                </span>

                <h2>
                  Create Cost Recovery
                </h2>

                <p>
                  Create a new recovery or
                  chargeback record.
                </p>

              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={closeCreateModal}
                disabled={creating}
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleCreateRecovery
              }
            >

              <div className="recovery-form-grid">

                <div className="recovery-form-group">

                  <label>
                    Cost ID
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="costId"
                    value={
                      formData.costId
                    }
                    onChange={
                      handleChange
                    }
                    min="1"
                    placeholder="Enter cost ID"
                    required
                  />

                </div>

                <div className="recovery-form-group">

                  <label>
                    Department ID
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="departmentId"
                    value={
                      formData.departmentId
                    }
                    onChange={
                      handleChange
                    }
                    min="1"
                    placeholder="Enter department ID"
                    required
                  />

                </div>

                <div className="recovery-form-group">

                  <label>
                    Institution ID
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="institutionId"
                    value={
                      formData.institutionId
                    }
                    onChange={
                      handleChange
                    }
                    min="1"
                    placeholder="Enter institution ID"
                    required
                  />

                </div>

                <div className="recovery-form-group">

                  <label>
                    Equipment ID
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="equipmentId"
                    value={
                      formData.equipmentId
                    }
                    onChange={
                      handleChange
                    }
                    min="1"
                    placeholder="Enter equipment ID"
                    required
                  />

                </div>

                <div className="recovery-form-group">

                  <label>
                    Recoverable Amount
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="recoverableAmount"
                    value={
                      formData.recoverableAmount
                    }
                    onChange={
                      handleChange
                    }
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />

                </div>

                <div className="recovery-form-group">

                  <label>
                    Recovered Amount
                  </label>

                  <input
                    type="number"
                    name="recoveredAmount"
                    value={
                      formData.recoveredAmount
                    }
                    onChange={
                      handleChange
                    }
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />

                </div>

                <div className="recovery-form-group">

                  <label>
                    Chargeback Status
                  </label>

                  <select
                    name="chargebackStatus"
                    value={
                      formData.chargebackStatus
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="PENDING">
                      PENDING
                    </option>

                    <option value="PARTIAL">
                      PARTIAL
                    </option>

                    <option value="RECOVERED">
                      RECOVERED
                    </option>

                    <option value="CANCELLED">
                      CANCELLED
                    </option>

                  </select>

                </div>

                <div className="recovery-form-group">

                  <label>
                    Recovery Date
                    <span>*</span>
                  </label>

                  <input
                    type="date"
                    name="recoveryDate"
                    value={
                      formData.recoveryDate
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

              </div>

              {createError && (

                <div className="recovery-form-error">

                  <span>⚠</span>

                  <p>
                    {createError}
                  </p>

                </div>

              )}

              {createSuccess && (

                <div className="recovery-form-success">

                  <span>✓</span>

                  <p>
                    {createSuccess}
                  </p>

                </div>

              )}

              <div className="recovery-modal-actions">

                <button
                  type="button"
                  className="recovery-cancel-button"
                  onClick={
                    closeCreateModal
                  }
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="recovery-submit-button"
                  disabled={creating}
                >

                  {creating
                    ? "Creating..."
                    : "Create Recovery"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {showEditModal && (

        <div
          className="recovery-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeEditModal();
            }

          }}
        >

          <div className="recovery-modal">

            <div className="recovery-modal-header">

              <div>

                <span className="modal-eyebrow">
                  COST MANAGEMENT
                </span>

                <h2>
                  Update Cost Recovery
                </h2>

                <p>
                  Update the recovery and
                  chargeback details.
                </p>

              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={closeEditModal}
                disabled={editing}
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleUpdateRecovery
              }
            >

              <div className="recovery-form-grid">

                <div className="recovery-form-group">

                  <label>
                    Cost ID
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="costId"
                    value={
                      editFormData.costId
                    }
                    onChange={
                      handleEditChange
                    }
                    min="1"
                    required
                  />

                </div>

                <div className="recovery-form-group">

                  <label>
                    Department ID
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="departmentId"
                    value={
                      editFormData.departmentId
                    }
                    onChange={
                      handleEditChange
                    }
                    min="1"
                    required
                  />

                </div>

                <div className="recovery-form-group">

                  <label>
                    Institution ID
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="institutionId"
                    value={
                      editFormData.institutionId
                    }
                    onChange={
                      handleEditChange
                    }
                    min="1"
                    required
                  />

                </div>

                <div className="recovery-form-group">

                  <label>
                    Equipment ID
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="equipmentId"
                    value={
                      editFormData.equipmentId
                    }
                    onChange={
                      handleEditChange
                    }
                    min="1"
                    required
                  />

                </div>

                <div className="recovery-form-group">

                  <label>
                    Recoverable Amount
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="recoverableAmount"
                    value={
                      editFormData.recoverableAmount
                    }
                    onChange={
                      handleEditChange
                    }
                    min="0"
                    step="0.01"
                    required
                  />

                </div>

                <div className="recovery-form-group">

                  <label>
                    Recovered Amount
                  </label>

                  <input
                    type="number"
                    name="recoveredAmount"
                    value={
                      editFormData.recoveredAmount
                    }
                    onChange={
                      handleEditChange
                    }
                    min="0"
                    step="0.01"
                  />

                </div>

                <div className="recovery-form-group">

                  <label>
                    Chargeback Status
                  </label>

                  <select
                    name="chargebackStatus"
                    value={
                      editFormData.chargebackStatus
                    }
                    onChange={
                      handleEditChange
                    }
                  >

                    <option value="PENDING">
                      PENDING
                    </option>

                    <option value="PARTIAL">
                      PARTIAL
                    </option>

                    <option value="RECOVERED">
                      RECOVERED
                    </option>

                    <option value="CANCELLED">
                      CANCELLED
                    </option>

                  </select>

                </div>

                <div className="recovery-form-group">

                  <label>
                    Recovery Date
                    <span>*</span>
                  </label>

                  <input
                    type="date"
                    name="recoveryDate"
                    value={
                      editFormData.recoveryDate
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  />

                </div>

              </div>

              {editError && (

                <div className="recovery-form-error">

                  <span>⚠</span>

                  <p>
                    {editError}
                  </p>

                </div>

              )}

              {editSuccess && (

                <div className="recovery-form-success">

                  <span>✓</span>

                  <p>
                    {editSuccess}
                  </p>

                </div>

              )}

              <div className="recovery-modal-actions">

                <button
                  type="button"
                  className="recovery-cancel-button"
                  onClick={
                    closeEditModal
                  }
                  disabled={editing}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="recovery-submit-button"
                  disabled={editing}
                >

                  {editing
                    ? "Updating..."
                    : "Update Recovery"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          RECOVERED AMOUNT MODAL
      ===================================================== */}

      {showRecoveredModal && (

        <div
          className="recovery-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeRecoveredModal();
            }

          }}
        >

          <div className="recovery-small-modal">

            <div className="recovery-modal-header">

              <div>

                <span className="modal-eyebrow">
                  RECOVERY UPDATE
                </span>

                <h2>
                  Update Recovered Amount
                </h2>

                <p>
                  Enter the amount recovered
                  so far.
                </p>

              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={
                  closeRecoveredModal
                }
                disabled={updatingRecovered}
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleUpdateRecoveredAmount
              }
            >

              <div className="recovery-form-group">

                <label>
                  Recovered Amount
                  <span>*</span>
                </label>

                <input
                  type="number"
                  value={
                    recoveredAmount
                  }
                  onChange={(event) =>
                    setRecoveredAmount(
                      event.target.value
                    )
                  }
                  min="0"
                  step="0.01"
                  placeholder="Enter recovered amount"
                  required
                />

              </div>

              {recoveredError && (

                <div className="recovery-form-error">

                  <span>⚠</span>

                  <p>
                    {recoveredError}
                  </p>

                </div>

              )}

              <div className="recovery-modal-actions">

                <button
                  type="button"
                  className="recovery-cancel-button"
                  onClick={
                    closeRecoveredModal
                  }
                  disabled={
                    updatingRecovered
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="recovery-submit-button"
                  disabled={
                    updatingRecovered
                  }
                >

                  {updatingRecovered
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