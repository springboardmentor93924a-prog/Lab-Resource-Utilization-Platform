import { useState } from "react";
import { CalendarClock, FlaskConical, ClipboardList } from "lucide-react";
import { ViewHeader } from "../../common/ViewHeader.jsx";
import { EmptyState } from "../../common/EmptyState.jsx";
import { StatusBadge } from "../../common/StatusBadge.jsx";
import { formatDateTime } from "../../../utils/formatters.js";
import Waitlist from "../waitlist/Waitlist.jsx";

/* ================================================================== */
/*  Researcher -> Booking -> My Bookings (4 tabs)                      */
/* ================================================================== */
export default function MyBookings({ myBookings, waitlist, equipmentById, activeTab, setActiveTab, onCancel, onReschedule, onBookNew }) {
  const tabs = [
    { id: "upcoming", label: "Upcoming" },
    { id: "active", label: "Active" },
    { id: "history", label: "History" },
    { id: "waitlist", label: "Waitlist" },
  ];

  const upcoming = myBookings.filter((b) => b.status === "PENDING_APPROVAL" || b.status === "CONFIRMED");
  const active = myBookings.filter((b) => b.status === "IN_USE");
  const history = myBookings.filter((b) => ["COMPLETED", "CANCELLED", "NO_SHOW", "REJECTED"].includes(b.status));

  return (
    <div>
      <ViewHeader
        title="My Bookings"
        subtitle="Track upcoming, active, past, and waitlisted equipment reservations."
        action={
          <button onClick={onBookNew} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors">
            + New Booking
          </button>
        }
      />

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 w-fit mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === t.id ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "upcoming" && (
        upcoming.length === 0 ? <EmptyState icon={CalendarClock} title="No upcoming bookings" /> :
        <BookingTable rows={upcoming} equipmentById={equipmentById} onCancel={onCancel} onReschedule={onReschedule} showActions />
      )}
      {activeTab === "active" && (
        active.length === 0 ? <EmptyState icon={FlaskConical} title="No equipment currently in use" /> :
        <BookingTable rows={active} equipmentById={equipmentById} />
      )}
      {activeTab === "history" && (
        history.length === 0 ? <EmptyState icon={ClipboardList} title="No booking history yet" /> :
        <BookingTable rows={history} equipmentById={equipmentById} showReason />
      )}
      {activeTab === "waitlist" && <Waitlist waitlist={waitlist} equipmentById={equipmentById} />}
    </div>
  );
}

function BookingTable({ rows, equipmentById, onCancel, onReschedule, showActions, showReason }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
          <tr>
            <th className="text-left font-semibold px-5 py-3">Equipment</th>
            <th className="text-left font-semibold px-5 py-3">Schedule</th>
            <th className="text-left font-semibold px-5 py-3">Status</th>
            {showActions && <th className="text-right font-semibold px-5 py-3">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((b) => (
            <tr key={b.id}>
              <td className="px-5 py-3.5">
                <p className="font-semibold text-slate-800">{equipmentById[b.equipmentId]?.name}</p>
                <p className="text-xs text-slate-400">{b.id}</p>
                {showReason && b.status === "REJECTED" && b.rejectionReason && (
                  <p className="text-xs text-red-500 mt-1">Reason: {b.rejectionReason}</p>
                )}
              </td>
              <td className="px-5 py-3.5 text-slate-600">{formatDateTime(b.start)} – {formatDateTime(b.end)}</td>
              <td className="px-5 py-3.5"><StatusBadge status={b.status} /></td>
              {showActions && (
                <td className="px-5 py-3.5 text-right space-x-2">
                  <button onClick={() => onReschedule(b)} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Reschedule</button>
                  <button onClick={() => onCancel(b.id)} className="text-xs font-semibold text-red-500 hover:text-red-600">Cancel</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
