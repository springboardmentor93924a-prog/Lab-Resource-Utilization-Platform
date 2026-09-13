import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";

import {
  getAllBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  addUsedAmount,
  updateUsedAmount,
  updateBudgetStatus,
  markAsExhausted,
} from "../services/budgetApi";

import "./BudgetUtilization.css";

const BUDGET_STATUSES = [
  "ACTIVE",
  "EXHAUSTED",
  "CLOSED",
];

const emptyForm = {
  departmentId: "",
  institutionId: "",
  budgetAmount: "",
  usedAmount: "",
  financialYear: "",
  budgetStatus: "ACTIVE",
};

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getDepartmentName = (budget) => {
  return (
    budget?.department?.name ||
    budget?.department?.departmentName ||
    `Department ${budget?.department?.id || "-"}`
  );
};

const getInstitutionName = (budget) => {
  return (
    budget?.institution?.name ||
    budget?.institution?.institutionName ||
    `Institution ${budget?.institution?.id || "-"}`
  );
};

const getRemaining = (budget) => {
  const allocated = Number(budget?.budgetAmount || 0);
  const used = Number(budget?.usedAmount || 0);

  return Math.max(allocated - used, 0);
};

const getUtilization = (budget) => {
  const allocated = Number(budget?.budgetAmount || 0);
  const used = Number(budget?.usedAmount || 0);

  if (allocated <= 0) {
    return 0;
  }

  return Math.min((used / allocated) * 100, 100);
};

