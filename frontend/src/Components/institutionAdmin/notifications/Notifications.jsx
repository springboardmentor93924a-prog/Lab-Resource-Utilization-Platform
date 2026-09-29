import { Bell } from "lucide-react";
import { ViewHeader } from "../../common/ViewHeader.jsx";
import { EmptyState } from "../../common/EmptyState.jsx";

/* ================================================================== */
/*  Institution Admin -> Notifications                                 */
/* ================================================================== */
export default function Notifications({ notifications, onRead }) {
  return (
    <div>
      <ViewHeader title="Notifications" subtitle="Institution-wide alerts, sharing requests, and administrative notices." />
      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up" />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const id = n.notificationId || n.id;
            const isRead = n.isRead ?? n.read;
            const title = n.title;
            const message = n.message;
            const type = n.type || "PUSH";
            const time = n.createdAt ? new Date(n.createdAt).toLocaleString() : (n.time || "");

            return (
              <button
                key={id}
                onClick={() => !isRead && onRead(id)}
                className={`w-full text-left rounded-xl border p-4 flex items-start gap-3 transition-colors ${
                  isRead ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50/60"
                }`}
              >
                <span className={`mt-0.5 flex h-2.5 w-2.5 shrink-0 rounded-full ${isRead ? "bg-slate-300" : "bg-blue-500"}`} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{message}</p>
                  <p className="text-[11px] text-slate-400 mt-1.5">{type}{time ? ` · ${time}` : ""}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
