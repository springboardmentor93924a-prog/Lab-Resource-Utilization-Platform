/* ------------------------------------------------------------------ */
/*  Status badge — shared across all role dashboards                   */
/* ------------------------------------------------------------------ */
const STATUS_STYLES = {
  // Booking statuses
  PENDING_APPROVAL: "bg-amber-50 text-amber-600 border-amber-200",
  CONFIRMED: "bg-emerald-50 text-emerald-600 border-emerald-200",
  REJECTED: "bg-red-50 text-red-600 border-red-200",
  IN_USE: "bg-blue-50 text-blue-600 border-blue-200",
  COMPLETED: "bg-slate-100 text-slate-600 border-slate-200",
  CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
  NO_SHOW: "bg-red-50 text-red-500 border-red-200",
  WAITING: "bg-purple-50 text-purple-600 border-purple-200",
  NOTIFIED: "bg-blue-50 text-blue-600 border-blue-200",
  // Equipment statuses
  AVAILABLE: "bg-emerald-50 text-emerald-600 border-emerald-200",
  BOOKED: "bg-amber-50 text-amber-600 border-amber-200",
  UNDER_MAINTENANCE: "bg-orange-50 text-orange-600 border-orange-200",
  OUT_OF_SERVICE: "bg-red-50 text-red-600 border-red-200",
  RETIRED: "bg-slate-100 text-slate-500 border-slate-200",
  // Maintenance statuses
  OPEN: "bg-amber-50 text-amber-600 border-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-600 border-blue-200",
  WAITING_FOR_PARTS: "bg-purple-50 text-purple-600 border-purple-200",
  RESOLVED: "bg-emerald-50 text-emerald-600 border-emerald-200",
  // Utilization statuses
  LOW: "bg-slate-100 text-slate-600 border-slate-200",
  MODERATE: "bg-amber-50 text-amber-700 border-amber-200",
  GOOD: "bg-blue-50 text-blue-700 border-blue-200",
  HIGH: "bg-emerald-50 text-emerald-700 border-emerald-200",
  // Budget warning statuses
  NORMAL: "bg-emerald-50 text-emerald-700 border-emerald-200",
  WATCH: "bg-blue-50 text-blue-700 border-blue-200",
  WARNING: "bg-amber-50 text-amber-700 border-amber-200",
  CRITICAL: "bg-orange-50 text-orange-700 border-orange-200",
  EXCEEDED: "bg-red-50 text-red-700 border-red-200",
  // Priority
  MEDIUM: "bg-amber-50 text-amber-600 border-amber-200",
  // User account statuses
  ACTIVE: "bg-emerald-50 text-emerald-600 border-emerald-200",
  INVITED: "bg-blue-50 text-blue-600 border-blue-200",
  INACTIVE: "bg-slate-100 text-slate-500 border-slate-200",
  REMOVED: "bg-red-50 text-red-500 border-red-200",
  // Cross-institution request / agreement statuses
  PENDING: "bg-amber-50 text-amber-600 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-200",
  DECLINED: "bg-red-50 text-red-600 border-red-200",
};

export function StatusBadge({ status, className = "" }) {
  const style = STATUS_STYLES[status] || "bg-slate-100 text-slate-600 border-slate-200";
  const label = String(status || "").replace(/_/g, " ");
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${style} ${className}`}
    >
      {label}
    </span>
  );
}
