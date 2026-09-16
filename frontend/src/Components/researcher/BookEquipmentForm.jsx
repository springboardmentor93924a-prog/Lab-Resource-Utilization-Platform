import { useState, useMemo } from "react";
import {
  X, Calendar, Clock, ArrowRight, CheckCircle2, AlertTriangle,
  Building2, FlaskConical, MapPin, Users, DollarSign, ShieldAlert,
  Repeat, ChevronRight, RotateCcw, Sparkles
} from "lucide-react";
import { bookingApi } from "../../../api/bookingApi";
import { ApiError } from "../../../api/client";

export function BookEquipmentForm({ equipment, onClose, onBooked, onSwitchToWaitlist, toast }) {
  // Helper to format default dates (tomorrow 09:00 - 11:00)
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const nextMonth = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  }, []);

  const [form, setForm] = useState({
    startDate: tomorrow,
    startTime: "09:00",
    endDate: tomorrow,
    endTime: "11:00",
    purpose: "",
    isRecurring: false,
    frequency: "WEEKLY",
    recurrenceEndDate: nextMonth,
  });

  const [step, setStep] = useState("form"); // "form" | "confirm_review" | "success_pending" | "conflict"
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [savedBooking, setSavedBooking] = useState(null);
  const [conflictDetails, setConflictDetails] = useState(null);

  const setField = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  // Compute duration in hours and minutes
  const durationInfo = useMemo(() => {
    if (!form.startDate || !form.endDate || !form.startTime || !form.endTime) {
      return { valid: false, text: "—", totalHours: 0 };
    }
    const start = new Date(`${form.startDate}T${form.startTime}:00`);
    const end = new Date(`${form.endDate}T${form.endTime}:00`);
    const diffMs = end - start;
    if (diffMs <= 0) {
      return { valid: false, text: "Invalid (End time must be after Start time)", totalHours: 0 };
    }
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const totalHours = totalMinutes / 60.0;
    
    let text = "";
    if (hours > 0) text += `${hours} hr${hours > 1 ? "s" : ""}`;
    if (mins > 0) text += ` ${mins} min${mins > 1 ? "s" : ""}`;
    if (!text) text = "0 mins";

    return { valid: true, text: text.trim(), totalHours };
  }, [form.startDate, form.endDate, form.startTime, form.endTime]);

  // Compute estimated cost
  const estimatedCost = useMemo(() => {
    if (!durationInfo.valid || durationInfo.totalHours <= 0) return 0;
    const rate = equipment.hourlyRate ? Number(equipment.hourlyRate) : 0;
    return rate * durationInfo.totalHours;
  }, [durationInfo, equipment.hourlyRate]);

  // Validate and advance to review
  const handleProceedToReview = (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!form.startDate || !form.endDate) {
      setError("Please select both a start date and an end date.");
      return;
    }
    if (!durationInfo.valid) {
      setError("End time must be strictly after start time.");
      return;
    }
    if (!form.purpose.trim()) {
      setError("Please describe the purpose of this reservation.");
      return;
    }
    if (form.isRecurring && !form.recurrenceEndDate) {
      setError("Please specify a repeat-until end date for the recurring reservation.");
      return;
    }

    setStep("confirm_review");
  };

  // Final submission to POST /api/bookings
  const handleConfirmSubmit = async () => {
    setError("");
    setSubmitting(true);

    const startTime = `${form.startDate}T${form.startTime}:00`;
    const endTime = `${form.endDate}T${form.endTime}:00`;

    try {
      const payload = {
        equipmentId: equipment.equipmentId,
        startTime,
        endTime,
        purpose: form.purpose.trim(),
        isRecurring: form.isRecurring,
        recurrencePattern: form.isRecurring
          ? `${form.frequency}${form.recurrenceEndDate ? " until " + form.recurrenceEndDate : ""}`
          : null,
      };

      const booking = await bookingApi.create(payload);
      setSavedBooking(booking);
      setStep("success_pending");
      if (toast) {
        toast("Booking request submitted — awaiting Lab Manager approval.", "success");
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setConflictDetails({
          message: err.message || "This time slot conflicts with an existing reservation or equipment maintenance.",
          startTime,
          endTime,
        });
        setStep("conflict");
      } else {
        const message = err instanceof ApiError ? err.message : "Could not create booking. Please try again.";
        setError(message);
        setStep("form");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* ── Modal Top Header ────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
              <Calendar size={14} />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Book Equipment</h3>
              <p className="text-xs text-slate-500">Department Laboratory Reservation Request</p>
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

        {/* ── Real Equipment Header Banner (Always Visible) ─────────────── */}
        <div className="p-6 bg-gradient-to-b from-slate-50/50 to-white border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Real Equipment Image / Fallback */}
            {equipment.imageSecureUrl ? (
              <img
                src={equipment.imageSecureUrl}
                alt={equipment.name}
                className="h-20 w-24 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
              />
            ) : (
              <div className="h-20 w-24 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <FlaskConical size={28} />
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  {equipment.category || "General Lab Equipment"}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs font-mono text-slate-500">ID: {equipment.serialNumber || `#${equipment.equipmentId}`}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {equipment.status || "AVAILABLE"}
                </span>
              </div>

              <h2 className="text-lg font-extrabold text-slate-900 truncate">{equipment.name}</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                <p className="flex items-center gap-1 truncate">
                  <Building2 size={13} className="text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-700">Dept:</span> {equipment.departmentName || "Department"}
                </p>
                <p className="flex items-center gap-1 truncate">
                  <FlaskConical size={13} className="text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-700">Lab:</span> {equipment.labName || "Laboratory"}
                </p>
                <p className="flex items-center gap-1 truncate">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-700">Location:</span> {equipment.location || "On Campus"}
                </p>
                <p className="flex items-center gap-1 truncate">
                  <Users size={13} className="text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-700">Capacity per Slot:</span> {equipment.capacityPerSlot != null ? `${equipment.capacityPerSlot} user(s)` : "1 user"}
                </p>
              </div>
            </div>

            {/* Rate Tag */}
            <div className="self-start sm:self-center bg-blue-50/80 border border-blue-200/80 rounded-xl px-3.5 py-2 text-right shrink-0">
              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Hourly Rate</p>
              <p className="text-base font-black text-blue-900 mt-0.5">
                {equipment.hourlyRate != null && Number(equipment.hourlyRate) > 0
                  ? `₹${Number(equipment.hourlyRate).toFixed(2)}/hr`
                  : "Free / Internal"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Dynamic Flow Body ────────────────────────────────────────── */}
        <div className="p-6">
          
          {/* STEP 1 & 2: FORM ENTRY */}
          {step === "form" && (
            <form onSubmit={handleProceedToReview} className="space-y-6">
              
              {/* Section 1: Date & Time */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={14} className="text-blue-600" />
                    1. Reservation Date & Time
                  </label>
                  {durationInfo.valid && (
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                      Duration: {durationInfo.text}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  {/* Start Date & Time */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-600">Start Window</p>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={setField("startDate")}
                        required
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={form.startTime}
                        onChange={setField("startTime")}
                        required
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* End Date & Time */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-600">End Window</p>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">End Date</label>
                      <input
                        type="date"
                        value={form.endDate}
                        onChange={setField("endDate")}
                        required
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">End Time</label>
                      <input
                        type="time"
                        value={form.endTime}
                        onChange={setField("endTime")}
                        required
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Purpose */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-blue-600" />
                  2. Purpose of Booking
                </label>
                <textarea
                  value={form.purpose}
                  onChange={setField("purpose")}
                  rows={3}
                  required
                  placeholder="Describe why you need this equipment (e.g. PCR amplification for genetics thesis, sample prep, coursework)..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                />
              </div>

              {/* Section 3: Optional Recurring Booking */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.isRecurring}
                    onChange={setField("isRecurring")}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Repeat size={14} className="text-blue-600" />
                  Make this a recurring booking
                </label>

                {form.isRecurring && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 pl-6 border-t border-slate-200/60">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Frequency</label>
                      <select
                        value={form.frequency}
                        onChange={setField("frequency")}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Repeat Until</label>
                      <input
                        type="date"
                        value={form.recurrenceEndDate}
                        onChange={setField("recurrenceEndDate")}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Inline Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700 flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!durationInfo.valid || !form.purpose.trim()}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  Review Booking <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: REVIEW & CONFIRM SUMMARY */}
          {step === "confirm_review" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Review Reservation Details
                </h4>
                <p className="text-xs text-slate-500">
                  Please review your reservation parameters before sending the request to the Lab Manager.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200/80 text-xs">
                  <div>
                    <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Equipment</p>
                    <p className="font-bold text-slate-900 mt-0.5 text-sm">{equipment.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Department & Lab</p>
                    <p className="font-bold text-slate-800 mt-0.5">{equipment.departmentName || "Department"} · {equipment.labName || "Lab"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Start Schedule</p>
                    <p className="font-bold text-slate-800 mt-0.5">{form.startDate} at {form.startTime}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">End Schedule</p>
                    <p className="font-bold text-slate-800 mt-0.5">{form.endDate} at {form.endTime}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <p className="text-slate-400 font-semibold text-[10px] uppercase">Duration</p>
                    <p className="font-black text-slate-900 text-sm mt-0.5">{durationInfo.text}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <p className="text-slate-400 font-semibold text-[10px] uppercase">Estimated Cost</p>
                    <p className="font-black text-blue-600 text-sm mt-0.5">
                      {estimatedCost > 0 ? `₹${estimatedCost.toFixed(2)}` : "₹0.00 (Free)"}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <p className="text-slate-400 font-semibold text-[10px] uppercase">Booking Type</p>
                    <p className="font-bold text-slate-800 text-xs mt-1">
                      {form.isRecurring ? `Recurring (${form.frequency})` : "One-Time"}
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-xs">
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Stated Purpose</p>
                  <p className="font-medium text-slate-700 bg-white p-3 rounded-xl border border-slate-200 mt-1">
                    {form.purpose}
                  </p>
                </div>
              </div>

              {/* Lab Manager Notice Banner */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-800 flex items-start gap-3">
                <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900">Department Lab Manager Approval Required</p>
                  <p className="mt-0.5 text-amber-700 leading-relaxed">
                    Submitting this form places your booking in <span className="font-bold text-amber-900">PENDING APPROVAL</span>. The Lab Manager for the <strong>{equipment.departmentName || "relevant"}</strong> department will review your slot and purpose before confirmation.
                  </p>
                </div>
              </div>

              {/* Inline Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700 flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Confirmation Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Back to Edit
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={submitting}
                  className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  {submitting ? "Submitting to Lab Manager…" : "Confirm & Send Booking Request"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS / PENDING APPROVAL SCREEN */}
          {step === "success_pending" && savedBooking && (
            <div className="text-center py-4 space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
                <Clock size={32} />
              </div>

              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                  STATUS: PENDING APPROVAL
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                  Booking Request Submitted
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your reservation request has been submitted to the Lab Manager for{" "}
                  <strong>{equipment.departmentName || "your department"}</strong> for review.
                </p>
              </div>

              {/* Real Booking Response Info */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left text-xs space-y-3 max-w-lg mx-auto">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold">Booking Reference ID:</span>
                  <span className="font-mono font-bold text-slate-900">#{savedBooking.bookingId}</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold">Equipment:</span>
                  <span className="font-bold text-slate-900">{savedBooking.equipmentName || equipment.name}</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold">Reserved Window:</span>
                  <span className="font-bold text-slate-800">
                    {new Date(savedBooking.startTime).toLocaleString()} → {new Date(savedBooking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold">Estimated Cost:</span>
                  <span className="font-bold text-blue-700">
                    {savedBooking.estimatedCost != null ? `₹${Number(savedBooking.estimatedCost).toFixed(2)}` : "₹0.00"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Payment Status:</span>
                  <span className="font-bold text-slate-700">{savedBooking.paymentStatus || "NOT_APPLICABLE"}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onBooked(savedBooking)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  View in My Bookings <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CONFLICT HANDLING (409) / JOIN WAITLIST PROMPT */}
          {step === "conflict" && conflictDetails && (
            <div className="text-center py-4 space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
                <AlertTriangle size={32} />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900">
                  Time Slot Unavailable
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  {conflictDetails.message}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-left max-w-md mx-auto space-y-2">
                <p className="text-slate-500 font-semibold">Requested Window:</p>
                <p className="font-bold text-slate-900">
                  {form.startDate} ({form.startTime}) → {form.endDate} ({form.endTime})
                </p>
                <p className="text-slate-500 pt-1 text-[11px] leading-relaxed">
                  You can modify your requested times or join the queue to be notified immediately if this slot is freed.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={14} /> Change Time Slot
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onSwitchToWaitlist) {
                      onSwitchToWaitlist({
                        ...equipment,
                        preferredStartDate: form.startDate,
                        preferredStartTime: form.startTime,
                        preferredEndDate: form.endDate,
                        preferredEndTime: form.endTime,
                      });
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Users size={14} /> Join Waitlist for this Slot
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

