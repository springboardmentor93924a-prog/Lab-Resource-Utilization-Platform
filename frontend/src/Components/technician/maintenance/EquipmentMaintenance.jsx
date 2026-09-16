import { useState, useMemo } from "react";
import {
  Search, Filter, MapPin, Tag, FlaskConical,
  RotateCcw, ShieldAlert, Wrench, CheckCircle2,
  Clock, AlertTriangle, Layers
} from "lucide-react";
import { ViewHeader } from "../../common/ViewHeader.jsx";
import { TechnicianEquipmentCard } from "../equipment/TechnicianEquipmentCard.jsx";
import { TechnicianEquipmentDetailsModal } from "../equipment/TechnicianEquipmentDetailsModal.jsx";

/* ================================================================== */
/*  Technician -> Equipment Catalog & Maintenance View                 */
/* ================================================================== */
export default function EquipmentMaintenance({
  equipment = [],
  tasks = [],
  userDepartment = "",
  user,
  onOpenTask,
  toast,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);
  const [selectedEquipmentItem, setSelectedEquipmentItem] = useState(null);

  // Derive dynamic filter choices strictly from the equipment returned by backend
  const categories = useMemo(() => {
    return Array.from(new Set(equipment.map((e) => e.category).filter(Boolean))).sort();
  }, [equipment]);

  const locations = useMemo(() => {
    return Array.from(new Set(equipment.map((e) => e.location).filter(Boolean))).sort();
  }, [equipment]);

  // Summary counts
  const stats = useMemo(() => {
    const total = equipment.length;
    const available = equipment.filter((e) => e.status === "AVAILABLE").length;
    const underMaint = equipment.filter((e) => e.status === "UNDER_MAINTENANCE").length;
    const calOverdue = equipment.filter((e) => e.calibrationStatus === "OVERDUE").length;
    return { total, available, underMaint, calOverdue };
  }, [equipment]);

  // Set of equipment IDs with active tasks assigned to technician
  const activeTaskEqIds = useMemo(() => {
    const set = new Set();
    tasks.forEach((t) => {
      if (t.status !== "COMPLETED" && t.status !== "CANCELLED" && t.equipmentId) {
        set.add(String(t.equipmentId));
      }
    });
    return set;
  }, [tasks]);

  // Filter equipment based on user controls
  const filteredEquipment = useMemo(() => {
    return equipment.filter((e) => {
      // Status filter
      if (statusFilter !== "ALL" && e.status !== statusFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "ALL" && e.category !== categoryFilter) {
        return false;
      }

      // Location filter
      if (locationFilter !== "ALL" && e.location !== locationFilter) {
        return false;
      }

      // Search query filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const nMatch = (e.name || "").toLowerCase().includes(q);
        const cMatch = (e.category || "").toLowerCase().includes(q);
        const lMatch = (e.location || "").toLowerCase().includes(q);
        const mMatch = (e.manufacturer || "").toLowerCase().includes(q);
        const modelMatch = (e.model || "").toLowerCase().includes(q);
        const sMatch = (e.serialNumber || "").toLowerCase().includes(q);
        const idMatch = String(e.equipmentId || e.id || "").includes(q);
        return nMatch || cMatch || lMatch || mMatch || modelMatch || sMatch || idMatch;
      }

      return true;
    });
  }, [equipment, statusFilter, categoryFilter, locationFilter, search]);

  const hasActiveFilters = search.trim() !== "" || statusFilter !== "ALL" || categoryFilter !== "ALL" || locationFilter !== "ALL";

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setLocationFilter("ALL");
  };

  const handleOpenDetails = (eq) => {
    setSelectedEquipmentItem(eq);
    setSelectedEquipmentId(eq.equipmentId || eq.id);
  };

  return (
    <div className="space-y-6">
      <ViewHeader
        title="Department Equipment Catalog"
        subtitle={
          userDepartment
            ? `Inventory and maintenance management for ${userDepartment}.`
            : "Authorized department laboratory equipment inventory and maintenance."
        }
      />

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Equipment</p>
            <p className="text-lg font-extrabold text-slate-900">{stats.total}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Available</p>
            <p className="text-lg font-extrabold text-emerald-600">{stats.available}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <Wrench size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Under Repair</p>
            <p className="text-lg font-extrabold text-orange-600">{stats.underMaint}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cal. Overdue</p>
            <p className="text-lg font-extrabold text-red-600">{stats.calOverdue}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by equipment name, asset ID, serial number, model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-800"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="BOOKED">Booked / In Use</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
              <option value="RETIRED">Retired</option>
            </select>

            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 max-w-[160px]"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Location filter */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 max-w-[160px]"
            >
              <option value="ALL">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-2.5 rounded-xl transition-colors"
                title="Reset all filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Equipment Cards Grid */}
      {filteredEquipment.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((eq) => {
            const eqIdStr = String(eq.equipmentId || eq.id);
            const hasTask = activeTaskEqIds.has(eqIdStr);
            return (
              <TechnicianEquipmentCard
                key={eqIdStr}
                equipment={eq}
                hasActiveTask={hasTask}
                onViewDetails={handleOpenDetails}
                onOpenMaintenance={() => {
                  const matchingTask = tasks.find((t) => String(t.equipmentId) === eqIdStr);
                  if (matchingTask && onOpenTask) {
                    onOpenTask(matchingTask.id);
                  } else {
                    handleOpenDetails(eq);
                  }
                }}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FlaskConical size={26} />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {hasActiveFilters ? "No equipment matching filters" : "No equipment available for your department."}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {hasActiveFilters
              ? "Try adjusting your search keywords or resetting the status and location filters."
              : "All equipment resources registered under your authorized department will automatically appear here."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 transition-colors shadow-sm"
            >
              <RotateCcw size={13} />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      )}

      {/* Equipment Details Modal */}
      {selectedEquipmentId && (
        <TechnicianEquipmentDetailsModal
          equipmentId={selectedEquipmentId}
          initialEquipment={selectedEquipmentItem}
          tasks={tasks}
          user={user}
          onClose={() => {
            setSelectedEquipmentId(null);
            setSelectedEquipmentItem(null);
          }}
          onOpenTask={onOpenTask}
          toast={toast}
        />
      )}
    </div>
  );
}