function BudgetUtilization() {
  const [budgets, setBudgets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [institutions, setInstitutions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [institutionFilter, setInstitutionFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const [showUsedModal, setShowUsedModal] = useState(false);
  const [usedBudget, setUsedBudget] = useState(null);
  const [usedAmount, setUsedAmount] = useState("");

  const [formData, setFormData] = useState(emptyForm);

  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [budgetResponse, departmentResponse, institutionResponse] =
        await Promise.all([
          getAllBudgets(),
          api.get("/departments"),
          api.get("/institutions"),
        ]);

      setBudgets(
        Array.isArray(budgetResponse)
          ? budgetResponse
          : []
      );

      setDepartments(
        Array.isArray(departmentResponse.data)
          ? departmentResponse.data
          : []
      );

      setInstitutions(
        Array.isArray(institutionResponse.data)
          ? institutionResponse.data
          : []
      );
    } catch (err) {
      console.error("Budget loading error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load budget data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // CLEAR NOTIFICATIONS
  // =========================================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // =========================================================
  // FINANCIAL YEARS
  // =========================================================

  const financialYears = useMemo(() => {
    return [
      ...new Set(
        budgets
          .map((budget) => budget.financialYear)
          .filter(Boolean)
      ),
    ].sort();
  }, [budgets]);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredBudgets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return budgets.filter((budget) => {
      const departmentId =
        budget?.department?.id?.toString();

      const institutionId =
        budget?.institution?.id?.toString();

      const departmentName =
        getDepartmentName(budget).toLowerCase();

      const institutionName =
        getInstitutionName(budget).toLowerCase();

      const matchesSearch =
        !query ||
        departmentName.includes(query) ||
        institutionName.includes(query) ||
        String(budget?.financialYear || "")
          .toLowerCase()
          .includes(query) ||
        String(budget?.budgetStatus || "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        budget?.budgetStatus === statusFilter;

      const matchesYear =
        yearFilter === "ALL" ||
        budget?.financialYear === yearFilter;

      const matchesDepartment =
        departmentFilter === "ALL" ||
        departmentId === String(departmentFilter);

      const matchesInstitution =
        institutionFilter === "ALL" ||
        institutionId === String(institutionFilter);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesYear &&
        matchesDepartment &&
        matchesInstitution
      );
    });
  }, [
    budgets,
    search,
    statusFilter,
    yearFilter,
    departmentFilter,
    institutionFilter,
  ]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const summary = useMemo(() => {
    const totalBudget = filteredBudgets.reduce(
      (sum, budget) =>
        sum + Number(budget?.budgetAmount || 0),
      0
    );

    const totalUsed = filteredBudgets.reduce(
      (sum, budget) =>
        sum + Number(budget?.usedAmount || 0),
      0
    );

    const totalRemaining = filteredBudgets.reduce(
      (sum, budget) =>
        sum + getRemaining(budget),
      0
    );

    const utilization =
      totalBudget > 0
        ? Math.min(
            (totalUsed / totalBudget) * 100,
            100
          )
        : 0;

    const active = filteredBudgets.filter(
      (budget) =>
        budget?.budgetStatus === "ACTIVE"
    ).length;

    const exhausted = filteredBudgets.filter(
      (budget) =>
        budget?.budgetStatus === "EXHAUSTED"
    ).length;

    const closed = filteredBudgets.filter(
      (budget) =>
        budget?.budgetStatus === "CLOSED"
    ).length;

    return {
      totalBudget,
      totalUsed,
      totalRemaining,
      utilization,
      active,
      exhausted,
      closed,
    };
  }, [filteredBudgets]);

  // =========================================================
  // OPEN CREATE
  // =========================================================

  const openCreateModal = () => {
    clearMessages();

    setEditingBudget(null);

    setFormData({
      ...emptyForm,
      financialYear: getCurrentFinancialYear(),
    });

    setShowModal(true);
  };

  // =========================================================
  // OPEN EDIT
  // =========================================================

  const openEditModal = (budget) => {
    clearMessages();

    setEditingBudget(budget);

    setFormData({
      departmentId:
        budget?.department?.id || "",
      institutionId:
        budget?.institution?.id || "",
      budgetAmount:
        budget?.budgetAmount ?? "",
      usedAmount:
        budget?.usedAmount ?? 0,
      financialYear:
        budget?.financialYear || "",
      budgetStatus:
        budget?.budgetStatus || "ACTIVE",
    });

    setShowModal(true);
  };

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // SAVE BUDGET
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    clearMessages();

    const budgetAmount =
      Number(formData.budgetAmount);

    const usedAmount =
      Number(formData.usedAmount || 0);

    if (
      !formData.departmentId &&
      !formData.institutionId
    ) {
      setError(
        "Select a department or institution."
      );
      return;
    }

    if (
      !Number.isFinite(budgetAmount) ||
      budgetAmount < 0
    ) {
      setError(
        "Budget amount must be 0 or greater."
      );
      return;
    }

    if (
      !Number.isFinite(usedAmount) ||
      usedAmount < 0
    ) {
      setError(
        "Used amount must be 0 or greater."
      );
      return;
    }

    if (usedAmount > budgetAmount) {
      setError(
        "Used amount cannot exceed budget amount."
      );
      return;
    }

    if (!formData.financialYear.trim()) {
      setError("Financial year is required.");
      return;
    }

    const payload = {
      department: formData.departmentId
        ? {
            id: Number(formData.departmentId),
          }
        : null,

      institution: formData.institutionId
        ? {
            id: Number(formData.institutionId),
          }
        : null,

      budgetAmount,
      usedAmount,
      financialYear:
        formData.financialYear.trim(),

      budgetStatus:
        formData.budgetStatus || "ACTIVE",
    };

    try {
      setSaving(true);

      if (editingBudget) {
        await updateBudget(
          editingBudget.id,
          payload
        );

        setSuccess(
          "Budget updated successfully."
        );
      } else {
        await createBudget(payload);

        setSuccess(
          "Budget created successfully."
        );
      }

      setShowModal(false);
      setEditingBudget(null);
      setFormData(emptyForm);

      await loadData();
    } catch (err) {
      console.error("Budget save error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to save budget."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (budget) => {
    if (!budget?.id) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmed) {
      return;
    }

    try {
      clearMessages();

      await deleteBudget(budget.id);

      setSuccess(
        "Budget deleted successfully."
      );

      await loadData();
    } catch (err) {
      console.error("Budget delete error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to delete budget."
      );
    }
  };

  // =========================================================
  // OPEN USED AMOUNT MODAL
  // =========================================================

  const openUsedAmountModal = (budget) => {
    clearMessages();

    setUsedBudget(budget);
    setUsedAmount(
      budget?.usedAmount ?? 0
    );

    setShowUsedModal(true);
  };

  // =========================================================
  // UPDATE USED AMOUNT
  // =========================================================

  const handleUsedAmountUpdate = async (
    event
  ) => {
    event.preventDefault();

    if (!usedBudget?.id) {
      return;
    }

    const amount = Number(usedAmount);

    if (!Number.isFinite(amount) || amount < 0) {
      setError(
        "Used amount must be 0 or greater."
      );
      return;
    }

    if (
      amount >
      Number(usedBudget.budgetAmount || 0)
    ) {
      setError(
        "Used amount cannot exceed budget amount."
      );
      return;
    }

    try {
      setSaving(true);
      clearMessages();

      await updateUsedAmount(
        usedBudget.id,
        amount
      );

      setSuccess(
        "Used amount updated successfully."
      );

      setShowUsedModal(false);
      setUsedBudget(null);
      setUsedAmount("");

      await loadData();
    } catch (err) {
      console.error(
        "Used amount update error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to update used amount."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // ADD USED AMOUNT
  // =========================================================

  const handleAddUsedAmount = async (budget) => {
    if (!budget?.id) {
      return;
    }

    const value = window.prompt(
      "Enter amount to add:"
    );

    if (value === null) {
      return;
    }

    const amount = Number(value);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError(
        "Enter a valid amount greater than 0."
      );
      return;
    }

    const currentUsed =
      Number(budget.usedAmount || 0);

    const total =
      currentUsed + amount;

    if (
      total >
      Number(budget.budgetAmount || 0)
    ) {
      setError(
        "Added amount would exceed the budget."
      );
      return;
    }

    try {
      clearMessages();

      await addUsedAmount(
        budget.id,
        amount
      );

      setSuccess(
        "Used amount added successfully."
      );

      await loadData();
    } catch (err) {
      console.error(
        "Add used amount error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to add used amount."
      );
    }
  };

  // =========================================================
  // STATUS UPDATE
  // =========================================================

  const handleStatusChange = async (
    budget,
    status
  ) => {
    if (!budget?.id) {
      return;
    }

    try {
      clearMessages();

      await updateBudgetStatus(
        budget.id,
        status
      );

      setSuccess(
        "Budget status updated successfully."
      );

      await loadData();
    } catch (err) {
      console.error(
        "Status update error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to update status."
      );
    }
  };

  // =========================================================
  // MARK EXHAUSTED
  // =========================================================

  const handleMarkExhausted = async (
    budget
  ) => {
    if (!budget?.id) {
      return;
    }

    const confirmed = window.confirm(
      "Mark this budget as exhausted?"
    );

    if (!confirmed) {
      return;
    }

    try {
      clearMessages();

      await markAsExhausted(
        budget.id
      );

      setSuccess(
        "Budget marked as exhausted."
      );

      await loadData();
    } catch (err) {
      console.error(
        "Mark exhausted error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to mark budget as exhausted."
      );
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="budget-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="budget-header">
        <div>
          <h1>Budget Utilization</h1>

          <p>
            Monitor allocated budget, spending,
            remaining funds and utilization.
          </p>
        </div>

        <button
          className="budget-primary-btn"
          onClick={openCreateModal}
        >
          + Add Budget
        </button>
      </div>

      {/* =====================================================
          NOTIFICATIONS
      ===================================================== */}

      {success && (
        <div className="budget-alert success">
          {success}
        </div>
      )}

      {error && (
        <div className="budget-alert error">
          {error}
        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="budget-summary-grid">

        <div className="budget-summary-card">
          <div className="summary-icon">₹</div>

          <div>
            <span>Total Allocated</span>

            <strong>
              {formatCurrency(
                summary.totalBudget
              )}
            </strong>
          </div>
        </div>

        <div className="budget-summary-card">
          <div className="summary-icon">↗</div>

          <div>
            <span>Total Used</span>

            <strong>
              {formatCurrency(
                summary.totalUsed
              )}
            </strong>
          </div>
        </div>

        <div className="budget-summary-card">
          <div className="summary-icon">✓</div>

          <div>
            <span>Total Remaining</span>

            <strong>
              {formatCurrency(
                summary.totalRemaining
              )}
            </strong>
          </div>
        </div>

        <div className="budget-summary-card">
          <div className="summary-icon">%</div>

          <div>
            <span>Overall Utilization</span>

            <strong>
              {summary.utilization.toFixed(1)}%
            </strong>
          </div>
        </div>

      </div>

      {/* =====================================================
          STATUS SUMMARY
      ===================================================== */}

      <div className="budget-status-row">

        <div className="status-count active">
          <span>Active</span>
          <strong>{summary.active}</strong>
        </div>

        <div className="status-count exhausted">
          <span>Exhausted</span>
          <strong>{summary.exhausted}</strong>
        </div>

        <div className="status-count closed">
          <span>Closed</span>
          <strong>{summary.closed}</strong>
        </div>

      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="budget-filter-panel">

        <div className="budget-search">
          <label>Search</label>

          <input
            type="text"
            placeholder="Search department, institution..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div>
          <label>Financial Year</label>

          <select
            value={yearFilter}
            onChange={(event) =>
              setYearFilter(event.target.value)
            }
          >
            <option value="ALL">
              All Years
            </option>

            {financialYears.map((year) => (
              <option
                key={year}
                value={year}
              >
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Department</label>

          <select
            value={departmentFilter}
            onChange={(event) =>
              setDepartmentFilter(
                event.target.value
              )
            }
          >
            <option value="ALL">
              All Departments
            </option>

            {departments.map((department) => (
              <option
                key={department.id}
                value={department.id}
              >
                {department.name ||
                  department.departmentName ||
                  `Department ${department.id}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Institution</label>

          <select
            value={institutionFilter}
            onChange={(event) =>
              setInstitutionFilter(
                event.target.value
              )
            }
          >
            <option value="ALL">
              All Institutions
            </option>

            {institutions.map((institution) => (
              <option
                key={institution.id}
                value={institution.id}
              >
                {institution.name ||
                  institution.institutionName ||
                  `Institution ${institution.id}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Status</label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="ALL">
              All Statuses
            </option>

            {BUDGET_STATUSES.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* =====================================================
          BUDGET TABLE
      ===================================================== */}

      <div className="budget-table-card">

        <div className="budget-table-header">
          <div>
            <h2>Budget Details</h2>

            <span>
              {filteredBudgets.length} budget
              {filteredBudgets.length !== 1
                ? "s"
                : ""}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="budget-loading">
            <div className="budget-spinner"></div>
            <p>Loading budget data...</p>
          </div>
        ) : filteredBudgets.length === 0 ? (
          <div className="budget-empty">
            <div className="empty-icon">₹</div>

            <h3>No budgets found</h3>

            <p>
              Create a budget or change the
              filters.
            </p>
          </div>
        ) : (
          <div className="budget-table-wrapper">

            <table className="budget-table">

              <thead>
                <tr>
                  <th>Department</th>
                  <th>Institution</th>
                  <th>Financial Year</th>
                  <th>Allocated</th>
                  <th>Used</th>
                  <th>Remaining</th>
                  <th>Utilization</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredBudgets.map((budget) => {
                  const utilization =
                    getUtilization(budget);

                  const remaining =
                    getRemaining(budget);

                  return (
                    <tr key={budget.id}>

                      <td>
                        <strong>
                          {getDepartmentName(
                            budget
                          )}
                        </strong>
                      </td>

                      <td>
                        {getInstitutionName(
                          budget
                        )}
                      </td>

                      <td>
                        {budget.financialYear}
                      </td>

                      <td>
                        {formatCurrency(
                          budget.budgetAmount
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          budget.usedAmount
                        )}
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(
                            remaining
                          )}
                        </strong>
                      </td>

                      <td>
                        <div className="utilization-cell">

                          <div className="utilization-value">
                            {utilization.toFixed(1)}%
                          </div>

                          <div className="progress-track">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${utilization}%`,
                              }}
                            ></div>
                          </div>

                        </div>
                      </td>

                      <td>
                        <span
                          className={`budget-status ${String(
                            budget.budgetStatus
                          ).toLowerCase()}`}
                        >
                          {budget.budgetStatus}
                        </span>
                      </td>

                      <td>

                        <div className="budget-actions">

                          <button
                            className="action-btn edit"
                            onClick={() =>
                              openEditModal(
                                budget
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="action-btn used"
                            onClick={() =>
                              openUsedAmountModal(
                                budget
                              )
                            }
                          >
                            Used
                          </button>

                          <button
                            className="action-btn add"
                            onClick={() =>
                              handleAddUsedAmount(
                                budget
                              )
                            }
                          >
                            + Cost
                          </button>

                          {budget.budgetStatus !==
                            "EXHAUSTED" && (
                            <button
                              className="action-btn exhaust"
                              onClick={() =>
                                handleMarkExhausted(
                                  budget
                                )
                              }
                            >
                              Exhaust
                            </button>
                          )}

                          <select
                            className="status-select"
                            value={
                              budget.budgetStatus
                            }
                            onChange={(event) =>
                              handleStatusChange(
                                budget,
                                event.target.value
                              )
                            }
                          >
                            {BUDGET_STATUSES.map(
                              (status) => (
                                <option
                                  key={status}
                                  value={status}
                                >
                                  {status}
                                </option>
                              )
                            )}
                          </select>

                          <button
                            className="action-btn delete"
                            onClick={() =>
                              handleDelete(
                                budget
                              )
                            }
                          >
                            Delete
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
          CREATE / EDIT MODAL
      ===================================================== */}

      {showModal && (
        <div
          className="budget-modal-overlay"
          onMouseDown={() =>
            setShowModal(false)
          }
        >

          <div
            className="budget-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="budget-modal-header">

              <div>
                <h2>
                  {editingBudget
                    ? "Edit Budget"
                    : "Add Budget"}
                </h2>

                <p>
                  Enter budget allocation details.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowModal(false)
                }
              >
                ×
              </button>

            </div>

            <form
              className="budget-form"
              onSubmit={handleSubmit}
            >

              <div className="form-grid">

                <div className="form-group">
                  <label>
                    Department
                  </label>

                  <select
                    name="departmentId"
                    value={
                      formData.departmentId
                    }
                    onChange={handleChange}
                  >
                    <option value="">
                      Select Department
                    </option>

                    {departments.map(
                      (department) => (
                        <option
                          key={department.id}
                          value={department.id}
                        >
                          {department.name ||
                            department.departmentName ||
                            `Department ${department.id}`}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Institution
                  </label>

                  <select
                    name="institutionId"
                    value={
                      formData.institutionId
                    }
                    onChange={handleChange}
                  >
                    <option value="">
                      Select Institution
                    </option>

                    {institutions.map(
                      (institution) => (
                        <option
                          key={institution.id}
                          value={institution.id}
                        >
                          {institution.name ||
                            institution.institutionName ||
                            `Institution ${institution.id}`}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Budget Amount
                  </label>

                  <input
                    type="number"
                    name="budgetAmount"
                    min="0"
                    step="0.01"
                    value={
                      formData.budgetAmount
                    }
                    onChange={handleChange}
                    placeholder="Enter allocated amount"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Used Amount
                  </label>

                  <input
                    type="number"
                    name="usedAmount"
                    min="0"
                    step="0.01"
                    value={
                      formData.usedAmount
                    }
                    onChange={handleChange}
                    placeholder="Enter used amount"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Financial Year
                  </label>

                  <input
                    type="text"
                    name="financialYear"
                    value={
                      formData.financialYear
                    }
                    onChange={handleChange}
                    placeholder="e.g. 2026-27"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Budget Status
                  </label>

                  <select
                    name="budgetStatus"
                    value={
                      formData.budgetStatus
                    }
                    onChange={handleChange}
                  >
                    {BUDGET_STATUSES.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>
                </div>

              </div>

              <div className="budget-form-info">
                <span>
                  Remaining
                </span>

                <strong>
                  {formatCurrency(
                    Math.max(
                      Number(
                        formData.budgetAmount ||
                          0
                      ) -
                        Number(
                          formData.usedAmount ||
                            0
                        ),
                      0
                    )
                  )}
                </strong>
              </div>

              <div className="budget-modal-footer">

                <button
                  type="button"
                  className="budget-secondary-btn"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="budget-primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingBudget
                    ? "Update Budget"
                    : "Create Budget"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          USED AMOUNT MODAL
      ===================================================== */}

      {showUsedModal && (
        <div
          className="budget-modal-overlay"
          onMouseDown={() =>
            setShowUsedModal(false)
          }
        >

          <div
            className="budget-modal small"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="budget-modal-header">

              <div>
                <h2>
                  Update Used Amount
                </h2>

                <p>
                  {usedBudget
                    ? getDepartmentName(
                        usedBudget
                      )
                    : ""}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowUsedModal(false)
                }
              >
                ×
              </button>

            </div>

            <form
              className="budget-form"
              onSubmit={
                handleUsedAmountUpdate
              }
            >

              <div className="used-amount-info">

                <div>
                  <span>Allocated</span>
                  <strong>
                    {formatCurrency(
                      usedBudget?.budgetAmount
                    )}
                  </strong>
                </div>

                <div>
                  <span>Current Used</span>
                  <strong>
                    {formatCurrency(
                      usedBudget?.usedAmount
                    )}
                  </strong>
                </div>

              </div>

              <div className="form-group">
                <label>
                  New Used Amount
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={usedAmount}
                  onChange={(event) =>
                    setUsedAmount(
                      event.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="budget-modal-footer">

                <button
                  type="button"
                  className="budget-secondary-btn"
                  onClick={() =>
                    setShowUsedModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="budget-primary-btn"
                  disabled={saving}
                >
                  {saving
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

// =========================================================
// CURRENT FINANCIAL YEAR
// =========================================================

function getCurrentFinancialYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  if (month >= 4) {
    return `${year}-${String(
      (year + 1) % 100
    ).padStart(2, "0")}`;
  }

  return `${year - 1}-${String(
    year % 100
  ).padStart(2, "0")}`;
}

export default BudgetUtilization;