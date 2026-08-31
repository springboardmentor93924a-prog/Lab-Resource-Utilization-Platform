
import React, { useEffect, useState } from "react";

import {
  getAllBillings,
  createBilling,
  updateBilling,
  updateBillingStatus,
  deleteBilling,
} from "../services/interInstitutionBillingApi";

function InterInstitutionBilling() {

  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  // =========================================================
  // CREATE BILLING MODAL
  // =========================================================

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [createLoading, setCreateLoading] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [formData, setFormData] = useState({
    sharingInstitutionId: "",
    usingInstitutionId: "",
    equipmentId: "",
    usageHours: "",
    amount: "",
    billingStatus: "PENDING",
    billingDate: "",
  });

  // =========================================================
  // EDIT BILLING MODAL
  // =========================================================

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [editLoading, setEditLoading] =
    useState(false);

  const [editingBillingId, setEditingBillingId] =
    useState(null);

  const [editFormData, setEditFormData] = useState({
    sharingInstitutionId: "",
    usingInstitutionId: "",
    equipmentId: "",
    usageHours: "",
    amount: "",
    billingStatus: "PENDING",
    billingDate: "",
  });

  // =========================================================
  // LOAD BILLINGS
  // =========================================================

  const loadBillings = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await getAllBillings();

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setBillings(data);

    } catch (err) {

      console.error(
        "Failed to load inter-institution billing:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load inter-institution billing records."
      );

    } finally {

      setLoading(false);

    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadBillings();
  }, []);

  // =========================================================
  // CREATE FORM CHANGE
  // =========================================================

  const handleFormChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

  };

  // =========================================================
  // EDIT FORM CHANGE
  // =========================================================

  const handleEditFormChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setEditFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

  };

  // =========================================================
  // OPEN CREATE MODAL
  // =========================================================

  const openCreateModal = () => {

    setError("");
    setSuccessMessage("");

    setFormData({
      sharingInstitutionId: "",
      usingInstitutionId: "",
      equipmentId: "",
      usageHours: "",
      amount: "",
      billingStatus: "PENDING",
      billingDate: "",
    });

    setShowCreateModal(true);

  };

  // =========================================================
  // CLOSE CREATE MODAL
  // =========================================================

  const closeCreateModal = () => {

    if (createLoading) {
      return;
    }

    setShowCreateModal(false);

  };

  // =========================================================
  // CREATE BILLING
  // =========================================================

  const handleCreateBilling = async (event) => {

    event.preventDefault();

    setError("");
    setSuccessMessage("");

    if (
      !formData.sharingInstitutionId ||
      !formData.usingInstitutionId ||
      !formData.equipmentId
    ) {

      setError(
        "Sharing institution, using institution and equipment are required."
      );

      return;
    }

    if (
      formData.sharingInstitutionId ===
      formData.usingInstitutionId
    ) {

      setError(
        "Sharing institution and using institution must be different."
      );

      return;
    }

    if (
      formData.usageHours === "" ||
      Number(formData.usageHours) < 0
    ) {

      setError(
        "Usage hours must be zero or greater."
      );

      return;
    }

    if (
      formData.amount === "" ||
      Number(formData.amount) < 0
    ) {

      setError(
        "Amount must be zero or greater."
      );

      return;
    }

    try {

      setCreateLoading(true);

      const billingData = {
        sharingInstitution: {
          id: Number(
            formData.sharingInstitutionId
          ),
        },

        usingInstitution: {
          id: Number(
            formData.usingInstitutionId
          ),
        },

        equipment: {
          id: Number(
            formData.equipmentId
          ),
        },

        usageHours: Number(
          formData.usageHours
        ),

        amount: Number(
          formData.amount
        ),

        billingStatus:
          formData.billingStatus,

        billingDate:
          formData.billingDate ||
          new Date()
            .toISOString()
            .split("T")[0],
      };

      await createBilling(
        billingData
      );

      setSuccessMessage(
        "Billing record created successfully."
      );

      setShowCreateModal(false);

      await loadBillings();

    } catch (err) {

      console.error(
        "Failed to create billing:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Unable to create billing record."
      );

    } finally {

      setCreateLoading(false);

    }

  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditModal = (billing) => {

    setError("");
    setSuccessMessage("");

    setEditingBillingId(billing.id);

    setEditFormData({
      sharingInstitutionId:
        billing.sharingInstitution?.id ??
        "",

      usingInstitutionId:
        billing.usingInstitution?.id ??
        "",

      equipmentId:
        billing.equipment?.id ??
        "",

      usageHours:
        billing.usageHours ?? "",

      amount:
        billing.amount ?? "",

      billingStatus:
        billing.billingStatus ||
        "PENDING",

      billingDate:
        billing.billingDate ||
        "",
    });

    setShowEditModal(true);

  };

  // =========================================================
  // CLOSE EDIT MODAL
  // =========================================================

  const closeEditModal = () => {

    if (editLoading) {
      return;
    }

    setShowEditModal(false);
    setEditingBillingId(null);

  };

  // =========================================================
  // UPDATE BILLING
  // =========================================================

  const handleUpdateBilling = async (event) => {

    event.preventDefault();

    setError("");
    setSuccessMessage("");

    if (!editingBillingId) {

      setError(
        "Billing record ID is missing."
      );

      return;
    }

    if (
      !editFormData.sharingInstitutionId ||
      !editFormData.usingInstitutionId ||
      !editFormData.equipmentId
    ) {

      setError(
        "Sharing institution, using institution and equipment are required."
      );

      return;
    }

    if (
      String(
        editFormData.sharingInstitutionId
      ) ===
      String(
        editFormData.usingInstitutionId
      )
    ) {

      setError(
        "Sharing institution and using institution must be different."
      );

      return;
    }

    if (
      editFormData.usageHours === "" ||
      Number(editFormData.usageHours) < 0
    ) {

      setError(
        "Usage hours must be zero or greater."
      );

      return;
    }

    if (
      editFormData.amount === "" ||
      Number(editFormData.amount) < 0
    ) {

      setError(
        "Amount must be zero or greater."
      );

      return;
    }

    try {

      setEditLoading(true);

      const billingData = {

        sharingInstitution: {
          id: Number(
            editFormData.sharingInstitutionId
          ),
        },

        usingInstitution: {
          id: Number(
            editFormData.usingInstitutionId
          ),
        },

        equipment: {
          id: Number(
            editFormData.equipmentId
          ),
        },

        usageHours: Number(
          editFormData.usageHours
        ),

        amount: Number(
          editFormData.amount
        ),

        billingStatus:
          editFormData.billingStatus,

        billingDate:
          editFormData.billingDate ||
          new Date()
            .toISOString()
            .split("T")[0],
      };

      console.log(
        "Updating billing:",
        editingBillingId,
        billingData
      );

      await updateBilling(
        editingBillingId,
        billingData
      );

      setSuccessMessage(
        "Billing record updated successfully."
      );

      setShowEditModal(false);
      setEditingBillingId(null);

      await loadBillings();

    } catch (err) {

      console.error(
        "Failed to update billing:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Unable to update billing record."
      );

    } finally {

      setEditLoading(false);

    }

  };

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const handleStatusChange = async (
    id,
    status
  ) => {

    try {

      setError("");
      setSuccessMessage("");

      await updateBillingStatus(
        id,
        status
      );

      setSuccessMessage(
        "Billing status updated successfully."
      );

      await loadBillings();

    } catch (err) {

      console.error(
        "Failed to update billing status:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to update billing status."
      );

    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (id) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this billing record?"
      );

    if (!confirmed) {
      return;
    }

    try {

      setError("");
      setSuccessMessage("");

      await deleteBilling(id);

      setSuccessMessage(
        "Billing record deleted successfully."
      );

      await loadBillings();

    } catch (err) {

      console.error(
        "Failed to delete billing:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to delete billing record."
      );

    }
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredBillings =
    statusFilter === "ALL"
      ? billings
      : billings.filter(
          (billing) =>
            billing.billingStatus ===
            statusFilter
        );

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (value) => {

    return `₹${Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;

  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="inter-billing-page">

        <div className="inter-billing-loading">

          <div className="loading-spinner"></div>

          <h3>
            Loading inter-institution billing...
          </h3>

          <p>
            Fetching billing records.
          </p>

        </div>

      </div>
    );

  }

  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="inter-billing-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="inter-billing-header">

        <div>

          <span className="page-eyebrow">
            COST MANAGEMENT
          </span>

          <h1>
            Inter-Institution Billing
          </h1>

          <p>
            Manage billing generated from
            shared equipment between institutions.
          </p>

        </div>

        <div className="inter-billing-header-actions">

          <button
            type="button"
            className="inter-billing-add-button"
            onClick={openCreateModal}
          >
            + Add Billing
          </button>

          <button
            type="button"
            className="inter-billing-refresh"
            onClick={loadBillings}
          >
            ↻ Refresh
          </button>

        </div>

      </div>

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {successMessage && (

        <div className="inter-billing-success">

          <span>✓</span>

          <div>

            <strong>
              Success
            </strong>

            <p>
              {successMessage}
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
          >
            ×
          </button>

        </div>

      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="inter-billing-error">

          <span>⚠</span>

          <div>

            <strong>
              Unable to process billing
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

      <div className="inter-billing-summary">

        <div className="inter-billing-summary-card">

          <span>
            Total Bills
          </span>

          <strong>
            {billings.length}
          </strong>

        </div>

        <div className="inter-billing-summary-card">

          <span>
            Total Usage
          </span>

          <strong>
            {billings
              .reduce(
                (sum, item) =>
                  sum +
                  Number(
                    item.usageHours || 0
                  ),
                0
              )
              .toFixed(2)}
            {" "}
            hrs
          </strong>

        </div>

        <div className="inter-billing-summary-card">

          <span>
            Total Amount
          </span>

          <strong>
            {formatCurrency(
              billings.reduce(
                (sum, item) =>
                  sum +
                  Number(
                    item.amount || 0
                  ),
                0
              )
            )}
          </strong>

        </div>

        <div className="inter-billing-summary-card">

          <span>
            Pending Billing
          </span>

          <strong>
            {billings.filter(
              (item) =>
                item.billingStatus ===
                "PENDING"
            ).length}
          </strong>

        </div>

      </div>

      {/* =====================================================
          TABLE CARD
      ===================================================== */}

      <div className="inter-billing-card">

        <div className="inter-billing-card-header">

          <div>

            <h2>
              Billing Records
            </h2>

            <p>
              Billing generated through
              inter-institution equipment sharing.
            </p>

          </div>

          <div className="inter-billing-filter">

            <label>
              Billing Status
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >

              <option value="ALL">
                All
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="GENERATED">
                Generated
              </option>

              <option value="PAID">
                Paid
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>

            </select>

          </div>

        </div>

        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="inter-billing-table-wrapper">

          <table className="inter-billing-table">

            <thead>

              <tr>

                <th>#</th>

                <th>
                  Sharing Institution
                </th>

                <th>
                  Using Institution
                </th>

                <th>
                  Equipment
                </th>

                <th>
                  Usage
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Billing Date
                </th>

                <th>
                  Status
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredBillings.length === 0 ? (

                <tr>

                  <td
                    colSpan="9"
                    className="inter-billing-empty"
                  >
                    No billing records found.
                  </td>

                </tr>

              ) : (

                filteredBillings.map(
                  (billing, index) => (

                    <tr
                      key={
                        billing.id ||
                        index
                      }
                    >

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {
                          billing
                            .sharingInstitution
                            ?.name ||
                          `Institution #${
                            billing
                              .sharingInstitution
                              ?.id ?? "-"
                          }`
                        }
                      </td>

                      <td>
                        {
                          billing
                            .usingInstitution
                            ?.name ||
                          `Institution #${
                            billing
                              .usingInstitution
                              ?.id ?? "-"
                          }`
                        }
                      </td>

                      <td>
                        {
                          billing
                            .equipment
                            ?.name ||
                          `Equipment #${
                            billing
                              .equipment
                              ?.id ?? "-"
                          }`
                        }
                      </td>

                      <td>
                        {Number(
                          billing.usageHours ||
                          0
                        ).toFixed(2)}
                        {" "}
                        hrs
                      </td>

                      <td>

                        <strong>
                          {formatCurrency(
                            billing.amount
                          )}
                        </strong>

                      </td>

                      <td>
                        {
                          billing.billingDate ||
                          "-"
                        }
                      </td>

                      <td>

                        <select
                          value={
                            billing.billingStatus ||
                            "PENDING"
                          }
                          onChange={(event) =>
                            handleStatusChange(
                              billing.id,
                              event.target.value
                            )
                          }
                          className={`billing-status-select ${
                            String(
                              billing.billingStatus ||
                              "PENDING"
                            ).toLowerCase()
                          }`}
                        >

                          <option value="PENDING">
                            Pending
                          </option>

                          <option value="GENERATED">
                            Generated
                          </option>

                          <option value="PAID">
                            Paid
                          </option>

                          <option value="CANCELLED">
                            Cancelled
                          </option>

                        </select>

                      </td>

                      <td>

                        <div className="billing-action-buttons">

                          <button
                            type="button"
                            className="billing-edit-button"
                            onClick={() =>
                              openEditModal(
                                billing
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="billing-delete-button"
                            onClick={() =>
                              handleDelete(
                                billing.id
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
          CREATE BILLING MODAL
      ===================================================== */}

      {showCreateModal && (

        <div
          className="billing-modal-overlay"
          onMouseDown={closeCreateModal}
        >

          <div
            className="billing-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="billing-modal-header">

              <div>

                <span className="page-eyebrow">
                  COST MANAGEMENT
                </span>

                <h2>
                  Add Billing Record
                </h2>

                <p>
                  Create a new inter-institution
                  billing record.
                </p>

              </div>

              <button
                type="button"
                className="billing-modal-close"
                onClick={closeCreateModal}
              >
                ×
              </button>

            </div>

            <form
              className="billing-form"
              onSubmit={
                handleCreateBilling
              }
            >

              <div className="billing-form-group">

                <label>
                  Sharing Institution
                  <span>*</span>
                </label>

                <input
                  type="number"
                  name="sharingInstitutionId"
                  value={
                    formData.sharingInstitutionId
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Enter institution ID"
                  min="1"
                  required
                />

              </div>

              <div className="billing-form-group">

                <label>
                  Using Institution
                  <span>*</span>
                </label>

                <input
                  type="number"
                  name="usingInstitutionId"
                  value={
                    formData.usingInstitutionId
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Enter institution ID"
                  min="1"
                  required
                />

              </div>

              <div className="billing-form-group">

                <label>
                  Equipment
                  <span>*</span>
                </label>

                <input
                  type="number"
                  name="equipmentId"
                  value={
                    formData.equipmentId
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Enter equipment ID"
                  min="1"
                  required
                />

              </div>

              <div className="billing-form-row">

                <div className="billing-form-group">

                  <label>
                    Usage Hours
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="usageHours"
                    value={
                      formData.usageHours
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />

                </div>

                <div className="billing-form-group">

                  <label>
                    Amount
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="amount"
                    value={
                      formData.amount
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />

                </div>

              </div>

              <div className="billing-form-row">

                <div className="billing-form-group">

                  <label>
                    Billing Status
                  </label>

                  <select
                    name="billingStatus"
                    value={
                      formData.billingStatus
                    }
                    onChange={
                      handleFormChange
                    }
                  >

                    <option value="PENDING">
                      Pending
                    </option>

                    <option value="GENERATED">
                      Generated
                    </option>

                    <option value="PAID">
                      Paid
                    </option>

                    <option value="CANCELLED">
                      Cancelled
                    </option>

                  </select>

                </div>

                <div className="billing-form-group">

                  <label>
                    Billing Date
                  </label>

                  <input
                    type="date"
                    name="billingDate"
                    value={
                      formData.billingDate
                    }
                    onChange={
                      handleFormChange
                    }
                  />

                </div>

              </div>

              <div className="billing-modal-actions">

                <button
                  type="button"
                  className="billing-cancel-button"
                  onClick={
                    closeCreateModal
                  }
                  disabled={
                    createLoading
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="billing-submit-button"
                  disabled={
                    createLoading
                  }
                >

                  {createLoading
                    ? "Creating..."
                    : "Create Billing"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          EDIT BILLING MODAL
      ===================================================== */}

      {showEditModal && (

        <div
          className="billing-modal-overlay"
          onMouseDown={closeEditModal}
        >

          <div
            className="billing-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="billing-modal-header">

              <div>

                <span className="page-eyebrow">
                  COST MANAGEMENT
                </span>

                <h2>
                  Edit Billing Record
                </h2>

                <p>
                  Update the selected
                  inter-institution billing record.
                </p>

              </div>

              <button
                type="button"
                className="billing-modal-close"
                onClick={closeEditModal}
              >
                ×
              </button>

            </div>

            <form
              className="billing-form"
              onSubmit={
                handleUpdateBilling
              }
            >

              {/* SHARING INSTITUTION */}

              <div className="billing-form-group">

                <label>
                  Sharing Institution
                  <span>*</span>
                </label>

                <input
                  type="number"
                  name="sharingInstitutionId"
                  value={
                    editFormData.sharingInstitutionId
                  }
                  onChange={
                    handleEditFormChange
                  }
                  min="1"
                  required
                />

                <small>
                  Institution that owns/provides
                  the equipment.
                </small>

              </div>

              {/* USING INSTITUTION */}

              <div className="billing-form-group">

                <label>
                  Using Institution
                  <span>*</span>
                </label>

                <input
                  type="number"
                  name="usingInstitutionId"
                  value={
                    editFormData.usingInstitutionId
                  }
                  onChange={
                    handleEditFormChange
                  }
                  min="1"
                  required
                />

                <small>
                  Institution using the
                  shared equipment.
                </small>

              </div>

              {/* EQUIPMENT */}

              <div className="billing-form-group">

                <label>
                  Equipment
                  <span>*</span>
                </label>

                <input
                  type="number"
                  name="equipmentId"
                  value={
                    editFormData.equipmentId
                  }
                  onChange={
                    handleEditFormChange
                  }
                  min="1"
                  required
                />

              </div>

              {/* USAGE + AMOUNT */}

              <div className="billing-form-row">

                <div className="billing-form-group">

                  <label>
                    Usage Hours
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="usageHours"
                    value={
                      editFormData.usageHours
                    }
                    onChange={
                      handleEditFormChange
                    }
                    min="0"
                    step="0.01"
                    required
                  />

                </div>

                <div className="billing-form-group">

                  <label>
                    Amount
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="amount"
                    value={
                      editFormData.amount
                    }
                    onChange={
                      handleEditFormChange
                    }
                    min="0"
                    step="0.01"
                    required
                  />

                </div>

              </div>

              {/* STATUS + DATE */}

              <div className="billing-form-row">

                <div className="billing-form-group">

                  <label>
                    Billing Status
                  </label>

                  <select
                    name="billingStatus"
                    value={
                      editFormData.billingStatus
                    }
                    onChange={
                      handleEditFormChange
                    }
                  >

                    <option value="PENDING">
                      Pending
                    </option>

                    <option value="GENERATED">
                      Generated
                    </option>

                    <option value="PAID">
                      Paid
                    </option>

                    <option value="CANCELLED">
                      Cancelled
                    </option>

                  </select>

                </div>

                <div className="billing-form-group">

                  <label>
                    Billing Date
                  </label>

                  <input
                    type="date"
                    name="billingDate"
                    value={
                      editFormData.billingDate
                    }
                    onChange={
                      handleEditFormChange
                    }
                  />

                </div>

              </div>

              {/* ACTIONS */}

              <div className="billing-modal-actions">

                <button
                  type="button"
                  className="billing-cancel-button"
                  onClick={
                    closeEditModal
                  }
                  disabled={
                    editLoading
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="billing-submit-button"
                  disabled={
                    editLoading
                  }
                >

                  {editLoading
                    ? "Updating..."
                    : "Update Billing"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );
}

export default InterInstitutionBilling;
