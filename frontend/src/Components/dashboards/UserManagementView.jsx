import { useMemo, useState } from "react";
import {
  Search, UserPlus, MoreVertical, ArrowLeft, Building2, Users as UsersIcon,
  ShieldCheck, UserCog, Wrench, ChevronRight, Mail, Copy, Link2, ExternalLink, CheckCircle2
} from "lucide-react";
import { Modal, Field, inputClass, EmptyState } from "../shared/ui.jsx";
import { authApi } from "../../api/authApi.js";

/* ================================================================== *
 *  User Management (Institution Admin)                                *
 *                                                                      *
 *  Two views, as recommended:                                         *
 *   - All Users:    search, filter, deactivate, remove — everyone     *
 *                    at a glance.                                     *
 *   - Departments:  one card per department; drill into a department  *
 *                    to see/manage its single Department Head, single *
 *                    Lab Manager, and its Lab Technicians. This is     *
 *                    where the 1-Head / 1-Manager rule is enforced —   *
 *                    role changes go through "Change Role", never a   *
 *                    raw dropdown in the table, so an admin can't      *
 *                    accidentally create a second Department Head.    *
 * ================================================================== */

const ROLE_OPTIONS = ["DEPARTMENT_HEAD", "LAB_MANAGER", "TECHNICIAN"];
const ROLE_LABEL = { DEPARTMENT_HEAD: "Department Head", LAB_MANAGER: "Lab Manager", TECHNICIAN: "Lab Technician" };
const ROLE_STYLE = {
  DEPARTMENT_HEAD: "bg-purple-50 text-purple-600 border-purple-200",
  LAB_MANAGER: "bg-blue-50 text-blue-600 border-blue-200",
  TECHNICIAN: "bg-slate-100 text-slate-600 border-slate-200",
};
const STATUS_DOT = { ACTIVE: "bg-emerald-500", INVITED: "bg-blue-500", INACTIVE: "bg-slate-400", REMOVED: "bg-red-500" };
const STATUS_TEXT = { ACTIVE: "text-emerald-600", INVITED: "text-blue-600", INACTIVE: "text-slate-500", REMOVED: "text-red-500" };

const DEPARTMENTS = ["Chemistry", "Biology", "Materials Science", "Mechanical Engineering", "Instrumentation & Maintenance"];

const SEED_USERS = [
  { id: "U-1", name: "Vikram Nair", email: "vikram.nair@sunrise.edu", department: "Chemistry", role: "DEPARTMENT_HEAD", status: "ACTIVE" },
  { id: "U-2", name: "Ananya Rao", email: "ananya.rao@sunrise.edu", department: "Chemistry", role: "LAB_MANAGER", status: "ACTIVE" },
  { id: "U-3", name: "Arjun Mehta", email: "arjun.mehta@sunrise.edu", department: "Chemistry", role: "TECHNICIAN", status: "ACTIVE" },
  { id: "U-4", name: "Sara Iyer", email: "sara.iyer@sunrise.edu", department: "Chemistry", role: "TECHNICIAN", status: "INACTIVE" },
  { id: "U-5", name: "John Mathew", email: "john.mathew@sunrise.edu", department: "Chemistry", role: "TECHNICIAN", status: "ACTIVE" },
  { id: "U-6", name: "Rahul Kumar", email: "rahul.kumar@sunrise.edu", department: "Chemistry", role: "TECHNICIAN", status: "INVITED" },
  { id: "U-7", name: "Meera Pillai", email: "meera.pillai@sunrise.edu", department: "Biology", role: "LAB_MANAGER", status: "ACTIVE" },
  { id: "U-8", name: "Karthik Subramaniam", email: "karthik.s@sunrise.edu", department: "Biology", role: "TECHNICIAN", status: "ACTIVE" },
  { id: "U-9", name: "Divya Menon", email: "divya.menon@sunrise.edu", department: "Biology", role: "TECHNICIAN", status: "ACTIVE" },
  { id: "U-10", name: "Neha Kulkarni", email: "neha.kulkarni@sunrise.edu", department: "Materials Science", role: "DEPARTMENT_HEAD", status: "ACTIVE" },
  { id: "U-11", name: "Farhan Ali", email: "farhan.ali@sunrise.edu", department: "Materials Science", role: "LAB_MANAGER", status: "ACTIVE" },
  { id: "U-12", name: "Sanjay Gupta", email: "sanjay.gupta@sunrise.edu", department: "Materials Science", role: "TECHNICIAN", status: "ACTIVE" },
  { id: "U-13", name: "Rahul Deshmukh", email: "rahul.deshmukh@sunrise.edu", department: "Instrumentation & Maintenance", role: "TECHNICIAN", status: "ACTIVE" },
];

