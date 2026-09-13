import React, { useEffect, useMemo, useState } from "react";

import {
  getAllCosts,
  createCost,
  updateCost,
  calculateCost,
  deleteCost,
} from "../services/costApi";

import api from "../services/api";

import "./EquipmentUsageCost.css";

const EquipmentUsageCost = () => {
  // =========================================================
  // DATA
  // =========================================================

  const [costs, setCosts] = useState([]);
  const [equipment, setEquipment] = useState([]);

  // =========================================================
  // UI STATE
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculatingId, setCalculatingId] =
    useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // MODAL
  // =========================================================

  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  // =========================================================
  // FORM
  // =========================================================

  const emptyForm = {
    equipmentId: "",
    departmentId: "",
    institutionId: "",
    costType: "",
    billingStatus: "PENDING",
    usageHours: "",
    ratePerHour: "",
    costDate: new Date()
      .toISOString()
      .split("T")[0],
    description: "",
  };

  const [formData, setFormData] =
    useState(emptyForm);

  // =========================================================
  // LOAD COSTS
  // =========================================================

  const loadCosts = async () => {
    try {
      const response = await getAllCosts();

      setCosts(
        Array.isArray(response)
          ? response
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load costs:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load cost records."
      );
    }
  };

  // =========================================================
  // LOAD EQUIPMENT
  // =========================================================

  const loadEquipment = async () => {
    try {
      const response =
        await api.get("/equipment");

      setEquipment(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load equipment:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load equipment."
      );
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        await Promise.all([
          loadCosts(),
          loadEquipment(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
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
  // SELECTED EQUIPMENT
  // =========================================================

  const selectedEquipment =
    useMemo(() => {
      return equipment.find(
        (item) =>
          String(item.id) ===
          String(formData.equipmentId)
      );
    }, [
      equipment,
      formData.equipmentId,
    ]);

  // =========================================================
  // AUTO DEPARTMENT / INSTITUTION
  // =========================================================

  useEffect(() => {
    if (!selectedEquipment) {
      return;
    }

    setFormData((previous) => ({
      ...previous,

      departmentId:
        previous.departmentId ||
        selectedEquipment.department?.id ||
        "",

      institutionId:
        previous.institutionId ||
        selectedEquipment.institution?.id ||
        "",
    }));
  }, [selectedEquipment]);

  // =========================================================
  // TOTAL COST PREVIEW
  // =========================================================

  const calculatedTotal = useMemo(() => {
    const usage =
      Number(formData.usageHours);

    const rate =
      Number(formData.ratePerHour);

    if (
      Number.isNaN(usage) ||
      Number.isNaN(rate)
    ) {
      return 0;
    }

    return usage * rate;
  }, [
    formData.usageHours,
    formData.ratePerHour,
  ]);

  // =========================================================
  // OPEN CREATE MODAL
  // =========================================================

  const openCreateModal = () => {
    setError("");
    setSuccess("");

    setEditingId(null);

    setFormData({
      ...emptyForm,
      costType:
        costs.find(
          (cost) => cost.costType
        )?.costType || "",
    });

    setShowModal(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditModal = (cost) => {
    setError("");
    setSuccess("");

    setEditingId(cost.id);

    setFormData({
      equipmentId:
        cost.equipment?.id || "",

      departmentId:
        cost.department?.id || "",

      institutionId:
        cost.institution?.id || "",

      costType:
        cost.costType || "",

      billingStatus:
        cost.billingStatus ||
        "PENDING",

      usageHours:
        cost.usageHours ?? "",

      ratePerHour:
        cost.ratePerHour ?? "",

      costDate:
        cost.costDate ||
        new Date()
          .toISOString()
          .split("T")[0],

      description:
        cost.description || "",
    });

    setShowModal(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!formData.equipmentId) {
      setError(
        "Please select equipment."
      );
      return;
    }

    if (!formData.costType) {
      setError(
        "Please select a cost type."
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
      formData.ratePerHour === "" ||
      Number(formData.ratePerHour) < 0
    ) {
      setError(
        "Rate per hour must be zero or greater."
      );
      return;
    }

    if (!formData.costDate) {
      setError(
        "Please select a cost date."
      );
      return;
    }

    // -------------------------------------------------------
    // BUILD COST OBJECT
    // -------------------------------------------------------

    const costData = {
      equipment: {
        id: Number(
          formData.equipmentId
        ),
      },

      department: formData.departmentId
        ? {
            id: Number(
              formData.departmentId
            ),
          }
        : null,

      institution:
        formData.institutionId
          ? {
              id: Number(
                formData.institutionId
              ),
            }
          : null,

      costType:
        formData.costType,

      billingStatus:
        formData.billingStatus ||
        "PENDING",

      usageHours:
        Number(
          formData.usageHours
        ),

      ratePerHour:
        Number(
          formData.ratePerHour
        ),

      costDate:
        formData.costDate,

      description:
        formData.description.trim(),
    };

    try {
      setSaving(true);

      console.log(
        "Submitting cost:",
        costData
      );

      if (editingId) {
        await updateCost(
          editingId,
          costData
        );

        setSuccess(
          "Cost record updated successfully."
        );
      } else {
        await createCost(costData);

        setSuccess(
          "Cost record created successfully."
        );
      }

      closeModal();

      await loadCosts();
    } catch (err) {
      console.error(
        "Failed to save cost:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Failed to save cost record."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // CALCULATE FROM UTILIZATION
  // =========================================================

  const handleCalculate = async (
    costId
  ) => {
    if (!costId) {
      return;
    }

    try {
      setCalculatingId(costId);
      setError("");
      setSuccess("");

      const result =
        await calculateCost(costId);

      console.log(
        "Calculated cost:",
        result
      );

      setSuccess(
        `Usage-based cost calculated successfully. Total cost: ₹${Number(
          result || 0
        ).toFixed(2)}`
      );

      await loadCosts();
    } catch (err) {
      console.error(
        "Failed to calculate cost:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Failed to calculate cost."
      );
    } finally {
      setCalculatingId(null);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (
    costId
  ) => {
    if (!costId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this cost record?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteCost(costId);

      setCosts((previous) =>
        previous.filter(
          (cost) =>
            cost.id !== costId
        )
      );

      setSuccess(
        "Cost record deleted successfully."
      );
    } catch (err) {
      console.error(
        "Failed to delete cost:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete cost record."
      );
    }
  };

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (value) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    ).format(Number(value || 0));
  };

  // =========================================================
  // EQUIPMENT NAME
  // =========================================================

  const getEquipmentName = (
    item
  ) => {
    return (
      item?.equipment?.name ||
      item?.equipment
        ?.equipmentName ||
      item?.equipment?.assetTag ||
      `Equipment #${
        item?.equipment?.id ||
        "N/A"
      }`
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="equipment-usage-page">
        <div className="usage-loading">
          Loading equipment cost data...
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="equipment-usage-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="usage-page-header">

        <div>
          <h1>
            Equipment Usage Cost
          </h1>

          <p>
            Track equipment usage,
            hourly rates and
            usage-based costs.
          </p>
        </div>

        <button
          className="usage-primary-btn"
          onClick={
            openCreateModal
          }
        >
          + Add Cost
        </button>

      </div>

      {/* =====================================================
          ALERTS
      ====================================================== */}

      {error && (
        <div className="usage-alert error">
          <span>⚠</span>
          <span>{error}</span>

          <button
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="usage-alert success">
          <span>✓</span>
          <span>{success}</span>

          <button
            onClick={() =>
              setSuccess("")
            }
          >
            ×
          </button>
        </div>
      )}

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div className="usage-summary">

        <div className="usage-summary-card">

          <span>
            Equipment Cost Records
          </span>

          <strong>
            {costs.length}
          </strong>

        </div>

        <div className="usage-summary-card">

          <span>
            Total Usage Hours
          </span>

          <strong>
            {costs
              .reduce(
                (sum, cost) =>
                  sum +
                  Number(
                    cost.usageHours ||
                      0
                  ),
                0
              )
              .toFixed(2)}
          </strong>

        </div>

        <div className="usage-summary-card">

          <span>
            Total Cost
          </span>

          <strong>
            {formatCurrency(
              costs.reduce(
                (sum, cost) =>
                  sum +
                  Number(
                    cost.totalCost ||
                      0
                  ),
                0
              )
            )}
          </strong>

        </div>

        <div className="usage-summary-card">

          <span>
            Average Rate / Hour
          </span>

          <strong>
            {formatCurrency(
              costs.length > 0
                ? costs.reduce(
                    (sum, cost) =>
                      sum +
                      Number(
                        cost.ratePerHour ||
                          0
                      ),
                    0
                  ) /
                    costs.length
                : 0
            )}
          </strong>

        </div>

      </div>

      {/* =====================================================
          COST TABLE
      ====================================================== */}

      <div className="usage-card">

        <div className="usage-card-header">

          <div>
            <h2>
              Equipment Usage Costs
            </h2>

            <p>
              Cost records associated
              with equipment usage.
            </p>
          </div>

        </div>

        {costs.length === 0 ? (
          <div className="usage-empty">

            <div className="usage-empty-icon">
              ₹
            </div>

            <h3>
              No cost records
            </h3>

            <p>
              Add your first equipment
              usage cost record.
            </p>

            <button
              className="usage-primary-btn"
              onClick={
                openCreateModal
              }
            >
              + Add Cost
            </button>

          </div>
        ) : (
          <div className="usage-table-wrapper">

            <table className="usage-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Equipment</th>
                  <th>Cost Type</th>
                  <th>Usage Hours</th>
                  <th>Rate / Hour</th>
                  <th>Total Cost</th>
                  <th>Billing Status</th>
                  <th>Cost Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {costs.map(
                  (cost) => (
                    <tr
                      key={cost.id}
                    >

                      <td>
                        #{cost.id}
                      </td>

                      <td>
                        <strong>
                          {getEquipmentName(
                            cost
                          )}
                        </strong>

                        {cost
                          .equipment
                          ?.assetTag && (
                          <small>
                            {
                              cost
                                .equipment
                                .assetTag
                            }
                          </small>
                        )}
                      </td>

                      <td>
                        <span className="usage-type-badge">
                          {cost.costType ||
                            "—"}
                        </span>
                      </td>

                      <td>
                        {Number(
                          cost.usageHours ||
                            0
                        ).toFixed(2)}
                      </td>

                      <td>
                        {formatCurrency(
                          cost.ratePerHour
                        )}
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(
                            cost.totalCost
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`usage-status ${String(
                            cost.billingStatus ||
                              "UNKNOWN"
                          ).toLowerCase()}`}
                        >
                          {cost.billingStatus ||
                            "UNKNOWN"}
                        </span>
                      </td>

                      <td>
                        {cost.costDate ||
                          "—"}
                      </td>

                      <td>

                        <div className="usage-actions">

                          <button
                            className="calculate-action"
                            onClick={() =>
                              handleCalculate(
                                cost.id
                              )
                            }
                            disabled={
                              calculatingId ===
                              cost.id
                            }
                          >
                            {calculatingId ===
                            cost.id
                              ? "Calculating..."
                              : "Calculate"}
                          </button>

                          <button
                            className="edit-action"
                            onClick={() =>
                              openEditModal(
                                cost
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-action"
                            onClick={() =>
                              handleDelete(
                                cost.id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* =====================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      {showModal && (
        <div
          className="usage-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="usage-modal">

            {/* MODAL HEADER */}

            <div className="usage-modal-header">

              <div>
                <h2>
                  {editingId
                    ? "Edit Cost Record"
                    : "Add Equipment Usage Cost"}
                </h2>

                <p>
                  Enter the cost information
                  for the equipment.
                </p>
              </div>

              <button
                className="usage-modal-close"
                onClick={
                  closeModal
                }
                disabled={saving}
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="usage-form-grid">

                {/* EQUIPMENT */}

                <div className="usage-form-group full">

                  <label>
                    Equipment
                    <span>*</span>
                  </label>

                  <select
                    name="equipmentId"
                    value={
                      formData.equipmentId
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Select Equipment
                    </option>

                    {equipment.map(
                      (item) => (
                        <option
                          key={item.id}
                          value={
                            item.id
                          }
                        >
                          {item.name ||
                            item.equipmentName ||
                            item.assetTag ||
                            `Equipment #${item.id}`}
                          {item.assetTag
                            ? ` — ${item.assetTag}`
                            : ""}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* DEPARTMENT */}

                <div className="usage-form-group">

                  <label>
                    Department ID
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
                    placeholder="Optional"
                  />

                  <small>
                    Automatically filled
                    when available from
                    equipment.
                  </small>

                </div>

                {/* INSTITUTION */}

                <div className="usage-form-group">

                  <label>
                    Institution ID
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
                    placeholder="Optional"
                  />

                  <small>
                    Automatically filled
                    when available from
                    equipment.
                  </small>

                </div>

                {/* COST TYPE */}

                <div className="usage-form-group">

                  <label>
                    Cost Type
                    <span>*</span>
                  </label>

                  <select
                    name="costType"
                    value={
                      formData.costType
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Select Cost Type
                    </option>

                    {[
                      ...new Set(
                        costs
                          .map(
                            (cost) =>
                              cost.costType
                          )
                          .filter(
                            Boolean
                          )
                      ),
                    ].map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}

                  </select>

                  <small>
                    Options are loaded
                    from existing backend
                    cost records.
                  </small>

                </div>

                {/* BILLING STATUS */}

                <div className="usage-form-group">

                  <label>
                    Billing Status
                  </label>

                  <select
                    name="billingStatus"
                    value={
                      formData.billingStatus
                    }
                    onChange={
                      handleChange
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

                {/* USAGE HOURS */}

                <div className="usage-form-group">

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
                      handleChange
                    }
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />

                </div>

                {/* RATE */}

                <div className="usage-form-group">

                  <label>
                    Rate Per Hour
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="ratePerHour"
                    value={
                      formData.ratePerHour
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

                {/* COST DATE */}

                <div className="usage-form-group">

                  <label>
                    Cost Date
                    <span>*</span>
                  </label>

                  <input
                    type="date"
                    name="costDate"
                    value={
                      formData.costDate
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                {/* DESCRIPTION */}

                <div className="usage-form-group full">

                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={
                      handleChange
                    }
                    rows="4"
                    placeholder="Enter cost description..."
                  />

                </div>

              </div>

              {/* =================================================
                  COST PREVIEW
              ================================================== */}

              <div className="usage-cost-preview">

                <div>
                  <span>
                    Usage Hours
                  </span>

                  <strong>
                    {Number(
                      formData.usageHours ||
                        0
                    ).toFixed(2)}
                  </strong>
                </div>

                <span className="preview-symbol">
                  ×
                </span>

                <div>
                  <span>
                    Rate / Hour
                  </span>

                  <strong>
                    {formatCurrency(
                      formData.ratePerHour
                    )}
                  </strong>
                </div>

                <span className="preview-symbol">
                  =
                </span>

                <div className="preview-total">

                  <span>
                    Estimated Total
                  </span>

                  <strong>
                    {formatCurrency(
                      calculatedTotal
                    )}
                  </strong>

                </div>

              </div>

              {/* =================================================
                  MODAL ACTIONS
              ================================================== */}

              <div className="usage-modal-actions">

                <button
                  type="button"
                  className="usage-cancel-btn"
                  onClick={
                    closeModal
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="usage-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Cost"
                    : "Create Cost"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default EquipmentUsageCost;