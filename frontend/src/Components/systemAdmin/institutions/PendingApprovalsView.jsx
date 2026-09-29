import React, { useState, useEffect } from "react";
import {
  ShieldAlert, Clock, Check, X, Search, RefreshCw, Building2, User, Eye
} from "lucide-react";
import { authApi } from "../../../api/authApi";

export default function PendingApprovalsView({ onViewDetails, toast }) {
  const [pendingApps, setPendingApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectModal, setRejectModal] = useState(null); // { id, name, reason, error }
  const [actionInProgress, setActionInProgress] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await authApi.listPendingInstitutions();
      setPendingApps(data || []);
    } catch (err) {
      toast?.(err.message || "Failed to load pending applications.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id, name) => {
    setActionInProgress(true);
    try {
      const res = await authApi.approveInstitution(id);
      toast?.(res?.message || `Institution "${name}" approved successfully! Administrator setup link dispatched.`, "success");
      await fetchPending();
    } catch (err) {
      toast?.(err.message || "Failed to approve institution application.", "error");
    } finally {
      setActionInProgress(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal) return;
    const trimmedReason = (rejectModal.reason || "").trim();
    if (!trimmedReason) {
      setRejectModal((prev) => ({ ...prev, error: "Rejection reason is mandatory." }));
      return;
    }

    setActionInProgress(true);
    try {
      const res = await authApi.rejectInstitution(rejectModal.id, trimmedReason);
      toast?.(res?.message || `Institution "${rejectModal.name}" registration rejected.`, "info");
      setRejectModal(null);
      await fetchPending();
    } catch (err) {
      toast?.(err.message || "Failed to reject institution application.", "error");
    } finally {
      setActionInProgress(false);
    }
  };

  const filteredPending = pendingApps.filter(
    (item) =>
      (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.code || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.contactEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.adminEmail || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-slate-500 font-medium">Loading pending applications...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Pending Institution Approvals</h1>
          <p className="text-sm text-slate-600">Review, approve, or reject new institution onboarding applications.</p>
        </div>
        <button
          onClick={fetchPending}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search pending applications..."
          className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Pending Grid / Empty State */}
      {filteredPending.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3">
            <Check size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Pending Applications</h3>
          <p className="text-xs text-slate-500 mt-1">All institution registration applications have been reviewed.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredPending.map((item) => (
            <div
              key={item.institutionId}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-bold text-sm">
                      {item.code || "INST"}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight">{item.name}</h3>
                      <p className="text-xs text-slate-500">{item.institutionType || "Educational Institution"}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800 flex items-center gap-1 shrink-0">
                    <Clock size={12} /> PENDING
                  </span>
                </div>

                {/* Institution Profile */}
                <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 text-xs text-slate-700 border border-slate-100 mb-3">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
                    <Building2 size={14} className="text-blue-600" /> Institution Profile
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p><span className="text-slate-500 font-medium">Short Code:</span> <span className="font-mono font-bold text-blue-700">{item.code}</span></p>
                    <p><span className="text-slate-500 font-medium">Official Phone:</span> {item.contactPhone || "—"}</p>
                    <p className="col-span-2"><span className="text-slate-500 font-medium">Official Email:</span> <span className="font-mono">{item.contactEmail}</span></p>
                    <p className="col-span-2"><span className="text-slate-500 font-medium">Location:</span> {item.address ? `${item.address}, ${item.city || ""}, ${item.state || ""}` : (item.city ? `${item.city}, ${item.state}` : "—")}</p>
                  </div>
                </div>

                {/* Designated Admin */}
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
              <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
                <button
                  disabled={actionInProgress}
                  onClick={() => handleApprove(item.institutionId, item.name)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 text-xs transition-colors shadow-sm"
                >
                  <Check size={16} /> Approve & Send Link
                </button>
                <button
                  disabled={actionInProgress}
                  onClick={() => setRejectModal({ id: item.institutionId, name: item.name, reason: "", error: "" })}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 font-semibold py-2.5 text-xs transition-colors"
                >
                  <X size={16} /> Reject Application
                </button>
                {onViewDetails && (
                  <button
                    onClick={() => onViewDetails(item.institutionId)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                    title="View Full Details"
                  >
                    <Eye size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
              placeholder="e.g. Unverified accreditation or invalid institutional documentation."
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
                onClick={handleRejectConfirm}
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
