import { useState, useEffect } from "react";
import { Wallet, TrendingUp, HandCoins, AlertTriangle, PlusCircle, Search, Filter, Layers, PieChart, RefreshCw, BarChart2 } from "lucide-react";
import { ViewHeader } from "../../common/ViewHeader.jsx";
import { StatCard } from "../../common/StatCard.jsx";
import { StatusBadge } from "../../common/StatusBadge.jsx";
import { EmptyState } from "../../common/EmptyState.jsx";
import { Modal } from "../../common/Modal.jsx";
import { budgetApi } from "../../../api/budgetApi";
import { billingApi } from "../../../api/billingApi";

const WARNING_STATUS_STYLE = {
  NORMAL: "bg-emerald-50 text-emerald-600 border-emerald-200",
  WATCH: "bg-blue-50 text-blue-600 border-blue-200",
  WARNING: "bg-amber-50 text-amber-600 border-amber-200",
  CRITICAL: "bg-orange-50 text-orange-600 border-orange-200",
  EXCEEDED: "bg-red-50 text-red-600 border-red-200",
};

export default function Budget() {
  const [deptBudget, setDeptBudget] = useState(null);
  const [summary, setSummary] = useState(null);
  const [costRecords, setCostRecords] = useState([]);
  const [budgetRequests, setBudgetRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [costTypeFilter, setCostTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Budget Request Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [bData, sumData, costsData, reqsData] = await Promise.all([
        budgetApi.getDepartmentBudget().catch(() => null),
        billingApi.getCostSummary().catch(() => null),
        billingApi.getCostRecords().catch(() => []),
        budgetApi.getBudgetRequests().catch(() => []),
      ]);

      setDeptBudget(bData);
      setSummary(sumData);
      setCostRecords(costsData || []);
      setBudgetRequests(reqsData || []);
    } catch (err) {
      setError("Unable to load department financial data. Please make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setRequestError("");
    setRequestSuccess(false);

    const amt = parseFloat(requestAmount);
    if (isNaN(amt) || amt <= 0) {
      setRequestError("Please enter a valid amount greater than zero.");
      return;
    }
    if (!requestReason.trim()) {
      setRequestError("Please provide a reason for the budget request.");
      return;
    }

    setSubmittingRequest(true);

    try {
      await budgetApi.submitBudgetRequest(amt, requestReason.trim());
      setRequestSuccess(true);
      setRequestAmount("");
      setRequestReason("");
      fetchData();
      setTimeout(() => {
        setShowRequestModal(false);
        setRequestSuccess(false);
      }, 1500);
    } catch (err) {
      setRequestError(err.message || "Failed to submit request.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const filteredCosts = costRecords.filter((record) => {
    const matchesType = costTypeFilter === "ALL" || record.costType === costTypeFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (record.equipmentName && record.equipmentName.toLowerCase().includes(q)) ||
      (record.labName && record.labName.toLowerCase().includes(q)) ||
      (record.costType && record.costType.toLowerCase().includes(q));

    return matchesType && matchesSearch;
  });

  const allocated = deptBudget?.allocatedAmount ?? summary?.allocatedAmount ?? 0;
  const used = deptBudget?.usedAmount ?? summary?.usedAmount ?? 0;
  const remaining = deptBudget?.remainingAmount ?? summary?.remainingAmount ?? 0;
  const pct = deptBudget?.usedPercentage ?? summary?.usedPercentage ?? 0;
  const warningStatus = deptBudget?.warningStatus || summary?.warningStatus || "NORMAL";
  const fiscalYear = deptBudget?.fiscalYear || summary?.fiscalYear || "2026-2027";

  return (
    <div className="space-y-6">
      <ViewHeader
        title="Department Cost Management"
        subtitle={`Usage-based cost allocation, maintenance expenditure, and budget requests for Fiscal Year ${fiscalYear}.`}
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
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 text-sm transition-colors shadow-sm"
            >
              <PlusCircle size={18} />
              Request Budget Increase
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
          label="Allocated Budget"
          value={loading ? "Loading..." : `₹${Number(allocated).toLocaleString()}`}
          tone="text-slate-700"
          bg="bg-slate-100"
        />
        <StatCard
          icon={TrendingUp}
          label="Consumed Budget"
          value={loading ? "Loading..." : `₹${Number(used).toLocaleString()}`}
          tone="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          icon={HandCoins}
          label="Remaining Budget"
          value={loading ? "Loading..." : `₹${Number(remaining).toLocaleString()}`}
          tone={remaining < 0 ? "text-red-600" : "text-emerald-600"}
          bg={remaining < 0 ? "bg-red-50" : "bg-emerald-50"}
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left w-full shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Budget Status</p>
            <AlertTriangle size={16} className="text-slate-400" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-2xl font-extrabold text-slate-800">{pct}%</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                WARNING_STATUS_STYLE[warningStatus] || WARNING_STATUS_STYLE.NORMAL
              }`}
            >
              {warningStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Spend Breakdown & Budget Usage Bar */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart size={16} className="text-blue-600" />
              Categorized Spend Breakdown ({fiscalYear})
            </h2>
            <span className="text-xs text-slate-400 font-medium">Single Source of Truth Ledger</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Total Consumed Budget</span>
                <span className="font-semibold text-slate-900">₹{Number(used).toLocaleString()}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-blue-600"
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <p className="text-xs text-slate-500 font-medium">Equipment Usage</p>
                <p className="text-lg font-bold text-slate-800 mt-1">
                  ₹{Number(summary?.usageCost || 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-400">Direct booking deductions</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <p className="text-xs text-slate-500 font-medium">Maintenance & Repairs</p>
                <p className="text-lg font-bold text-slate-800 mt-1">
                  ₹{Number(summary?.maintenanceCost || 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-400">Parts & labour expenses</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <p className="text-xs text-slate-500 font-medium">Damage Charges</p>
                <p className="text-lg font-bold text-slate-800 mt-1">
                  ₹{Number(summary?.damageCharge || 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-400">Student liability charges</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Spending Equipment */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Layers size={16} className="text-blue-600" />
            Top Equipment Spend
          </h2>
          {summary?.spendingByEquipment && summary.spendingByEquipment.length > 0 ? (
            <div className="space-y-3">
              {summary.spendingByEquipment.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="font-semibold text-slate-800 truncate max-w-[160px]">{item.name}</p>
                    <p className="text-slate-400">{item.count} cost event(s)</p>
                  </div>
                  <span className="font-bold text-slate-900">₹{Number(item.amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic pt-2">No equipment expenditure recorded yet.</p>
          )}
        </div>
      </div>

      {/* Monthly Spending Trend Chart Section */}
      {summary?.monthlyTrend && summary.monthlyTrend.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart2 size={16} className="text-blue-600" />
            Monthly Expenditure Trend ({fiscalYear})
          </h2>
          <div className="h-40 flex items-end gap-3 pt-4 border-b border-slate-100 pb-2">
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
        </div>
      )}

      {/* Cost History Table Section */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Cost Record Ledger</h2>
            <p className="text-xs text-slate-500">Immutable ledger of all usage, maintenance, and damage cost records.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search equipment or lab..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
              />
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Filter size={14} />
              <select
                value={costTypeFilter}
                onChange={(e) => setCostTypeFilter(e.target.value)}
                className="rounded-xl border border-slate-200 py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Types</option>
                <option value="USAGE">Usage</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="DAMAGE_CHARGE">Damage Charge</option>
                <option value="SHARING_FEE">Sharing Fee</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading cost records...</div>
        ) : filteredCosts.length === 0 ? (
          <EmptyState title="No cost records match your filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Cost Type</th>
                  <th className="px-5 py-3 font-semibold">Equipment</th>
                  <th className="px-5 py-3 font-semibold">Laboratory</th>
                  <th className="px-5 py-3 font-semibold">Fiscal Period</th>
                  <th className="px-5 py-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCosts.map((c) => (
                  <tr key={c.costId} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          c.costType === "USAGE"
                            ? "bg-blue-50 text-blue-600"
                            : c.costType === "MAINTENANCE"
                            ? "bg-amber-50 text-amber-600"
                            : c.costType === "DAMAGE_CHARGE"
                            ? "bg-purple-50 text-purple-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {c.costType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{c.equipmentName || "N/A"}</td>
                    <td className="px-5 py-3.5 text-slate-600">{c.labName || "Central Lab"}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{c.billingPeriod || fiscalYear}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                      ₹{Number(c.amount || 0).toLocaleString()} {c.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Budget Requests Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-1">Budget Allocation Requests</h2>
        <p className="text-xs text-slate-500 mb-4">Track requests submitted to Institution Admin for budget adjustments.</p>

        {budgetRequests.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No budget requests submitted for this department.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Date</th>
                  <th className="px-4 py-2.5 font-semibold">Requested Amount</th>
                  <th className="px-4 py-2.5 font-semibold">Reason</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold">Review Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budgetRequests.map((r) => (
                  <tr key={r.requestId}>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">
                      ₹{Number(r.requestedAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{r.reason}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{r.reviewComment || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit Budget Request Modal */}
      {showRequestModal && (
        <Modal title="Request Budget Increase" onClose={() => setShowRequestModal(false)}>
          <form onSubmit={handleCreateRequest} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Requested Amount (INR)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 50000"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason / Justification
              </label>
              <textarea
                rows="3"
                placeholder="Specify reasons such as upcoming maintenance, software licenses, or high usage..."
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {requestError && <p className="text-xs text-red-600 font-medium">{requestError}</p>}
            {requestSuccess && <p className="text-xs text-emerald-600 font-medium">Budget request submitted successfully!</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingRequest}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
              >
                {submittingRequest ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
