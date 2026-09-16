import { useState, useEffect } from "react";
import { Gauge, Clock, Activity, AlertCircle, BarChart2, Calendar, Building2, FlaskConical, Download, Layers, ArrowUpRight, ArrowDownRight, FileText, FileSpreadsheet, FileCode } from "lucide-react";
import { ViewHeader } from "../common/ViewHeader.jsx";
import { StatCard } from "../common/StatCard.jsx";
import { StatusBadge } from "../common/StatusBadge.jsx";
import { EmptyState } from "../common/EmptyState.jsx";
import { reportApi } from "../../api/reportApi.js";
import { departmentApi } from "../../api/departmentApi.js";

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
    // April 1 to March 31
    const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    const from = new Date(fyStartYear, 3, 1);
    return { from: from.toISOString().slice(0, 10), to: todayStr };
  }
  return { from: "", to: "" };
}

export function UtilizationEffectivenessView({ user, role, toast }) {
  const isInstAdmin = role === "INSTITUTION_ADMIN" || (user?.roles || []).some(r => r.includes("INSTITUTION_ADMIN"));
  
  const [preset, setPreset] = useState("30d");
  const [dateRange, setDateRange] = useState(getDateRangeFromPreset("30d"));
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedLabId, setSelectedLabId] = useState("");
  
  const [departments, setDepartments] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportingType, setExportingType] = useState(null); // 'pdf' | 'excel' | 'csv' | null

  // Fetch department list for Institution Admin
  useEffect(() => {
    if (isInstAdmin) {
      departmentApi.getMyInstitutionDepartments()
        .then((depts) => {
          if (Array.isArray(depts)) {
            setDepartments(depts);
          }
        })
        .catch((err) => console.warn("Could not load departments for filter:", err));
    }
  }, [isInstAdmin]);

  // Update laboratory options when selected department changes or for lab manager
  useEffect(() => {
    if (selectedDeptId && isInstAdmin) {
      const targetDept = departments.find(d => String(d.departmentId) === String(selectedDeptId));
      setLaboratories(targetDept?.laboratories || []);
    } else if (departments.length > 0) {
      const allLabs = departments.flatMap(d => d.laboratories || []);
      setLaboratories(allLabs);
    } else {
      setLaboratories([]);
    }
  }, [selectedDeptId, departments, isInstAdmin]);

  // Fetch report data
  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (dateRange.from) params.from = dateRange.from;
      if (dateRange.to) params.to = dateRange.to;
      if (isInstAdmin && selectedDeptId) params.departmentId = selectedDeptId;
      if (selectedLabId) params.laboratoryId = selectedLabId;

      const response = await reportApi.getUtilizationEffectiveness(params);
      setData(response);
    } catch (err) {
      console.error("Failed to load utilization effectiveness report:", err);
      setError(err.message || "Failed to load utilization effectiveness report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [dateRange, selectedDeptId, selectedLabId]);

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
      if (isInstAdmin && selectedDeptId) params.departmentId = selectedDeptId;
      if (selectedLabId) params.laboratoryId = selectedLabId;

      await exportFn(params);
      toast(`Utilization Effectiveness Report exported as ${format.toUpperCase()}.`, "success");
    } catch (err) {
      console.error(`Export ${format} failed:`, err);
      toast(err.message || `Unable to generate ${format.toUpperCase()} report. Please try again.`, "error");
    } finally {
      setExportingType(null);
    }
  };

  const summary = data?.summary || {};
  const metadata = data?.metadata || {};
  const mostUtilized = data?.mostUtilizedEquipment;
  const leastUtilized = data?.leastUtilizedEquipment;
  const equipmentList = data?.equipmentUtilization || [];
  const trend = data?.utilizationTrend || [];
  const underutilized = data?.underutilizedEquipment || [];
  const highlyUtilized = data?.highlyUtilizedEquipment || [];
  const deptComparison = data?.departmentComparison || [];

  return (
    <div className="space-y-6">
      <ViewHeader
        title="Utilization Effectiveness Report"
        subtitle={`Real-time operational analytics for ${metadata.institutionName || user?.institutionName || "Institution"}${metadata.departmentName ? " • " + metadata.departmentName : ""}`}
      />

      {/* FILTER BAR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <BarChart2 size={18} className="text-blue-600" />
            <span>Report Filters</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Quick Preset Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Time Period</label>
              <select
                value={preset}
                onChange={handlePresetChange}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
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

            {/* Custom Dates */}
            {preset === "custom" && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">From</label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">To</label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
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
                  onChange={(e) => { setSelectedDeptId(e.target.value); setSelectedLabId(""); }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.departmentId} value={d.departmentId}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Department Head / Manager: Fixed Scope Badge */}
            {!isInstAdmin && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Department</label>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                  <Building2 size={13} className="text-slate-500" />
                  {user?.department || metadata.departmentName || "My Department"}
                </span>
              </div>
            )}

            {/* Laboratory Selector */}
            {laboratories.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Laboratory</label>
                <select
                  value={selectedLabId}
                  onChange={(e) => setSelectedLabId(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">All Laboratories</option>
                  {laboratories.map((l) => (
                    <option key={l.laboratoryId || l.id} value={l.laboratoryId || l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={fetchReport}
              className="mt-4 sm:mt-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 text-xs transition-colors cursor-pointer"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-3"></div>
          <p className="text-sm font-semibold text-slate-700">Loading Utilization Effectiveness Data...</p>
          <p className="text-xs text-slate-400 mt-1">Aggregating metric history from PostgreSQL</p>
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center">
          <AlertCircle size={32} className="mx-auto text-red-500 mb-2" />
          <h3 className="text-sm font-bold text-red-900">Unable to load report</h3>
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
          {/* KPI CARDS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Gauge}
              label="Average Utilization"
              value={`${summary.averageUtilizationPercentage != null ? summary.averageUtilizationPercentage.toFixed(1) : "0.0"}%`}
              tone="text-emerald-600"
              bg="bg-emerald-50"
            />
            <StatCard
              icon={Clock}
              label="Total Used Hours"
              value={`${summary.totalUsedHours != null ? summary.totalUsedHours.toFixed(1) : "0.0"} hrs`}
              tone="text-blue-600"
              bg="bg-blue-50"
            />
            <StatCard
              icon={Activity}
              label="Total Available Hours"
              value={`${summary.totalAvailableHours != null ? summary.totalAvailableHours.toFixed(1) : "0.0"} hrs`}
              tone="text-indigo-600"
              bg="bg-indigo-50"
            />
            <StatCard
              icon={Layers}
              label="Total Idle Hours"
              value={`${summary.totalIdleHours != null ? summary.totalIdleHours.toFixed(1) : "0.0"} hrs`}
              tone="text-amber-600"
              bg="bg-amber-50"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Total Equipment Assets</p>
                <p className="text-lg font-bold text-slate-900 mt-0.5">{summary.totalEquipmentCount || 0}</p>
              </div>
              <FlaskConical size={24} className="text-slate-400" />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Total Laboratories</p>
                <p className="text-lg font-bold text-slate-900 mt-0.5">{summary.totalLaboratoryCount || 0}</p>
              </div>
              <Building2 size={24} className="text-slate-400" />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Total Bookings Recorded</p>
                <p className="text-lg font-bold text-slate-900 mt-0.5">{summary.totalBookingCount || 0}</p>
              </div>
              <Calendar size={24} className="text-slate-400" />
            </div>
          </div>

          {/* MOST / LEAST UTILIZED RANKING */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <ArrowUpRight size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Most Utilized Equipment</h3>
                  <p className="text-xs text-slate-500">Highest usage rate in current range</p>
                </div>
              </div>
              {mostUtilized ? (
                <div className="mt-2 rounded-xl bg-emerald-50/50 border border-emerald-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">{mostUtilized.equipmentName}</p>
                    <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg text-xs">
                      {mostUtilized.utilizationPercentage != null ? mostUtilized.utilizationPercentage.toFixed(1) : 0}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{mostUtilized.laboratoryName || mostUtilized.departmentName || "Department Asset"}</p>
                  <div className="mt-2 flex gap-4 text-xs text-slate-600 font-medium">
                    <span>Used: {mostUtilized.usedHours != null ? mostUtilized.usedHours.toFixed(1) : 0}h</span>
                    <span>Available: {mostUtilized.availableHours != null ? mostUtilized.availableHours.toFixed(1) : 0}h</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic mt-3">No utilization records available</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <ArrowDownRight size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Least Utilized Equipment</h3>
                  <p className="text-xs text-slate-500">Lowest usage rate in current range</p>
                </div>
              </div>
              {leastUtilized ? (
                <div className="mt-2 rounded-xl bg-amber-50/50 border border-amber-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">{leastUtilized.equipmentName}</p>
                    <span className="font-extrabold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg text-xs">
                      {leastUtilized.utilizationPercentage != null ? leastUtilized.utilizationPercentage.toFixed(1) : 0}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{leastUtilized.laboratoryName || leastUtilized.departmentName || "Department Asset"}</p>
                  <div className="mt-2 flex gap-4 text-xs text-slate-600 font-medium">
                    <span>Used: {leastUtilized.usedHours != null ? leastUtilized.usedHours.toFixed(1) : 0}h</span>
                    <span>Available: {leastUtilized.availableHours != null ? leastUtilized.availableHours.toFixed(1) : 0}h</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic mt-3">No utilization records available</p>
              )}
            </div>
          </div>

          {/* UTILIZATION TREND CHART */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Utilization Trend</h3>
                <p className="text-xs text-slate-500 mt-0.5">Historical utilization percentage trend across selected period</p>
              </div>
            </div>
            {trend.length === 0 ? (
              <EmptyState icon={BarChart2} title="No trend data available for this range" />
            ) : (
              <div className="mt-4">
                <TrendChart points={trend} />
              </div>
            )}
          </div>

          {/* EQUIPMENT UTILIZATION TABLE */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Equipment Utilization Detail</h3>
            {equipmentList.length === 0 ? (
              <EmptyState icon={FlaskConical} title="No equipment utilization data found" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Equipment</th>
                      <th className="px-4 py-3">Laboratory</th>
                      <th className="px-4 py-3">Used Hours</th>
                      <th className="px-4 py-3">Available Hours</th>
                      <th className="px-4 py-3">Idle Hours</th>
                      <th className="px-4 py-3">Utilization %</th>
                      <th className="px-4 py-3">Bookings</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {equipmentList.map((item, idx) => (
                      <tr key={item.equipmentId || `eq-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">{item.equipmentName}</td>
                        <td className="px-4 py-3 text-slate-600">{item.laboratoryName || "General Lab"}</td>
                        <td className="px-4 py-3 font-semibold text-blue-700">{item.usedHours != null ? item.usedHours.toFixed(1) : "0.0"} h</td>
                        <td className="px-4 py-3 text-slate-600">{item.availableHours != null ? item.availableHours.toFixed(1) : "0.0"} h</td>
                        <td className="px-4 py-3 text-amber-700">{item.idleHours != null ? item.idleHours.toFixed(1) : "0.0"} h</td>
                        <td className="px-4 py-3 font-extrabold text-slate-900">
                          {item.utilizationPercentage != null ? item.utilizationPercentage.toFixed(1) : "0.0"}%
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-bold">{item.bookingCount || 0}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={item.utilizationStatus || "LOW"} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* HIGHLIGHTS: UNDERUTILIZED & HIGHLY UTILIZED */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Underutilized Equipment (&lt;30%)</h3>
              <p className="text-xs text-slate-500 mb-4">Assets requiring operational review or schedule optimization</p>
              {underutilized.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No underutilized equipment in this range</p>
              ) : (
                <div className="space-y-2">
                  {underutilized.map((item, idx) => (
                    <div key={item.equipmentId || `und-${idx}`} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{item.equipmentName}</p>
                        <p className="text-[11px] text-slate-500">{item.laboratoryName || item.departmentName}</p>
                      </div>
                      <span className="font-extrabold text-slate-700 bg-slate-200 px-2 py-1 rounded-md">
                        {item.utilizationPercentage != null ? item.utilizationPercentage.toFixed(1) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Highly Utilized Equipment (&ge;70%)</h3>
              <p className="text-xs text-slate-500 mb-4">High-demand assets requiring proactive maintenance oversight</p>
              {highlyUtilized.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No highly utilized equipment in this range</p>
              ) : (
                <div className="space-y-2">
                  {highlyUtilized.map((item, idx) => (
                    <div key={item.equipmentId || `high-${idx}`} className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{item.equipmentName}</p>
                        <p className="text-[11px] text-slate-500">{item.laboratoryName || item.departmentName}</p>
                      </div>
                      <span className="font-extrabold text-emerald-800 bg-emerald-200 px-2 py-1 rounded-md">
                        {item.utilizationPercentage != null ? item.utilizationPercentage.toFixed(1) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* INSTITUTION ADMIN DEPARTMENT COMPARISON */}
          {isInstAdmin && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-1">Department Utilization Comparison</h3>
              <p className="text-xs text-slate-500 mb-4">Comparative analytics across all departments in institution</p>
              {deptComparison.length === 0 ? (
                <EmptyState icon={Building2} title="No department comparison data available" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">Equipment Count</th>
                        <th className="px-4 py-3">Labs</th>
                        <th className="px-4 py-3">Used Hours</th>
                        <th className="px-4 py-3">Available Hours</th>
                        <th className="px-4 py-3">Utilization %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {deptComparison.map((d, idx) => (
                        <tr key={d.departmentId || `dc-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                            <Building2 size={14} className="text-blue-500" />
                            {d.departmentName}
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-bold">{d.equipmentCount || 0}</td>
                          <td className="px-4 py-3 text-slate-600">{d.laboratoryCount || 0}</td>
                          <td className="px-4 py-3 font-semibold text-blue-700">{d.usedHours != null ? d.usedHours.toFixed(1) : "0.0"} h</td>
                          <td className="px-4 py-3 text-slate-600">{d.availableHours != null ? d.availableHours.toFixed(1) : "0.0"} h</td>
                          <td className="px-4 py-3 font-extrabold text-emerald-700">
                            {d.utilizationPercentage != null ? d.utilizationPercentage.toFixed(1) : "0.0"}%
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
              <p className="text-[11px] text-slate-500">Download active report data in PDF, Excel, or CSV format</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleExport("pdf", reportApi.exportUtilizationPdf)}
                disabled={exportingType !== null}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-3.5 py-2 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText size={14} />
                {exportingType === "pdf" ? "Generating PDF..." : "Export PDF"}
              </button>
              <button
                onClick={() => handleExport("excel", reportApi.exportUtilizationExcel)}
                disabled={exportingType !== null}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-3.5 py-2 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileSpreadsheet size={14} />
                {exportingType === "excel" ? "Generating Excel..." : "Export Excel"}
              </button>
              <button
                onClick={() => handleExport("csv", reportApi.exportUtilizationCsv)}
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

// Custom responsive SVG Trend Chart
function TrendChart({ points }) {
  const maxPct = 100;
  return (
    <div className="w-full">
      <div className="h-48 w-full flex items-end gap-2 pt-6 pb-2 border-b border-slate-200 overflow-x-auto">
        {points.map((pt, idx) => {
          const pct = Math.min(100, Math.max(0, pt.utilizationPercentage || 0));
          const heightPct = `${Math.max(4, pct)}%`;
          return (
            <div key={pt.period || idx} className="flex-1 min-w-[28px] flex flex-col items-center group relative">
              {/* Tooltip */}
              <div className="absolute -top-10 hidden group-hover:flex flex-col items-center z-10 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded shadow-md whitespace-nowrap">
                <span>{pt.period}: {pct.toFixed(1)}%</span>
                <span className="text-[9px] text-slate-300">Used: {pt.usedHours?.toFixed(1) || 0}h</span>
              </div>
              
              {/* Bar */}
              <div className="w-full bg-blue-100 hover:bg-blue-600 rounded-t transition-colors relative" style={{ height: heightPct }}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 rounded-t"></div>
              </div>
              <span className="text-[10px] text-slate-500 mt-2 font-medium truncate w-full text-center">
                {pt.period ? pt.period.slice(-5) : idx + 1}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-medium">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
