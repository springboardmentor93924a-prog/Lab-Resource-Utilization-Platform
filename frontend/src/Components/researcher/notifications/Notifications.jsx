import { Bell } from "lucide-react";
import { ViewHeader } from "../../common/ViewHeader.jsx";
import { EmptyState } from "../../common/EmptyState.jsx";

/* ================================================================== */
/*  Researcher -> Notifications                                        */
/* ================================================================== */
export default function Notifications({ notifications, onRead }) {
  return (
    <div>
      <ViewHeader title="Notifications" subtitle="Booking updates, waitlist movement, and maintenance alerts." />
      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up" />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => onRead(n.id)}
              className={`w-full text-left rounded-xl border p-4 flex items-start gap-3 transition-colors ${
                n.read ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50/60"
              }`}
            >
              <span className={`mt-0.5 flex h-2.5 w-2.5 shrink-0 rounded-full ${n.read ? "bg-slate-300" : "bg-blue-500"}`} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                <p className="text-[11px] text-slate-400 mt-1.5">{n.type} · {n.time}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
