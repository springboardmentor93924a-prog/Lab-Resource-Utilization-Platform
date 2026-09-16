import { useState, useMemo } from "react";
import {
  X, Users, Clock, Building2, FlaskConical, MapPin,
  CheckCircle2, AlertTriangle, ChevronRight, Info
} from "lucide-react";
import { waitlistApi } from "../../../api/waitlistApi";
import { ApiError } from "../../../api/client";

export function WaitlistModal({ equipment, onClose, onJoined, toast }) {
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const [form, setForm] = useState({
    startDate: equipment?.preferredStartDate || tomorrow,
    startTime: equipment?.preferredStartTime || "09:00",
    endDate: equipment?.preferredEndDate || tomorrow,
    endTime: equipment?.preferredEndTime || "11:00",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [joinedEntry, setJoinedEntry] = useState(null);

  const setField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError("");
  };

  const durationInfo = useMemo(() => {
    if (!form.startDate || !form.endDate || !form.startTime || !form.endTime) {
      return { valid: false, text: "—" };
    }
    const start = new Date(`${form.startDate}T${form.startTime}:00`);
    const end = new Date(`${form.endDate}T${form.endTime}:00`);
    const diffMs = end - start;
    if (diffMs <= 0) {
      return { valid: false, text: "Invalid (End time must be after Start time)" };
    }
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    let text = "";
    if (hours > 0) text += `${hours} hr${hours > 1 ? "s" : ""}`;
    if (mins > 0) text += ` ${mins} min${mins > 1 ? "s" : ""}`;
    return { valid: true, text: text.trim() || "0 mins" };
  }, [form.startDate, form.endDate, form.startTime, form.endTime]);

  const submit = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!form.startDate || !form.endDate) {
      setError("Please choose a preferred start and end date.");
      return;
    }
    if (!durationInfo.valid) {
      setError("End time must be strictly after start time.");
      return;
    }

    const requestedStartTime = `${form.startDate}T${form.startTime}:00`;
    const requestedEndTime = `${form.endDate}T${form.endTime}:00`;

    setSubmitting(true);
    try {
      const entry = await waitlistApi.join({
        equipmentId: equipment.equipmentId,
        requestedStartTime,
        requestedEndTime,
      });
      setJoinedEntry(entry);
      if (toast) {
        toast(`You're #${entry.position} on the waitlist for ${equipment.name}.`, "success");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not join waitlist.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* ── Modal Header ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white font-bold text-xs">
              <Users size={14} />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Join Waitlist</h3>
              <p className="text-xs text-slate-500">Queue for busy or conflicting equipment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Real Equipment Header Banner ─────────────────────────────── */}
        <div className="p-5 bg-gradient-to-b from-slate-50/50 to-white border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            {equipment.imageSecureUrl ? (
              <img
                src={equipment.imageSecureUrl}
                alt={equipment.name}
                className="h-16 w-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <FlaskConical size={24} />
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                  {equipment.category || "Lab Equipment"}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] font-mono text-slate-500">ID: {equipment.serialNumber || `#${equipment.equipmentId}`}</span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 truncate">{equipment.name}</h4>
              <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                <Building2 size={12} className="text-slate-400 shrink-0" />
                <span>{equipment.departmentName || "Department"}</span>
                <span className="text-slate-300">·</span>
                <MapPin size={12} className="text-slate-400 shrink-0" />
                <span>{equipment.location || "On Campus"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── Modal Content ────────────────────────────────────────────── */}
        <div className="p-6">
          {!joinedEntry ? (
            <form onSubmit={submit} className="space-y-5">
              <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/60 border border-amber-200/60 p-3.5 rounded-xl">
                This equipment is occupied or has conflicting bookings. Select your preferred usage window. If the slot opens up, you will be offered the spot and have <strong>30 minutes</strong> to claim it.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-slate-700">Preferred Start</p>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={setField("startDate")}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Time</label>
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={setField("startTime")}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-slate-700">Preferred End</p>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={setField("endDate")}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Time</label>
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={setField("endTime")}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>
              </div>

              {durationInfo.valid && (
                <div className="flex items-center justify-between text-xs px-1 text-slate-600">
                  <span>Requested Window Duration:</span>
                  <span className="font-bold text-slate-900">{durationInfo.text}</span>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !durationInfo.valid}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  {submitting ? "Joining Queue…" : "Confirm Waitlist Entry"}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-3 space-y-5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
                <CheckCircle2 size={28} />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Joined Waitlist Successfully
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  You have been placed in the reservation queue for <strong>{equipment.name}</strong>.
                </p>
              </div>

              {/* Real Queue Response Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-left space-y-2.5 max-w-sm mx-auto">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold">Your Queue Position:</span>
                  <span className="font-extrabold text-base text-amber-600">#{joinedEntry.position}</span>
                </div>
                {joinedEntry.estimatedWait && (
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-semibold">Estimated Wait:</span>
                    <span className="font-bold text-slate-800">{joinedEntry.estimatedWait}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Requested Slot:</span>
                  <span className="font-bold text-slate-800">
                    {form.startDate} ({form.startTime})
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-left text-[11px] text-blue-900 flex items-start gap-2">
                <Info size={15} className="text-blue-600 shrink-0 mt-0.5" />
                <p>
                  You will receive an in-app push notification when an overlapping booking cancels. You will have 30 minutes to confirm your reservation.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onJoined(joinedEntry)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-1.5"
                >
                  View My Waitlists <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

