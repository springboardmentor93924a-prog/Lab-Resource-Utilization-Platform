import { useMemo, useState, useEffect, useCallback } from "react";
import { Wrench, Thermometer, ClipboardList, ChevronRight, CircleCheckBig } from "lucide-react";
import { DashboardShell } from "../../common/DashboardShell.jsx";
import { StatCard } from "../../common/StatCard.jsx";
import { ViewHeader } from "../../common/ViewHeader.jsx";
import { EmptyState } from "../../common/EmptyState.jsx";
import { StatusBadge } from "../../common/StatusBadge.jsx";
import { NAV_ITEMS } from "./navItems.js";
import MaintenanceRequests from "../maintenance/MaintenanceRequests.jsx";
import MaintenanceDetails from "../maintenance/MaintenanceDetails.jsx";
import EquipmentMaintenance from "../maintenance/EquipmentMaintenance.jsx";
import Calibration, { CalibrationModal } from "../maintenance/Calibration.jsx";
import Notifications from "../notifications/Notifications.jsx";
import Profile from "../profile/Profile.jsx";
import { maintenanceApi } from "../../../api/maintenanceApi.js";
import { equipmentApi } from "../../../api/equipmentApi.js";
import { formatDate } from "../../../utils/formatters.js";

/* ================================================================== */
/*  Technician -> Dashboard (orchestrator: state + nav + Home view)    */
/* ================================================================== */
export default function TechnicianDashboard({ user, onLogout, toast }) {
  const [view, setView] = useState("home");
  const [equipment, setEquipment] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [calibrations, setCalibrations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [calModalFor, setCalModalFor] = useState(null);

  const fetchLiveData = useCallback(async () => {
    // 1. Fetch real equipment from PostgreSQL via REST API
    try {
      const instId = user?.institutionId;
      const realEq = await equipmentApi.search(instId ? { institutionId: instId } : {});
      if (Array.isArray(realEq) && realEq.length > 0) {
        const mappedEq = realEq.map((e) => ({
          ...e,
          id: String(e.equipmentId || e.id),
          name: e.name || e.equipmentName || "",
          category: e.category || "General",
          department: e.departmentName || "",
          location: e.location || "",
          status: e.status || "AVAILABLE",
          description: e.description || "",
          specs: `${e.manufacturer || ""} ${e.model || ""} ${e.serialNumber ? "- SN: " + e.serialNumber : ""}`.trim(),
          calibrationStatus: e.calibrationStatus || "NOT_RECORDED",
          nextCalibration: e.nextCalibrationDue || e.nextCalibrationDate || null,
          nextCalibrationDue: e.nextCalibrationDue || e.nextCalibrationDate || null,
          image: e.imageSecureUrl || "🔬",
        }));
        setEquipment(mappedEq);
      }
    } catch (eqErr) {
      console.warn("Could not fetch real equipment for technician:", eqErr);
    }

    // 2. Fetch real maintenance tasks for technician from PostgreSQL via REST API
    try {
      const apiTasks = await maintenanceApi.getTechnicianTasks();
      if (Array.isArray(apiTasks)) {
        const mappedTasks = apiTasks.map((t) => ({
          ...t,
          id: t.maintenanceId,
          maintenanceCode: t.maintenanceCode || `MR-2026-${String(t.maintenanceId).padStart(5, '0')}`,
          maintenanceId: t.maintenanceId,
          equipmentId: String(t.equipmentId || ""),
          equipmentName: t.equipmentName || "",
          priority: t.priority || "HIGH",
          status: t.status || "ASSIGNED",
          dueDate: t.finalDueDate || t.proposedEndDatetime || t.scheduledEndDatetime || null,
        }));
        setTasks(mappedTasks);
      }
    } catch (e) {
      console.warn("Could not fetch backend technician tasks:", e);
    }
  }, [user]);

  useEffect(() => {
    fetchLiveData();
    window.addEventListener("focus", fetchLiveData);
    return () => {
      window.removeEventListener("focus", fetchLiveData);
    };
  }, [fetchLiveData]);

  const equipmentById = useMemo(() => Object.fromEntries(equipment.map((e) => [e.id, e])), [equipment]);
  const myTasks = useMemo(() => tasks, [tasks]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSubmitPlan = async (payload) => {
    if (!selectedTaskId) return;
    await maintenanceApi.submitPlan(selectedTaskId, payload);
    toast("Repair plan submitted to Lab Manager for review.", "success");
    await fetchLiveData();
  };

  const handleAcceptSchedule = async () => {
    if (!selectedTaskId) return;
    await maintenanceApi.acceptSchedule(selectedTaskId);
    toast("Schedule accepted. You are ready to start maintenance work.", "success");
    await fetchLiveData();
  };

  const handleStartWork = async () => {
    if (!selectedTaskId) return;
    await maintenanceApi.startWork(selectedTaskId);
    toast("Maintenance started. Equipment status updated to Under Maintenance.", "success");
    await fetchLiveData();
  };

  const handleCompleteWork = async (payload, photoFile) => {
    if (!selectedTaskId) return;
    await maintenanceApi.completeWork(selectedTaskId, payload, photoFile);
    toast("Work completed and submitted for verification.", "success");
    await fetchLiveData();
  };

  const handleAddCal = (form) => {
    setCalibrations((list) => [
      ...list,
      {
        id: "CAL-" + Date.now(),
        equipmentId: calModalFor,
        date: form.date,
        technician: user.name,
        result: form.result,
        notes: form.notes,
        nextDueDate: form.nextDueDate,
      },
    ]);
    setEquipment((list) => {
      return list.map((e) => {
        if (e.id === calModalFor) {
          return {
            ...e,
            calibrationStatus: form.result === "Passed" ? "Up to date" : "Needs Attention",
            nextCalibration: form.nextDueDate,
          };
        }
        return e;
      });
    });
    toast("Calibration record saved.", "success");
    setCalModalFor(null);
  };

  const markNotifRead = (id) => setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      activeView={view}
      setActiveView={(v) => {
        setSelectedTaskId(null);
        setView(v);
        fetchLiveData();
      }}
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
          user={user}
          onOpenTasks={() => { setSelectedTaskId(null); setView("tasks"); }}
          onOpenCalibration={() => setView("calibration")}
        />
      )}

      {(view === "tasks" || view === "requests") && (
        selectedTaskId ? (
          <MaintenanceDetails
            task={myTasks.find((t) => t.id === selectedTaskId)}
            equipment={equipmentById[myTasks.find((t) => t.id === selectedTaskId)?.equipmentId]}
            onBack={() => { setSelectedTaskId(null); fetchLiveData(); }}
            onAcceptSchedule={handleAcceptSchedule}
            onSubmitPlan={handleSubmitPlan}
            onStartWork={handleStartWork}
            onCompleteWork={handleCompleteWork}
            toast={toast}
            onRefresh={fetchLiveData}
          />
        ) : (
          <MaintenanceRequests tasks={myTasks} equipmentById={equipmentById} onOpen={setSelectedTaskId} onRefresh={fetchLiveData} />
        )
      )}

      {view === "maintenance" && (
        <EquipmentMaintenance
          equipment={equipment}
          tasks={tasks}
          userDepartment={user?.departmentName || user?.department || ""}
          user={user}
          onOpenTask={(taskId) => {
            setSelectedTaskId(taskId);
            setView("tasks");
          }}
          toast={toast}
        />
      )}

      {view === "calibration" && (
        <Calibration
          equipment={equipment}
          calibrations={calibrations}
          onOpen={(id) => setCalModalFor(id)}
          onRefresh={fetchLiveData}
          toast={toast}
          user={user}
        />
      )}

      {view === "notifications" && <Notifications notifications={notifications} onRead={markNotifRead} />}

      {view === "profile" && <Profile user={user} tasks={myTasks} toast={toast} />}

      {calModalFor && (
        <CalibrationModal
          equipment={equipmentById[calModalFor]}
          onClose={() => setCalModalFor(null)}
          onSuccess={() => {
            setCalModalFor(null);
            fetchLiveData();
            toast("Calibration record saved.", "success");
          }}
          toast={toast}
          user={user}
        />
      )}
    </DashboardShell>
  );
}

/* ================================================================== */
/*  Technician -> Dashboard -> Home                                     */
/* ================================================================== */
function HomeView({ myTasks, equipment, notifications, user, onOpenTasks, onOpenCalibration }) {
  const userDept = (user?.department || "Computer Science and Engineering").toLowerCase();
  const deptEquipment = useMemo(() => {
    return equipment.filter((e) => {
      const eqDept = (e.department || "").toLowerCase();
      if (userDept.includes("computer") || userDept.includes("cse")) {
        return eqDept.includes("computer") || eqDept.includes("cse");
      }
      return eqDept === userDept;
    });
  }, [equipment, userDept]);

  const open = myTasks.filter((t) => t.status !== "COMPLETED").length;
  const pendingCal = deptEquipment.filter((e) => e.calibrationStatus !== "Up to date" && e.calibrationStatus !== "VALID").length;
  const underRepair = deptEquipment.filter((e) => e.status === "UNDER_MAINTENANCE").length;
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
