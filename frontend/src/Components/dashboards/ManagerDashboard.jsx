import { useMemo, useState, useEffect } from "react";
import {
  LayoutDashboard, CalendarClock, Wrench, Gauge, FileText, Bell, UserRound,
  Package, Plus, Pencil, ThumbsUp, ThumbsDown, ChevronRight, AlertTriangle,
  CircleCheckBig, Download, Camera,
} from "lucide-react";
import {
  Modal, Field, inputClass, StatusBadge, StatCard, DashboardShell, ViewHeader, EmptyState,
} from "../shared/ui.jsx";
import UtilizationHeatmapPage from "../shared/UtilizationHeatmapPage.jsx";
import MaintenanceOversightView from "../shared/MaintenanceOversightView.jsx";
import DepartmentEquipmentView from "../shared/DepartmentEquipmentView.jsx";
import { formatDateTime } from "../../data/mockData.js";
import { equipmentApi } from "../../api/equipmentApi.js";
import { maintenanceApi } from "../../api/maintenanceApi.js";
import { bookingApi } from "../../api/bookingApi.js";

const NAV_ITEMS = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard },
  { id: "equipment", label: "Department Equipment", icon: Package },
  { id: "approvals", label: "Booking Approvals", icon: CalendarClock },
  { id: "maintenance", label: "Maintenance Oversight", icon: Wrench },
  { id: "utilization", label: "Utilization Heatmap", icon: Gauge },
  { id: "reports", label: "Reports & Analytics", icon: FileText },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "profile", label: "Profile", icon: UserRound },
];

let eqCounter = 109;

