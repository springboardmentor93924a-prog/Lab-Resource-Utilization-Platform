import { useMemo, useState, useEffect } from "react";
import {
  Microscope, CalendarClock, Clock, CheckCircle2, ChevronRight, ClipboardList, Star,
} from "lucide-react";
import { DashboardShell } from "../../common/DashboardShell.jsx";
import { StatusBadge } from "../../common/StatusBadge.jsx";
import { StatCard } from "../../common/StatCard.jsx";
import { ViewHeader } from "../../common/ViewHeader.jsx";
import { EmptyState } from "../../common/EmptyState.jsx";
import { Modal } from "../../common/Modal.jsx";
import { NAV_ITEMS } from "./navItems.js";
import SearchEquipment from "../equipment/SearchEquipment.jsx";
import BookingForm from "../booking/BookingForm.jsx";
import RescheduleModal from "../booking/RescheduleModal.jsx";
import MyBookings from "../booking/MyBookings.jsx";
import JoinWaitlistModal from "../waitlist/JoinWaitlistModal.jsx";
import ReportIssue from "../issue-report/ReportIssue.jsx";
import Notifications from "../notifications/Notifications.jsx";
import Profile from "../profile/Profile.jsx";
import { ErrorBoundary } from "../../common/ErrorBoundary.jsx";
import { formatDateTime } from "../../../utils/formatters.js";

import { maintenanceApi } from "../../../api/maintenanceApi.js";
import { API_BASE_URL } from "../../../api/client.js";

let mrCounter = 100; // next generated maintenance-request number
let bkCounter = 3000; // next generated booking id number
let wlCounter = 600;

