import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Wrench, CircleCheckBig, Clock, UserCheck, XCircle, Edit3, UserMinus, Eye, Check, X, AlertTriangle, RefreshCw,
  Search, Filter, Building2, Calendar, ShieldAlert, FileText, CheckCircle2, Package, MapPin, User
} from "lucide-react";
import { Modal, Field, inputClass, StatusBadge, ViewHeader, EmptyState } from "./ui.jsx";
import { maintenanceApi } from "../../api/maintenanceApi.js";
import { equipmentApi } from "../../api/equipmentApi.js";

export default function MaintenanceOversightView({ user, toast, departmentId, role }) {
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalMode, setModalMode] = useState(null);

  const [departmentLabs, setDepartmentLabs] = useState([]);
  const [loadingLabs, setLoadingLabs] = useState(true);
  const [labsFetchError, setLabsFetchError] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [labFilter, setLabFilter] = useState("ALL");
  const [techFilter, setTechFilter] = useState("ALL");

  const isDeptHead = role === "department-head" ||
    user?.roles?.includes("DEPARTMENT_HEAD") ||
    user?.roles?.includes("ROLE_DEPARTMENT_HEAD");

  const loadLaboratories = useCallback(async () => {
    try {
      setLoadingLabs(true);
      setLabsFetchError(false);
      const labs = await equipmentApi.getLaboratories();
      setDepartmentLabs(Array.isArray(labs) ? labs : []);
      setLoadingLabs(false);
    } catch (err) {
      console.warn("Error fetching department laboratories:", err);
      setDepartmentLabs([]);
      setLabsFetchError(true);
      setLoadingLabs(false);
    }
  }, []);

  const loadData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      setFetchError(false);
      const data = await maintenanceApi.getDepartmentWorkOrders();
      let list = data || [];
      if (departmentId) {
        list = list.filter((m) => m.departmentId === Number(departmentId) || String(m.departmentId) === String(departmentId));
      }
      setMaintenance(list);
      setLoading(false);
    } catch (err) {
      console.warn("Error fetching maintenance work orders:", err);
      setMaintenance([]);
      setFetchError(true);
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    let isMounted = true;
    loadData(true);
    loadLaboratories();
    return () => {
      isMounted = false;
    };
  }, [loadData, loadLaboratories]);

  const handleAssign = async (maintenanceId, payload) => {
    try {
      await maintenanceApi.assignTechnician(maintenanceId, payload);
      toast(`Technician assigned to work order MR-${maintenanceId}.`, "success");
      setModalMode(null);
      setSelectedTask(null);
      loadData();
    } catch (err) {
      toast(err.message || "Failed to assign technician.", "error");
    }
  };

  const handleRemoveAssignment = async (maintenanceId, reason) => {
    if (!reason || !reason.trim()) {
      toast("A removal reason is required.", "error");
      return;
    }
    try {
      await maintenanceApi.removeAssignment(maintenanceId, reason.trim());
      toast(`Assignment removed for MR-${maintenanceId}. Task reset to OPEN.`, "success");
      setModalMode(null);
      setSelectedTask(null);
      loadData();
    } catch (err) {
      toast(err.message || "Failed to remove assignment.", "error");
    }
  };

  const handleReassign = async (maintenanceId, payload) => {
    try {
      await maintenanceApi.reassignTechnician(maintenanceId, payload);
      toast(`Technician reassigned for MR-${maintenanceId}.`, "success");
      setModalMode(null);
      setSelectedTask(null);
      loadData();
    } catch (err) {
      toast(err.message || "Failed to reassign technician.", "error");
    }
  };

  const handleCancelTask = async (maintenanceId, reason) => {
    if (!reason || !reason.trim()) {
      toast("A cancellation reason is required.", "error");
      return;
    }
    try {
      await maintenanceApi.managerCancel(maintenanceId, reason.trim());
      toast(`Maintenance task MR-${maintenanceId} cancelled successfully.`, "success");
      setModalMode(null);
      setSelectedTask(null);
      loadData();
    } catch (err) {
      toast(err.message || "Failed to cancel maintenance task.", "error");
    }
  };

  const handleEditSave = async (maintenanceId, editData) => {
    try {
      await maintenanceApi.editMaintenance(maintenanceId, editData);
      toast(`Maintenance task MR-${maintenanceId} updated successfully.`, "success");
      setModalMode(null);
      setSelectedTask(null);
      loadData();
    } catch (err) {
      toast(err.message || "Failed to update maintenance task.", "error");
    }
  };

  const handleFinalizeSchedule = async (maintenanceId, finalData) => {
    try {
      await maintenanceApi.finalizeSchedule(maintenanceId, finalData);
      toast(`Repair schedule finalized for MR-${maintenanceId}.`, "success");
      setModalMode(null);
      setSelectedTask(null);
      loadData();
    } catch (err) {
      toast(err.message || "Failed to finalize schedule.", "error");
    }
  };

  const handleAcceptProposal = async (maintenanceId, managerNotes = "") => {
    try {
      await maintenanceApi.acceptTechnicianProposal(maintenanceId, { managerNotes });
      toast(`Technician proposal accepted for MR-${maintenanceId}.`, "success");
      setModalMode(null);
      setSelectedTask(null);
      loadData();
    } catch (err) {
      toast(err.message || "Failed to accept technician proposal.", "error");
    }
  };

  const handleVerifyWork = async (maintenanceId, verifyData) => {
    try {
      await maintenanceApi.verifyWork(maintenanceId, verifyData);
      toast(
        verifyData.approved
          ? `Maintenance work verified and approved for MR-${maintenanceId}. Equipment status set to ${verifyData.equipmentStatus}.`
          : `Maintenance completion report rejected for MR-${maintenanceId}.`,
        verifyData.approved ? "success" : "info"
      );
      setModalMode(null);
      setSelectedTask(null);
      loadData();
    } catch (err) {
      toast(err.message || "Failed to verify maintenance work.", "error");
    }
  };

  const summaryCounts = useMemo(() => {
    return {
      OPEN: maintenance.filter((m) => m.status === "OPEN" || m.status === "ASSIGNED").length,
      IN_PROGRESS: maintenance.filter((m) => m.status === "ACCEPTED" || m.status === "FINALIZED" || m.status === "IN_PROGRESS").length,
      PENDING_VERIFY: maintenance.filter((m) => m.status === "PENDING_VERIFICATION" || m.status === "PENDING_MANAGER_REVIEW").length,
      COMPLETED: maintenance.filter((m) => m.status === "COMPLETED").length,
    };
  }, [maintenance]);

  const counts = useMemo(() => {
    return {
      ALL: maintenance.length,
      ACTION_REQUIRED: maintenance.filter((m) => m.status === "PENDING_MANAGER_REVIEW" || m.status === "PENDING_VERIFICATION" || (!m.assignedTechnicianId && m.status === "OPEN")).length,
      WAITING_TECH: maintenance.filter((m) => m.status === "ASSIGNED").length,
      IN_PROGRESS: maintenance.filter((m) => m.status === "ACCEPTED" || m.status === "FINALIZED" || m.status === "IN_PROGRESS").length,
      COMPLETED: maintenance.filter((m) => m.status === "COMPLETED").length,
      CANCELLED: maintenance.filter((m) => m.status === "CANCELLED").length,
    };
  }, [maintenance]);

  const uniqueLabs = useMemo(() => {
    const set = new Set();
    maintenance.forEach((m) => { if (m.labName) set.add(m.labName); });
    return Array.from(set).sort();
  }, [maintenance]);

  const uniqueTechs = useMemo(() => {
    const set = new Set();
    maintenance.forEach((m) => { if (m.assignedTechnicianName) set.add(m.assignedTechnicianName); });
    return Array.from(set).sort();
  }, [maintenance]);

  const filteredMaintenance = useMemo(() => {
    return maintenance.filter((m) => {
      // 1. Status Filter
      if (statusFilter === "ACTION_REQUIRED") {
        const isAction = m.status === "PENDING_MANAGER_REVIEW" || m.status === "PENDING_VERIFICATION" || (!m.assignedTechnicianId && m.status === "OPEN");
        if (!isAction) return false;
      } else if (statusFilter === "WAITING_TECH") {
        if (m.status !== "ASSIGNED") return false;
      } else if (statusFilter === "IN_PROGRESS") {
        const isInProg = m.status === "ACCEPTED" || m.status === "FINALIZED" || m.status === "IN_PROGRESS";
        if (!isInProg) return false;
      } else if (statusFilter === "COMPLETED") {
        if (m.status !== "COMPLETED") return false;
      } else if (statusFilter === "CANCELLED") {
        if (m.status !== "CANCELLED") return false;
      }

      // 2. Lab Filter
      if (labFilter !== "ALL" && m.labName !== labFilter) return false;

      // 3. Tech Filter
      if (techFilter !== "ALL" && m.assignedTechnicianName !== techFilter) return false;

      // 4. Search Term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const code = (m.maintenanceCode || `MR-${m.maintenanceId}`).toLowerCase();
        const eqName = (m.equipmentName || "").toLowerCase();
        const desc = (m.issueDescription || "").toLowerCase();
        const reqBy = (m.requestedByName || "").toLowerCase();
        const techName = (m.assignedTechnicianName || "").toLowerCase();
        const lab = (m.labName || "").toLowerCase();
        return code.includes(q) || eqName.includes(q) || desc.includes(q) || reqBy.includes(q) || techName.includes(q) || lab.includes(q);
      }

      return true;
    });
  }, [maintenance, statusFilter, labFilter, techFilter, searchTerm]);

  const tabs = [
    { id: "ALL", label: "All Work Orders", count: counts.ALL },
    { id: "ACTION_REQUIRED", label: "Action Required", count: counts.ACTION_REQUIRED, alert: counts.ACTION_REQUIRED > 0 },
    { id: "WAITING_TECH", label: "Waiting for Tech", count: counts.WAITING_TECH },
    { id: "IN_PROGRESS", label: "In Progress / Ready", count: counts.IN_PROGRESS },
    { id: "COMPLETED", label: "Completed", count: counts.COMPLETED },
    { id: "CANCELLED", label: "Cancelled", count: counts.CANCELLED },
  ];

  const pageTitle = isDeptHead ? "Maintenance" : "Maintenance Work Orders";
  const pageSubtitle = isDeptHead
    ? "Department maintenance status, activity and history."
    : "Manage, assign, reassign, schedule, review and verify maintenance work.";

  return (
    <div className="space-y-5">
      <ViewHeader
        title={pageTitle}
        subtitle={pageSubtitle}
        action={
          <button
            onClick={loadData}
            className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        }
      />

      {/* DEPARTMENT HEAD READ-ONLY SUMMARY CARDS */}
      {isDeptHead && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Open Work Orders</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Clock size={16} /></span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-amber-600">{summaryCounts.OPEN}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">In Progress</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Wrench size={16} /></span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-blue-600">{summaryCounts.IN_PROGRESS}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pending Verification</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><UserCheck size={16} /></span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-indigo-600">{summaryCounts.PENDING_VERIFY}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Completed</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><CircleCheckBig size={16} /></span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-emerald-600">{summaryCounts.COMPLETED}</p>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
        {/* Status Chips */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  statusFilter === tab.id
                    ? "bg-slate-800 text-white"
                    : tab.alert
                    ? "bg-red-500 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Inputs & Dropdowns */}
        <div className="grid sm:grid-cols-12 gap-2.5 items-center">
          <div className="sm:col-span-5 relative">
            <Search size={14} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search work order, equipment, issue, or technician..."
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={labFilter}
              onChange={(e) => setLabFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 font-medium"
            >
              {loadingLabs ? (
                <option value="">Loading laboratories...</option>
              ) : labsFetchError ? (
                <option value="">Unable to load laboratories</option>
              ) : departmentLabs.length === 0 ? (
                <option value="">No laboratories found</option>
              ) : (
                <>
                  <option value="ALL">All Laboratories</option>
                  {departmentLabs.map((lab) => {
                    const lName = lab.name || lab.laboratoryName;
                    const lId = lab.laboratoryId || lab.labId || lab.id;
                    return (
                      <option key={lId || lName} value={lName}>{lName}</option>
                    );
                  })}
                </>
              )}
            </select>
          </div>

          {!isDeptHead && (
            <div className="sm:col-span-4">
              <select
                value={techFilter}
                onChange={(e) => setTechFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 font-medium"
              >
                <option value="ALL">All Technicians</option>
                {uniqueTechs.map((tech) => (
                  <option key={tech} value={tech}>{tech}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ERROR STATE */}
      {fetchError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
          <AlertTriangle size={24} className="mx-auto text-red-500" />
          <div>
            <p className="text-sm font-bold text-red-900">Unable to load maintenance work orders.</p>
            <p className="text-xs text-red-600 mt-0.5">Please check server connection and try again.</p>
          </div>
          <button
            onClick={loadData}
            className="rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {/* SKELETON LOADING OR CONTENT */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              <div className="h-3 bg-slate-100 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : filteredMaintenance.length === 0 ? (
        <EmptyState
          icon={CircleCheckBig}
          title="No maintenance work orders found"
          subtitle={statusFilter !== "ALL" || searchTerm || labFilter !== "ALL" ? "Try adjusting your search or filters." : "There are currently no maintenance work orders in your scope."}
        />
      ) : (
        /* WORK ORDER CARDS LIST */
        <div className="space-y-3.5">
          {filteredMaintenance.map((m) => {
            const mId = m.maintenanceId || m.id;
            const mCode = m.maintenanceCode || `MR-${mId}`;
            const isUnassigned = !m.assignedTechnicianId && m.status === "OPEN";
            const isAssigned = m.status === "ASSIGNED";
            const isPendingReview = m.status === "PENDING_MANAGER_REVIEW";
            const isPendingVerify = m.status === "PENDING_VERIFICATION";
            const isFinalizedOrActive = m.status === "ACCEPTED" || m.status === "FINALIZED" || m.status === "IN_PROGRESS";
            const isClosed = m.status === "COMPLETED" || m.status === "CANCELLED";
            const isActionRequired = isPendingReview || isPendingVerify || isUnassigned;

            return (
              <div
                key={mId}
                className={`rounded-2xl border bg-white p-5 transition-all shadow-2xs hover:shadow-xs space-y-4 ${
                  isActionRequired ? "border-amber-200 bg-amber-50/20" : "border-slate-200"
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-blue-600 text-sm">{mCode}</span>
                    <StatusBadge status={m.priority} />
                    {isActionRequired && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                        <Clock size={11} /> Action Required
                      </span>
                    )}
                  </div>
                  <StatusBadge status={m.status} />
                </div>

                {/* Main Content Grid */}
                <div className="grid sm:grid-cols-3 gap-4 text-xs">
                  {/* Col 1: Equipment & Location */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Equipment & Location</p>
                    <p className="font-extrabold text-slate-900 text-sm leading-snug">{m.equipmentName || `Equipment #${m.equipmentId}`}</p>
                    <p className="text-slate-600 font-medium flex items-center gap-1">
                      <Building2 size={12} className="text-slate-400" /> {m.labName || "Main Lab"}
                    </p>
                    {m.location && (
                      <p className="text-slate-500 flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" /> {m.location}
                      </p>
                    )}
                  </div>

                  {/* Col 2: Reported Problem */}
                  <div className="space-y-1 border-slate-100 sm:border-l sm:pl-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Reported Problem & Reporter</p>
                    {m.issueType && <p className="font-bold text-slate-800">{m.issueType}</p>}
                    <p className="text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                      "{m.issueDescription}"
                    </p>
                    <p className="text-[11px] text-slate-500 pt-0.5 flex items-center gap-1">
                      <User size={11} className="text-slate-400" /> Reported by: <strong className="text-slate-700">{m.requestedByName || "Lab Staff"}</strong>
                    </p>
                  </div>

                  {/* Col 3: Technician & Schedule */}
                  <div className="space-y-1 border-slate-100 sm:border-l sm:pl-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Technician & Target Schedule</p>
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <UserCheck size={13} className="text-blue-600" /> {m.assignedTechnicianName || "Not Assigned"}
                    </p>
                    {isPendingReview ? (
                      <p className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                        Technician Proposal Submitted
                      </p>
                    ) : isPendingVerify ? (
                      <p className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block">
                        Work Completion Submitted
                      </p>
                    ) : (
                      <p className="text-slate-600 font-medium">
                        State: <span className="font-bold text-slate-800">{m.status.replace(/_/g, " ")}</span>
                      </p>
                    )}
                    {(m.finalStartDatetime || m.managerTargetStartDatetime || m.scheduledStartDatetime) && (
                      <p className="text-slate-500 font-medium flex items-center gap-1 pt-1">
                        <Calendar size={12} className="text-slate-400" /> Target: {" "}
                        <strong className="text-slate-800">
                          {new Date(m.finalStartDatetime || m.managerTargetStartDatetime || m.scheduledStartDatetime).toLocaleDateString()}
                        </strong>
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 flex-wrap">
                  {/* DEPARTMENT HEAD: Strictly Read-Only (ONLY View Details button) */}
                  {isDeptHead ? (
                    <button
                      onClick={() => { setSelectedTask(m); setModalMode("DETAILS"); }}
                      className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye size={13} /> View Details
                    </button>
                  ) : (
                    /* LAB MANAGER: Full Operational Actions */
                    <>
                      {isUnassigned && (
                        <button
                          onClick={() => { setSelectedTask(m); setModalMode("ASSIGN"); }}
                          className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <UserCheck size={13} /> Assign Technician
                        </button>
                      )}

                      {isPendingReview && (
                        <>
                          <button
                            onClick={() => handleAcceptProposal(mId)}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Check size={13} /> Accept Proposal
                          </button>
                          <button
                            onClick={() => { setSelectedTask(m); setModalMode("FINALIZE"); }}
                            className="rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3 py-2 transition-colors border border-blue-200 flex items-center gap-1 cursor-pointer"
                          >
                            <Clock size={13} /> Review Schedule
                          </button>
                        </>
                      )}

                      {isPendingVerify && (
                        <button
                          onClick={() => { setSelectedTask(m); setModalMode("VERIFY"); }}
                          className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Check size={13} /> Verify Completion
                        </button>
                      )}

                      <button
                        onClick={() => { setSelectedTask(m); setModalMode("DETAILS"); }}
                        className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={13} /> View Details
                      </button>

                      {!isClosed && (
                        <button
                          onClick={() => { setSelectedTask(m); setModalMode("EDIT"); }}
                          className="rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold px-3 py-2 transition-colors border border-slate-200 flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                      )}

                      {m.assignedTechnicianId && !isClosed && (
                        <>
                          <button
                            onClick={() => { setSelectedTask(m); setModalMode("REMOVE"); }}
                            className="rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold px-3 py-2 transition-colors border border-amber-200 flex items-center gap-1 cursor-pointer"
                          >
                            <UserMinus size={13} /> Remove Assignment
                          </button>
                          <button
                            onClick={() => { setSelectedTask(m); setModalMode("REASSIGN"); }}
                            className="rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold px-3 py-2 transition-colors border border-purple-200 flex items-center gap-1 cursor-pointer"
                          >
                            <UserCheck size={13} /> Reassign
                          </button>
                        </>
                      )}

                      {!isClosed && (
                        <button
                          onClick={() => { setSelectedTask(m); setModalMode("CANCEL"); }}
                          className="rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-2 transition-colors border border-red-200 flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle size={13} /> Cancel Task
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODALS */}
      {selectedTask && modalMode === "DETAILS" && (
        <DetailsModal task={selectedTask} onClose={() => setSelectedTask(null)} isDeptHead={isDeptHead} />
      )}

      {selectedTask && modalMode === "EDIT" && !isDeptHead && (
        <EditModal task={selectedTask} onClose={() => setSelectedTask(null)} onSave={(data) => handleEditSave(selectedTask.maintenanceId || selectedTask.id, data)} />
      )}

      {selectedTask && modalMode === "CANCEL" && !isDeptHead && (
        <CancelModal task={selectedTask} onClose={() => setSelectedTask(null)} onConfirm={(reason) => handleCancelTask(selectedTask.maintenanceId || selectedTask.id, reason)} />
      )}

      {selectedTask && modalMode === "FINALIZE" && !isDeptHead && (
        <FinalizeScheduleModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onAcceptProposal={(notes) => handleAcceptProposal(selectedTask.maintenanceId || selectedTask.id, notes)}
          onConfirm={(data) => handleFinalizeSchedule(selectedTask.maintenanceId || selectedTask.id, data)}
        />
      )}

      {selectedTask && modalMode === "VERIFY" && !isDeptHead && (
        <VerifyCompletionModal task={selectedTask} onClose={() => setSelectedTask(null)} onConfirm={(data) => handleVerifyWork(selectedTask.maintenanceId || selectedTask.id, data)} />
      )}

      {selectedTask && modalMode === "ASSIGN" && !isDeptHead && (
        <AssignModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onConfirm={(payload) => handleAssign(selectedTask.maintenanceId || selectedTask.id, payload)}
        />
      )}

      {selectedTask && modalMode === "REMOVE" && !isDeptHead && (
        <RemoveAssignmentModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onConfirm={(reason) => handleRemoveAssignment(selectedTask.maintenanceId || selectedTask.id, reason)}
        />
      )}

      {selectedTask && modalMode === "REASSIGN" && !isDeptHead && (
        <ReassignModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onConfirm={(payload) => handleReassign(selectedTask.maintenanceId || selectedTask.id, payload)}
        />
      )}
    </div>
  );
}

function DetailsModal({ task, onClose, isDeptHead }) {
  const mCode = task.maintenanceCode || `MR-${task.maintenanceId || task.id}`;
  const isAccepted = task.technicianResponse === "ACCEPTED" || task.status === "ACCEPTED";
  const isDelayRequested = task.technicianResponse === "DELAY_REQUESTED" || task.status === "PENDING_MANAGER_REVIEW";

  // Timeline Step calculation
  const timelineSteps = [
    { title: "Request Created", done: true, subtitle: task.createdAt ? new Date(task.createdAt).toLocaleString() : null },
    { title: "Technician Assigned", done: Boolean(task.assignedTechnicianId), subtitle: task.assignedAt ? new Date(task.assignedAt).toLocaleString() : task.assignedTechnicianName },
    { title: "Technician Responded", done: Boolean(isAccepted || isDelayRequested || task.proposedStartDatetime), subtitle: task.delayReason ? "Proposal Submitted" : isAccepted ? "Accepted" : null },
    { title: "Schedule Finalized", done: Boolean(task.finalStartDatetime || isAccepted || task.status === "FINALIZED" || task.status === "IN_PROGRESS"), subtitle: task.finalStartDatetime ? new Date(task.finalStartDatetime).toLocaleDateString() : null },
    { title: "Work Started", done: Boolean(task.status === "IN_PROGRESS" || task.status === "PENDING_VERIFICATION" || task.status === "COMPLETED"), subtitle: task.workStartedAt ? new Date(task.workStartedAt).toLocaleString() : null },
    { title: "Completion Submitted", done: Boolean(task.status === "PENDING_VERIFICATION" || task.status === "COMPLETED"), subtitle: task.workCompletedAt ? new Date(task.workCompletedAt).toLocaleString() : null },
    { title: "Manager Verification", done: Boolean(task.status === "COMPLETED"), subtitle: task.verifiedAt ? new Date(task.verifiedAt).toLocaleString() : null },
  ];

  return (
    <Modal title="Work Order Details & Timeline" subtitle={mCode} onClose={onClose} wide>
      <div className="space-y-4 text-xs text-slate-700 max-h-[75vh] overflow-y-auto pr-1">
        {/* VISUAL TIMELINE */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide border-b border-slate-200 pb-1.5">Maintenance Timeline</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
            {timelineSteps.map((s, idx) => (
              <div key={idx} className="text-center space-y-1">
                <div className={`mx-auto h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  s.done ? "bg-emerald-600 text-white shadow-2xs" : "bg-slate-200 text-slate-500"
                }`}>
                  {s.done ? "✓" : idx + 1}
                </div>
                <p className="font-bold text-[10px] text-slate-800 leading-tight">{s.title}</p>
                {s.subtitle && <p className="text-[9px] text-slate-500 truncate">{s.subtitle}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* 1. ISSUE SECTION */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide border-b border-slate-100 pb-1.5">1. Work Order & Issue Details</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-slate-400">Equipment:</span> <p className="font-bold text-slate-900">{task.equipmentName}</p></div>
            <div><span className="text-slate-400">Issue Category:</span> <p className="font-semibold text-slate-800">{task.issueType || "General Fault"}</p></div>
            <div><span className="text-slate-400">Laboratory:</span> <p className="font-medium text-slate-800">{task.labName || "—"}</p></div>
            <div><span className="text-slate-400">Department:</span> <p className="font-medium text-slate-800">{task.departmentName || "—"}</p></div>
            <div><span className="text-slate-400">Reported By:</span> <p className="font-semibold text-slate-900">{task.requestedByName || "NOT RECORDED"}</p></div>
            <div><span className="text-slate-400">Reported At:</span> <p className="font-medium text-slate-700">{task.createdAt ? new Date(task.createdAt).toLocaleString() : "—"}</p></div>
            <div><span className="text-slate-400">Priority:</span> <div className="mt-0.5"><StatusBadge status={task.priority} /></div></div>
            <div><span className="text-slate-400">Status:</span> <div className="mt-0.5"><StatusBadge status={task.status} /></div></div>
          </div>
          <div className="pt-2">
            <span className="text-xs text-slate-400">Description:</span>
            <p className="mt-1 text-xs text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">{task.issueDescription}</p>
          </div>
        </div>

        {/* 2. ASSIGNMENT SECTION */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 space-y-2">
          <p className="text-xs font-bold text-blue-900 uppercase tracking-wide border-b border-blue-200/60 pb-1.5">2. Technician Assignment</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-slate-500">Assigned Technician:</span> <p className="font-bold text-slate-900">{task.assignedTechnicianName || "NOT ASSIGNED"}</p></div>
            <div><span className="text-slate-500">Assigned By:</span> <p className="font-semibold text-slate-900">{task.assignedByName || "NOT ASSIGNED"}</p></div>
            <div><span className="text-slate-500">Assigned At:</span> <p className="font-medium text-slate-700">{task.assignedAt ? new Date(task.assignedAt).toLocaleString() : "—"}</p></div>
          </div>
          {task.problemDescription && (
            <div className="pt-2">
              <span className="text-xs font-bold text-blue-900">Manager Problem / Repair Scope:</span>
              <p className="mt-1 text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-blue-200">{task.problemDescription}</p>
            </div>
          )}
        </div>

        {/* 3. MANAGER TARGET SECTION */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-4 space-y-2">
          <p className="text-xs font-bold text-indigo-900 uppercase tracking-wide border-b border-indigo-200/60 pb-1.5">3. Manager Target Schedule</p>
          {task.managerTargetStartDatetime ? (
            <div className="space-y-1 text-xs text-indigo-950">
              <p><span className="font-semibold text-slate-500">Start:</span> {new Date(task.managerTargetStartDatetime).toLocaleString()}</p>
              <p><span className="font-semibold text-slate-500">Target Completion:</span> {new Date(task.managerTargetEndDatetime).toLocaleString()}</p>
              {task.managerInstructions && <p className="text-indigo-800 italic mt-1 bg-white/80 p-2 rounded border border-indigo-100 font-normal">"{task.managerInstructions}"</p>}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Target schedule not recorded</p>
          )}
        </div>

        {/* 4. TECHNICIAN RESPONSE SECTION */}
        <div className={`rounded-xl border p-4 space-y-2 ${isAccepted ? "border-emerald-200 bg-emerald-50/30" : isDelayRequested ? "border-amber-200 bg-amber-50/30" : "border-slate-200 bg-slate-50"}`}>
          <p className="text-xs font-bold uppercase tracking-wide border-b pb-1.5 border-slate-200">4. Technician Response & Proposal</p>
          {isAccepted ? (
            <div className="space-y-1 text-xs text-emerald-950">
              <p><span className="font-semibold text-slate-500">Response:</span> <span className="font-bold text-emerald-700">ACCEPTED</span></p>
              <p><span className="font-semibold text-slate-500">Accepted At:</span> {task.technicianAcceptedAt ? new Date(task.technicianAcceptedAt).toLocaleString() : "—"}</p>
            </div>
          ) : isDelayRequested || task.proposedStartDatetime ? (
            <div className="space-y-1 text-xs text-amber-950">
              <p><span className="font-semibold text-slate-500">Response:</span> <span className="font-bold text-amber-700">REPAIR PLAN SUBMITTED</span></p>
              <p><span className="font-semibold text-slate-500">Proposed Start:</span> {task.proposedStartDatetime ? new Date(task.proposedStartDatetime).toLocaleString() : "—"}</p>
              <p><span className="font-semibold text-slate-500">Proposed End:</span> {task.proposedEndDatetime ? new Date(task.proposedEndDatetime).toLocaleString() : "—"}</p>
              <p><span className="font-semibold text-slate-500">Delay Justification:</span> {task.delayReason || "—"}</p>
              {task.requiresParts && (
                <p><span className="font-semibold text-slate-500">Spare Parts Required:</span> <span className="text-purple-700 font-bold">{task.partsDetails || "Yes"}</span></p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No proposal submitted yet.</p>
          )}
        </div>

        {/* 5. COMPLETION & EVIDENCE SECTION */}
        {(task.workPerformed || task.diagnosticNotes || task.partsUsed || task.completionAttachmentSecureUrl) && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/20 p-4 space-y-2">
            <p className="text-xs font-bold text-emerald-900 uppercase tracking-wide border-b border-emerald-200/60 pb-1.5">5. Completion & Verification Evidence</p>
            <div className="space-y-2 text-xs">
              {task.diagnosticNotes && <div><span className="text-slate-500 font-medium">Diagnostic Notes:</span><p className="text-slate-800 font-semibold mt-0.5">{task.diagnosticNotes}</p></div>}
              {task.workPerformed && <div><span className="text-slate-500 font-medium">Work Performed:</span><p className="text-slate-800 font-semibold mt-0.5">{task.workPerformed}</p></div>}
              {task.partsUsed && <div><span className="text-slate-500 font-medium">Parts Used:</span><p className="text-slate-800 font-semibold mt-0.5">{task.partsUsed}</p></div>}
              {task.resolutionSummary && <div><span className="text-slate-500 font-medium">Problem Resolution Summary:</span><p className="text-slate-800 italic mt-0.5 bg-white p-2 rounded border border-emerald-100">"{task.resolutionSummary}"</p></div>}
              {task.completionAttachmentSecureUrl && (
                <div className="pt-1">
                  <span className="text-slate-500 font-medium block mb-1">Completion Evidence Photo:</span>
                  <a href={task.completionAttachmentSecureUrl} target="_blank" rel="noreferrer">
                    <img src={task.completionAttachmentSecureUrl} alt="Repair Evidence" className="h-32 w-auto rounded-lg border border-slate-200 shadow-2xs hover:opacity-90 transition-opacity" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function EditModal({ task, onClose, onSave }) {
  const [form, setForm] = useState({
    issueDescription: task.issueDescription || "",
    priority: task.priority || "MEDIUM",
    issueType: task.issueType || "",
    managerNotes: task.managerNotes || ""
  });

  return (
    <Modal title="Edit Maintenance Work Order" subtitle={task.maintenanceCode || `MR-${task.maintenanceId || task.id}`} onClose={onClose}>
      <div className="space-y-4 text-xs">
        <Field label="Issue Description">
          <textarea rows={3} value={form.issueDescription} onChange={(e) => setForm({ ...form, issueDescription: e.target.value })} className={inputClass()} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Priority">
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={inputClass()}>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </Field>
          <Field label="Issue Type / Category">
            <input value={form.issueType} onChange={(e) => setForm({ ...form, issueType: e.target.value })} className={inputClass()} />
          </Field>
        </div>
        <Field label="Manager Directives / Notes">
          <textarea rows={2} value={form.managerNotes} onChange={(e) => setForm({ ...form, managerNotes: e.target.value })} className={inputClass()} placeholder="Add managerial directives…" />
        </Field>
        <button onClick={() => onSave(form)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors cursor-pointer">
          Save Changes
        </button>
      </div>
    </Modal>
  );
}

function CancelModal({ task, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  return (
    <Modal title="Cancel Maintenance Work Order" subtitle={task.maintenanceCode || `MR-${task.maintenanceId || task.id}`} onClose={onClose}>
      <div className="space-y-4 text-xs">
        <div className="p-3 bg-red-50 text-red-800 text-xs rounded-lg flex items-center gap-2 border border-red-200">
          <AlertTriangle size={16} className="shrink-0 text-red-600" />
          Cancelling will halt the maintenance workflow and record your rationale & timestamp in audit log.
        </div>
        <Field label="Cancellation Reason" required error={error}>
          <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Provide explicit business rationale for cancelling…" className={inputClass(error)} />
        </Field>
        <button onClick={() => (reason.trim() ? onConfirm(reason) : setError("Cancellation reason is required."))} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition-colors cursor-pointer">
          Confirm Cancellation
        </button>
      </div>
    </Modal>
  );
}

function FinalizeScheduleModal({ task, onClose, onAcceptProposal, onConfirm }) {
  const formatForInput = (iso) => (iso ? String(iso).slice(0, 16) : "");
  const [finalStart, setFinalStart] = useState(formatForInput(task.proposedStartDatetime) || "");
  const [finalEnd, setFinalEnd] = useState(formatForInput(task.proposedEndDatetime) || "");
  const [managerNotes, setManagerNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ finalStartDateTime: finalStart, finalEndDateTime: finalEnd, managerNotes });
  };

  return (
    <Modal title="Review & Finalize Schedule" subtitle={task.maintenanceCode || `MR-${task.maintenanceId || task.id}`} onClose={onClose} footer={<div />}>
      <div className="space-y-4 text-xs">
        {task.delayReason && (
          <div className="p-3 bg-amber-50 text-amber-900 text-xs rounded-lg border border-amber-200">
            <span className="font-bold">Technician Justification:</span> {task.delayReason}
          </div>
        )}
        {onAcceptProposal && (
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
            <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <Check size={15} className="text-emerald-600" /> 1-Click Accept Technician Proposed Dates
            </div>
            <button type="button" onClick={() => onAcceptProposal(managerNotes)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer">
              <Check size={14} /> Accept Technician Proposal
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-700">Or Override with Custom Dates:</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Final Scheduled Start"><input type="datetime-local" value={finalStart} onChange={(e) => setFinalStart(e.target.value)} className={inputClass()} /></Field>
            <Field label="Final Scheduled End"><input type="datetime-local" value={finalEnd} onChange={(e) => setFinalEnd(e.target.value)} className={inputClass()} /></Field>
          </div>
          <Field label="Manager Directives / Notes">
            <textarea rows={2} value={managerNotes} onChange={(e) => setManagerNotes(e.target.value)} placeholder="Directive notes for technician…" className={inputClass()} />
          </Field>
          <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer text-xs">
            Finalize Custom Schedule
          </button>
        </form>
      </div>
    </Modal>
  );
}

function VerifyCompletionModal({ task, onClose, onConfirm }) {
  const [approved, setApproved] = useState(true);
  const [equipmentStatus, setEquipmentStatus] = useState("AVAILABLE");
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [managerNotes, setManagerNotes] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!approved && !rejectionReason.trim()) {
      setError("A rejection reason is mandatory when rejecting completion.");
      return;
    }
    if (approved && equipmentStatus === "AVAILABLE" && !resolutionSummary.trim() && !managerNotes.trim()) {
      setError("A Problem Resolution Summary is mandatory when returning equipment to AVAILABLE.");
      return;
    }
    onConfirm({
      approved,
      equipmentStatus: approved ? equipmentStatus : "UNDER_MAINTENANCE",
      resolutionSummary: approved && equipmentStatus === "AVAILABLE" ? (resolutionSummary.trim() || managerNotes.trim()) : null,
      rejectionReason: !approved ? rejectionReason.trim() : null,
      managerNotes: managerNotes.trim() || null,
    });
  };

  return (
    <Modal title="Verify Maintenance Completion" subtitle={task.maintenanceCode || `MR-${task.maintenanceId || task.id}`} onClose={onClose} footer={<div />}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
          <p className="font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-1">Technician Completion Report</p>
          <p><span className="text-slate-500 font-medium">Equipment:</span> <strong>{task.equipmentName}</strong></p>
          <p><span className="text-slate-500 font-medium">Technician:</span> <strong>{task.assignedTechnicianName || "Lab Technician"}</strong></p>
          {task.workPerformed && <div><span className="text-slate-500 font-medium">Work Performed:</span><p className="text-slate-800 font-semibold mt-0.5">{task.workPerformed}</p></div>}
        </div>
        {error && <div className="rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-red-800 font-semibold">{error}</div>}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">Verification Decision</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => { setApproved(true); setError(""); }} className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${approved ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs" : "border-slate-200 bg-white text-slate-600"}`}>
              <Check size={15} /> Approve & Restore
            </button>
            <button type="button" onClick={() => { setApproved(false); setError(""); }} className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${!approved ? "border-red-500 bg-red-50 text-red-800 shadow-2xs" : "border-slate-200 bg-white text-slate-600"}`}>
              <X size={15} /> Require Rework
            </button>
          </div>
        </div>
        {approved ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Post-Maintenance Equipment Status</label>
              <select value={equipmentStatus} onChange={(e) => setEquipmentStatus(e.target.value)} className={inputClass()}>
                <option value="AVAILABLE">AVAILABLE (Return to Active Service)</option>
                <option value="OUT_OF_SERVICE">OUT_OF_SERVICE (Decommission / Outside Specialist)</option>
              </select>
            </div>
            {equipmentStatus === "AVAILABLE" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Problem Resolution Summary <span className="text-red-500">*</span></label>
                <textarea rows={2} required value={resolutionSummary} onChange={(e) => { setResolutionSummary(e.target.value); setError(""); }} placeholder="Detail how the problem was rectified..." className={inputClass(Boolean(error && !resolutionSummary))} />
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-red-800 mb-1">Mandatory Rejection Rationale <span className="text-red-500">*</span></label>
            <textarea rows={2} required value={rejectionReason} onChange={(e) => { setRejectionReason(e.target.value); setError(""); }} placeholder="State why completion was rejected…" className={inputClass(Boolean(error && !rejectionReason))} />
          </div>
        )}
        <button type="submit" className={`w-full font-bold py-2.5 rounded-lg text-white transition-colors cursor-pointer ${approved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}>
          {approved ? "Confirm Approval & Return Equipment" : "Confirm Rejection & Request Rework"}
        </button>
      </form>
    </Modal>
  );
}

function AssignModal({ task, onClose, onConfirm }) {
  const [technicians, setTechnicians] = useState([]);
  const [loadingTechs, setLoadingTechs] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [techId, setTechId] = useState("");
  const [targetStart, setTargetStart] = useState("");
  const [targetEnd, setTargetEnd] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState("");

  const fetchTechnicians = useCallback(() => {
    let active = true;
    setLoadingTechs(true);
    setFetchError(false);
    maintenanceApi.getEligibleTechnicians(task.maintenanceId || task.id)
      .then((data) => {
        if (active) {
          setTechnicians(data || []);
          setLoadingTechs(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.warn("Failed to load eligible technicians:", err);
          setTechnicians([]);
          setFetchError(true);
          setLoadingTechs(false);
        }
      });
    return () => { active = false; };
  }, [task.maintenanceId, task.id]);

  useEffect(() => {
    const cancel = fetchTechnicians();
    return cancel;
  }, [fetchTechnicians]);

  const isFormValid = Boolean(techId && targetStart && targetEnd && problemDescription && problemDescription.trim());

  const handleSubmit = () => {
    if (!techId) { setError("Technician selection is required."); return; }
    if (!targetStart || !targetEnd) { setError("Target start and end datetimes are required."); return; }
    if (!problemDescription || !problemDescription.trim()) { setError("Problem / repair description is required."); return; }
    onConfirm({
      technicianId: Number(techId),
      targetStartDateTime: targetStart,
      targetEndDateTime: targetEnd,
      problemDescription: problemDescription.trim(),
      managerInstructions: instructions.trim()
    });
  };

  return (
    <Modal title="Assign Technician" subtitle={task.maintenanceCode || `MR-${task.maintenanceId || task.id}`} onClose={onClose} footer={<div />}>
      <div className="space-y-4 text-xs">
        {error && <div className="p-3 bg-red-50 text-red-800 text-xs rounded-lg border border-red-200">{error}</div>}
        {fetchError && (
          <div className="p-3 bg-red-50 text-red-800 text-xs rounded-lg border border-red-200 flex items-center justify-between">
            <span>Unable to load technicians.</span>
            <button type="button" onClick={fetchTechnicians} className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs transition-colors cursor-pointer">Retry</button>
          </div>
        )}
        <Field label="Select Technician" required>
          <select value={techId} onChange={(e) => setTechId(e.target.value)} className={inputClass()}>
            {loadingTechs ? (
              <option value="">Loading technicians...</option>
            ) : fetchError ? (
              <option value="">Unable to load technicians.</option>
            ) : technicians.length === 0 ? (
              <option value="">No active technicians available</option>
            ) : (
              <>
                <option value="">Select Technician</option>
                {technicians.map((t) => {
                  const id = t.technicianId ?? t.userId;
                  const name = t.fullName || (t.firstName && t.lastName ? `${t.firstName} ${t.lastName}` : t.email || `Technician #${id}`);
                  const workload = t.activeWorkload ?? 0;
                  return (
                    <option key={id} value={id}>{name} ({workload} active workload)</option>
                  );
                })}
              </>
            )}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Manager Target Start" required><input type="datetime-local" value={targetStart} onChange={(e) => setTargetStart(e.target.value)} className={inputClass()} /></Field>
          <Field label="Manager Target End" required><input type="datetime-local" value={targetEnd} onChange={(e) => setTargetEnd(e.target.value)} className={inputClass()} /></Field>
        </div>
        <Field label="Problem / Repair Description" required>
          <textarea rows={3} value={problemDescription} onChange={(e) => setProblemDescription(e.target.value)} placeholder="Describe the equipment problem that needs to be repaired..." className={inputClass()} />
        </Field>
        <Field label="Manager Instructions">
          <textarea rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Provide target instructions for technician…" className={inputClass()} />
        </Field>
        <button disabled={!isFormValid} onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg transition-colors cursor-pointer">
          Confirm Assignment
        </button>
      </div>
    </Modal>
  );
}

function RemoveAssignmentModal({ task, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  return (
    <Modal title="Remove Assignment" subtitle={task.maintenanceCode || `MR-${task.maintenanceId || task.id}`} onClose={onClose}>
      <div className="space-y-4 text-xs">
        <div className="p-3 bg-amber-50 text-amber-900 text-xs rounded-lg border border-amber-200">
          Removing assignment will reset the task to OPEN and record your removal reason in audit history.
        </div>
        <Field label="Removal Reason" required error={error}>
          <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Provide reason for removing assignment…" className={inputClass(error)} />
        </Field>
        <button onClick={() => (reason.trim() ? onConfirm(reason) : setError("Removal reason is required."))} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-lg transition-colors cursor-pointer">
          Remove Assignment
        </button>
      </div>
    </Modal>
  );
}

function ReassignModal({ task, onClose, onConfirm }) {
  const [technicians, setTechnicians] = useState([]);
  const [loadingTechs, setLoadingTechs] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [newTechId, setNewTechId] = useState("");
  const [targetStart, setTargetStart] = useState("");
  const [targetEnd, setTargetEnd] = useState("");
  const [instructions, setInstructions] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const fetchTechnicians = useCallback(() => {
    let active = true;
    setLoadingTechs(true);
    setFetchError(false);
    maintenanceApi.getEligibleTechnicians(task.maintenanceId || task.id)
      .then((data) => {
        if (active) {
          setTechnicians(data || []);
          setLoadingTechs(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.warn("Failed to load eligible technicians:", err);
          setTechnicians([]);
          setFetchError(true);
          setLoadingTechs(false);
        }
      });
    return () => { active = false; };
  }, [task.maintenanceId, task.id]);

  useEffect(() => {
    const cancel = fetchTechnicians();
    return cancel;
  }, [fetchTechnicians]);

  const handleSubmit = () => {
    if (!newTechId) { setError("New technician selection is required."); return; }
    if (!reason.trim()) { setError("Reassignment reason is required."); return; }
    onConfirm({
      newTechnicianId: Number(newTechId),
      targetStartDateTime: targetStart || null,
      targetEndDateTime: targetEnd || null,
      managerInstructions: instructions.trim() || null,
      reason: reason.trim()
    });
  };

  return (
    <Modal title="Reassign Technician" subtitle={task.maintenanceCode || `MR-${task.maintenanceId || task.id}`} onClose={onClose}>
      <div className="space-y-4 text-xs">
        {error && <div className="p-3 bg-red-50 text-red-800 text-xs rounded-lg border border-red-200">{error}</div>}
        {fetchError && (
          <div className="p-3 bg-red-50 text-red-800 text-xs rounded-lg border border-red-200 flex items-center justify-between">
            <span>Unable to load technicians.</span>
            <button type="button" onClick={fetchTechnicians} className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs transition-colors cursor-pointer">Retry</button>
          </div>
        )}
        <Field label="New Technician" required>
          <select value={newTechId} onChange={(e) => setNewTechId(e.target.value)} className={inputClass()}>
            {loadingTechs ? (
              <option value="">Loading technicians...</option>
            ) : fetchError ? (
              <option value="">Unable to load technicians.</option>
            ) : technicians.length === 0 ? (
              <option value="">No active technicians available</option>
            ) : (
              <>
                <option value="">Select Technician</option>
                {technicians.map((t) => {
                  const id = t.technicianId ?? t.userId;
                  const name = t.fullName || (t.firstName && t.lastName ? `${t.firstName} ${t.lastName}` : t.email || `Technician #${id}`);
                  const workload = t.activeWorkload ?? 0;
                  return (
                    <option key={id} value={id}>{name} ({workload} active workload)</option>
                  );
                })}
              </>
            )}
          </select>
        </Field>
        <Field label="Reassignment Reason" required>
          <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for reassigning…" className={inputClass()} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="New Target Start"><input type="datetime-local" value={targetStart} onChange={(e) => setTargetStart(e.target.value)} className={inputClass()} /></Field>
          <Field label="New Target End"><input type="datetime-local" value={targetEnd} onChange={(e) => setTargetEnd(e.target.value)} className={inputClass()} /></Field>
        </div>
        <Field label="Updated Instructions">
          <textarea rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Instructions for new technician…" className={inputClass()} />
        </Field>
        <button onClick={handleSubmit} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-lg transition-colors cursor-pointer">
          Confirm Reassignment
        </button>
      </div>
    </Modal>
  );
}
