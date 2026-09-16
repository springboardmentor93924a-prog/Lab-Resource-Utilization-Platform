import { useState, useMemo } from "react";
import { StatusBadge } from "../../common/StatusBadge.jsx";

/* ================================================================== */
/*  Manager -> Maintenance -> Assign Maintenance                       */
/*  (row widget for assigning an unassigned task to a technician)      */
/* ================================================================== */
export default function AssignMaintenance({ task, equipment, technicians = [], onAssign }) {
  const [technicianId, setTechnicianId] = useState("");
  const techniciansList = useMemo(() => technicians, [technicians]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-slate-900">{equipment?.name || task.equipmentName || "Equipment Asset"}</p>
          <span className="text-xs text-slate-400">{task.id}</span>
          <StatusBadge status={task.priority} />
        </div>
        <p className="text-xs text-slate-500 mt-1">{task.issueType} — reported by {task.reportedBy || "Lab User"}</p>
        <p className="text-xs text-slate-600 mt-1">{task.description}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <select value={technicianId} onChange={(e) => setTechnicianId(e.target.value)} className="rounded-lg border border-slate-200 text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Select technician…</option>
          {techniciansList.map((t) => (
            <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
          ))}
        </select>
        <button
          disabled={!technicianId}
          onClick={() => onAssign(task.id, technicianId)}
          className="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 transition-colors cursor-pointer"
        >
          Assign Task
        </button>
      </div>
    </div>
  );
}