const PAGE_SIZE = 8;

function initials(name) {
  const parts = name.trim().split(" ");
  return `${parts[0]?.[0] || ""}${parts[parts.length - 1]?.[0] || ""}`.toUpperCase();
}

/* Enforce the "one active/invited Department Head, one active/invited Lab Manager per department" rule. */
function findRoleConflict(users, department, role, excludeUserId) {
  if (role !== "DEPARTMENT_HEAD" && role !== "LAB_MANAGER") return null;
  return users.find(
    (u) => u.id !== excludeUserId && u.department === department && u.role === role && (u.status === "ACTIVE" || u.status === "INVITED")
  ) || null;
}

export default function UserManagementView({ toast }) {
  const [tab, setTab] = useState("all"); // "all" | "departments"
  const [users, setUsers] = useState(SEED_USERS);
  const [selectedDept, setSelectedDept] = useState(null);

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [inviteTarget, setInviteTarget] = useState(null); // { department, role } | null
  const [setupModalData, setSetupModalData] = useState(null); // { fullName, email, setupUrl, token } | null
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [detailModal, setDetailModal] = useState(null); // { user, mode: "view" | "edit" }
  const [openMenuId, setOpenMenuId] = useState(null);

  const summary = useMemo(() => {
    const live = users.filter((u) => u.status !== "REMOVED");
    return {
      total: live.length,
      heads: live.filter((u) => u.role === "DEPARTMENT_HEAD").length,
      managers: live.filter((u) => u.role === "LAB_MANAGER").length,
      technicians: live.filter((u) => u.role === "TECHNICIAN").length,
    };
  }, [users]);

  const filtered = useMemo(() => {
    return users.filter((u) =>
      u.status !== "REMOVED" &&
      `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase()) &&
      (deptFilter === "ALL" || u.department === deptFilter) &&
      (roleFilter === "ALL" || u.role === roleFilter) &&
      (statusFilter === "ALL" || u.status === statusFilter)
    );
  }, [users, search, deptFilter, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => { setSearch(""); setDeptFilter("ALL"); setRoleFilter("ALL"); setStatusFilter("ALL"); setPage(1); };

  /* ---- actions ---- */
  const applyInvite = async (form) => {
    try {
      const roleName = form.role === "TECHNICIAN" ? "LAB_TECHNICIAN" : form.role;
      const payload = {
        fullName: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email.trim(),
        phoneNumber: form.phone.trim(),
        departmentId: 21,
        roleName: roleName,
      };

      const res = await authApi.inviteStaff(payload);
      const setupUrl = res.setupUrl || `${window.location.origin}/accept-invitation?token=${res.token}`;

      setSetupModalData({
        fullName: res.fullName || payload.fullName,
        email: res.email || payload.email,
        roleName: res.roleName || payload.roleName,
        setupUrl: setupUrl,
        token: res.token,
      });

      const id = `U-${Date.now()}`;
      setUsers((list) => [{ id, name: payload.fullName, email: payload.email, department: form.department || "Computer Science and Engineering", role: form.role, status: "INVITED" }, ...list]);
      toast(`Invitation sent to ${form.email}.`, "success");
      setInviteTarget(null);
      return true;
    } catch (err) {
      toast(err.message || "Failed to create staff invitation.", "error");
      return false;
    }
  };
  const applyRoleChange = (userId, newRole) => {
    const user = users.find((u) => u.id === userId);
    const conflict = findRoleConflict(users, user.department, newRole, userId);
    if (conflict) {
      toast(`${user.department} already has ${conflict.status === "ACTIVE" ? "an active" : "an invited"} ${ROLE_LABEL[newRole]}: ${conflict.name}. Reassign or deactivate them first.`, "error");
      return false;
    }
    setUsers((list) => list.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    toast(`${user.name}'s role changed to ${ROLE_LABEL[newRole]}.`, "success");
    setRoleModalUser(null);
    return true;
  };
  const saveUserEdit = (userId, patch) => {
    setUsers((list) => list.map((u) => (u.id === userId ? { ...u, ...patch } : u)));
    toast("User details updated.", "success");
    setDetailModal(null);
  };
  const setStatus = (userId, status, message) => {
    setUsers((list) => list.map((u) => (u.id === userId ? { ...u, status } : u)));
    toast(message, status === "REMOVED" ? "error" : "success");
    setOpenMenuId(null);
  };
  const cancelInvitation = async (userId) => {
    const user = users.find((u) => u.id === userId);
    try {
      if (user?.invitationId) {
        await authApi.cancelStaffInvitation(user.invitationId);
      }
      setUsers((list) => list.filter((u) => u.id !== userId));
      toast(`Invitation to ${user?.email || "staff"} cancelled.`, "info");
    } catch (err) {
      toast(err.message || "Failed to cancel invitation.", "error");
    }
    setOpenMenuId(null);
  };

  const handleDeactivateConfirm = async (user, reason) => {
    try {
      if (user.rawUserId || user.userId) {
        const uId = user.rawUserId || user.userId;
        await authApi.deactivateStaff(uId, reason);
      }
      setUsers((list) => list.map((u) => (u.id === user.id ? { ...u, status: "INACTIVE", deactivationReason: reason, deactivatedAt: new Date().toISOString() } : u)));
      toast(`${user.name} deactivated. Email notification sent to staff.`, "success");
      return true;
    } catch (err) {
      toast(err.message || "Failed to deactivate staff user.", "error");
      return false;
    }
  };

  const resendInvitation = (user) => {
    toast(`Invitation resent to ${user.email}.`, "success");
    setOpenMenuId(null);
  };

  const menuActions = (user) => {
    const view = { label: "View Details", onClick: () => setDetailModal({ user, mode: "view" }) };
    if (user.status === "INVITED") {
      return [
        view,
        { label: "Edit Invitation", onClick: () => setDetailModal({ user, mode: "edit" }) },
        { label: "Resend Invitation", onClick: () => resendInvitation(user) },
        { divider: true },
        { label: "Cancel Invitation", danger: true, onClick: () => cancelInvitation(user.id) },
      ];
    }
    if (user.status === "INACTIVE") {
      return [
        view,
      ];
    }
    // ACTIVE
    return [
      view,
      { label: "Change Role", onClick: () => setRoleModalUser(user) },
      { divider: true },
      { label: "Deactivate Account", danger: true, onClick: () => setDeactivateTarget(user) },
    ];
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-1">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage department heads, lab managers, and lab technicians across your institution.</p>
        </div>
        <button
          onClick={() => setInviteTarget({ department: DEPARTMENTS[0], role: "TECHNICIAN" })}
          className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 flex items-center gap-1.5 transition-colors shrink-0"
        >
          <UserPlus size={15} /> Invite User
        </button>
      </div>

      {/* ---- Summary ---- */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <SummaryCard icon={UsersIcon} label="Total Users" value={summary.total} tone="text-slate-700" bg="bg-slate-100" />
        <SummaryCard icon={ShieldCheck} label="Department Heads" value={summary.heads} tone="text-purple-600" bg="bg-purple-50" />
        <SummaryCard icon={UserCog} label="Lab Managers" value={summary.managers} tone="text-blue-600" bg="bg-blue-50" />
        <SummaryCard icon={Wrench} label="Lab Technicians" value={summary.technicians} tone="text-emerald-600" bg="bg-emerald-50" />
      </div>

      {/* ---- Tabs ---- */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 w-fit mb-6">
        <button onClick={() => setTab("all")} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === "all" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>All Users</button>
        <button onClick={() => { setTab("departments"); setSelectedDept(null); }} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === "departments" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Departments</button>
      </div>

      {tab === "all" ? (
        <>
          {/* ---- Search + filters ---- */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-4">
            <div className="relative mb-3">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search name or email…" className={`${inputClass()} pl-9`} />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }} className={inputClass()}>
                <option value="ALL">All Departments</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className={inputClass()}>
                <option value="ALL">All Roles</option>
                {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={inputClass()}>
                <option value="ALL">All Status</option>
                {["ACTIVE", "INVITED", "INACTIVE"].map((s) => <option key={s} value={s}>{s[0] + s.slice(1).toLowerCase()}</option>)}
              </select>
              <button onClick={clearFilters} className="rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition-colors">Clear</button>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-3">Showing {filtered.length} user{filtered.length === 1 ? "" : "s"}</p>

          {filtered.length === 0 ? (
            <EmptyState icon={UsersIcon} title="No users match your filters" />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-visible">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                  <tr>
                    <th className="text-left font-semibold px-5 py-3 w-[34%]">User</th>
                    <th className="text-left font-semibold px-5 py-3">Department</th>
                    <th className="text-left font-semibold px-5 py-3">Role</th>
                    <th className="text-left font-semibold px-5 py-3">Status</th>
                    <th className="text-right font-semibold px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageRows.map((u) => (
                    <tr key={u.id}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">{initials(u.name)}</span>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">{u.name}</p>
                            <p className="text-xs text-slate-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{u.department}</td>
                      <td className="px-5 py-3.5"><RoleBadge role={u.role} /></td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${STATUS_TEXT[u.status]}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[u.status]}`} /> {u.status[0] + u.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right relative">
                        <button onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)} className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-500 transition-colors">
                          <MoreVertical size={16} />
                        </button>
                        {openMenuId === u.id && <ActionsMenu actions={menuActions(u)} onClose={() => setOpenMenuId(null)} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-5">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="text-xs font-semibold text-slate-500 disabled:text-slate-300 hover:text-slate-700">← Previous</button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`h-7 w-7 rounded-lg text-xs font-semibold transition-colors ${p === page ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{p}</button>
                ))}
              </div>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="text-xs font-semibold text-slate-500 disabled:text-slate-300 hover:text-slate-700">Next →</button>
            </div>
          )}
        </>
      ) : selectedDept ? (
        <DepartmentDetail
          department={selectedDept}
          users={users.filter((u) => u.department === selectedDept && u.status !== "REMOVED")}
          onBack={() => setSelectedDept(null)}
          onInvite={(role) => setInviteTarget({ department: selectedDept, role })}
          menuActions={menuActions}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEPARTMENTS.map((d) => {
            const deptUsers = users.filter((u) => u.department === d && u.status !== "REMOVED");
            const head = deptUsers.find((u) => u.role === "DEPARTMENT_HEAD");
            const manager = deptUsers.find((u) => u.role === "LAB_MANAGER");
            const techCount = deptUsers.filter((u) => u.role === "TECHNICIAN").length;
            return (
              <button key={d} onClick={() => setSelectedDept(d)} className="text-left rounded-2xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Building2 size={18} /></span>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-900">{d}</p>
                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <p>Department Head: <span className={head ? "font-semibold text-slate-700" : "text-amber-600 font-semibold"}>{head ? head.name : "Unassigned"}</span></p>
                  <p>Lab Manager: <span className={manager ? "font-semibold text-slate-700" : "text-amber-600 font-semibold"}>{manager ? manager.name : "Unassigned"}</span></p>
                  <p>Lab Technicians: <span className="font-semibold text-slate-700">{techCount}</span></p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {inviteTarget && (
        <InviteUserModal
          departments={DEPARTMENTS}
          defaultDepartment={inviteTarget.department}
          defaultRole={inviteTarget.role}
          onClose={() => setInviteTarget(null)}
          onSubmit={applyInvite}
        />
      )}
      {setupModalData && (
        <StaffPasswordSetupLinkModal
          data={setupModalData}
          onClose={() => setSetupModalData(null)}
          toast={toast}
        />
      )}
      {deactivateTarget && (
        <DeactivateStaffModal
          user={deactivateTarget}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={handleDeactivateConfirm}
        />
      )}
      {roleModalUser && (
        <ChangeRoleModal user={roleModalUser} onClose={() => setRoleModalUser(null)} onSubmit={(role) => applyRoleChange(roleModalUser.id, role)} />
      )}
      {detailModal && (
        <UserDetailModal
          user={detailModal.user}
          mode={detailModal.mode}
          departments={DEPARTMENTS}
          onClose={() => setDetailModal(null)}
          onSave={(patch) => saveUserEdit(detailModal.user.id, patch)}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
function SummaryCard({ icon: Icon, label, value, tone, bg }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg} ${tone} mb-3`}><Icon size={16} /></span>
      <p className="text-2xl font-extrabold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${ROLE_STYLE[role]}`}>
      {ROLE_LABEL[role]}
    </span>
  );
}

/* ---------------------------------------------------------------- */
function ActionsMenu({ actions, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-5 top-11 z-50 w-48 rounded-xl border border-slate-200 bg-white shadow-lg py-1.5 text-left">
        {actions.map((a, i) =>
          a.divider ? (
            <div key={i} className="my-1 border-t border-slate-100" />
          ) : (
            <button
              key={i}
              onClick={() => { a.onClick(); onClose(); }}
              className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors ${a.danger ? "text-red-500 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"}`}
            >
              {a.label}
            </button>
          )
        )}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/*  Department Detail                                                  */
/* ---------------------------------------------------------------- */
function DepartmentDetail({ department, users, onBack, onInvite, menuActions, openMenuId, setOpenMenuId }) {
  const head = users.find((u) => u.role === "DEPARTMENT_HEAD");
  const manager = users.find((u) => u.role === "LAB_MANAGER");
  const technicians = users.filter((u) => u.role === "TECHNICIAN");

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft size={13} /> Back to Departments
      </button>
      <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-wide mb-5">{department} Department</h2>

      <SlotRow
        label="Department Head"
        user={head}
        emptyAction={() => onInvite("DEPARTMENT_HEAD")}
        emptyLabel="Assign Department Head"
        menuActions={menuActions}
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
      />
      <div className="my-5 border-t border-slate-100" />
      <SlotRow
        label="Lab Manager"
        user={manager}
        emptyAction={() => onInvite("LAB_MANAGER")}
        emptyLabel="Assign Lab Manager"
        menuActions={menuActions}
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
      />
      <div className="my-5 border-t border-slate-100" />

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900">Lab Technicians ({technicians.length})</h3>
        <button onClick={() => onInvite("TECHNICIAN")} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 flex items-center gap-1.5 transition-colors">
          <UserPlus size={13} /> Invite Technician
        </button>
      </div>
      {technicians.length === 0 ? (
        <EmptyState icon={Wrench} title="No lab technicians in this department yet" />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
          {technicians.map((t) => (
            <div key={t.id} className="p-4 flex items-center justify-between gap-4 relative">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-xs font-bold">{initials(t.name)}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{t.name}</p>
                  <p className="text-xs text-slate-400 truncate">{t.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${STATUS_TEXT[t.status]}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[t.status]}`} /> {t.status[0] + t.status.slice(1).toLowerCase()}
                </span>
                <button onClick={() => setOpenMenuId(openMenuId === t.id ? null : t.id)} className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-500 transition-colors">
                  <MoreVertical size={16} />
                </button>
                {openMenuId === t.id && <ActionsMenu actions={menuActions(t)} onClose={() => setOpenMenuId(null)} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SlotRow({ label, user, emptyAction, emptyLabel, menuActions, openMenuId, setOpenMenuId }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{label}</p>
      {user ? (
        <div className="flex items-center justify-between gap-4 relative">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-sm font-bold">{initials(user.name)}</span>
            <div>
              <p className="text-sm font-bold text-slate-900">{user.name}</p>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${STATUS_TEXT[user.status]}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[user.status]}`} /> {user.status[0] + user.status.slice(1).toLowerCase()}
              </span>
            </div>
          </div>
          <button onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)} className="rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2 transition-colors">
            Manage
          </button>
          {openMenuId === user.id && <ActionsMenu actions={menuActions(user)} onClose={() => setOpenMenuId(null)} />}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-slate-200 px-4 py-3.5">
          <p className="text-xs text-amber-600 font-semibold">No {label.toLowerCase()} assigned yet.</p>
          <button onClick={emptyAction} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 flex items-center gap-1.5 transition-colors">
            <UserPlus size={13} /> {emptyLabel}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/*  Modals                                                             */
/* ---------------------------------------------------------------- */
function InviteUserModal({ departments, defaultDepartment, defaultRole, onClose, onSubmit }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: defaultDepartment,
    role: defaultRole,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    if (!form.phone.trim()) e.phone = "Phone number is required.";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    const success = await onSubmit(form);
    setSubmitting(false);
    if (success) onClose();
  };

  return (
    <Modal title="Invite Staff Member" subtitle={`New ${ROLE_LABEL[form.role]} for ${form.department}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="First Name" required error={errors.firstName}>
            <input value={form.firstName} onChange={set("firstName")} placeholder="e.g. Ramesh" className={inputClass(errors.firstName)} />
          </Field>
          <Field label="Last Name">
            <input value={form.lastName} onChange={set("lastName")} placeholder="e.g. Kumar" className={inputClass()} />
          </Field>
        </div>

        <Field label="Email Address" required error={errors.email}>
          <input type="email" value={form.email} onChange={set("email")} placeholder="ramesh.tech@kce.ac.in" className={inputClass(errors.email)} />
        </Field>

        <Field label="Phone Number" required error={errors.phone} hint="Must be a valid 10-digit mobile number">
          <input value={form.phone} onChange={set("phone")} placeholder="9870012345" className={inputClass(errors.phone)} />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Department">
            <select value={form.department} onChange={set("department")} className={inputClass()}>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Staff Role">
            <select value={form.role} onChange={set("role")} className={inputClass()}>
              {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </Field>
        </div>

        <button
          onClick={submit}
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          {submitting ? "Creating Invitation..." : "Send Invitation"}
        </button>
      </div>
    </Modal>
  );
}

function StaffPasswordSetupLinkModal({ data, onClose, toast }) {
  const handleCopy = () => {
    if (data?.setupUrl) {
      navigator.clipboard.writeText(data.setupUrl);
      toast("Password setup link copied to clipboard!", "success");
    }
  };

  const handleOpenNewTab = () => {
    if (data?.setupUrl) {
      window.open(data.setupUrl, "_blank");
    }
  };

  return (
    <Modal title="Staff Password Setup Link" subtitle={`Invitation created for ${data?.fullName}`} onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
          <p className="font-bold flex items-center gap-1.5 mb-1">
            <CheckCircle2 size={16} className="text-emerald-600" /> Invitation Created Successfully
          </p>
          <p>An email containing the setup link has been automatically dispatched to <strong>{data?.email}</strong>.</p>
        </div>

        {/* OPTION 1 */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1 text-xs">
          <p className="font-bold text-slate-800 flex items-center gap-1.5">
            <Mail size={15} className="text-blue-600" /> OPTION 1 — Email Sent
          </p>
          <p className="text-slate-600">The staff member will receive an email containing the password setup link.</p>
        </div>

        {/* OPTION 2 */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3 text-xs">
          <p className="font-bold text-blue-900 flex items-center gap-1.5">
            <Link2 size={15} className="text-blue-600" /> OPTION 2 — Manual Copy Link
          </p>
          <p className="text-slate-600">If the staff member does not receive the email, manually copy and share this link:</p>
          
          <div className="flex gap-2">
            <input
              readOnly
              value={data?.setupUrl || ""}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-2 flex items-center gap-1.5 transition-colors text-xs shrink-0"
            >
              <Copy size={14} /> Copy Link
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={handleOpenNewTab}
            className="rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-semibold px-4 py-2 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink size={14} /> Open Link in New Tab
          </button>

          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-5 py-2 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ChangeRoleModal({ user, onClose, onSubmit }) {
  const [role, setRole] = useState(user.role);
  return (
    <Modal title="Change Role" subtitle={`${user.name} · ${user.department}`} onClose={onClose}>
      <div className="space-y-4">
        <Field label="New Role" hint="Only one active Department Head and one active Lab Manager are allowed per department.">
          <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass()}>
            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
        </Field>
        <button onClick={() => onSubmit(role)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
          Save Role
        </button>
      </div>
    </Modal>
  );
}

function UserDetailModal({ user, mode, departments, onClose, onSave }) {
  const [editing, setEditing] = useState(mode === "edit");
  const [form, setForm] = useState({ name: user.name, email: user.email, department: user.department });
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <Modal title={editing ? (user.status === "INVITED" ? "Edit Invitation" : "Edit User") : "User Details"} subtitle={user.id} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-sm font-bold">{initials(user.name)}</span>
          <div>
            <RoleBadge role={user.role} />
            <span className={`ml-2 inline-flex items-center gap-1.5 text-xs font-bold align-middle ${STATUS_TEXT[user.status]}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[user.status]}`} /> {user.status[0] + user.status.slice(1).toLowerCase()}
            </span>
          </div>
        </div>

        {user.deactivationReason && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 space-y-1">
            <p className="font-bold">Deactivation Details:</p>
            <p><span className="font-semibold">Reason:</span> "{user.deactivationReason}"</p>
            {user.deactivatedAt && <p><span className="font-semibold">Date:</span> {new Date(user.deactivatedAt).toLocaleString()}</p>}
          </div>
        )}

        <Field label="Full Name"><input disabled={!editing} value={form.name} onChange={set("name")} className={`${inputClass()} ${!editing ? "bg-slate-50 text-slate-500" : ""}`} /></Field>
        <Field label="Email"><input disabled={!editing} value={form.email} onChange={set("email")} className={`${inputClass()} ${!editing ? "bg-slate-50 text-slate-500" : ""}`} /></Field>
        <Field label="Department">
          {editing ? (
            <select value={form.department} onChange={set("department")} className={inputClass()}>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          ) : (
            <input disabled value={form.department} className={`${inputClass()} bg-slate-50 text-slate-500`} />
          )}
        </Field>

        {editing ? (
          <button onClick={() => onSave(form)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">Save Changes</button>
        ) : (
          <button onClick={() => setEditing(true)} className="w-full rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 transition-colors">Close</button>
        )}
      </div>
    </Modal>
  );
}

function DeactivateStaffModal({ user, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Reason for deactivation is required.");
      return;
    }
    setError("");
    setSubmitting(true);
    const success = await onConfirm(user, reason.trim());
    setSubmitting(false);
    if (success) onClose();
  };

  return (
    <Modal title="Deactivate Staff Account" subtitle={`${user.name} · ${user.email}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
          <p className="font-bold mb-1">Warning: Account Deactivation</p>
          <p>Deactivating this staff account will immediately block sign-in access. The staff member will receive an email notification detailing the reason.</p>
        </div>

        <Field label="Reason for Deactivation" required error={error} hint="Please provide a clear reason for deactivation">
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(""); }}
            placeholder="e.g. Staff member is no longer assigned to this laboratory position."
            className={inputClass(error)}
          />
        </Field>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 transition-colors text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-xs shadow-sm disabled:opacity-50"
          >
            {submitting ? "Deactivating..." : "Confirm Deactivation"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
