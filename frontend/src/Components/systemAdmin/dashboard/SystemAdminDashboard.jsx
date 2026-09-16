import React, { useState, useEffect } from "react";
import {
  Landmark, ShieldAlert, CheckCircle2, XCircle, Building2, Users,
  BarChart3, RefreshCw, Search, ArrowRight, ShieldCheck, Clock, FileText,
  AlertTriangle, Filter, Check, X, Eye, Lock, Mail, Phone, MapPin, Globe, User
} from "lucide-react";
import { Logo } from "../../common/Logo.jsx";
import { authApi } from "../../../api/authApi";

export default function SystemAdminDashboard({ user, onLogout, toast }) {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingApps, setPendingApps] = useState([]);
  const [allInstitutions, setAllInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectModal, setRejectModal] = useState(null); // { id, name, reason, error }
  const [actionInProgress, setActionInProgress] = useState(false);

  // Fetch pending applications and all institutions from backend
  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingData, allData] = await Promise.all([
        authApi.listPendingInstitutions(),
        authApi.listInstitutions()
      ]);
      setPendingApps(pendingData || []);
      setAllInstitutions(allData || []);
    } catch (err) {
      toast?.("Failed to load institutions from server: " + (err.message || ""), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id, name) => {
    setActionInProgress(true);
    try {
      const res = await authApi.approveInstitution(id);
      toast?.(res?.message || `Institution "${name}" approved successfully! Password setup email dispatched.`, "success");
      await fetchData();
    } catch (err) {
      toast?.(err.message || "Failed to approve institution.", "error");
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    const trimmedReason = (rejectModal.reason || "").trim();
    if (!trimmedReason) {
      setRejectModal(prev => ({ ...prev, error: "A rejection reason is mandatory." }));
      return;
    }

    setActionInProgress(true);
    try {
      const res = await authApi.rejectInstitution(rejectModal.id, trimmedReason);
      toast?.(res?.message || `Institution "${rejectModal.name}" application rejected.`, "info");
      setRejectModal(null);
      await fetchData();
    } catch (err) {
      toast?.(err.message || "Failed to reject institution.", "error");
    } finally {
      setActionInProgress(false);
    }
  };

  const filteredPending = pendingApps.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.contactEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.adminEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAll = allInstitutions.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.contactEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rbacMatrix = [
    { role: "System Administrator", desc: "Global platform governance, institution reviews/approvals, system oversight.", permCount: "Global Access" },
    { role: "Institution Administrator", desc: "Manages institution research infrastructure, staff accounts, departments, budgets, and MoUs.", permCount: "Institution-Wide" },
    { role: "Department Head", desc: "Department equipment governance, resource request review, sharing agreements.", permCount: "Department-Scoped" },
    { role: "Lab Manager", desc: "Lab resource inventory cataloging, operational schedules, issue report triage.", permCount: "Department-Scoped" },
    { role: "Lab Technician", desc: "Maintenance work orders, calibration logs, preventive checks.", permCount: "Operational" },
    { role: "Researcher / Student", desc: "Equipment search, booking requests, issue reporting on active bookings.", permCount: "User Access" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo dark onClick={() => setActiveTab("overview")} />

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs text-slate-300">
              <ShieldCheck size={14} className="text-blue-400" /> System Administrator ({user?.email || "Root"})
            </span>
            <button
              onClick={onLogout}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">System Administration Console</h1>
            <p className="text-sm text-slate-600">Review pending institution applications and oversee global platform operations.</p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Data
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-6 mb-8 overflow-x-auto">
          {[
            { id: "pending", label: `Pending Registrations (${pendingApps.length})`, icon: ShieldAlert },
            { id: "overview", label: "Platform Overview", icon: BarChart3 },
            { id: "institutions", label: `All Institutions (${allInstitutions.length})`, icon: Landmark },
            { id: "rbac", label: "RBAC & Permissions", icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
                  active
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Pending Registrations */}
        {activeTab === "pending" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pending applications..."
                  className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {filteredPending.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
                  <CheckCircle2 size={24} className="text-emerald-500" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No Pending Applications</h3>
                <p className="text-sm text-slate-500 mt-1">All institution registration applications have been reviewed.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredPending.map((item) => (
                  <div key={item.institutionId} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-sm">
                            {item.code || "INST"}
                          </span>
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-base leading-tight">{item.name}</h3>
                            <p className="text-xs text-slate-500">{item.institutionType || "Educational Institution"}</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800 flex items-center gap-1">
                          <Clock size={12} /> PENDING REVIEW
                        </span>
                      </div>

                      {/* Institution Details Section */}
                      <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 text-xs text-slate-700 border border-slate-100 mb-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
                          <Building2 size={14} className="text-blue-600" /> Institution Profile
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p><span className="text-slate-500 font-medium">Short Code:</span> <span className="font-mono font-bold text-blue-700">{item.code}</span></p>
                          <p><span className="text-slate-500 font-medium">Official Phone:</span> {item.contactPhone || "—"}</p>
                          <p className="col-span-2"><span className="text-slate-500 font-medium">Official Email:</span> <span className="font-mono">{item.contactEmail}</span></p>
                          <p className="col-span-2"><span className="text-slate-500 font-medium">Campus Address:</span> {item.address ? `${item.address}, ${item.city || ""}, ${item.state || ""} ${item.country || ""}` : (item.city ? `${item.city}, ${item.state}` : "—")}</p>
                          {item.website && <p className="col-span-2"><span className="text-slate-500 font-medium">Website:</span> <a href={item.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{item.website}</a></p>}
                        </div>
                      </div>

                      {/* Designated Administrator Details Section */}
                      <div className="bg-blue-50/50 rounded-xl p-3.5 space-y-2 text-xs text-slate-700 border border-blue-100/60">
                        <div className="font-bold text-blue-950 flex items-center gap-1.5 pb-1 border-b border-blue-200/60">
                          <User size={14} className="text-blue-600" /> Designated Institution Administrator
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p><span className="text-slate-500 font-medium">Administrator Name:</span> <span className="font-semibold text-slate-900">{item.adminFirstName || "—"} {item.adminLastName || ""}</span></p>
                          <p><span className="text-slate-500 font-medium">Phone:</span> {item.adminPhone || "—"}</p>
                          <p className="col-span-2"><span className="text-slate-500 font-medium">Work Email:</span> <span className="font-mono font-medium text-slate-900">{item.adminEmail || "—"}</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 border-t border-slate-100 pt-4 mt-2">
                      <button
                        disabled={actionInProgress}
                        onClick={() => handleApprove(item.institutionId, item.name)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 text-xs transition-colors shadow-sm"
                      >
                        <Check size={16} /> Approve & Dispatch Setup Link
                      </button>
                      <button
                        disabled={actionInProgress}
                        onClick={() => setRejectModal({ id: item.institutionId, name: item.name, reason: "", error: "" })}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 font-semibold py-2.5 text-xs transition-colors"
                      >
                        <X size={16} /> Reject Application
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Overview Stats */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Institutions</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">{allInstitutions.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</p>
                <p className="text-3xl font-extrabold text-amber-600 mt-2">{pendingApps.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Network Nodes</p>
                <p className="text-3xl font-extrabold text-emerald-600 mt-2">
                  {allInstitutions.filter((i) => i.isActive).length}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System Health</p>
                <p className="text-3xl font-extrabold text-blue-600 mt-2">100%</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: All Institutions */}
        {activeTab === "institutions" && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">Registered Educational Institutions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Code</th>
                    <th className="px-5 py-3">Institution Name</th>
                    <th className="px-5 py-3">Contact Email</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAll.map((inst) => (
                    <tr key={inst.institutionId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-slate-900">{inst.code || "INST"}</td>
                      <td className="px-5 py-3 font-semibold text-slate-900">{inst.name}</td>
                      <td className="px-5 py-3">{inst.contactEmail || "—"}</td>
                      <td className="px-5 py-3">{inst.city ? `${inst.city}, ${inst.state}` : "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          inst.approvalStatus === "APPROVED" || inst.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : inst.approvalStatus === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {inst.approvalStatus || (inst.isActive ? "APPROVED" : "PENDING")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: RBAC Matrix */}
        {activeTab === "rbac" && (
          <div className="space-y-6">
            <h2 className="font-extrabold text-slate-900 text-lg">System Role-Based Access Control (RBAC)</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {rbacMatrix.map((r, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-900 text-base">{r.role}</h3>
                    <span className="rounded-md bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1">{r.permCount}</span>
                  </div>
                  <p className="text-xs text-slate-600">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Reject Registration Application</h3>
            <p className="text-xs text-slate-600">Provide a mandatory reason for rejecting <span className="font-semibold text-slate-900">{rejectModal.name}</span>:</p>

            <textarea
              rows={3}
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value, error: "" })}
              placeholder="e.g. Invalid institutional accreditation or unverified credentials."
              className={`w-full rounded-lg border p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                rejectModal.error ? "border-red-400 bg-red-50/20" : "border-slate-300"
              }`}
            />
            {rejectModal.error && (
              <p className="text-xs text-red-500 font-semibold">{rejectModal.error}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={actionInProgress}
                onClick={() => setRejectModal(null)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionInProgress || !rejectModal.reason?.trim()}
                onClick={handleReject}
                className="rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 shadow-sm"
              >
                {actionInProgress ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
