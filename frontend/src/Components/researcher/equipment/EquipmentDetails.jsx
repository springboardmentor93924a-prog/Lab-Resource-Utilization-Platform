import { useEffect, useState } from "react";
import {
  ArrowLeft, MapPin, ShieldCheck, Calendar,
  Building2, FlaskConical, DollarSign, Info, Tag, Hash,
  CheckCircle, Users, XCircle
} from "lucide-react";
import { equipmentApi } from "../../../api/equipmentApi";

const CALIBRATION_LABEL = {
  VALID:        { text: "Calibration Valid",        tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  DUE_SOON:     { text: "Calibration Due Soon",     tone: "text-amber-700 bg-amber-50 border-amber-200"  },
  OVERDUE:      { text: "Calibration Overdue",      tone: "text-red-700 bg-red-50 border-red-200"    },
  NOT_RECORDED: { text: "No Calibration on Record", tone: "text-slate-600 bg-slate-50 border-slate-200"  },
};

export function EquipmentDetails({ equipmentId, onBack, onBook, onJoinWaitlist, toast }) {
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    setLoading(true);
    equipmentApi
      .getById(equipmentId)
      .then(setEquipment)
      .catch((e) => toast(e.message || "Could not load equipment details.", "error"))
      .finally(() => setLoading(false));
  }, [equipmentId, toast]);

  if (loading) {
    return (
      <div className="py-16 text-center text-sm font-medium text-slate-500">
        Loading equipment details...
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="max-w-2xl mx-auto rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
        Equipment not found or you are not authorized to view it.
        <div className="mt-4">
          <button onClick={onBack} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            Back to search
          </button>
        </div>
      </div>
    );
  }

  const calibration = CALIBRATION_LABEL[equipment.calibrationStatus] ?? CALIBRATION_LABEL.NOT_RECORDED;
  const canBook     = equipment.status === "AVAILABLE";
  const canWaitlist = equipment.status === "BOOKED";

  // Parse specifications JSON if present
  let specs = null;
  if (equipment.specifications) {
    try {
      specs = typeof equipment.specifications === "string"
        ? JSON.parse(equipment.specifications)
        : equipment.specifications;
    } catch {
      specs = { note: equipment.specifications };
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Back Button ──────────────────────────────────────────────────────── */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={16} /> Back to search
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* ── Equipment Image Banner ────────────────────────────────────────── */}
        {equipment.imageSecureUrl && (
          <div className="h-64 w-full overflow-hidden bg-slate-100 border-b border-slate-200">
            <img
              src={equipment.imageSecureUrl}
              alt={equipment.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="p-8 space-y-8">
          {/* ── Header: Category, Name, Model, Status ───────────────────────── */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                {equipment.category || "NOT RECORDED"}
              </p>
              <h1 className="mt-1.5 text-2xl md:text-3xl font-extrabold text-slate-900">{equipment.name}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {[equipment.manufacturer, equipment.model].filter(Boolean).join(" · ") || "NOT RECORDED"}
              </p>
            </div>
            <StatusBadge status={equipment.status} />
          </div>

          {/* ── Section: Description ─────────────────────────────────────────── */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h2>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/60 p-4 rounded-xl border border-slate-100">
              {equipment.description || "NOT RECORDED"}
            </p>
          </div>

          {/* ── Section: Organization & Location ─────────────────────────────── */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Organization & Location</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Detail icon={Building2} label="Institution" value={equipment.institutionName || "NOT RECORDED"} />
              <Detail icon={Building2} label="Department" value={equipment.departmentName || "NOT RECORDED"} />
              <Detail icon={FlaskConical} label="Laboratory" value={equipment.labName || "NOT RECORDED"} />
              <Detail icon={MapPin} label="Location" value={equipment.location || "NOT RECORDED"} />
            </div>
          </div>

          {/* ── Section: Technical & Hardware Details ────────────────────────── */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Hardware Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              <Detail icon={Tag} label="Manufacturer" value={equipment.manufacturer || "NOT RECORDED"} />
              <Detail icon={Tag} label="Model" value={equipment.model || "NOT RECORDED"} />
              <Detail icon={Hash} label="Serial Number" value={equipment.serialNumber || "NOT RECORDED"} />
              <Detail icon={ShieldCheck} label="Condition" value={equipment.condition || "NOT RECORDED"} />
              <Detail icon={Users} label="Capacity / Slot" value={equipment.capacityPerSlot != null ? `${equipment.capacityPerSlot} user(s)` : "NOT RECORDED"} />
              <Detail
                icon={equipment.isShareable ? CheckCircle : XCircle}
                label="Sharing Status"
                value={equipment.isShareable ? "Available for Inter-Lab Sharing" : "Internal Department Only"}
                valueClass={equipment.isShareable ? "text-emerald-700" : "text-slate-700"}
              />
            </div>
          </div>

          {/* ── Section: Pricing ─────────────────────────────────────────────── */}
          {(equipment.hourlyRate != null || equipment.externalHourlyRate != null) && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">
                <DollarSign size={15} /> Pricing Rates
              </div>
              <div className="flex flex-wrap gap-8">
                {equipment.hourlyRate != null && (
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Internal Rate</p>
                    <p className="text-xl font-black text-slate-900 mt-0.5">
                      ₹{Number(equipment.hourlyRate).toFixed(2)}
                      <span className="text-xs font-normal text-slate-500"> / hour</span>
                    </p>
                  </div>
                )}
                {equipment.externalHourlyRate != null && (
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">External / MOU Rate</p>
                    <p className="text-xl font-black text-slate-900 mt-0.5">
                      ₹{Number(equipment.externalHourlyRate).toFixed(2)}
                      <span className="text-xs font-normal text-slate-500"> / hour</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Section: Specifications ──────────────────────────────────────── */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Technical Specifications</h2>
            {specs && Object.keys(specs).length > 0 ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5">
                <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
                  {Object.entries(specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between sm:justify-start sm:gap-4 py-1 border-b border-slate-100/80 last:border-0">
                      <dt className="text-slate-500 font-medium capitalize">{key.replace(/_/g, " ")}:</dt>
                      <dd className="font-bold text-slate-900">{String(val)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                NOT RECORDED
              </p>
            )}
          </div>

          {/* ── Section: Calibration Information ─────────────────────────────── */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Calibration Status</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 shrink-0">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Calibration Status</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{calibration.text}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 shrink-0">
                  <Calendar size={18} />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Next Due Date</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {equipment.nextCalibrationDue
                      ? new Date(equipment.nextCalibrationDue).toLocaleDateString()
                      : "NOT RECORDED"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Action Buttons: Book Now or Join Waitlist ONLY ────────────────── */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-4">
            {canBook && (
              <button
                onClick={() => onBook(equipment)}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-8 py-3.5 shadow-md hover:shadow-lg transition-all"
              >
                Book Now
              </button>
            )}
            {canWaitlist && (
              <button
                onClick={() => onJoinWaitlist(equipment)}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-8 py-3.5 shadow-md hover:shadow-lg transition-all"
              >
                Join Waitlist
              </button>
            )}
            {!canBook && !canWaitlist && equipment.status !== "RETIRED" && (
              <span className="rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm font-semibold px-6 py-3.5">
                Not Available for Booking
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value, valueClass = "text-slate-900" }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 shrink-0">
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className={`text-sm font-bold truncate ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    AVAILABLE:         "bg-emerald-50 text-emerald-700 border-emerald-200",
    BOOKED:            "bg-amber-50 text-amber-700 border-amber-200",
    UNDER_MAINTENANCE: "bg-red-50 text-red-700 border-red-200",
    OUT_OF_SERVICE:    "bg-slate-100 text-slate-500 border-slate-200",
    RETIRED:           "bg-slate-200 text-slate-400 border-slate-300",
  };
  return (
    <span className={`rounded-full border px-3.5 py-1 text-xs font-bold uppercase tracking-wider ${map[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {status ? status.replace(/_/g, " ") : "UNKNOWN"}
    </span>
  );
}
