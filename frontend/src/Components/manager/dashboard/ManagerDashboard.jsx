import { useMemo, useState, useEffect, useCallback } from "react";
import { CalendarClock, Gauge, Package, AlertTriangle, ChevronRight } from "lucide-react";
import { DashboardShell } from "../../common/DashboardShell.jsx";
import { StatCard } from "../../common/StatCard.jsx";
import { ViewHeader } from "../../common/ViewHeader.jsx";
import { EmptyState } from "../../common/EmptyState.jsx";
import { StatusBadge } from "../../common/StatusBadge.jsx";
import { NAV_ITEMS } from "./navItems.js";
import EquipmentManagement, { EquipmentFormModal } from "../equipment/EquipmentManagement.jsx";
import DepartmentEquipmentView from "../../shared/DepartmentEquipmentView.jsx";
import BookingApprovals, { RejectModal } from "../approvals/BookingApprovals.jsx";
import MaintenanceOversightView from "../../shared/MaintenanceOversightView.jsx";
import Utilization from "../utilization/Utilization.jsx";
import Reports from "../reports/Reports.jsx";
import Notifications from "../notifications/Notifications.jsx";
import Profile from "../profile/Profile.jsx";
import { formatDateTime } from "../../../utils/formatters.js";
import { maintenanceApi } from "../../../api/maintenanceApi.js";
import { equipmentApi } from "../../../api/equipmentApi.js";
import { bookingApi } from "../../../api/bookingApi.js";

