import { useState } from "react";
import { Gauge, Wallet, ShieldAlert } from "lucide-react";
import { UtilizationEffectivenessView } from "./UtilizationEffectivenessView.jsx";
import { CostAnalysisView } from "./CostAnalysisView.jsx";

export default function ReportsContainer({ user, role, toast }) {
  // Normalize user roles
  const roles = user?.roles || [];
  const userRole = role || (
    roles.includes("INSTITUTION_ADMIN") || roles.includes("ROLE_INSTITUTION_ADMIN") ? "INSTITUTION_ADMIN" :
    roles.includes("DEPARTMENT_HEAD") || roles.includes("ROLE_DEPARTMENT_HEAD") ? "DEPARTMENT_HEAD" :
    roles.includes("LAB_MANAGER") || roles.includes("ROLE_LAB_MANAGER") ? "LAB_MANAGER" : "OTHER"
  );

  const isInstAdmin = userRole === "INSTITUTION_ADMIN";
  const isDeptHead = userRole === "DEPARTMENT_HEAD";
  const isLabManager = userRole === "LAB_MANAGER";

  const canViewCostAnalysis = isInstAdmin || isDeptHead;
  const canViewReports = isInstAdmin || isDeptHead || isLabManager;

  const [activeTab, setActiveTab] = useState("utilization");

  if (!canViewReports) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center my-6">
        <ShieldAlert size={36} className="mx-auto text-red-500 mb-3" />
        <h2 className="text-base font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
          You don't have permission to access Reports &amp; Analytics. This module is restricted to Lab Managers, Department Heads, and Institution Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TAB NAVIGATION HEADER (for Dept Head & Inst Admin who can view multiple reports) */}
      {canViewCostAnalysis && (
        <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-2xl pt-3 gap-2">
          <button
            onClick={() => setActiveTab("utilization")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === "utilization"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            <Gauge size={16} />
            <span>Utilization Effectiveness</span>
          </button>
          <button
            onClick={() => setActiveTab("cost")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === "cost"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            <Wallet size={16} />
            <span>Cost Analysis &amp; Budget</span>
          </button>
        </div>
      )}

      {/* RENDER ACTIVE REPORT VIEW */}
      {(activeTab === "utilization" || isLabManager) && (
        <UtilizationEffectivenessView user={user} role={userRole} toast={toast} />
      )}

      {activeTab === "cost" && canViewCostAnalysis && (
        <CostAnalysisView user={user} role={userRole} toast={toast} />
      )}
    </div>
  );
}
