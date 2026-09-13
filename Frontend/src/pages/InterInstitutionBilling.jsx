import React, { useEffect, useMemo, useState } from "react";
import {
  getAllBillings,
  createBilling,
  updateBillingStatus,
  deleteBilling,
} from "../services/interInstitutionBillingApi";
import api from "../services/api";
import "./InterInstitutionBilling.css";

// =========================================================
// BILLING STATUS
// =========================================================

const BILLING_STATUSES = [
  "PENDING",
  "GENERATED",
  "PAID",
  "CANCELLED",
];

// =========================================================
// EMPTY FORM
// =========================================================

const getEmptyForm = () => ({
  sharingInstitutionId: "",
  usingInstitutionId: "",
  equipmentId: "",
  usageHours: "",
  amount: "",
  billingDate: new Date().toISOString().split("T")[0],
});

// =========================================================
// GET DISPLAY NAME
// =========================================================

const getName = (item, fallback = "Unknown") => {
  if (!item) return fallback;

  return (
    item.name ||
    item.institutionName ||
    item.equipmentName ||
    `ID: ${item.id ?? "-"}`
  );
};

// =========================================================
// FORMAT MONEY
// =========================================================

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// =========================================================
// FORMAT STATUS
// =========================================================

const formatStatus = (status) => {
  if (!status) return "-";

  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

// =========================================================
// COMPONENT
// =========================================================

function InterInstitutionBilling() {
  const [billings, setBillings] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [equipment, setEquipment] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const [selectedBilling, setSelectedBilling] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const [formData, setFormData] = useState(getEmptyForm());

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
        billingResponse,
        institutionResponse,
        equipmentResponse,
      ] = await Promise.all([
        getAllBillings(),
        api.get("/institutions"),
        api.get("/equipment"),
      ]);

      setBillings(billingResponse?.data || []);
      setInstitutions(institutionResponse?.data || []);
      setEquipment(equipmentResponse?.data || []);
    } catch (err) {
      console.error("Billing loading error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load inter-institution billing data."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SUMMARY
  // =========================================================

  const summary = useMemo(() => {
    const totalBilling = billings.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const totalUsageHours = billings.reduce(
      (sum, item) => sum + Number(item.usageHours || 0),
      0
    );

    return {
      totalBilling,

      totalUsageHours,

      pending: billings.filter(
        (item) => item.billingStatus === "PENDING"
      ).length,

      generated: billings.filter(
        (item) => item.billingStatus === "GENERATED"
      ).length,

      paid: billings.filter(
        (item) => item.billingStatus === "PAID"
      ).length,

      cancelled: billings.filter(
        (item) => item.billingStatus === "CANCELLED"
      ).length,
    };
  }, [billings]);

  // =========================================================
  // SEARCH + FILTER
  // =========================================================

  const filteredBillings = useMemo(() => {
    const value = search.toLowerCase().trim();

    return billings.filter((billing) => {
      const sharingInstitution = getName(
        billing.sharingInstitution,
        ""
      );

      const usingInstitution = getName(
        billing.usingInstitution,
        ""
      );

      const equipmentName = getName(
        billing.equipment,
        ""
      );

      const matchesSearch =
        !value ||
        String(billing.id || "").includes(value) ||
        sharingInstitution.toLowerCase().includes(value) ||
        usingInstitution.toLowerCase().includes(value) ||
        equipmentName.toLowerCase().includes(value);

      const matchesStatus =
        statusFilter === "ALL" ||
        billing.billingStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [billings, search, statusFilter]);

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
  // OPEN CREATE MODAL
  // =========================================================

  const openCreateModal = () => {
    setFormData(getEmptyForm());
    setError("");
    setShowModal(true);
  };

  // =========================================================
  // CLOSE CREATE MODAL
  // =========================================================

  const closeCreateModal = () => {
    if (!submitting) {
      setShowModal(false);
      setFormData(getEmptyForm());
    }
  };

  // =========================================================
  // CREATE BILLING
  // =========================================================

  const handleCreateBilling = async (event) => {
    event.preventDefault();

    if (!formData.sharingInstitutionId) {
      setError("Please select the sharing institution.");
      return;
    }

    if (!formData.usingInstitutionId) {
      setError("Please select the using institution.");
      return;
    }

    if (!formData.equipmentId) {
      setError("Please select equipment.");
      return;
    }

    if (
      Number(formData.sharingInstitutionId) ===
      Number(formData.usingInstitutionId)
    ) {
      setError(
        "Sharing institution and using institution must be different."
      );
      return;
    }

    const usageHours = Number(formData.usageHours);
    const amount = Number(formData.amount);

    if (
      formData.usageHours === "" ||
      Number.isNaN(usageHours) ||
      usageHours < 0
    ) {
      setError("Usage hours must be a valid non-negative number.");
      return;
    }

    if (
      formData.amount === "" ||
      Number.isNaN(amount) ||
      amount < 0
    ) {
      setError("Amount must be a valid non-negative amount.");
      return;
    }

    if (!formData.billingDate) {
      setError("Please select a billing date.");
      return;
    }

    // =======================================================
    // PAYLOAD MATCHING InterInstitutionBilling.java
    // =======================================================

    const billing = {
      sharingInstitution: {
        id: Number(formData.sharingInstitutionId),
      },

      usingInstitution: {
        id: Number(formData.usingInstitutionId),
      },

      equipment: {
        id: Number(formData.equipmentId),
      },

      usageHours: usageHours,

      amount: amount,

      billingStatus: "PENDING",

      billingDate: formData.billingDate,
    };

    console.log("Creating billing:", billing);

    try {
      setSubmitting(true);
      setError("");

      await createBilling(billing);

      setSuccess(
        "Inter-institution billing created successfully."
      );

      setShowModal(false);
      setFormData(getEmptyForm());

      await loadData();
    } catch (err) {
      console.error("Create billing error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Failed to create billing record."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // OPEN STATUS MODAL
  // =========================================================

  const openStatusModal = (billing) => {
    setSelectedBilling(billing);
    setNewStatus(billing.billingStatus || "PENDING");
    setError("");
    setShowStatusModal(true);
  };

  // =========================================================
  // CLOSE STATUS MODAL
  // =========================================================

  const closeStatusModal = () => {
    if (!submitting) {
      setShowStatusModal(false);
      setSelectedBilling(null);
      setNewStatus("");
    }
  };

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const handleUpdateStatus = async (event) => {
    event.preventDefault();

    if (!selectedBilling) return;

    if (!newStatus) {
      setError("Please select a billing status.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await updateBillingStatus(
        selectedBilling.id,
        newStatus
      );

      setSuccess(
        "Billing status updated successfully."
      );

      setShowStatusModal(false);
      setSelectedBilling(null);
      setNewStatus("");

      await loadData();
    } catch (err) {
      console.error(
        "Update billing status error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Failed to update billing status."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // DELETE BILLING
  // =========================================================

  const handleDelete = async (billing) => {
    const confirmed = window.confirm(
      `Delete billing record #${billing.id}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteBilling(billing.id);

      setSuccess(
        "Billing record deleted successfully."
      );

      await loadData();
    } catch (err) {
      console.error("Delete billing error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Failed to delete billing record."
      );
    }
  };

  // =========================================================
  // CLEAR SUCCESS MESSAGE
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
    <div className="inter-billing-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="inter-billing-header">

        <div>
          <h1>Inter-Institution Billing</h1>

          <p>
            Manage billing records for shared laboratory
            equipment between institutions.
          </p>
        </div>

        <button
          className="ib-primary-btn"
          onClick={openCreateModal}
        >
          + Create Billing
        </button>

      </div>

      {/* =====================================================
          ALERTS
      ===================================================== */}

      {error && (
        <div className="ib-alert ib-alert-error">

          <span>⚠️</span>

          <span>{error}</span>

          <button
            onClick={() => setError("")}
            aria-label="Close error"
          >
            ×
          </button>

        </div>
      )}

      {success && (
        <div className="ib-alert ib-alert-success">

          <span>✅</span>

          <span>{success}</span>

          <button
            onClick={() => setSuccess("")}
            aria-label="Close success"
          >
            ×
          </button>

        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="ib-summary-grid">

        <div className="ib-summary-card">
          <div className="ib-card-icon">💰</div>

          <div>
            <span>Total Billing</span>

            <strong>
              {money(summary.totalBilling)}
            </strong>
          </div>
        </div>

        <div className="ib-summary-card">
          <div className="ib-card-icon">⏱️</div>

          <div>
            <span>Usage Hours</span>

            <strong>
              {summary.totalUsageHours.toFixed(2)}
            </strong>
          </div>
        </div>

        <div className="ib-summary-card">
          <div className="ib-card-icon">⏳</div>

          <div>
            <span>Pending</span>

            <strong>
              {summary.pending}
            </strong>
          </div>
        </div>

        <div className="ib-summary-card">
          <div className="ib-card-icon">📄</div>

          <div>
            <span>Generated</span>

            <strong>
              {summary.generated}
            </strong>
          </div>
        </div>

        <div className="ib-summary-card">
          <div className="ib-card-icon">✅</div>

          <div>
            <span>Paid</span>

            <strong>
              {summary.paid}
            </strong>
          </div>
        </div>

        <div className="ib-summary-card">
          <div className="ib-card-icon">❌</div>

          <div>
            <span>Cancelled</span>

            <strong>
              {summary.cancelled}
            </strong>
          </div>
        </div>

      </div>

      {/* =====================================================
          BILLING TABLE
      ===================================================== */}

      <div className="ib-table-card">

        <div className="ib-table-header">

          <div>
            <h2>Billing Records</h2>

            <span>
              {filteredBillings.length} record
              {filteredBillings.length !== 1
                ? "s"
                : ""}
            </span>
          </div>

          <div className="ib-filters">

            <div className="ib-search">

              <span>🔍</span>

              <input
                type="text"
                placeholder="Search billing..."
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

              <option value="ALL">
                All Statuses
              </option>

              {BILLING_STATUSES.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {formatStatus(status)}
                </option>
              ))}

            </select>

          </div>

        </div>

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading ? (

          <div className="ib-loading">

            <div className="ib-spinner"></div>

            <p>
              Loading billing records...
            </p>

          </div>

        ) : filteredBillings.length === 0 ? (

          <div className="ib-empty">

            <div>💳</div>

            <h3>
              No billing records found
            </h3>

            <p>
              {search || statusFilter !== "ALL"
                ? "Try changing your search or filter."
                : "Create an inter-institution billing record to see it here."}
            </p>

          </div>

        ) : (

          <div className="ib-table-wrapper">

            <table className="ib-table">

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Sharing Institution</th>
                  <th>Using Institution</th>
                  <th>Equipment</th>
                  <th>Usage Hours</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Billing Date</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredBillings.map((billing) => {

                  const usageHours =
                    Number(billing.usageHours || 0);

                  const amount =
                    Number(billing.amount || 0);

                  return (
                    <tr key={billing.id}>

                      <td>
                        <strong>
                          #{billing.id}
                        </strong>
                      </td>

                      <td>
                        {getName(
                          billing.sharingInstitution
                        )}
                      </td>

                      <td>
                        {getName(
                          billing.usingInstitution
                        )}
                      </td>

                      <td>
                        {getName(
                          billing.equipment
                        )}
                      </td>

                      <td>
                        {usageHours.toFixed(2)} hrs
                      </td>

                      <td>
                        <strong>
                          {money(amount)}
                        </strong>
                      </td>

                      <td>

                        <span
                          className={`ib-status ib-status-${String(
                            billing.billingStatus || ""
                          ).toLowerCase()}`}
                        >
                          {formatStatus(
                            billing.billingStatus
                          )}
                        </span>

                      </td>

                      <td>
                        {billing.billingDate || "-"}
                      </td>

                      <td>

                        <div className="ib-actions">

                          <button
                            className="ib-action-btn ib-action-status"
                            title="Update status"
                            onClick={() =>
                              openStatusModal(
                                billing
                              )
                            }
                          >
                            🔄
                          </button>

                          <button
                            className="ib-action-btn ib-action-delete"
                            title="Delete billing"
                            onClick={() =>
                              handleDelete(
                                billing
                              )
                            }
                          >
                            🗑
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =====================================================
          CREATE BILLING MODAL
      ===================================================== */}

      {showModal && (

        <div className="ib-modal-overlay">

          <div className="ib-modal">

            <div className="ib-modal-header">

              <div>
                <h2>
                  Create Inter-Institution Billing
                </h2>

                <p>
                  Add a new billing record for shared
                  equipment.
                </p>
              </div>

              <button
                className="ib-modal-close"
                onClick={closeCreateModal}
                disabled={submitting}
              >
                ×
              </button>

            </div>

            <form
              className="ib-form"
              onSubmit={handleCreateBilling}
            >

              <div className="ib-form-grid">

                {/* SHARING INSTITUTION */}

                <div className="ib-form-group">

                  <label>
                    Sharing Institution
                    <span>*</span>
                  </label>

                  <select
                    name="sharingInstitutionId"
                    value={
                      formData.sharingInstitutionId
                    }
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select sharing institution
                    </option>

                    {institutions.map(
                      (institution) => (
                        <option
                          key={institution.id}
                          value={institution.id}
                        >
                          {getName(institution)}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* USING INSTITUTION */}

                <div className="ib-form-group">

                  <label>
                    Using Institution
                    <span>*</span>
                  </label>

                  <select
                    name="usingInstitutionId"
                    value={
                      formData.usingInstitutionId
                    }
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select using institution
                    </option>

                    {institutions.map(
                      (institution) => (
                        <option
                          key={institution.id}
                          value={institution.id}
                        >
                          {getName(institution)}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* EQUIPMENT */}

                <div className="ib-form-group">

                  <label>
                    Equipment
                    <span>*</span>
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
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {getName(item)}
                      </option>
                    ))}

                  </select>

                </div>

                {/* USAGE HOURS */}

                <div className="ib-form-group">

                  <label>
                    Usage Hours
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="usageHours"
                    min="0"
                    step="0.01"
                    placeholder="Enter usage hours"
                    value={formData.usageHours}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* AMOUNT */}

                <div className="ib-form-group">

                  <label>
                    Billing Amount
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="amount"
                    min="0"
                    step="0.01"
                    placeholder="Enter billing amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* DATE */}

                <div className="ib-form-group">

                  <label>
                    Billing Date
                    <span>*</span>
                  </label>

                  <input
                    type="date"
                    name="billingDate"
                    value={formData.billingDate}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* =================================================
                  BILLING PREVIEW
              ================================================= */}

              <div className="ib-amount-preview">

                <div>

                  <span>
                    Usage Hours
                  </span>

                  <strong>
                    {Number(
                      formData.usageHours || 0
                    ).toFixed(2)}{" "}
                    hrs
                  </strong>

                </div>

                <div>

                  <span>
                    Billing Amount
                  </span>

                  <strong>
                    {money(formData.amount)}
                  </strong>

                </div>

                <div>

                  <span>
                    Initial Status
                  </span>

                  <strong>
                    Pending
                  </strong>

                </div>

              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="ib-modal-footer">

                <button
                  type="button"
                  className="ib-secondary-btn"
                  onClick={closeCreateModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ib-primary-btn"
                  disabled={submitting}
                >
                  {submitting
                    ? "Creating..."
                    : "Create Billing"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          STATUS MODAL
      ===================================================== */}

      {showStatusModal && selectedBilling && (

        <div className="ib-modal-overlay">

          <div className="ib-modal ib-small-modal">

            <div className="ib-modal-header">

              <div>
                <h2>
                  Update Billing Status
                </h2>

                <p>
                  Billing #{selectedBilling.id}
                </p>
              </div>

              <button
                className="ib-modal-close"
                onClick={closeStatusModal}
                disabled={submitting}
              >
                ×
              </button>

            </div>

            <form
              className="ib-form"
              onSubmit={handleUpdateStatus}
            >

              <div className="ib-current-status">

                <span>
                  Current Status
                </span>

                <strong
                  className={`ib-status ib-status-${String(
                    selectedBilling.billingStatus || ""
                  ).toLowerCase()}`}
                >
                  {formatStatus(
                    selectedBilling.billingStatus
                  )}
                </strong>

              </div>

              <div className="ib-form-group">

                <label>
                  New Status
                </label>

                <select
                  value={newStatus}
                  onChange={(event) =>
                    setNewStatus(
                      event.target.value
                    )
                  }
                  required
                >

                  {BILLING_STATUSES.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {formatStatus(status)}
                      </option>
                    )
                  )}

                </select>

              </div>

              <div className="ib-modal-footer">

                <button
                  type="button"
                  className="ib-secondary-btn"
                  onClick={closeStatusModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ib-primary-btn"
                  disabled={submitting}
                >
                  {submitting
                    ? "Updating..."
                    : "Update Status"}
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