import React, { useState, useEffect } from "react";
import {
  ArrowLeft, Building2, User, Mail, Phone, MapPin, Globe, Landmark, RefreshCw, Check, X, Users
} from "lucide-react";
import { authApi } from "../../../api/authApi";

export default function InstitutionDetailsView({ institutionId, onBack, toast }) {
  const [inst, setInst] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [instUsers, setInstUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [rejectModal, setRejectModal] = useState(null);

  const fetchDetails = async () => {
    if (!institutionId) return;
    setLoading(true);
    try {
      const [instData, deptList, userList] = await Promise.all([
        authApi.getInstitution(institutionId),
        authApi.listDepartments(institutionId),
        authApi.getAllUsers({ institutionId })
      ]);
      setInst(instData || null);
      setDepartments(deptList || []);
      setInstUsers(userList || []);
    } catch (err) {
      toast?.(err.message || "Failed to load institution details.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [institutionId]);

  const handleApprove = async () => {
    if (!inst) return;
    setActionInProgress(true);
    try {
      const res = await authApi.approveInstitution(inst.institutionId);
      toast?.(res?.message || `Institution "${inst.name}" approved successfully!`, "success");
      await fetchDetails();
    } catch (err) {
      toast?.(err.message || "Failed to approve institution.", "error");
    } finally {
      setActionInProgress(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal || !inst) return;
    const trimmedReason = (rejectModal.reason || "").trim();
    if (!trimmedReason) {
      setRejectModal((prev) => ({ ...prev, error: "Rejection reason is mandatory." }));
      return;
    }

    setActionInProgress(true);
    try {
      const res = await authApi.rejectInstitution(inst.institutionId, trimmedReason);
      toast?.(res?.message || `Institution application rejected.`, "info");
      setRejectModal(null);
      await fetchDetails();
    } catch (err) {
      toast?.(err.message || "Failed to reject institution.", "error");
    } finally {
      setActionInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-slate-500 font-medium">Loading institution profile...</span>
      </div>
    );
  }

  if (!inst) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="text-base font-bold">Institution Not Found</p>
        <button onClick={onBack} className="mt-4 text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 mx-auto">
          <ArrowLeft size={14} /> Back to Institutions
        </button>
      </div>
    );
  }

  const isPending = inst.approvalStatus === "PENDING";

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Institutions
      </button>

      {/* Main Institution Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 font-bold text-lg">
              {inst.code || "INST"}
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">{inst.name}</h1>
              <p className="text-xs text-slate-500 font-medium">{inst.institutionType || "Educational Institution"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
              inst.approvalStatus === "APPROVED" || inst.isActive
                ? "bg-emerald-100 text-emerald-800"
                : inst.approvalStatus === "REJECTED"
                ? "bg-red-100 text-red-800"
                : "bg-amber-100 text-amber-800"
            }`}>
              {inst.approvalStatus || (inst.isActive ? "APPROVED" : "PENDING")}
            </span>

            {isPending && (
              <div className="flex items-center gap-2">
                <button
                  disabled={actionInProgress}
                  onClick={handleApprove}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 transition-colors shadow-sm disabled:opacity-50"
                >
                  <Check size={14} /> Approve
                </button>
                <button
                  disabled={actionInProgress}
                  onClick={() => setRejectModal({ reason: "", error: "" })}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold px-4 py-2 transition-colors disabled:opacity-50"
                >
                  <X size={14} /> Reject
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Column 1: Institution Details */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-xs text-slate-700 border border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-200/60">
              <Building2 size={16} className="text-blue-600" /> Contact & Location Info
            </h3>

            <div className="space-y-2">
              <p><span className="text-slate-500 font-medium">Short Code:</span> <span className="font-mono font-bold text-blue-700">{inst.code}</span></p>
              <p><span className="text-slate-500 font-medium">Official Email:</span> <span className="font-mono">{inst.contactEmail || "—"}</span></p>
              <p><span className="text-slate-500 font-medium">Official Phone:</span> {inst.contactPhone || "—"}</p>
              <p><span className="text-slate-500 font-medium">Website:</span> {inst.website ? <a href={inst.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{inst.website}</a> : "—"}</p>
              <p><span className="text-slate-500 font-medium">Campus Address:</span> {inst.address ? `${inst.address}, ${inst.city || ""}, ${inst.state || ""} ${inst.pincode || ""}, ${inst.country || ""}` : (inst.city ? `${inst.city}, ${inst.state}` : "—")}</p>
            </div>
          </div>

          {/* Column 2: Designated Admin Info */}
          <div className="bg-blue-50/50 rounded-xl p-4 space-y-3 text-xs text-slate-700 border border-blue-100/60">
            <h3 className="font-bold text-blue-950 text-sm flex items-center gap-2 pb-2 border-b border-blue-200/60">
              <User size={16} className="text-blue-600" /> Designated Institution Administrator
            </h3>

            <div className="space-y-2">
              <p><span className="text-slate-500 font-medium">Admin Name:</span> <span className="font-semibold text-slate-900">{inst.adminFirstName || "—"} {inst.adminLastName || ""}</span></p>
              <p><span className="text-slate-500 font-medium">Work Email:</span> <span className="font-mono font-medium text-slate-900">{inst.adminEmail || "—"}</span></p>
              <p><span className="text-slate-500 font-medium">Phone:</span> {inst.adminPhone || "—"}</p>
            </div>
          </div>
        </div>

        {/* Rejection Reason display if rejected */}
        {inst.approvalStatus === "REJECTED" && inst.rejectionReason && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 space-y-1">
            <p className="font-bold">Application Rejection Reason:</p>
            <p className="italic">"{inst.rejectionReason}"</p>
          </div>
        )}
      </div>

      {/* Provisioned Departments Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900 text-sm flex items-center justify-between">
          <span>Provisioned Departments ({departments.length})</span>
        </h2>

        {departments.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No departments provisioned for this institution yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {departments.map((dept) => (
              <div key={dept.departmentId || dept.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs space-y-1">
                <p className="font-bold text-slate-900">{dept.name}</p>
                <p className="font-mono text-[11px] text-blue-700 font-bold">{dept.code}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Associated Institution Users Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900 text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users size={18} className="text-blue-600" /> Associated Institution Users ({instUsers.length})
          </span>
        </h2>

        {instUsers.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs">
            <p className="font-bold text-slate-700">No Users Registered</p>
            <p className="text-slate-400 mt-0.5">There are currently no user accounts registered under this institution.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">User Name</th>
                  <th className="px-4 py-2.5">Email / Contact</th>
                  <th className="px-4 py-2.5">Department</th>
                  <th className="px-4 py-2.5">Role</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {instUsers.map((u) => {
                  const roleStr = (u.roles || []).join(", ") || "USER";
                  const isActive = Boolean(u.isActive);

                  return (
                    <tr key={u.userId} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {u.firstName} {u.lastName || ""}
                        {u.rollNumber && <span className="block font-mono text-[10px] text-slate-400 font-normal">Roll: {u.rollNumber}</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-800">{u.email}</td>
                      <td className="px-4 py-3">{u.departmentName || "—"}</td>
                      <td className="px-4 py-3 font-semibold text-blue-800">{roleStr}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                        }`}>
                          {isActive ? "ACTIVE" : "DEACTIVATED"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Reject Registration Application</h3>
            <p className="text-xs text-slate-600">Provide a mandatory reason for rejecting <span className="font-semibold text-slate-900">{inst.name}</span>:</p>

            <textarea
              rows={3}
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value, error: "" })}
              placeholder="e.g. Unverified credentials or invalid institutional details."
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
