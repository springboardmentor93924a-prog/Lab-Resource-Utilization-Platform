import { useState, useEffect, useMemo } from "react";
import {
  Wrench, AlertTriangle, Calendar, Clock, User,
  CheckCircle2, ArrowRight, ExternalLink, Activity
} from "lucide-react";
import { StatusBadge } from "../../common/StatusBadge.jsx";
import { maintenanceApi } from "../../../api/maintenanceApi.js";

export function EquipmentMaintenanceTab({
  equipment,
  tasks = [],
  onOpenTask,
  user,
}) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const eqId = equipment?.equipmentId || equipment?.id;

  // Find active maintenance task assigned to technician for this equipment
  const activeTask = useMemo(() => {
    return tasks.find(
      (t) =>
        (String(t.equipmentId) === String(eqId) || String(t.equipmentId) === String(equipment?.equipmentId)) &&
        t.status !== "COMPLETED" &&
        t.status !== "CANCELLED"
    );
  }, [tasks, eqId, equipment]);

  // Fetch equipment maintenance history records
  useEffect(() => {
    if (eqId) {
      setLoading(true);
      maintenanceApi
        .getEquipmentHistory(eqId)
        .then((data) => {
          if (Array.isArray(data)) setHistory(data);
        })
        .catch(() => {
          setHistory([]);
        })
        .finally(() => setLoading(false));
    }
  }, [eqId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
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
      {/* Active Work Order Highlight Banner */}
      {activeTask && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={14} className="text-amber-600" /> Active Maintenance Work Order
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={activeTask.priority} />
              <StatusBadge status={activeTask.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-amber-900/70 uppercase">Work Order ID</p>
              <p className="font-extrabold text-slate-900 font-mono text-sm">{activeTask.id || activeTask.maintenanceCode}</p>
              <p className="text-slate-700 mt-1"><strong className="text-slate-900">Issue:</strong> {activeTask.issueType || "General Maintenance"}</p>
              {activeTask.description && (
                <p className="text-slate-600 text-[11px] italic">"{activeTask.description}"</p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-amber-900/70 uppercase">Schedule Timeline</p>
              <p className="text-slate-700">Start: <strong>{formatDate(activeTask.startDate)}</strong></p>
              <p className="text-amber-900 font-bold">Target Completion: {formatDate(activeTask.targetEndDate || activeTask.dueDate)}</p>
              {activeTask.delayReason && (
                <div className="mt-1 bg-white/90 p-2 rounded-lg border border-amber-200 text-[11px] text-amber-950">
                  <strong>Justification:</strong> {activeTask.delayReason}
                </div>
              )}
            </div>
          </div>

          {onOpenTask && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onOpenTask(activeTask.id)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 transition-colors shadow-sm"
              >
                <span>Open Task Details</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Maintenance History Timeline */}
      <div>
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
          Maintenance History Records
        </h4>

        {loading ? (
          <div className="text-xs text-slate-400 p-6 text-center">Loading maintenance history...</div>
        ) : history.length > 0 ? (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {history.map((item, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 border-white bg-blue-600 shadow-sm" />

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{formatDate(item.maintenanceDate || item.createdAt)}</span>
                      <span className="text-[11px] font-semibold text-slate-500">• {item.type || item.maintenanceType || "Preventive Maintenance"}</span>
                    </div>
                    <StatusBadge status={item.status || "COMPLETED"} />
                  </div>

                  {item.reason && (
                    <p className="text-xs text-slate-700 font-medium">
                      <strong>Reason:</strong> {item.reason}
                    </p>
                  )}

                  {item.workPerformed && (
                    <p className="text-xs text-slate-600">
                      <strong>Work Performed:</strong> {item.workPerformed}
                    </p>
                  )}

                  {(item.partsCost !== undefined || item.labourCost !== undefined) && (
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-4 text-[11px] text-slate-500">
                      {item.partsCost !== undefined && <span>Parts Cost: ₹{Number(item.partsCost).toLocaleString("en-IN")}</span>}
                      {item.labourCost !== undefined && <span>Labour Cost: ₹{Number(item.labourCost).toLocaleString("en-IN")}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
            No maintenance records or history logged on file for this equipment.
          </div>
        )}
      </div>
    </div>
  );
}
