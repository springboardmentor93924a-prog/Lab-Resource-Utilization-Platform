import { Tag, MapPin } from "lucide-react";
import { StatusBadge } from "../../common/StatusBadge.jsx";

/* ================================================================== */
/*  Researcher -> Equipment -> Equipment Card (grid item)              */
/*  Extracted from the inline card markup inside the old SearchView.   */
/* ================================================================== */
export default function EquipmentCard({ equipment: e, onViewDetails, onBookNow, onJoinWaitlist }) {
  const imageUrl = e.imageSecureUrl || (typeof e.image === "string" && e.image.startsWith("http") ? e.image : null);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {imageUrl ? (
          <div className="relative mb-3">
            <img src={imageUrl} alt={e.name} className="w-full h-36 object-cover rounded-xl border border-slate-200" />
            <div className="absolute top-2 right-2">
              <StatusBadge status={e.status} />
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between mb-2">
            <span className="text-3xl">🔬</span>
            <StatusBadge status={e.status} />
          </div>
        )}
        <h3 className="mt-3 text-sm font-extrabold text-slate-900 leading-snug">{e.name}</h3>
        <p className="mt-1 text-xs font-semibold text-blue-600">{e.category || "NOT RECORDED"}</p>
        <p className="mt-1 text-xs text-slate-600">Dept: <span className="font-medium text-slate-800">{e.departmentName || e.department || "NOT RECORDED"}</span></p>
        <p className="mt-0.5 text-xs text-slate-600">Lab: <span className="font-medium text-slate-800">{e.labName || "NOT RECORDED"}</span></p>
        {e.location && (
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
            <MapPin size={11} className="text-slate-400" /> {e.location}
          </p>
        )}
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Hourly Rate</span>
          <span className="text-xs font-extrabold text-emerald-700">
            {e.hourlyRate != null ? `₹${e.hourlyRate}/hr` : "NOT RECORDED"}
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={() => onViewDetails(e.id)} className="flex-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 transition-colors">
          View Details
        </button>
        {e.status === "AVAILABLE" ? (
          <button onClick={() => onBookNow(e.id)} className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 transition-colors">
            Book Now
          </button>
        ) : e.status === "BOOKED" ? (
          <button onClick={() => onJoinWaitlist(e.id)} className="flex-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-2 transition-colors">
            Join Waitlist
          </button>
        ) : (
          <button disabled className="flex-1 rounded-lg bg-slate-100 text-slate-400 text-xs font-semibold py-2 cursor-not-allowed">
            Unavailable
          </button>
        )}
      </div>
    </div>
  );
}
