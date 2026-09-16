import { useState, useMemo } from "react";
import {
  CalendarClock, ThumbsUp, ThumbsDown, Eye, Search, Filter,
  User, Mail, Phone, GraduationCap, Building2, FlaskConical,
  Clock, ShieldCheck, AlertCircle, FileCheck, CheckCircle2,
  X, ChevronRight, Hash, DollarSign, Sparkles, RefreshCw
} from "lucide-react";
import { ViewHeader } from "../../common/ViewHeader.jsx";
import { EmptyState } from "../../common/EmptyState.jsx";
import { StatusBadge } from "../../common/StatusBadge.jsx";
import { Modal } from "../../common/Modal.jsx";
import { Field, inputClass } from "../../common/Field.jsx";
import { formatDateTime } from "../../../utils/formatters.js";

/* ================================================================== */
/*  Manager -> Booking Approvals with Real End-to-End Dynamic Workflow */
/* ================================================================== */
export default function BookingApprovals({
  bookings = [],
  equipmentById = {},
  onApprove,
  onReject,
  onRefresh,
  loading = false,
}) {
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [detailsTarget, setDetailsTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const pending = useMemo(
    () => bookings.filter((b) => b.status === "PENDING_APPROVAL"),
    [bookings]
  );
  const approved = useMemo(
    () => bookings.filter((b) => b.status === "CONFIRMED"),
    [bookings]
  );
  const rejected = useMemo(
    () => bookings.filter((b) => b.status === "REJECTED"),
    [bookings]
  );

  const tabs = [
    { id: "pending", label: `Pending Requests (${pending.length})` },
    { id: "approved", label: `Approved (${approved.length})` },
    { id: "rejected", label: `Rejected (${rejected.length})` },
  ];

  const currentList = tab === "pending" ? pending : tab === "approved" ? approved : rejected;

  const filteredList = useMemo(() => {
    if (!search.trim()) return currentList;
    const q = search.toLowerCase();
    return currentList.filter((b) => {
      const bId = String(b.bookingId || b.id || "");
      const eqName = (b.equipment?.name || b.equipmentName || equipmentById[b.equipmentId]?.name || "").toLowerCase();
      const applicantName = (b.applicant?.fullName || b.researcher || "").toLowerCase();
      const email = (b.applicant?.email || "").toLowerCase();
      const purpose = (b.booking?.purpose || b.purpose || "").toLowerCase();
      return (
        bId.includes(q) ||
        eqName.includes(q) ||
        applicantName.includes(q) ||
        email.includes(q) ||
        purpose.includes(q)
      );
    });
  }, [currentList, search, equipmentById]);

  const handleApproveClick = async (bookingId) => {
    setActionLoadingId(bookingId);
    try {
      await onApprove(bookingId);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmReject = async (reason) => {
    if (!rejectTarget) return;
    const bId = rejectTarget.bookingId || rejectTarget.id;
    setActionLoadingId(bId);
    try {
      await onReject(bId, reason);
      setRejectTarget(null);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <ViewHeader
          title="Booking Approvals"
          subtitle="Review, audit, and authorize equipment reservation requests for your department."
        />
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-sm transition-colors"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-blue-600" : ""} />
            Refresh
          </button>
        )}
      </div>

      {/* Navigation Tabs and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1.5 w-fit border border-slate-200/80">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                tab === t.id
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px] max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, equipment, applicant, or purpose…"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="py-20 text-center text-sm font-medium text-slate-500">
          Loading booking requests…
        </div>
      ) : filteredList.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title={search ? "No matching booking requests" : `No ${tab} booking requests`}
          subtitle={
            search
              ? "Try adjusting your search terms or clearing the filter."
              : tab === "pending"
              ? "All incoming requests have been reviewed and approved or rejected."
              : `There are currently no ${tab} bookings recorded for your department.`
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredList.map((b) => {
            const bookingId = b.bookingId || b.id;
            const eqName =
              b.equipment?.name ||
              b.equipmentName ||
              equipmentById[b.equipmentId]?.name ||
              "Laboratory Equipment";
            const assetId =
              b.equipment?.assetId ||
              equipmentById[b.equipmentId]?.serialNumber ||
              `#${b.equipmentId || b.equipment?.equipmentId}`;
            const lab =
              b.equipment?.laboratory ||
              equipmentById[b.equipmentId]?.location ||
              "Department Laboratory";
            const startDt = b.booking?.startTime || b.startTime;
            const endDt = b.booking?.endTime || b.endTime;
            const applicant = b.applicant || {};
            const applicantName =
              applicant.fullName || b.researcher || "Student / Researcher";
            const purpose = b.booking?.purpose || b.purpose;
            const cost =
              b.booking?.estimatedCost != null
                ? b.booking.estimatedCost
                : b.estimatedCost;
            const isRecurring =
              b.booking?.isRecurring != null ? b.booking.isRecurring : b.isRecurring;
            const isProcessing = actionLoadingId === bookingId;

            return (
              <div
                key={bookingId}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-start sm:items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-slate-900">{eqName}</span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{bookingId}
                      </span>
                    </div>
                    <StatusBadge status={b.status} />
                    {isRecurring && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        Recurring
                      </span>
                    )}
                    {(b.agreement?.accepted || b.agreementAccepted) && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        ✓ Agreement v{b.agreement?.version || b.agreementVersion || "2026.1"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    {cost != null && (
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 mr-1.5">Est. Cost:</span>
                        <span className="font-extrabold text-slate-900">
                          {Number(cost) > 0 ? `₹${Number(cost).toFixed(2)}` : "Free"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                  {/* Applicant Details */}
                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <User size={11} className="text-slate-500" /> Applicant
                    </p>
                    <p className="font-bold text-slate-900 truncate">{applicantName}</p>
                    {applicant.email && (
                      <p className="text-slate-500 truncate text-[11px]">{applicant.email}</p>
                    )}
                    {(applicant.rollNumber || applicant.researcherId) && (
                      <p className="text-slate-400 text-[10px] font-mono">
                        ID: {applicant.rollNumber || applicant.researcherId}
                      </p>
                    )}
                  </div>

                  {/* Schedule Details */}
                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock size={11} className="text-slate-500" /> Schedule Window
                    </p>
                    {startDt && endDt ? (
                      <>
                        <p className="font-bold text-slate-800">{formatDateTime(startDt)}</p>
                        <p className="text-slate-500 text-[11px]">until {formatDateTime(endDt)}</p>
                      </>
                    ) : (
                      <p className="text-slate-400">No date provided</p>
                    )}
                  </div>

                  {/* Laboratory / Equipment */}
                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <FlaskConical size={11} className="text-slate-500" /> Laboratory & Asset
                    </p>
                    <p className="font-bold text-slate-800 truncate">{lab}</p>
                    <p className="text-slate-500 text-[10px] font-mono truncate">Asset ID: {assetId}</p>
                  </div>

                  {/* Academic Context */}
                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Building2 size={11} className="text-slate-500" /> Department / Inst.
                    </p>
                    <p className="font-bold text-slate-800 truncate">
                      {applicant.departmentName || b.department || "Department"}
                      {applicant.departmentCode ? ` (${applicant.departmentCode})` : ""}
                    </p>
                    <p className="text-slate-400 text-[10px] truncate">
                      {applicant.institutionName || "Institution"}
                    </p>
                  </div>
                </div>

                {/* Purpose Snippet */}
                {purpose && (
                  <div className="text-xs bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-slate-700">
                    <span className="font-bold text-slate-800">Purpose: </span>
                    <span className="text-slate-600">{purpose}</span>
                  </div>
                )}

                {/* Rejection / Decision Note */}
                {b.status === "REJECTED" && (b.rejection?.reason || b.rejectionReason) && (
                  <div className="text-xs bg-red-50 p-3.5 rounded-xl border border-red-200 text-red-800 space-y-1">
                    <div className="flex items-center justify-between font-bold text-red-900">
                      <span>Rejection Reason:</span>
                      {(b.rejection?.rejectedAt || b.rejectedAt) && (
                        <span className="text-[11px] font-normal text-red-600">
                          {formatDateTime(b.rejection?.rejectedAt || b.rejectedAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-red-700 leading-relaxed">{b.rejection?.reason || b.rejectionReason}</p>
                    {(b.rejection?.rejectedByName || b.rejectedByName) && (
                      <p className="text-[10px] text-red-500 pt-0.5">
                        Rejected by: <strong>{b.rejection?.rejectedByName || b.rejectedByName}</strong>
                      </p>
                    )}
                  </div>
                )}

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                  <span className="text-[11px] text-slate-400">
                    Requested on:{" "}
                    {b.booking?.createdAt || b.createdAt
                      ? new Date(b.booking?.createdAt || b.createdAt).toLocaleDateString()
                      : "Recent"}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* View Details Button */}
                    <button
                      onClick={() => setDetailsTarget(b)}
                      className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2 flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Eye size={13} className="text-slate-500" /> View Details
                    </button>

                    {/* Approve & Reject for Pending */}
                    {b.status === "PENDING_APPROVAL" && (
                      <>
                        <button
                          onClick={() => handleApproveClick(bookingId)}
                          disabled={isProcessing}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold px-4 py-2 flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <ThumbsUp size={13} />
                          {isProcessing ? "Approving…" : "Approve"}
                        </button>
                        <button
                          onClick={() => setRejectTarget(b)}
                          disabled={isProcessing}
                          className="rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-xs font-bold px-4 py-2 flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <ThumbsDown size={13} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── View Details Modal ────────────────────────────────────────── */}
      {detailsTarget && (
        <BookingDetailsModal
          booking={detailsTarget}
          equipmentById={equipmentById}
          onClose={() => setDetailsTarget(null)}
          onApprove={(id) => {
            setDetailsTarget(null);
            handleApproveClick(id);
          }}
          onReject={(b) => {
            setDetailsTarget(null);
            setRejectTarget(b);
          }}
        />
      )}

      {/* ── Reject Modal ─────────────────────────────────────────────── */}
      {rejectTarget && (
        <RejectModal
          booking={rejectTarget}
          equipmentName={
            rejectTarget.equipment?.name ||
            rejectTarget.equipmentName ||
            equipmentById[rejectTarget.equipmentId]?.name ||
            "Equipment"
          }
          onClose={() => setRejectTarget(null)}
          onConfirm={handleConfirmReject}
          loading={actionLoadingId === (rejectTarget.bookingId || rejectTarget.id)}
        />
      )}
    </div>
  );
}

/* ================================================================== */
/*  Modal: Complete 4-Section Booking Request Audit & View Details    */
/* ================================================================== */
export function BookingDetailsModal({
  booking,
  equipmentById = {},
  onClose,
  onApprove,
  onReject,
}) {
  const bookingId = booking.bookingId || booking.id;
  const applicant = booking.applicant || {};
  const equipment = booking.equipment || equipmentById[booking.equipmentId] || {};
  const bk = booking.booking || booking;
  const agreement = booking.agreement || {};
  const decision = booking.decision || booking.rejection || {};

  const eqName = equipment.name || booking.equipmentName || "Laboratory Equipment";
  const startDt = bk.startTime || booking.startTime;
  const endDt = bk.endTime || booking.endTime;

  return (
    <Modal
      title="Booking Request Details"
      subtitle={`Application #${bookingId} · ${eqName}`}
      onClose={onClose}
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Status Alert Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Status:</span>
            <StatusBadge status={booking.status} />
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">#{bookingId}</span>
        </div>

        {/* SECTION A: APPLICANT DETAILS */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <User size={14} className="text-blue-600" /> A. Applicant Details
          </h4>
          <div className="grid sm:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Full Name</p>
              <p className="font-bold text-slate-900 mt-0.5">{applicant.fullName || booking.researcher || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Institutional Email</p>
              <p className="font-bold text-slate-900 mt-0.5">{applicant.email || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone</p>
              <p className="font-semibold text-slate-800 mt-0.5">{applicant.phoneNumber || "Not on file"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Academic Role</p>
              <p className="font-semibold text-slate-800 mt-0.5">{applicant.role || "RESEARCHER"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Roll Number / Researcher ID</p>
              <p className="font-mono font-bold text-blue-700 mt-0.5">
                {applicant.rollNumber || applicant.researcherId || "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Department & Code</p>
              <p className="font-semibold text-slate-800 mt-0.5">
                {applicant.departmentName || booking.department || "—"}
                {applicant.departmentCode ? ` (${applicant.departmentCode})` : ""}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Institution</p>
              <p className="font-semibold text-slate-800 mt-0.5">
                {applicant.institutionName || "Institutional Laboratory System"}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION B: EQUIPMENT DETAILS */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <FlaskConical size={14} className="text-emerald-600" /> B. Equipment & Laboratory
          </h4>
          <div className="grid sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Equipment Name</p>
              <p className="font-bold text-slate-900 mt-0.5">{eqName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Asset ID / Serial Number</p>
              <p className="font-mono font-bold text-slate-800 mt-0.5">
                {equipment.assetId || equipment.serialNumber || `#${equipment.equipmentId || booking.equipmentId}`}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Category</p>
              <p className="font-semibold text-slate-800 mt-0.5">{equipment.category || "General Lab Equipment"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Laboratory</p>
              <p className="font-semibold text-slate-800 mt-0.5">{equipment.laboratory || equipment.location || "Main Department Lab"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Condition</p>
              <p className="font-semibold text-slate-800 mt-0.5">{equipment.condition || "GOOD"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Calibration Status</p>
              <p className="font-bold text-emerald-700 mt-0.5">{equipment.calibrationStatus || "VALID"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Slot Capacity</p>
              <p className="font-semibold text-slate-800 mt-0.5">{equipment.capacityPerSlot || 1} session(s)</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Hourly Rate</p>
              <p className="font-bold text-blue-700 mt-0.5">
                {equipment.hourlyRate != null ? `₹${Number(equipment.hourlyRate).toFixed(2)}/hr` : "Free"}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION C: BOOKING SCHEDULE & PURPOSE */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Clock size={14} className="text-amber-600" /> C. Booking Details & Parameters
          </h4>
          <div className="grid sm:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Start Date & Time</p>
              <p className="font-bold text-slate-900 mt-0.5">{startDt ? formatDateTime(startDt) : "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">End Date & Time</p>
              <p className="font-bold text-slate-900 mt-0.5">{endDt ? formatDateTime(endDt) : "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Estimated Total Cost</p>
              <p className="font-black text-blue-700 mt-0.5">
                {bk.estimatedCost != null && Number(bk.estimatedCost) > 0
                  ? `₹${Number(bk.estimatedCost).toFixed(2)}`
                  : "₹0.00 (Waived/Free)"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Payment Status</p>
              <p className="font-semibold text-slate-800 mt-0.5">{bk.paymentStatus || "NOT_APPLICABLE"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Stated Research Purpose</p>
              <p className="font-medium text-slate-800 bg-white p-3 rounded-lg border border-slate-200 mt-1 leading-relaxed">
                {bk.purpose || "No stated purpose provided."}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION D: PERSISTED AGREEMENT ACCEPTANCE */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <FileCheck size={14} className="text-blue-600" /> D. Laboratory Agreement Acceptance
          </h4>
          <div className="text-xs bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className={(agreement.accepted || booking.agreementAccepted) ? "text-emerald-600" : "text-slate-400"} />
                <span className="font-bold text-slate-900">
                  {(agreement.accepted || booking.agreementAccepted)
                    ? "Operating & Safety Agreement Accepted"
                    : "Agreement Acceptance Pending"}
                </span>
              </div>
              {(agreement.version || booking.agreementVersion) && (
                <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                  Version: {agreement.version || booking.agreementVersion}
                </span>
              )}
            </div>
            {(agreement.acceptedAt || booking.agreementAcceptedAt) && (
              <p className="text-[11px] text-slate-500">
                Timestamp of digital acceptance: <strong>{formatDateTime(agreement.acceptedAt || booking.agreementAcceptedAt)}</strong>
              </p>
            )}
          </div>
        </div>

        {/* SECTION E: DECISION AUDIT (If already processed) */}
        {(booking.status === "REJECTED" || booking.status === "CONFIRMED") && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShieldCheck size={14} className="text-purple-600" /> E. Decision Audit Trail
            </h4>
            <div className="text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Final Decision:</span>
                <StatusBadge status={booking.status} />
              </div>
              {(decision.rejectionReason || booking.rejectionReason) && (
                <div className="pt-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Reason Provided:</p>
                  <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200 mt-0.5 leading-relaxed">
                    {decision.rejectionReason || booking.rejectionReason}
                  </p>
                </div>
              )}
              {(decision.rejectedByName || booking.rejectedByName) && (
                <p className="text-[11px] text-slate-500">
                  Processed by Lab Manager: <strong>{decision.rejectedByName || booking.rejectedByName}</strong>
                  {(decision.rejectedAt || booking.rejectedAt) ? ` on ${formatDateTime(decision.rejectedAt || booking.rejectedAt)}` : ""}
                </p>
              )}
              {(decision.approvedByName || booking.approvedByName) && (
                <p className="text-[11px] text-slate-500">
                  Approved by Lab Manager: <strong>{decision.approvedByName || booking.approvedByName}</strong>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            Close
          </button>

          {booking.status === "PENDING_APPROVAL" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onApprove(bookingId)}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
              >
                <ThumbsUp size={14} /> Approve Booking
              </button>
              <button
                onClick={() => onReject(booking)}
                className="rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-5 py-2.5 flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
              >
                <ThumbsDown size={14} /> Reject Request
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================== */
/*  Modal: Reject Booking with Required Manager Reason                */
/* ================================================================== */
export function RejectModal({ booking, equipmentName, onClose, onConfirm, loading = false }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const bookingId = booking.bookingId || booking.id;

  const handleSubmit = (e) => {
    e?.preventDefault();
    const clean = reason.trim();
    if (!clean) {
      setError("Please provide a specific reason for rejection.");
      return;
    }
    if (clean.length > 1000) {
      setError("Rejection reason cannot exceed 1000 characters.");
      return;
    }
    setError("");
    onConfirm(clean);
  };

  return (
    <Modal
      title="Reject Booking Request"
      subtitle={`Application #${bookingId} · ${equipmentName}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 text-xs text-amber-900 leading-relaxed">
          <p className="font-bold flex items-center gap-1.5">
            <AlertCircle size={14} className="text-amber-600 shrink-0" />
            Decision Transparency Notice
          </p>
          <p className="mt-1 text-amber-800">
            The applicant will receive an immediate in-app notification containing this reason.
          </p>
        </div>

        <Field
          label="Reason for Rejection"
          required
          error={error}
          hint={`${reason.length}/1000 characters`}
        >
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError("");
            }}
            rows={4}
            maxLength={1000}
            placeholder="Explain why this request cannot be approved (e.g. equipment scheduled for maintenance, department training session scheduled, etc.)…"
            className={inputClass(error)}
            autoFocus
          />
        </Field>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !reason.trim()}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
          >
            {loading ? "Submitting Decision…" : "Reject Booking"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