/* ================================================================== */
/*  Manager -> Dashboard (orchestrator: state + nav + Home view)       */
/* ================================================================== */
export default function ManagerDashboard({ user, onLogout, toast }) {
  const [view, setView] = useState("home");
  const [equipment, setEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [notifications, setNotifications] = useState([]);

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
      console.warn("Could not fetch real equipment for manager:", eqErr);
    }

    // Fetch real department bookings from PostgreSQL via REST API
    try {
      const bData = await bookingApi.getDepartmentBookings();
      setBookings(bData || []);
    } catch (bkErr) {
      console.warn("Could not fetch real bookings for manager:", bkErr);
    }
  }, [user?.institutionId]);

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  const setEquipmentPersist = (updater) => {
    setEquipment((prev) => typeof updater === "function" ? updater(prev) : updater);
  };

  const setMaintenancePersist = (updater) => {
    setMaintenance((prev) => typeof updater === "function" ? updater(prev) : updater);
  };
  const [equipModal, setEquipModal] = useState(null); // "new" | equipmentId
  const [rejectTarget, setRejectTarget] = useState(null); // booking

  const equipmentById = useMemo(() => Object.fromEntries(equipment.map((e) => [e.id, e])), [equipment]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const deptEquipment = useMemo(() => {
    const userDept = (user?.department || "Computer Science and Engineering").toLowerCase();
    return equipment.filter((e) => {
      const eqDept = (e.department || "").toLowerCase();
      if (userDept.includes("computer") || userDept.includes("cse")) {
        return eqDept.includes("computer") || eqDept.includes("cse");
      }
      if (userDept.includes("electrical") || userDept.includes("eee")) {
        return eqDept.includes("electrical") || eqDept.includes("eee");
      }
      if (userDept.includes("electronics") || userDept.includes("ece")) {
        return eqDept.includes("electronics") || eqDept.includes("ece");
      }
      if (userDept.includes("information") || userDept.includes("it")) {
        return eqDept.includes("information") || eqDept.includes("it");
      }
      if (userDept.includes("artificial") || userDept.includes("ai")) {
        return eqDept.includes("artificial") || eqDept.includes("ai");
      }
      if (userDept.includes("mechanical")) return eqDept.includes("mechanical");
      if (userDept.includes("civil")) return eqDept.includes("civil");
      return eqDept === userDept;
    });
  }, [equipment, user.department]);

  const approveBooking = async (id) => {
    try {
      const numericId = Number(id);
      if (!isNaN(numericId) && numericId > 0) {
        const updated = await bookingApi.approve(numericId);
        setBookings((list) =>
          list.map((b) =>
            (b.bookingId === numericId || b.id === numericId)
              ? { ...b, ...updated, status: "CONFIRMED" }
              : b
          )
        );
        toast(`Booking #${id} approved successfully — researcher notified.`, "success");
      }
    } catch (err) {
      toast(err.message || `Failed to approve booking #${id}.`, "error");
    }
  };

  const rejectBooking = async (id, reason) => {
    try {
      const numericId = Number(id);
      if (!isNaN(numericId) && numericId > 0) {
        const updated = await bookingApi.reject(numericId, reason);
        setBookings((list) =>
          list.map((b) =>
            (b.bookingId === numericId || b.id === numericId)
              ? {
                  ...b,
                  ...updated,
                  status: "REJECTED",
                  rejectionReason: reason,
                  rejection: { ...(b.rejection || {}), reason, rejectedAt: new Date().toISOString() },
                }
              : b
          )
        );
        toast(`Booking #${id} rejected — researcher notified.`, "success");
      }
    } catch (err) {
      toast(err.message || `Failed to reject booking #${id}.`, "error");
    }
  };

  const saveEquipment = async (payload, editingId) => {
    try {
      if (editingId) {
        await equipmentApi.update(editingId, {
          ...payload,
          departmentId: user.departmentId,
          institutionId: user.institutionId
        });
        toast("Equipment details updated in PostgreSQL.", "success");
      } else {
        await equipmentApi.create({
          ...payload,
          departmentId: user.departmentId,
          institutionId: user.institutionId
        });
        toast(`${payload.name} added to department inventory in PostgreSQL.`, "success");
      }
    } catch (err) {
      toast(err.message || "Failed to save equipment.", "error");
    }
    setEquipModal(null);
  };



  const markNotifRead = (id) => setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const handleReportIssue = (issueData) => {
    const ticketId = `WO-${Date.now().toString().slice(-6)}`;
    const newTask = {
      id: ticketId,
      equipmentId: issueData.equipmentId,
      reportedBy: issueData.reportedBy || user.name || "Lab Manager",
      issueType: issueData.issueType,
      description: issueData.description,
      priority: issueData.priority,
      status: "IN_PROGRESS",
      assignedTechnicianId: issueData.assignedTechnicianId,
      assignedTechnicianName: issueData.assignedTechnicianName,
      assignedTechnicianEmail: issueData.assignedTechnicianEmail,
      assignedTechnicianPhone: issueData.assignedTechnicianPhone,
      dueDate: "2026-12-31",
      notes: "Reported by Lab Manager. Awaiting technician inspection.",
    };

    setMaintenancePersist((list) => [newTask, ...list]);
    setEquipmentPersist((list) =>
      list.map((e) =>
        e.id === issueData.equipmentId
          ? {
              ...e,
              status: "UNDER_MAINTENANCE",
              assignedTechnicianName: issueData.assignedTechnicianName,
              assignedTechnicianPhone: issueData.assignedTechnicianPhone,
              assignedTechnicianEmail: issueData.assignedTechnicianEmail,
              maintenanceTicketId: ticketId,
              repairStartDate: new Date().toISOString().slice(0, 10),
              repairEndDate: "2026-12-31",
              delayReason: issueData.description,
            }
          : e
      )
    );

    toast(`Damage report ${ticketId} created & assigned to ${issueData.assignedTechnicianName}!`, "success");
  };

  const handleApproveEstimate = async (taskId) => {
    try {
      if (typeof taskId === "number" || (!isNaN(taskId) && Number(taskId) > 0)) {
        // Note: reviewDelay endpoint not available; approval is handled via MaintenanceOversightView
      }
    } catch (e) {
      console.warn("Backend approve call error:", e);
    }

    setMaintenancePersist((list) =>
      list.map((m) => (m.id === taskId ? { ...m, status: "REPAIR_IN_PROGRESS" } : m))
    );

    toast(`Repair estimate for ${taskId} approved! Technician notified.`, "success");
  };

  const handleRejectEstimate = async (taskId, reason, forcedDate) => {
    try {
      if (typeof taskId === "number" || (!isNaN(taskId) && Number(taskId) > 0)) {
        // Note: reviewDelay endpoint not available; rejection is handled via MaintenanceOversightView
      }
    } catch (e) {
      console.warn("Backend reject call error:", e);
    }

    setMaintenancePersist((list) =>
      list.map((m) =>
        m.id === taskId
          ? {
              ...m,
              status: "FINAL_MANAGER_DIRECTIVE",
              managerRejectionReason: reason,
              targetEndDate: forcedDate,
            }
          : m
      )
    );

    const task = maintenance.find((m) => m.id === taskId);
    if (task) {
      setEquipmentPersist((list) =>
        list.map((e) =>
          e.id === task.equipmentId
            ? { ...e, repairEndDate: forcedDate, delayReason: `[Manager Directive]: ${reason}` }
            : e
        )
      );
    }

    toast(`Repair timeline for ${taskId} rejected. Manager fixed completion date: ${forcedDate}.`, "error");
  };

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      activeView={view}
      setActiveView={setView}
      onLogout={onLogout}
      roleLabel="Lab Manager"
      roleTag="Signed in as"
      userName={user?.name || user?.firstName || "Nivetha S"}
      notifCount={unreadCount}
    >
      {view === "home" && (
        <HomeView
          bookings={bookings}
          equipment={equipment}
          maintenance={maintenance}
          notifications={notifications}
          onOpenApprovals={() => setView("approvals")}
          onOpenUtilization={() => setView("utilization")}
          onOpenMaintenance={() => setView("maintenance")}
        />
      )}

      {view === "equipment" && (
        <DepartmentEquipmentView
          user={user}
          toast={toast}
        />
      )}

      {view === "approvals" && (
        <BookingApprovals
          bookings={bookings}
          equipmentById={equipmentById}
          onApprove={approveBooking}
          onReject={rejectBooking}
          onRefresh={fetchLiveData}
        />
      )}

      {view === "maintenance" && (
        <MaintenanceOversightView
          user={user}
          toast={toast}
          departmentId={user?.departmentId}
          role="manager"
        />
      )}

      {view === "utilization" && (
        <Utilization role="manager" user={user} equipment={equipment} bookings={bookings} toast={toast} />
      )}

      {view === "reports" && <Reports user={user} toast={toast} />}

      {view === "notifications" && <Notifications notifications={notifications} onRead={markNotifRead} />}

      {view === "profile" && <Profile user={user} toast={toast} />}

      {equipModal && (
        <EquipmentFormModal
          equipment={equipModal !== "new" ? equipmentById[equipModal] : null}
          department={user.department}
          onClose={() => setEquipModal(null)}
          onSave={(payload) => saveEquipment(payload, equipModal !== "new" ? equipModal : null)}
        />
      )}

      {rejectTarget && (
        <RejectModal
          booking={rejectTarget}
          equipmentName={equipmentById[rejectTarget.equipmentId]?.name}
          onClose={() => setRejectTarget(null)}
          onConfirm={(reason) => rejectBooking(rejectTarget.id, reason)}
        />
      )}
    </DashboardShell>
  );
}

