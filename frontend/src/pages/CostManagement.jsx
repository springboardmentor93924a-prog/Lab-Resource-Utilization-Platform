import { useEffect, useState, useCallback } from "react";
import "./CostManagement.css";

const API_BASE_URL = "http://localhost:8080/api";

function CostManagement() {
  const [activeTab, setActiveTab] = useState("usage");

  // ---- Usage & Rates state (existing) ----
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState("");
  const [generating, setGenerating] = useState(false);
  const [rateDrafts, setRateDrafts] = useState({});

  // ---- Budgets state ----
  const [budgets, setBudgets] = useState([]);
  const [budgetsLoading, setBudgetsLoading] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    departmentId: "",
    periodStart: "",
    periodEnd: "",
    budgetAmount: "",
    notes: "",
  });

  // ---- Chargebacks state ----
  const [chargebacks, setChargebacks] = useState([]);
  const [chargebacksLoading, setChargebacksLoading] = useState(false);
  const [chargebackGenerating, setChargebackGenerating] = useState(false);

  // ---- Invoices state ----
  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    billTo: "department", // "department" | "institution"
    departmentId: "",
    institutionId: "",
    periodStart: "",
    periodEnd: "",
  });
  const [invoiceGenerating, setInvoiceGenerating] = useState(false);

  // ---- Shared lookups ----
  const [departments, setDepartments] = useState([]);
  const [institutions, setInstitutions] = useState([]);

  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");

  const canEdit = [
    "LAB_MANAGER",
    "DEPARTMENT_HEAD",
    "INSTITUTION_ADMIN",
    "SYSTEM_ADMIN",
  ].includes(role);

  // Budgets/Chargebacks/Invoices are Institution Admin + System Admin
  // only, matching the backend's @PreAuthorize on those controllers.
  const canManageFinance = ["INSTITUTION_ADMIN", "SYSTEM_ADMIN"].includes(role);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // =========================================================
  // Usage & Rates (existing)
  // =========================================================
  const fetchAll = useCallback(async () => {
    try {
      setError("");

      const [recordsRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/costs`, { headers: authHeaders }),
        fetch(`${API_BASE_URL}/costs/summary`, { headers: authHeaders }),
      ]);

      if (!recordsRes.ok || !summaryRes.ok) {
        throw new Error("Failed to load cost data.");
      }

      const recordsData = await recordsRes.json();
      const summaryData = await summaryRes.json();

      setRecords(recordsData);
      setSummary(summaryData);
    } catch (err) {
      console.error(err);
      setError(
        "Could not load cost management data. Please try again shortly."
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Departments/institutions are used by the Budgets and Invoices
  // forms, so load them once up front for anyone who can manage finance.
  useEffect(() => {
    if (!canManageFinance) return;

    fetch(`${API_BASE_URL}/departments`, { headers: authHeaders })
      .then((res) => (res.ok ? res.json() : []))
      .then(setDepartments)
      .catch(() => {});

    fetch(`${API_BASE_URL}/institutions`, { headers: authHeaders })
      .then((res) => (res.ok ? res.json() : []))
      .then(setInstitutions)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageFinance, token]);

  const handleGenerate = async () => {
    setGenerating(true);
    setBanner("");
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/costs/generate`, {
        method: "POST",
        headers: authHeaders,
      });

      if (!res.ok) {
        throw new Error("Failed to generate cost records.");
      }

      const data = await res.json();
      setBanner(data.message || "Cost records generated.");
      await fetchAll();
    } catch (err) {
      console.error(err);
      setError("Could not generate cost records.");
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (usageCostId, newStatus) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/costs/${usageCostId}/status`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({ costStatus: newStatus }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update status.");
      }

      const updated = await res.json();

      setRecords((prev) =>
        prev.map((r) =>
          r.usageCostId === updated.usageCostId ? updated : r
        )
      );

      // Summary totals depend on status, so refresh it too.
      const summaryRes = await fetch(`${API_BASE_URL}/costs/summary`, {
        headers: authHeaders,
      });
      if (summaryRes.ok) {
        setSummary(await summaryRes.json());
      }
    } catch (err) {
      console.error(err);
      setError("Could not update the cost status.");
    }
  };

  const handleRateSave = async (equipmentId) => {
    const draft = rateDrafts[equipmentId];

    if (draft === undefined || draft === "" || Number(draft) < 0) {
      setError("Enter a valid non-negative rate before saving.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/costs/equipment/${equipmentId}/rate`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({ ratePerHour: Number(draft) }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update rate.");
      }

      setBanner("Hourly rate updated.");
      await fetchAll();
    } catch (err) {
      console.error(err);
      setError("Could not update the equipment rate.");
    }
  };

  // =========================================================
  // Budgets
  // =========================================================
  const fetchBudgets = useCallback(async () => {
    setBudgetsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/budgets`, {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Failed to load budgets.");
      setBudgets(await res.json());
    } catch (err) {
      console.error(err);
      setError("Could not load budgets.");
    } finally {
      setBudgetsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (activeTab === "budgets" && canManageFinance) {
      fetchBudgets();
    }
  }, [activeTab, canManageFinance, fetchBudgets]);

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    setError("");
    setBanner("");

    if (!budgetForm.periodStart || !budgetForm.periodEnd || !budgetForm.budgetAmount) {
      setError("Period start, period end, and amount are required.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/budgets`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          departmentId: budgetForm.departmentId || null,
          periodStart: budgetForm.periodStart,
          periodEnd: budgetForm.periodEnd,
          budgetAmount: Number(budgetForm.budgetAmount),
          notes: budgetForm.notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to create budget.");
      }

      setBanner("Budget created.");
      setBudgetForm({
        departmentId: "",
        periodStart: "",
        periodEnd: "",
        budgetAmount: "",
        notes: "",
      });
      await fetchBudgets();
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not create budget.");
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/budgets/${budgetId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Failed to delete budget.");
      setBudgets((prev) => prev.filter((b) => b.budgetId !== budgetId));
    } catch (err) {
      console.error(err);
      setError("Could not delete the budget.");
    }
  };

  // =========================================================
  // Chargebacks
  // =========================================================
  const fetchChargebacks = useCallback(async () => {
    setChargebacksLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/chargebacks`, {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Failed to load chargebacks.");
      setChargebacks(await res.json());
    } catch (err) {
      console.error(err);
      setError("Could not load chargebacks.");
    } finally {
      setChargebacksLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (activeTab === "chargebacks" && canManageFinance) {
      fetchChargebacks();
    }
  }, [activeTab, canManageFinance, fetchChargebacks]);

  const handleGenerateChargebacks = async () => {
    setChargebackGenerating(true);
    setBanner("");
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/chargebacks/generate`, {
        method: "POST",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Failed to generate chargebacks.");
      const data = await res.json();
      setBanner(data.message || "Chargebacks generated.");
      await fetchChargebacks();
    } catch (err) {
      console.error(err);
      setError("Could not generate chargebacks.");
    } finally {
      setChargebackGenerating(false);
    }
  };

  const handleChargebackAction = async (chargebackId, action, remarks) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/chargebacks/${chargebackId}/${action}`,
        {
          method: "PUT",
          headers: authHeaders,
          body: action === "dispute" ? JSON.stringify({ remarks }) : undefined,
        }
      );
      if (!res.ok) throw new Error(`Failed to ${action} chargeback.`);
      const updated = await res.json();
      setChargebacks((prev) =>
        prev.map((c) => (c.chargebackId === updated.chargebackId ? updated : c))
      );
    } catch (err) {
      console.error(err);
      setError(`Could not ${action} the chargeback.`);
    }
  };

  // =========================================================
  // Invoices
  // =========================================================
  const fetchInvoices = useCallback(async () => {
    setInvoicesLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/invoices`, {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Failed to load invoices.");
      setInvoices(await res.json());
    } catch (err) {
      console.error(err);
      setError("Could not load invoices.");
    } finally {
      setInvoicesLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (activeTab === "invoices" && canManageFinance) {
      fetchInvoices();
    }
  }, [activeTab, canManageFinance, fetchInvoices]);

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    setError("");
    setBanner("");

    if (!invoiceForm.periodStart || !invoiceForm.periodEnd) {
      setError("Invoice period start and end are required.");
      return;
    }

    const isDept = invoiceForm.billTo === "department";

    if (isDept && !invoiceForm.departmentId) {
      setError("Choose a department to bill.");
      return;
    }
    if (!isDept && !invoiceForm.institutionId) {
      setError("Choose an institution to bill.");
      return;
    }

    setInvoiceGenerating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/invoices/generate`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          departmentId: isDept ? invoiceForm.departmentId : null,
          institutionId: isDept ? null : invoiceForm.institutionId,
          periodStart: invoiceForm.periodStart,
          periodEnd: invoiceForm.periodEnd,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.message ||
            "No approved, unbilled chargebacks found for this scope and period."
        );
      }

      setBanner("Invoice generated.");
      await fetchInvoices();
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not generate invoice.");
    } finally {
      setInvoiceGenerating(false);
    }
  };

  const handleInvoiceAction = async (invoiceId, action) => {
    try {
      const res = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/${action}`, {
        method: "PUT",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error(`Failed to mark invoice ${action}.`);
      const updated = await res.json();
      setInvoices((prev) =>
        prev.map((i) => (i.invoiceId === updated.invoiceId ? updated : i))
      );
    } catch (err) {
      console.error(err);
      setError(`Could not update the invoice.`);
    }
  };

  const handleExportInvoicePdf = async (invoiceId, invoiceNumber) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/invoices/${invoiceId}/export/pdf`,
        { headers: authHeaders }
      );
      if (!res.ok) throw new Error("Failed to export invoice.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceNumber || "invoice"}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError("Could not export the invoice PDF.");
    }
  };

  // =========================================================
  // Render
  // =========================================================
  if (loading) {
    return (
      <div className="cost-container">
        <p>Loading cost management data...</p>
      </div>
    );
  }

  return (
    <div className="cost-container">
      <div className="cost-header">
        <div>
          <h2 className="cost-title">Cost Management</h2>
          <p className="cost-subtitle">
            Equipment usage billing, department cost allocation, budgets,
            chargebacks and invoicing.
          </p>
        </div>

        {activeTab === "usage" && canEdit && (
          <button
            className="cost-refresh-btn"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? "Generating..." : "Generate Cost Records"}
          </button>
        )}
      </div>

      {canManageFinance && (
        <div className="cost-tabs">
          <button
            className={`cost-tab ${activeTab === "usage" ? "active" : ""}`}
            onClick={() => setActiveTab("usage")}
          >
            Usage & Rates
          </button>
          <button
            className={`cost-tab ${activeTab === "budgets" ? "active" : ""}`}
            onClick={() => setActiveTab("budgets")}
          >
            Budgets
          </button>
          <button
            className={`cost-tab ${activeTab === "chargebacks" ? "active" : ""}`}
            onClick={() => setActiveTab("chargebacks")}
          >
            Chargebacks
          </button>
          <button
            className={`cost-tab ${activeTab === "invoices" ? "active" : ""}`}
            onClick={() => setActiveTab("invoices")}
          >
            Invoices
          </button>
        </div>
      )}

      {banner && <div className="cost-banner">{banner}</div>}
      {error && <div className="cost-banner error">{error}</div>}

      {/* =============== USAGE & RATES TAB =============== */}
      {activeTab === "usage" && (
        <>
          {summary && (
            <div className="cost-cards">
              <div className="cost-card">
                <span className="cost-card-label">Total Cost</span>
                <p className="cost-card-value">
                  {formatCurrency(summary.totalCost)}
                </p>
              </div>

              <div className="cost-card pending">
                <span className="cost-card-label">Pending</span>
                <p className="cost-card-value">
                  {formatCurrency(summary.pendingCost)}
                </p>
              </div>

              <div className="cost-card paid">
                <span className="cost-card-label">Paid</span>
                <p className="cost-card-value">
                  {formatCurrency(summary.paidCost)}
                </p>
              </div>

              <div className="cost-card hours">
                <span className="cost-card-label">Billable Hours</span>
                <p className="cost-card-value">
                  {Number(summary.totalBillableHours || 0).toFixed(1)} h
                </p>
              </div>

              <div className="cost-card avg">
                <span className="cost-card-label">Avg / Booking</span>
                <p className="cost-card-value">
                  {formatCurrency(summary.averageCostPerBooking)}
                </p>
              </div>
            </div>
          )}

          {/* Cost by Equipment + rate editing */}
          <div className="cost-section">
            <h3>Cost by Equipment</h3>
            <p className="cost-section-desc">
              Total billed cost and usage per equipment.
              {canEdit ? " Update hourly rates below." : ""}
            </p>

            <div className="cost-table-wrapper">
              <table className="cost-table">
                <thead>
                  <tr>
                    <th>Equipment</th>
                    <th>Usage Count</th>
                    <th>Total Hours</th>
                    <th>Current Rate / hr</th>
                    <th>Total Cost</th>
                    {canEdit && <th>Update Rate</th>}
                  </tr>
                </thead>
                <tbody>
                  {!summary || summary.costByEquipment?.length === 0 ? (
                    <tr>
                      <td colSpan={canEdit ? 6 : 5} className="cost-empty-state">
                        No equipment cost data yet.
                      </td>
                    </tr>
                  ) : (
                    summary.costByEquipment.map((item) => (
                      <tr key={item.equipmentId}>
                        <td>{item.equipmentName}</td>
                        <td>{item.usageCount}</td>
                        <td>{Number(item.totalHours).toFixed(1)} h</td>
                        <td>{formatCurrency(item.ratePerHour)}</td>
                        <td>{formatCurrency(item.totalCost)}</td>
                        {canEdit && (
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              className="cost-rate-input"
                              placeholder={item.ratePerHour}
                              value={
                                rateDrafts[item.equipmentId] !== undefined
                                  ? rateDrafts[item.equipmentId]
                                  : ""
                              }
                              onChange={(e) =>
                                setRateDrafts((prev) => ({
                                  ...prev,
                                  [item.equipmentId]: e.target.value,
                                }))
                              }
                            />
                            <button
                              className="cost-rate-save"
                              onClick={() => handleRateSave(item.equipmentId)}
                            >
                              Save
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost by Department */}
          <div className="cost-section">
            <h3>Cost by Department</h3>
            <p className="cost-section-desc">
              Allocated equipment usage cost grouped by requesting department.
            </p>

            <div className="cost-table-wrapper">
              <table className="cost-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Allocations</th>
                    <th>Pending</th>
                    <th>Paid</th>
                    <th>Total Allocated</th>
                  </tr>
                </thead>
                <tbody>
                  {!summary || summary.costByDepartment?.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="cost-empty-state">
                        No department allocations yet.
                      </td>
                    </tr>
                  ) : (
                    summary.costByDepartment.map((item) => (
                      <tr key={item.departmentId}>
                        <td>{item.departmentName}</td>
                        <td>{item.allocationCount}</td>
                        <td>{formatCurrency(item.pendingAmount)}</td>
                        <td>{formatCurrency(item.paidAmount)}</td>
                        <td>{formatCurrency(item.totalAllocatedCost)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Usage cost records */}
          <div className="cost-section">
            <h3>Usage Cost Records</h3>
            <p className="cost-section-desc">
              Every billable booking, generated automatically once it's marked
              Completed.
            </p>

            <div className="cost-table-wrapper">
              <table className="cost-table">
                <thead>
                  <tr>
                    <th>Equipment</th>
                    <th>User</th>
                    <th>Department</th>
                    <th>Hours</th>
                    <th>Rate / hr</th>
                    <th>Total Cost</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="cost-empty-state">
                        No usage cost records found. Completed bookings will
                        appear here automatically.
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record.usageCostId}>
                        <td>{record.equipmentName}</td>
                        <td>{record.userName || "-"}</td>
                        <td>{record.departmentName || "-"}</td>
                        <td>{Number(record.usageHours).toFixed(1)} h</td>
                        <td>{formatCurrency(record.ratePerHour)}</td>
                        <td>{formatCurrency(record.totalCost)}</td>
                        <td>
                          {canEdit ? (
                            <select
                              className="cost-status-select"
                              value={record.costStatus}
                              onChange={(e) =>
                                handleStatusChange(
                                  record.usageCostId,
                                  e.target.value
                                )
                              }
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="PAID">PAID</option>
                              <option value="WAIVED">WAIVED</option>
                            </select>
                          ) : (
                            <span
                              className={`cost-status-badge ${record.costStatus?.toLowerCase()}`}
                            >
                              {record.costStatus}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* =============== BUDGETS TAB =============== */}
      {activeTab === "budgets" && canManageFinance && (
        <>
          <div className="cost-section">
            <h3>Create Budget</h3>
            <p className="cost-section-desc">
              Leave department blank for an institution-wide budget.
            </p>

            <form className="cost-form" onSubmit={handleCreateBudget}>
              <select
                className="cost-form-input"
                value={budgetForm.departmentId}
                onChange={(e) =>
                  setBudgetForm((prev) => ({ ...prev, departmentId: e.target.value }))
                }
              >
                <option value="">Institution-wide</option>
                {departments.map((d) => (
                  <option key={d.departmentId} value={d.departmentId}>
                    {d.departmentName}
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="cost-form-input"
                value={budgetForm.periodStart}
                onChange={(e) =>
                  setBudgetForm((prev) => ({ ...prev, periodStart: e.target.value }))
                }
              />
              <input
                type="date"
                className="cost-form-input"
                value={budgetForm.periodEnd}
                onChange={(e) =>
                  setBudgetForm((prev) => ({ ...prev, periodEnd: e.target.value }))
                }
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Budget amount"
                className="cost-form-input"
                value={budgetForm.budgetAmount}
                onChange={(e) =>
                  setBudgetForm((prev) => ({ ...prev, budgetAmount: e.target.value }))
                }
              />
              <input
                type="text"
                placeholder="Notes (optional)"
                className="cost-form-input wide"
                value={budgetForm.notes}
                onChange={(e) =>
                  setBudgetForm((prev) => ({ ...prev, notes: e.target.value }))
                }
              />

              <button type="submit" className="cost-refresh-btn">
                Create Budget
              </button>
            </form>
          </div>

          <div className="cost-section">
            <h3>Budgets</h3>
            <div className="cost-table-wrapper">
              <table className="cost-table">
                <thead>
                  <tr>
                    <th>Scope</th>
                    <th>Period</th>
                    <th>Budget</th>
                    <th>Spent</th>
                    <th>Remaining</th>
                    <th>% Used</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {budgetsLoading ? (
                    <tr>
                      <td colSpan="7" className="cost-empty-state">
                        Loading budgets...
                      </td>
                    </tr>
                  ) : budgets.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="cost-empty-state">
                        No budgets yet.
                      </td>
                    </tr>
                  ) : (
                    budgets.map((b) => (
                      <tr key={b.budgetId}>
                        <td>{b.scopeLabel}</td>
                        <td>
                          {b.periodStart} → {b.periodEnd}
                        </td>
                        <td>{formatCurrency(b.budgetAmount)}</td>
                        <td>{formatCurrency(b.spentAmount)}</td>
                        <td>{formatCurrency(b.remainingAmount)}</td>
                        <td>
                          <span
                            className={`cost-status-badge ${
                              b.overBudget ? "waived" : "paid"
                            }`}
                          >
                            {b.percentUsed}%{b.overBudget ? " (over)" : ""}
                          </span>
                        </td>
                        <td>
                          <button
                            className="cost-rate-save danger"
                            onClick={() => handleDeleteBudget(b.budgetId)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* =============== CHARGEBACKS TAB =============== */}
      {activeTab === "chargebacks" && canManageFinance && (
        <div className="cost-section">
          <div className="cost-section-header-row">
            <div>
              <h3>Chargebacks</h3>
              <p className="cost-section-desc">
                Cost recovery from departments (internal use) and partner
                institutions (shared-equipment use).
              </p>
            </div>
            <button
              className="cost-refresh-btn"
              onClick={handleGenerateChargebacks}
              disabled={chargebackGenerating}
            >
              {chargebackGenerating ? "Generating..." : "Generate Chargebacks"}
            </button>
          </div>

          <div className="cost-table-wrapper">
            <table className="cost-table">
              <thead>
                <tr>
                  <th>Scope</th>
                  <th>Billed To</th>
                  <th>Source</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {chargebacksLoading ? (
                  <tr>
                    <td colSpan="7" className="cost-empty-state">
                      Loading chargebacks...
                    </td>
                  </tr>
                ) : chargebacks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="cost-empty-state">
                      No chargebacks yet. Click "Generate Chargebacks" to scan
                      for recoverable costs.
                    </td>
                  </tr>
                ) : (
                  chargebacks.map((c) => (
                    <tr key={c.chargebackId}>
                      <td>{c.scopeType}</td>
                      <td>{c.payerLabel}</td>
                      <td>{c.sourceLabel}</td>
                      <td>{formatCurrency(c.amount)}</td>
                      <td>
                        <span
                          className={`cost-status-badge ${c.status?.toLowerCase()}`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td>{c.requestedDate}</td>
                      <td className="cost-actions-cell">
                        {c.status === "REQUESTED" && (
                          <>
                            <button
                              className="cost-rate-save"
                              onClick={() =>
                                handleChargebackAction(c.chargebackId, "approve")
                              }
                            >
                              Approve
                            </button>
                            <button
                              className="cost-rate-save danger"
                              onClick={() =>
                                handleChargebackAction(
                                  c.chargebackId,
                                  "dispute",
                                  "Disputed by admin"
                                )
                              }
                            >
                              Dispute
                            </button>
                          </>
                        )}
                        {c.status === "APPROVED" && (
                          <button
                            className="cost-rate-save"
                            onClick={() =>
                              handleChargebackAction(c.chargebackId, "settle")
                            }
                          >
                            Settle
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =============== INVOICES TAB =============== */}
      {activeTab === "invoices" && canManageFinance && (
        <>
          <div className="cost-section">
            <h3>Generate Invoice</h3>
            <p className="cost-section-desc">
              Bundles every APPROVED, not-yet-invoiced chargeback for the
              chosen scope and period into one invoice.
            </p>

            <form className="cost-form" onSubmit={handleGenerateInvoice}>
              <select
                className="cost-form-input"
                value={invoiceForm.billTo}
                onChange={(e) =>
                  setInvoiceForm((prev) => ({ ...prev, billTo: e.target.value }))
                }
              >
                <option value="department">Bill a Department</option>
                <option value="institution">Bill a Partner Institution</option>
              </select>

              {invoiceForm.billTo === "department" ? (
                <select
                  className="cost-form-input"
                  value={invoiceForm.departmentId}
                  onChange={(e) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      departmentId: e.target.value,
                    }))
                  }
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.departmentId} value={d.departmentId}>
                      {d.departmentName}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  className="cost-form-input"
                  value={invoiceForm.institutionId}
                  onChange={(e) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      institutionId: e.target.value,
                    }))
                  }
                >
                  <option value="">Select institution</option>
                  {institutions.map((i) => (
                    <option key={i.institutionId} value={i.institutionId}>
                      {i.institutionName}
                    </option>
                  ))}
                </select>
              )}

              <input
                type="date"
                className="cost-form-input"
                value={invoiceForm.periodStart}
                onChange={(e) =>
                  setInvoiceForm((prev) => ({ ...prev, periodStart: e.target.value }))
                }
              />
              <input
                type="date"
                className="cost-form-input"
                value={invoiceForm.periodEnd}
                onChange={(e) =>
                  setInvoiceForm((prev) => ({ ...prev, periodEnd: e.target.value }))
                }
              />

              <button
                type="submit"
                className="cost-refresh-btn"
                disabled={invoiceGenerating}
              >
                {invoiceGenerating ? "Generating..." : "Generate Invoice"}
              </button>
            </form>
          </div>

          <div className="cost-section">
            <h3>Invoices</h3>
            <div className="cost-table-wrapper">
              <table className="cost-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Billed To</th>
                    <th>Period</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoicesLoading ? (
                    <tr>
                      <td colSpan="6" className="cost-empty-state">
                        Loading invoices...
                      </td>
                    </tr>
                  ) : invoices.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="cost-empty-state">
                        No invoices yet.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.invoiceId}>
                        <td>{inv.invoiceNumber}</td>
                        <td>{inv.billedToLabel}</td>
                        <td>
                          {inv.periodStart} → {inv.periodEnd}
                        </td>
                        <td>{formatCurrency(inv.totalAmount)}</td>
                        <td>
                          <span
                            className={`cost-status-badge ${inv.status?.toLowerCase()}`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="cost-actions-cell">
                          {inv.status === "DRAFT" && (
                            <button
                              className="cost-rate-save"
                              onClick={() =>
                                handleInvoiceAction(inv.invoiceId, "issue")
                              }
                            >
                              Issue
                            </button>
                          )}
                          {inv.status === "ISSUED" && (
                            <button
                              className="cost-rate-save"
                              onClick={() =>
                                handleInvoiceAction(inv.invoiceId, "paid")
                              }
                            >
                              Mark Paid
                            </button>
                          )}
                          <button
                            className="cost-rate-save"
                            onClick={() =>
                              handleExportInvoicePdf(
                                inv.invoiceId,
                                inv.invoiceNumber
                              )
                            }
                          >
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CostManagement;