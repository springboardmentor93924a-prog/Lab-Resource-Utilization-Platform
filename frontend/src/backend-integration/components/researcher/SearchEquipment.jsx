import { useCallback, useEffect, useRef, useState } from "react";
import { Search as SearchIcon, MapPin, Beaker, RotateCcw, AlertCircle, RefreshCw } from "lucide-react";
import { equipmentApi } from "../../../api/equipmentApi";
import { useAuth } from "../../../context/AuthContext";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "AVAILABLE", label: "Available" },
  { value: "BOOKED", label: "Booked" },
  { value: "UNDER_MAINTENANCE", label: "Under Maintenance" },
  { value: "OUT_OF_SERVICE", label: "Out of Service" },
  { value: "RETIRED", label: "Retired" },
];

export function SearchEquipment({ onSelectEquipment, toast }) {
  const { user } = useAuth();

  // Search parameters
  const [query, setQuery]               = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [labId, setLabId]               = useState("");
  const [location, setLocation]         = useState("");
  const [category, setCategory]         = useState("");
  const [status, setStatus]             = useState("");

  // Results & UI state
  const [results, setResults]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchError, setSearchError]   = useState(null);

  // Dynamic filter dropdown lists from real database APIs
  const [departments, setDepartments]   = useState([]);
  const [deptLoading, setDeptLoading]   = useState(true);
  const [labs, setLabs]                 = useState([]);
  const [labsLoading, setLabsLoading]   = useState(false);
  const [locations, setLocations]       = useState([]);
  const [categories, setCategories]     = useState([]);
  const [catLoading, setCatLoading]     = useState(true);

  // ── Initial load: departments, categories, all labs for institution on mount ──
  useEffect(() => {
    setDeptLoading(true);
    equipmentApi.getDepartments()
      .then(setDepartments)
      .catch(() => setDepartments([]))
      .finally(() => setDeptLoading(false));

    setCatLoading(true);
    equipmentApi.getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setCatLoading(false));

    // Load all laboratories in institution for "All Departments" default
    setLabsLoading(true);
    equipmentApi.getLaboratories()
      .then(setLabs)
      .catch(() => setLabs([]))
      .finally(() => setLabsLoading(false));
  }, []);

  // ── Cascade: Department change -> reload labs, reset labId & location ─────────
  const handleDepartmentChange = (e) => {
    const newDeptId = e.target.value;
    setDepartmentId(newDeptId);
    setLabId("");
    setLocation("");

    setLabsLoading(true);
    equipmentApi.getLaboratories(newDeptId || undefined)
      .then(setLabs)
      .catch(() => setLabs([]))
      .finally(() => setLabsLoading(false));
  };

  // ── Cascade: Laboratory change -> reset location ──────────────────────────────
  const handleLabChange = (e) => {
    const newLabId = e.target.value;
    setLabId(newLabId);
    setLocation("");
  };

  // ── Cascade: reload locations when dept or lab changes ────────────────────────
  useEffect(() => {
    const params = {};
    if (departmentId) params.departmentId = departmentId;
    if (labId)        params.labId        = labId;
    equipmentApi.getLocations(params)
      .then(setLocations)
      .catch(() => setLocations([]));
  }, [departmentId, labId]);

  // ── Perform Institution-Scoped Search ─────────────────────────────────────────
  const runSearch = useCallback(() => {
    setLoading(true);
    setSearchError(null);
    const params = {};
    if (query.trim()) params.query        = query.trim();
    if (departmentId) params.departmentId = departmentId;
    if (labId)        params.labId        = labId;
    if (location)     params.location     = location;
    if (category)     params.category     = category;
    if (status)       params.status       = status;

    equipmentApi
      .search(params)
      .then((data) => setResults(data || []))
      .catch((e) => {
        setSearchError(e.message || "Unable to load equipment.");
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, [query, departmentId, labId, location, category, status]);

  // Run search on mount and whenever filters change
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      runSearch();
    } else {
      runSearch();
    }
  }, [runSearch]);

  // ── Clear All Filters ─────────────────────────────────────────────────────────
  const handleClearFilters = () => {
    setQuery("");
    setDepartmentId("");
    setLabId("");
    setLocation("");
    setCategory("");
    setStatus("");

    // Reload all institution labs
    setLabsLoading(true);
    equipmentApi.getLaboratories()
      .then(setLabs)
      .catch(() => setLabs([]))
      .finally(() => setLabsLoading(false));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Page Title & Subtitle ────────────────────────────────────────────── */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Search Equipment</h1>
        <p className="mt-1.5 text-base text-slate-600">Find available instruments and reserve a time slot.</p>
      </div>

      {/* ── Search Input ─────────────────────────────────────────────────────── */}
      <div className="relative">
        <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          placeholder="Search equipment by name, model, manufacturer..."
          className="w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>

      {/* ── Filter Grid (2 Aligned Rows) ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 space-y-4 shadow-sm">
        {/* ROW 1: Department, Laboratory, Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Department */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Department
            </label>
            <select
              value={departmentId}
              onChange={handleDepartmentChange}
              disabled={deptLoading}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            >
              <option value="">{deptLoading ? "Loading departments..." : "All Departments"}</option>
              {departments.map((d) => (
                <option key={d.departmentId} value={d.departmentId}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Laboratory */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Laboratory
            </label>
            <select
              value={labId}
              onChange={handleLabChange}
              disabled={labsLoading}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            >
              <option value="">{labsLoading ? "Loading laboratories..." : "All Laboratories"}</option>
              {labs.map((l) => (
                <option key={l.labId} value={l.labId}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Location
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ROW 2: Category, Status, Clear Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={catLoading}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            >
              <option value="">{catLoading ? "Loading categories..." : "All Categories"}</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div>
            <button
              onClick={handleClearFilters}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold py-2.5 px-4 shadow-sm transition-colors"
            >
              <RotateCcw size={15} />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* ── Equipment Section Header ─────────────────────────────────────────── */}
      <div className="pt-2">
        <h2 className="text-xl font-bold text-slate-900">Equipment</h2>
      </div>

      {/* ── Results Grid & States ───────────────────────────────────────────── */}
      {loading ? (
        <div className="py-16 text-center text-sm font-medium text-slate-500">
          Loading equipment...
        </div>
      ) : searchError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle size={28} className="mx-auto mb-3 text-red-500" />
          <p className="text-sm font-semibold text-red-700">{searchError}</p>
          <button
            onClick={runSearch}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-800"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
          No equipment found. Try adjusting your filters or search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((eq) => (
            <EquipmentCard key={eq.equipmentId} equipment={eq} onSelect={onSelectEquipment} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Redesigned Equipment Card Component ─────────────────────────────────────
function EquipmentCard({ equipment: eq, onSelect }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col">
      {/* Real Equipment Image or Clean Fallback */}
      {eq.imageSecureUrl ? (
        <div className="h-44 w-full overflow-hidden bg-slate-100">
          <img src={eq.imageSecureUrl} alt={eq.name} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="h-44 w-full bg-slate-50 flex items-center justify-center border-b border-slate-100">
          <Beaker size={36} className="text-slate-300" />
        </div>
      )}

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 line-clamp-1 mb-2">{eq.name}</h3>

          <div className="space-y-1.5 text-xs text-slate-600 mb-4">
            {eq.category && (
              <p><span className="font-semibold text-slate-800">Category:</span> {eq.category}</p>
            )}
            {eq.departmentName && (
              <p><span className="font-semibold text-slate-800">Department:</span> {eq.departmentName}</p>
            )}
            {eq.labName && (
              <p><span className="font-semibold text-slate-800">Laboratory:</span> {eq.labName}</p>
            )}
            {eq.location && (
              <p className="flex items-center gap-1">
                <MapPin size={12} className="text-slate-400 shrink-0" />
                <span>{eq.location}</span>
              </p>
            )}
          </div>
        </div>

        <div>
          {/* Status & Price Row */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 mb-4">
            <StatusBadge status={eq.status} />
            {eq.hourlyRate != null && (
              <p className="text-sm font-extrabold text-blue-600">
                ₹{Number(eq.hourlyRate).toFixed(2)}/hour
              </p>
            )}
          </div>

          {/* Action Buttons: View Details + (Book or Waitlist) */}
          <div className="flex gap-2">
            <button
              onClick={() => onSelect(eq.equipmentId)}
              className="flex-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2.5 px-3 transition-colors text-center"
            >
              View Details
            </button>
            {eq.status === "AVAILABLE" && (
              <button
                onClick={() => onSelect(eq.equipmentId)}
                className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-3 transition-colors text-center shadow-sm"
              >
                Book
              </button>
            )}
            {eq.status === "BOOKED" && (
              <button
                onClick={() => onSelect(eq.equipmentId)}
                className="flex-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-2.5 px-3 transition-colors text-center shadow-sm"
              >
                Waitlist
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    AVAILABLE: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
    BOOKED: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
    UNDER_MAINTENANCE: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50 border-red-200" },
    OUT_OF_SERVICE: { dot: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-100 border-slate-200" },
    RETIRED: { dot: "bg-slate-400", text: "text-slate-500", bg: "bg-slate-100 border-slate-200" },
  };

  const style = map[status] || { dot: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-100 border-slate-200" };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${style.bg} ${style.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status ? status.replace(/_/g, " ") : "UNKNOWN"}
    </span>
  );
}
