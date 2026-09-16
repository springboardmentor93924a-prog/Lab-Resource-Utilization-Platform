import { Share2, ThumbsUp, ThumbsDown } from "lucide-react";
import { EmptyState } from "../../common/EmptyState.jsx";
import { StatusBadge } from "../../common/StatusBadge.jsx";

/* ================================================================== */
/*  Institution Admin -> Sharing -> Department Sharing Requests        */
/*                                                                      */
/*  MOVED HERE from the old Department Head dashboard's "SharingView", */
/*  which reviewed incoming inter-institution requests targeting a     */
/*  single department's equipment. Per the strict requirement that     */
/*  equipment sharing must exist ONLY under Institution Admin, this    */
/*  functionality (and its demo data) was relocated as-is and is now   */
/*  reachable as the "Department Requests" tab inside the Institution  */
/*  Admin Sharing Equipment feature, instead of living on the          */
/*  Department Head dashboard.                                         */
/* ================================================================== */
export default function DepartmentSharingRequests({ requests, onDecide }) {
  const pending = requests.filter((r) => r.status === "PENDING");
  const decided = requests.filter((r) => r.status !== "PENDING");
  return (
    <div>
      <div className="mb-5">
        <p className="text-sm text-slate-500">
          Requests from external universities or research centers for a specific department's shared equipment
          (previously reviewed on the Department Head dashboard — now consolidated here under Institution Admin).
        </p>
      </div>
      {pending.length === 0 ? (
        <EmptyState icon={Share2} title="No pending department sharing requests" />
      ) : (
        <div className="space-y-3 mb-8">
          {pending.map((r) => (
            <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-slate-900">{r.equipment}</p>
                  <span className="text-xs text-slate-400">{r.id}</span>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-xs text-slate-500 mt-1">{r.institution} · requested by {r.requestedBy}</p>
                <p className="text-xs text-slate-500">{r.window}</p>
                <p className="text-xs text-slate-600 mt-1.5">{r.terms}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => onDecide(r.id, "APPROVED")} className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 flex items-center gap-1.5 transition-colors">
                  <ThumbsUp size={13} /> Approve Sharing
                </button>
                <button onClick={() => onDecide(r.id, "DENIED")} className="rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-4 py-2.5 flex items-center gap-1.5 transition-colors">
                  <ThumbsDown size={13} /> Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {decided.length > 0 && (
        <>
          <h2 className="text-sm font-bold text-slate-900 mb-3">Decided</h2>
          <div className="space-y-2">
            {decided.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{r.equipment} — {r.institution}</p>
                  <p className="text-xs text-slate-500">{r.id} · {r.window}</p>
                </div>
                <StatusBadge status={r.status === "APPROVED" ? "CONFIRMED" : "REJECTED"} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
