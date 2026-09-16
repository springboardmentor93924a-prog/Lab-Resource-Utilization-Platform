import { Clock } from "lucide-react";
import { EmptyState } from "../../common/EmptyState.jsx";
import { StatusBadge } from "../../common/StatusBadge.jsx";
import { formatDateTime } from "../../../utils/formatters.js";

/* ================================================================== */
/*  Researcher -> Waitlist -> Waitlist                                 */
/*  Extracted from the "waitlist" tab inside the old BookingsView.     */
/*  Rendered by MyBookings.jsx as the content for its Waitlist tab.    */
/* ================================================================== */
export default function Waitlist({ waitlist, equipmentById }) {
  if (waitlist.length === 0) {
    return <EmptyState icon={Clock} title="You're not on any waitlists" />;
  }
  return (
    <div className="space-y-3">
      {waitlist.map((w) => (
        <div key={w.id} className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-800">{equipmentById[w.equipmentId]?.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">Requested {formatDateTime(w.requestedStart)} – {formatDateTime(w.requestedEnd)}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-slate-400">Position</p>
              <p className="text-lg font-extrabold text-purple-600">#{w.position}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400">Est. wait</p>
              <p className="text-sm font-semibold text-slate-700">~{w.position * 2} days</p>
            </div>
            <StatusBadge status={w.status} />
          </div>
        </div>
      ))}
    </div>
  );
}
