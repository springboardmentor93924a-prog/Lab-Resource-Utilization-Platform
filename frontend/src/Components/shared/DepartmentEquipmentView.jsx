import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  Layers,
  CheckCircle2,
  Clock,
  Wrench,
  AlertTriangle,
  Eye,
  Pencil,
  MapPin,
  Tag,
  Activity,
  ShieldCheck,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Upload,
  Cpu,
  SlidersHorizontal,
  X,
  ExternalLink,
  ChevronRight,
  Info,
  Hash,
  LayoutGrid,
  List,
  Sparkles,
  AlertCircle,
  FileDown,
  Trash2,
  Image as ImageIcon
} from "lucide-react";
import { equipmentApi } from "../../api/equipmentApi";
import { maintenanceApi } from "../../api/maintenanceApi";

/* ================================================================== */
/*  HELPER COMPONENTS & BADGES                                        */
/* ================================================================== */

function StatusBadge({ status }) {
  const s = (status || "AVAILABLE").toUpperCase();
  if (s === "AVAILABLE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        AVAILABLE
      </span>
    );
  }
  if (s === "BOOKED" || s === "IN_USE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        BOOKED / IN USE
      </span>
    );
  }
  if (s === "UNDER_MAINTENANCE" || s === "MAINTENANCE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200/80 shadow-2xs">
        <span className="h-2 w-2 rounded-full bg-orange-500" />
        UNDER MAINTENANCE
      </span>
    );
  }
  if (s === "OUT_OF_SERVICE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
        <span className="h-2 w-2 rounded-full bg-rose-500" />
        OUT OF SERVICE
      </span>
    );
  }
  if (s === "RETIRED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-300 shadow-2xs">
        <span className="h-2 w-2 rounded-full bg-slate-400" />
        RETIRED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
      <span className="h-2 w-2 rounded-full bg-slate-400" />
      {s.replace(/_/g, " ")}
    </span>
  );
}

function CalibrationBadge({ status, nextDue }) {
  const s = (status || "NOT_RECORDED").toUpperCase();
  if (s === "VALID") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <ShieldCheck size={11} className="text-emerald-600" />
        CALIBRATION VALID
      </span>
    );
  }
  if (s === "EXPIRING_SOON" || s === "DUE_SOON" || s === "UPCOMING_EXPIRY") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle size={11} className="text-amber-600" />
        DUE SOON {nextDue ? `(${nextDue})` : ""}
      </span>
    );
  }
  if (s === "OVERDUE" || s === "EXPIRED") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertCircle size={11} className="text-rose-600" />
        CALIBRATION OVERDUE
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200">
      <ShieldCheck size={11} className="text-slate-400" />
      NOT RECORDED
    </span>
  );
}

function ConditionBadge({ condition }) {
  const c = (condition || "GOOD").toUpperCase();
  let colorClass = "bg-slate-50 text-slate-700 border-slate-200";
  if (c === "EXCELLENT") colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
  else if (c === "GOOD") colorClass = "bg-blue-50 text-blue-700 border-blue-200";
  else if (c === "FAIR") colorClass = "bg-amber-50 text-amber-700 border-amber-200";
  else if (c === "POOR" || c === "CRITICAL") colorClass = "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase border ${colorClass}`}>
      {c}
    </span>
  );
}

/* ================================================================== */
/*  IMAGE PLACEHOLDER COMPONENT                                       */
/* ================================================================== */

function EquipmentImagePlaceholder({ name, category }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/30 text-slate-400 p-4 select-none">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs border border-slate-200/80 mb-2">
        <Cpu size={24} className="text-slate-400" />
      </div>
      <p className="text-[11px] font-semibold text-slate-500 text-center line-clamp-1">{category || "Lab Asset"}</p>
      <p className="text-[10px] text-slate-400">No image available</p>
    </div>
  );
}

/* ================================================================== */
/*  MAIN COMPONENT: DepartmentEquipmentView                           */
/* ================================================================== */

