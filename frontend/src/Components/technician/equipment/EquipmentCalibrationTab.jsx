import { useState, useEffect } from "react";
import {
  ShieldCheck, AlertTriangle, Clock, ShieldAlert,
  Calendar, FileText, ExternalLink, RefreshCw
} from "lucide-react";
import { equipmentApi } from "../../../api/equipmentApi.js";

export function EquipmentCalibrationTab({ equipment, calibrations = [] }) {
  const [logs, setLogs] = useState(calibrations || []);
  const [loading, setLoading] = useState(false);

  const eq = equipment || {};
  const calStatus = eq.calibrationStatus || "NOT_RECORDED";
  const nextDueDate = eq.nextCalibrationDue || eq.nextCalibrationDate;
  const isRequired = Boolean(eq.calibrationRequired);
  const interval = eq.calibrationIntervalMonths;

  useEffect(() => {
    if (eq.equipmentId) {
      setLoading(true);
      equipmentApi
        .getCalibrations(eq.equipmentId)
        .then((res) => {
          if (Array.isArray(res)) setLogs(res);
        })
        .catch(() => {
          // If no specific calibration endpoint or error, keep prop calibrations
        })
        .finally(() => setLoading(false));
    }
  }, [eq.equipmentId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not recorded";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return String(dateStr);
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Status Banner */}
      {calStatus === "VALID" && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-emerald-900">Calibration Valid & Compliant</h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              This equipment is currently within its certified operating parameters and verified safe for academic & research use.
            </p>
          </div>
        </div>
      )}

      {calStatus === "DUE_SOON" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock size={22} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-900">Calibration Due Soon</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              Scheduled calibration due date is approaching within the next 30 days. Plan preventive calibration service.
            </p>
          </div>
        </div>
      )}

      {calStatus === "OVERDUE" && (
        <div className="rounded-2xl border border-red-200 bg-red-50/80 p-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-red-900">⚠ Calibration Overdue</h4>
            <p className="text-xs text-red-700 mt-0.5">
              Calibration validity has expired. Operating this instrument without recalibration may lead to experimental inaccuracy.
            </p>
          </div>
        </div>
      )}

      {calStatus === "NOT_RECORDED" && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
            <ShieldAlert size={22} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800">No Calibration on Record</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              {isRequired
                ? "This equipment requires periodic calibration, but no formal calibration record has been logged yet."
                : "Periodic calibration is optional or not mandated for this equipment category."}
            </p>
          </div>
        </div>
      )}

      {/* Key Dates & Interval Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 p-3.5 bg-white space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar size={13} className="text-blue-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Next Due Date</span>
          </div>
          <p className={`text-sm font-extrabold ${calStatus === "OVERDUE" ? "text-red-600" : "text-slate-900"}`}>
            {formatDate(nextDueDate)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 p-3.5 bg-white space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock size={13} className="text-purple-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Interval</span>
          </div>
          <p className="text-sm font-extrabold text-slate-900">
            {interval ? `Every ${interval} Months` : "Not specified"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 p-3.5 bg-white space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Requirement</span>
          </div>
          <p className="text-sm font-extrabold text-slate-900">
            {isRequired ? "Mandatory" : "Optional / Standard"}
          </p>
        </div>
      </div>

      {/* Calibration Records List */}
      <div>
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
          Historical Calibration Logs
        </h4>
        {loading ? (
          <div className="text-xs text-slate-400 p-4 text-center">Loading calibration logs...</div>
        ) : logs.length > 0 ? (
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden">
            {logs.map((log, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-slate-800">
                    Certificate: {log.certificateNumber || log.calibrationNumber || `CAL-${idx + 1}`}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Calibrated on {formatDate(log.calibrationDate || log.performedAt)} by {log.calibratedBy || log.agency || "Authorized Technician"}
                  </p>
                </div>
                {log.certificateUrl && (
                  <a
                    href={log.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1 text-[11px] transition-colors"
                  >
                    <ExternalLink size={12} /> View Certificate
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
            No historical calibration certificates or logs recorded for this equipment.
          </div>
        )}
      </div>
    </div>
  );
}
