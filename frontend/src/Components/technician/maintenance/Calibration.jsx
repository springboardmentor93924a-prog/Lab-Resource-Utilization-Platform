import { useState, useMemo, useEffect, useRef } from "react";
import {
  ShieldCheck, Clock, AlertTriangle, ShieldAlert,
  Search, Filter, RefreshCw, Upload, FileText,
  ExternalLink, Calendar, Building2, FlaskConical,
  Hash, Tag, X, CheckCircle2, ChevronRight, Layers,
  Cpu, FileCheck, Info, FileUp, Sparkles, AlertCircle
} from "lucide-react";
import { equipmentApi } from "../../../api/equipmentApi.js";
import { StatusBadge } from "../../common/StatusBadge.jsx";

/* ================================================================== */
/*  Technician -> Calibration Logs Page (Enterprise Laboratory UI)    */
/* ================================================================== */
export default function Calibration({ equipment = [], calibrations = [], onOpen, onRefresh, toast, user }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedCalStatus, setSelectedCalStatus] = useState("ALL");
  const [selectedLab, setSelectedLab] = useState("ALL");
  const [selectedEquipmentForModal, setSelectedEquipmentForModal] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Dynamic laboratory list from real equipment
  const availableLabs = useMemo(() => {
    const set = new Set();
    equipment.forEach((e) => {
      const name = e.labName || e.laboratory;
      if (name) set.add(name);
    });
    return Array.from(set).sort();
  }, [equipment]);

  // Calibration metrics calculated exclusively from real equipment data
  const metrics = useMemo(() => {
    const total = equipment.length;
    let required = 0;
    let dueSoon = 0;
    let overdue = 0;
    let noRecord = 0;
    let valid = 0;

    equipment.forEach((e) => {
      if (e.calibrationRequired) required++;
      const st = (e.calibrationStatus || "").toUpperCase();
      if (st === "DUE_SOON") dueSoon++;
      else if (st === "OVERDUE") overdue++;
      else if (st === "VALID") valid++;
      else noRecord++;
    });

    return { total, required, dueSoon, overdue, noRecord, valid };
  }, [equipment]);

  // Filtered equipment based on search and selected filter criteria
  const filteredEquipment = useMemo(() => {
    return equipment.filter((eq) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (eq.name || "").toLowerCase().includes(q) ||
        (eq.serialNumber || "").toLowerCase().includes(q) ||
        (eq.category || "").toLowerCase().includes(q) ||
        (eq.labName || "").toLowerCase().includes(q) ||
        `eq-${eq.id || eq.equipmentId}`.toLowerCase().includes(q);

      const matchStatus =
        selectedStatus === "ALL" ||
        (eq.status || "AVAILABLE").toUpperCase() === selectedStatus.toUpperCase();

      const matchCalStatus =
        selectedCalStatus === "ALL" ||
        (eq.calibrationStatus || "NOT_RECORDED").toUpperCase() === selectedCalStatus.toUpperCase();

      const matchLab =
        selectedLab === "ALL" ||
        (eq.labName || eq.laboratory || "") === selectedLab;

      return matchSearch && matchStatus && matchCalStatus && matchLab;
    });
  }, [equipment, searchQuery, selectedStatus, selectedCalStatus, selectedLab]);

  // Format date helper
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return String(dateStr);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      toast?.("Calibration records refreshed.", "success");
    } catch (err) {
      toast?.("Failed to refresh records.", "error");
    } finally {
      setRefreshing(false);
    }
  };

  const handleOpenModal = (eq) => {
    setSelectedEquipmentForModal(eq);
    if (onOpen) {
      onOpen(eq.equipmentId || eq.id);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("ALL");
    setSelectedCalStatus("ALL");
    setSelectedLab("ALL");
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-2.5 h-6 rounded-full bg-blue-600 inline-block" />
            Calibration Logs
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Track calibration schedules, certificates, and compliance across your assigned equipment.
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-all self-start sm:self-auto disabled:opacity-60 cursor-pointer"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin text-blue-600" : "text-slate-500"} />
          <span>{refreshing ? "Refreshing..." : "Refresh Records"}</span>
        </button>
      </div>

      {/* 2. Calibration Summary Metrics Cards (Computed exclusively from real API data) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Equipment */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-1.5 transition-all hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Equipment</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers size={14} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">{metrics.total}</p>
          <p className="text-[11px] font-medium text-slate-400">In assigned department</p>
        </div>

        {/* Card 2: Calibration Required */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-1.5 transition-all hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cal. Required</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck size={14} />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-700 tracking-tight">{metrics.required}</p>
          <p className="text-[11px] font-medium text-slate-400">Mandatory calibration</p>
        </div>

        {/* Card 3: Due Soon */}
        <div className="rounded-2xl border border-amber-200/70 bg-white p-4 shadow-sm space-y-1.5 transition-all hover:border-amber-300">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Due Soon</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={14} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 tracking-tight">{metrics.dueSoon}</p>
          <p className="text-[11px] font-medium text-amber-600/80">Within next 30 days</p>
        </div>

        {/* Card 4: Overdue */}
        <div className="rounded-2xl border border-red-200/70 bg-white p-4 shadow-sm space-y-1.5 transition-all hover:border-red-300">
          <div className="flex items-center justify-between text-red-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Overdue</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle size={14} />
            </div>
          </div>
          <p className="text-2xl font-black text-red-700 tracking-tight">{metrics.overdue}</p>
          <p className="text-[11px] font-medium text-red-600/80">Recalibration expired</p>
        </div>

        {/* Card 5: No Record */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-1.5 transition-all hover:border-slate-300 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">No Record</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
              <ShieldAlert size={14} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-700 tracking-tight">{metrics.noRecord}</p>
          <p className="text-[11px] font-medium text-slate-400">Pending initial log</p>
        </div>
      </div>

      {/* 3. Search and Multi-Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search equipment, serial number, model, category..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Group */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Calibration Status Filter */}
            <select
              value={selectedCalStatus}
              onChange={(e) => setSelectedCalStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-xs font-bold text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="ALL">All Calibration Statuses</option>
              <option value="VALID">✓ Valid & Compliant</option>
              <option value="DUE_SOON">! Due Soon (30 Days)</option>
              <option value="OVERDUE">⚠ Overdue</option>
              <option value="NOT_RECORDED">○ Not Recorded</option>
            </select>

            {/* Equipment Operational Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-xs font-bold text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="ALL">All Operating Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="BOOKED">Booked</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
              <option value="RETIRED">Retired</option>
            </select>

            {/* Laboratory Filter */}
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-xs font-bold text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="ALL">All Laboratories</option>
              {availableLabs.map((lab) => (
                <option key={lab} value={lab}>
                  {lab}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results summary bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <p className="font-medium">
            Showing <strong className="text-slate-900 font-bold">{filteredEquipment.length}</strong> of{" "}
            {equipment.length} equipment items
          </p>
          {(searchQuery || selectedStatus !== "ALL" || selectedCalStatus !== "ALL" || selectedLab !== "ALL") && (
            <button
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-800 font-bold text-xs underline-offset-2 hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Enterprise Data Table (Desktop) / Cards (Mobile) */}
      {filteredEquipment.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
            <FlaskConical size={28} />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">No Calibration Records Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {searchQuery || selectedStatus !== "ALL" || selectedCalStatus !== "ALL" || selectedLab !== "ALL"
                ? "No equipment matches your active search and filter parameters. Try clearing your filters."
                : "Calibration information will appear here when equipment calibration is recorded for your department."}
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Reset Search & Filters</span>
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/90 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Equipment</th>
                  <th className="px-4 py-3.5">Asset / Serial</th>
                  <th className="px-4 py-3.5">Calibration Status</th>
                  <th className="px-4 py-3.5">Last Calibration</th>
                  <th className="px-4 py-3.5">Next Due</th>
                  <th className="px-4 py-3.5">Certificate</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEquipment.map((eq) => {
                  const eqId = eq.equipmentId || eq.id;
                  const calStatus = (eq.calibrationStatus || "NOT_RECORDED").toUpperCase();
                  const nextDue = eq.nextCalibrationDue || eq.nextCalibrationDate || eq.nextCalibration;
                  const lastCal = eq.lastCalibrationDate || eq.lastCalibration;
                  const hasCert = Boolean(eq.certificateSecureUrl || eq.certificateUrl);

                  return (
                    <tr
                      key={eqId}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* 1. Equipment Info with Image */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                            {eq.imageSecureUrl || (eq.image && eq.image.startsWith("http")) ? (
                              <img
                                src={eq.imageSecureUrl || eq.image}
                                alt={eq.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.parentNode.innerHTML = '<span class="text-slate-400 font-bold text-xs">🔬</span>';
                                }}
                              />
                            ) : (
                              <span className="text-slate-400 font-bold text-xs">🔬</span>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p
                              className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors"
                              title={eq.name}
                            >
                              {eq.name}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                              {[eq.category, eq.labName || eq.laboratory].filter(Boolean).join(" • ")}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Asset ID / Serial */}
                      <td className="px-4 py-3.5 font-mono">
                        <div className="space-y-0.5">
                          <span className="inline-block font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 text-[11px]">
                            EQ-{eqId}
                          </span>
                          {eq.serialNumber && (
                            <p className="text-[11px] text-slate-500 truncate max-w-[130px]" title={eq.serialNumber}>
                              SN: {eq.serialNumber}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 3. Calibration Status Badge */}
                      <td className="px-4 py-3.5">
                        <CalibrationStatusBadge status={calStatus} />
                      </td>

                      {/* 4. Last Calibration Date */}
                      <td className="px-4 py-3.5 text-slate-700 font-medium">
                        {formatDisplayDate(lastCal)}
                      </td>

                      {/* 5. Next Due Date */}
                      <td className="px-4 py-3.5 font-semibold">
                        <span className={calStatus === "OVERDUE" ? "text-red-600 font-bold" : calStatus === "DUE_SOON" ? "text-amber-700 font-bold" : "text-slate-900"}>
                          {formatDisplayDate(nextDue)}
                        </span>
                      </td>

                      {/* 6. Certificate Column */}
                      <td className="px-4 py-3.5">
                        {hasCert ? (
                          <a
                            href={eq.certificateSecureUrl || eq.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50/80 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200/60 transition-colors shadow-2xs"
                          >
                            <FileText size={12} className="text-blue-600" />
                            <span>PDF Available</span>
                            <ExternalLink size={10} className="text-blue-400" />
                          </a>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400 italic">
                            No certificate
                          </span>
                        )}
                      </td>

                      {/* 7. Action Button */}
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenModal(eq)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs shadow-sm transition-all group/btn cursor-pointer"
                        >
                          <Upload size={12} className="text-slate-300 group-hover/btn:text-white transition-colors" />
                          <span>Update Calibration</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards View */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredEquipment.map((eq) => {
              const eqId = eq.equipmentId || eq.id;
              const calStatus = (eq.calibrationStatus || "NOT_RECORDED").toUpperCase();
              const nextDue = eq.nextCalibrationDue || eq.nextCalibrationDate || eq.nextCalibration;
              const lastCal = eq.lastCalibrationDate || eq.lastCalibration;
              const hasCert = Boolean(eq.certificateSecureUrl || eq.certificateUrl);

              return (
                <div key={eqId} className="p-4 space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {eq.imageSecureUrl || (eq.image && eq.image.startsWith("http")) ? (
                          <img
                            src={eq.imageSecureUrl || eq.image}
                            alt={eq.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-slate-400 font-bold text-base">🔬</span>
                        )}
                      </div>
                      <div>
                        <span className="font-mono font-semibold text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          EQ-{eqId}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">{eq.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {[eq.category, eq.labName || eq.laboratory].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                    </div>
                    <CalibrationStatusBadge status={calStatus} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Last Calibrated</p>
                      <p className="font-semibold text-slate-800 mt-0.5">{formatDisplayDate(lastCal)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Next Due</p>
                      <p className={`font-bold mt-0.5 ${calStatus === "OVERDUE" ? "text-red-600" : "text-slate-900"}`}>
                        {formatDisplayDate(nextDue)}
                      </p>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Certificate</span>
                      {hasCert ? (
                        <a
                          href={eq.certificateSecureUrl || eq.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600"
                        >
                          <FileText size={12} />
                          <span>PDF Available</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No certificate</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenModal(eq)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    <Upload size={13} />
                    <span>Update Calibration Record</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Update Calibration Modal */}
      {selectedEquipmentForModal && (
        <UpdateCalibrationModal
          equipment={selectedEquipmentForModal}
          onClose={() => setSelectedEquipmentForModal(null)}
          onSuccess={() => {
            setSelectedEquipmentForModal(null);
            if (onRefresh) onRefresh();
            toast?.("Calibration record successfully updated.", "success");
          }}
          toast={toast}
          user={user}
        />
      )}
    </div>
  );
}

/* ================================================================== */
/*  Semantic Calibration Status Badge Component                        */
/* ================================================================== */
function CalibrationStatusBadge({ status }) {
  const st = (status || "NOT_RECORDED").toUpperCase();

  if (st === "VALID" || st === "UP TO DATE") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80 shadow-2xs">
        <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
        <span>Valid</span>
      </span>
    );
  }

  if (st === "DUE_SOON" || st === "DUE SOON") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80 shadow-2xs">
        <Clock size={13} className="text-amber-600 shrink-0" />
        <span>Due Soon</span>
      </span>
    );
  }

  if (st === "OVERDUE") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200/80 shadow-2xs animate-pulse">
        <AlertTriangle size={13} className="text-red-600 shrink-0" />
        <span>Overdue</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/80 shadow-2xs">
      <ShieldAlert size={13} className="text-slate-400 shrink-0" />
      <span>Not Recorded</span>
    </span>
  );
}

/* ================================================================== */
/*  Polished Modern Enterprise Update Calibration Modal Component      */
/* ================================================================== */
export function UpdateCalibrationModal({ equipment, onClose, onSuccess, toast, user }) {
  const eq = equipment || {};
  const eqId = eq.equipmentId || eq.id;

  const [file, setFile] = useState(null);
  const [certificateNumber, setCertificateNumber] = useState("");
  const [calibrationDate, setCalibrationDate] = useState(new Date().toISOString().slice(0, 10));
  const [nextDueDate, setNextDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Pre-calculate suggested next due date based on equipment interval (e.g. 12 months)
  useEffect(() => {
    const intervalMonths = eq.calibrationIntervalMonths || 12;
    const now = new Date();
    now.setMonth(now.getMonth() + intervalMonths);
    setNextDueDate(now.toISOString().slice(0, 10));
  }, [eq]);

  // Handle PDF file selection with size validation
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith(".pdf")) {
      toast?.("Only PDF files are supported for calibration certificates.", "error");
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      toast?.("File size exceeds 10MB limit.", "error");
      return;
    }

    setFile(selected);
    if (errors.file) {
      setErrors((prev) => ({ ...prev, file: null }));
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  const validate = () => {
    const errs = {};
    if (!certificateNumber.trim()) {
      errs.certificateNumber = "Certificate number is required.";
    }
    if (!calibrationDate) {
      errs.calibrationDate = "Calibration date is required.";
    }
    if (!nextDueDate) {
      errs.nextDueDate = "Next calibration due date is required.";
    } else if (calibrationDate && nextDueDate < calibrationDate) {
      errs.nextDueDate = "Next due date must be after calibration date.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("calibrationDate", calibrationDate);
      formData.append("nextDueDate", nextDueDate);
      formData.append("certificateNumber", certificateNumber.trim());
      formData.append("performedBy", user?.name || user?.username || "Authorized Lab Technician");
      if (notes.trim()) {
        formData.append("notes", notes.trim());
      }
      if (file) {
        formData.append("file", file);
      }

      await equipmentApi.recordCalibration(eqId, formData);
      onSuccess?.();
    } catch (err) {
      console.error("Calibration record failure:", err);
      if (err.status === 403) {
        toast?.("You don't have permission to update this calibration record.", "error");
      } else if (err.status === 404) {
        toast?.("Equipment or calibration record not found.", "error");
      } else {
        toast?.(err.message || "Failed to save calibration record. Please try again.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200/80">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
              {eq.imageSecureUrl || (eq.image && eq.image.startsWith("http")) ? (
                <img
                  src={eq.imageSecureUrl || eq.image}
                  alt={eq.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl">🔬</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  EQ-{eqId}
                </span>
                {eq.serialNumber && (
                  <span className="text-[11px] font-mono text-slate-500">
                    SN: {eq.serialNumber}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-slate-900 leading-snug mt-1 truncate">
                {eq.name || "Equipment"}
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
                {[eq.departmentName || eq.department, eq.labName || eq.laboratory].filter(Boolean).join(" • ")}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Section 1: Calibration Certificate Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileCheck size={14} className="text-blue-600" />
                <span>Calibration Certificate (PDF)</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Optional • Max 10MB</span>
            </div>

            {!file ? (
              <label className="w-full rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 transition-all py-6 px-4 flex flex-col items-center justify-center gap-2 text-slate-500 cursor-pointer bg-slate-50/50 group">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileUp size={20} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-800 text-xs">
                    Upload calibration certificate
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    PDF format only • Click to browse or drag and drop
                  </p>
                </div>
              </label>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-xs truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      {formatFileSize(file.size)} • Ready to upload
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-100 rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Certificate Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
              <span>Certificate Number</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={certificateNumber}
              onChange={(e) => {
                setCertificateNumber(e.target.value);
                if (errors.certificateNumber) setErrors((prev) => ({ ...prev, certificateNumber: null }));
              }}
              placeholder="e.g. CAL-2026-0123 / ISO-17025-998"
              className={`w-full rounded-xl border px-3.5 py-2.5 font-medium text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                errors.certificateNumber
                  ? "border-red-300 bg-red-50/40 focus:ring-red-100"
                  : "border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
            {errors.certificateNumber && (
              <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> {errors.certificateNumber}
              </p>
            )}
          </div>

          {/* Section 3: Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Calibration Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <Calendar size={13} className="text-slate-500" />
                <span>Calibration Date</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={calibrationDate}
                onChange={(e) => {
                  setCalibrationDate(e.target.value);
                  if (errors.calibrationDate) setErrors((prev) => ({ ...prev, calibrationDate: null }));
                }}
                className={`w-full rounded-xl border px-3.5 py-2.5 font-medium text-xs text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                  errors.calibrationDate
                    ? "border-red-300 bg-red-50/40 focus:ring-red-100"
                    : "border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-100"
                }`}
              />
              {errors.calibrationDate && (
                <p className="text-[11px] font-semibold text-red-600 mt-1">{errors.calibrationDate}</p>
              )}
            </div>

            {/* Next Due Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <Clock size={13} className="text-blue-600" />
                <span>Next Due Date</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => {
                  setNextDueDate(e.target.value);
                  if (errors.nextDueDate) setErrors((prev) => ({ ...prev, nextDueDate: null }));
                }}
                className={`w-full rounded-xl border px-3.5 py-2.5 font-medium text-xs text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                  errors.nextDueDate
                    ? "border-red-300 bg-red-50/40 focus:ring-red-100"
                    : "border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-100"
                }`}
              />
              <p className="text-[10px] text-slate-400">When should the next calibration be completed?</p>
              {errors.nextDueDate && (
                <p className="text-[11px] font-semibold text-red-600 mt-1">{errors.nextDueDate}</p>
              )}
            </div>
          </div>

          {/* Section 4: Optional Observations / Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Calibration Observations & Technical Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any relevant calibration observations, standard reference devices used, or tolerance checks..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-medium text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors disabled:opacity-60 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Record...</span>
              </>
            ) : (
              <span>Save Calibration Record</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Backward-compatible named export
export { Calibration as CalibrationLogs, UpdateCalibrationModal as CalibrationModal };
