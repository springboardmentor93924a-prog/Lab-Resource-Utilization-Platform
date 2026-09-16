import { useState, useEffect } from "react";
import {
  X, LayoutDashboard, Cpu, ShieldCheck, Wrench,
  FileText, Building2, FlaskConical, MapPin, Tag,
  Globe, AlertTriangle, ShieldAlert, ImageOff
} from "lucide-react";
import { StatusBadge } from "../../common/StatusBadge.jsx";
import { equipmentApi } from "../../../api/equipmentApi.js";
import { EquipmentOverviewTab } from "./EquipmentOverviewTab.jsx";
import { EquipmentSpecificationsTab } from "./EquipmentSpecificationsTab.jsx";
import { EquipmentCalibrationTab } from "./EquipmentCalibrationTab.jsx";
import { EquipmentMaintenanceTab } from "./EquipmentMaintenanceTab.jsx";
import { EquipmentDocumentsTab } from "./EquipmentDocumentsTab.jsx";

/* ================================================================== */
/*  Technician -> Equipment Details Modal / Drawer Component           */
/* ================================================================== */
export function TechnicianEquipmentDetailsModal({
  equipmentId,
  initialEquipment,
  tasks = [],
  user,
  onClose,
  onOpenTask,
  toast,
}) {
  const [equipment, setEquipment] = useState(initialEquipment || null);
  const [loading, setLoading] = useState(!initialEquipment);
  const [accessDenied, setAccessDenied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [imgError, setImgError] = useState(false);

  // Fetch full details from authoritative backend API
  useEffect(() => {
    if (equipmentId) {
      setLoading(true);
      setAccessDenied(false);
      equipmentApi
        .getById(equipmentId)
        .then((data) => {
          setEquipment(data);
          setAccessDenied(false);
        })
        .catch((err) => {
          console.warn("Could not load equipment details:", err);
          if (err.status === 403 || (err.message && err.message.toLowerCase().includes("authoris"))) {
            setAccessDenied(true);
          } else {
            toast?.(err.message || "Failed to load equipment details.", "error");
          }
        })
        .finally(() => setLoading(false));
    }
  }, [equipmentId, toast]);

  const eq = equipment || {};

  const TABS = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "specs", label: "Specifications", icon: Cpu },
    { id: "calibration", label: "Calibration", icon: ShieldCheck },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shadow-sm"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Loading State */}
        {loading && (
          <div className="p-16 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading equipment details from database...</p>
          </div>
        )}

        {/* 403 Access Denied State */}
        {!loading && accessDenied && (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Access Denied</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              You do not have permission to view this equipment. This resource belongs to another department or institution.
            </p>
            <button
              onClick={onClose}
              className="mt-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 transition-colors"
            >
              Back to Catalog
            </button>
          </div>
        )}

        {/* Loaded Equipment View */}
        {!loading && !accessDenied && equipment && (
          <>
            {/* Header Section */}
            <div className="p-6 bg-slate-50 border-b border-slate-200/80">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Equipment Image */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                  {eq.imageSecureUrl && !imgError ? (
                    <img
                      src={eq.imageSecureUrl}
                      alt={eq.name}
                      onError={() => setImgError(true)}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                      <FlaskConical size={26} className="text-slate-400" />
                      <span className="text-[10px] text-slate-400 mt-1">No Image</span>
                    </div>
                  )}
                </div>

                {/* Title and Meta Header */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                      EQ-{eq.equipmentId}
                    </span>
                    <StatusBadge status={eq.status} />
                    {eq.isShareable ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <Globe size={11} /> SHARING ENABLED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        <Globe size={11} /> SHARING DISABLED
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    {eq.name}
                  </h2>

                  <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap font-medium">
                    {eq.departmentName && (
                      <span className="inline-flex items-center gap-1 text-slate-800 font-semibold">
                        <Building2 size={13} className="text-blue-600" /> {eq.departmentName}
                      </span>
                    )}
                    {eq.labName && (
                      <span className="inline-flex items-center gap-1">
                        <FlaskConical size={13} className="text-slate-400" /> {eq.labName}
                      </span>
                    )}
                    {eq.location && (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <MapPin size={13} className="text-slate-400" /> {eq.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Tabs Header */}
              <div className="flex items-center gap-1 mt-6 border-b border-slate-200 -mb-6 overflow-x-auto">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                        isActive
                          ? "border-blue-600 text-blue-600 bg-white rounded-t-xl"
                          : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                      }`}
                    >
                      <Icon size={14} className={isActive ? "text-blue-600" : "text-slate-400"} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Body */}
            <div className="p-6 overflow-y-auto flex-1 max-h-[55vh]">
              {activeTab === "overview" && <EquipmentOverviewTab equipment={eq} />}
              {activeTab === "specs" && <EquipmentSpecificationsTab specifications={eq.specifications} />}
              {activeTab === "calibration" && <EquipmentCalibrationTab equipment={eq} />}
              {activeTab === "maintenance" && (
                <EquipmentMaintenanceTab
                  equipment={eq}
                  tasks={tasks}
                  onOpenTask={(taskId) => {
                    onClose();
                    onOpenTask?.(taskId);
                  }}
                  user={user}
                />
              )}
              {activeTab === "documents" && <EquipmentDocumentsTab equipment={eq} />}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Department Scoped: <strong>{eq.departmentName || "Authorized Department"}</strong></span>
              <button
                onClick={onClose}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
