import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Gauge, Package, TrendingUp, Clock, AlertTriangle, RefreshCw,
  LayoutGrid, List as ListIcon, SlidersHorizontal, AlertCircle
} from "lucide-react";
import { Field, inputClass } from "../common/Field.jsx";
import { StatCard } from "../common/StatCard.jsx";
import { ViewHeader } from "../common/ViewHeader.jsx";
import { EmptyState } from "../common/EmptyState.jsx";
import { Modal } from "../common/Modal.jsx";
import { heatmapApi } from "../../api/heatmapApi.js";
import { equipmentApi } from "../../api/equipmentApi.js";
import { departmentApi } from "../../api/departmentApi.js";

const VIEW_BY_OPTIONS = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

function pad2(n) { return String(n).padStart(2, "0"); }

function formatLocalIsoDate(d) {
  const year = d.getFullYear();
  const month = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${year}-${month}-${day}`;
}

function todayIsoDate() {
  return formatLocalIsoDate(new Date());
}

function todayIsoWeek() {
  const d = new Date();
  const dayNum = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - dayNum);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${pad2(weekNo)}`;
}

function todayIsoMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function getExpectedColumnHeaders(viewBy, dayValue, weekValue, monthValue, yearValue) {
  const cols = [];
  if (viewBy === "day") {
    const baseDate = dayValue || todayIsoDate();
    for (let h = 8; h <= 17; h++) {
      const colKey = `${baseDate}-${h}`;
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 === 0 ? 12 : h % 12;
      cols.push({ key: colKey, label: `${h12} ${ampm}` });
    }
  } else if (viewBy === "week") {
    const [yStr, wStr] = (weekValue || todayIsoWeek()).split("-W");
    const year = Number(yStr) || new Date().getFullYear();
    const week = Number(wStr) || 1;
    const jan4 = new Date(year, 0, 4);
    const dayOfWeek = jan4.getDay() || 7;
    const monday = new Date(year, 0, 4);
    monday.setDate(jan4.getDate() - (dayOfWeek - 1) + (week - 1) * 7);

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const colKey = formatLocalIsoDate(d);
      cols.push({
        key: colKey,
        label: `${dayNames[i]} (${d.getMonth() + 1}/${d.getDate()})`,
      });
    }
  } else if (viewBy === "month") {
    const [y, m] = (monthValue || todayIsoMonth()).split("-").map(Number);
    const totalDays = new Date(y, m, 0).getDate();
    for (let d = 1; d <= totalDays; d++) {
      const colKey = `${y}-${pad2(m)}-${pad2(d)}`;
      cols.push({ key: colKey, label: String(d) });
    }
  } else if (viewBy === "year") {
    const y = yearValue || new Date().getFullYear();
    const monthShorts = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let m = 1; m <= 12; m++) {
      const colKey = `${y}-${pad2(m)}`;
      cols.push({ key: colKey, label: monthShorts[m - 1] });
    }
  }
  return cols;
}

function heatColor(v) {
  if (v === null || v === undefined) return "bg-slate-50 border border-slate-100 text-slate-300";
  if (v === 0) return "bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200";
  if (v >= 90) return "bg-blue-800 text-white border border-blue-900 font-extrabold hover:bg-blue-900";
  if (v >= 70) return "bg-blue-600 text-white border border-blue-700 font-bold hover:bg-blue-700";
  if (v >= 50) return "bg-blue-500 text-white border border-blue-600 font-bold hover:bg-blue-600";
  if (v >= 30) return "bg-blue-200 text-blue-950 border border-blue-300 font-semibold hover:bg-blue-300";
  if (v > 0) return "bg-blue-100 text-blue-900 border border-blue-200 font-medium hover:bg-blue-200";
  return "bg-slate-100 text-slate-400 border border-slate-200";
}

function heatText(v) {
  if (v === null || v === undefined) return "text-slate-300";
  if (v >= 50) return "text-white font-bold";
  if (v > 0) return "text-blue-950 font-bold";
  return "text-slate-400 font-normal";
}