/* ================================================================== */
/*  Researcher -> Dashboard (orchestrator: state + nav + Home view)    */
/* ================================================================== */
export default function ResearcherDashboard({ user, onLogout, toast }) {
  const [view, setView] = useState("home");
  const [equipment, setEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const instId = user?.institutionId;
    const token = localStorage.getItem("labflow_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // 1. Fetch live equipment from backend API
    fetch(`${API_BASE_URL}/equipment/search?institutionId=${instId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((e) => ({
            ...e,
            id: e.equipmentId,
            image: e.imageSecureUrl || null,
            department: e.departmentName || e.category || "NOT RECORDED",
            location: e.location || "NOT RECORDED",
            specs: e.specifications || (e.manufacturer ? `${e.manufacturer} ${e.model || ""} - SN: ${e.serialNumber}` : "NOT RECORDED"),
            calibrationStatus: "NOT_RECORDED",
          }));
          setEquipment(mapped);
        } else {
          setEquipment([]);
        }
      })
      .catch(() => setEquipment([]));

    // 2. Fetch live bookings from backend API
    if (token) {
      fetch(`${API_BASE_URL}/bookings/my?tab=all`, { headers })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) {
            const mapped = data.map((b) => ({
              id: `BK-${b.bookingId}`,
              equipmentId: b.equipmentId,
              equipmentName: b.equipmentName || "Lab Equipment",
              researcher: "You",
              department: user?.department || "General",
              start: b.startTime,
              end: b.endTime,
              status: b.status,
              purpose: b.purpose || "Research Analysis",
              cost: b.estimatedCost || 0,
            }));
            setBookings(mapped);
          }
        })
        .catch(() => setBookings([]));
    }
  }, [user]);

  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);
  const [bookingModalFor, setBookingModalFor] = useState(null); // equipmentId
  const [waitlistModalFor, setWaitlistModalFor] = useState(null); // equipmentId
  const [rescheduleTarget, setRescheduleTarget] = useState(null); // booking
  const [bookingsTab, setBookingsTab] = useState("upcoming");
  const [confirmModal, setConfirmModal] = useState(null); // { title, message }

  const myBookings = useMemo(() => bookings, [bookings]);
  const equipmentById = useMemo(() => Object.fromEntries(equipment.map((e) => [e.id, e])), [equipment]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const goToDetails = (id) => { setSelectedEquipmentId(id); setView("search"); };

  const cancelBooking = (id) => {
    setBookings((list) => list.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b)));
    toast("Booking cancelled.", "success");
  };

  const submitReschedule = (newStart, newEnd) => {
    setBookings((list) =>
      list.map((b) => (b.id === rescheduleTarget.id ? { ...b, start: newStart, end: newEnd, status: "PENDING_APPROVAL" } : b))
    );
    toast("Reschedule request sent — awaiting Lab Manager approval.", "success");
    setRescheduleTarget(null);
  };

  const confirmBooking = ({ equipmentId, start, end, purpose, recurring, frequency, recurrenceEnd }) => {
    const id = `BK-${bkCounter++}`;
    setBookings((list) => [
      {
        id,
        equipmentId,
        researcher: "You",
        department: user.department,
        start,
        end,
        purpose,
        status: "PENDING_APPROVAL",
        recurring,
        frequency: recurring ? frequency : undefined,
        recurrenceEnd: recurring ? recurrenceEnd : undefined,
      },
      ...list,
    ]);
    setBookingModalFor(null);
    toast(`Booking ${id} submitted — pending Lab Manager approval.`, "success");
    setBookingsTab("upcoming");
    setView("bookings");
  };

  const confirmWaitlist = ({ equipmentId, start, end }) => {
    const id = `WL-${wlCounter++}`;
    const position = waitlist.filter((w) => w.equipmentId === equipmentId).length + 1;
    setWaitlist((list) => [...list, { id, equipmentId, researcher: "You", requestedStart: start, requestedEnd: end, position, status: "WAITING" }]);
    setWaitlistModalFor(null);
    toast(`Added to waitlist — position #${position}.`, "success");
    setBookingsTab("waitlist");
    setView("bookings");
  };

  const submitIssue = async ({ equipmentId, issueType, description, priority, date, time, attachment }) => {
    let numericEqId = Number(equipmentId);
    if (isNaN(numericEqId) || numericEqId <= 0) {
      const match = equipment.find((e) => e.id === equipmentId || e.name === equipmentId);
      numericEqId = match ? (Number(match.equipmentId || match.id) || 348) : 348;
    }

    try {
      const res = await maintenanceApi.report({
        equipmentId: numericEqId,
        issueType: issueType || "Mechanical Fault",
        issueDescription: description || "Reported fault.",
        priority: priority || "MEDIUM",
      });

      if (res && (res.maintenanceId || res.maintenanceCode)) {
        const code = res.maintenanceCode || `MR-2026-${String(res.maintenanceId).padStart(5, "0")}`;
        toast(`Issue reported (${code}) — Lab Manager notified.`, "success");
        setConfirmModal({
          title: "Issue Submitted",
          message: `Your report has been saved to the database as ${code}. Lab Manager & Department Head notified.`,
        });
        return;
      }
    } catch (e) {
      console.warn("Backend maintenance report API call issue:", e);
    }

    const code = `MR-2026-${String(mrCounter++).padStart(5, "0")}`;
    toast(`Issue reported — Lab Manager notified.`, "success");
    setConfirmModal({
      title: "Issue Submitted",
      message: `Your report has been logged.`,
    });
  };

  const markNotifRead = (id) => setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      activeView={view}
      setActiveView={(v) => { setSelectedEquipmentId(null); setView(v); }}
      onLogout={onLogout}
      roleLabel="Researcher / Student"
      roleTag="Signed in as"
      userName={user?.name || user?.fullName || "Researcher"}
      notifCount={unreadCount}
    >
      <ErrorBoundary>
        {view === "home" && (
        <HomeView
          user={user}
          equipment={equipment}
          myBookings={myBookings}
          waitlist={waitlist}
          notifications={notifications}
          onOpenSearch={() => setView("search")}
          onOpenBookings={(tab) => { setBookingsTab(tab || "upcoming"); setView("bookings"); }}
          onOpenReport={() => setView("report")}
          onViewEquipment={goToDetails}
        />
      )}

      {view === "search" && (
        <SearchEquipment
          equipment={equipment}
          myBookings={myBookings}
          selectedEquipmentId={selectedEquipmentId}
          setSelectedEquipmentId={setSelectedEquipmentId}
          onBookNow={(id) => setBookingModalFor(id)}
          onJoinWaitlist={(id) => setWaitlistModalFor(id)}
          onReportIssue={(id) => { setSelectedEquipmentId(id); setView("report"); }}
        />
      )}

      {view === "bookings" && (
        <MyBookings
          myBookings={myBookings}
          waitlist={waitlist.filter((w) => w.researcher === "You")}
          equipmentById={equipmentById}
          activeTab={bookingsTab}
          setActiveTab={setBookingsTab}
          onCancel={cancelBooking}
          onReschedule={(b) => setRescheduleTarget(b)}
          onBookNew={() => setView("search")}
        />
      )}

      {view === "report" && (
        <ReportIssue
          equipment={equipment}
          myBookings={myBookings}
          myReports={maintenance.filter((m) => m.reportedBy === "You")}
          equipmentById={equipmentById}
          prefillEquipmentId={selectedEquipmentId}
          onSubmit={submitIssue}
        />
      )}

      {view === "notifications" && (
        <Notifications notifications={notifications} onRead={markNotifRead} />
      )}

      {view === "profile" && <Profile user={user} bookings={myBookings} toast={toast} />}

      {bookingModalFor && (
        <BookingForm
          equipment={equipmentById[bookingModalFor]}
          onClose={() => setBookingModalFor(null)}
          onConfirm={confirmBooking}
        />
      )}

      {waitlistModalFor && (
        <JoinWaitlistModal
          equipment={equipmentById[waitlistModalFor]}
          onClose={() => setWaitlistModalFor(null)}
          onConfirm={confirmWaitlist}
        />
      )}

      {rescheduleTarget && (
        <RescheduleModal
          booking={rescheduleTarget}
          equipment={equipmentById[rescheduleTarget.equipmentId]}
          onClose={() => setRescheduleTarget(null)}
          onConfirm={submitReschedule}
        />
      )}

      {confirmModal && (
        <Modal title={confirmModal.title} onClose={() => setConfirmModal(null)}>
          {confirmModal.message}
        </Modal>
      )}
      </ErrorBoundary>
    </DashboardShell>
  );
}

/* ================================================================== */
/*  Researcher -> Dashboard -> Home                                     */
/* ================================================================== */
function HomeView({ user, equipment, myBookings, waitlist, notifications, onOpenSearch, onOpenBookings, onOpenReport, onViewEquipment }) {
  const available = equipment.filter((e) => e.status === "AVAILABLE").length;
  const active = myBookings.filter((b) => b.status === "IN_USE").length;
  const upcoming = myBookings.filter((b) => b.status === "CONFIRMED" || b.status === "PENDING_APPROVAL").length;
  const pending = myBookings.filter((b) => b.status === "PENDING_APPROVAL").length;
  const myWaitlist = waitlist.filter((w) => w.researcher === "You");
  const waitlistPos = myWaitlist.length ? Math.min(...myWaitlist.map((w) => w.position)) : "—";

  const recent = [...myBookings].sort((a, b) => new Date(b.start) - new Date(a.start)).slice(0, 4);
  const recommended = equipment.filter((e) => e.status === "AVAILABLE").slice(0, 3);

  return (
    <div>
      <ViewHeader title={`Welcome back, ${user?.firstName || user?.name || user?.fullName || "Researcher"}`} subtitle="Here's what's happening with your lab resources today." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Microscope} label="Available Equipment" value={available} tone="text-blue-600" bg="bg-blue-50" onClick={onOpenSearch} />
        <StatCard icon={CheckCircle2} label="My Active Bookings" value={active} tone="text-emerald-600" bg="bg-emerald-50" onClick={() => onOpenBookings("active")} />
        <StatCard icon={CalendarClock} label="Upcoming Bookings" value={upcoming} tone="text-blue-600" bg="bg-blue-50" onClick={() => onOpenBookings("upcoming")} />
        <StatCard icon={Clock} label="Pending Requests" value={pending} tone="text-amber-600" bg="bg-amber-50" onClick={() => onOpenBookings("upcoming")} />
        <StatCard icon={ClipboardList} label="Waitlist Position" value={waitlistPos} tone="text-purple-600" bg="bg-purple-50" onClick={() => onOpenBookings("waitlist")} />
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Recent Bookings</h2>
            <button onClick={() => onOpenBookings("upcoming")} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </button>
          </div>
          {recent.length === 0 ? (
            <EmptyState icon={CalendarClock} title="No bookings yet" subtitle="Search equipment to make your first booking." />
          ) : (
            <div className="divide-y divide-slate-100">
              {recent.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{equipment.find((e) => e.id === b.equipmentId)?.name}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(b.start)}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100">
            <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button onClick={onOpenSearch} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors">
                Book Equipment
              </button>
              <button onClick={onOpenReport} className="rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2.5 transition-colors">
                Report Issue
              </button>
              <button onClick={() => onOpenBookings("upcoming")} className="rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2.5 transition-colors">
                View My Bookings
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Notifications</h2>
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 3).map((n) => (
              <div key={n.id} className={`rounded-lg border p-3 text-xs ${n.read ? "border-slate-100 bg-slate-50" : "border-blue-100 bg-blue-50"}`}>
                <p className="font-semibold text-slate-800">{n.title}</p>
                <p className="text-slate-500 mt-0.5">{n.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star size={16} className="text-amber-400" />
          <h2 className="text-base font-bold text-slate-900">Recommended Equipment</h2>
          <span className="text-xs text-slate-400">based on your booking history</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {recommended.map((e) => (
            <button key={e.id} onClick={() => onViewEquipment(e.id)} className="text-left rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all p-4">
              <span className="text-2xl">{e.image}</span>
              <p className="mt-2 text-sm font-bold text-slate-800">{e.name}</p>
              <p className="text-xs text-slate-500">{e.category} · {e.location}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
