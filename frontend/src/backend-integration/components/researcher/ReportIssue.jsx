import { useEffect, useState, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Calendar,
  Building,
  Tag,
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  Info,
} from "lucide-react";
import { issueReportApi } from "../../../api/issueReportApi";
import { ApiError } from "../../../api/client";

const ISSUE_TYPES = [
  "Mechanical Fault",
  "Electrical Fault",
  "Hardware Failure",
  "Software / Calibration",
  "Equipment Damage",
  "Safety Issue",
  "Other",
];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export function ReportIssue({ prefillEquipment, onNavigate, onDone, toast }) {
  const [activeTab, setActiveTab] = useState("report"); // "report" | "history"
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState("");

  const now = new Date();
  const localIsoString = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const [form, setForm] = useState({
    issueType: ISSUE_TYPES[0],
    priority: "MEDIUM",
    incidentTimestamp: localIsoString,
    description: "",
    damageAcknowledged: false,
    attachmentUrl: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  // My Reports History
  const [myReports, setMyReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchEligibleBookings = useCallback(async () => {
    setLoadingBookings(true);
    setError("");
    try {
      const data = await issueReportApi.getEligibleBookings();
      const list = Array.isArray(data) ? data : [];
      setEligibleBookings(list);

      // Handle prefill
      if (prefillEquipment?.bookingId) {
        const found = list.find((b) => b.bookingId === prefillEquipment.bookingId);
        if (found) {
          setSelectedBookingId(String(found.bookingId));
        } else if (list.length > 0) {
          setSelectedBookingId(String(list[0].bookingId));
        }
      } else if (list.length > 0 && !selectedBookingId) {
        setSelectedBookingId(String(list[0].bookingId));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load eligible bookings.");
    } finally {
      setLoadingBookings(false);
    }
  }, [prefillEquipment, selectedBookingId]);

  const fetchMyReports = useCallback(async () => {
    setLoadingReports(true);
    try {
      const data = await issueReportApi.myReports();
      setMyReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Could not fetch my issue reports:", err);
    } finally {
      setLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    fetchEligibleBookings();
    fetchMyReports();
  }, [fetchEligibleBookings, fetchMyReports]);

  const selectedBooking = eligibleBookings.find(
    (b) => String(b.bookingId) === String(selectedBookingId)
  );

  const setFormField = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleDownloadPdf = async (reportId) => {
    setDownloadingId(reportId);
    try {
      await issueReportApi.downloadPdf(reportId);
      toast?.("Incident report PDF downloaded.", "success");
    } catch (err) {
      toast?.(err.message || "Failed to download incident report PDF.", "error");
    } finally {
      setDownloadingId(null);
    }
  };

  const submit = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!selectedBooking) {
      setError("Please select the active equipment booking with the issue.");
      return;
    }
    if (!form.issueType) {
      setError("Please select an issue type.");
      return;
    }
    if (!form.incidentTimestamp) {
      setError("Incident date and time is required.");
      return;
    }
    if (!form.description.trim()) {
      setError("Please provide a description of what happened and what you observed.");
      return;
    }
    if (!form.damageAcknowledged) {
      setError("You must confirm that the equipment issue occurred during your active usage.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        bookingId: selectedBooking.bookingId,
        equipmentId: selectedBooking.equipmentId,
        issueType: form.issueType,
        description: form.description.trim(),
        priority: form.priority,
        incidentTimestamp: form.incidentTimestamp,
        damageAcknowledged: true,
        attachmentUrl: form.attachmentUrl.trim() || undefined,
      };

      const result = await issueReportApi.report(payload);
      setConfirmation({
        ...result,
        equipmentName: selectedBooking.equipmentName,
        serialNumber: selectedBooking.serialNumber || selectedBooking.equipmentId,
        departmentName: selectedBooking.departmentName || "Equipment Department",
      });
      toast?.("Equipment issue reported successfully. Lab Manager has been notified.", "success");
      fetchMyReports();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Could not submit the issue report.";
      setError(msg);

      // If booking became invalid or time window expired, refresh eligible bookings
      if (
        err?.status === 400 ||
        msg.toLowerCase().includes("in_use") ||
        msg.toLowerCase().includes("time window")
      ) {
        fetchEligibleBookings();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setConfirmation(null);
    setError("");
    setForm({
      issueType: ISSUE_TYPES[0],
      priority: "MEDIUM",
      incidentTimestamp: localIsoString,
      description: "",
      damageAcknowledged: false,
      attachmentUrl: "",
    });
    fetchEligibleBookings();
  };

  // SUCCESS SCREEN
  if (confirmation) {
    return (
      <div className="max-w-2xl mx-auto py-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900">Issue Report Submitted</h2>
          <p className="mt-1.5 text-sm text-slate-600 max-w-md mx-auto">
            Your equipment issue report has been registered and routed to the equipment department's Lab Manager.
          </p>

          <div className="mt-6 text-left rounded-xl border border-slate-100 bg-slate-50/80 p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Report ID</span>
                <p className="text-sm font-bold text-slate-900">#{confirmation.issueReportId}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Status</span>
                <p className="text-sm font-bold text-blue-700">{confirmation.status || "OPEN"}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Equipment</span>
                <p className="text-sm font-semibold text-slate-800">{confirmation.equipmentName}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Asset / Serial ID</span>
                <p className="text-sm font-semibold text-slate-800">{confirmation.serialNumber}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Department</span>
                <p className="text-sm font-semibold text-slate-800">{confirmation.departmentName}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Reported At</span>
                <p className="text-sm font-semibold text-slate-800">
                  {confirmation.reportedAt ? new Date(confirmation.reportedAt).toLocaleString() : "Just now"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-amber-700 bg-amber-50 py-2.5 px-4 rounded-lg border border-amber-200">
            <Info size={15} className="shrink-0" />
            <span>The Lab Manager for this equipment's department has received the notification and work order.</span>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setConfirmation(null);
                setActiveTab("history");
              }}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 transition-colors shadow-sm"
            >
              View My Reports
            </button>
            <button
              onClick={resetForm}
              className="rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-5 py-2.5 transition-colors"
            >
              Report Another Issue
            </button>
            <button
              onClick={() => (onNavigate ? onNavigate("dashboard") : onDone?.())}
              className="rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-5 py-2.5 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Report Equipment Issue</h1>
          <p className="mt-1 text-sm text-slate-600">
            Report a problem with equipment you are currently using through an active booking.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1 self-start">
          <button
            type="button"
            onClick={() => setActiveTab("report")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
              activeTab === "report" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Report Issue
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("history");
              fetchMyReports();
            }}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === "history" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            My Reports
            {myReports.length > 0 && (
              <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] text-slate-700 font-bold">
                {myReports.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: REPORT ISSUE FORM */}
      {activeTab === "report" && (
        <>
          {loadingBookings ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-blue-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Loading active equipment bookings…</p>
            </div>
          ) : eligibleBookings.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 border border-amber-200">
                <AlertTriangle size={24} className="text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">No Eligible Equipment Active</h2>
              <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
                No equipment is currently eligible for issue reporting. You can only report an issue for equipment with an{" "}
                <span className="font-semibold text-slate-800">active IN_USE booking</span> during your scheduled time window.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => (onNavigate ? onNavigate("bookings") : onDone?.())}
                  className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 transition-colors"
                >
                  View My Bookings
                </button>
                <button
                  type="button"
                  onClick={fetchEligibleBookings}
                  className="rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw size={13} /> Check Again
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              {/* SECTION 1: EQUIPMENT SELECTION */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Tag size={16} className="text-blue-600" /> 1. Select Active Equipment
                  </h2>
                  <button
                    type="button"
                    onClick={fetchEligibleBookings}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <RefreshCw size={12} /> Refresh List
                  </button>
                </div>

                <div>
                  <label htmlFor="equipmentSelect" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Currently In-Use Equipment <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="equipmentSelect"
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {eligibleBookings.map((b) => (
                      <option key={b.bookingId} value={b.bookingId}>
                        {b.equipmentName} (Booking #{b.bookingId}) — Active until{" "}
                        {new Date(b.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Only equipment with an active IN_USE booking during your current session is shown.
                  </p>
                </div>

                {/* SELECTED BOOKING REAL SUMMARY */}
                {selectedBooking && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-blue-100/80">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{selectedBooking.equipmentName}</p>
                        <p className="text-[11px] text-slate-500">Category: {selectedBooking.category || "Standard"}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                        ● IN USE
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-500 block">Asset / Serial ID</span>
                        <span className="font-semibold text-slate-800">
                          {selectedBooking.serialNumber || selectedBooking.equipmentId}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-500 block">Department</span>
                        <span className="font-semibold text-slate-800">
                          {selectedBooking.departmentName || `Dept ID: ${selectedBooking.departmentId || "—"}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-500 block">Laboratory / Location</span>
                        <span className="font-semibold text-slate-800">
                          {selectedBooking.labName || selectedBooking.location || "Main Laboratory"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-500 block">Booking Reference</span>
                        <span className="font-semibold text-slate-800">#{selectedBooking.bookingId}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-500 block">Using Since</span>
                        <span className="font-semibold text-slate-800">
                          {new Date(selectedBooking.startTime).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-500 block">Booking Ends</span>
                        <span className="font-semibold text-slate-800">
                          {new Date(selectedBooking.endTime).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: ISSUE DETAILS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-600" /> 2. Issue Details & Incident Time
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Issue Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.issueType}
                      onChange={setFormField("issueType")}
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {ISSUE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      When did you first notice the problem? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={form.incidentTimestamp}
                      onChange={setFormField("incidentTimestamp")}
                      required
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-[11px] text-slate-500">
                      Specify the approximate time the incident or defect occurred.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Priority</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, priority: p }))}
                        className={`rounded-lg border px-3 py-2 text-xs font-bold transition-all ${
                          form.priority === p
                            ? p === "CRITICAL"
                              ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
                              : p === "HIGH"
                              ? "border-amber-500 bg-amber-50 text-amber-700 shadow-sm"
                              : "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Problem Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={setFormField("description")}
                    rows={4}
                    required
                    placeholder="Describe what happened, what you observed, and any visible damage or error."
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Supporting Evidence / Attachment URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.attachmentUrl}
                    onChange={setFormField("attachmentUrl")}
                    placeholder="e.g. https://... (photo or log file link)"
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* SECTION 3: DAMAGE ACKNOWLEDGEMENT */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert size={16} className="text-blue-600" /> 3. Damage Acknowledgement
                </h2>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.damageAcknowledged}
                    onChange={setFormField("damageAcknowledged")}
                    required
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium text-slate-700 leading-relaxed">
                    I confirm that the information provided about this equipment issue is accurate and occurred during my active session.
                  </span>
                </label>
              </div>

              {/* Error banner */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Submitting Damage Report…
                  </>
                ) : (
                  "Submit Damage Report"
                )}
              </button>
            </form>
          )}
        </>
      )}

      {/* TAB 2: MY REPORTED ISSUES HISTORY */}
      {activeTab === "history" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">My Equipment Issue Reports</h2>
            <button
              type="button"
              onClick={fetchMyReports}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {loadingReports ? (
            <div className="py-8 text-center text-sm font-semibold text-slate-500">Loading reports…</div>
          ) : myReports.length === 0 ? (
            <div className="py-12 text-center">
              <FileText size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No issue reports submitted yet.</p>
              <p className="text-xs text-slate-500 mt-1">When you report an equipment problem, it will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myReports.map((report) => (
                <div
                  key={report.issueReportId}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-2.5 transition-all hover:bg-slate-50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900">
                        Report #{report.issueReportId}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          report.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : report.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-800"
                            : report.status === "ASSIGNED"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {report.status || "OPEN"}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">
                        {report.priority || "MEDIUM"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(report.issueReportId)}
                      disabled={downloadingId === report.issueReportId}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors"
                      title="Download Incident Report PDF"
                    >
                      <Download size={12} />
                      {downloadingId === report.issueReportId ? "Downloading…" : "PDF Report"}
                    </button>
                  </div>

                  <p className="text-xs font-medium text-slate-800">{report.issueDescription}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>
                      Type: <strong className="text-slate-700">{report.issueType || "Equipment Issue"}</strong>
                    </span>
                    <span>
                      Reported:{" "}
                      <strong className="text-slate-700">
                        {report.reportedAt ? new Date(report.reportedAt).toLocaleDateString() : "Recent"}
                      </strong>
                    </span>
                    {report.incidentTimestamp && (
                      <span>
                        Incident Time:{" "}
                        <strong className="text-slate-700">
                          {new Date(report.incidentTimestamp).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </strong>
                      </span>
                    )}
                  </div>

                  {report.resolutionNotes && (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-2.5 text-xs text-emerald-800">
                      <strong>Resolution: </strong> {report.resolutionNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
