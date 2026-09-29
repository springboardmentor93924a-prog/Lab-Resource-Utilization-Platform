import React, { useState, useEffect } from "react";
import { Mail, RefreshCw, Clock, Building2, User, CheckCircle2, XCircle } from "lucide-react";
import { authApi } from "../../../api/authApi";

export default function StaffInvitationsMonitorView({ toast }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const list = await authApi.getAllStaffInvitations();
      setInvitations(list || []);
    } catch (err) {
      toast?.(err.message || "Failed to load staff invitations.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const filtered = invitations.filter((inv) => {
    if (statusFilter === "ALL") return true;
    return (inv.status || "").toUpperCase() === statusFilter.toUpperCase();
  });

  const statusBadge = (st) => {
    const s = (st || "PENDING").toUpperCase();
    if (s === "ACCEPTED") return "bg-emerald-100 text-emerald-800";
    if (s === "PENDING" || s === "INVITED") return "bg-blue-100 text-blue-800";
    if (s === "EXPIRED") return "bg-amber-100 text-amber-800";
    if (s === "CANCELLED") return "bg-red-100 text-red-800";
    return "bg-slate-100 text-slate-800";
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-slate-500 font-medium">Loading staff invitations monitor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Staff Invitations Monitor</h1>
          <p className="text-sm text-slate-600">Platform-wide visibility of staff invitation dispatches across institutions.</p>
        </div>
        <button
          onClick={fetchInvitations}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Refresh List
        </button>
      </div>

      {/* Filter */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Setup</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <p className="text-xs font-semibold text-slate-500">Total: {filtered.length} invitation{filtered.length === 1 ? "" : "s"}</p>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Invited Staff</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Institution & Dept</th>
                <th className="px-5 py-3">Invited Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created / Expiry Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <Mail size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-700">No Staff Invitations Found</p>
                    <p className="text-xs text-slate-400 mt-0.5">No staff invitations match the selected filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.invitationId || inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{inv.fullName || "—"}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-mono text-slate-800">{inv.email}</p>
                      {inv.phoneNumber && <p className="text-[11px] text-slate-400">{inv.phoneNumber}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{inv.institutionName || "—"}</p>
                      <p className="text-[11px] text-slate-500">{inv.departmentName || "—"}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex rounded-full bg-blue-50 text-blue-800 px-2.5 py-0.5 text-[10px] font-bold">
                        {inv.roleName || "STAFF"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusBadge(inv.status)}`}>
                        {inv.status || "PENDING"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px]">
                      {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