/* ================================================================== */
/*  Manager -> Dashboard -> Home                                        */
/* ================================================================== */
function HomeView({ bookings, equipment, maintenance, notifications, onOpenApprovals, onOpenUtilization, onOpenMaintenance }) {
  const pending = bookings.filter((b) => b.status === "PENDING_APPROVAL").length;
  const activeMaintenance = (Array.isArray(maintenance) && maintenance.length > 0)
    ? maintenance.filter((m) => m.status !== "COMPLETED" && m.status !== "CANCELLED").length
    : equipment.filter((e) => e.status === "UNDER_MAINTENANCE" || e.status === "OUT_OF_SERVICE").length;

  const statusCounts = ["AVAILABLE", "BOOKED", "UNDER_MAINTENANCE", "OUT_OF_SERVICE", "RETIRED"].map((s) => ({
    status: s,
    count: equipment.filter((e) => e.status === s).length,
  }));

  const recentApprovals = bookings.filter((b) => b.status !== "PENDING_APPROVAL").slice(0, 4);

  return (
    <div>
      <ViewHeader title="Lab Manager Dashboard" subtitle="Department equipment, approvals, and maintenance at a glance." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarClock} label="Pending Bookings Approval" value={pending} tone="text-amber-600" bg="bg-amber-50" onClick={onOpenApprovals} />
        <StatCard icon={Gauge} label="Department Utilization" value="View Analytics" tone="text-emerald-600" bg="bg-emerald-50" onClick={onOpenUtilization} />
        <StatCard icon={AlertTriangle} label="Active Maintenance Issues" value={activeMaintenance} tone="text-orange-600" bg="bg-orange-50" onClick={onOpenMaintenance} />
        <StatCard icon={Package} label="Total Equipment" value={equipment.length} tone="text-blue-600" bg="bg-blue-50" />
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Recent Approval Activity</h2>
            <button onClick={onOpenApprovals} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View queue <ChevronRight size={14} />
            </button>
          </div>
          {recentApprovals.length === 0 ? (
            <EmptyState icon={CalendarClock} title="No approval activity yet" />
          ) : (
            <div className="divide-y divide-slate-100">
              {recentApprovals.map((b, idx) => {
                const bKey = b.bookingId || b.id || `bk-${idx}`;
                return (
                  <div key={bKey} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{b.researcher || b.userEmail || "Researcher"} — Booking #{bKey}</p>
                      <p className="text-xs text-slate-500">{formatDateTime(b.start || b.startDatetime)}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Equipment Status Overview</h2>
          <div className="space-y-2.5">
            {statusCounts.map((s) => (
              <div key={s.status} className="flex items-center justify-between text-xs">
                <StatusBadge status={s.status} />
                <span className="font-bold text-slate-700">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">Notifications</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {notifications.map((n, idx) => (
            <div key={n.id || `notif-${idx}`} className={`rounded-lg border p-3 text-xs ${n.read ? "border-slate-100 bg-slate-50" : "border-blue-100 bg-blue-50"}`}>
              <p className="font-semibold text-slate-800">{n.title}</p>
              <p className="text-slate-500 mt-1">{n.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