export default function UtilizationHeatmapPage({ role = "manager", user }) {
  const isInstAdmin = role === "institution-admin" || user?.roles?.includes("INSTITUTION_ADMIN") || user?.roles?.includes("ROLE_INSTITUTION_ADMIN");
  const isDeptScoped = !isInstAdmin;

  const [departments, setDepartments] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);

  const [deptFilter, setDeptFilter] = useState(isDeptScoped ? (user?.departmentId || "MY_DEPT") : "ALL");
  const [labFilter, setLabFilter] = useState("ALL");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sharingScope, setSharingScope] = useState("ALL");
  const [viewBy, setViewBy] = useState("month");

  const [dayValue, setDayValue] = useState(todayIsoDate());
  const [weekValue, setWeekValue] = useState(todayIsoWeek());
  const [monthValue, setMonthValue] = useState(todayIsoMonth());
  const [yearValue, setYearValue] = useState(new Date().getFullYear());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heatmapData, setHeatmapData] = useState({ equipment: [], bookings: [], cells: [], summary: {} });

  // DEFAULT VIEW MODE IS STRICTLY "heatmap"
  const [displayMode, setDisplayMode] = useState("heatmap");
  const [cellModal, setCellModal] = useState(null);

  // 1. Initial metadata load
  useEffect(() => {
    departmentApi.getMyInstitutionDepartments()
      .then((depts) => {
        if (Array.isArray(depts)) setDepartments(depts);
      })
      .catch(() => {});

    equipmentApi.getCategories()
      .then((cats) => {
        if (Array.isArray(cats)) setCategories(cats);
      })
      .catch(() => {});
  }, []);

  // 2. Cascade: Department changes -> clear lab & location, load labs
  const handleDepartmentChange = (newDeptId) => {
    setDeptFilter(newDeptId);
    setLabFilter("ALL");
    setLocationFilter("ALL");
  };

  useEffect(() => {
    const targetDeptId = deptFilter !== "ALL" && !isNaN(Number(deptFilter)) ? Number(deptFilter) : null;
    equipmentApi.getLaboratories(targetDeptId)
      .then((labs) => {
        if (Array.isArray(labs)) setLaboratories(labs);
      })
      .catch(() => setLaboratories([]));
  }, [deptFilter]);

  // 3. Cascade: Laboratory changes -> clear location, load locations
  const handleLabChange = (newLabId) => {
    setLabFilter(newLabId);
    setLocationFilter("ALL");
  };

  useEffect(() => {
    const targetDeptId = deptFilter !== "ALL" && !isNaN(Number(deptFilter)) ? Number(deptFilter) : null;
    const targetLabId = labFilter !== "ALL" && !isNaN(Number(labFilter)) ? Number(labFilter) : null;

    const params = {};
    if (targetDeptId) params.departmentId = targetDeptId;
    if (targetLabId) params.labId = targetLabId;

    equipmentApi.getLocations(params)
      .then((locs) => {
        if (Array.isArray(locs)) setLocations(locs);
      })
      .catch(() => setLocations([]));
  }, [deptFilter, labFilter]);

  // 4. Fetch Heatmap Data
  const loadHeatmapData = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = { viewBy };

    if (deptFilter !== "ALL" && !isNaN(Number(deptFilter))) {
      params.departmentId = Number(deptFilter);
    }

    if (viewBy === "day" && dayValue) {
      params.from = `${dayValue}T00:00:00`;
      params.to = `${dayValue}T23:59:59`;
    } else if (viewBy === "week" && weekValue) {
      const [yStr, wStr] = (weekValue || todayIsoWeek()).split("-W");
      const year = Number(yStr) || new Date().getFullYear();
      const week = Number(wStr) || 1;
      const jan4 = new Date(year, 0, 4);
      const dayOfWeek = jan4.getDay() || 7;
      const monday = new Date(year, 0, 4);
      monday.setDate(jan4.getDate() - (dayOfWeek - 1) + (week - 1) * 7);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      params.from = `${formatLocalIsoDate(monday)}T00:00:00`;
      params.to = `${formatLocalIsoDate(sunday)}T23:59:59`;
    } else if (viewBy === "month" && monthValue) {
      const [y, m] = (monthValue || todayIsoMonth()).split("-").map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      params.from = `${monthValue}-01T00:00:00`;
      params.to = `${monthValue}-${pad2(lastDay)}T23:59:59`;
    } else if (viewBy === "year" && yearValue) {
      params.from = `${yearValue}-01-01T00:00:00`;
      params.to = `${yearValue}-12-31T23:59:59`;
    }

    heatmapApi.getHeatmapData(params)
      .then((data) => {
        if (data) {
          setHeatmapData({
            equipment: Array.isArray(data.equipment) ? data.equipment : [],
            bookings: Array.isArray(data.bookings) ? data.bookings : [],
            cells: Array.isArray(data.cells) ? data.cells : [],
            summary: data.summary || {},
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Heatmap API error:", err);
        setError("Unable to load utilization data");
        setLoading(false);
      });
  }, [deptFilter, viewBy, dayValue, weekValue, monthValue, yearValue]);

  useEffect(() => {
    loadHeatmapData();
  }, [loadHeatmapData]);

  // Client-side filtering of authorized equipment
  const filteredEquipment = useMemo(() => {
    return (heatmapData.equipment || []).filter((eq) => {
      if (eq.status === "RETIRED") return false;
      if (categoryFilter !== "ALL" && eq.category !== categoryFilter) return false;
      if (labFilter !== "ALL" && String(eq.labId) !== String(labFilter)) return false;
      if (locationFilter !== "ALL" && eq.location !== locationFilter) return false;
      if (sharingScope === "SHARED_ONLY" && !eq.isShareable && !eq.isShared) return false;
      return true;
    });
  }, [heatmapData.equipment, categoryFilter, labFilter, locationFilter, sharingScope]);

  // Map cells lookup: equipmentId + colKey -> HeatmapCellDto
  const cellsByEquipmentAndCol = useMemo(() => {
    const map = new Map();
    (heatmapData.cells || []).forEach((c) => {
      map.set(`${c.equipmentId}::${c.colKey}`, c);
    });
    return map;
  }, [heatmapData.cells]);

  // Column headers guaranteed for active viewBy
  const columnHeaders = useMemo(() => {
    const expected = getExpectedColumnHeaders(viewBy, dayValue, weekValue, monthValue, yearValue);
    const keysSeen = new Set(expected.map((c) => c.key));

    (heatmapData.cells || []).forEach((c) => {
      if (c.colKey && !keysSeen.has(c.colKey)) {
        keysSeen.add(c.colKey);
        expected.push({
          key: c.colKey,
          label: c.colKey.split("-").pop(),
        });
      }
    });

    return expected;
  }, [viewBy, dayValue, weekValue, monthValue, yearValue, heatmapData.cells]);

  // Row Averages
  const rowAverages = useMemo(() => {
    return filteredEquipment.map((eq) => {
      const eqId = eq.id || eq.equipmentId;
      const eqCells = (heatmapData.cells || []).filter((c) => String(c.equipmentId) === String(eqId));
      const totalAvail = eqCells.reduce((a, c) => a + (c.availableHours || 0), 0);
      const totalUsed = eqCells.reduce((a, c) => a + (c.usedHours || 0), 0);
      const avgPct = totalAvail > 0 ? Math.min(100, Math.round((totalUsed / totalAvail) * 100)) : 0;
      return {
        equipment: eq,
        avgPct,
        totalUsed: Math.round(totalUsed * 10) / 10,
        totalAvail: Math.round(totalAvail * 10) / 10,
      };
    }).sort((a, b) => b.avgPct - a.avgPct);
  }, [filteredEquipment, heatmapData.cells]);

  const busiest = rowAverages.slice(0, 3);
  const idleList = [...rowAverages].sort((a, b) => a.avgPct - b.avgPct).slice(0, 3);

  const userDeptName = useMemo(() => {
    if (user?.departmentName) return user.departmentName;
    if (user?.departmentId && departments.length > 0) {
      const d = departments.find((dept) => String(dept.departmentId) === String(user.departmentId));
      if (d) return d.name;
    }
    return user?.department || "My Department";
  }, [user, departments]);

  return (
    <div>
      <ViewHeader title="Utilization Heatmap & Analytics" subtitle="Real-time equipment utilization heatmap powered by authoritative database analytics." />

      {/* Filter Scope Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <SlidersHorizontal size={14} className="text-blue-600" /> Filter Scope
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Field label="Department">
            {isDeptScoped ? (
              <input value={userDeptName} disabled className={`${inputClass()} bg-slate-50 text-slate-500 font-semibold cursor-not-allowed`} />
            ) : (
              <select value={deptFilter} onChange={(e) => handleDepartmentChange(e.target.value)} className={inputClass()}>
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.departmentId} value={d.departmentId}>{d.name}</option>
                ))}
              </select>
            )}
          </Field>

          <Field label="Laboratory">
            <select value={labFilter} onChange={(e) => handleLabChange(e.target.value)} className={inputClass()}>
              <option value="ALL">All Laboratories</option>
              {laboratories.map((l) => (
                <option key={l.labId} value={l.labId}>{l.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Location / Room">
            <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className={inputClass()}>
              <option value="ALL">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </Field>

          <Field label="Category">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={inputClass()}>
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Field label="Sharing Scope">
            <select value={sharingScope} onChange={(e) => setSharingScope(e.target.value)} className={inputClass()}>
              <option value="ALL">All Equipment</option>
              <option value="SHARED_ONLY">Shared Equipment Only</option>
            </select>
          </Field>

          <Field label="View By">
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
              {VIEW_BY_OPTIONS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setViewBy(v.id)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${viewBy === v.id ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Date / Period">
            {viewBy === "day" && (
              <input type="date" value={dayValue} onChange={(e) => e.target.value && setDayValue(e.target.value)} className={inputClass()} />
            )}
            {viewBy === "week" && (
              <input type="week" value={weekValue} onChange={(e) => e.target.value && setWeekValue(e.target.value)} className={inputClass()} />
            )}
            {viewBy === "month" && (
              <input type="month" value={monthValue} onChange={(e) => e.target.value && setMonthValue(e.target.value)} className={inputClass()} />
            )}
            {viewBy === "year" && (
              <select value={yearValue} onChange={(e) => setYearValue(Number(e.target.value))} className={inputClass()}>
                {[new Date().getFullYear() - 2, new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            )}
          </Field>

          <div className="flex justify-end">
            <button
              onClick={loadHeatmapData}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 mb-6 text-center">
          <AlertCircle size={28} className="mx-auto text-red-500 mb-2" />
          <h3 className="text-base font-bold text-red-900">{error}</h3>
          <p className="text-xs text-red-600 mt-1 mb-4">The server request failed or timed out.</p>
          <button
            onClick={loadHeatmapData}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 transition-colors"
          >
            <RefreshCw size={13} /> Retry Connection
          </button>
        </div>
      )}

      {/* Skeleton Loading State */}
      {loading && !error && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl" />
            ))}
          </div>
          <div className="space-y-3">
            <div className="h-6 bg-slate-100 rounded-md w-1/4" />
            <div className="grid grid-cols-8 gap-2">
              {[...Array(32)].map((_, i) => (
                <div key={i} className="h-9 bg-slate-100 rounded-md" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredEquipment.length === 0 && (
        <EmptyState icon={Package} title="No utilization data available for the selected period" subtitle="No equipment records match the selected scope and period." />
      )}

      {/* Main Content */}
      {!loading && !error && filteredEquipment.length > 0 && (
        <>
          {/* Top Real KPI Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Gauge} label="Average Utilization" value={`${heatmapData.summary.averageUtilization ?? 0}%`} tone="text-blue-600" bg="bg-blue-50" />
            <StatCard icon={TrendingUp} label="Highest Utilized" value={busiest[0] ? `${busiest[0].equipment.name} (${busiest[0].avgPct}%)` : "—"} tone="text-emerald-600" bg="bg-emerald-50" />
            <StatCard icon={Clock} label="Lowest Utilized" value={idleList[0] ? `${idleList[0].equipment.name} (${idleList[0].avgPct}%)` : "—"} tone="text-indigo-600" bg="bg-indigo-50" />
            <StatCard icon={AlertTriangle} label="Idle Equipment Alert" value={`${heatmapData.summary.idleCount ?? 0} Idle Equipment`} tone="text-amber-600" bg="bg-amber-50" />
          </div>

          {/* Grid / Table Container */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Equipment Utilization Grid (%)</h2>
                <p className="text-xs text-slate-500 mt-0.5">Authoritative Equipment × Time Bucket utilization intensity matrix.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                  <button
                    onClick={() => setDisplayMode("heatmap")}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                      displayMode === "heatmap" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <LayoutGrid size={13} /> Visual Heatmap
                  </button>
                  <button
                    onClick={() => setDisplayMode("table")}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                      displayMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <ListIcon size={13} /> Data Table
                  </button>
                </div>
              </div>
            </div>

            {/* VISUAL HEATMAP VIEW MODE (DEFAULT) */}
            {displayMode === "heatmap" ? (
              <>
                <div className="overflow-x-auto mt-2 pb-2">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80">
                        <th className="sticky left-0 bg-slate-50 z-20 shadow-sm border-r border-slate-200 px-3 py-2.5 text-left font-bold text-slate-700 min-w-[200px]">
                          Equipment & Metadata
                        </th>
                        {columnHeaders.map((col) => (
                          <th key={col.key} className="px-1.5 py-2.5 text-center font-bold text-slate-600 min-w-[48px]">
                            {col.label}
                          </th>
                        ))}
                        <th className="px-3 py-2.5 text-center font-bold text-slate-800 border-l border-slate-200 min-w-[60px]">
                          Avg
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredEquipment.map((eq) => {
                        const eqId = eq.id || eq.equipmentId;
                        const rowStat = rowAverages.find((r) => String(r.equipment.id || r.equipment.equipmentId) === String(eqId));
                        return (
                          <tr key={eqId} className="hover:bg-slate-50/60 transition-colors">
                            {/* Sticky Equipment Details */}
                            <td className="sticky left-0 bg-white z-10 shadow-sm border-r border-slate-200 px-3 py-2">
                              <div className="font-bold text-slate-800 text-xs truncate max-w-[200px]" title={eq.name}>
                                {eq.name}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                                {eq.department || eq.departmentName || "General Dept"} · {eq.labName || (eq.labId ? `Lab #${eq.labId}` : "Main Lab")}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                                Room: {eq.location || "Unspecified"}
                              </div>
                            </td>

                            {/* Equipment x Time Bucket Heatmap Cells */}
                            {columnHeaders.map((col) => {
                              const cellData = cellsByEquipmentAndCol.get(`${eqId}::${col.key}`);
                              const pct = cellData ? cellData.utilizationPercentage : 0;
                              return (
                                <td key={col.key} className="p-1 text-center">
                                  <button
                                    onClick={() => setCellModal({ equipment: eq, colKey: col.key, cell: cellData })}
                                    title={`${eq.name} [${col.label}]: ${pct}% utilization`}
                                    className={`w-full h-9 min-w-[42px] rounded-md flex items-center justify-center text-[10px] transition-all hover:scale-105 shadow-2xs ${heatColor(pct)} ${heatText(pct)}`}
                                  >
                                    {cellData != null ? `${pct}%` : "0%"}
                                  </button>
                                </td>
                              );
                            })}

                            {/* Row Average */}
                            <td className="px-3 py-2 text-center font-extrabold text-slate-900 border-l border-slate-200">
                              {rowStat?.avgPct ?? 0}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Legend Scale */}
                <div className="mt-4 flex items-center gap-4 text-xs text-slate-600 flex-wrap pt-3 border-t border-slate-100">
                  <span className="font-bold text-slate-800">Utilization Scale:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded bg-slate-100 border border-slate-200" />
                    <span>0% (Idle)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded bg-blue-100 border border-blue-200" />
                    <span>1–29%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded bg-blue-200 border border-blue-300" />
                    <span>30–49%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded bg-blue-500 border border-blue-600" />
                    <span>50–69%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded bg-blue-600 border border-blue-700" />
                    <span>70–89%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded bg-blue-800 border border-blue-900" />
                    <span>90–100% (Peak)</span>
                  </div>
                </div>
              </>
            ) : (
              /* DATA TABLE VIEW MODE */
              <div className="mt-2 overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                    <tr>
                      <th className="text-left font-semibold px-4 py-2.5">Equipment Name</th>
                      <th className="text-left font-semibold px-4 py-2.5">Department</th>
                      <th className="text-left font-semibold px-4 py-2.5">Laboratory</th>
                      <th className="text-left font-semibold px-4 py-2.5">Location</th>
                      <th className="text-right font-semibold px-4 py-2.5">Utilization %</th>
                      <th className="text-right font-semibold px-4 py-2.5">Used Hours</th>
                      <th className="text-right font-semibold px-4 py-2.5">Available Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rowAverages.map((row) => (
                      <tr key={row.equipment.id || row.equipment.equipmentId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2.5 font-semibold text-slate-800">{row.equipment.name}</td>
                        <td className="px-4 py-2.5 text-slate-600">{row.equipment.department || row.equipment.departmentName}</td>
                        <td className="px-4 py-2.5 text-slate-600">{row.equipment.labName || (row.equipment.labId ? `Lab #${row.equipment.labId}` : "Main Lab")}</td>
                        <td className="px-4 py-2.5 text-slate-600">{row.equipment.location || "Unspecified"}</td>
                        <td className={`px-4 py-2.5 text-right font-bold ${row.avgPct === 0 ? "text-slate-400" : "text-blue-600"}`}>{row.avgPct}%</td>
                        <td className="px-4 py-2.5 text-right text-slate-700">{row.totalUsed} hrs</td>
                        <td className="px-4 py-2.5 text-right text-slate-700">{row.totalAvail} hrs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Cell Drill-Down Modal */}
      {cellModal && (
        <Modal title={cellModal.equipment.name} subtitle={`Time Bucket: ${cellModal.colKey}`} onClose={() => setCellModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <p className="text-slate-400 font-medium">Department</p>
                <p className="font-bold text-slate-800">{cellModal.equipment.department || cellModal.equipment.departmentName}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Laboratory</p>
                <p className="font-bold text-slate-800">{cellModal.equipment.labName || (cellModal.equipment.labId ? `Lab #${cellModal.equipment.labId}` : "Main Lab")}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Location</p>
                <p className="font-bold text-slate-800">{cellModal.equipment.location || "Unspecified"}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Utilization Rate</p>
                <p className="font-bold text-blue-600 text-sm">{cellModal.cell ? `${cellModal.cell.utilizationPercentage}%` : "0%"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-100 pt-3">
              <div>
                <span className="text-slate-500">Used Hours: </span>
                <span className="font-bold text-slate-800">{cellModal.cell ? cellModal.cell.usedHours : 0} hrs</span>
              </div>
              <div>
                <span className="text-slate-500">Available Hours: </span>
                <span className="font-bold text-slate-800">{cellModal.cell ? cellModal.cell.availableHours : 0} hrs</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-bold text-slate-700 mb-2">Usable Usage Bookings in Window</p>
              {cellModal.cell && cellModal.cell.bookingIds && cellModal.cell.bookingIds.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cellModal.cell.bookingIds.map((bId) => {
                    const b = (heatmapData.bookings || []).find((bk) => String(bk.id || bk.bookingId) === String(bId));
                    if (!b) return null;
                    return (
                      <div key={bId} className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>Booking #{b.id || b.bookingId}</span>
                          <span className="text-blue-600 font-semibold">{b.status}</span>
                        </div>
                        <p className="text-slate-600 mt-1">Researcher: {b.researcher || "Unknown User"}</p>
                        <p className="text-slate-500 text-[11px]">{b.start ? new Date(b.start).toLocaleString() : ""} – {b.end ? new Date(b.end).toLocaleString() : ""}</p>
                        {b.purpose && <p className="text-slate-500 text-[11px] mt-0.5">Purpose: {b.purpose}</p>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No usage bookings recorded for this time window.</p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