export default function ManagerDashboard({ user, onLogout, toast }) {
  const [view, setView] = useState("home");
  const [equipment, setEquipment] = useState([]);
  const [loadingEq, setLoadingEq] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [equipModal, setEquipModal] = useState(null); // "new" | equipmentId
  const [rejectTarget, setRejectTarget] = useState(null); // booking
  const [cancelTarget, setCancelTarget] = useState(null); // maintenance task

  const loadBookings = () => {
    bookingApi
      .getDepartmentBookings()
      .then((data) => setBookings(data || []))
      .catch(() => setBookings([]));
  };

  useEffect(() => {
    setLoadingEq(true);
    equipmentApi
      .search({ institutionId: user?.institutionId, departmentId: user?.departmentId })
      .then((data) => setEquipment(data || []))
      .catch((err) => toast?.(err.message || "Failed to load equipment.", "error"))
      .finally(() => setLoadingEq(false));

    loadBookings();
  }, [user?.institutionId, user?.departmentId]);

  const equipmentById = useMemo(() => Object.fromEntries(equipment.map((e) => [e.equipmentId || e.id, e])), [equipment]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const approveBooking = async (id) => {
    try {
      await bookingApi.approve(id);
      toast(`Booking ${id} approved — researcher notified.`, "success");
      loadBookings();
    } catch (err) {
      toast(err?.message || `Failed to approve booking ${id}.`, "error");
    }
  };

  const rejectBooking = async (id, reason) => {
    try {
      await bookingApi.reject(id, reason);
      toast(`Booking ${id} rejected — researcher notified.`, "error");
      setRejectTarget(null);
      loadBookings();
    } catch (err) {
      toast(err?.message || `Failed to reject booking ${id}.`, "error");
    }
  };

  const handleManagerCancelTask = async (task, reason) => {
    try {
      const taskId = task.maintenanceId || task.id;
      await maintenanceApi.managerCancel(taskId, reason);
      toast(`Maintenance task ${taskId} cancelled successfully.`, "success");
      setCancelTarget(null);
    } catch (err) {
      toast(err.message || "Failed to cancel maintenance task.", "error");
    }
  };

  const saveEquipment = (payload, editingId) => {
    if (editingId) {
      setEquipment((list) => list.map((e) => (e.id === editingId ? { ...e, ...payload } : e)));
      toast("Equipment details updated.", "success");
    } else {
      const id = `EQ-1${eqCounter++}`;
      setEquipment((list) => [{ id, status: "AVAILABLE", calibrationStatus: "Up to date", nextCalibration: payload.nextCalibration || "2026-12-31", image: "🧫", ...payload }, ...list]);
      toast(`${payload.name} added to department inventory.`, "success");
    }
    setEquipModal(null);
  };

  const assignTask = (id, technicianId) => {
    setMaintenance((list) => list.map((m) => (m.id === id ? { ...m, assignedTechnicianId: technicianId, status: "IN_PROGRESS" } : m)));
    const tech = DEMO_TECHNICIANS.find((t) => t.id === technicianId);
    toast(`${id} assigned to ${tech?.name}.`, "success");
  };

  const markNotifRead = (id) => setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      activeView={view}
      setActiveView={setView}
      onLogout={onLogout}
      roleLabel="Lab Manager"
      roleTag="Signed in as"
      userName={user.name}
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
          onAdd={() => setEquipModal("new")}
          onEdit={(id) => setEquipModal(id)}
        />
      )}

      {view === "approvals" && (
        <ApprovalsView
          bookings={bookings}
          equipmentById={equipmentById}
          onApprove={approveBooking}
          onReject={(b) => setRejectTarget(b)}
        />
      )}

      {view === "maintenance" && (
        <MaintenanceOversightView user={user} toast={toast} />
      )}

      {view === "utilization" && (
        <UtilizationHeatmapPage role="manager" user={user} equipment={equipment} bookings={bookings} toast={toast} />
      )}

      {view === "reports" && <ReportsView toast={toast} />}

      {view === "notifications" && <NotificationsView notifications={notifications} onRead={markNotifRead} />}

      {view === "profile" && <ProfileView user={user} toast={toast} />}

      {equipModal && (
        <EquipmentFormModal
          equipment={equipModal !== "new" ? equipmentById[equipModal] : null}
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
/*  3.1  Dashboard Home                                                 */
/* ================================================================== */
function HomeView({ bookings, equipment, maintenance, notifications, onOpenApprovals, onOpenUtilization, onOpenMaintenance }) {
  const pending = bookings.filter((b) => b.status === "PENDING_APPROVAL").length;
  const activeMaintenance = maintenance.filter((m) => m.status !== "COMPLETED" && m.status !== "CANCELLED").length;
  const bookedCount = equipment.filter((e) => e.status === "BOOKED").length;
  const utilization = equipment.length > 0 ? ((bookedCount / equipment.length) * 100).toFixed(1) : "0.0";

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
        <StatCard icon={Gauge} label="Department Utilization Rate" value={`${utilization}%`} tone="text-emerald-600" bg="bg-emerald-50" onClick={onOpenUtilization} />
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

/* ================================================================== */
/*  3.2  Booking Approvals — demo covers Pending / Approved / Rejected  */
/* ================================================================== */
function ApprovalsView({ bookings, equipmentById, onApprove, onReject }) {
  const [tab, setTab] = useState("pending");

  const pending = bookings.filter((b) => b.status === "PENDING_APPROVAL");
  const approved = bookings.filter((b) => b.status === "CONFIRMED");
  const rejected = bookings.filter((b) => b.status === "REJECTED");

  const tabs = [
    { id: "pending", label: `Pending (${pending.length})` },
    { id: "approved", label: `Approved (${approved.length})` },
    { id: "rejected", label: `Rejected (${rejected.length})` },
  ];
  const rows = tab === "pending" ? pending : tab === "approved" ? approved : rejected;

  return (
    <div>
      <ViewHeader title="Booking Approvals" subtitle="Review incoming equipment booking requests for your department." />

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 w-fit mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === t.id ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={CalendarClock} title={`No ${tab} bookings`} />
      ) : (
        <div className="space-y-3">
          {rows.map((b) => (
            <div key={b.id} className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-slate-900">{equipmentById[b.equipmentId]?.name}</p>
                  <span className="text-xs text-slate-400">{b.id}</span>
                  <StatusBadge status={b.status} />
                </div>
                <p className="text-xs text-slate-500 mt-1">{b.researcher} · {b.department}</p>
                <p className="text-xs text-slate-500">{formatDateTime(b.start)} – {formatDateTime(b.end)}</p>
                <p className="text-xs text-slate-600 mt-1.5">{b.purpose}</p>
                {b.status === "REJECTED" && b.rejectionReason && (
                  <p className="text-xs text-red-500 mt-1.5">Reason: {b.rejectionReason}</p>
                )}
              </div>
              {b.status === "PENDING_APPROVAL" && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => onApprove(b.id)} className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 flex items-center gap-1.5 transition-colors">
                    <ThumbsUp size={13} /> Approve
                  </button>
                  <button onClick={() => onReject(b)} className="rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-4 py-2.5 flex items-center gap-1.5 transition-colors">
                    <ThumbsDown size={13} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RejectModal({ booking, equipmentName, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  return (
    <Modal title="Reject Booking" subtitle={`${equipmentName} · ${booking.id}`} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Reason for Rejection" required error={error}>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Let the researcher know why this booking can't be approved…"
            className={inputClass(error)}
          />
        </Field>
        <button
          onClick={() => (reason.trim() ? onConfirm(reason) : setError("A reason is required."))}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Confirm Rejection
        </button>
      </div>
    </Modal>
  );
}



function EquipmentFormModal({ equipment, onClose, onSave }) {
  const [form, setForm] = useState({
    name: equipment?.name || "",
    category: equipment?.category || "",
    department: equipment?.department || "",
    location: equipment?.location || "",
    specs: equipment?.specs || "",
    status: equipment?.status || "AVAILABLE",
    calibrationInterval: equipment?.calibrationInterval || "6 months",
    description: equipment?.description || "",
  });
  const [photo, setPhoto] = useState(equipment?.photoUrl ? { name: "Current photo", previewUrl: equipment.photoUrl } : null);
  const [errors, setErrors] = useState({});
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handlePhoto = (fileList) => {
    const file = fileList?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((e) => ({ ...e, photo: "Please upload an image file (JPG, PNG…)." }));
      return;
    }
    if (photo?.previewUrl) URL.revokeObjectURL(photo.previewUrl);
    setErrors((e) => ({ ...e, photo: undefined }));
    setPhoto({ name: file.name, previewUrl: URL.createObjectURL(file) });
  };
  const removePhoto = () => {
    if (photo?.previewUrl) URL.revokeObjectURL(photo.previewUrl);
    setPhoto(null);
  };

  const submit = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Equipment name is required.";
    if (!form.category.trim()) e.category = "Category is required.";
    if (!form.location.trim()) e.location = "Location is required.";
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({ ...form, photoUrl: photo?.previewUrl || null });
  };

  return (
    <Modal title={equipment ? "Edit Equipment" : "Add Equipment"} subtitle={equipment?.id} onClose={onClose} wide>
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Equipment Name" required error={errors.name}>
            <input value={form.name} onChange={set("name")} placeholder="e.g. Olympus BX53 Microscope" className={inputClass(errors.name)} />
          </Field>
          <Field label="Category" required error={errors.category}>
            <input value={form.category} onChange={set("category")} placeholder="e.g. Microscopy" className={inputClass(errors.category)} />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Location" required error={errors.location}>
            <input value={form.location} onChange={set("location")} placeholder="e.g. Lab 3, Room 105" className={inputClass(errors.location)} />
          </Field>
          <Field label="Calibration Interval">
            <select value={form.calibrationInterval} onChange={set("calibrationInterval")} className={inputClass()}>
              <option>3 months</option>
              <option>6 months</option>
              <option>12 months</option>
            </select>
          </Field>
        </div>
        <Field label="Specifications">
          <input value={form.specs} onChange={set("specs")} placeholder="Key technical specifications" className={inputClass()} />
        </Field>
        <Field label="Equipment Photo" error={errors.photo} hint="Shown to researchers when browsing and booking this equipment.">
          {photo ? (
            <div className="relative w-fit">
              <img src={photo.previewUrl} alt="Equipment preview" className="h-28 w-28 rounded-lg object-cover border border-slate-200" />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-bold shadow hover:bg-slate-700 transition-colors"
                aria-label="Remove photo"
              >
                ×
              </button>
              <p className="mt-1.5 text-xs text-slate-400 truncate max-w-28">{photo.name}</p>
            </div>
          ) : (
            <label className="w-full rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/40 transition-colors py-5 flex flex-col items-center justify-center gap-1 text-slate-500 cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhoto(e.target.files)} />
              <Camera size={18} className="text-blue-600" />
              <span className="text-xs">Upload a photo of the equipment</span>
            </label>
          )}
        </Field>
        <Field label="Description">
          <textarea value={form.description} onChange={set("description")} rows={3} placeholder="Short description for researchers" className={inputClass()} />
        </Field>
        <Field label="Status">
          <select value={form.status} onChange={set("status")} className={inputClass()}>
            {["AVAILABLE", "BOOKED", "UNDER_MAINTENANCE", "OUT_OF_SERVICE", "RETIRED"].map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </Field>
        <button onClick={submit} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
          {equipment ? "Save Changes" : "Add Equipment"}
        </button>
      </div>
    </Modal>
  );
}




/* ================================================================== */
/*  Reports & Analytics (lightweight, frontend-only export demo)        */
/* ================================================================== */
function ReportsView({ toast }) {
  const reportTypes = [
    { id: "UTILIZATION", label: "Utilization Report", desc: "Equipment usage rates by department and time period." },
    { id: "MAINTENANCE", label: "Maintenance Report", desc: "Work orders, downtime, and technician workload." },
    { id: "BUDGET", label: "Cost & Budget Report", desc: "Usage costs and department budget consumption." },
  ];
  return (
    <div>
      <ViewHeader title="Reports & Analytics" subtitle="Generate and export reports for department leadership." />
      <div className="grid sm:grid-cols-3 gap-5">
        {reportTypes.map((r) => (
          <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-3">
              <FileText size={17} />
            </span>
            <h3 className="text-sm font-bold text-slate-900">{r.label}</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{r.desc}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => toast(`${r.label} generated as PDF.`, "success")}
                className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download size={12} /> PDF
              </button>
              <button
                onClick={() => toast(`${r.label} generated as Excel.`, "success")}
                className="flex-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download size={12} /> Excel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Notifications                                                       */
/* ================================================================== */
function NotificationsView({ notifications, onRead }) {
  return (
    <div>
      <ViewHeader title="Notifications" subtitle="Booking requests, maintenance alerts, and utilization reports." />
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
function ProfileView({ user, toast }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: user.firstName, lastName: user.lastName, phone: user.phone });

  return (
    <div>
      <ViewHeader title="Profile" subtitle="Manage your Lab Manager account details." />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 max-w-2xl">
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
    </div>
  );
}