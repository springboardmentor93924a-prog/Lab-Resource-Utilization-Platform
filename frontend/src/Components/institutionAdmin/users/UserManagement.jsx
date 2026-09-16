import { useMemo, useState, useEffect } from "react";
import {
  Search, UserPlus, Building2, Users as UsersIcon, PlusCircle, Plus,
  ShieldCheck, UserCog, Clock, Check, X, RefreshCw, Eye, Mail, Phone,
  Calendar, Send, Copy, ExternalLink, Edit2, Trash2, MapPin, ChevronDown,
  ChevronUp, AlertTriangle, CheckCircle2, XCircle, Filter, Info, ShieldAlert
} from "lucide-react";
import { Modal } from "../../common/Modal.jsx";
import { Field, inputClass } from "../../common/Field.jsx";
import { departmentApi } from "../../../api/departmentApi";
import { staffApi } from "../../../api/staffApi";
import { API_BASE_URL } from "../../../api/client.js";

const ROLE_OPTIONS = ["DEPARTMENT_HEAD", "LAB_MANAGER", "LAB_TECHNICIAN"];
const ROLE_LABEL = {
  DEPARTMENT_HEAD: "Department Head",
  LAB_MANAGER: "Lab Manager",
  LAB_TECHNICIAN: "Lab Technician",
  TECHNICIAN: "Lab Technician",
  RESEARCHER: "Student / Researcher",
  INSTITUTION_ADMIN: "Institution Admin",
};
const ROLE_STYLE = {
  DEPARTMENT_HEAD: "bg-purple-50 text-purple-700 border-purple-200",
  LAB_MANAGER: "bg-blue-50 text-blue-700 border-blue-200",
  LAB_TECHNICIAN: "bg-slate-100 text-slate-700 border-slate-200",
  TECHNICIAN: "bg-slate-100 text-slate-700 border-slate-200",
  RESEARCHER: "bg-emerald-50 text-emerald-700 border-emerald-200",
  INSTITUTION_ADMIN: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

const STATUS_DOT = {
  ACTIVE: "bg-emerald-500",
  INVITED: "bg-blue-500",
  PENDING: "bg-blue-500",
  PENDING_SETUP: "bg-blue-500",
  INACTIVE: "bg-amber-500",
  REJECTED: "bg-red-500",
  REMOVED: "bg-red-500",
  CANCELLED: "bg-red-500",
};
const STATUS_TEXT = {
  ACTIVE: "text-emerald-700 bg-emerald-50 border-emerald-200",
  INVITED: "text-blue-700 bg-blue-50 border-blue-200",
  PENDING: "text-blue-700 bg-blue-50 border-blue-200",
  PENDING_SETUP: "text-blue-700 bg-blue-50 border-blue-200",
  INACTIVE: "text-amber-700 bg-amber-50 border-amber-200",
  REJECTED: "text-red-700 bg-red-50 border-red-200",
  REMOVED: "text-red-700 bg-red-50 border-red-200",
  CANCELLED: "text-red-700 bg-red-50 border-red-200",
};

const PAGE_SIZE = 10;

function initials(name) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  return `${parts[0]?.[0] || ""}${parts[parts.length - 1]?.[0] || ""}`.toUpperCase();
}

function formatRoleName(role) {
  if (!role) return "Staff Member";
  return ROLE_LABEL[role] || role.replace("_", " ");
}

