import React, { useState, useEffect } from "react";
import {
  BarChart3, RefreshCw, Landmark, Users, Building2, Wrench, CalendarCheck, ScrollText, CheckCircle2, Clock, AlertTriangle, XCircle
} from "lucide-react";
import { authApi } from "../../../api/authApi";

export default function PlatformAnalyticsView({ toast }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await authApi.getPlatformAnalytics();
      setAnalytics(data);
    } catch (err) {
      toast?.(err.message || "Failed to load platform analytics.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-slate-500 font-medium">Aggregating platform analytics...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <AlertTriangle size={32} className="mx-auto text-amber-500 mb-2" />
        <h3 className="text-base font-bold text-slate-900">Analytics Data Unavailable</h3>
        <p className="text-xs text-slate-500 mt-1">Unable to compute platform metrics at this time.</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  const { institutions = {}, users = {}, laboratories = {}, equipment = {}, bookings = {}, activity = {} } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Platform Analytics & Intelligence</h1>
          <p className="text-sm text-slate-600">Real-time aggregated database telemetry across institutions, users, labs, equipment, and bookings.</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Data
        </button>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Institutions</span>
            <Landmark size={18} className="text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{institutions.total ?? 0}</p>
          <p className="text-[11px] text-emerald-600 font-semibold">{institutions.approved ?? 0} Approved</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Platform Users</span>
            <Users size={18} className="text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{users.total ?? 0}</p>
          <p className="text-[11px] text-emerald-600 font-semibold">{users.active ?? 0} Active</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Laboratories</span>
            <Building2 size={18} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{laboratories.total ?? 0}</p>
          <p className="text-[11px] text-slate-500">Registered Labs</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Equipment</span>
            <Wrench size={18} className="text-sky-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{equipment.total ?? 0}</p>
          <p className="text-[11px] text-emerald-600 font-semibold">
            {equipment.equipmentByStatus?.AVAILABLE ?? 0} Available
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Bookings</span>
            <CalendarCheck size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{bookings.total ?? 0}</p>
          <p className="text-[11px] text-emerald-600 font-semibold">{bookings.completed ?? 0} Completed</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Audit Events</span>
            <ScrollText size={18} className="text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{activity.totalAuditLogs ?? 0}</p>
          <p className="text-[11px] text-slate-500">Logged Actions</p>
        </div>
      </div>

      {/* Analytics Grid Section 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Institution Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Landmark size={18} className="text-blue-600" /> Institution Status Breakdown
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Approved & Active</span>
                <span>{institutions.approved ?? 0} / {institutions.total ?? 0}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${institutions.total ? ((institutions.approved / institutions.total) * 100) : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Pending Approval</span>
                <span>{institutions.pending ?? 0}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${institutions.total ? ((institutions.pending / institutions.total) * 100) : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Rejected</span>
                <span>{institutions.rejected ?? 0}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all"
                  style={{ width: `${institutions.total ? ((institutions.rejected / institutions.total) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* User Role Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users size={18} className="text-purple-600" /> User Role Distribution
          </h3>
          <div className="space-y-2 text-xs">
            {Object.entries(users.usersByRole || {}).map(([role, count]) => {
              const pct = users.total ? Math.round((count / users.total) * 100) : 0;
              return (
                <div key={role} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-800">{role}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-mono text-[11px]">{pct}%</span>
                    <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Analytics Grid Section 2 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Equipment Status Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Wrench size={18} className="text-sky-600" /> Equipment Operational Status
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Available</span>
              <p className="text-xl font-extrabold text-emerald-900">{equipment.equipmentByStatus?.AVAILABLE ?? 0}</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3 space-y-1">
              <span className="text-[10px] font-bold text-amber-700 uppercase">Under Maintenance</span>
              <p className="text-xl font-extrabold text-amber-900">{equipment.equipmentByStatus?.UNDER_MAINTENANCE ?? 0}</p>
            </div>
            <div className="rounded-xl border border-red-100 bg-red-50/40 p-3 space-y-1">
              <span className="text-[10px] font-bold text-red-700 uppercase">Out of Service</span>
              <p className="text-xl font-extrabold text-red-900">{equipment.equipmentByStatus?.OUT_OF_SERVICE ?? 0}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
              <span className="text-[10px] font-bold text-slate-600 uppercase">Decommissioned</span>
              <p className="text-xl font-extrabold text-slate-800">{equipment.equipmentByStatus?.DECOMMISSIONED ?? 0}</p>
            </div>
          </div>
        </div>

        {/* Booking Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck size={18} className="text-emerald-600" /> Booking Activity Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-semibold text-slate-500">Confirmed</span>
              <p className="text-base font-extrabold text-slate-900">{bookings.confirmed ?? 0}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-semibold text-slate-500">Completed</span>
              <p className="text-base font-extrabold text-emerald-700">{bookings.completed ?? 0}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-semibold text-slate-500">Pending Approval</span>
              <p className="text-base font-extrabold text-amber-700">{bookings.pendingApproval ?? 0}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-semibold text-slate-500">Cancelled</span>
              <p className="text-base font-extrabold text-red-700">{bookings.cancelled ?? 0}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-semibold text-slate-500">No Show</span>
              <p className="text-base font-extrabold text-purple-700">{bookings.noShow ?? 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
