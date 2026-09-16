import { useMemo, useState } from "react";
import { Wrench, CircleCheckBig, Clock, Eye, CheckCircle2, XCircle, AlertTriangle, Send } from "lucide-react";
import { ViewHeader } from "../../common/ViewHeader.jsx";
import { EmptyState } from "../../common/EmptyState.jsx";
import { StatusBadge } from "../../common/StatusBadge.jsx";
import { Modal } from "../../common/Modal.jsx";
import { inputClass } from "../../common/Field.jsx";
import AssignMaintenance from "./AssignMaintenance.jsx";

/* ================================================================== */
/*  Manager -> Maintenance -> Maintenance Management (Oversight)       */
/* ================================================================== */
export default function MaintenanceManagement({ maintenance = [], equipmentById = {}, onAssign, onApproveEstimate, onRejectEstimate }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const unassigned = maintenance.filter((m) => !m.assignedTechnicianId && !m.assignedTechnicianEmail && m.status === "OPEN");
  const assigned = maintenance.filter((m) => m.assignedTechnicianId || m.assignedTechnicianEmail || m.assignedTechnicianName || m.status === "WAITING_MANAGER_APPROVAL" || m.status === "REPAIR_IN_PROGRESS" || m.status === "FINAL_MANAGER_DIRECTIVE");

  return (
    <div>
      <ViewHeader title="Maintenance Oversight" subtitle="Review reported issues and assign work to lab technicians." />

      <h2 className="text-sm font-bold text-slate-900 mb-3">Unassigned Issues ({unassigned.length})</h2>
      {unassigned.length === 0 ? (
        <EmptyState icon={CircleCheckBig} title="No unassigned issues" />
      ) : (
        <div className="space-y-3 mb-8">
          {unassigned.map((m) => (
            <AssignMaintenance key={m.id} task={m} equipment={equipmentById[m.equipmentId]} onAssign={onAssign} />
          ))}
        </div>
      )}

      <h2 className="text-sm font-bold text-slate-900 mb-3">Assigned & Maintenance Requests ({assigned.length})</h2>
      {assigned.length === 0 ? (
        <EmptyState icon={Wrench} title="No tasks assigned yet" />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="text-left font-semibold px-5 py-3">Ticket ID</th>
                <th className="text-left font-semibold px-5 py-3">Equipment</th>
                <th className="text-left font-semibold px-5 py-3">Technician</th>
                <th className="text-left font-semibold px-5 py-3">Target End Date</th>
                <th className="text-left font-semibold px-5 py-3">Status</th>
                <th className="text-right font-semibold px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assigned.map((m) => {
                const techName = m.assignedTechnicianName || "Unassigned";
                const isWaiting = m.status === "WAITING_MANAGER_APPROVAL";
                return (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-blue-600">{m.id}</td>
                    <td className="px-5 py-3.5 text-slate-900 font-semibold">{equipmentById[m.equipmentId]?.name || m.equipmentName || "Equipment Asset"}</td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">{techName}</td>
                    <td className="px-5 py-3.5 text-slate-800 font-bold">{m.targetEndDate || m.dueDate || "—"}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={m.status} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedTask(m)}
                        className={`rounded-lg text-xs font-bold px-3 py-1.5 transition-colors inline-flex items-center gap-1.5 ${
                          isWaiting
                            ? "bg-amber-500 hover:bg-amber-600 text-white shadow-xs animate-pulse cursor-pointer"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 cursor-pointer"
                        }`}
                      >
                        {isWaiting ? <Clock size={13} /> : <Eye size={13} />}
                        {isWaiting ? "Review Plan" : "View Details"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Plan Modal */}
      {selectedTask && (
        <ReviewEstimateModal
          task={selectedTask}
          equipment={equipmentById[selectedTask.equipmentId]}
          onClose={() => setSelectedTask(null)}
          onApprove={(id) => {
            if (onApproveEstimate) onApproveEstimate(id);
            setSelectedTask(null);
          }}
          onReject={(id, reason, date) => {
            if (onRejectEstimate) onRejectEstimate(id, reason, date);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}

function ReviewEstimateModal({ task: initialTask, equipment, onClose, onApprove, onReject }) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const task = initialTask;
  const displayedDelayReason = task.delayReason || equipment?.delayReason || task.notes || "No delay justification provided.";
  const [forcedDate, setForcedDate] = useState(task.targetEndDate || task.dueDate || new Date().toISOString().slice(0, 10));

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    onReject(task.id, rejectionReason.trim(), forcedDate);
  };

  return (
    <Modal
      title="Review Technician Repair Estimate & Justification"
      subtitle={`Ticket: ${task.id} · Equipment: ${equipment?.name || task.equipmentName || "Asset"}`}
      onClose={onClose}
      wide
    >
      <div className="space-y-4 text-xs">
        {/* Ticket Header */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <p className="font-extrabold text-slate-900 text-sm">{equipment?.name || task.equipmentName}</p>
            <p className="text-slate-500">📍 {equipment?.location || "Laboratory"} · Reported by: <strong>{task.reportedBy || "Lab User"}</strong></p>
          </div>
          <StatusBadge status={task.status} />
        </div>

        {/* Issue Description */}
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 space-y-1">
          <p className="text-[10px] font-extrabold text-amber-900 uppercase tracking-widest">Reported Problem Description</p>
          <p className="text-slate-800 font-medium leading-relaxed">{task.description}</p>
        </div>

        {/* Technician Repair Plan Card */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-3">
          <p className="text-xs font-extrabold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
            <Wrench size={14} className="text-blue-600" /> Technician Maintenance Submission
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Technician</p>
              <p className="font-extrabold text-slate-900 mt-0.5">{task.assignedTechnicianName || "Unassigned"}</p>
              <p className="text-slate-600 font-medium">{task.assignedTechnicianEmail || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Target Completion Date (End Date)</p>
              <p className="font-extrabold text-blue-900 text-sm mt-0.5">{task.targetEndDate || task.dueDate || "—"}</p>
              <p className="text-slate-500">Start Date: <strong>{task.startDate || "—"}</strong></p>
            </div>
          </div>

          <div className="pt-2 border-t border-blue-200">
            <p className="text-[10px] font-bold text-blue-900 uppercase">Technician Delay Justification Text</p>
            <p className="text-xs text-slate-900 font-medium italic mt-1 bg-white p-2.5 rounded-lg border border-blue-200 leading-relaxed">
              "{displayedDelayReason}"
            </p>
          </div>
        </div>

        {/* Reject Override Form */}
        {showRejectForm ? (
          <form onSubmit={handleRejectSubmit} className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
            <p className="text-xs font-extrabold text-red-900 uppercase tracking-wide">
              Reject Technician Timeline & Fix Binding Mandatory Completion Date
            </p>

            <div>
              <label className="block font-bold text-red-900 mb-1">Reason for Rejection *</label>
              <textarea
                required
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why the timeline is rejected (e.g. Urgent requirement for semester practical exams)..."
                className={inputClass()}
              />
            </div>

            <div>
              <label className="block font-bold text-red-900 mb-1">Manager Forced Completion Date *</label>
              <input
                type="date"
                required
                value={forcedDate}
                onChange={(e) => setForcedDate(e.target.value)}
                className={inputClass()}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectForm(false)}
                className="rounded-lg border border-slate-300 hover:bg-slate-100 px-3 py-2 font-bold text-slate-700 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Send size={13} /> Send Manager Final Directive
              </button>
            </div>
          </form>
        ) : (
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowRejectForm(true)}
              className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold px-4 py-2.5 text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle size={15} /> Reject & Fix Date
            </button>
            <button
              type="button"
              onClick={() => onApprove(task.id)}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <CheckCircle2 size={15} /> Approve Repair Schedule
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
