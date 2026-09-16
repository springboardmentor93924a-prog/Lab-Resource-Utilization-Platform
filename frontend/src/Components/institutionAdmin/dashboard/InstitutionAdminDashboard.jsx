import { useMemo, useState, useEffect } from "react";
import { Package, Gauge, Share2, ShieldCheck, Building2 } from "lucide-react";
import { DashboardShell } from "../../common/DashboardShell.jsx";
import { StatCard } from "../../common/StatCard.jsx";
import { ViewHeader } from "../../common/ViewHeader.jsx";
import { NAV_ITEMS } from "./navItems.js";
import EquipmentManagement from "../equipment/EquipmentManagement.jsx";
import SharingEquipment from "../sharing/SharingEquipment.jsx";
import UserManagement from "../users/UserManagement.jsx";
import StudentApplications from "../users/StudentApplications.jsx";
import Analytics from "../analytics/Analytics.jsx";
import ReportsContainer from "../../reports/ReportsContainer.jsx";
import Billing from "../billing/Billing.jsx";
import AuditLogs from "../audit/AuditLogs.jsx";
import Profile from "../profile/Profile.jsx";
import { equipmentApi } from "../../../api/equipmentApi.js";
import { sharingApi } from "../../../api/sharingApi.js";
import { API_BASE_URL } from "../../../api/client.js";

/* ================================================================== */
/*  Institution Admin -> Dashboard (orchestrator: state + nav + Home)  */
/* ================================================================== */
export default function InstitutionAdminDashboard({ user, onLogout, toast }) {
  const [view, setView] = useState("home");
  const [equipment, setEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [incomingSharingCount, setIncomingSharingCount] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");

  useEffect(() => {
    const instId = user?.institutionId;
    const token = localStorage.getItem("labflow_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    if (instId) {
      equipmentApi.search({ institutionId: instId })
        .then((data) => setEquipment(data || []))
        .catch(() => setEquipment([]));
    }

    // Fetch real pending student applications for institution admin approval KPI
    fetch(`${API_BASE_URL}/users/students?activeOnly=false`, { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          // Genuine pending review applications: inactive, not yet reviewed, not rejected
          const pending = data.filter((s) => s.isActive === false && !s.reviewedAt && !s.rejectionReason).length;
          setPendingApprovalsCount(pending);
        }
      })
      .catch(() => setPendingApprovalsCount(0));

    // Fetch real incoming sharing requests
    sharingApi.getIncomingRequests()
      .then((data) => setIncomingSharingCount(Array.isArray(data) ? data.filter((r) => r.status === "PENDING").length : 0))
      .catch(() => setIncomingSharingCount(0));
  }, [user]);

  const departments = useMemo(() => [...new Set(equipment.map((e) => e.departmentName || e.department).filter(Boolean))].sort(), [equipment]);

  const handleSelectDepartment = (deptName) => {
    let code = "ALL";
    const lower = (deptName || "").toLowerCase();
    if (lower.includes("computer") || lower.includes("cse")) code = "CSE";
    else if (lower.includes("electrical") || lower.includes("eee")) code = "EEE";
    else if (lower.includes("electronics") || lower.includes("ece")) code = "ECE";
    else if (lower.includes("information") || lower.includes("it")) code = "IT";
    else if (lower.includes("artificial") || lower.includes("ai")) code = "AI & DS";
    else if (lower.includes("mechanical")) code = "Mechanical";
    else if (lower.includes("civil")) code = "Civil";
    else code = deptName;

    setSelectedDepartment(code);
    setView("network");
  };

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      activeView={view}
      setActiveView={setView}
      onLogout={onLogout}
      roleLabel="Institution Administrator"
      roleTag="Signed in as"
      userName={user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || "Administrator"}
    >
      {view === "home" && (
        <HomeView
          user={user}
          equipment={equipment}
          pendingApprovals={pendingApprovalsCount}
          incomingSharingCount={incomingSharingCount}
          onOpenAnalytics={() => setView("reports")}
          onOpenSharing={() => setView("sharing")}
          onOpenStudents={() => setView("students")}
          onSelectDepartment={handleSelectDepartment}
        />
      )}
      {view === "students" && <StudentApplications toast={toast} />}
      {view === "network" && (
        <EquipmentManagement
          user={user}
          equipment={equipment}
          departments={departments}
          initialDept={selectedDepartment}
        />
      )}
      {view === "sharing" && <SharingEquipment user={user} toast={toast} />}
      {view === "users" && <UserManagement toast={toast} />}
      {view === "reports" && (
        <ReportsContainer user={user} role="INSTITUTION_ADMIN" toast={toast} />
      )}
      {view === "analytics" && (
        <Analytics role="institution-admin" user={user} equipment={equipment} bookings={bookings} toast={toast} />
      )}
      {view === "billing" && <Billing />}
      {view === "audit" && <AuditLogs />}
      {view === "profile" && <Profile user={user} toast={toast} />}
    </DashboardShell>
  );
}

/* ================================================================== */
/*  Institution Admin -> Dashboard -> Home                              */
/* ================================================================== */
function HomeView({ user, equipment, pendingApprovals, incomingSharingCount, onOpenAnalytics, onOpenSharing, onOpenStudents, onSelectDepartment }) {
  const activeEquipment = equipment.filter((e) => e.status !== "RETIRED");

  const departmentCounts = useMemo(() => {
    const uniqueDepts = Array.from(new Set(equipment.map((e) => e.departmentName || e.department).filter(Boolean))).sort();
    return uniqueDepts.map((d) => {
      const matchCount = equipment.filter((e) => (e.departmentName || e.department) === d).length;
      return {
        name: d,
        count: matchCount,
      };
    });
  }, [equipment]);

  return (
    <div>
      <ViewHeader title="Institution Administrator Dashboard" subtitle={`${user?.institutionName || user?.institution || "Institution"} — institution-wide equipment, sharing, and access oversight.`} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total Active Equipment" value={activeEquipment.length} tone="text-blue-600" bg="bg-blue-50" onClick={onOpenAnalytics} />
        <StatCard icon={Gauge} label="Reports & Analytics" value="View Reports" tone="text-emerald-600" bg="bg-emerald-50" onClick={onOpenAnalytics} />
        <StatCard icon={Share2} label="Incoming Sharing Requests" value={incomingSharingCount > 0 ? `${incomingSharingCount} pending` : "All settled"} tone="text-indigo-600" bg="bg-indigo-50" onClick={onOpenSharing} />
        <StatCard icon={ShieldCheck} label="Pending Student Approvals" value={pendingApprovals} tone="text-amber-600" bg="bg-amber-50" onClick={onOpenStudents} />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Equipment by Department</h2>
            <p className="text-xs text-slate-500 mt-0.5">Click any department card to view equipment catalog.</p>
          </div>
        </div>
        {departmentCounts.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No equipment cataloged by department yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {departmentCounts.map(({ name, count }, idx) => (
              <button
                key={`${name || 'dept'}-${idx}`}
                onClick={() => onSelectDepartment(name)}
                className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/80 hover:border-blue-300 p-3.5 flex items-center justify-between text-left transition-all group cursor-pointer shadow-2xs"
              >
                <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 flex items-center gap-2 leading-tight">
                  <Building2 size={15} className="text-blue-500 flex-shrink-0" />
                  {name}
                </span>
                <span className="font-extrabold text-blue-700 bg-blue-100/80 group-hover:bg-blue-600 group-hover:text-white px-2.5 py-1 rounded-lg text-xs transition-colors flex-shrink-0 ml-2">
                  {count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
