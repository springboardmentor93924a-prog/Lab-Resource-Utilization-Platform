import React, { useState, useEffect } from "react";
import { UserCheck, RefreshCw, Clock, Building2, Mail, Phone, ShieldAlert } from "lucide-react";
import { authApi } from "../../../api/authApi";

export default function PendingRegistrationsView({ toast }) {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await authApi.getPendingRegistrations();
      setPendingUsers(data || []);
    } catch (err) {
      toast?.(err.message || "Failed to load pending registrations.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-slate-500 font-medium">Loading pending user registrations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Pending User Registrations</h1>
          <p className="text-sm text-slate-600">Platform-wide monitor of user accounts awaiting institution administrator review.</p>
        </div>
        <button
          onClick={fetchPending}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <p className="text-xs font-semibold text-slate-500">Showing {pendingUsers.length} pending registration{pendingUsers.length === 1 ? "" : "s"}</p>

      {/* Grid of Pending Users */}
      {pendingUsers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3">
            <UserCheck size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Pending Registrations</h3>
          <p className="text-xs text-slate-500 mt-1">There are currently no user registrations awaiting review across the network.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pendingUsers.map((u) => {
            const roleStr = (u.roles || []).join(", ") || "STUDENT";

            return (
              <div key={u.userId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{u.firstName} {u.lastName || ""}</h3>
                    <p className="text-xs font-mono text-slate-500">{u.email}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800 flex items-center gap-1">
                    <Clock size={12} /> PENDING REVIEW
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 border border-slate-100 space-y-1">
                  <p><span className="text-slate-500 font-medium">Institution:</span> <span className="font-bold text-slate-900">{u.institutionName || "—"}</span></p>
                  <p><span className="text-slate-500 font-medium">Department:</span> {u.departmentName || "—"}</p>
                  <p><span className="text-slate-500 font-medium">Requested Role:</span> <span className="font-semibold text-blue-700">{roleStr}</span></p>
                  {u.rollNumber && <p><span className="text-slate-500 font-medium">Roll Number:</span> <span className="font-mono">{u.rollNumber}</span></p>}
                  {u.researcherId && <p><span className="text-slate-500 font-medium">Researcher ID:</span> <span className="font-mono">{u.researcherId}</span></p>}
                  {u.phoneNumber && <p><span className="text-slate-500 font-medium">Phone:</span> {u.phoneNumber}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
