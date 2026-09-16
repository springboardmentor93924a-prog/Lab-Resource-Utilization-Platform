import { useMemo, useState, useEffect } from "react";
import {
  LayoutDashboard, Package, Gauge, Share2, FileText, UserRound, Wrench,
  Wallet, Recycle,
} from "lucide-react";
import {
  StatusBadge, StatCard, DashboardShell, ViewHeader, EmptyState,
} from "../shared/ui.jsx";
import UtilizationHeatmapPage from "../shared/UtilizationHeatmapPage.jsx";
import MaintenanceOversightView from "../shared/MaintenanceOversightView.jsx";
import DepartmentEquipmentView from "../shared/DepartmentEquipmentView.jsx";
import { SharingControlCenter } from "../departmentHead/sharing/SharingControlCenter.jsx";
import { DEMO_BOOKINGS } from "../../data/mockData.js";
import { equipmentApi } from "../../api/equipmentApi.js";

const NAV_ITEMS = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard },
  { id: "equipment", label: "Department Equipment", icon: Package },
  { id: "sharing", label: "Cross-Institution Sharing", icon: Share2 },
  { id: "maintenance", label: "Maintenance", icon: Wrench },
  { id: "utilization", label: "Utilization Heatmap", icon: Gauge },
  { id: "reports", label: "Reports & Analytics", icon: FileText },
  { id: "profile", label: "Profile", icon: UserRound },
];

export default function DepartmentHeadDashboard({ user, onLogout, toast }) {
  const [view, setView] = useState("home");
  const [equipment, setEquipment] = useState([]);
  const [loadingEq, setLoadingEq] = useState(true);
  const [bookings] = useState(DEMO_BOOKINGS);

  useEffect(() => {
    setLoadingEq(true);
    equipmentApi
      .search({ institutionId: user?.institutionId, departmentId: user?.departmentId })
      .then((data) => setEquipment(data || []))
      .catch((err) => toast?.(err.message || "Failed to load equipment.", "error"))
      .finally(() => setLoadingEq(false));
  }, [user?.institutionId, user?.departmentId]);

  const deptEquipment = useMemo(() => equipment, [equipment]);

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      activeView={view}
      setActiveView={setView}
      onLogout={onLogout}
      roleLabel="Department Head"
      roleTag="Signed in as"
      userName={user.name}
    >
      {view === "home" && (
        <HomeView user={user} deptEquipment={deptEquipment} onOpenUtilization={() => setView("utilization")} onOpenSharing={() => setView("sharing")} />
      )}
      {view === "equipment" && <DepartmentEquipmentView user={user} toast={toast} readOnly />}
      {view === "sharing" && <SharingControlCenter user={user} deptEquipment={deptEquipment} toast={toast} />}
      {view === "maintenance" && <MaintenanceOversightView user={user} toast={toast} departmentId={user.departmentId} />}
      {view === "utilization" && (
        <UtilizationHeatmapPage role="department-head" user={user} equipment={equipment} bookings={bookings} toast={toast} />
      )}
      {view === "reports" && <ReportsView toast={toast} />}
      {view === "profile" && <ProfileView user={user} toast={toast} />}
    </DashboardShell>
  );
}