export default function DepartmentEquipmentView({
  user,
  toast,
  departmentId: propDeptId,
  institutionId: propInstId,
  readOnly = false,
}) {
  const [equipmentList, setEquipmentList] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View presentation mode: 'grid' (default) or 'list'
  const [viewMode, setViewMode] = useState("grid");

  // Search and Multi-Dimensional Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLab, setSelectedLab] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedCalibration, setSelectedCalibration] = useState("ALL");

  // Modal / Drawer Active States
  const [detailsDrawerItem, setDetailsDrawerItem] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalItem, setEditModalItem] = useState(null);
  const [repairModalItem, setRepairModalItem] = useState(null);

  // Context resolution from User Principal
  const userDeptId = user?.departmentId || propDeptId;
  const userDeptName = user?.departmentName || user?.department || "Department";
  const userInstId = user?.institutionId || propInstId;
  const userInstName = user?.institutionName || user?.institution || "Institution";

  // 1. Fetch Department Laboratories for dynamic filtering & assignment
  useEffect(() => {
    let isMounted = true;
    async function loadLabs() {
      try {
        const labs = await equipmentApi.getLaboratories(userDeptId);
        if (isMounted) {
          setLaboratories(Array.isArray(labs) ? labs : []);
        }
      } catch (err) {
        console.error("Failed to load laboratories:", err);
      }
    }
    loadLabs();
    return () => {
      isMounted = false;
    };
  }, [userDeptId]);

  // 2. Fetch Department Equipment Catalog
  const loadEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (userInstId) params.institutionId = userInstId;
      if (userDeptId) params.departmentId = userDeptId;

      const data = await equipmentApi.search(params);
      const items = Array.isArray(data) ? data : (data?.content || []);
      setEquipmentList(items);
    } catch (err) {
      console.error("Failed to load department equipment:", err);
      setError(err.message || "Unable to load department equipment.");
      toast?.(err.message || "Failed to load equipment catalog.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, [userDeptId, userInstId]);

  // 3. Dynamic Categories extracted from live data
  const categoryOptions = useMemo(() => {
    const set = new Set();
    equipmentList.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return Array.from(set).sort();
  }, [equipmentList]);

  // Dynamic Laboratory Options
  const labOptions = useMemo(() => {
    if (laboratories.length > 0) return laboratories;
    const labMap = new Map();
    equipmentList.forEach((e) => {
      if (e.labId && e.labName) {
        labMap.set(e.labId, { id: e.labId, name: e.labName });
      }
    });
    return Array.from(labMap.values());
  }, [laboratories, equipmentList]);

  // 4. Live Operational KPI Computations
  const kpis = useMemo(() => {
    let total = equipmentList.length;
    let available = 0;
    let booked = 0;
    let maintenance = 0;
    let needsAttention = 0;

    equipmentList.forEach((e) => {
      const s = (e.status || "").toUpperCase();
      const cal = (e.calibrationStatus || "").toUpperCase();
      const cond = (e.condition || "").toUpperCase();

      if (s === "AVAILABLE") available++;
      if (s === "BOOKED" || s === "IN_USE") booked++;
      if (s === "UNDER_MAINTENANCE" || s === "MAINTENANCE") maintenance++;

      if (
        s === "OUT_OF_SERVICE" ||
        cal === "OVERDUE" ||
        cal === "EXPIRED" ||
        cond === "CRITICAL" ||
        cond === "POOR"
      ) {
        needsAttention++;
      }
    });

    return { total, available, booked, maintenance, needsAttention };
  }, [equipmentList]);

  // 5. Multi-dimensional Search & Filter Pipeline
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter((e) => {
      // Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const eqIdStr = `eq-${e.equipmentId || e.id}`.toLowerCase();
        const nameMatch = (e.name || "").toLowerCase().includes(q);
        const modelMatch = (e.model || "").toLowerCase().includes(q);
        const mfMatch = (e.manufacturer || "").toLowerCase().includes(q);
        const snMatch = (e.serialNumber || "").toLowerCase().includes(q);
        const idMatch = eqIdStr.includes(q) || String(e.equipmentId || e.id || "").includes(q);
        const locMatch = (e.location || "").toLowerCase().includes(q);
        if (!nameMatch && !modelMatch && !mfMatch && !snMatch && !idMatch && !locMatch) {
          return false;
        }
      }

      // Laboratory Filter
      if (selectedLab !== "ALL") {
        const eqLabId = e.labId != null ? String(e.labId) : "";
        if (eqLabId !== String(selectedLab)) return false;
      }

      // Category Filter
      if (selectedCategory !== "ALL") {
        if ((e.category || "").toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }

      // Status Filter
      if (selectedStatus !== "ALL") {
        const s = (e.status || "").toUpperCase();
        if (selectedStatus === "BOOKED" && s !== "BOOKED" && s !== "IN_USE") return false;
        if (selectedStatus === "UNDER_MAINTENANCE" && s !== "UNDER_MAINTENANCE" && s !== "MAINTENANCE") return false;
        if (selectedStatus !== "BOOKED" && selectedStatus !== "UNDER_MAINTENANCE" && s !== selectedStatus) return false;
      }

      // Calibration Status Filter
      if (selectedCalibration !== "ALL") {
        const cal = (e.calibrationStatus || "NOT_RECORDED").toUpperCase();
        if (selectedCalibration === "DUE_SOON") {
          if (cal !== "DUE_SOON" && cal !== "EXPIRING_SOON" && cal !== "UPCOMING_EXPIRY") return false;
        } else if (cal !== selectedCalibration) {
          return false;
        }
      }

      return true;
    });
  }, [equipmentList, searchQuery, selectedLab, selectedCategory, selectedStatus, selectedCalibration]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedLab !== "ALL" ||
    selectedCategory !== "ALL" ||
    selectedStatus !== "ALL" ||
    selectedCalibration !== "ALL";

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedLab("ALL");
    setSelectedCategory("ALL");
    setSelectedStatus("ALL");
    setSelectedCalibration("ALL");
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ============================================================ */}
      {/* 1. PAGE HEADER                                              */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div>
          {/* Breadcrumb badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80">
              <Building2 size={13} />
              {userInstName}
            </span>
            <span className="text-slate-300">/</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              <Layers size={13} />
              {userDeptName}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Department Equipment</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Manage inventory, monitor operational status, inspect equipment details, calibration records, and maintenance work orders.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* View Toggle */}
          <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 shadow-2xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={14} />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "list"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="List View"
            >
              <List size={14} />
              <span>List</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadEquipment}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2 flex items-center gap-2 transition-all shadow-2xs disabled:opacity-50"
            title="Refresh Equipment Catalog"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-blue-600" : "text-slate-500"} />
            <span>Refresh</span>
          </button>

          {/* Add Equipment Button */}
          {!readOnly && (
            <button
              onClick={() => setAddModalOpen(true)}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold px-4 py-2 flex items-center gap-2 transition-all shadow-sm shadow-blue-500/20"
              title="Register New Equipment"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Add Equipment</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. KPI AREA                                                 */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Assets */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-2xs transition-all hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">TOTAL EQUIPMENT</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Layers size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{kpis.total}</p>
          <p className="text-[11px] font-medium text-slate-400 mt-1">Cataloged in department</p>
        </div>

        {/* Available */}
        <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/20 p-4.5 shadow-2xs transition-all hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">AVAILABLE</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-700">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">{kpis.available}</p>
          <p className="text-[11px] font-medium text-emerald-600/80 mt-1">Ready for booking</p>
        </div>

        {/* Booked / In Use */}
        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/20 p-4.5 shadow-2xs transition-all hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-800">BOOKED / IN USE</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100/80 text-amber-700">
              <Clock size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-amber-700 tracking-tight">{kpis.booked}</p>
          <p className="text-[11px] font-medium text-amber-600/80 mt-1">Active physical sessions</p>
        </div>

        {/* Under Maintenance */}
        <div className="rounded-2xl border border-orange-200/90 bg-orange-50/20 p-4.5 shadow-2xs transition-all hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-orange-800">UNDER MAINTENANCE</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100/80 text-orange-700">
              <Wrench size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-orange-700 tracking-tight">{kpis.maintenance}</p>
          <p className="text-[11px] font-medium text-orange-600/80 mt-1">Under active repair</p>
        </div>

        {/* Needs Attention */}
        <div className="rounded-2xl border border-rose-200/90 bg-rose-50/20 p-4.5 shadow-2xs transition-all hover:shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-800">NEEDS ATTENTION</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100/80 text-rose-700">
              <AlertTriangle size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-rose-700 tracking-tight">{kpis.needsAttention}</p>
          <p className="text-[11px] font-medium text-rose-600/80 mt-1">Overdue / Out of service</p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. SEARCH & FILTER TOOLBAR                                  */}
      {/* ============================================================ */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Large Search Bar */}
          <div className="relative lg:col-span-1 sm:col-span-2">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search equipment, model, manufacturer, serial number..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-3.5 py-2 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>

          {/* Laboratory Dropdown */}
          <div className="relative">
            <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-7 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer transition-all appearance-none"
            >
              <option value="ALL">All Laboratories ({labOptions.length})</option>
              {labOptions.map((lab) => {
                const id = lab.labId || lab.laboratoryId || lab.id;
                return (
                  <option key={id} value={id}>
                    {lab.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-7 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer transition-all appearance-none"
            >
              <option value="ALL">All Categories ({categoryOptions.length})</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <Activity size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-7 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer transition-all appearance-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="BOOKED">BOOKED / IN USE</option>
              <option value="UNDER_MAINTENANCE">UNDER MAINTENANCE</option>
              <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
              <option value="RETIRED">RETIRED</option>
            </select>
          </div>

          {/* Calibration Dropdown */}
          <div className="relative">
            <ShieldCheck size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedCalibration}
              onChange={(e) => setSelectedCalibration(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-7 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer transition-all appearance-none"
            >
              <option value="ALL">All Calibration</option>
              <option value="VALID">VALID</option>
              <option value="DUE_SOON">DUE SOON / EXPIRING</option>
              <option value="OVERDUE">OVERDUE</option>
              <option value="NOT_RECORDED">NOT RECORDED</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Clear Action */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
          <p className="text-slate-500 font-medium">
            Showing <strong className="text-slate-900 font-bold">{filteredEquipment.length}</strong> of{" "}
            <strong className="text-slate-900 font-bold">{equipmentList.length}</strong> equipment records
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <X size={12} /> Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. MAIN EQUIPMENT PRESENTATION                              */}
      {/* ============================================================ */}

      {loading ? (
        /* SKELETON LOADING STATE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 animate-pulse">
              <div className="h-44 bg-slate-100 rounded-xl w-full" />
              <div className="h-5 bg-slate-100 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-5/6" />
              </div>
              <div className="h-9 bg-slate-100 rounded-xl w-full pt-2" />
            </div>
          ))}
        </div>
      ) : error ? (
        /* ERROR STATE */
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-base font-bold text-rose-900">Unable to load department equipment</h3>
          <p className="text-xs text-rose-700 max-w-md mx-auto">{error}</p>
          <button
            onClick={loadEquipment}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 transition-all shadow-xs"
          >
            Retry
          </button>
        </div>
      ) : filteredEquipment.length === 0 ? (
        /* EMPTY STATE */
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Layers size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {hasActiveFilters ? "No equipment matches your current filters" : "No equipment found"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {hasActiveFilters
              ? "Try adjusting or clearing your search and filter criteria to see all cataloged assets."
              : `No equipment items are currently cataloged under ${userDeptName}.`}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={handleClearFilters}
              className="rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-4 py-2 transition-all"
            >
              Clear Filters
            </button>
          ) : (
            !readOnly && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 transition-all shadow-xs"
              >
                + Add Equipment
              </button>
            )
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* ---------------------------------------------------------- */
        /* PRIMARY VIEW: RESPONSIVE EQUIPMENT CARD GRID              */
        /* ---------------------------------------------------------- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((e) => {
            const eqId = e.equipmentId || e.id;
            const cap = e.capacityPerSlot || 1;
            const cond = (e.condition || "GOOD").toUpperCase();
            const calStatus = (e.calibrationStatus || "NOT_RECORDED").toUpperCase();

            return (
              <div
                key={eqId}
                className="group rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Card Image Area */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                    {e.imageSecureUrl ? (
                      <img
                        src={e.imageSecureUrl}
                        alt={e.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(err) => {
                          err.currentTarget.style.display = "none";
                          err.currentTarget.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div className={`${e.imageSecureUrl ? "hidden" : "block"} w-full h-full`}>
                      <EquipmentImagePlaceholder name={e.name} category={e.category} />
                    </div>

                    {/* Status Badge Overlay */}
                    <div className="absolute top-3 left-3">
                      <StatusBadge status={e.status} />
                    </div>

                    {/* Shareable Badge */}
                    {e.isShareable ? (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600/90 text-white backdrop-blur-xs shadow-xs">
                          Sharing Enabled
                        </span>
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-600/90 text-white backdrop-blur-xs shadow-xs">
                          Sharing Disabled
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    {/* Title & Equipment ID */}
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {e.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Equipment ID: EQ-{eqId}
                        </span>
                        {e.serialNumber && (
                          <span className="text-[11px] font-medium text-slate-400 truncate max-w-[140px]" title={`Serial: ${e.serialNumber}`}>
                            SN: {e.serialNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Compact Metadata Grid */}
                    <div className="grid grid-cols-2 gap-2.5 text-xs pt-1 border-t border-slate-100">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</p>
                        <p className="font-semibold text-slate-800 truncate" title={e.category || "General"}>
                          {e.category || "General"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Laboratory</p>
                        <p className="font-semibold text-slate-800 truncate" title={e.labName || "Unassigned"}>
                          {e.labName || "Unassigned"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</p>
                        <p className="font-semibold text-slate-800 truncate" title={e.location || "Not specified"}>
                          {e.location || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Condition</p>
                        <div className="mt-0.5">
                          <ConditionBadge condition={cond} />
                        </div>
                      </div>
                    </div>

                    {/* Capacity per Slot & Calibration Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Capacity per Slot</p>
                        <p className="font-bold text-slate-900" title="Maximum concurrent users permitted for a booking slot">
                          {cap} {cap === 1 ? "user" : "users"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Calibration</p>
                        <CalibrationBadge status={calStatus} nextDue={e.nextCalibrationDue} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setDetailsDrawerItem(e)}
                    className="flex-1 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-800 hover:text-blue-700 text-xs font-bold py-2 px-3 transition-all inline-flex items-center justify-center gap-1.5 shadow-2xs"
                    title="View Full Specifications & Operation Details"
                  >
                    <Eye size={13} className="text-blue-600" />
                    <span>View Details</span>
                  </button>

                  {!readOnly && (
                    <button
                      onClick={() => setEditModalItem(e)}
                      className="rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold py-2 px-3 transition-all inline-flex items-center justify-center gap-1 shadow-2xs"
                      title="Edit Equipment Properties"
                    >
                      <Pencil size={13} />
                      <span>Edit</span>
                    </button>
                  )}

                  {!readOnly && (
                    <button
                      onClick={() => setRepairModalItem(e)}
                      className="rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-800 text-xs font-bold py-2 px-3 transition-all inline-flex items-center justify-center gap-1 shadow-2xs"
                      title="Log Maintenance Work Order"
                    >
                      <Wrench size={13} />
                      <span>Repair</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ---------------------------------------------------------- */
        /* OPTIONAL COMPACT LIST VIEW (TABLE)                        */
        /* ---------------------------------------------------------- */
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Equipment & ID</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Laboratory & Location</th>
                  <th className="px-4 py-3.5">Condition & Capacity</th>
                  <th className="px-4 py-3.5">Calibration</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEquipment.map((e) => {
                  const eqId = e.equipmentId || e.id;
                  const cap = e.capacityPerSlot || 1;
                  const cond = (e.condition || "GOOD").toUpperCase();
                  const calStatus = (e.calibrationStatus || "NOT_RECORDED").toUpperCase();

                  return (
                    <tr key={eqId} className="hover:bg-blue-50/30 transition-colors">
                      {/* 1. Equipment & ID */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                            {e.imageSecureUrl ? (
                              <img src={e.imageSecureUrl} alt={e.name} className="h-full w-full object-cover" />
                            ) : (
                              <Cpu size={18} className="text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{e.name}</p>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                              <span className="font-semibold text-slate-600">Equipment ID: EQ-{eqId}</span>
                              {e.serialNumber && <span>• SN: {e.serialNumber}</span>}
                              {e.isShareable && (
                                <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">
                                  Shareable
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Category */}
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                          {e.category || "General"}
                        </span>
                      </td>

                      {/* 3. Laboratory & Location */}
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-800">{e.labName || "Unassigned"}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-slate-400" />
                          {e.location || "Not specified"}
                        </p>
                      </td>

                      {/* 4. Condition & Capacity */}
                      <td className="px-4 py-4 space-y-1">
                        <div>
                          <ConditionBadge condition={cond} />
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium">
                          Capacity per Slot: <strong className="text-slate-900 font-bold">{cap} user(s)</strong>
                        </p>
                      </td>

                      {/* 5. Calibration */}
                      <td className="px-4 py-4">
                        <CalibrationBadge status={calStatus} nextDue={e.nextCalibrationDue} />
                      </td>

                      {/* 6. Status */}
                      <td className="px-4 py-4">
                        <StatusBadge status={e.status} />
                      </td>

                      {/* 7. Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDetailsDrawerItem(e)}
                            className="rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1.5 transition-colors inline-flex items-center gap-1 shadow-2xs"
                          >
                            <Eye size={12} className="text-blue-600" /> Details
                          </button>
                          {!readOnly && (
                            <button
                              onClick={() => setEditModalItem(e)}
                              className="rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1.5 transition-colors inline-flex items-center gap-1"
                            >
                              <Pencil size={12} /> Edit
                            </button>
                          )}
                          {!readOnly && (
                            <button
                              onClick={() => setRepairModalItem(e)}
                              className="rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1.5 transition-colors inline-flex items-center gap-1"
                            >
                              <Wrench size={12} /> Repair
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. VIEW DETAILS — PROFESSIONAL RIGHT-SIDE DRAWER             */}
      {/* ============================================================ */}
      {detailsDrawerItem && (
        <EquipmentDetailsDrawer
          item={detailsDrawerItem}
          userDeptName={userDeptName}
          userInstName={userInstName}
          onClose={() => setDetailsDrawerItem(null)}
          onEdit={() => {
            const current = detailsDrawerItem;
            setDetailsDrawerItem(null);
            setEditModalItem(current);
          }}
          onRepair={() => {
            const current = detailsDrawerItem;
            setDetailsDrawerItem(null);
            setRepairModalItem(current);
          }}
          readOnly={readOnly}
        />
      )}

      {/* ============================================================ */}
      {/* 6. ADD EQUIPMENT MODAL                                      */}
      {/* ============================================================ */}
      {addModalOpen && (
        <EquipmentAddModal
          userDeptId={userDeptId}
          userDeptName={userDeptName}
          userInstId={userInstId}
          laboratories={laboratories}
          onClose={() => setAddModalOpen(false)}
          onSuccess={() => {
            setAddModalOpen(false);
            loadEquipment();
            toast?.("Equipment successfully cataloged.", "success");
          }}
          toast={toast}
        />
      )}

      {/* ============================================================ */}
      {/* 7. EDIT EQUIPMENT MODAL                                     */}
      {/* ============================================================ */}
      {editModalItem && (
        <EquipmentEditModal
          item={editModalItem}
          userDeptId={userDeptId}
          userInstId={userInstId}
          laboratories={laboratories}
          onClose={() => setEditModalItem(null)}
          onSuccess={() => {
            setEditModalItem(null);
            loadEquipment();
            toast?.("Equipment properties updated successfully.", "success");
          }}
          toast={toast}
        />
      )}

      {/* ============================================================ */}
      {/* 8. REPORT ISSUE / REPAIR MODAL                               */}
      {/* ============================================================ */}
      {repairModalItem && (
        <EquipmentRepairModal
          item={repairModalItem}
          onClose={() => setRepairModalItem(null)}
          onSuccess={() => {
            setRepairModalItem(null);
            loadEquipment();
            toast?.("Maintenance work order submitted successfully.", "success");
          }}
          toast={toast}
        />
      )}
    </div>
  );
}

/* ================================================================== */
/*  EQUIPMENT DETAILS DRAWER (FULL OPERATIONAL INSPECTION)            */
/* ================================================================== */

function EquipmentDetailsDrawer({
  item,
  userDeptName,
  userInstName,
  onClose,
  onEdit,
  onRepair,
  readOnly,
}) {
  const eqId = item.equipmentId || item.id;
  const [activeTab, setActiveTab] = useState("overview"); // overview, calibrations, maintenance, documents
  const [calibrations, setCalibrations] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loadingCal, setLoadingCal] = useState(false);
  const [loadingMaint, setLoadingMaint] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Parse specifications JSON
  const parsedSpecs = useMemo(() => {
    if (!item.specifications) return null;
    if (typeof item.specifications === "object") return item.specifications;
    try {
      return JSON.parse(item.specifications);
    } catch {
      return { Specifications: String(item.specifications) };
    }
  }, [item.specifications]);

  // Load Calibrations when calibration tab selected
  useEffect(() => {
    if (activeTab === "calibrations" && eqId) {
      setLoadingCal(true);
      equipmentApi
        .getCalibrations(eqId)
        .then((res) => setCalibrations(Array.isArray(res) ? res : []))
        .catch((err) => console.error("Failed to load calibrations:", err))
        .finally(() => setLoadingCal(false));
    }
  }, [activeTab, eqId]);

  // Load Maintenance Records when maintenance tab selected
  useEffect(() => {
    if (activeTab === "maintenance" && eqId) {
      setLoadingMaint(true);
      (maintenanceApi.getEquipmentHistory ? maintenanceApi.getEquipmentHistory(eqId) : maintenanceApi.getHistory(eqId))
        .then((res) => setMaintenanceRecords(Array.isArray(res) ? res : []))
        .catch((err) => {
          console.error("Failed to load maintenance records:", err);
          setMaintenanceRecords([]);
        })
        .finally(() => setLoadingMaint(false));
    }
  }, [activeTab, eqId]);

  // Load Documents when documents tab selected
  useEffect(() => {
    if (activeTab === "documents" && eqId) {
      setLoadingDocs(true);
      equipmentApi
        .getDocuments(eqId)
        .then((res) => setDocuments(Array.isArray(res) ? res : []))
        .catch((err) => console.error("Failed to load documents:", err))
        .finally(() => setLoadingDocs(false));
    }
  }, [activeTab, eqId]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span>{userInstName}</span>
              <span>›</span>
              <span>{userDeptName}</span>
              <span>›</span>
              <span className="text-slate-900 font-bold truncate max-w-[200px]">{item.name}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex gap-4 items-start">
            <div className="h-20 w-20 shrink-0 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs">
              {item.imageSecureUrl ? (
                <img src={item.imageSecureUrl} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-400">
                  <Cpu size={32} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-slate-900 truncate">{item.name}</h2>
                <StatusBadge status={item.status} />
              </div>

              <p className="text-xs text-slate-500 mt-0.5">
                <span className="font-bold text-slate-700">Equipment ID: EQ-{eqId}</span>
                {item.manufacturer && ` • ${item.manufacturer}`}
                {item.model && ` • Model: ${item.model}`}
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                <span className="inline-flex items-center gap-1">
                  <Tag size={12} className="text-slate-400" />
                  {item.category || "General"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400" />
                  {item.labName || "Laboratory"} {item.location ? `(${item.location})` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Drawer Actions */}
          {!readOnly && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200/80">
              <button
                onClick={onEdit}
                className="flex-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-3 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Pencil size={13} />
                <span>Edit Equipment</span>
              </button>
              <button
                onClick={onRepair}
                className="flex-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold py-2 px-3 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Wrench size={13} />
                <span>Log Issue / Repair</span>
              </button>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 mt-4 -mb-6">
            {[
              { id: "overview", label: "Overview & Specs" },
              { id: "calibrations", label: "Calibration Records" },
              { id: "maintenance", label: "Maintenance Work Orders" },
              { id: "documents", label: "Manuals & Docs" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* TAB 1: OVERVIEW & SPECS */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Information Grid */}
              <div className="space-y-3">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Asset & Operational Overview</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Serial Number</p>
                    <p className="font-bold text-slate-900 mt-0.5">{item.serialNumber || "Not provided"}</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Model Number</p>
                    <p className="font-bold text-slate-900 mt-0.5">{item.model || "Not provided"}</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Equipment ID</p>
                    <p className="font-bold text-blue-600 mt-0.5">EQ-{eqId}</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Condition</p>
                    <div className="mt-0.5">
                      <ConditionBadge condition={item.condition} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase" title="Maximum concurrent users permitted for a booking slot">
                      Capacity per Slot
                    </p>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {item.capacityPerSlot || 1} concurrent user(s)
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Inter-Institution Sharing</p>
                    <p className="font-bold text-slate-900 mt-0.5">{item.isShareable ? "SHARING ENABLED" : "SHARING DISABLED"}</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Internal Hourly Rate</p>
                    <p className="font-bold text-emerald-700 mt-0.5">₹{item.hourlyRate || 0}/hr</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">External Hourly Rate</p>
                    <p className="font-bold text-emerald-700 mt-0.5">₹{item.externalHourlyRate || 0}/hr</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Purchase Cost</p>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {item.purchaseCost ? `₹${Number(item.purchaseCost).toLocaleString()}` : "Not provided"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 col-span-2 sm:col-span-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Purchase Date</p>
                    <p className="font-bold text-slate-900 mt-0.5">{item.purchaseDate || "Not provided"}</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 col-span-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Laboratory & Location</p>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {item.labName || "Unassigned"} — {item.location || "Room / Bench Not Specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Technical Specifications</p>
                {parsedSpecs && typeof parsedSpecs === "object" && Object.keys(parsedSpecs).length > 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 divide-y divide-slate-100 overflow-hidden">
                    {Object.entries(parsedSpecs).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between p-3 text-xs">
                        <span className="font-bold text-slate-600 uppercase text-[10px] tracking-wide">{key}</span>
                        <span className="font-semibold text-slate-900 text-right">
                          {typeof val === "object" ? JSON.stringify(val) : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-200">
                    No specifications recorded.
                  </p>
                )}
              </div>

              {/* Description & Operating Notes */}
              {item.description && (
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Description & Operating Notes</p>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {item.description}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CALIBRATION RECORDS */}
          {activeTab === "calibrations" && (
            <div className="space-y-4">
              {/* Calibration Overview Banner */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Calibration Requirement</p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {item.calibrationRequired ? `Required every ${item.calibrationIntervalMonths || 12} months` : "Periodic calibration not required"}
                  </p>
                </div>
                <div>
                  <CalibrationBadge status={item.calibrationStatus} nextDue={item.nextCalibrationDue} />
                </div>
              </div>

              {loadingCal ? (
                <div className="py-8 text-center text-slate-400 font-semibold">Loading calibration records…</div>
              ) : calibrations.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-2">
                  <ShieldCheck size={32} className="mx-auto text-slate-300" />
                  <p className="font-bold text-slate-700">No calibration records available</p>
                  <p className="text-slate-400 text-xs">This equipment has no recorded calibration history in the database.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {calibrations.map((cal) => (
                    <div key={cal.calibrationId || cal.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Calibration on {cal.calibrationDate}</span>
                        <span className="text-[11px] font-semibold text-slate-500">Due: {cal.nextDueDate}</span>
                      </div>
                      {cal.performedBy && (
                        <p className="text-xs text-slate-600">
                          <strong>Performed by:</strong> {cal.performedBy}
                        </p>
                      )}
                      {cal.notes && (
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {cal.notes}
                        </p>
                      )}
                      {cal.certificateSecureUrl && (
                        <a
                          href={cal.certificateSecureUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 pt-1"
                        >
                          <ExternalLink size={12} /> View Certificate ({cal.certificateFileName || "Document"})
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MAINTENANCE WORK ORDERS */}
          {activeTab === "maintenance" && (
            <div className="space-y-4">
              {loadingMaint ? (
                <div className="py-8 text-center text-slate-400 font-semibold">Loading maintenance history…</div>
              ) : maintenanceRecords.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-2">
                  <Wrench size={32} className="mx-auto text-slate-300" />
                  <p className="font-bold text-slate-700">No maintenance records available</p>
                  <p className="text-slate-400 text-xs">This equipment currently has no logged work orders or fault records.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {maintenanceRecords.map((m) => {
                    const mId = m.recordId || m.maintenanceRecordId || m.id;
                    return (
                      <div key={mId} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">Work Order #{mId}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                            {m.status || "COMPLETED"}
                          </span>
                        </div>
                        {m.description && <p className="text-xs text-slate-700 font-medium">{m.description}</p>}
                        {m.workPerformed && (
                          <p className="text-xs text-slate-600">
                            <strong>Work Performed:</strong> {m.workPerformed}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                          <span>Priority: {m.priority || "MEDIUM"}</span>
                          {m.partsUsed && <span>Parts: {m.partsUsed}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MANUALS & DOCS */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              {loadingDocs ? (
                <div className="py-8 text-center text-slate-400 font-semibold">Loading documents…</div>
              ) : documents.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-2">
                  <FileText size={32} className="mx-auto text-slate-300" />
                  <p className="font-bold text-slate-700">No documents available</p>
                  <p className="text-slate-400 text-xs">No technical manuals or safety sheets have been uploaded for this equipment.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.documentId || doc.id}
                      className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText size={18} className="text-blue-600 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">{doc.documentName || "Equipment Document"}</p>
                          <p className="text-[10px] text-slate-400 uppercase">{doc.documentType || "MANUAL"}</p>
                        </div>
                      </div>
                      {doc.documentSecureUrl && (
                        <a
                          href={doc.documentSecureUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-3 py-1.5 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink size={12} /> View
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">Database Record: EQ-{eqId}</span>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold px-4 py-2 text-xs transition-colors shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  ADD EQUIPMENT MODAL (7 CLEAR SECTIONS & STRICT VALIDATION)         */
/* ================================================================== */

function EquipmentAddModal({
  userDeptId,
  userDeptName,
  userInstId,
  laboratories,
  onClose,
  onSuccess,
  toast,
}) {
  const [form, setForm] = useState({
    name: "",
    category: "Computing & AI",
    serialNumber: "",
    manufacturer: "",
    model: "",
    description: "",
    labId: laboratories.length > 0 ? (laboratories[0].labId || laboratories[0].laboratoryId || laboratories[0].id) : "",
    location: "",
    status: "AVAILABLE",
    capacityPerSlot: 1,
    condition: "EXCELLENT",
    isShareable: false,
    purchaseCost: "",
    purchaseDate: "",
    hourlyRate: 0,
    externalHourlyRate: 0,
    calibrationRequired: false,
    calibrationIntervalMonths: 12,
  });

  // Dynamic Key-Value specifications builder
  const [specRows, setSpecRows] = useState([{ key: "", val: "" }]);
  // Selected Image File & Local Preview URL
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSpecAdd = () => setSpecRows([...specRows, { key: "", val: "" }]);
  const handleSpecRemove = (idx) => setSpecRows(specRows.filter((_, i) => i !== idx));
  const handleSpecChange = (idx, field, val) => {
    const updated = [...specRows];
    updated[idx][field] = val;
    setSpecRows(updated);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    // Strict Validation
    if (!form.name.trim()) errs.name = "Equipment name is required.";
    if (!form.category.trim()) errs.category = "Category is required.";
    if (!form.serialNumber.trim()) errs.serialNumber = "Serial number is required. Do not leave blank.";
    if (!form.labId) errs.labId = "Laboratory assignment is required.";
    if (!form.location.trim()) errs.location = "Location (Room / Bench) is required.";
    if (!form.capacityPerSlot || Number(form.capacityPerSlot) < 1) errs.capacityPerSlot = "Capacity per slot must be at least 1.";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      setSaving(true);

      // Serialize dynamic specifications into valid JSON string
      const specObj = {};
      specRows.forEach((r) => {
        if (r.key.trim()) {
          specObj[r.key.trim()] = r.val.trim();
        }
      });
      const specJson = Object.keys(specObj).length > 0 ? JSON.stringify(specObj) : null;

      const dto = {
        name: form.name.trim(),
        category: form.category.trim(),
        serialNumber: form.serialNumber.trim(),
        manufacturer: form.manufacturer.trim() || null,
        model: form.model.trim() || null,
        description: form.description.trim() || null,
        labId: Number(form.labId),
        location: form.location.trim(),
        status: form.status || "AVAILABLE",
        capacityPerSlot: Number(form.capacityPerSlot) || 1,
        condition: form.condition || "EXCELLENT",
        isShareable: Boolean(form.isShareable),
        purchaseCost: form.purchaseCost ? Number(form.purchaseCost) : null,
        purchaseDate: form.purchaseDate || null,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : 0,
        externalHourlyRate: form.externalHourlyRate ? Number(form.externalHourlyRate) : 0,
        calibrationRequired: Boolean(form.calibrationRequired),
        calibrationIntervalMonths: Number(form.calibrationIntervalMonths) || 12,
        specifications: specJson,
        departmentId: userDeptId,
        institutionId: userInstId,
      };

      // 1. Create equipment
      const created = await equipmentApi.create(dto);
      const createdId = created.equipmentId || created.id;

      // 2. If image attached, upload via dedicated multipart endpoint
      if (imageFile && createdId) {
        try {
          const fd = new FormData();
          fd.append("file", imageFile);
          await equipmentApi.uploadImage(createdId, fd);
        } catch (imgErr) {
          console.error("Equipment created but image upload failed:", imgErr);
        }
      }

      onSuccess();
    } catch (err) {
      console.error("Failed to create equipment:", err);
      toast?.(err.message || "Failed to create equipment.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">Add New Equipment</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Register asset under <span className="font-bold text-slate-700">{userDeptName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* SECTION 1 — BASIC INFORMATION */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>1. Basic Information</span>
            </h3>

            <div className="grid sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Equipment Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. High Performance GPU Cluster Node"
                  className={`w-full rounded-xl border ${
                    errors.name ? "border-rose-300 ring-1 ring-rose-500" : "border-slate-200"
                  } p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                />
                {errors.name && <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Computing, Analytical, Testing"
                  className={`w-full rounded-xl border ${
                    errors.category ? "border-rose-300 ring-1 ring-rose-500" : "border-slate-200"
                  } p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                />
                {errors.category && <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.category}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Serial Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.serialNumber}
                  onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                  placeholder="e.g. SN-9940128"
                  className={`w-full rounded-xl border ${
                    errors.serialNumber ? "border-rose-300 ring-1 ring-rose-500" : "border-slate-200"
                  } p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                />
                {errors.serialNumber && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.serialNumber}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Manufacturer</label>
                <input
                  type="text"
                  value={form.manufacturer}
                  onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                  placeholder="e.g. NVIDIA / Dell / Agilent"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Model</label>
                <input
                  type="text"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  placeholder="e.g. DGX A100 / PowerEdge"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Operational purpose, usage instructions, or handling requirements..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* SECTION 2 — LABORATORY & LOCATION */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              2. Laboratory & Location
            </h3>

            <div className="grid sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assigned Laboratory <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.labId}
                  onChange={(e) => setForm({ ...form, labId: e.target.value })}
                  className={`w-full rounded-xl border ${
                    errors.labId ? "border-rose-300 ring-1 ring-rose-500" : "border-slate-200"
                  } p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer bg-white`}
                >
                  <option value="">Select Laboratory</option>
                  {laboratories.map((lab) => {
                    const id = lab.labId || lab.laboratoryId || lab.id;
                    return (
                      <option key={id} value={id}>
                        {lab.name}
                      </option>
                    );
                  })}
                </select>
                {errors.labId && <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.labId}</p>}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Location (Room / Bench) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Room 305, Rack 04, Bench B"
                  className={`w-full rounded-xl border ${
                    errors.location ? "border-rose-300 ring-1 ring-rose-500" : "border-slate-200"
                  } p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                />
                {errors.location && <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.location}</p>}
              </div>
            </div>
          </div>

          {/* SECTION 3 — OPERATIONAL INFORMATION */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              3. Operational Information
            </h3>

            <div className="grid sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1" title="Maximum concurrent users permitted for a booking slot">
                  Capacity per Slot <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.capacityPerSlot}
                  onChange={(e) => setForm({ ...form, capacityPerSlot: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Concurrent users per slot</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Condition</label>
                <select
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="EXCELLENT">EXCELLENT</option>
                  <option value="GOOD">GOOD</option>
                  <option value="FAIR">FAIR</option>
                  <option value="POOR">POOR</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
                  <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="add-shareable"
                checked={form.isShareable}
                onChange={(e) => setForm({ ...form, isShareable: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="add-shareable" className="font-bold text-slate-700 cursor-pointer">
                Make equipment available for inter-institution sharing
              </label>
            </div>
          </div>

          {/* SECTION 4 — FINANCIAL INFORMATION */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              4. Financial Information
            </h3>

            <div className="grid sm:grid-cols-4 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Hourly Rate (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={form.hourlyRate}
                  onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">External Hourly Rate (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={form.externalHourlyRate}
                  onChange={(e) => setForm({ ...form, externalHourlyRate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Purchase Cost (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={form.purchaseCost}
                  onChange={(e) => setForm({ ...form, purchaseCost: e.target.value })}
                  placeholder="e.g. 750000"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5 — CALIBRATION CONFIGURATION */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              5. Calibration Configuration
            </h3>

            <div className="grid sm:grid-cols-2 gap-3.5">
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="add-cal-req"
                  checked={form.calibrationRequired}
                  onChange={(e) => setForm({ ...form, calibrationRequired: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="add-cal-req" className="font-bold text-slate-700 cursor-pointer">
                  Periodic Calibration Required
                </label>
              </div>

              {form.calibrationRequired && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Calibration Interval (Months)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={form.calibrationIntervalMonths}
                    onChange={(e) => setForm({ ...form, calibrationIntervalMonths: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* SECTION 6 — TECHNICAL SPECIFICATIONS (KEY/VALUE BUILDER) */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                6. Technical Specifications
              </h3>
              <button
                type="button"
                onClick={handleSpecAdd}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
              >
                <Plus size={13} /> Add Specification Row
              </button>
            </div>

            <div className="space-y-2">
              {specRows.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={row.key}
                    onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                    placeholder="Property (e.g. Processor, RAM, Frequency)"
                    className="w-1/2 rounded-xl border border-slate-200 p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={row.val}
                    onChange={(e) => handleSpecChange(idx, "val", e.target.value)}
                    placeholder="Value (e.g. Apple M2 Max, 32 GB, 10Hz-13.6GHz)"
                    className="w-1/2 rounded-xl border border-slate-200 p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {specRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleSpecRemove(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 7 — EQUIPMENT IMAGE */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              7. Equipment Image
            </h3>

            <div className="flex items-center gap-4">
              <label className="flex flex-col items-center justify-center h-28 w-40 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all">
                <Upload size={20} className="text-slate-400 mb-1" />
                <span className="text-[11px] font-bold text-slate-600">Select Image File</span>
                <span className="text-[9px] text-slate-400">PNG, JPG, WebP</span>
                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </label>

              {imagePreview && (
                <div className="relative h-28 w-40 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-1 right-1 p-1 bg-slate-900/70 text-white rounded-full hover:bg-rose-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-5 py-2.5 font-bold text-slate-700 transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 font-bold transition-all text-xs shadow-sm shadow-blue-500/20 disabled:opacity-50"
            >
              {saving ? "Creating Asset…" : "Create Equipment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  EDIT EQUIPMENT MODAL                                              */
/* ================================================================== */

function EquipmentEditModal({
  item,
  userDeptId,
  userInstId,
  laboratories,
  onClose,
  onSuccess,
  toast,
}) {
  const eqId = item.equipmentId || item.id;

  const [form, setForm] = useState({
    name: item.name || "",
    category: item.category || "",
    serialNumber: item.serialNumber || "",
    manufacturer: item.manufacturer || "",
    model: item.model || "",
    description: item.description || "",
    labId: item.labId || (laboratories.length > 0 ? (laboratories[0].labId || laboratories[0].laboratoryId || laboratories[0].id) : ""),
    location: item.location || "",
    status: item.status || "AVAILABLE",
    capacityPerSlot: item.capacityPerSlot || 1,
    condition: item.condition || "GOOD",
    isShareable: Boolean(item.isShareable),
    purchaseCost: item.purchaseCost != null ? item.purchaseCost : "",
    purchaseDate: item.purchaseDate || "",
    hourlyRate: item.hourlyRate != null ? item.hourlyRate : 0,
    externalHourlyRate: item.externalHourlyRate != null ? item.externalHourlyRate : 0,
    calibrationRequired: item.calibrationRequired != null ? Boolean(item.calibrationRequired) : false,
    calibrationIntervalMonths: item.calibrationIntervalMonths || 12,
  });

  // Extract initial spec rows
  const [specRows, setSpecRows] = useState(() => {
    if (!item.specifications) return [{ key: "", val: "" }];
    try {
      const obj = typeof item.specifications === "object" ? item.specifications : JSON.parse(item.specifications);
      const entries = Object.entries(obj).map(([key, val]) => ({ key, val: String(val) }));
      return entries.length > 0 ? entries : [{ key: "", val: "" }];
    } catch {
      return [{ key: "Specifications", val: String(item.specifications) }];
    }
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(item.imageSecureUrl || null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSpecAdd = () => setSpecRows([...specRows, { key: "", val: "" }]);
  const handleSpecRemove = (idx) => setSpecRows(specRows.filter((_, i) => i !== idx));
  const handleSpecChange = (idx, field, val) => {
    const updated = [...specRows];
    updated[idx][field] = val;
    setSpecRows(updated);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!form.name.trim()) errs.name = "Equipment name is required.";
    if (!form.category.trim()) errs.category = "Category is required.";
    if (!form.serialNumber.trim()) errs.serialNumber = "Serial number is required.";
    if (!form.location.trim()) errs.location = "Location is required.";
    if (!form.capacityPerSlot || Number(form.capacityPerSlot) < 1) errs.capacityPerSlot = "Capacity must be at least 1.";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      setSaving(true);

      const specObj = {};
      specRows.forEach((r) => {
        if (r.key.trim()) {
          specObj[r.key.trim()] = r.val.trim();
        }
      });
      const specJson = Object.keys(specObj).length > 0 ? JSON.stringify(specObj) : null;

      const dto = {
        name: form.name.trim(),
        category: form.category.trim(),
        serialNumber: form.serialNumber.trim(),
        manufacturer: form.manufacturer.trim() || null,
        model: form.model.trim() || null,
        description: form.description.trim() || null,
        labId: form.labId ? Number(form.labId) : null,
        location: form.location.trim(),
        status: form.status,
        capacityPerSlot: Number(form.capacityPerSlot) || 1,
        condition: form.condition,
        isShareable: Boolean(form.isShareable),
        purchaseCost: form.purchaseCost ? Number(form.purchaseCost) : null,
        purchaseDate: form.purchaseDate || null,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : 0,
        externalHourlyRate: form.externalHourlyRate ? Number(form.externalHourlyRate) : 0,
        calibrationRequired: Boolean(form.calibrationRequired),
        calibrationIntervalMonths: Number(form.calibrationIntervalMonths) || 12,
        specifications: specJson,
        departmentId: userDeptId || item.departmentId,
        institutionId: userInstId || item.institutionId,
      };

      await equipmentApi.update(eqId, dto);

      if (imageFile) {
        try {
          const fd = new FormData();
          fd.append("file", imageFile);
          await equipmentApi.uploadImage(eqId, fd);
        } catch (imgErr) {
          console.error("Equipment updated but image upload failed:", imgErr);
        }
      }

      onSuccess();
    } catch (err) {
      console.error("Failed to update equipment:", err);
      toast?.(err.message || "Failed to update equipment.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        <div className="p-6 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">Edit Equipment (EQ-{eqId})</h2>
            <p className="text-xs text-slate-500 mt-0.5">Modify properties and operational parameters</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Section 1: Basic */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">1. Basic Information</h3>
            <div className="grid sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Equipment Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category *</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Serial Number *</label>
                <input
                  type="text"
                  value={form.serialNumber}
                  onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Manufacturer</label>
                <input
                  type="text"
                  value={form.manufacturer}
                  onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Model</label>
                <input
                  type="text"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Laboratory & Location */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">2. Laboratory & Location</h3>
            <div className="grid sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Laboratory</label>
                <select
                  value={form.labId}
                  onChange={(e) => setForm({ ...form, labId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="">Select Laboratory</option>
                  {laboratories.map((lab) => {
                    const id = lab.labId || lab.laboratoryId || lab.id;
                    return (
                      <option key={id} value={id}>
                        {lab.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location (Room / Bench) *</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Operational */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">3. Operational Configuration</h3>
            <div className="grid sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Capacity per Slot *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.capacityPerSlot}
                  onChange={(e) => setForm({ ...form, capacityPerSlot: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Condition</label>
                <select
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="EXCELLENT">EXCELLENT</option>
                  <option value="GOOD">GOOD</option>
                  <option value="FAIR">FAIR</option>
                  <option value="POOR">POOR</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Operational Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="BOOKED">BOOKED / IN USE</option>
                  <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
                  <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                  <option value="RETIRED">RETIRED</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="edit-shareable"
                checked={form.isShareable}
                onChange={(e) => setForm({ ...form, isShareable: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="edit-shareable" className="font-bold text-slate-700 cursor-pointer">
                Make equipment available for inter-institution sharing
              </label>
            </div>
          </div>

          {/* Section 4: Financial */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">4. Financial Information</h3>
            <div className="grid sm:grid-cols-4 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Hourly Rate (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={form.hourlyRate}
                  onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">External Hourly Rate (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={form.externalHourlyRate}
                  onChange={(e) => setForm({ ...form, externalHourlyRate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Purchase Cost (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={form.purchaseCost}
                  onChange={(e) => setForm({ ...form, purchaseCost: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Calibration */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">5. Calibration Configuration</h3>
            <div className="grid sm:grid-cols-2 gap-3.5">
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit-cal-req"
                  checked={form.calibrationRequired}
                  onChange={(e) => setForm({ ...form, calibrationRequired: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="edit-cal-req" className="font-bold text-slate-700 cursor-pointer">
                  Periodic Calibration Required
                </label>
              </div>

              {form.calibrationRequired && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Calibration Interval (Months)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={form.calibrationIntervalMonths}
                    onChange={(e) => setForm({ ...form, calibrationIntervalMonths: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 6: Specifications */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">6. Technical Specifications</h3>
              <button
                type="button"
                onClick={handleSpecAdd}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
              >
                <Plus size={13} /> Add Specification Row
              </button>
            </div>

            <div className="space-y-2">
              {specRows.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={row.key}
                    onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                    placeholder="Property (e.g. Processor)"
                    className="w-1/2 rounded-xl border border-slate-200 p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={row.val}
                    onChange={(e) => handleSpecChange(idx, "val", e.target.value)}
                    placeholder="Value (e.g. Apple M2 Max)"
                    className="w-1/2 rounded-xl border border-slate-200 p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {specRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleSpecRemove(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 7: Image */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">7. Equipment Image</h3>
            <div className="flex items-center gap-4">
              <label className="flex flex-col items-center justify-center h-28 w-40 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all">
                <Upload size={20} className="text-slate-400 mb-1" />
                <span className="text-[11px] font-bold text-slate-600">Update Image</span>
                <span className="text-[9px] text-slate-400">PNG, JPG, WebP</span>
                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </label>

              {imagePreview && (
                <div className="relative h-28 w-40 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-5 py-2.5 font-bold text-slate-700 transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 font-bold transition-all text-xs shadow-sm shadow-blue-500/20 disabled:opacity-50"
            >
              {saving ? "Saving Changes…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  REPORT ISSUE / REPAIR MODAL                                       */
/* ================================================================== */

function EquipmentRepairModal({ item, onClose, onSuccess, toast }) {
  const eqId = item.equipmentId || item.id;
  const [form, setForm] = useState({
    issueType: "Hardware Failure",
    issueDescription: "",
    priority: "HIGH",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.issueDescription.trim()) {
      setError("Please provide a detailed description of the observed issue or fault.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const dto = {
        equipmentId: Number(eqId),
        issueType: form.issueType,
        issueDescription: form.issueDescription.trim(),
        priority: form.priority,
      };

      await maintenanceApi.report(dto);
      onSuccess();
    } catch (err) {
      console.error("Failed to submit maintenance request:", err);
      setError(err.message || "Failed to submit maintenance request.");
      toast?.(err.message || "Failed to report equipment issue.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">Report Equipment Issue</h2>
            <p className="text-xs text-slate-500 mt-0.5">Submit maintenance work order for technician inspection</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target Locked Equipment Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 flex items-center gap-3.5">
            <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
              {item.imageSecureUrl ? (
                <img src={item.imageSecureUrl} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <Cpu size={24} className="text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-slate-900 truncate">{item.name}</h3>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                Equipment ID: EQ-{eqId} • {item.labName || "Laboratory"} ({item.location || "Bench"})
              </p>
              <div className="mt-1">
                <StatusBadge status={item.status} />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Issue Type *</label>
              <select
                value={form.issueType}
                onChange={(e) => setForm({ ...form, issueType: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="Hardware Failure">Hardware Failure</option>
                <option value="Calibration Drift">Calibration Drift</option>
                <option value="Power / Electrical Issue">Power / Electrical Issue</option>
                <option value="Software / Firmware Defect">Software / Firmware Defect</option>
                <option value="Physical Damage">Physical Damage</option>
                <option value="Routine Wear & Tear">Routine Wear & Tear</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Priority Level *</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Issue Description & Symptoms *</label>
            <textarea
              rows={4}
              value={form.issueDescription}
              onChange={(e) => setForm({ ...form, issueDescription: e.target.value })}
              placeholder="Describe the fault, observed symptoms, error codes, or defect details..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {error && <p className="text-[11px] text-rose-600 font-semibold mt-1">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-5 py-2.5 font-bold text-slate-700 transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 font-bold transition-all text-xs shadow-sm shadow-amber-500/20 disabled:opacity-50"
            >
              {submitting ? "Submitting Work Order…" : "Submit Work Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