function formatStatusLabel(status) {
  if (!status) return "Unknown";
  switch (String(status).toUpperCase()) {
    case "INVITED":
    case "PENDING":
    case "PENDING_SETUP":
      return "Pending Setup";
    case "ACTIVE":
      return "Active";
    case "INACTIVE":
      return "Inactive";
    case "REJECTED":
      return "Rejected";
    case "REMOVED":
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

export default function UserManagement({ toast }) {
  const [tab, setTab] = useState("departments"); // "departments" | "all" | "students"

  const [roster, setRoster] = useState(null);
  const [loadingRoster, setLoadingRoster] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [expandedDeptId, setExpandedDeptId] = useState(null);

  const [pendingStudents, setPendingStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Modals
  const [staffDetailModal, setStaffDetailModal] = useState(null);
  const [loadingStaffDetail, setLoadingStaffDetail] = useState(false);
  const [studentDetailModal, setStudentDetailModal] = useState(null);
  const [deptDetailModal, setDeptDetailModal] = useState(null);
  const [deactivateModal, setDeactivateModal] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [inviteLinkModal, setInviteLinkModal] = useState(null);

  // Filters for All Staff Table
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  // Fetch complete dynamic roster from backend
  const fetchRoster = async () => {
    setLoadingRoster(true);
    try {
      const data = await staffApi.getInstitutionStaffRoster();
      setRoster(data);
    } catch (err) {
      console.error("Failed to load staff roster", err);
      toast(err.message || "Failed to load staff roster.", "error");
    } finally {
      setLoadingRoster(false);
    }
  };

  // Fetch departments with laboratories
  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const data = await departmentApi.getMyInstitutionDepartments();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load departments", err);
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Fetch pending student applications
  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const token = localStorage.getItem("labflow_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE_URL}/users/students?activeOnly=false`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPendingStudents(data.filter((s) => !s.isActive));
      }
    } catch (err) {
      console.error("Failed to load student applications", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchRoster();
    fetchDepartments();
    fetchStudents();
  }, []);

  const handleRefreshAll = () => {
    fetchRoster();
    fetchDepartments();
    fetchStudents();
    toast("Staff roster and departments refreshed.", "info");
  };

  // Open staff details modal
  const handleViewStaffDetails = async (staff) => {
    if (staff.userId) {
      setLoadingStaffDetail(true);
      setStaffDetailModal(staff); // optimistic show
      try {
        const fullDetail = await staffApi.getStaffDetails(staff.userId);
        setStaffDetailModal(fullDetail);
      } catch (err) {
        console.warn("Could not fetch extended details, using local data", err);
      } finally {
        setLoadingStaffDetail(false);
      }
    } else {
      // Pending invitation
      setStaffDetailModal(staff);
    }
  };

  // Deactivate staff handler
  const handleConfirmDeactivate = async (userId, reason) => {
    try {
      await staffApi.deactivateStaff(userId, reason);
      toast("Staff member deactivated successfully.", "success");
      setDeactivateModal(null);
      if (staffDetailModal && staffDetailModal.userId === userId) {
        setStaffDetailModal(null);
      }
      await fetchRoster();
    } catch (err) {
      toast(err.message || "Failed to deactivate staff.", "error");
    }
  };

  // Cancel pending invitation
  const handleCancelInvitation = async (invitationId, staffName) => {
    try {
      await staffApi.cancelInvitation(invitationId);
      toast(`Pending invitation for "${staffName}" cancelled.`, "info");
      if (staffDetailModal && staffDetailModal.invitationId === invitationId) {
        setStaffDetailModal(null);
      }
      await fetchRoster();
    } catch (err) {
      toast(err.message || "Failed to cancel invitation.", "error");
    }
  };

  // Send staff invitation
  const handleSendInvite = async (formData) => {
    try {
      const cleanEmail = formData.email.trim().toLowerCase();
      const matchedDept = departments.find((d) => d.name === formData.department || d.departmentId === formData.departmentId);
      const departmentId = matchedDept ? matchedDept.departmentId : formData.departmentId;

      const resData = await staffApi.inviteStaff({
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: cleanEmail,
        phoneNumber: formData.phone || "N/A",
        departmentId: departmentId,
        roleName: formData.role,
      });

      const inviteUrl = `${window.location.origin}/?page=accept-invitation&token=${resData?.token || ""}`;

      setInviteLinkModal({
        name: `${formData.firstName} ${formData.lastName}`,
        email: cleanEmail,
        link: inviteUrl,
      });

      toast(`Invitation dispatched for ${cleanEmail}!`, "success");
      setShowInviteModal(false);
      await fetchRoster();
    } catch (err) {
      toast(err.message || "Failed to invite staff.", "error");
    }
  };

  // Resend invitation link
  const handleResendInvite = async (staff) => {
    try {
      const nameParts = (staff.fullName || "").trim().split(" ");
      const firstName = staff.firstName || nameParts[0] || "Staff";
      const lastName = staff.lastName || nameParts.slice(1).join(" ") || "";

      await staffApi.inviteStaff({
        fullName: `${firstName} ${lastName}`.trim(),
        email: staff.email.trim().toLowerCase(),
        phoneNumber: staff.phoneNumber || "N/A",
        departmentId: staff.departmentId,
        roleName: staff.role,
      });
      toast(`Invitation email resent to ${staff.email}!`, "success");
    } catch (err) {
      toast(err.message || "Failed to resend invitation.", "error");
    }
  };

  // Add department
  const handleAddDepartment = async (newDeptData) => {
    try {
      const createdDept = await departmentApi.createDepartment(newDeptData);
      const count = createdDept?.laboratories?.length || newDeptData.laboratories?.length || 0;
      toast(`Department "${createdDept.name || newDeptData.name}" and ${count} laboratories were created successfully!`, "success");
      setShowAddDeptModal(false);
      await fetchDepartments();
      await fetchRoster();
    } catch (err) {
      toast(err.message || "Failed to create department.", "error");
      throw err;
    }
  };

  // Student approvals
  const handleApproveStudent = async (userId, studentName) => {
    try {
      const token = localStorage.getItem("labflow_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE_URL}/users/approve-student/${userId}`, {
        method: "POST",
        headers,
      });
      if (!res.ok) throw new Error("Approval failed.");

      toast(`Student "${studentName}" approved successfully!`, "success");
      setStudentDetailModal(null);
      await fetchStudents();
    } catch (err) {
      toast(err.message || "Failed to approve student.", "error");
    }
  };

  const handleRejectStudent = async (userId, studentName) => {
    try {
      const token = localStorage.getItem("labflow_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE_URL}/users/reject-student/${userId}`, {
        method: "POST",
        headers,
      });
      if (!res.ok) throw new Error("Rejection failed.");

      toast(`Student registration for "${studentName}" rejected.`, "info");
      setStudentDetailModal(null);
      await fetchStudents();
    } catch (err) {
      toast(err.message || "Failed to reject student.", "error");
    }
  };

  // All Staff flat list with filtering
  const allStaffList = useMemo(() => {
    if (!roster || !roster.allStaff) return [];
    return roster.allStaff;
  }, [roster]);

  const filteredStaff = useMemo(() => {
    const list = allStaffList.filter((s) => {
      const matchesSearch =
        search === "" ||
        `${s.fullName} ${s.email} ${s.phoneNumber || ""}`.toLowerCase().includes(search.toLowerCase());

      const matchesDept =
        deptFilter === "ALL" ||
        s.departmentName === deptFilter ||
        String(s.departmentId) === String(deptFilter);

      const matchesRole =
        roleFilter === "ALL" ||
        s.role === roleFilter ||
        (roleFilter === "LAB_TECHNICIAN" && s.role === "TECHNICIAN");

      const matchesStatus =
        statusFilter === "ALL" ||
        s.status === statusFilter ||
        (statusFilter === "ACTIVE" && s.status === "ACTIVE") ||
        (statusFilter === "INVITED" && (s.status === "INVITED" || s.status === "PENDING" || s.status === "PENDING_SETUP")) ||
        (statusFilter === "INACTIVE" && (s.status === "INACTIVE" || s.status === "REJECTED" || s.status === "REMOVED" || s.status === "CANCELLED"));

      return matchesSearch && matchesDept && matchesRole && matchesStatus;
    });

    return [...list].sort((a, b) => {
      if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
      if (a.status !== "ACTIVE" && b.status === "ACTIVE") return 1;
      return (a.fullName || "").localeCompare(b.fullName || "");
    });
  }, [allStaffList, search, deptFilter, roleFilter, statusFilter]);

  const pageRows = filteredStaff.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filteredStaff.length / PAGE_SIZE) || 1;

  const clearFilters = () => {
    setSearch("");
    setDeptFilter("ALL");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setPage(1);
  };

  const deptGroups = roster?.departments || [];

  const activeStaffCount = useMemo(() => allStaffList.filter((s) => s.status === "ACTIVE").length, [allStaffList]);
  const pendingStaffCount = useMemo(() => allStaffList.filter((s) => s.status === "INVITED" || s.status === "PENDING" || s.status === "PENDING_SETUP").length, [allStaffList]);
  const activeHeadCount = useMemo(() => allStaffList.filter((s) => s.role === "DEPARTMENT_HEAD" && s.status === "ACTIVE").length, [allStaffList]);
  const activeManagerCount = useMemo(() => allStaffList.filter((s) => s.role === "LAB_MANAGER" && s.status === "ACTIVE").length, [allStaffList]);
  const activeTechCount = useMemo(() => allStaffList.filter((s) => (s.role === "LAB_TECHNICIAN" || s.role === "TECHNICIAN") && s.status === "ACTIVE").length, [allStaffList]);

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Institution Staff & User Management</h1>
            {roster?.institutionCode && (
              <span className="text-xs font-black uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200">
                {roster.institutionCode}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic department staffing hierarchy, role allocation, and student registration requests for{" "}
            <span className="font-semibold text-slate-700">{roster?.institutionName || "your institution"}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddDeptModal(true)}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
          >
            <Plus size={15} /> Add Department
          </button>
          <button
            onClick={handleRefreshAll}
            className="rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold px-3.5 py-2.5 flex items-center gap-1.5 transition-colors shrink-0"
            title="Reload live roster from server"
          >
            <RefreshCw size={14} className={loadingRoster ? "animate-spin text-blue-600" : ""} /> Refresh
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
          >
            <UserPlus size={15} /> Invite Staff
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 my-5">
        <SummaryCard
          icon={UsersIcon}
          label="Total Staff Positions"
          value={roster?.totalStaffCount ?? "..."}
          subtext={`${activeStaffCount} active • ${pendingStaffCount} pending`}
          tone="text-slate-800"
          bg="bg-slate-100"
        />
        <SummaryCard
          icon={ShieldCheck}
          label="Department Heads"
          value={roster?.departmentHeadCount ?? "..."}
          subtext={`${activeHeadCount} active • ${deptGroups.length} depts`}
          tone="text-purple-600"
          bg="bg-purple-50"
        />
        <SummaryCard
          icon={UserCog}
          label="Lab Managers"
          value={roster?.labManagerCount ?? "..."}
          subtext={`${activeManagerCount} active • ${(roster?.labManagerCount || 0) - activeManagerCount} pending`}
          tone="text-blue-600"
          bg="bg-blue-50"
        />
        <SummaryCard
          icon={Building2}
          label="Lab Technicians"
          value={roster?.technicianCount ?? "..."}
          subtext={`${activeTechCount} active • ${(roster?.technicianCount || 0) - activeTechCount} pending`}
          tone="text-indigo-600"
          bg="bg-indigo-50"
        />
        <SummaryCard
          icon={Clock}
          label="Pending Student Requests"
          value={pendingStudents.length}
          subtext="Awaiting review"
          tone="text-amber-600"
          bg="bg-amber-50"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1.5 rounded-2xl bg-slate-100/90 p-1.5 w-fit mb-5">
        <button
          onClick={() => setTab("departments")}
          className={`rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-2 transition-all ${
            tab === "departments"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Building2 size={15} /> Staff by Department ({deptGroups.length})
        </button>
        <button
          onClick={() => setTab("all")}
          className={`rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-2 transition-all ${
            tab === "all"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <UsersIcon size={15} /> All Staff Directory ({allStaffList.length})
        </button>
        <button
          onClick={() => setTab("students")}
          className={`rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-2 transition-all ${
            tab === "students"
              ? "bg-white text-amber-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          🎓 Student Applications ({pendingStudents.length})
        </button>
      </div>

      {/* TAB 1: Staff Grouped by Department */}
      {tab === "departments" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between bg-blue-50/70 border border-blue-100 rounded-2xl p-4 gap-3">
            <div>
              <h3 className="font-bold text-blue-900 text-sm">Dynamic Department Staffing Hierarchy</h3>
              <p className="text-xs text-blue-700 mt-0.5">
                Inspect assigned Department Heads, Lab Managers, and Technicians per academic department.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-800 bg-blue-100/80 px-3 py-1 rounded-xl border border-blue-200">
                {deptGroups.length} Active Departments
              </span>
            </div>
          </div>

          {loadingRoster && deptGroups.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm rounded-2xl border border-slate-200 bg-white">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
              Loading institution department hierarchy and staff...
            </div>
          ) : deptGroups.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm rounded-2xl border border-dashed border-slate-200 bg-white">
              No departments found for this institution. Use "Add Department" to create one.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {deptGroups.map((group) => {
                const matchedDept = departments.find((d) => d.departmentId === group.departmentId);
                const labs = matchedDept?.laboratories || [];
                const isExpanded = expandedDeptId === group.departmentId;

                const head = group.staff.find((s) => s.role === "DEPARTMENT_HEAD" && s.status === "ACTIVE") || group.staff.find((s) => s.role === "DEPARTMENT_HEAD");
                const manager = group.staff.find((s) => s.role === "LAB_MANAGER" && s.status === "ACTIVE") || group.staff.find((s) => s.role === "LAB_MANAGER");
                const techs = group.staff.filter((s) => s.role === "LAB_TECHNICIAN" || s.role === "TECHNICIAN");

                const sortedStaff = [...group.staff].sort((a, b) => {
                  if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
                  if (a.status !== "ACTIVE" && b.status === "ACTIVE") return 1;
                  return (a.fullName || "").localeCompare(b.fullName || "");
                });

                return (
                  <div
                    key={group.departmentId}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Department Header */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
                            <Building2 size={18} />
                          </span>
                          {group.departmentCode && (
                            <span className="text-xs font-black uppercase tracking-wider text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-lg border border-blue-200">
                              {group.departmentCode}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                          {group.totalStaffCount} Staff Members
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                        {group.departmentName}
                      </h3>

                      {/* Staff Role Count Badges */}
                      <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-slate-100 text-center">
                        <div className="p-2 rounded-xl bg-purple-50/70 border border-purple-100">
                          <p className="text-[10px] font-extrabold uppercase text-purple-600 tracking-wider">Head</p>
                          <p className="text-sm font-extrabold text-purple-900 mt-0.5">{group.headCount}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-100">
                          <p className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider">Manager</p>
                          <p className="text-sm font-extrabold text-blue-900 mt-0.5">{group.managerCount}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-100/80 border border-slate-200">
                          <p className="text-[10px] font-extrabold uppercase text-slate-600 tracking-wider">Technicians</p>
                          <p className="text-sm font-extrabold text-slate-800 mt-0.5">{group.technicianCount}</p>
                        </div>
                      </div>

                      {/* Key Personnel Highlight */}
                      <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Department Head:</span>
                          <span className="font-bold text-purple-700 truncate max-w-[170px]" title={head?.fullName}>
                            {head ? (
                              <span>
                                {head.fullName}
                                {head.status !== "ACTIVE" && (
                                  <span className="text-[10px] text-amber-600 font-normal ml-1">(Invited)</span>
                                )}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Pending Assignment</span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Lab Manager:</span>
                          <span className="font-bold text-blue-700 truncate max-w-[170px]" title={manager?.fullName}>
                            {manager ? (
                              <span>
                                {manager.fullName}
                                {manager.status !== "ACTIVE" && (
                                  <span className="text-[10px] text-amber-600 font-normal ml-1">(Invited)</span>
                                )}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Pending Assignment</span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Laboratories:</span>
                          <span className="font-bold text-slate-700">
                            {labs.length} {labs.length === 1 ? "Lab" : "Labs"}
                          </span>
                        </div>
                      </div>

                      {/* Expandable Staff Member List */}
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                            Staff Roster ({group.staff.length})
                          </span>
                          <button
                            type="button"
                            onClick={() => setExpandedDeptId(isExpanded ? null : group.departmentId)}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                          >
                            {isExpanded ? "Hide" : "View Staff"} {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        </div>

                        {isExpanded ? (
                          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                            {sortedStaff.length === 0 ? (
                              <p className="text-xs text-slate-400 italic p-2">No staff members in this department yet.</p>
                            ) : (
                              sortedStaff.map((sm) => (
                                <div
                                  key={sm.userId ? `u-${sm.userId}` : `inv-${sm.invitationId}`}
                                  className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between gap-2 hover:bg-blue-50/50 transition-colors"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-800 text-[10px] font-bold">
                                      {initials(sm.fullName)}
                                    </span>
                                    <div className="min-w-0">
                                      <p className="font-bold text-slate-900 truncate">{sm.fullName}</p>
                                      <p className="text-[10px] text-slate-400 truncate">{sm.email}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <RoleBadge role={sm.role} compact />
                                    <button
                                      onClick={() => handleViewStaffDetails(sm)}
                                      className="p-1 rounded-lg hover:bg-slate-200 text-blue-600"
                                      title="View Details"
                                    >
                                      <Eye size={13} />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1 text-xs">
                            {sortedStaff.slice(0, 2).map((sm) => (
                              <div key={sm.userId ? `u-${sm.userId}` : `inv-${sm.invitationId}`} className="flex items-center justify-between text-slate-600">
                                <span className="truncate max-w-[180px] font-medium">• {sm.fullName}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${STATUS_TEXT[sm.status] || "text-slate-500"}`}>
                                  {formatStatusLabel(sm.status)}
                                </span>
                              </div>
                            ))}
                            {sortedStaff.length > 2 && (
                              <p className="text-[11px] text-slate-400 font-medium">+ {sortedStaff.length - 2} more staff members</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setDeptFilter(group.departmentName);
                          setTab("all");
                          setPage(1);
                        }}
                        className="flex-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 text-center transition-colors"
                      >
                        View in Directory
                      </button>
                      <button
                        onClick={() =>
                          setDeptDetailModal({
                            department: group.departmentName,
                            code: group.departmentCode,
                            laboratories: labs,
                            head: head,
                            staff: group.staff,
                          })
                        }
                        className="rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold p-2 transition-colors"
                        title="View full department modal"
                      >
                        <Eye size={15} className="text-blue-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: All Staff Directory Table */}
      {tab === "all" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="relative mb-3">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search staff by name, email, or phone…"
                className={`${inputClass()} pl-9`}
              />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <select
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setPage(1);
                }}
                className={inputClass()}
              >
                <option value="ALL">All Departments ({deptGroups.length})</option>
                {deptGroups.map((d) => (
                  <option key={d.departmentId} value={d.departmentName}>
                    {d.departmentName} ({d.totalStaffCount})
                  </option>
                ))}
              </select>

              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className={inputClass()}
              >
                <option value="ALL">All Staff Roles</option>
                <option value="DEPARTMENT_HEAD">Department Head</option>
                <option value="LAB_MANAGER">Lab Manager</option>
                <option value="LAB_TECHNICIAN">Lab Technician</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className={inputClass()}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Users</option>
                <option value="INVITED">Pending Setup (Invited)</option>
                <option value="INACTIVE">Inactive / Deactivated</option>
              </select>

              <button
                onClick={clearFilters}
                className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors py-2"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Directory Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left min-w-[760px]">
                <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-200 font-extrabold">
                  <tr>
                    <th className="px-5 py-3.5">Staff Member</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Account Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-slate-400 text-sm">
                        No staff members matching the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((s) => (
                      <tr key={s.userId ? `u-${s.userId}` : `inv-${s.invitationId}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                              {initials(s.fullName)}
                            </span>
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{s.fullName}</p>
                              <p className="text-[11px] text-slate-400">{s.email}</p>
                              {s.phoneNumber && s.phoneNumber !== "N/A" && (
                                <p className="text-[10px] text-slate-400">{s.phoneNumber}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-700">{s.departmentName || "General"}</span>
                            {s.departmentCode && (
                              <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                {s.departmentCode}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <RoleBadge role={s.role} />
                        </td>

                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_TEXT[s.status] || "text-slate-600 bg-slate-50 border-slate-200"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[s.status] || "bg-slate-400"}`} />
                            {formatStatusLabel(s.status)}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewStaffDetails(s)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-blue-700 border border-slate-200 bg-white hover:bg-blue-50/50 px-2.5 py-1.5 rounded-lg transition-colors shadow-2xs"
                              title="View non-sensitive profile details"
                            >
                              <Eye size={12} className="text-blue-600" /> Details
                            </button>

                            {s.status === "INVITED" && (
                              <>
                                <button
                                  onClick={() => handleResendInvite(s)}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 border border-blue-200 bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
                                  title="Resend invitation link"
                                >
                                  <Send size={11} /> Resend
                                </button>
                                <button
                                  onClick={() => handleCancelInvitation(s.invitationId, s.fullName)}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
                                  title="Cancel pending invitation"
                                >
                                  <Trash2 size={11} /> Cancel
                                </button>
                              </>
                            )}

                            {s.status === "ACTIVE" && (
                              <button
                                onClick={() => setDeactivateModal(s)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 border border-amber-200 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg transition-colors"
                                title="Deactivate staff account"
                              >
                                Deactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredStaff.length)} of {filteredStaff.length} staff
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 rounded-lg border border-slate-200 bg-white disabled:opacity-40 font-semibold hover:bg-slate-50"
                  >
                    Previous
                  </button>
                  <span className="font-bold text-slate-700 px-2">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 rounded-lg border border-slate-200 bg-white disabled:opacity-40 font-semibold hover:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Student Applications */}
      {tab === "students" && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Pending Student Registration Requests</h3>
              <p className="text-xs text-slate-500">Review student verification and institutional enrollment credentials.</p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {pendingStudents.length} awaiting approval
            </span>
          </div>

          {loadingStudents ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading applications...</div>
          ) : pendingStudents.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No pending student registration requests found.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingStudents.map((s) => (
                <div key={s.userId} className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 font-bold border border-amber-200">
                      {initials(`${s.firstName} ${s.lastName}`)}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-slate-500">{s.email} • {s.departmentName || "General Dept"}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Phone: {s.phoneNumber || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setStudentDetailModal(s)}
                      className="rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold px-3 py-2 transition-colors flex items-center gap-1.5"
                    >
                      <Eye size={13} className="text-blue-600" /> View Application
                    </button>
                    <button
                      onClick={() => handleApproveStudent(s.userId, `${s.firstName} ${s.lastName}`)}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Check size={13} /> Approve
                    </button>
                    <button
                      onClick={() => handleRejectStudent(s.userId, `${s.firstName} ${s.lastName}`)}
                      className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-3 py-2 transition-colors flex items-center gap-1.5"
                    >
                      <X size={13} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Rich Non-Secret Staff View Details Modal */}
      {staffDetailModal && (
        <Modal
          title={`Staff Profile — ${staffDetailModal.fullName}`}
          subtitle="Non-sensitive personnel record, organizational assignment, and verification metadata."
          onClose={() => setStaffDetailModal(null)}
        >
          <div className="space-y-4 text-xs">
            {/* Header Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 text-base font-extrabold shadow-2xs">
                  {initials(staffDetailModal.fullName)}
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base leading-tight">{staffDetailModal.fullName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{staffDetailModal.email}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <RoleBadge role={staffDetailModal.role} />
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_TEXT[staffDetailModal.status]}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[staffDetailModal.status]}`} />
                  {formatStatusLabel(staffDetailModal.status)}
                </span>
              </div>
            </div>

            {/* Personal & Organization Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-slate-100 bg-white">
                <p className="text-slate-400 font-medium text-[11px]">Institution</p>
                <p className="font-bold text-slate-800 mt-0.5">
                  {staffDetailModal.institutionName || roster?.institutionName || "Institution"}
                  {staffDetailModal.institutionCode && (
                    <span className="ml-1.5 text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      {staffDetailModal.institutionCode}
                    </span>
                  )}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 bg-white">
                <p className="text-slate-400 font-medium text-[11px]">Department</p>
                <p className="font-bold text-slate-800 mt-0.5">
                  {staffDetailModal.departmentName || "General Department"}
                  {staffDetailModal.departmentCode && (
                    <span className="ml-1.5 text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                      {staffDetailModal.departmentCode}
                    </span>
                  )}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 bg-white">
                <p className="text-slate-400 font-medium text-[11px]">Phone Number</p>
                <p className="font-bold text-slate-800 mt-0.5">{staffDetailModal.phoneNumber || "N/A"}</p>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 bg-white">
                <p className="text-slate-400 font-medium text-[11px]">Assigned Role Title</p>
                <p className="font-bold text-slate-800 mt-0.5">{staffDetailModal.roleLabel || formatRoleName(staffDetailModal.role)}</p>
              </div>
            </div>

            {/* Account & Verification Lifecycle */}
            <div className="p-3.5 rounded-xl border border-slate-100 bg-white space-y-2">
              <h5 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider">Account Lifecycle & Security</h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Email Verified:</span>
                  <span className={`font-bold ${staffDetailModal.isEmailVerified ? "text-emerald-600" : "text-amber-600"}`}>
                    {staffDetailModal.isEmailVerified ? "✓ Verified" : "⏳ Pending"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Phone Verified:</span>
                  <span className={`font-bold ${staffDetailModal.isPhoneVerified ? "text-emerald-600" : "text-slate-500"}`}>
                    {staffDetailModal.isPhoneVerified ? "✓ Verified" : "Not Verified"}
                  </span>
                </div>
                {staffDetailModal.createdAt && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Created:</span>
                    <span className="font-semibold text-slate-700">
                      {new Date(staffDetailModal.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {staffDetailModal.invitedAt && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Invited:</span>
                    <span className="font-semibold text-slate-700">
                      {new Date(staffDetailModal.invitedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {staffDetailModal.status === "INACTIVE" && staffDetailModal.deactivationReason && (
                <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  <p className="font-bold">Deactivation Reason:</p>
                  <p className="mt-0.5 italic">"{staffDetailModal.deactivationReason}"</p>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4">
              <div>
                {staffDetailModal.status === "ACTIVE" && staffDetailModal.userId && (
                  <button
                    onClick={() => {
                      setDeactivateModal(staffDetailModal);
                    }}
                    className="rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold px-3.5 py-2 text-xs transition-colors"
                  >
                    Deactivate Account
                  </button>
                )}
                {staffDetailModal.status === "INVITED" && staffDetailModal.invitationId && (
                  <button
                    onClick={() => handleCancelInvitation(staffDetailModal.invitationId, staffDetailModal.fullName)}
                    className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold px-3.5 py-2 text-xs transition-colors"
                  >
                    Cancel Invitation
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStaffDetailModal(null)}
                  className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: Deactivate Staff Modal */}
      {deactivateModal && (
        <DeactivateStaffModal
          staff={deactivateModal}
          onClose={() => setDeactivateModal(null)}
          onConfirm={handleConfirmDeactivate}
        />
      )}

      {/* MODAL 3: Add Department Modal */}
      {showAddDeptModal && (
        <AddDepartmentModal
          onClose={() => setShowAddDeptModal(false)}
          onAddDepartment={handleAddDepartment}
        />
      )}

      {/* MODAL 4: Invite Staff Modal */}
      {showInviteModal && (
        <InviteStaffModal
          departments={deptGroups.map((d) => d.departmentName)}
          onClose={() => setShowInviteModal(false)}
          onSendInvite={handleSendInvite}
        />
      )}

      {/* MODAL 5: Staff Invitation Setup Link Modal */}
      {inviteLinkModal && (
        <Modal
          title="Staff Invitation Link Dispatched"
          subtitle="A password setup invitation was created. You may also copy the direct setup link below."
          onClose={() => setInviteLinkModal(null)}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
              <p className="text-slate-600 font-medium">Invitation generated for:</p>
              <p className="font-extrabold text-slate-900 text-sm mt-0.5">{inviteLinkModal.name}</p>
              <p className="text-xs text-blue-700 font-semibold">{inviteLinkModal.email}</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Direct Password Setup Link</label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  type="text"
                  value={inviteLinkModal.link}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-600 font-mono text-[11px] select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(inviteLinkModal.link);
                    toast("Link copied to clipboard!", "success");
                  }}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 text-xs transition-colors flex items-center gap-1 shrink-0"
                >
                  <Copy size={13} /> Copy
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setInviteLinkModal(null)}
                className="rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold px-4 py-2 text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 6: Department Details Modal */}
      {deptDetailModal && (
        <Modal
          title={`Department Profile — ${deptDetailModal.department}`}
          subtitle="Department identity, active laboratories, and staff hierarchy."
          onClose={() => setDeptDetailModal(null)}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider">Department Head</p>
                <p className="font-extrabold text-slate-900 text-base mt-0.5">{deptDetailModal.head?.fullName || "Unassigned Department Head"}</p>
                <p className="text-xs text-slate-600 mt-0.5">{deptDetailModal.head?.email || "Pending Assignment"}</p>
              </div>
              <span className="rounded-full bg-purple-200 text-purple-900 px-3 py-1 text-xs font-extrabold">
                {deptDetailModal.head?.phoneNumber || "N/A"}
              </span>
            </div>

            {deptDetailModal.laboratories && deptDetailModal.laboratories.length > 0 && (
              <div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  Active Laboratories ({deptDetailModal.laboratories.length})
                </h4>
                <div className="space-y-2 max-h-[160px] overflow-y-auto">
                  {deptDetailModal.laboratories.map((lab) => (
                    <div key={lab.labId || lab.name} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{lab.name}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-slate-400" /> {lab.location || "Location not set"}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {lab.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pt-2">Staff Roster</h4>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white max-h-[220px] overflow-y-auto">
              {deptDetailModal.staff.map((u) => (
                <div key={u.userId ? `u-${u.userId}` : `inv-${u.invitationId}`} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold">
                      {initials(u.fullName)}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">{u.fullName}</p>
                      <p className="text-[11px] text-slate-500">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RoleBadge role={u.role} compact />
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_TEXT[u.status] || "text-slate-600 bg-slate-50 border-slate-200"}`}>
                      <span className={`h-1 w-1 rounded-full ${STATUS_DOT[u.status] || "bg-slate-400"}`} />
                      {formatStatusLabel(u.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 7: Student Application Detail Modal */}
      {studentDetailModal && (
        <Modal
          title={`Student Profile — ${studentDetailModal.firstName} ${studentDetailModal.lastName}`}
          subtitle="Verification details, department selection, and institutional identity."
          onClose={() => setStudentDetailModal(null)}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 text-lg font-extrabold">
                {initials(`${studentDetailModal.firstName} ${studentDetailModal.lastName}`)}
              </span>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">{studentDetailModal.firstName} {studentDetailModal.lastName}</h4>
                <p className="text-xs text-slate-500">{studentDetailModal.email}</p>
                <span className="inline-block mt-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Registration Pending Approval
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-100 bg-white">
                <p className="text-slate-400 font-medium">Department</p>
                <p className="font-bold text-slate-800 mt-0.5">{studentDetailModal.departmentName || "General / Unassigned"}</p>
              </div>
              <div className="p-3 rounded-xl border border-slate-100 bg-white">
                <p className="text-slate-400 font-medium">Phone Number</p>
                <p className="font-bold text-slate-800 mt-0.5">{studentDetailModal.phoneNumber || "Not provided"}</p>
              </div>
              <div className="p-3 rounded-xl border border-slate-100 bg-white">
                <p className="text-slate-400 font-medium">Roll Number</p>
                <p className="font-bold text-slate-800 mt-0.5">{studentDetailModal.rollNumber || "N/A"}</p>
              </div>
              <div className="p-3 rounded-xl border border-slate-100 bg-white">
                <p className="text-slate-400 font-medium">Researcher ID</p>
                <p className="font-bold text-slate-800 mt-0.5">{studentDetailModal.researcherId || "N/A"}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setStudentDetailModal(null)}
                className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 text-xs transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleRejectStudent(studentDetailModal.userId, `${studentDetailModal.firstName} ${studentDetailModal.lastName}`)}
                className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold px-4 py-2 text-xs transition-colors"
              >
                Reject Registration
              </button>
              <button
                onClick={() => handleApproveStudent(studentDetailModal.userId, `${studentDetailModal.firstName} ${studentDetailModal.lastName}`)}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 text-xs transition-colors shadow-sm"
              >
                Approve & Activate Student
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function DeactivateStaffModal({ staff, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("A deactivation reason is required.");
      return;
    }
    setSubmitting(true);
    try {
      await onConfirm(staff.userId, reason.trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={`Deactivate Staff Account — ${staff.fullName}`}
      subtitle="The staff member will lose access immediately and receive an email notification."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Are you sure you want to deactivate this account?</p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Staff: {staff.fullName} ({staff.email}) • {staff.departmentName}
            </p>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Reason for Deactivation *</label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. End of tenure, role reassignment, or institutional request..."
            className={`w-full rounded-xl border ${error ? "border-red-400 bg-red-50/20" : "border-slate-200"} p-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500`}
          />
          {error && <p className="text-red-500 text-[11px] font-semibold mt-1">{error}</p>}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-5 py-2 text-xs transition-colors shadow-xs"
          >
            {submitting ? "Deactivating..." : "Confirm Deactivation"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AddDepartmentModal({ onClose, onAddDepartment }) {
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [laboratories, setLaboratories] = useState([
    { name: "", location: "" },
  ]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleAddLab = () => {
    setLaboratories([...laboratories, { name: "", location: "" }]);
  };

  const handleRemoveLab = (index) => {
    if (laboratories.length <= 1) return;
    const updated = laboratories.filter((_, i) => i !== index);
    setLaboratories(updated);
  };

  const handleLabChange = (index, field, value) => {
    const updated = [...laboratories];
    updated[index] = { ...updated[index], [field]: value };
    setLaboratories(updated);
    if (errors[`lab_${index}_${field}`]) {
      const copy = { ...errors };
      delete copy[`lab_${index}_${field}`];
      setErrors(copy);
    }
  };

  const validate = () => {
    const errs = {};
    if (!deptName.trim()) errs.deptName = "Department name is required.";
    if (!deptCode.trim()) errs.deptCode = "Department code is required.";
    if (!laboratories || laboratories.length === 0) {
      errs.general = "At least one laboratory is required.";
    } else {
      const seen = new Set();
      laboratories.forEach((lab, idx) => {
        if (!lab.name.trim()) errs[`lab_${idx}_name`] = "Lab name is required.";
        if (!lab.location.trim()) errs[`lab_${idx}_location`] = "Location is required.";
        const norm = lab.name.trim().toLowerCase();
        if (norm) {
          if (seen.has(norm)) errs[`lab_${idx}_name`] = "Duplicate laboratory name.";
          else seen.add(norm);
        }
      });
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onAddDepartment({
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase(),
        laboratories: laboratories.map((lab) => ({
          name: lab.name.trim(),
          location: lab.location.trim(),
        })),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Add New Department"
      subtitle="Create a department and define its laboratories"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2.5">
            Department Information
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
              <input
                type="text"
                placeholder="e.g. Biomedical Engineering"
                value={deptName}
                onChange={(e) => {
                  setDeptName(e.target.value);
                  if (errors.deptName) setErrors({ ...errors, deptName: null });
                }}
                className={`w-full rounded-xl border ${errors.deptName ? "border-red-400 bg-red-50/20" : "border-slate-200"} px-3.5 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.deptName && <p className="text-red-500 text-[11px] font-semibold mt-1">{errors.deptName}</p>}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Department Code *</label>
              <input
                type="text"
                placeholder="e.g. BME"
                value={deptCode}
                onChange={(e) => {
                  setDeptCode(e.target.value);
                  if (errors.deptCode) setErrors({ ...errors, deptCode: null });
                }}
                className={`w-full rounded-xl border ${errors.deptCode ? "border-red-400 bg-red-50/20" : "border-slate-200"} px-3.5 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.deptCode && <p className="text-red-500 text-[11px] font-semibold mt-1">{errors.deptCode}</p>}
            </div>
          </div>
        </div>

        <hr className="border-slate-100 my-2" />

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-slate-700">Laboratories *</label>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {laboratories.length} {laboratories.length === 1 ? "laboratory" : "laboratories"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">Define the laboratories and their locations.</p>

          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {laboratories.map((lab, index) => (
              <div key={index} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 relative space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold">
                      {index + 1}
                    </span>
                    Laboratory {index + 1}
                  </span>
                  {laboratories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLab(index)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
                      title="Delete laboratory"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 text-[11px] mb-1">Lab Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Bio-instrumentation & Sensors Lab"
                    value={lab.name}
                    onChange={(e) => handleLabChange(index, "name", e.target.value)}
                    className={`w-full rounded-lg border ${errors[`lab_${index}_name`] ? "border-red-400 bg-red-50/20" : "border-slate-200"} bg-white px-3 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors[`lab_${index}_name`] && (
                    <p className="text-red-500 text-[10px] font-semibold mt-0.5">{errors[`lab_${index}_name`]}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 text-[11px] mb-1">Location *</label>
                  <input
                    type="text"
                    placeholder="e.g. Block A, Room 101"
                    value={lab.location}
                    onChange={(e) => handleLabChange(index, "location", e.target.value)}
                    className={`w-full rounded-lg border ${errors[`lab_${index}_location`] ? "border-red-400 bg-red-50/20" : "border-slate-200"} bg-white px-3 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors[`lab_${index}_location`] && (
                    <p className="text-red-500 text-[10px] font-semibold mt-0.5">{errors[`lab_${index}_location`]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <button
              type="button"
              onClick={handleAddLab}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              <PlusCircle size={14} /> Add Laboratory
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
          <span className="text-blue-600 font-bold text-sm leading-none mt-0.5">ℹ</span>
          <p>
            Department Head will be assigned separately through the existing staff invitation workflow.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-5 py-2 text-xs transition-colors shadow-sm flex items-center gap-1.5"
          >
            {submitting ? "Creating..." : "Create Department"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function InviteStaffModal({ departments, onClose, onSendInvite }) {
  const deptList = departments && departments.length > 0 ? departments : ["General Department"];
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: deptList[0],
    role: "LAB_MANAGER",
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required.";
    if (!form.lastName.trim()) errs.lastName = "Last name is required.";
    if (!form.email.trim() || !form.email.includes("@")) errs.email = "Valid college email address is required.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onSendInvite(form);
  };

  return (
    <Modal title="Invite Staff Member" subtitle="Send invitation to join institution staff network" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First Name" required error={errors.firstName}>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              placeholder="e.g. Ramesh"
              className={inputClass(errors.firstName)}
            />
          </Field>
          <Field label="Last Name" required error={errors.lastName}>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              placeholder="e.g. Kumar"
              className={inputClass(errors.lastName)}
            />
          </Field>
        </div>

        <Field label="College Email Address" required error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="e.g. staff.member@institution.edu.in"
            className={inputClass(errors.email)}
          />
        </Field>

        <Field label="Phone Number (Optional)">
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="e.g. 9876543210"
            className={inputClass()}
          />
        </Field>

        <Field label="Department" required>
          <select
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className={inputClass()}
          >
            {deptList.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Staff Role" required>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className={inputClass()}
          >
            <option value="DEPARTMENT_HEAD">Department Head</option>
            <option value="LAB_MANAGER">Lab Manager</option>
            <option value="LAB_TECHNICIAN">Lab Technician</option>
          </select>
        </Field>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 text-xs transition-colors shadow-sm flex items-center gap-1.5"
          >
            <UserPlus size={14} /> Send Invitation
          </button>
        </div>
      </form>
    </Modal>
  );
}

function SummaryCard({ icon: Icon, label, value, subtext, tone, bg }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col justify-between">
      <div>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg} ${tone} mb-2.5`}>
          <Icon size={17} />
        </span>
        <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</p>
        <p className="text-xs font-bold text-slate-700 mt-0.5">{label}</p>
      </div>
      {subtext && <p className="text-[11px] text-slate-400 mt-2 font-medium">{subtext}</p>}
    </div>
  );
}

function RoleBadge({ role, compact }) {
  const label = formatRoleName(role);
  const style = ROLE_STYLE[role] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold uppercase tracking-wider ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"
      } ${style}`}
    >
      {label}
    </span>
  );
}
