import { useState } from "react";
import {
  Camera,
  CircleCheckBig,
  Clock,
  CheckCircle2,
  Send,
  Wrench,
  Package,
  Play,
  FileText,
  AlertTriangle,
  ArrowLeft,
  XCircle,
} from "lucide-react";
import { StatusBadge } from "../../common/StatusBadge.jsx";

export default function MaintenanceDetails({
  task,
  equipment,
  onBack,
  onAcceptSchedule,
  onSubmitPlan,
  onStartWork,
  onCompleteWork,
  toast,
  onRefresh,
}) {
  const [showProposalForm, setShowProposalForm] = useState(false);

  // Form states for Repair Plan (ASSIGNED state)
  const [proposedStart, setProposedStart] = useState(
    task?.proposedStartDatetime
      ? String(task.proposedStartDatetime).slice(0, 16)
      : task?.managerTargetStartDatetime
      ? String(task.managerTargetStartDatetime).slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [proposedEnd, setProposedEnd] = useState(
    task?.proposedEndDatetime
      ? String(task.proposedEndDatetime).slice(0, 16)
      : task?.managerTargetEndDatetime
      ? String(task.managerTargetEndDatetime).slice(0, 16)
      : ""
  );
  const [delayReason, setDelayReason] = useState(task?.delayReason || "");
  const [requiresParts, setRequiresParts] = useState(Boolean(task?.requiresParts));
  const [partsDetails, setPartsDetails] = useState(task?.partsDetails || "");

  // Form states for Completion Report (IN_PROGRESS state)
  const [diagnosticNotes, setDiagnosticNotes] = useState(task?.diagnosticNotes || "");
  const [workPerformed, setWorkPerformed] = useState(task?.workPerformed || "");
  const [partsUsed, setPartsUsed] = useState(task?.partsUsed || "");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(task?.completionAttachmentSecureUrl || null);

  const [loadingAction, setLoadingAction] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!task) return null;

  const status = task.status || "ASSIGNED";

  // Handle Accept Schedule directly (Option A)
  const handleAcceptDirect = async () => {
    try {
      setLoadingAction(true);
      setErrorMsg("");
      if (onAcceptSchedule) {
        await onAcceptSchedule();
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      setErrorMsg(err.message || "Failed to accept target schedule.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle Repair Plan Submit (Option B)
  const handleSubmitPlan = async (e) => {
    if (e) e.preventDefault();
    if (!delayReason.trim()) {
      setErrorMsg("Technical justification / delay reason is required.");
      return;
    }
    if (!proposedStart) {
      setErrorMsg("Proposed start date and time is required.");
      return;
    }
    if (!proposedEnd) {
      setErrorMsg("Proposed completion date and time is required.");
      return;
    }
    if (new Date(proposedEnd) <= new Date(proposedStart)) {
      setErrorMsg("Proposed completion time must be after proposed start time.");
      return;
    }

    try {
      setLoadingAction(true);
      setErrorMsg("");
      await onSubmitPlan({
        proposedStartDateTime: proposedStart,
        proposedEndDateTime: proposedEnd,
        delayReason: delayReason.trim(),
        requiresParts,
        partsDetails: requiresParts ? partsDetails.trim() : null,
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit repair plan.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle Start Work
  const handleStart = async () => {
    try {
      setLoadingAction(true);
      setErrorMsg("");
      await onStartWork();
      if (onRefresh) onRefresh();
    } catch (err) {
      setErrorMsg(err.message || "Failed to start maintenance work.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle Photo Selection
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle Completion Report Submit
  const handleComplete = async (e) => {
    if (e) e.preventDefault();
    if (!workPerformed.trim()) {
      setErrorMsg("Please describe the work performed and corrective actions taken.");
      return;
    }

    try {
      setLoadingAction(true);
      setErrorMsg("");
      await onCompleteWork(
        {
          diagnosticNotes: diagnosticNotes.trim(),
          workPerformed: workPerformed.trim(),
          partsUsed: partsUsed.trim(),
        },
        photoFile
      );
      if (onRefresh) onRefresh();
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit completion report.");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Navigation */}
      <button
        onClick={onBack}
        className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} /> Back to Assigned Tasks
      </button>

      {/* Main Container */}
      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs space-y-6">
        {/* Header Summary */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                {task.maintenanceCode || `MR-${task.maintenanceId || task.id}`}
              </span>
              <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {task.departmentName || equipment?.department || "Department Equipment"}
              </span>
              {task.labName && (
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {task.labName}
                </span>
              )}
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1.5">
              {equipment?.name || task.equipmentName || "Laboratory Equipment"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Location: <strong className="text-slate-700">{equipment?.location || "Main Lab"}</strong>
              {task.requestedByName && (
                <span> · Reported by <strong className="text-slate-700">{task.requestedByName}</strong></span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={task.priority || "HIGH"} />
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-red-800 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Section 1: Problem Description & Manager Directives */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={14} /> Problem Description
            </p>
            <p className="text-xs text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
              {task.issueDescription || task.description || "No specific description provided."}
            </p>
          </div>

          <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-4 space-y-2">
            <p className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} className="text-blue-600" /> Manager Target Schedule & Directives
            </p>
            <div className="text-xs space-y-1 text-slate-700 bg-white p-3 rounded-lg border border-blue-100">
              <p>
                <span className="text-slate-500 font-medium">Target Start:</span>{" "}
                <strong className="text-slate-900">
                  {task.managerTargetStartDatetime
                    ? new Date(task.managerTargetStartDatetime).toLocaleString()
                    : "Not specified"}
                </strong>
              </p>
              <p>
                <span className="text-slate-500 font-medium">Target End:</span>{" "}
                <strong className="text-slate-900">
                  {task.managerTargetEndDatetime
                    ? new Date(task.managerTargetEndDatetime).toLocaleString()
                    : "Not specified"}
                </strong>
              </p>
              {task.managerInstructions && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <span className="text-slate-500 font-medium block">Instructions:</span>
                  <p className="italic text-slate-800 mt-0.5">"{task.managerInstructions}"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PHASE 1: ASSIGNED — 2 Mutually Exclusive Options                           */}
        {/* ========================================================================= */}
        {status === "ASSIGNED" && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-5 space-y-5">
            <div className="border-b border-blue-200 pb-3">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Wrench size={16} className="text-blue-600" /> Step 1: Respond to Assigned Work Order
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Review the manager's target schedule above. You can directly accept it to begin work immediately, or request an alternate schedule if adjustments/parts are required.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Option A: Accept Schedule */}
              <div className="rounded-xl border border-emerald-200 bg-white p-4 space-y-3 flex flex-col justify-between shadow-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 size={16} /> Option A: Accept Target Schedule
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Adopt the manager's schedule as authoritative. Work will be immediately approved and ready to start without requiring further manager sign-off.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAcceptDirect}
                  disabled={loadingAction}
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  {loadingAction ? "Accepting..." : "Accept Schedule & Ready Work"}
                </button>
              </div>

              {/* Option B: Request Schedule Change Toggle */}
              <div className="rounded-xl border border-amber-200 bg-white p-4 space-y-3 flex flex-col justify-between shadow-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                    <Clock size={16} /> Option B: Propose Schedule Change
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    If you require more time, have overlapping commitments, or need external vendor parts, submit an alternate plan with justification for manager review.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProposalForm(!showProposalForm)}
                  className={`w-full rounded-xl font-bold text-xs py-2.5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    showProposalForm
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                  }`}
                >
                  <Wrench size={14} />
                  {showProposalForm ? "Hide Proposal Form" : "Request Schedule Change"}
                </button>
              </div>
            </div>

            {/* Proposal Form (Rendered when Option B is chosen) */}
            {showProposalForm && (
              <form onSubmit={handleSubmitPlan} className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-4 mt-3">
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Propose Alternate Timeline & Spare Parts Details
                </h4>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Proposed Start Date & Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={proposedStart}
                      onChange={(e) => setProposedStart(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 font-medium focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Proposed Completion Date & Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={proposedEnd}
                      onChange={(e) => setProposedEnd(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 font-medium focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Technical Justification / Delay Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={delayReason}
                    onChange={(e) => setDelayReason(e.target.value)}
                    placeholder="Explain technical rationale (e.g., IC soldering, recalibration steps, supplier procurement)..."
                    className="w-full text-xs rounded-lg border border-slate-300 bg-white p-3 font-medium focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={requiresParts}
                      onChange={(e) => setRequiresParts(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="flex items-center gap-1">
                      <Package size={14} className="text-purple-600" /> External Vendor Spare Parts Required
                    </span>
                  </label>

                  {requiresParts && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Spare Parts Details</label>
                      <input
                        type="text"
                        value={partsDetails}
                        onChange={(e) => setPartsDetails(e.target.value)}
                        placeholder="List required parts (e.g., Optical sensor lens, Relay switch 24V)..."
                        className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 font-medium focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <Send size={14} />
                    {loadingAction ? "Submitting Plan..." : "Submit Repair Plan to Lab Manager"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 2: PENDING_MANAGER_REVIEW — Locked Waiting State                     */}
        {/* ========================================================================= */}
        {status === "PENDING_MANAGER_REVIEW" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-amber-600" />
              <h3 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
                Step 2: Repair Plan Submitted — Awaiting Lab Manager Review
              </h3>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              You have requested a schedule change. The Lab Manager will review your proposed timeline and approve the authoritative schedule. Maintenance actions are locked until approved.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-xs bg-white/80 p-3.5 rounded-lg border border-amber-200">
              <div>
                <span className="text-slate-500 font-medium">Proposed Start:</span>{" "}
                <strong className="text-slate-900">
                  {task.proposedStartDatetime ? new Date(task.proposedStartDatetime).toLocaleString() : "—"}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Proposed Completion:</span>{" "}
                <strong className="text-slate-900">
                  {task.proposedEndDatetime ? new Date(task.proposedEndDatetime).toLocaleString() : "—"}
                </strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 font-medium">Delay Justification:</span>{" "}
                <strong className="text-slate-800">{task.delayReason || "—"}</strong>
              </div>
              {task.requiresParts && (
                <div className="sm:col-span-2">
                  <span className="text-slate-500 font-medium">Spare Parts Required:</span>{" "}
                  <strong className="text-purple-700">{task.partsDetails || "Yes (details provided)"}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 3: ACCEPTED / FINALIZED — Ready to Start Work                        */}
        {/* ========================================================================= */}
        {(status === "ACCEPTED" || status === "FINALIZED") && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <h3 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                {status === "ACCEPTED"
                  ? "Schedule Accepted — Ready to Start Maintenance"
                  : "Repair Schedule Approved by Manager — Ready to Start Maintenance"}
              </h3>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              The repair schedule is confirmed. You may now click "Start Maintenance Work" to begin physical repairs.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-xs bg-white/80 p-3.5 rounded-lg border border-emerald-200">
              <div>
                <span className="text-slate-500 font-medium">Authoritative Start:</span>{" "}
                <strong className="text-slate-900">
                  {task.finalStartDatetime
                    ? new Date(task.finalStartDatetime).toLocaleString()
                    : task.managerTargetStartDatetime
                    ? new Date(task.managerTargetStartDatetime).toLocaleString()
                    : "—"}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Authoritative Completion:</span>{" "}
                <strong className="text-slate-900">
                  {task.finalEndDatetime
                    ? new Date(task.finalEndDatetime).toLocaleString()
                    : task.managerTargetEndDatetime
                    ? new Date(task.managerTargetEndDatetime).toLocaleString()
                    : "—"}
                </strong>
              </div>
              {task.managerNotes && (
                <div className="sm:col-span-2">
                  <span className="text-slate-500 font-medium">Manager Directive Notes:</span>{" "}
                  <strong className="text-emerald-900">{task.managerNotes}</strong>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-emerald-100">
              <p className="text-[11px] text-slate-500">
                Clicking "Start Maintenance Work" will transition equipment status to <strong>UNDER_MAINTENANCE</strong>.
              </p>
              <button
                type="button"
                onClick={handleStart}
                disabled={loadingAction}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Play size={14} />
                {loadingAction ? "Starting Work..." : "Start Maintenance Work"}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 4: IN_PROGRESS — Perform Work & Submit Completion Report             */}
        {/* ========================================================================= */}
        {(status === "IN_PROGRESS" || status === "REJECTED") && (
          <form onSubmit={handleComplete} className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-indigo-200 pb-3">
              <Wrench size={16} className="text-indigo-600" />
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Step 4: Maintenance In Progress — Submit Completion Report
                </h3>
                <p className="text-[11px] text-slate-500">
                  Perform necessary repairs, record diagnostics & parts used, attach a verification photo, and submit for Manager verification.
                </p>
              </div>
            </div>

            {status === "REJECTED" && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-red-700">
                  <XCircle size={15} /> Previous Completion Report Rejected by Lab Manager
                </p>
                <p>
                  <strong>Reason:</strong> {task.rejectionReason || "Please review notes and re-verify equipment function."}
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Diagnostic Findings & Inspection Notes
              </label>
              <textarea
                rows={2}
                value={diagnosticNotes}
                onChange={(e) => setDiagnosticNotes(e.target.value)}
                placeholder="Details of physical fault, measured voltage/tolerances, root cause..."
                className="w-full text-xs rounded-lg border border-slate-300 bg-white p-3 font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Work Performed & Corrective Actions <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={workPerformed}
                onChange={(e) => setWorkPerformed(e.target.value)}
                placeholder="Comprehensive description of repairs made, recalibration steps, safety checks executed..."
                className="w-full text-xs rounded-lg border border-slate-300 bg-white p-3 font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Parts & Consumables Used</label>
              <input
                type="text"
                value={partsUsed}
                onChange={(e) => setPartsUsed(e.target.value)}
                placeholder="e.g. 1x Power supply board, thermal paste, fuse 10A..."
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Completion Verification Photo (Optional)</label>
              <label className="w-full rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors py-4 px-4 flex flex-col items-center justify-center gap-1.5 text-slate-500 cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                <Camera size={20} className="text-indigo-600" />
                <span className="text-xs font-medium text-slate-700">
                  {photoFile ? photoFile.name : "Click to select or capture repair photo"}
                </span>
                <span className="text-[11px] text-slate-400">JPG, PNG, WebP up to 10MB</span>
              </label>
              {photoPreview && (
                <div className="mt-3 flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 w-max">
                  <img src={photoPreview} alt="Preview" className="h-16 w-16 object-cover rounded-md border" />
                  <span className="text-xs text-slate-600 font-medium">{photoFile ? photoFile.name : "Uploaded Photo"}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-indigo-100">
              <p className="text-[11px] text-slate-500">
                Submitting will place work order in <strong>PENDING_VERIFICATION</strong> for Manager sign-off.
              </p>
              <button
                type="submit"
                disabled={loadingAction}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Send size={14} />
                {loadingAction ? "Submitting Report..." : "Submit Maintenance Completion Report"}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* PHASE 5: PENDING_VERIFICATION — Waiting for Manager Verification           */}
        {/* ========================================================================= */}
        {status === "PENDING_VERIFICATION" && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-blue-600" />
              <h3 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                Step 5: Completion Report Submitted — Awaiting Manager Verification
              </h3>
            </div>
            <p className="text-xs text-blue-900 leading-relaxed">
              Your completion report is under review by the Lab Manager. Once verified, the manager will close the work order and return the equipment to service.
            </p>
            <div className="space-y-2 text-xs bg-white/80 p-4 rounded-lg border border-blue-200">
              {task.diagnosticNotes && (
                <div>
                  <span className="text-slate-500 font-medium">Diagnostic Notes:</span>
                  <p className="text-slate-800 font-semibold mt-0.5">{task.diagnosticNotes}</p>
                </div>
              )}
              {task.workPerformed && (
                <div>
                  <span className="text-slate-500 font-medium">Work Performed:</span>
                  <p className="text-slate-800 font-semibold mt-0.5">{task.workPerformed}</p>
                </div>
              )}
              {task.partsUsed && (
                <div>
                  <span className="text-slate-500 font-medium">Parts Used:</span>
                  <p className="text-slate-800 font-semibold mt-0.5">{task.partsUsed}</p>
                </div>
              )}
              {task.completionAttachmentSecureUrl && (
                <div className="pt-2">
                  <span className="text-slate-500 font-medium block mb-1">Completion Photo:</span>
                  <a href={task.completionAttachmentSecureUrl} target="_blank" rel="noreferrer">
                    <img
                      src={task.completionAttachmentSecureUrl}
                      alt="Repair Completion"
                      className="h-28 w-auto rounded-lg border border-slate-200 shadow-xs hover:opacity-90"
                    />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 6: COMPLETED — Permanent Record Summary                              */}
        {/* ========================================================================= */}
        {status === "COMPLETED" && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <CircleCheckBig size={18} className="text-emerald-600" />
              <h3 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                Work Order Completed & Verified
              </h3>
            </div>
            <div className="space-y-2 text-xs bg-white/80 p-4 rounded-lg border border-emerald-200">
              <p>
                <span className="text-slate-500 font-medium">Completed Date:</span>{" "}
                <strong className="text-slate-900">{task.completedDate || "Recorded"}</strong>
              </p>
              {task.downtimeHours != null && (
                <p>
                  <span className="text-slate-500 font-medium">Total Downtime:</span>{" "}
                  <strong className="text-slate-900">{task.downtimeHours} hours</strong>
                </p>
              )}
              {task.workPerformed && (
                <div>
                  <span className="text-slate-500 font-medium">Work Performed:</span>
                  <p className="text-slate-800 font-semibold mt-0.5">{task.workPerformed}</p>
                </div>
              )}
              {task.partsUsed && (
                <div>
                  <span className="text-slate-500 font-medium">Parts Used:</span>
                  <p className="text-slate-800 font-semibold mt-0.5">{task.partsUsed}</p>
                </div>
              )}
              {task.completionAttachmentSecureUrl && (
                <div className="pt-2">
                  <span className="text-slate-500 font-medium block mb-1">Verification Attachment:</span>
                  <a href={task.completionAttachmentSecureUrl} target="_blank" rel="noreferrer">
                    <img
                      src={task.completionAttachmentSecureUrl}
                      alt="Verified Maintenance"
                      className="h-28 w-auto rounded-lg border border-slate-200 shadow-xs hover:opacity-90"
                    />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

