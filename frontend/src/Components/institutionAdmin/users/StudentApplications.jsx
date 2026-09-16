import { useState, useEffect, useMemo } from "react";
import {
  GraduationCap, Search, CheckCircle2, XCircle, Clock, Check, X, RefreshCw, Eye, Mail, Phone, Calendar, Building2, Filter, AlertCircle
} from "lucide-react";
import { Modal } from "../../common/Modal.jsx";
import { Field, inputClass } from "../../common/Field.jsx";
import { API_BASE_URL } from "../../../api/client.js";

const DEPARTMENTS = [
  "Computer Science and Engineering",
  "Electrical and Electronics Engineering",
  "Electronics and Communication Engineering",
  "Information Technology",
  "Artificial Intelligence and Data Science",
  "Mechanical Engineering",
  "Civil Engineering",
];

function initials(name) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  return `${parts[0]?.[0] || ""}${parts[parts.length - 1]?.[0] || ""}`.toUpperCase();
}

/** Robust Date & Time Formatter */
function formatDateTime(createdAt) {
  if (!createdAt) return "Recent";
  try {
    if (Array.isArray(createdAt)) {
      const [y, m, d, hh = 0, mm = 0, ss = 0] = createdAt;
      const date = new Date(y, m - 1, d, hh, mm, ss);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) return "Recent";
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch (err) {
    return "Recent";
  }
}

export default function StudentApplications({ toast }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL"); // "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  const [selectedStudent, setSelectedStudent] = useState(null); // student modal object

  // Fetch all student applications (both active and pending) from backend
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("labflow_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE_URL}/users/students?activeOnly=false`, { headers });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      } else {
        toast("Failed to load student applications from backend.", "error");
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      toast("Unable to connect to backend server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const [rejectModal, setRejectModal] = useState(null); // { userId, studentName, reason }

  const handleApproveStudent = async (userId, studentName) => {
    try {
      const token = localStorage.getItem("labflow_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE_URL}/users/approve-student/${userId}`, {
        method: "POST",
        headers,
      });
      if (!res.ok) throw new Error("Approval failed.");

      toast(`Student "${studentName}" approved and activated!`, "success");
      setSelectedStudent(null);
      fetchStudents();
    } catch (err) {
      toast(err.message || "Failed to approve student.", "error");
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModal) return;
    try {
      const token = localStorage.getItem("labflow_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(
        `${API_BASE_URL}/users/reject-student/${rejectModal.userId}?reason=${encodeURIComponent(rejectModal.reason || "")}`,
        {
          method: "POST",
          headers,
        }
      );
      if (!res.ok) throw new Error("Rejection failed.");

      toast(`Student registration for "${rejectModal.studentName}" rejected. Notification sent to student email.`, "info");
      setRejectModal(null);
      setSelectedStudent(null);
      fetchStudents();
    } catch (err) {
      toast(err.message || "Failed to reject student.", "error");
    }
  };

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        `${s.firstName} ${s.lastName} ${s.email} ${s.phoneNumber}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesDept =
        deptFilter === "ALL" ||
        s.departmentName?.toLowerCase().includes(deptFilter.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PENDING" && !s.isActive && !s.rejectionReason) ||
        (statusFilter === "APPROVED" && s.isActive) ||
        (statusFilter === "REJECTED" && !s.isActive && s.rejectionReason);

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [students, search, deptFilter, statusFilter]);

  const pendingCount = students.filter((s) => !s.isActive && !s.rejectionReason).length;
  const approvedCount = students.filter((s) => s.isActive).length;
  const rejectedCount = students.filter((s) => !s.isActive && s.rejectionReason).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <GraduationCap className="text-blue-600" size={24} /> Student Applications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review, inspect, and approve student and researcher registration requests for your institution.
          </p>
        </div>
        <button
          onClick={fetchStudents}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold px-4 py-2 flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh Requests
        </button>
      </div>

      {/* Summary Banner Cards (Interactive & Clickable) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Approvals Card */}
        <button
          type="button"
          onClick={() => setStatusFilter("PENDING")}
          className={`text-left rounded-2xl border p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
            statusFilter === "PENDING"
              ? "border-amber-500 bg-amber-100/90 ring-2 ring-amber-400 shadow-sm"
              : "border-amber-200 bg-amber-50/60 hover:bg-amber-100/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Approvals</p>
            <Clock size={16} className="text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-900 mt-1">{pendingCount}</p>
          <p className="text-[11px] font-medium text-amber-700 mt-1">
            {statusFilter === "PENDING" ? "✓ Showing pending requests" : "Click to view pending →"}
          </p>
        </button>

        {/* Approved Students Card */}
        <button
          type="button"
          onClick={() => setStatusFilter("APPROVED")}
          className={`text-left rounded-2xl border p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
            statusFilter === "APPROVED"
              ? "border-emerald-500 bg-emerald-100/90 ring-2 ring-emerald-400 shadow-sm"
              : "border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Approved Students</p>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-900 mt-1">{approvedCount}</p>
          <p className="text-[11px] font-medium text-emerald-700 mt-1">
            {statusFilter === "APPROVED" ? "✓ Showing approved students" : "Click to view approved →"}
          </p>
        </button>

        {/* Rejected Applications Card */}
        <button
          type="button"
          onClick={() => setStatusFilter("REJECTED")}
          className={`text-left rounded-2xl border p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
            statusFilter === "REJECTED"
              ? "border-red-500 bg-red-100/90 ring-2 ring-red-400 shadow-sm"
              : "border-red-200 bg-red-50/60 hover:bg-red-100/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-red-800 uppercase tracking-wider">Rejected Applications</p>
            <XCircle size={16} className="text-red-600" />
          </div>
          <p className="text-2xl font-extrabold text-red-900 mt-1">{rejectedCount}</p>
          <p className="text-[11px] font-medium text-red-700 mt-1">
            {statusFilter === "REJECTED" ? "✓ Showing rejected requests" : "Click to view rejected →"}
          </p>
        </button>

        {/* Total Registered Card */}
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={`text-left rounded-2xl border p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
            statusFilter === "ALL"
              ? "border-blue-500 bg-blue-100/90 ring-2 ring-blue-400 shadow-sm"
              : "border-blue-200 bg-blue-50/60 hover:bg-blue-100/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Total Applications</p>
            <GraduationCap size={16} className="text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-blue-900 mt-1">{students.length}</p>
          <p className="text-[11px] font-medium text-blue-700 mt-1">
            {statusFilter === "ALL" ? "✓ Showing all applications" : "Click to view all →"}
          </p>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student by name, email, or phone number..."
            className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Department Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Filter by Department</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className={inputClass()}
            >
              <option value="ALL">All Departments ({DEPARTMENTS.length})</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={inputClass()}
            >
              <option value="ALL">All Applications ({students.length})</option>
              <option value="PENDING">⏳ Pending Approval ({pendingCount})</option>
              <option value="APPROVED">✓ Approved Students ({approvedCount})</option>
              <option value="REJECTED">❌ Rejected Applications ({rejectedCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student List View */}
      {filteredStudents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
            <CheckCircle2 size={24} className="text-emerald-500" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Student Applications Found</h3>
          <p className="text-sm text-slate-500 mt-1">No student requests match your selected department or status filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((s) => (
            <div key={s.userId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-all">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-xs">
                      {initials(`${s.firstName} ${s.lastName}`)}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{s.firstName} {s.lastName}</h3>
                      <p className="text-xs text-slate-500 font-medium">{s.departmentName || "General Department"}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    s.isActive
                      ? "bg-emerald-100 text-emerald-800"
                      : s.rejectionReason
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {s.isActive ? "APPROVED" : s.rejectionReason ? "REJECTED" : "PENDING"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{s.email}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400 shrink-0" />
                    <span>{s.phoneNumber || "N/A"}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <Calendar size={13} className="text-slate-400 shrink-0" />
                    <span>{formatDateTime(s.createdAt)}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3 mt-4">
                <button
                  onClick={() => setSelectedStudent(s)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-1.5 text-xs transition-colors"
                >
                  <Eye size={14} className="text-blue-600" /> View Details
                </button>

                {!s.isActive && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveStudent(s.userId, `${s.firstName} ${s.lastName}`)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 text-xs transition-colors shadow-sm"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      onClick={() => setRejectModal({ userId: s.userId, studentName: `${s.firstName} ${s.lastName}`, reason: "" })}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold py-2 text-xs transition-colors"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student View Details Modal */}
      {selectedStudent && (
        <Modal
          title="Student Application Details"
          subtitle={`Application Reference ID: STU-${selectedStudent.userId}`}
          onClose={() => setSelectedStudent(null)}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-50/70 border border-blue-100">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-base">
                {initials(`${selectedStudent.firstName} ${selectedStudent.lastName}`)}
              </span>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h3>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold mt-0.5 ${
                  selectedStudent.isActive ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {selectedStudent.isActive ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  {selectedStudent.isActive ? "Approved Student Account" : "Pending Administrator Approval"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-700 border-t border-slate-100 pt-3">
              <div className="space-y-1">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Applied Role</p>
                <p className="font-bold text-blue-600">Student / Researcher</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Department</p>
                <p className="font-bold text-slate-900">{selectedStudent.departmentName || "General Department"}</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Institutional Email</p>
                <p className="font-medium text-slate-800 flex items-center gap-1">
                  <Mail size={12} className="text-slate-400" /> {selectedStudent.email}
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Phone Number</p>
                <p className="font-medium text-slate-800 flex items-center gap-1">
                  <Phone size={12} className="text-slate-400" /> {selectedStudent.phoneNumber || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Email OTP Verification</p>
                <p className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Email Verified ✓
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Applied Date & Time</p>
                <p className="font-bold text-slate-900 flex items-center gap-1">
                  <Calendar size={12} className="text-slate-400" /> {formatDateTime(selectedStudent.createdAt)}
                </p>
              </div>
            </div>

            {selectedStudent.rejectionReason && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 space-y-1 text-xs">
                <p className="font-bold text-red-900">Rejection Reason:</p>
                <p className="text-red-700">{selectedStudent.rejectionReason}</p>
              </div>
            )}

            {!selectedStudent.isActive && (
              <div className="flex items-center gap-2 border-t border-slate-100 pt-4 mt-4">
                <button
                  onClick={() => handleApproveStudent(selectedStudent.userId, `${selectedStudent.firstName} ${selectedStudent.lastName}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 text-xs transition-colors shadow-sm"
                >
                  <Check size={16} /> Approve Account
                </button>
                <button
                  onClick={() => {
                    setRejectModal({
                      userId: selectedStudent.userId,
                      studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
                      reason: "",
                    });
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold py-2.5 text-xs transition-colors"
                >
                  <X size={16} /> Reject Application
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Reject Reason Modal */}
      {rejectModal && (
        <Modal
          title="Reject Student Application"
          subtitle={`Applicant: ${rejectModal.studentName}`}
          onClose={() => setRejectModal(null)}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Please enter the official reason for rejecting this student's application. This reason will be sent to the student's email (<span className="font-semibold text-slate-800">{rejectModal.studentName}</span>).
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rejection Reason</label>
              <textarea
                rows={3}
                value={rejectModal.reason}
                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                placeholder="e.g. Invalid institutional email address or unverified student ID number."
                className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRejectModal(null)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 shadow-sm transition-colors"
              >
                Confirm Rejection & Send Email
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
