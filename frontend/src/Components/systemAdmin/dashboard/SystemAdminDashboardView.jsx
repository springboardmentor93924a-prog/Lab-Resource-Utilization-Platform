import React, { useState, useEffect } from "react";
import {
  Landmark, ShieldAlert, CheckCircle2, Users, Building2, FlaskConical, Wrench,
  Clock, ArrowRight, RefreshCw, ScrollText
} from "lucide-react";
import { authApi } from "../../../api/authApi";

export default function SystemAdminDashboardView({ onViewInstitutions, onViewPending, onViewDetails, toast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await authApi.getSystemAdminDashboard();
      setData(res || {});
    } catch (err) {
      toast?.(err.message || "Failed to load system dashboard metrics.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-slate-500 font-medium">Loading platform metrics...</span>
      </div>
    );
  }

  const {
    totalInstitutions = 0,
    pendingInstitutions = 0,
    approvedInstitutions = 0,
    totalUsers = 0,
    activeUsers = 0,
    pendingUsers = 0,
    totalLaboratories = 0,
    totalEquipment = 0,
    recentAuditLogs = [],
    recentInstitutions = []
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">System Administration Console</h1>
          <p className="text-sm text-slate-600">Platform-wide overview, institution onboarding, and governance.</p>
        </div>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Pending Applications Alert Banner */}
      {pendingInstitutions > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                {pendingInstitutions} Pending Institution Application{pendingInstitutions > 1 ? "s" : ""}
              </h3>
              <p className="text-xs text-amber-700">Review and approve new educational institution onboarding applications.</p>
            </div>
          </div>
          <button
            onClick={onViewPending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 text-xs transition-colors shadow-sm shrink-0"
          >
            Review Applications <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Primary Platform Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Institutions</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Landmark size={16} />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{totalInstitutions}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{approvedInstitutions} Approved · {pendingInstitutions} Pending</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform Users</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Users size={16} />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{totalUsers}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{activeUsers} Active · {pendingUsers} Inactive/Pending</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Laboratories</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <FlaskConical size={16} />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{totalLaboratories}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Registered Across Network</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Equipment</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Wrench size={16} />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{totalEquipment}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Platform Lab Inventory</p>
        </div>
      </div>

      {/* Two Column Grid: Recent Institutions & Audit Trail */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Institutions */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building2 size={16} className="text-blue-600" /> Recent Institution Registrations
              </h2>
              <button
                onClick={onViewInstitutions}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                View All →
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentInstitutions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No institutions registered yet.</div>
              ) : (
                recentInstitutions.map((inst) => (
                  <div key={inst.institutionId} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{inst.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{inst.code} · {inst.city ? `${inst.city}, ${inst.state}` : (inst.contactEmail || "—")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        inst.approvalStatus === "APPROVED" || inst.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : inst.approvalStatus === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {inst.approvalStatus || (inst.isActive ? "APPROVED" : "PENDING")}
                      </span>
                      {onViewDetails && (
                        <button
                          onClick={() => onViewDetails(inst.institutionId)}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Details
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Platform Audit Logs */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ScrollText size={16} className="text-blue-600" /> System Audit Trail
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {recentAuditLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No recent audit log entries recorded.</div>
              ) : (
                recentAuditLogs.map((log) => (
                  <div key={log.logId || log.id} className="p-4 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      log.status === "SUCCESS" || !log.status ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}>
                      {log.status === "SUCCESS" || !log.status ? "OK" : "ERR"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-900 truncate">{log.action}</p>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : ""}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 truncate">{log.details || log.resourceName || "System event"}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
