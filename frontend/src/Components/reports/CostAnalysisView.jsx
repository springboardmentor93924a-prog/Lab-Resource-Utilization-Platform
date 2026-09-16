import { useState, useEffect } from "react";
import { DollarSign, Wallet, Wrench, Share2, AlertTriangle, AlertCircle, BarChart2, Building2, FlaskConical, Download, Layers, CreditCard, FileText, FileSpreadsheet, FileCode } from "lucide-react";
import { ViewHeader } from "../common/ViewHeader.jsx";
import { StatCard } from "../common/StatCard.jsx";
import { StatusBadge } from "../common/StatusBadge.jsx";
import { EmptyState } from "../common/EmptyState.jsx";
import { reportApi } from "../../api/reportApi.js";
import { departmentApi } from "../../api/departmentApi.js";
import { formatCurrency, formatDateTime } from "../../utils/formatters.js";

// Helper for date presets
function getDateRangeFromPreset(preset) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  
  if (preset === "7d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 7);
    return { from: from.toISOString().slice(0, 10), to: todayStr };
  }
  if (preset === "30d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 30);
    return { from: from.toISOString().slice(0, 10), to: todayStr };
  }
  if (preset === "thisMonth") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: from.toISOString().slice(0, 10), to: todayStr };
  }
  if (preset === "lastMonth") {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
  }
  if (preset === "thisQuarter") {
    const qMonth = Math.floor(now.getMonth() / 3) * 3;
    const from = new Date(now.getFullYear(), qMonth, 1);
    return { from: from.toISOString().slice(0, 10), to: todayStr };
  }
  if (preset === "fy") {
    const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    const from = new Date(fyStartYear, 3, 1);
    return { from: from.toISOString().slice(0, 10), to: todayStr };
  }
  return { from: "", to: "" };
}

