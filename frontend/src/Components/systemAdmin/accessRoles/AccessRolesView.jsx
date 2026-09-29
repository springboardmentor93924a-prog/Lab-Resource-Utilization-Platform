import React, { useState } from "react";
import { Lock, Shield, Users, CheckCircle2, XCircle, Info, ChevronRight } from "lucide-react";

const ROLES_INFO = [
  {
    role: "SYSTEM_ADMIN",
    title: "System Administrator",
    badge: "bg-purple-100 text-purple-800 border-purple-200",
    scope: "Platform Level (Multi-Tenant Network)",
    authority: "Global Authority",
    description: "Full platform governance, institution onboarding approval, platform-wide user governance, audit logging, system settings, and cross-institution monitoring.",
    capabilities: [
      "Approve / Reject institution registration requests",
      "Deactivate / Reactivate any user across institutions with reason log",
      "Monitor all staff invitations across institutions",
      "Access global audit log trail",
      "View global platform analytics and cross-institution sharing",
      "Manage system-wide configuration parameters"
    ]
  },
  {
    role: "INSTITUTION_ADMIN",
    title: "Institution Administrator",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
    scope: "Single Institution Scope",
    authority: "Institution Authority",
    description: "Institution-level administration, department setup, staff invitation, pending researcher approval within institution, and institution resource oversight.",
    capabilities: [
      "Manage institution profile and department structure",
      "Invite staff (Department Heads, Lab Managers, Technicians)",
      "Approve / Reject pending researcher registrations for institution",
      "Configure institution-level sharing policies",
      "View institution resource utilization reports"
    ]
  },
  {
    role: "DEPARTMENT_HEAD",
    title: "Department Head",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
    scope: "Department Scope",
    authority: "Departmental Authority",
    description: "Departmental lab oversight, budget/cost management, equipment approval flow, and departmental utilization tracking.",
    capabilities: [
      "View all labs and equipment within department",
      "Review and approve cross-department/institution sharing requests",
      "Monitor departmental maintenance and utilization metrics",
      "Manage departmental staff assignments"
    ]
  },
  {
    role: "LAB_MANAGER",
    title: "Lab Manager",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
    scope: "Assigned Laboratory Scope",
    authority: "Operational Manager",
    description: "Day-to-day lab operations, equipment registration, slot scheduling, maintenance logs, and booking request approvals.",
    capabilities: [
      "Register and update equipment under assigned lab",
      "Approve or decline booking requests",
      "Manage equipment status (AVAILABLE, MAINTENANCE, DECOMMISSIONED)",
      "Log equipment maintenance records and calibrated schedules"
    ]
  },
  {
    role: "LAB_TECHNICIAN",
    title: "Lab Technician",
    badge: "bg-teal-100 text-teal-800 border-teal-200",
    scope: "Assigned Laboratory Scope",
    authority: "Technical Support",
    description: "Technical equipment maintenance, operational checks, slot assistance, and live equipment status updates.",
    capabilities: [
      "Update equipment live operational status",
      "Perform scheduled maintenance logs",
      "Assist researchers with booking check-ins"
    ]
  },
  {
    role: "RESEARCHER",
    title: "Researcher / Student",
    badge: "bg-slate-100 text-slate-800 border-slate-200",
    scope: "User / Requestor Scope",
    authority: "End User / Scholar",
    description: "Equipment discovery, slot booking, reservation tracking, and cross-institution resource search.",
    capabilities: [
      "Search equipment across internal department and shared institutions",
      "Book available time slots on eligible equipment",
      "View personal booking history and notification updates"
    ]
  }
];

