import { useEffect, useState, useCallback } from "react";
import {
  AlertTriangle, Trash2, Download, CheckCircle2,
  Calendar, BellRing
} from "lucide-react";
import { bookingApi } from "../../../api/bookingApi";
import { waitlistApi } from "../../../api/waitlistApi";
import { ApiError } from "../../../api/client";

const TABS = [
  { id: "upcoming", label: "Upcoming & Pending" },
  { id: "active", label: "Active Sessions" },
  { id: "history", label: "History" },
  { id: "waitlist", label: "Waitlist Queue" },
];

export function MyBookings({ onReportIssue, toast }) {
  const [tab, setTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingWaitlistId, setConfirmingWaitlistId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchBookings = useCallback((targetTab, isBackground = false, checkMounted = () => true) => {
    if (!isBackground) {
      setLoading(true);
    }
    const request = targetTab === "waitlist" ? waitlistApi.myWaitlist() : bookingApi.myBookings(targetTab);
    return request
      .then((data) => {
        if (checkMounted()) {
          if (targetTab === "waitlist") {
            setWaitlist(data || []);
          } else {
            setBookings(data || []);
          }
        }
      })
      .catch((e) => {
        if (checkMounted()) {
          if (!isBackground) {
            toast?.(e.message || "Could not load bookings.", "error");
          } else {
            console.warn("Background booking synchronization failed:", e);
          }
        }
      })
      .finally(() => {
        if (checkMounted() && !isBackground) {
          setLoading(false);
        }
      });
  }, [toast]);

  useEffect(() => {
    let isMounted = true;
    const isCurrent = () => isMounted;

    // 1. Immediate initial load for the current tab
    fetchBookings(tab, false, isCurrent);

    // 2. Periodic background polling every 30 seconds
    const intervalId = setInterval(() => {
      fetchBookings(tab, true, isCurrent);
    }, 30000);

    // 3. Cleanup on unmount or tab change
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [tab, fetchBookings]);

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingApi.cancel(bookingId);
      toast?.("Booking cancelled successfully.", "success");
      fetchBookings(tab, false, () => true);
    } catch (err) {
      toast?.(err instanceof ApiError ? err.message : "Could not cancel booking.", "error");
    }
  };

  const handleDownloadReceipt = async (bookingId) => {
    setDownloadingId(bookingId);
    try {
      await bookingApi.downloadReceipt(bookingId);
      toast?.("Receipt downloaded successfully.", "success");
    } catch (err) {
      toast?.(err.message || "Could not download receipt.", "error");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleConfirmWaitlist = async (waitlistId) => {
    setConfirmingWaitlistId(waitlistId);
    try {
      await waitlistApi.confirm(waitlistId);
      toast?.("Waitlist slot confirmed! Booking created.", "success");
      setTab("upcoming");
    } catch (err) {
      toast?.(err instanceof ApiError ? err.message : "Could not confirm slot.", "error");
      fetchBookings(tab, false, () => true);
    } finally {
      setConfirmingWaitlistId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Equipment Bookings</h1>
        <p className="mt-1 text-sm text-slate-600">Track pending requests, active lab sessions, historical bookings, and waitlist queues.</p>
      </div>

      <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1.5 w-fit border border-slate-200/80">
        {TABS.map((t) => (
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

      {loading ? (
        <div className="py-16 text-center text-sm font-medium text-slate-500">
          Loading your reservations...
        </div>
      ) : tab === "waitlist" ? (
        waitlist.length === 0 ? (
          <EmptyState text="You're not currently on any waitlist queues." />
        ) : (
          <div className="space-y-4">
            {waitlist.map((w) => {
              const isNotified = w.status === "NOTIFIED";
              return (
                <div
                  key={w.waitlistId}
                  className={`rounded-2xl border p-5 transition-all shadow-sm ${
                    isNotified
                      ? "border-amber-300 bg-amber-50/50 shadow-md ring-2 ring-amber-400/30"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-slate-900">{w.equipmentName}</span>
                        <WaitlistStatusBadge status={w.status} />
                      </div>

                      <p className="text-xs text-slate-600">
                        <span className="font-semibold">Preferred Slot:</span>{" "}
                        {new Date(w.requestedStartTime).toLocaleString()} →{" "}
                        {new Date(w.requestedEndTime).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>

                      {w.estimatedWait && (
                        <p className="text-xs text-slate-500">
                          Estimated wait: <span className="font-semibold text-slate-700">{w.estimatedWait}</span>
                        </p>
                      )}

                      {isNotified && (
                        <div className="mt-2 rounded-xl border border-amber-300 bg-amber-100/70 p-3 text-xs text-amber-900 flex items-start gap-2 max-w-xl">
                          <BellRing size={16} className="text-amber-700 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Slot Available for You!</p>
                            <p className="mt-0.5">
                              This slot was freed by another user. You have a 30-minute confirmation window to claim this reservation before it expires and passes to the next researcher in line.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Position</p>
                        <p className="text-2xl font-black text-amber-600">#{w.position}</p>
                      </div>

                      {isNotified && (
                        <button
                          onClick={() => handleConfirmWaitlist(w.waitlistId)}
                          disabled={confirmingWaitlistId === w.waitlistId}
                          className="rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-xs font-bold px-5 py-2.5 shadow-md transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={15} />
                          {confirmingWaitlistId === w.waitlistId ? "Confirming…" : "Claim & Confirm Slot"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : bookings.length === 0 ? (
        <EmptyState text={`No ${tab} bookings found on record.`} />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            // Parse purpose to see if rejection notes were appended by backend
            const rawPurpose = b.purpose || "";
            const rejectionMatch = rawPurpose.match(/\(Rejected reason:\s*(.*?)\)/i);
            const cleanPurpose = rejectionMatch ? rawPurpose.replace(/\(Rejected reason:.*?\)/i, "").trim() : rawPurpose;
            const rejectionReason = rejectionMatch ? rejectionMatch[1] : null;

            return (
              <div
                key={b.bookingId}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base font-extrabold text-slate-900">{b.equipmentName}</h3>
                      <span className="text-xs font-mono font-bold text-slate-400">#{b.bookingId}</span>
                      <BookingStatusBadge status={b.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      {new Date(b.startTime).toLocaleString()} → {new Date(b.endTime).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {b.estimatedCost != null && (
                    <div className="sm:text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Cost</p>
                      <p className="text-sm font-black text-blue-700">
                        {Number(b.estimatedCost) > 0 ? `₹${Number(b.estimatedCost).toFixed(2)}` : "Free"}
                      </p>
                    </div>
                  )}
                </div>

                {cleanPurpose && (
                  <div className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700">Purpose: </span>
                    <span>{cleanPurpose}</span>
                  </div>
                )}

                {(b.status === "REJECTED" || b.rejectionReason) && (
                  <div className="text-xs text-red-800 bg-red-50/90 p-4 rounded-xl border border-red-200 space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-red-900 flex-wrap gap-1">
                      <span>Lab Manager Decision Note:</span>
                      {b.rejectedAt && (
                        <span className="text-[11px] font-normal text-red-600">
                          {new Date(b.rejectedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-red-700 font-medium leading-relaxed bg-white/80 p-2.5 rounded-lg border border-red-100">
                      {b.rejectionReason || rejectionReason}
                    </p>
                    {b.rejectedByName && (
                      <p className="text-[11px] text-red-600 font-medium">
                        Reviewed by: <strong>{b.rejectedByName}</strong> (Department Lab Manager)
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between flex-wrap gap-3 pt-1 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Requested on: {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "Recent"}
                    </span>
                    {b.agreementAccepted && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        Agreement v{b.agreementVersion || "2026.1"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* PDF Receipt Download */}
                    <button
                      onClick={() => handleDownloadReceipt(b.bookingId)}
                      disabled={downloadingId === b.bookingId}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 transition-colors text-xs"
                      title="Download official booking receipt PDF"
                    >
                      <Download size={13} />
                      {downloadingId === b.bookingId ? "Generating PDF…" : "Receipt PDF"}
                    </button>

                    {/* Report Issue for Active IN_USE Bookings Only */}
                    {onReportIssue && b.status === "IN_USE" && (
                      <button
                        onClick={() => onReportIssue({ equipmentId: b.equipmentId, name: b.equipmentName, bookingId: b.bookingId, ...b })}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold px-3 py-1.5 transition-colors text-xs"
                      >
                        <AlertTriangle size={13} />
                        Report Issue
                      </button>
                    )}

                    {/* Cancel button for Upcoming/Pending */}
                    {tab === "upcoming" && (b.status === "PENDING_APPROVAL" || b.status === "CONFIRMED") && (
                      <button
                        onClick={() => cancelBooking(b.bookingId)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-3 py-1.5 transition-colors text-xs"
                      >
                        <Trash2 size={13} />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BookingStatusBadge({ status }) {
  const configs = {
    PENDING_APPROVAL: { label: "Pending Lab Manager Approval", cls: "bg-amber-50 text-amber-800 border-amber-300" },
    CONFIRMED:        { label: "Booking Approved",             cls: "bg-blue-50 text-blue-700 border-blue-200" },
    IN_USE:           { label: "Currently In Use",             cls: "bg-purple-50 text-purple-700 border-purple-200" },
    COMPLETED:        { label: "Completed",                    cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    CANCELLED:        { label: "Cancelled by User",            cls: "bg-slate-100 text-slate-600 border-slate-200" },
    REJECTED:         { label: "Rejected by Lab Manager",      cls: "bg-red-50 text-red-700 border-red-200" },
    NO_SHOW:          { label: "No Show",                      cls: "bg-rose-50 text-rose-700 border-rose-200" },
  };
  const c = configs[status] || { label: status?.replace(/_/g, " "), cls: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${c.cls}`}>
      {c.label}
    </span>
  );
}

function WaitlistStatusBadge({ status }) {
  const configs = {
    WAITING:   { label: "In Queue (Waiting for Slot)", cls: "bg-slate-100 text-slate-700 border-slate-300" },
    NOTIFIED:  { label: "Slot Available! (30-min Window)", cls: "bg-amber-100 text-amber-900 border-amber-400 font-black animate-pulse" },
    BOOKED:    { label: "Claimed & Booked",            cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    EXPIRED:   { label: "Offer Expired",               cls: "bg-red-50 text-red-700 border-red-200" },
    CANCELLED: { label: "Cancelled",                   cls: "bg-slate-100 text-slate-500 border-slate-200" },
  };
  const c = configs[status] || { label: status, cls: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${c.cls}`}>
      {c.label}
    </span>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