export function CostAnalysisView({ user, role, toast }) {
  const isInstAdmin = role === "INSTITUTION_ADMIN" || (user?.roles || []).some(r => r.includes("INSTITUTION_ADMIN"));
  
  const [preset, setPreset] = useState("30d");
  const [dateRange, setDateRange] = useState(getDateRangeFromPreset("30d"));
  const [fiscalYear, setFiscalYear] = useState("2026-2027");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  
  const [departments, setDepartments] = useState([]);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportingType, setExportingType] = useState(null); // 'pdf' | 'excel' | 'csv' | null

  useEffect(() => {
    if (isInstAdmin) {
      departmentApi.getMyInstitutionDepartments()
        .then((depts) => {
          if (Array.isArray(depts)) {
            setDepartments(depts);
          }
        })
        .catch((err) => console.warn("Could not load departments for cost filter:", err));
    }
  }, [isInstAdmin]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (dateRange.from) params.from = dateRange.from;
      if (dateRange.to) params.to = dateRange.to;
      if (fiscalYear) params.fiscalYear = fiscalYear;
      if (isInstAdmin && selectedDeptId) params.departmentId = selectedDeptId;

      const response = await reportApi.getCostAnalysis(params);
      setData(response);
    } catch (err) {
      console.error("Failed to load cost analysis report:", err);
      setError(err.message || "Failed to load cost analysis report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [dateRange, fiscalYear, selectedDeptId]);

  const handlePresetChange = (e) => {
    const val = e.target.value;
    setPreset(val);
    if (val !== "custom") {
      setDateRange(getDateRangeFromPreset(val));
    }
  };

  const handleExport = async (format, exportFn) => {
    setExportingType(format);
    try {
      const params = {};
      if (dateRange.from) params.from = dateRange.from;
      if (dateRange.to) params.to = dateRange.to;
      if (fiscalYear) params.fiscalYear = fiscalYear;
      if (isInstAdmin && selectedDeptId) params.departmentId = selectedDeptId;

      await exportFn(params);
      toast(`Cost Analysis Report exported as ${format.toUpperCase()}.`, "success");
    } catch (err) {
      console.error(`Export ${format} failed:`, err);
      toast(err.message || `Unable to generate ${format.toUpperCase()} report. Please try again.`, "error");
    } finally {
      setExportingType(null);
    }
  };

  const summary = data?.summary || {};
  const metadata = data?.metadata || {};
  const budget = data?.budget;
  const monthlyTrend = data?.monthlyTrend || [];
  const equipmentCosts = data?.equipmentCosts || [];
  const laboratoryCosts = data?.laboratoryCosts || [];
  const maintenanceCosts = data?.maintenanceCosts || [];
  const sharingCosts = data?.sharingCosts || [];
  const deptComparison = data?.departmentComparison || [];

  return (
    <div className="space-y-6">
      <ViewHeader
        title="Cost Analysis & Budget Audit Report"
        subtitle={`Financial audit and usage cost recovery for ${metadata.institutionName || user?.institutionName || "Institution"}${metadata.departmentName ? " • " + metadata.departmentName : ""}`}
      />

      {/* FILTER BAR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Wallet size={18} className="text-emerald-600" />
            <span>Financial Filters</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Quick Preset Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Time Period</label>
              <select
                value={preset}
                onChange={handlePresetChange}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="thisQuarter">This Quarter</option>
                <option value="fy">This Financial Year (Apr-Mar)</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>

            {/* Fiscal Year Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Fiscal Year</label>
              <select
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
              >
                <option value="2026-2027">FY 2026–2027</option>
                <option value="2025-2026">FY 2025–2026</option>
                <option value="2024-2025">FY 2024–2025</option>
              </select>
            </div>

            {/* Custom Dates */}
            {preset === "custom" && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">From</label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">To</label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            {/* Institution Admin: Department Selector */}
            {isInstAdmin && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Department</label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.departmentId} value={d.departmentId}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Department Head: Fixed Scope */}
            {!isInstAdmin && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Department</label>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                  <Building2 size={13} className="text-slate-500" />
                  {user?.department || metadata.departmentName || "My Department"}
                </span>
              </div>
            )}

            <button
              onClick={fetchReport}
              className="mt-4 sm:mt-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-xs transition-colors cursor-pointer"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mb-3"></div>
          <p className="text-sm font-semibold text-slate-700">Loading Financial Cost Analysis...</p>
          <p className="text-xs text-slate-400 mt-1">Aggregating CostRecord financial data</p>
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center">
          <AlertCircle size={32} className="mx-auto text-red-500 mb-2" />
          <h3 className="text-sm font-bold text-red-900">Unable to load cost report</h3>
          <p className="text-xs text-red-600 mt-1">{error}</p>
          <button
            onClick={fetchReport}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 transition-colors cursor-pointer"
          >
            Retry Request
          </button>
        </div>
      )}

      {/* REPORT CONTENT */}
      {!loading && !error && data && (
        <>
          {/* COST KPI CARDS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={DollarSign}
              label="Total Cost Amount"
              value={formatCurrency(summary.totalCost || 0)}
              tone="text-emerald-700"
              bg="bg-emerald-50"
            />
            <StatCard
              icon={CreditCard}
              label="Equipment Usage Cost"
              value={formatCurrency(summary.usageCost || 0)}
              tone="text-blue-700"
              bg="bg-blue-50"
            />
            <StatCard
              icon={Wrench}
              label="Maintenance Expense"
              value={formatCurrency(summary.maintenanceCost || 0)}
              tone="text-orange-700"
              bg="bg-orange-50"
            />
            <StatCard
              icon={Share2}
              label="Resource Sharing Fee"
              value={formatCurrency(summary.sharingFee || 0)}
              tone="text-indigo-700"
              bg="bg-indigo-50"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Damage Charge Penalties</p>
                <p className="text-base font-bold text-red-700 mt-0.5">{formatCurrency(summary.damageCharge || 0)}</p>
              </div>
              <AlertTriangle size={24} className="text-red-400" />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Total Financial Cost Records</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">{summary.totalCostsCount || 0}</p>
              </div>
              <Layers size={24} className="text-slate-400" />
            </div>
          </div>

          {/* BUDGET SUMMARY CARD */}
          {budget ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Department Budget Allocation — FY {budget.fiscalYear}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Authorized budget allocation &amp; consumption monitoring</p>
                </div>
                <StatusBadge status={budget.warningStatus || "NORMAL"} />
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <p className="text-xs font-semibold text-slate-500">Allocated Budget</p>
                  <p className="text-base font-bold text-slate-900 mt-1">{formatCurrency(budget.allocatedAmount || 0)}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <p className="text-xs font-semibold text-slate-500">Used Amount</p>
                  <p className="text-base font-bold text-blue-700 mt-1">{formatCurrency(budget.usedAmount || 0)}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <p className="text-xs font-semibold text-slate-500">Remaining Balance</p>
                  <p className="text-base font-bold text-emerald-700 mt-1">{formatCurrency(budget.remainingAmount || 0)}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Consumption Rate</span>
                  <span>{budget.usedPercentage != null ? budget.usedPercentage.toFixed(1) : 0}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all rounded-full ${
                      (budget.warningStatus === "EXCEEDED" || budget.warningStatus === "CRITICAL")
                        ? "bg-red-600"
                        : (budget.warningStatus === "WARNING")
                        ? "bg-amber-500"
                        : "bg-emerald-600"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, budget.usedPercentage || 0))}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500 italic">
              No budget allocation record registered for FY {fiscalYear}
            </div>
          )}

          {/* COST BREAKDOWN & MONTHLY TREND */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cost Category Distribution */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Cost Distribution</h3>
              <p className="text-xs text-slate-500 mb-4">Financial breakdown by category</p>

              <CostDistributionProportion summary={summary} />
            </div>

            {/* Monthly Trend Chart */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Monthly Cost Trend</h3>
              <p className="text-xs text-slate-500 mb-4">Category expenses over time</p>
              {monthlyTrend.length === 0 ? (
                <EmptyState icon={BarChart2} title="No monthly trend records in selected range" />
              ) : (
                <MonthlyCostChart points={monthlyTrend} />
              )}
            </div>
          </div>

          {/* EQUIPMENT COSTS TABLE */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Equipment Cost Breakdown</h3>
            {equipmentCosts.length === 0 ? (
              <EmptyState icon={FlaskConical} title="No equipment cost records found" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Equipment</th>
                      <th className="px-4 py-3">Laboratory</th>
                      <th className="px-4 py-3">Usage Cost</th>
                      <th className="px-4 py-3">Maintenance</th>
                      <th className="px-4 py-3">Damage Charge</th>
                      <th className="px-4 py-3">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {equipmentCosts.map((item, idx) => (
                      <tr key={item.equipmentId || `eqc-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">{item.equipmentName}</td>
                        <td className="px-4 py-3 text-slate-600">{item.laboratoryName || "General Lab"}</td>
                        <td className="px-4 py-3 text-blue-700 font-semibold">{formatCurrency(item.usageCost || 0)}</td>
                        <td className="px-4 py-3 text-orange-700">{formatCurrency(item.maintenanceCost || 0)}</td>
                        <td className="px-4 py-3 text-red-700">{formatCurrency(item.damageCharge || 0)}</td>
                        <td className="px-4 py-3 font-extrabold text-slate-900">{formatCurrency(item.totalCost || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* LABORATORY COSTS TABLE */}
          {laboratoryCosts.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4">Laboratory Cost Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Laboratory</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Usage Cost</th>
                      <th className="px-4 py-3">Maintenance</th>
                      <th className="px-4 py-3">Damage Charge</th>
                      <th className="px-4 py-3">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {laboratoryCosts.map((lab, idx) => (
                      <tr key={lab.laboratoryId || `lc-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">{lab.laboratoryName}</td>
                        <td className="px-4 py-3 text-slate-600">{lab.departmentName}</td>
                        <td className="px-4 py-3 text-blue-700">{formatCurrency(lab.usageCost || 0)}</td>
                        <td className="px-4 py-3 text-orange-700">{formatCurrency(lab.maintenanceCost || 0)}</td>
                        <td className="px-4 py-3 text-red-700">{formatCurrency(lab.damageCharge || 0)}</td>
                        <td className="px-4 py-3 font-extrabold text-emerald-700">{formatCurrency(lab.totalCost || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ITEMIZED MAINTENANCE COSTS */}
          {maintenanceCosts.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4">Itemized Maintenance Expenses</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Work Order ID</th>
                      <th className="px-4 py-3">Equipment</th>
                      <th className="px-4 py-3">Laboratory</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Cost Amount</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {maintenanceCosts.map((m, idx) => (
                      <tr key={m.maintenanceId || `mc-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">WO-#{m.maintenanceId}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{m.equipmentName}</td>
                        <td className="px-4 py-3 text-slate-600">{m.laboratoryName || "Lab"}</td>
                        <td className="px-4 py-3 text-slate-500">{m.createdDate ? formatDateTime(m.createdDate) : "N/A"}</td>
                        <td className="px-4 py-3 font-bold text-orange-700">{formatCurrency(m.maintenanceCost || 0)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={m.status || "RESOLVED"} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ITEMIZED SHARING COSTS */}
          {sharingCosts.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4">Resource Sharing Fees</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Agreement ID</th>
                      <th className="px-4 py-3">Equipment</th>
                      <th className="px-4 py-3">Owning Institution</th>
                      <th className="px-4 py-3">Requesting Institution</th>
                      <th className="px-4 py-3">Billing Period</th>
                      <th className="px-4 py-3">Sharing Fee</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {sharingCosts.map((s, idx) => (
                      <tr key={s.agreementId || `sc-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">SA-#{s.agreementId}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{s.equipmentName}</td>
                        <td className="px-4 py-3 text-slate-600">{s.owningInstitution}</td>
                        <td className="px-4 py-3 text-slate-600">{s.requestingInstitution}</td>
                        <td className="px-4 py-3 text-slate-500">{s.billingPeriod || "N/A"}</td>
                        <td className="px-4 py-3 font-bold text-indigo-700">{formatCurrency(s.sharingFee || 0)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={s.paymentStatus || s.invoiceStatus || "APPROVED"} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* INSTITUTION ADMIN DEPARTMENT COMPARISON */}
          {isInstAdmin && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-1">Department Cost &amp; Budget Comparison</h3>
              <p className="text-xs text-slate-500 mb-4">Financial overview across all institution departments</p>
              {deptComparison.length === 0 ? (
                <EmptyState icon={Building2} title="No department financial comparison available" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">Total Cost</th>
                        <th className="px-4 py-3">Usage</th>
                        <th className="px-4 py-3">Maintenance</th>
                        <th className="px-4 py-3">Allocated Budget</th>
                        <th className="px-4 py-3">Budget Used</th>
                        <th className="px-4 py-3">Budget Util %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {deptComparison.map((d, idx) => (
                        <tr key={d.departmentId || `dcc-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                            <Building2 size={14} className="text-emerald-500" />
                            {d.departmentName}
                          </td>
                          <td className="px-4 py-3 font-extrabold text-slate-900">{formatCurrency(d.totalCost || 0)}</td>
                          <td className="px-4 py-3 text-blue-700">{formatCurrency(d.usageCost || 0)}</td>
                          <td className="px-4 py-3 text-orange-700">{formatCurrency(d.maintenanceCost || 0)}</td>
                          <td className="px-4 py-3 text-slate-600">{formatCurrency(d.budgetAllocated || 0)}</td>
                          <td className="px-4 py-3 font-bold text-slate-800">{formatCurrency(d.budgetUsed || 0)}</td>
                          <td className="px-4 py-3 font-bold text-emerald-700">
                            {d.budgetUtilizationPercentage != null ? d.budgetUtilizationPercentage.toFixed(1) : "0.0"}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* EXPORT ACTION BUTTONS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-wrap items-center justify-between gap-4 text-xs shadow-xs">
            <div>
              <p className="font-bold text-slate-900">Export Report Options</p>
              <p className="text-[11px] text-slate-500">Download active cost analysis report data in PDF, Excel, or CSV format</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleExport("pdf", reportApi.exportCostPdf)}
                disabled={exportingType !== null}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-3.5 py-2 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText size={14} />
                {exportingType === "pdf" ? "Generating PDF..." : "Export PDF"}
              </button>
              <button
                onClick={() => handleExport("excel", reportApi.exportCostExcel)}
                disabled={exportingType !== null}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-3.5 py-2 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileSpreadsheet size={14} />
                {exportingType === "excel" ? "Generating Excel..." : "Export Excel"}
              </button>
              <button
                onClick={() => handleExport("csv", reportApi.exportCostCsv)}
                disabled={exportingType !== null}
                className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-700 px-3.5 py-2 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileCode size={14} />
                {exportingType === "csv" ? "Generating CSV..." : "Export CSV"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Cost Breakdown Distribution Component
function CostDistributionProportion({ summary }) {
  const total = Number(summary.totalCost) || 0;
  const usage = Number(summary.usageCost) || 0;
  const maint = Number(summary.maintenanceCost) || 0;
  const share = Number(summary.sharingFee) || 0;
  const damage = Number(summary.damageCharge) || 0;

  if (total <= 0) {
    return <p className="text-xs text-slate-400 italic">No financial cost items recorded</p>;
  }

  const items = [
    { label: "Usage Cost", amount: usage, color: "bg-blue-500", text: "text-blue-700" },
    { label: "Maintenance", amount: maint, color: "bg-orange-500", text: "text-orange-700" },
    { label: "Sharing Fee", amount: share, color: "bg-indigo-500", text: "text-indigo-700" },
    { label: "Damage Charge", amount: damage, color: "bg-red-500", text: "text-red-700" },
  ];

  return (
    <div className="space-y-4">
      {/* Proportion Bar */}
      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
        {items.map((it, idx) => {
          const pct = (it.amount / total) * 100;
          if (pct <= 0) return null;
          return (
            <div
              key={idx}
              className={`h-full ${it.color} transition-all`}
              style={{ width: `${pct}%` }}
              title={`${it.label}: ${formatCurrency(it.amount)} (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      <div className="space-y-2.5">
        {items.map((it, idx) => {
          const pct = total > 0 ? (it.amount / total) * 100 : 0;
          return (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${it.color}`} />
                <span className="font-semibold text-slate-700">{it.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-bold ${it.text}`}>{formatCurrency(it.amount)}</span>
                <span className="text-[11px] font-medium text-slate-400 min-w-[36px] text-right">{pct.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Monthly Cost Trend Bar Chart Component
function MonthlyCostChart({ points }) {
  const maxTotal = Math.max(1, ...points.map((pt) => Number(pt.totalCost) || 0));

  return (
    <div className="w-full">
      <div className="h-48 w-full flex items-end gap-3 pt-6 pb-2 border-b border-slate-200 overflow-x-auto">
        {points.map((pt, idx) => {
          const total = Number(pt.totalCost) || 0;
          const heightPct = `${Math.max(4, (total / maxTotal) * 100)}%`;
          return (
            <div key={pt.period || idx} className="flex-1 min-w-[32px] flex flex-col items-center group relative">
              {/* Tooltip */}
              <div className="absolute -top-12 hidden group-hover:flex flex-col items-center z-10 bg-slate-900 text-white text-[10px] font-bold py-1 px-2.5 rounded shadow-md whitespace-nowrap">
                <span>{pt.period}: {formatCurrency(total)}</span>
                <span className="text-[9px] text-slate-300">Usage: {formatCurrency(pt.usageCost || 0)}</span>
              </div>

              {/* Stacked/Proportional Bar */}
              <div className="w-full bg-slate-100 hover:bg-emerald-600 rounded-t transition-colors relative" style={{ height: heightPct }}>
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500 rounded-t" />
              </div>
              <span className="text-[10px] text-slate-500 mt-2 font-semibold truncate w-full text-center">
                {pt.period ? pt.period : idx + 1}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-medium">
        <span>₹0</span>
        <span>{formatCurrency(maxTotal / 2)}</span>
        <span>{formatCurrency(maxTotal)}</span>
      </div>
    </div>
  );
}