const PERMISSIONS_MATRIX = [
  { feature: "Platform Onboarding & Approvals", sysAdmin: true, instAdmin: false, deptHead: false, manager: false, tech: false, researcher: false },
  { feature: "Platform-Wide User Governance", sysAdmin: true, instAdmin: false, deptHead: false, manager: false, tech: false, researcher: false },
  { feature: "Global Audit Log Access", sysAdmin: true, instAdmin: false, deptHead: false, manager: false, tech: false, researcher: false },
  { feature: "Institution Staff Invitations", sysAdmin: true, instAdmin: true, deptHead: false, manager: false, tech: false, researcher: false },
  { feature: "Student/Researcher Approval", sysAdmin: true, instAdmin: true, deptHead: false, manager: false, tech: false, researcher: false },
  { feature: "Department Setup & Policy", sysAdmin: true, instAdmin: true, deptHead: true, manager: false, tech: false, researcher: false },
  { feature: "Equipment Registration & Mgmt", sysAdmin: false, instAdmin: false, deptHead: false, manager: true, tech: true, researcher: false },
  { feature: "Booking Request Approval", sysAdmin: false, instAdmin: false, deptHead: false, manager: true, tech: false, researcher: false },
  { feature: "Maintenance Logging", sysAdmin: false, instAdmin: false, deptHead: false, manager: true, tech: true, researcher: false },
  { feature: "Slot Search & Equipment Booking", sysAdmin: false, instAdmin: false, deptHead: false, manager: false, tech: false, researcher: true }
];

export default function AccessRolesView() {
  const [selectedRole, setSelectedRole] = useState(ROLES_INFO[0].role);

  const activeRoleData = ROLES_INFO.find((r) => r.role === selectedRole) || ROLES_INFO[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Access Control & Role Hierarchy</h1>
        <p className="text-sm text-slate-600">Overview of platform-wide Role-Based Access Control (RBAC), authority scopes, and security permissions.</p>
      </div>

      {/* Role Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {ROLES_INFO.map((r) => {
          const isSelected = r.role === selectedRole;
          return (
            <button
              key={r.role}
              onClick={() => setSelectedRole(r.role)}
              className={`rounded-2xl p-4 text-left border transition-all ${
                isSelected
                  ? "border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${r.badge}`}>
                {r.role}
              </span>
              <p className="text-xs font-bold text-slate-900 mt-2 truncate">{r.title}</p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{r.authority}</p>
            </button>
          );
        })}
      </div>

      {/* Active Role Detail */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white font-bold">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{activeRoleData.title}</h2>
              <p className="text-xs font-medium text-slate-500">Scope: <span className="text-slate-800 font-semibold">{activeRoleData.scope}</span></p>
            </div>
          </div>
          <span className={`self-start sm:self-auto inline-flex rounded-full px-3 py-1 text-xs font-bold border ${activeRoleData.badge}`}>
            {activeRoleData.authority}
          </span>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed">{activeRoleData.description}</p>

        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Key Role Capabilities & Privileges</h4>
          <div className="grid sm:grid-cols-2 gap-2">
            {activeRoleData.capabilities.map((cap, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{cap}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Shield size={18} className="text-blue-600" /> Platform Security Permissions Matrix
        </h3>
        <p className="text-xs text-slate-600">Cross-role permission breakdown enforced by Spring Security `@PreAuthorize` backend annotations.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Feature / Action</th>
                <th className="px-3 py-3 text-center">Sys Admin</th>
                <th className="px-3 py-3 text-center">Inst Admin</th>
                <th className="px-3 py-3 text-center">Dept Head</th>
                <th className="px-3 py-3 text-center">Lab Mgr</th>
                <th className="px-3 py-3 text-center">Technician</th>
                <th className="px-3 py-3 text-center">Researcher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERMISSIONS_MATRIX.map((pm, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-semibold text-slate-900">{pm.feature}</td>
                  <td className="px-3 py-3 text-center">
                    {pm.sysAdmin ? <CheckCircle2 size={16} className="mx-auto text-emerald-600" /> : <XCircle size={16} className="mx-auto text-slate-300" />}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {pm.instAdmin ? <CheckCircle2 size={16} className="mx-auto text-emerald-600" /> : <XCircle size={16} className="mx-auto text-slate-300" />}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {pm.deptHead ? <CheckCircle2 size={16} className="mx-auto text-emerald-600" /> : <XCircle size={16} className="mx-auto text-slate-300" />}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {pm.manager ? <CheckCircle2 size={16} className="mx-auto text-emerald-600" /> : <XCircle size={16} className="mx-auto text-slate-300" />}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {pm.tech ? <CheckCircle2 size={16} className="mx-auto text-emerald-600" /> : <XCircle size={16} className="mx-auto text-slate-300" />}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {pm.researcher ? <CheckCircle2 size={16} className="mx-auto text-emerald-600" /> : <XCircle size={16} className="mx-auto text-slate-300" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
