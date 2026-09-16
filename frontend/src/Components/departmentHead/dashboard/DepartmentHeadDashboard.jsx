import { useMemo, useState, useEffect } from "react";
import { Gauge, Wallet, Recycle, Building2 } from "lucide-react";
import { DashboardShell } from "../../common/DashboardShell.jsx";
import { StatCard } from "../../common/StatCard.jsx";
import { ViewHeader } from "../../common/ViewHeader.jsx";
import { StatusBadge } from "../../common/StatusBadge.jsx";
import { NAV_ITEMS } from "./navItems.js";
import Equipment from "../equipment/Equipment.jsx";
import Utilization from "../utilization/Utilization.jsx";
import Budget from "../budget/Budget.jsx";
import Reports from "../reports/Reports.jsx";
import Profile from "../profile/Profile.jsx";
import { SharingControlCenter } from "../sharing/SharingControlCenter.jsx";
import MaintenanceOversightView from "../../shared/MaintenanceOversightView.jsx";
import { equipmentApi } from "../../../api/equipmentApi.js";

/* ================================================================== */
/*  Department Head -> Dashboard (orchestrator: state + nav + Home)     */
/*                                                                       */
/*  IMPORTANT: This dashboard used to include an "Inter-Institution      */
/*  Requests" sharing feature (SharingView + DEMO_SHARING_REQUESTS).     */
/*  Per the strict requirement that equipment sharing must exist ONLY    */
/*  under Institution Admin, that feature (and its demo data) has been   */
/*  moved to institutionAdmin/sharing/DepartmentSharingRequests.jsx,     */
/*  reachable there as the "Department Requests" tab. The "Cross-        */
/*  Department Sharing Requests" stat card that used to link to it has   */
/*  been removed from this Home view accordingly.                       */
/* ================================================================== */
export default function DepartmentHeadDashboard({ user, onLogout, toast }) {
  const [view, setView] = useState("home");
  const [equipment, setEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("labflow_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const fetchLiveData = async () => {
      try {
        const instId = user?.institutionId;
        const realEq = await equipmentApi.search(instId ? { institutionId: instId } : {});
        if (isMounted && Array.isArray(realEq) && realEq.length > 0) {
          const mappedEq = realEq.map((e) => ({
            ...e,
            id: String(e.equipmentId || e.id),
            name: e.name || e.equipmentName || "",
            category: e.category || "General",
            department: e.departmentName || "Computer Science and Engineering",
            location: e.location || "",
            status: e.status || "AVAILABLE",
            description: e.description || "",
            specs: `${e.manufacturer || "Generic"} ${e.model || ""} - SN: ${e.serialNumber || "N/A"}`,
            calibrationStatus: e.calibrationStatus || "NOT_RECORDED",
            nextCalibrationDue: e.nextCalibrationDue || e.nextCalibrationDate || null,
            nextCalibration: e.nextCalibrationDue || e.nextCalibrationDate || null,
            // Sharing fields — preserved from backend EquipmentDto
            isShareable: e.isShareable ?? false,
            externalHourlyRate: e.externalHourlyRate ?? null,
            capacityPerSlot: e.capacityPerSlot ?? null,
            specifications: e.specifications ?? null,
            // Image — keep raw Cloudinary URL (rendered by <img> tag, NOT as text)
            imageSecureUrl: e.imageSecureUrl || null,
            image: e.imageSecureUrl || null,
          }));
          setEquipment(mappedEq);
        }
      } catch (err) {
        console.warn("Could not fetch equipment for department head:", err);
      }
    };

    fetchLiveData();
    return () => { isMounted = false; };
  }, [user]);

  const deptEquipment = useMemo(() => {
    const userDept = (user.department || "Computer Science and Engineering").toLowerCase();
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
        <HomeView user={user} deptEquipment={deptEquipment} onOpenUtilization={() => setView("utilization")} />
      )}
      {view === "equipment" && <Equipment equipment={deptEquipment} department={user.department} user={user} />}
      {view === "sharing" && <SharingControlCenter user={user} deptEquipment={deptEquipment} toast={toast} />}
      {view === "maintenance" && (
        <MaintenanceOversightView user={user} toast={toast} departmentId={user?.departmentId} role="department-head" />
      )}
      {view === "utilization" && (
        <Utilization role="department-head" user={user} equipment={equipment} bookings={bookings} toast={toast} />
      )}
      {view === "budget" && <Budget deptEquipment={deptEquipment} />}
      {view === "reports" && <Reports user={user} toast={toast} />}
      {view === "profile" && <Profile user={user} toast={toast} />}
    </DashboardShell>
  );
}

/* ================================================================== */
/*  Department Head -> Dashboard -> Home                                */
/* ================================================================== */
function HomeView({ user, deptEquipment, onOpenUtilization }) {
  const roiFlags = deptEquipment.filter((e) => (e.calibrationStatus || "").toUpperCase() === "OVERDUE").length;

  return (
    <div>
      <ViewHeader title="Department Head Dashboard" subtitle={`${user.department || user.departmentName || "Department"} — equipment lifecycle and operational analytics.`} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Gauge} label="Department Utilization" value="View Analytics" tone="text-blue-600" bg="bg-blue-50" onClick={onOpenUtilization} />
        <StatCard icon={Wallet} label="Department Assets" value={`${deptEquipment.length} items`} tone="text-emerald-600" bg="bg-emerald-50" />
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
