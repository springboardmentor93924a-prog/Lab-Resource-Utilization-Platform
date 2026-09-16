/* ------------------------------------------------------------------ */
/*  Stat card — used on every role's dashboard home view               */
/* ------------------------------------------------------------------ */
export function StatCard({ icon: Icon, label, value, tone = "text-blue-600", bg = "bg-blue-50", onClick }) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={`rounded-2xl border border-slate-200 bg-white p-5 text-left w-full ${onClick ? "hover:border-blue-300 hover:shadow-md transition-all" : ""}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        {Icon && (
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg} ${tone}`}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <p className={`mt-2 text-2xl font-extrabold ${tone}`}>{value}</p>
    </Comp>
  );
}
