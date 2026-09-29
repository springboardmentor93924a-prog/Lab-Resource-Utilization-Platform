import React, { useState, useEffect } from "react";
import {
  Search, Users, Filter, RefreshCw, UserCheck, UserX, Shield, CheckCircle2, XCircle, Mail, Phone, Building2
} from "lucide-react";
import { authApi } from "../../../api/authApi";

const ROLES = [
  { value: "ALL", label: "All Roles" },
  { value: "SYSTEM_ADMIN", label: "System Administrator" },
  { value: "INSTITUTION_ADMIN", label: "Institution Administrator" },
  { value: "DEPARTMENT_HEAD", label: "Department Head" },
  { value: "LAB_MANAGER", label: "Lab Manager" },
  { value: "LAB_TECHNICIAN", label: "Lab Technician" },
  { value: "RESEARCHER", label: "Researcher / Student" },
];

export default function AllUsersView({ toast }) {
  const [users, setUsers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [instFilter, setInstFilter] = useState("ALL");

  const [deactivateModal, setDeactivateModal] = useState(null); // { user, reason, error }
  const [reactivateModal, setReactivateModal] = useState(null); // { user }
  const [actionInProgress, setActionInProgress] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userList, instList] = await Promise.all([
        authApi.getAllUsers({
          role: roleFilter !== "ALL" ? roleFilter : null,
          status: statusFilter !== "ALL" ? statusFilter : null,
          institutionId: instFilter !== "ALL" ? instFilter : null,
          search: search.trim() ? search.trim() : null
        }),
        authApi.listInstitutions()
      ]);
      setUsers(userList || []);
      setInstitutions(instList || []);
    } catch (err) {
      toast?.(err.message || "Failed to load platform users.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [roleFilter, statusFilter, instFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleDeactivate = async () => {
    if (!deactivateModal || !deactivateModal.user) return;
    const reason = (deactivateModal.reason || "").trim();
    if (!reason) {
      setDeactivateModal((prev) => ({ ...prev, error: "A clear reason for deactivation is mandatory." }));
      return;
    }

    setActionInProgress(true);
    try {
      await authApi.toggleUserActiveStatus(deactivateModal.user.userId, reason);
      toast?.(`Account for ${deactivateModal.user.firstName} ${deactivateModal.user.lastName || ""} has been deactivated.`, "success");
      setDeactivateModal(null);
      await fetchData();
    } catch (err) {
      toast?.(err.message || "Failed to deactivate user account.", "error");
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReactivate = async () => {
    if (!reactivateModal || !reactivateModal.user) return;

    setActionInProgress(true);
    try {
      await authApi.toggleUserActiveStatus(reactivateModal.user.userId, null);
      toast?.(`Account for ${reactivateModal.user.firstName} ${reactivateModal.user.lastName || ""} has been reactivated.`, "success");
      setReactivateModal(null);
      await fetchData();
    } catch (err) {
      toast?.(err.message || "Failed to reactivate user account.", "error");
    } finally {
      setActionInProgress(false);
    }
  };

  const roleLabel = (roleStr) => {
    if (!roleStr) return "User";
    if (roleStr.includes("SYSTEM_ADMIN")) return "System Admin";
    if (roleStr.includes("INSTITUTION_ADMIN")) return "Institution Admin";
    if (roleStr.includes("DEPARTMENT_HEAD")) return "Department Head";
    if (roleStr.includes("LAB_MANAGER")) return "Lab Manager";
    if (roleStr.includes("LAB_TECHNICIAN") || roleStr.includes("TECHNICIAN")) return "Lab Technician";
    if (roleStr.includes("RESEARCHER") || roleStr.includes("STUDENT")) return "Researcher / Student";
    return roleStr;
  };

  const roleStyle = (roleStr) => {
    if (!roleStr) return "bg-slate-100 text-slate-700";
    if (roleStr.includes("SYSTEM_ADMIN")) return "bg-purple-100 text-purple-800 border-purple-200";
    if (roleStr.includes("INSTITUTION_ADMIN")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (roleStr.includes("DEPARTMENT_HEAD")) return "bg-indigo-100 text-indigo-800 border-indigo-200";
    if (roleStr.includes("LAB_MANAGER")) return "bg-sky-100 text-sky-800 border-sky-200";
    if (roleStr.includes("LAB_TECHNICIAN")) return "bg-teal-100 text-teal-800 border-teal-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Platform Users Governance</h1>
          <p className="text-sm text-slate-600">Platform-wide user directory, status monitoring, and account activation management.</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh List
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user name, email, or phone number..."
              className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 text-xs transition-colors shadow-sm shrink-0"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Role Filter</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Users</option>
              <option value="INACTIVE">Deactivated Users</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Institution Filter</label>
            <select
              value={instFilter}
              onChange={(e) => setInstFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">All Institutions</option>
              {institutions.map((inst) => (
                <option key={inst.institutionId} value={inst.institutionId}>{inst.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-500">Showing {users.length} user record{users.length === 1 ? "" : "s"}</p>

      {/* Users Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw size={24} className="animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-slate-500 font-medium">Loading user records...</span>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">User Name</th>
                  <th className="px-5 py-3">Email & Contact</th>
                  <th className="px-5 py-3">Institution & Dept</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                      <Users size={32} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-sm font-bold text-slate-700">No Users Found</p>
                      <p className="text-xs text-slate-400 mt-0.5">No platform user accounts match your selected filters.</p>
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const rolesStr = (u.roles || []).join(", ");
                    const isActive = Boolean(u.isActive);

                    return (
                      <tr key={u.userId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-900">{u.firstName} {u.lastName || ""}</p>
                          {u.rollNumber && <p className="text-[11px] font-mono text-slate-400">Roll: {u.rollNumber}</p>}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-mono text-slate-800">{u.email}</p>
                          {u.phoneNumber && <p className="text-[11px] text-slate-500">{u.phoneNumber}</p>}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-800">{u.institutionName || "Platform Global"}</p>
                          {u.departmentName && <p className="text-[11px] text-slate-500">{u.departmentName}</p>}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${roleStyle(rolesStr)}`}>
                            {roleLabel(rolesStr)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                              {isActive ? "ACTIVE" : "DEACTIVATED"}
                            </span>
                            {!isActive && u.deactivationReason && (
                              <p className="text-[10px] text-slate-500 italic mt-1 max-w-xs truncate" title={u.deactivationReason}>
                                "{u.deactivationReason}"
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {isActive ? (
                            <button
                              onClick={() => setDeactivateModal({ user: u, reason: "", error: "" })}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white hover:bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 transition-colors"
                            >
                              <UserX size={14} /> Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => setReactivateModal({ user: u })}
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition-colors"
                            >
                              <UserCheck size={14} /> Reactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deactivate Modal */}
      {deactivateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Deactivate User Account</h3>
            <p className="text-xs text-slate-600">
              Provide a mandatory reason for deactivating account for <span className="font-semibold text-slate-900">{deactivateModal.user.firstName} {deactivateModal.user.lastName || ""}</span> ({deactivateModal.user.email}):
            </p>

            <textarea
              rows={3}
              value={deactivateModal.reason}
              onChange={(e) => setDeactivateModal({ ...deactivateModal, reason: e.target.value, error: "" })}
              placeholder="e.g. Personnel offboarded from department or policy violation."
              className={`w-full rounded-lg border p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                deactivateModal.error ? "border-red-400 bg-red-50/20" : "border-slate-300"
              }`}
            />
            {deactivateModal.error && (
              <p className="text-xs text-red-500 font-semibold">{deactivateModal.error}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={actionInProgress}
                onClick={() => setDeactivateModal(null)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionInProgress || !deactivateModal.reason?.trim()}
                onClick={handleDeactivate}
                className="rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 shadow-sm"
              >
                {actionInProgress ? "Deactivating..." : "Confirm Deactivation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reactivate Modal */}
      {reactivateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Reactivate User Account</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to reactivate the account for <span className="font-semibold text-slate-900">{reactivateModal.user.firstName} {reactivateModal.user.lastName || ""}</span> ({reactivateModal.user.email})?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={actionInProgress}
                onClick={() => setReactivateModal(null)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionInProgress}
                onClick={handleReactivate}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 shadow-sm"
              >
                {actionInProgress ? "Reactivating..." : "Confirm Reactivation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
