import { useState, useEffect } from "react";
import { Receipt, Building2, Wallet, TrendingUp, HandCoins, CheckCircle2, XCircle, Plus, Search, Filter, ShieldCheck, CreditCard, RefreshCw, BarChart2, PieChart } from "lucide-react";
import { ViewHeader } from "../../common/ViewHeader.jsx";
import { StatCard } from "../../common/StatCard.jsx";
import { StatusBadge } from "../../common/StatusBadge.jsx";
import { EmptyState } from "../../common/EmptyState.jsx";
import { Modal } from "../../common/Modal.jsx";
import { budgetApi } from "../../../api/budgetApi";
import { billingApi } from "../../../api/billingApi";
import { departmentApi } from "../../../api/departmentApi";

const INVOICE_STATUS_STYLE = {
  PAID: "CONFIRMED",
  PENDING: "PENDING_APPROVAL",
  OVERDUE: "REJECTED",
  DRAFT: "CANCELLED",
};

export default function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [deptBudgets, setDeptBudgets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [budgetRequests, setBudgetRequests] = useState([]);
  const [summary, setSummary] = useState(null);
  const [costRecords, setCostRecords] = useState([]);
  const [bankAccount, setBankAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");
  const [costTypeFilter, setCostTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [allocateModal, setAllocateModal] = useState({ open: false, deptId: "", amount: "", fiscalYear: "" });
  const [rejectModal, setRejectModal] = useState({ open: false, requestId: null, comment: "" });
  const [processingAction, setProcessingAction] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [invData, budgetsData, deptsData, reqsData, sumData, costsData, bankData] = await Promise.all([
        billingApi.getInvoices().catch(() => []),
        budgetApi.getInstitutionBudgets().catch(() => []),
        departmentApi.getMyInstitutionDepartments().catch(() => []),
        budgetApi.getBudgetRequests().catch(() => []),
        billingApi.getCostSummary().catch(() => null),
        billingApi.getCostRecords().catch(() => []),
        billingApi.getPrimaryBankAccount().catch(() => null),
      ]);

      setInvoices(invData || []);
      setDeptBudgets(budgetsData || []);
      setDepartments(deptsData || []);
      setBudgetRequests(reqsData || []);
      setSummary(sumData);
      setCostRecords(costsData || []);
      setBankAccount(bankData);
    } catch (err) {
      setError("Unable to load institution financial data. Please make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateBudget = async (e) => {
    e.preventDefault();
    setActionError("");
    const amt = parseFloat(allocateModal.amount);
    if (!allocateModal.deptId) {
      setActionError("Please select a department.");
      return;
    }
    if (isNaN(amt) || amt < 0) {
      setActionError("Please enter a valid non-negative allocation amount.");
      return;
    }

    setProcessingAction(true);

    try {
      await budgetApi.allocateDepartmentBudget(
        allocateModal.deptId,
        amt,
        allocateModal.fiscalYear || summary?.fiscalYear
      );

      setAllocateModal({ open: false, deptId: "", amount: "", fiscalYear: "" });
      fetchData();
    } catch (err) {
      setActionError(err.message || "Failed to allocate budget.");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    setProcessingAction(true);

    try {
      await budgetApi.approveBudgetRequest(requestId);
      fetchData();
    } catch (err) {
      alert(err.message || "Approval failed.");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectRequest = async (e) => {
    e.preventDefault();
    if (!rejectModal.comment.trim()) {
      setActionError("Please provide a reason for rejecting the request.");
      return;
    }

    setProcessingAction(true);

    try {
      await budgetApi.rejectBudgetRequest(rejectModal.requestId, rejectModal.comment.trim());
      setRejectModal({ open: false, requestId: null, comment: "" });
      fetchData();
    } catch (err) {
      setActionError(err.message || "Rejection failed.");
    } finally {
      setProcessingAction(false);
    }
  };

  const handlePayInvoice = async (invoiceId) => {
    if (!confirm("Confirm accounting status update: Mark this invoice as PAID in institutional records?")) return;

    setProcessingAction(true);

    try {
      await billingApi.payInvoice(invoiceId);
      fetchData();
    } catch (err) {
      alert(err.message || "Payment status update failed.");
    } finally {
      setProcessingAction(false);
    }
  };

  // Aggregated Institution Metrics
  const totalAllocated = deptBudgets.reduce((acc, b) => acc + Number(b.allocatedAmount || 0), 0);
  const totalUsed = deptBudgets.reduce((acc, b) => acc + Number(b.usedAmount || 0), 0);
  const totalRemaining = totalAllocated - totalUsed;
  const overallPct = totalAllocated > 0 ? ((totalUsed / totalAllocated) * 100).toFixed(1) : "0.0";
  const fiscalYear = summary?.fiscalYear || "2026-2027";

  const totalInvoiced = invoices.reduce((a, i) => a + Number(i.totalAmount || 0), 0);
  const overdueInvoiced = invoices.filter((i) => i.status === "OVERDUE").reduce((a, i) => a + Number(i.totalAmount || 0), 0);

  const filteredCosts = costRecords.filter((c) => {
    const matchesDept = selectedDeptFilter === "ALL" || String(c.departmentId) === String(selectedDeptFilter);
    const matchesType = costTypeFilter === "ALL" || c.costType === costTypeFilter;
    const q = searchQuery.toLowerCase();
    const matchesQ =
      !q ||
      (c.equipmentName && c.equipmentName.toLowerCase().includes(q)) ||
      (c.departmentName && c.departmentName.toLowerCase().includes(q));

    return matchesDept && matchesType && matchesQ;
  });

  return (
    <div className="space-y-6">
      <ViewHeader
        title="Institution Cost & Accounting Management"
        subtitle={`Department budget allocations, expenditure tracking, inter-institution invoicing, and accounting records for Fiscal Year ${fiscalYear}.`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="p-2 text-slate-500 hover:text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              title="Refresh financial data"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setAllocateModal({ open: true, deptId: departments[0]?.departmentId || "", amount: "", fiscalYear: fiscalYear })}
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 text-sm transition-colors shadow-sm"
            >
              <Plus size={18} />
              Allocate Department Budget
            </button>
          </div>
        }
      />

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between shadow-sm">
          <span>{error}</span>
          <button onClick={fetchData} className="font-semibold underline hover:text-red-900">
            Retry
          </button>
        </div>
      )}

      {/* Top Financial Stat Cards */}
      <div className="grid sm:grid-cols-4 gap-4">
        <StatCard
          icon={Wallet}
          label="Total Allocated Budget"
          value={loading ? "Loading..." : `₹${totalAllocated.toLocaleString()}`}
          tone="text-slate-700"
          bg="bg-slate-100"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Consumed Spend"
          value={loading ? "Loading..." : `₹${totalUsed.toLocaleString()}`}
          tone="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          icon={HandCoins}
          label="Total Remaining Budget"
          value={loading ? "Loading..." : `₹${totalRemaining.toLocaleString()}`}
          tone={totalRemaining < 0 ? "text-red-600" : "text-emerald-600"}
          bg={totalRemaining < 0 ? "bg-red-50" : "bg-emerald-50"}
        />
        <StatCard
          icon={Building2}
          label="Overall Budget Utilization"
          value={loading ? "Loading..." : `${overallPct}%`}
          tone="text-purple-600"
          bg="bg-purple-50"
        />
      </div>

      {/* Department Budget Allocation Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Department Budget Allocations ({fiscalYear})</h2>
            <p className="text-xs text-slate-500">Manage annual budget allocations for all departments in your institution.</p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading department budgets...</div>
        ) : deptBudgets.length === 0 ? (
          <EmptyState title="No department budgets allocated for this fiscal year." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 font-semibold">Department</th>
                  <th className="px-5 py-3 font-semibold text-right">Allocated</th>
                  <th className="px-5 py-3 font-semibold text-right">Consumed</th>
                  <th className="px-5 py-3 font-semibold text-right">Remaining</th>
                  <th className="px-5 py-3 font-semibold">Utilization</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deptBudgets.map((b) => (
                  <tr key={b.budgetId || b.departmentId} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{b.departmentName}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                      ₹{Number(b.allocatedAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right text-blue-600 font-semibold">
                      ₹{Number(b.usedAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right text-emerald-600 font-semibold">
                      ₹{Number(b.remainingAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              Number(b.usedPercentage || 0) >= 100
                                ? "bg-red-500"
                                : Number(b.usedPercentage || 0) >= 80
                                ? "bg-amber-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${Math.min(100, Number(b.usedPercentage || 0))}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-600">{b.usedPercentage || 0}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-slate-100 text-slate-700">
                        {b.warningStatus || "NORMAL"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() =>
                          setAllocateModal({
                            open: true,
                            deptId: b.departmentId,
                            deptName: b.departmentName,
                            amount: b.allocatedAmount || "",
                            fiscalYear: b.fiscalYear || fiscalYear,
                          })
                        }
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Plus size={14} /> Update Allocation
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Budget Requests Review Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-1">Department Budget Requests</h2>
        <p className="text-xs text-slate-500 mb-4">Review and decide on budget adjustment requests submitted by Department Heads.</p>

        {budgetRequests.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No budget requests pending or recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Date</th>
                  <th className="px-4 py-2.5 font-semibold">Department</th>
                  <th className="px-4 py-2.5 font-semibold">Requested By</th>
                  <th className="px-4 py-2.5 font-semibold">Requested Amount</th>
                  <th className="px-4 py-2.5 font-semibold">Reason</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budgetRequests.map((r) => (
                  <tr key={r.requestId} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{r.departmentName}</td>
                    <td className="px-4 py-3 text-slate-600">{r.requestedByName || "Dept Head"}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      ₹{Number(r.requestedAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{r.reason}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.status === "PENDING" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApproveRequest(r.requestId)}
                            disabled={processingAction}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button
                            onClick={() => setRejectModal({ open: true, requestId: r.requestId, comment: "" })}
                            disabled={processingAction}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Decided</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Spending Analytics Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <PieChart size={16} className="text-blue-600" />
            Spending Breakdown by Category ({fiscalYear})
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs text-slate-500 font-medium">Usage Expenditure</p>
              <p className="text-xl font-bold text-slate-900 mt-1">₹{Number(summary?.usageCost || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs text-slate-500 font-medium">Maintenance & Repairs</p>
              <p className="text-xl font-bold text-slate-900 mt-1">₹{Number(summary?.maintenanceCost || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs text-slate-500 font-medium">Damage Charges</p>
              <p className="text-xl font-bold text-slate-900 mt-1">₹{Number(summary?.damageCharge || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs text-slate-500 font-medium">Sharing Fees (Receivable)</p>
              <p className="text-xl font-bold text-slate-900 mt-1">₹{Number(summary?.sharingFee || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart2 size={16} className="text-blue-600" />
            Monthly Expenditure Trend ({fiscalYear})
          </h2>
          {summary?.monthlyTrend && summary.monthlyTrend.length > 0 ? (
            <div className="h-36 flex items-end gap-3 pt-4 border-b border-slate-100 pb-2">
              {summary.monthlyTrend.map((m, idx) => {
                const maxAmt = Math.max(...summary.monthlyTrend.map((item) => Number(item.amount || 0)), 1);
                const heightPct = Math.max(10, (Number(m.amount || 0) / maxAmt) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="text-[10px] font-semibold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{Number(m.amount).toLocaleString()}
                    </div>
                    <div
                      className="w-full max-w-[40px] bg-blue-500 hover:bg-blue-600 rounded-t-lg transition-all"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[11px] font-medium text-slate-600 mt-1">{m.month}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic pt-6">No monthly expenditure trend data available.</p>
          )}
        </div>
      </div>

      {/* Institution Cost History Section */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Institution Cost Record Ledger</h2>
            <p className="text-xs text-slate-500">Searchable history of all cost records across departments.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search equipment or dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
              />
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Filter size={14} />
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="rounded-xl border border-slate-200 py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Departments</option>
                {deptBudgets.map((d) => (
                  <option key={d.departmentId} value={d.departmentId}>
                    {d.departmentName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading cost records...</div>
        ) : filteredCosts.length === 0 ? (
          <EmptyState title="No cost records found for the selected filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Department</th>
                  <th className="px-5 py-3 font-semibold">Cost Type</th>
                  <th className="px-5 py-3 font-semibold">Equipment</th>
                  <th className="px-5 py-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCosts.map((c) => (
                  <tr key={c.costId} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3 text-xs text-slate-600">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800">{c.departmentName}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                        {c.costType}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{c.equipmentName || "N/A"}</td>
                    <td className="px-5 py-3 text-right font-bold text-slate-900">
                      ₹{Number(c.amount || 0).toLocaleString()} {c.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoices & Cost Recovery Section */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Inter-Institution Invoices & Accounting Records</h2>
            <p className="text-xs text-slate-500">Accounting tallies for shared equipment usage fees with external partner institutions.</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 font-medium">Total Billed: ₹{totalInvoiced.toLocaleString()}</p>
            {overdueInvoiced > 0 && <p className="text-xs text-red-600 font-bold">Outstanding: ₹{overdueInvoiced.toLocaleString()}</p>}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <EmptyState title="No inter-institution invoices recorded." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 font-semibold">Invoice #</th>
                  <th className="px-5 py-3 font-semibold">Provider → Requester</th>
                  <th className="px-5 py-3 font-semibold">Issue Date</th>
                  <th className="px-5 py-3 font-semibold">Due Date</th>
                  <th className="px-5 py-3 font-semibold text-right">Amount</th>
                  <th className="px-5 py-3 font-semibold pl-6">Accounting Status</th>
                  <th className="px-5 py-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((i) => {
                  const invId = i.invoiceNumber || i.id || `INV-${i.invoiceId}`;
                  const amt = i.totalAmount || i.amount || 0;
                  return (
                    <tr key={i.invoiceId || invId} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3.5 font-bold text-blue-600">{invId}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-700">
                        <span className="font-semibold text-slate-900">{i.providerInstitutionName || "Provider"}</span> →{" "}
                        <span>{i.requesterInstitutionName || "Requester"}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">
                        {i.issueDate ? new Date(i.issueDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">
                        {i.dueDate ? new Date(i.dueDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900">₹{Number(amt).toLocaleString()}</td>
                      <td className="px-5 py-3.5 pl-6">
                        <StatusBadge status={INVOICE_STATUS_STYLE[i.status] || i.status} />
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {i.status !== "PAID" ? (
                          <button
                            onClick={() => handlePayInvoice(i.invoiceId)}
                            disabled={processingAction}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <CreditCard size={14} /> Record Payment
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-medium flex items-center justify-center gap-1">
                            <ShieldCheck size={14} /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Institution Bank Account Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 size={18} className="text-blue-600" />
            Institutional Bank Account Records
          </h2>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <ShieldCheck size={14} /> Verified Account
          </span>
        </div>

        {bankAccount ? (
          <div className="grid sm:grid-cols-4 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Account Holder</p>
              <p className="font-bold text-slate-800 mt-0.5">{bankAccount.accountHolderName}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Bank Name</p>
              <p className="font-bold text-slate-800 mt-0.5">{bankAccount.bankName}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Account Number (Masked)</p>
              <p className="font-bold text-slate-800 mt-0.5 font-mono">{bankAccount.maskedAccountNumber}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">IFSC Code</p>
              <p className="font-bold text-slate-800 mt-0.5 font-mono">{bankAccount.ifscCode}</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No primary bank account registered for this institution.</p>
        )}

        <p className="text-[11px] text-slate-400 mt-3 italic">
          Disclaimer: Bank account details are maintained for institutional financial records. No online payment processing is performed here.
        </p>
      </div>

      {/* Allocate Budget Modal */}
      {allocateModal.open && (
        <Modal title="Allocate Department Budget" onClose={() => setAllocateModal({ open: false, deptId: "", amount: "", fiscalYear: "" })}>
          <form onSubmit={handleAllocateBudget} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <select
                value={allocateModal.deptId}
                onChange={(e) => setAllocateModal({ ...allocateModal, deptId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Department...</option>
                {departments.map((d) => (
                  <option key={d.departmentId} value={d.departmentId}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fiscal Year
              </label>
              <input
                type="text"
                placeholder="e.g. 2026-2027"
                value={allocateModal.fiscalYear}
                onChange={(e) => setAllocateModal({ ...allocateModal, fiscalYear: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Annual Allocated Budget (INR)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 500000"
                value={allocateModal.amount}
                onChange={(e) => setAllocateModal({ ...allocateModal, amount: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">Note: Allocating a new amount updates the annual allocation ceiling without resetting consumed expenditure.</p>
            </div>

            {actionError && <p className="text-xs text-red-600 font-medium">{actionError}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAllocateModal({ open: false, deptId: "", amount: "", fiscalYear: "" })}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processingAction}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
              >
                {processingAction ? "Allocating..." : "Save Allocation"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reject Budget Request Modal */}
      {rejectModal.open && (
        <Modal title="Reject Budget Request" onClose={() => setRejectModal({ open: false, requestId: null, comment: "" })}>
          <form onSubmit={handleRejectRequest} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rejection Reason / Feedback (Mandatory)
              </label>
              <textarea
                rows="3"
                placeholder="Provide specific feedback on why this request is rejected..."
                value={rejectModal.comment}
                onChange={(e) => setRejectModal({ ...rejectModal, comment: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {actionError && <p className="text-xs text-red-600 font-medium">{actionError}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModal({ open: false, requestId: null, comment: "" })}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processingAction}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
              >
                {processingAction ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