/* ---------------------------------------------------------------- */
function HomeView({ user, deptEquipment, onOpenUtilization, onOpenSharing }) {
  const utilization = 71.4; // headline figure — see Utilization & Analytics for the full breakdown
  const budgetUsedPct = 62;
  const roiFlags = deptEquipment.filter((e) => e.calibrationStatus === "Overdue").length;

  return (
    <div>
      <ViewHeader title="Department Head Dashboard" subtitle={`${user.department} Department — utilization, budget, and cross-institution activity.`} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Gauge} label="Overall Department Utilization" value={`${utilization}%`} tone="text-blue-600" bg="bg-blue-50" onClick={onOpenUtilization} />
        <StatCard icon={Wallet} label="Budget Utilization" value={`${budgetUsedPct}%`} tone="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={Share2} label="Cross-Institution Sharing" value="View" tone="text-amber-600" bg="bg-amber-50" onClick={onOpenSharing} />
        <StatCard icon={Recycle} label="Equipment ROI & Lifecycle Flags" value={roiFlags} tone="text-orange-600" bg="bg-orange-50" />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Department Equipment Snapshot</h2>
          <span className="text-xs text-slate-400">{deptEquipment.length} assets</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {["AVAILABLE", "BOOKED", "UNDER_MAINTENANCE", "OUT_OF_SERVICE"].map((s) => (
            <div key={s} className="rounded-xl border border-slate-100 bg-slate-50 p-3 flex items-center justify-between">
              <StatusBadge status={s} />
              <span className="font-bold text-slate-700 text-sm">{deptEquipment.filter((e) => e.status === s).length}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
function EquipmentCatalogView({ equipment, loading, department }) {
  return (
    <div>
      <ViewHeader title="Department Equipment Catalog" subtitle={`Full inventory catalog for the ${department || "Department"} (read-only — managed by your Lab Manager).`} />
      {loading ? (
        <p className="text-sm text-slate-500 py-4">Loading equipment catalog...</p>
      ) : equipment.length === 0 ? (
        <EmptyState icon={Package} title="No equipment on record" />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="text-left font-semibold px-5 py-3">Equipment</th>
                <th className="text-left font-semibold px-5 py-3">Category</th>
                <th className="text-left font-semibold px-5 py-3">Laboratory</th>
                <th className="text-left font-semibold px-5 py-3">Location</th>
                <th className="text-left font-semibold px-5 py-3">Calibration Status</th>
                <th className="text-left font-semibold px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {equipment.map((e) => (
                <tr key={e.equipmentId || e.id}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {e.imageSecureUrl ? (
                        <img src={e.imageSecureUrl} alt={e.name} className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <span className="text-lg">{e.image || "🧫"}</span>
                      )}
                      <div>
                        <p className="font-semibold text-slate-800">{e.name}</p>
                        <p className="text-xs text-slate-400">{e.serialNumber || `ID: ${e.equipmentId || e.id}`}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{e.category}</td>
                  <td className="px-5 py-3.5 text-slate-600">{e.labName || "—"}</td>
                  <td className="px-5 py-3.5 text-slate-600">{e.location || "—"}</td>
                  <td className="px-5 py-3.5 text-slate-600">{e.calibrationStatus || "N/A"}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* BudgetView and SharingView removed — sharing is now handled by SharingControlCenter */


/* ---------------------------------------------------------------- */
function ReportsView({ toast }) {
  const reportTypes = [
    { id: "UTILIZATION", label: "Equipment Utilization", desc: "Department utilization vs. institutional benchmark." },
    { id: "MAINTENANCE", label: "Maintenance Downtime", desc: "Work orders, downtime, and technician workload." },
    { id: "BUDGET", label: "Budget Audit", desc: "Usage-based cost allocation and chargeback detail." },
  ];
  return (
    <div>
      <ViewHeader title="Reports & Export" subtitle="Generate reports for institutional leadership." />
      <div className="grid sm:grid-cols-3 gap-5">
        {reportTypes.map((r) => (
          <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-3"><FileText size={17} /></span>
            <h3 className="text-sm font-bold text-slate-900">{r.label}</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{r.desc}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => toast(`${r.label} exported as PDF.`, "success")} className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 flex items-center justify-center gap-1.5 transition-colors">
                <Download size={12} /> PDF
              </button>
              <button onClick={() => toast(`${r.label} exported as Excel.`, "success")} className="flex-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 flex items-center justify-center gap-1.5 transition-colors">
                <Download size={12} /> Excel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
function ProfileView({ user, toast }) {
  const [editing, setEditing] = useState(false);
  return (
    <div>
      <ViewHeader title="Profile" subtitle="Manage your Department Head account details." />
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
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs font-semibold text-slate-500 mb-1">Department</p><p className="text-slate-800">{user.department}</p></div>
          <div><p className="text-xs font-semibold text-slate-500 mb-1">Institution</p><p className="text-slate-800">{user.institution}</p></div>
          <div><p className="text-xs font-semibold text-slate-500 mb-1">Phone</p><p className="text-slate-800">{user.phone}</p></div>
          <div><p className="text-xs font-semibold text-slate-500 mb-1">Role</p><p className="text-slate-800">Department Head</p></div>
        </div>
        <button onClick={() => { setEditing((v) => !v); if (editing) toast("Profile updated.", "success"); }} className="mt-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors">
          {editing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>
    </div>
  );
}
