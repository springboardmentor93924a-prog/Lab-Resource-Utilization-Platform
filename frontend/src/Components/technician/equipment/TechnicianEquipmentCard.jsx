import { useState } from "react";
import {
  Eye, Wrench, MapPin, Building2, FlaskConical,
  Tag, ShieldCheck, Clock, AlertTriangle, ShieldAlert,
  Cpu, ImageOff
} from "lucide-react";
import { StatusBadge } from "../../common/StatusBadge.jsx";

/* ================================================================== */
/*  Technician -> Equipment Card Component                             */
/* ================================================================== */
export function TechnicianEquipmentCard({
  equipment,
  onViewDetails,
  onOpenMaintenance,
  hasActiveTask = false,
}) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const eq = equipment || {};
  const status = eq.status || "AVAILABLE";
  const isUnderMaintenance = status === "UNDER_MAINTENANCE" || hasActiveTask;

  // Calibration status styling
  const getCalibrationBadge = () => {
    const calStatus = eq.calibrationStatus || "NOT_RECORDED";
    if (calStatus === "VALID") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
          <ShieldCheck size={12} className="text-emerald-600" />
          <span>Valid</span>
        </span>
      );
    }
    if (calStatus === "DUE_SOON") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
          <Clock size={12} className="text-amber-600" />
          <span>Due Soon</span>
        </span>
      );
    }
    if (calStatus === "OVERDUE") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200/80">
          <AlertTriangle size={12} className="text-red-600" />
          <span>Overdue</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/80">
        <ShieldAlert size={12} className="text-slate-400" />
        <span>Not Recorded</span>
      </span>
    );
  };

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden">
      {/* Top Image Section */}
      <div className="relative w-full h-44 bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-100">
        {eq.imageSecureUrl && !imgError ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 bg-slate-200/70 animate-pulse flex items-center justify-center text-slate-400">
                <Cpu size={24} />
              </div>
            )}
            <img
              src={eq.imageSecureUrl}
              alt={eq.name || "Equipment Image"}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 text-slate-400 p-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-200/60 flex items-center justify-center text-slate-500">
              <FlaskConical size={24} />
            </div>
            <span className="text-[11px] font-medium text-slate-500 mt-1">No image available</span>
          </div>
        )}

        {/* Top Badges overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
          {eq.category ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white/95 backdrop-blur-sm px-2.5 py-0.5 rounded-md shadow-sm border border-slate-200/80 max-w-[140px] truncate">
              <Tag size={11} className="text-blue-600 shrink-0" />
              <span className="truncate">{eq.category}</span>
            </span>
          ) : <span />}

          <div className="shadow-sm">
            <StatusBadge status={status} />
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Asset ID & Serial */}
          <div className="flex items-center justify-between gap-2 mb-1 text-[11px]">
            <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
              ID: EQ-{eq.equipmentId || eq.id}
            </span>
            {eq.serialNumber && (
              <span className="text-slate-500 font-mono truncate text-[11px]" title={`SN: ${eq.serialNumber}`}>
                SN: {eq.serialNumber}
              </span>
            )}
          </div>

          {/* Equipment Name */}
          <h3
            className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 hover:text-blue-600 transition-colors"
            title={eq.name}
          >
            {eq.name || "Unnamed Equipment"}
          </h3>

          {/* Manufacturer & Model */}
          {(eq.manufacturer || eq.model) && (
            <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
              {[eq.manufacturer, eq.model].filter(Boolean).join(" • ")}
            </p>
          )}

          {/* Location details */}
          <div className="mt-3 space-y-1 text-xs text-slate-600">
            {eq.departmentName && (
              <div className="flex items-center gap-1.5 truncate">
                <Building2 size={13} className="text-slate-400 shrink-0" />
                <span className="truncate font-medium">{eq.departmentName}</span>
              </div>
            )}
            {eq.labName && (
              <div className="flex items-center gap-1.5 truncate">
                <FlaskConical size={13} className="text-slate-400 shrink-0" />
                <span className="truncate">{eq.labName}</span>
              </div>
            )}
            {eq.location && (
              <div className="flex items-center gap-1.5 truncate">
                <MapPin size={13} className="text-slate-400 shrink-0" />
                <span className="truncate text-slate-500">{eq.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Calibration & Active Task Indicators */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-medium">Calibration:</span>
            {getCalibrationBadge()}
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={() => onViewDetails(eq)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold py-2 px-3 transition-colors shadow-sm"
        >
          <Eye size={13} className="text-blue-600" />
          <span>View Details</span>
        </button>

        {isUnderMaintenance && onOpenMaintenance && (
          <button
            onClick={() => onOpenMaintenance(eq)}
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 px-3 transition-colors shadow-sm"
            title="View maintenance work order"
          >
            <Wrench size={13} />
            <span>Task</span>
          </button>
        )}
      </div>
    </div>
  );
}
