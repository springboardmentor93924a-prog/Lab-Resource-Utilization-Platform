import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Wrench, Thermometer, Bell, UserRound, ClipboardList,
  Camera, Upload, ChevronRight, CircleCheckBig, AlertTriangle, Trash2, Send
} from "lucide-react";
import {
  Modal, Field, inputClass, StatusBadge, StatCard, DashboardShell, ViewHeader, EmptyState,
import { maintenanceApi } from "../../api/maintenanceApi.js";
import { subscribeToMaintenanceUpdates } from "../../api/wsClient.js";
import { formatDate, formatDateTime } from "../../utils/formatters.js";

const NAV_ITEMS = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "Assigned Tasks", icon: ClipboardList },
  { id: "maintenance", label: "Equipment Maintenance", icon: Wrench },
  { id: "calibration", label: "Calibration Logs", icon: Thermometer },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "profile", label: "Profile", icon: UserRound },
];

export default function TechnicianDashboard({ user, onLogout, toast }) {
  const [view, setView] = useState("home");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await maintenanceApi.getTechnicianTasks();
      setTasks(data || []);
    } catch (err) {
      console.warn("Failed to load technician tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    // Real-time STOMP WebSocket listener for automatic update without page refresh
    const unsubscribe = subscribeToMaintenanceUpdates((updatedTask) => {
      setTasks((prev) => {
        const idx = prev.findIndex((t) => t.maintenanceId === updatedTask.maintenanceId);
        if (idx !== -1) {
          const list = [...prev];
          list[idx] = { ...list[idx], ...updatedTask };
          return list;
        }
        return [updatedTask, ...prev];
      });
      toast("Real-time schedule update received from Lab Manager!", "info");
    });

    return () => unsubscribe();
  }, []);

  const selectedTask = useMemo(() => tasks.find((t) => t.maintenanceId === selectedTaskId), [tasks, selectedTaskId]);

  const handleCancelAssignment = async (id) => {
    try {
      await maintenanceApi.cancelAssignment(id);
      toast("Assignment cancelled/removed successfully.", "success");
      setSelectedTaskId(null);
      loadTasks();
    } catch (err) {
      toast(err.message || "Failed to cancel assignment.", "error");
    }
  };

  const myTasks = tasks;
  const equipmentById = useMemo(() => Object.fromEntries(equipment.map((e) => [e.id, e])), [equipment]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const updateTask = (id, patch) => setTasks((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const markResolved = (id, finalNotes) => {
    const task = tasks.find((t) => t.id === id);
    updateTask(id, { status: "COMPLETED", notes: finalNotes ?? task.notes });
    setEquipment((list) => list.map((e) => (e.id === task.equipmentId ? { ...e, status: "AVAILABLE" } : e)));
    toast(`${id} marked resolved — equipment set back to Available. Lab Manager & affected users notified.`, "success");
    setSelectedTaskId(null);
  };

  const saveCalibration = (equipmentId, { certificateNumber, nextDue }) => {
    setCalibrations((list) => {
      const exists = list.find((c) => c.equipmentId === equipmentId);
      const today = new Date().toISOString().slice(0, 10);
      if (exists) {
        return list.map((c) => (c.equipmentId === equipmentId ? { ...c, certificateNumber, nextDue, lastCalibration: today, compliance: "Up to date" } : c));
      }
      return [...list, { equipmentId, certificateNumber, nextDue, lastCalibration: today, compliance: "Up to date" }];
    });
    setEquipment((list) => list.map((e) => (e.id === equipmentId ? { ...e, calibrationStatus: "Up to date", nextCalibration: nextDue } : e)));
    toast("Calibration record saved.", "success");
    setCalModalFor(null);
  };

  const markNotifRead = (id) => setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      activeView={view}
      setActiveView={(v) => { setSelectedTaskId(null); setView(v); }}
      onLogout={onLogout}
      roleLabel="Lab Technician"
      roleTag="Signed in as"
      userName={user.name}
      notifCount={unreadCount}
    >
      {view === "home" && (
        <HomeView
          myTasks={myTasks}
          equipment={equipment}
          notifications={notifications}
          onOpenTasks={() => setView("tasks")}
          onOpenCalibration={() => setView("calibration")}
        />
      )}

      {view === "tasks" && (
        selectedTaskId ? (
          <TaskDetails
            task={tasks.find((t) => t.maintenanceId === selectedTaskId)}
            onBack={() => setSelectedTaskId(null)}
            onRefresh={loadTasks}
            toast={toast}
          />
        ) : (
          <TasksView tasks={tasks} onOpen={setSelectedTaskId} />
        )
      )}

      {view === "maintenance" && <EquipmentMaintenanceView equipment={equipment} tasks={tasks} />}

      {view === "calibration" && (
        <CalibrationView equipment={equipment} calibrations={calibrations} onOpen={(id) => setCalModalFor(id)} />
      )}

      {view === "notifications" && <NotificationsView notifications={notifications} onRead={markNotifRead} />}

      {view === "profile" && <ProfileView user={user} tasks={myTasks} toast={toast} />}

      {calModalFor && (
        <CalibrationModal
          equipment={equipmentById[calModalFor]}
          existing={calibrations.find((c) => c.equipmentId === calModalFor)}
          onClose={() => setCalModalFor(null)}
          onSave={(payload) => saveCalibration(calModalFor, payload)}
        />
      )}
    </DashboardShell>
  );
}

/* ================================================================== */
/*  2.1  Dashboard Home                                                 */
/* ================================================================== */
function HomeView({ myTasks, equipment, notifications, onOpenTasks, onOpenCalibration }) {
  const open = myTasks.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS" || t.status === "WAITING_FOR_PARTS").length;
  const pendingCal = equipment.filter((e) => e.calibrationStatus !== "Up to date").length;
  const underRepair = equipment.filter((e) => e.status === "UNDER_MAINTENANCE").length;
  const assigned = myTasks.length;

  return (
    <div>
      <ViewHeader title="Technician Dashboard" subtitle="Your assigned work orders and calibration workload at a glance." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ClipboardList} label="Open Maintenance Tasks" value={open} tone="text-amber-600" bg="bg-amber-50" onClick={onOpenTasks} />
        <StatCard icon={Thermometer} label="Pending Calibrations" value={pendingCal} tone="text-purple-600" bg="bg-purple-50" onClick={onOpenCalibration} />
        <StatCard icon={Wrench} label="Equipment Under Repair" value={underRepair} tone="text-orange-600" bg="bg-orange-50" />
        <StatCard icon={CircleCheckBig} label="Assigned Equipment" value={assigned} tone="text-blue-600" bg="bg-blue-50" onClick={onOpenTasks} />
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">My Open Tasks</h2>
            <button onClick={onOpenTasks} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </button>
          </div>
          {myTasks.filter((t) => t.status !== "COMPLETED").length === 0 ? (
            <EmptyState icon={ClipboardList} title="No open tasks — nice and clear!" />
          ) : (
            <div className="divide-y divide-slate-100">
              {myTasks.filter((t) => t.status !== "COMPLETED").slice(0, 5).map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{t.id} — {t.issueType}</p>
                    <p className="text-xs text-slate-500">Due {formatDate(t.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={t.priority} />
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Notifications</h2>
          <div className="space-y-3">
            {notifications.slice(0, 3).map((n) => (
              <div key={n.id} className={`rounded-lg border p-3 text-xs ${n.read ? "border-slate-100 bg-slate-50" : "border-blue-100 bg-blue-50"}`}>
                <p className="font-semibold text-slate-800">{n.title}</p>
                <p className="text-slate-500 mt-0.5">{n.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  2.2  Assigned Tasks (Work Orders)                                   */
/* ================================================================== */
function TasksView({ tasks, onOpen }) {
  return (
    <div>
      <ViewHeader title="Assigned Tasks" subtitle="Work orders assigned to you by the Lab Manager." />
      {tasks.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No tasks assigned yet" />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Work Order</th>
                <th className="px-5 py-3.5 font-semibold">Equipment</th>
                <th className="px-5 py-3.5 font-semibold">Manager Target Schedule</th>
                <th className="px-5 py-3.5 font-semibold">Priority</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((t) => (
                <tr key={t.maintenanceId} onClick={() => onOpen(t.maintenanceId)} className="cursor-pointer hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-blue-600">{t.maintenanceCode || `MR-${t.maintenanceId}`}</td>
                  <td className="px-5 py-3.5 text-slate-800 font-medium">{t.equipmentName || `Equipment #${t.equipmentId}`}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-600">
                    {t.managerTargetStartDatetime ? (
                      <div>
                        <p className="font-semibold text-slate-800">{new Date(t.managerTargetStartDatetime).toLocaleDateString()}</p>
                        <p className="text-slate-400">{new Date(t.managerTargetStartDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(t.managerTargetEndDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400">Not set</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={t.priority} /></td>
                  <td className="px-5 py-3.5"><StatusBadge status={t.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-xs font-semibold text-blue-600 hover:text-blue-700">View & Respond →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TaskDetails({ task, onBack, onRefresh, toast }) {
  const [proposedStart, setProposedStart] = useState(task?.proposedStartDatetime || task?.managerTargetStartDatetime || "");
  const [proposedEnd, setProposedEnd] = useState(task?.proposedEndDatetime || task?.managerTargetEndDatetime || "");
  const [delayReason, setDelayReason] = useState(task?.delayReason || "");
  const [submittingPlan, setSubmittingPlan] = useState(false);
  const [acceptingSchedule, setAcceptingSchedule] = useState(false);
  const [workNotes, setWorkNotes] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  if (!task) return null;

  const isAssigned = task.status === "ASSIGNED" && !task.technicianResponse;
  const isAccepted = task.status === "ACCEPTED" || task.technicianResponse === "ACCEPTED";
  const canStartWork = task.status === "FINALIZED" || task.status === "ACCEPTED" || task.status === "SCHEDULED" || task.status === "ASSIGNED";
  const canComplete = task.status === "IN_PROGRESS";

  const handleAcceptSchedule = async () => {
    try {
      setAcceptingSchedule(true);
      await maintenanceApi.acceptSchedule(task.maintenanceId);
      toast(`Schedule accepted for ${task.maintenanceCode || `MR-${task.maintenanceId}`}. Lab Manager notified.`, "success");
      onRefresh();
    } catch (err) {
      toast(err.message || "Failed to accept schedule.", "error");
    } finally {
      setAcceptingSchedule(false);
    }
  };

  const handleSubmitPlan = async () => {
    if (!delayReason || !delayReason.trim()) {
      toast("Delay justification is required before requesting a different schedule.", "error");
      return;
    }
    if (!proposedStart || !proposedEnd) {
      toast("Proposed start and end datetimes are required.", "error");
      return;
    }
    try {
      setSubmittingPlan(true);
      await maintenanceApi.submitPlan(task.maintenanceId, {
        proposedStartDateTime: proposedStart,
        proposedEndDateTime: proposedEnd,
        delayReason: delayReason.trim()
      });
      toast(`Schedule change requested for ${task.maintenanceCode || `MR-${task.maintenanceId}`}. Pending manager review.`, "success");
      setShowSubmitModal(false);
      onRefresh();
    } catch (err) {
      toast(err.message || "Failed to submit proposed schedule.", "error");
    } finally {
      setSubmittingPlan(false);
    }
  };

  const handleStartWork = async () => {
    try {
      await apiFetch(`/maintenance/${task.maintenanceId}/start`, { method: "POST" });
      toast(`Work started for ${task.maintenanceCode || `MR-${task.maintenanceId}`}. Equipment set to UNDER_MAINTENANCE.`, "success");
      onRefresh();
    } catch (err) {
      toast(err.message || "Failed to start work.", "error");
    }
  };

  const handleCompleteWork = async () => {
    try {
      await apiFetch(`/maintenance/${task.maintenanceId}/complete`, {
        method: "POST",
        params: { notes: workNotes }
      });
      toast(`Work completed for ${task.maintenanceCode || `MR-${task.maintenanceId}`}. Sent for manager verification.`, "success");
      onRefresh();
    } catch (err) {
      toast(err.message || "Failed to complete work.", "error");
    }
  };

  const handleCancelAssignment = async () => {
    try {
      await maintenanceApi.cancelAssignment(task.maintenanceId);
      toast("Assignment cancelled successfully.", "success");
      onBack();
    } catch (err) {
      toast(err.message || "Failed to cancel assignment.", "error");
    }
  };

  return (
    <div>
      <button onClick={onBack} className="mb-5 text-sm font-semibold text-slate-500 hover:text-blue-600">← Back to Assigned Tasks</button>
      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">{task.maintenanceCode || `MR-${task.maintenanceId}`}</p>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">{task.equipmentName || `Equipment #${task.equipmentId}`}</h1>
            <p className="text-sm text-slate-500">{task.issueType || "General Issue"}</p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={task.priority} />
            <StatusBadge status={task.status} />
          </div>
        </div>

        {/* Problem & Repair Descriptions */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-blue-50/50 border border-blue-200 p-4">
            <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">Problem / Repair Description</p>
            <p className="mt-1.5 text-sm text-slate-800 font-medium">{task.problemDescription || "NOT RECORDED"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Reported Issue Description</p>
            <p className="mt-1.5 text-sm text-slate-700">{task.issueDescription || "NOT RECORDED"}</p>
          </div>
        </div>

        {/* Manager Target & Technician Schedule Section */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* 1. Manager Target */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
            <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">Manager Target Schedule</p>
            {task.managerTargetStartDatetime ? (
              <div className="mt-2 text-xs text-blue-800 space-y-1">
                <p><span className="font-semibold">Start:</span> {new Date(task.managerTargetStartDatetime).toLocaleString()}</p>
                <p><span className="font-semibold">Target Completion:</span> {new Date(task.managerTargetEndDatetime).toLocaleString()}</p>
                {task.managerInstructions && <p className="text-blue-700 mt-1 italic">"{task.managerInstructions}"</p>}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-2">Not set</p>
            )}
          </div>

          {/* 2. Technician Response */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">Technician Response</p>
            {isAccepted ? (
              <div className="mt-2 text-xs text-emerald-800 space-y-1">
                <p className="font-bold text-emerald-700 flex items-center gap-1"><CircleCheckBig size={14} /> ACCEPTED</p>
                {task.technicianAcceptedAt && <p className="text-slate-500">Accepted at: {new Date(task.technicianAcceptedAt).toLocaleString()}</p>}
                <p className="text-slate-600 italic">Target schedule accepted without changes.</p>
              </div>
            ) : task.proposedStartDatetime ? (
              <div className="mt-2 text-xs text-amber-800 space-y-1">
                <p className="font-bold text-amber-700">DELAY REQUESTED</p>
                <p><span className="font-semibold">Proposed Start:</span> {new Date(task.proposedStartDatetime).toLocaleString()}</p>
                <p><span className="font-semibold">Proposed End:</span> {new Date(task.proposedEndDatetime).toLocaleString()}</p>
                {task.delayReason && <p className="text-amber-900 mt-1 font-medium">Justification: {task.delayReason}</p>}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-2">Awaiting your response</p>
            )}
          </div>

          {/* 3. Final Manager Schedule */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <p className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Manager Final Schedule</p>
            {task.finalStartDatetime ? (
              <div className="mt-2 text-xs text-emerald-800 space-y-1">
                <p><span className="font-semibold">Start:</span> {new Date(task.finalStartDatetime).toLocaleString()}</p>
                <p><span className="font-semibold">End:</span> {new Date(task.finalEndDatetime).toLocaleString()}</p>
                {task.managerNotes && <p className="text-emerald-700 mt-1 italic">"{task.managerNotes}"</p>}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-2">{isAccepted ? "Finalized upon acceptance" : "Pending Manager Review"}</p>
            )}
          </div>
        </div>

        {/* Schedule Agreement Prompt & Action Buttons */}
        {isAssigned && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 space-y-3">
            <h3 className="text-sm font-bold text-blue-900">Are you okay with this schedule?</h3>
            <p className="text-xs text-blue-700">Accept the manager's target schedule directly or submit a request for a different schedule with a delay justification.</p>
            <div className="flex gap-3 pt-1 flex-wrap">
              <button
                disabled={acceptingSchedule}
                onClick={handleAcceptSchedule}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-sm font-semibold px-4 py-2.5 transition-colors flex items-center gap-2"
              >
                <CircleCheckBig size={16} /> Accept Schedule
              </button>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors flex items-center gap-2"
              >
                <Send size={16} /> Request Different Schedule
              </button>
              <button
                onClick={handleCancelAssignment}
                className="rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold px-4 py-2.5 transition-colors"
              >
                Cancel Assignment
              </button>
            </div>
          </div>
        )}

        {/* Work Progress Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-3">
          {canStartWork && task.status !== "IN_PROGRESS" && task.status !== "COMPLETED" && task.status !== "PENDING_VERIFICATION" && (
            <button
              onClick={handleStartWork}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors flex items-center gap-2"
            >
              <Wrench size={16} /> Start Repair Work
            </button>
          )}

          {canComplete && (
            <div className="w-full space-y-3">
              <Field label="Work Log / Summary Notes">
                <textarea
                  rows={3}
                  value={workNotes}
                  onChange={(e) => setWorkNotes(e.target.value)}
                  placeholder="Detail repairs executed, components replaced, and tests performed…"
                  className={inputClass()}
                />
              </Field>
              <button
                onClick={handleCompleteWork}
                className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 transition-colors flex items-center justify-center gap-2"
              >
                <CircleCheckBig size={16} /> Submit for Verification
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Repair Plan Submission Modal */}
      {showSubmitModal && (
        <Modal title="Submit Repair Plan" subtitle={task.maintenanceCode || `MR-${task.maintenanceId}`} onClose={() => setShowSubmitModal(false)}>
          <div className="space-y-4">
            <Field label="Delay Justification (Mandatory)" required>
              <textarea
                rows={3}
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                placeholder="Explain why target schedule cannot be met or detail parts/preparation required…"
                className={inputClass()}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Proposed Start Datetime" required>
                <input
                  type="datetime-local"
                  value={proposedStart}
                  onChange={(e) => setProposedStart(e.target.value)}
                  className={inputClass()}
                />
              </Field>
              <Field label="Proposed End Datetime" required>
                <input
                  type="datetime-local"
                  value={proposedEnd}
                  onChange={(e) => setProposedEnd(e.target.value)}
                  className={inputClass()}
                />
              </Field>
            </div>

            <button
              disabled={submittingPlan}
              onClick={handleSubmitPlan}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {submittingPlan ? "Submitting Plan…" : "Submit Proposal for Manager Review"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Equipment Maintenance (status overview, read view for technicians)  */
/* ================================================================== */
function EquipmentMaintenanceView({ equipment, tasks }) {
  return (
    <div>
      <ViewHeader title="Equipment Maintenance" subtitle="Live maintenance status across all department equipment." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {equipment.map((e) => {
          const openTask = tasks.find((t) => t.equipmentId === e.id && t.status !== "COMPLETED");
          return (
            <div key={e.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <span className="text-2xl">{e.image}</span>
                <StatusBadge status={e.status} />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">{e.name}</h3>
              <p className="text-xs text-slate-600 font-medium">Lab: {e.labName || "—"}</p>
              {e.location && <p className="text-xs text-slate-400">Location: {e.location}</p>}
              {openTask ? (
                <div className="mt-3 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 flex items-center gap-2">
                  <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                  <p className="text-[11px] text-amber-700 font-semibold">{openTask.id} — {openTask.status.replace(/_/g, " ")}</p>
                </div>
              ) : (
                <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 flex items-center gap-2">
                  <CircleCheckBig size={13} className="text-emerald-500 shrink-0" />
                  <p className="text-[11px] text-emerald-700 font-semibold">No open issues</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  2.3  Calibration Logs                                               */
/* ================================================================== */
function CalibrationView({ equipment, calibrations, onOpen }) {
  const byId = Object.fromEntries(calibrations.map((c) => [c.equipmentId, c]));
  return (
    <div>
      <ViewHeader title="Calibration Logs" subtitle="Track calibration due dates and compliance across equipment." />
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="text-left font-semibold px-5 py-3">Equipment</th>
              <th className="text-left font-semibold px-5 py-3">Certificate #</th>
              <th className="text-left font-semibold px-5 py-3">Last Calibration</th>
              <th className="text-left font-semibold px-5 py-3">Next Due</th>
              <th className="text-left font-semibold px-5 py-3">Compliance</th>
              <th className="text-right font-semibold px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {equipment.map((e) => {
              const c = byId[e.id];
              const status = c?.compliance === "Overdue" ? "OUT_OF_SERVICE" : c?.compliance === "Due soon" ? "BOOKED" : "AVAILABLE";
              return (
                <tr key={e.id}>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{e.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c?.certificateNumber || "—"}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c ? formatDate(c.lastCalibration) : "—"}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c ? formatDate(c.nextDue) : "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                      status === "OUT_OF_SERVICE" ? "bg-red-50 text-red-600 border-red-200" :
                      status === "BOOKED" ? "bg-amber-50 text-amber-600 border-amber-200" :
                      "bg-emerald-50 text-emerald-600 border-emerald-200"
                    }`}>
                      {c?.compliance || "No record"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => onOpen(e.id)} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 ml-auto">
                      <Upload size={12} /> Update
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CalibrationModal({ equipment, existing, onClose, onSave }) {
  const [certificateNumber, setCertificateNumber] = useState(existing?.certificateNumber || "");
  const [nextDue, setNextDue] = useState(existing?.nextDue || "");
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState({});

  const submit = () => {
    const e = {};
    if (!certificateNumber.trim()) e.certificateNumber = "Certificate number is required.";
    if (!nextDue) e.nextDue = "Next calibration due date is required.";
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({ certificateNumber, nextDue });
  };

  return (
    <Modal title="Update Calibration Record" subtitle={equipment.name} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Calibration Certificate">
          <label className="w-full rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/40 transition-colors py-5 flex flex-col items-center justify-center gap-1 text-slate-500 cursor-pointer">
            <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} />
            <Upload size={18} className="text-blue-600" />
            <span className="text-xs">{fileName || "Upload calibration certificate (PDF)"}</span>
          </label>
        </Field>
        <Field label="Certificate Number" required error={errors.certificateNumber}>
          <input value={certificateNumber} onChange={(e) => setCertificateNumber(e.target.value)} placeholder="CAL-2026-0123" className={inputClass(errors.certificateNumber)} />
        </Field>
        <Field label="Next Calibration Due Date" required error={errors.nextDue}>
          <input type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} className={inputClass(errors.nextDue)} />
        </Field>
        <button onClick={submit} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
          Save Calibration Record
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================== */
/*  Notifications                                                       */
/* ================================================================== */
function NotificationsView({ notifications, onRead }) {
  return (
    <div>
      <ViewHeader title="Notifications" subtitle="Task assignments, parts updates, and resolution confirmations." />
      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up" />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => onRead(n.id)}
              className={`w-full text-left rounded-xl border p-4 flex items-start gap-3 transition-colors ${n.read ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50/60"}`}
            >
              <span className={`mt-0.5 flex h-2.5 w-2.5 shrink-0 rounded-full ${n.read ? "bg-slate-300" : "bg-blue-500"}`} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                <p className="text-[11px] text-slate-400 mt-1.5">{n.type} · {n.time}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Profile                                                              */
/* ================================================================== */
function ProfileView({ user, tasks, toast }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: user.firstName, lastName: user.lastName, phone: user.phone });

  const resolved = tasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <div>
      <ViewHeader title="Profile" subtitle="Manage your technician account details." />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-4 mb-6">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold">
              {user.firstName[0]}{user.lastName?.[0] || ""}
            </span>
            <div>
              <p className="text-lg font-bold text-slate-900">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="First Name">
              <input disabled={!editing} value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} className={`${inputClass()} ${!editing ? "bg-slate-50 text-slate-500" : ""}`} />
            </Field>
            <Field label="Last Name">
              <input disabled={!editing} value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} className={`${inputClass()} ${!editing ? "bg-slate-50 text-slate-500" : ""}`} />
            </Field>
            <Field label="Email"><input disabled value={user.email} className={`${inputClass()} bg-slate-50 text-slate-500`} /></Field>
            <Field label="Phone">
              <input disabled={!editing} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={`${inputClass()} ${!editing ? "bg-slate-50 text-slate-500" : ""}`} />
            </Field>
            <Field label="Department"><input disabled value={user.department} className={`${inputClass()} bg-slate-50 text-slate-500`} /></Field>
          </div>
          <div className="mt-6 flex gap-3">
            {editing ? (
              <>
                <button onClick={() => { setEditing(false); toast("Profile updated.", "success"); }} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors">Save Changes</button>
                <button onClick={() => setEditing(false)} className="rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2.5 transition-colors">Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors">Edit Profile</button>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Work Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2.5">
              <span className="text-xs font-semibold text-slate-500">Assigned Tasks</span>
              <span className="text-sm font-extrabold text-blue-600">{tasks.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2.5">
              <span className="text-xs font-semibold text-slate-500">Resolved</span>
              <span className="text-sm font-extrabold text-emerald-600">{resolved}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
