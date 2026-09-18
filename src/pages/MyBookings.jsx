import { useEffect, useState } from "react";
import { getAllBookings, createBooking } from "../api/bookingApi";
import { getAllEquipment } from "../api/equipmentApi";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

const emptyForm = { equipId: "", startTime: "", endTime: "" };

function MyBookings({ showToast }) {
  const { user } = useAuth();
  const [allBookings, setAllBookings] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [statusFilter, setStatusFilter] = useState("All");

  const load = () => {
    setLoading(true);
    getAllBookings()
      .then(setAllBookings)
      .catch((err) => setError(extractErrorMessage(err, "Failed to load bookings.")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getAllEquipment().then(setEquipment).catch(() => setEquipment([]));
  }, []);

  // NOTE: the backend has no GET /api/bookings/my endpoint yet (see README),
  // so "my bookings" is derived client-side from the full list by matching
  // the logged-in user's id against requestedById.
  const myBookings = user?.userId
    ? allBookings.filter((b) => b.requestedById === user.userId)
    : [];

  const filtered = myBookings.filter(
    (b) => statusFilter === "All" || b.status === statusFilter
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBooking({
        equipId: Number(form.equipId),
        startTime: form.startTime,
        endTime: form.endTime,
      });
      showToast?.("Booking request submitted.", "success");
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Failed to create booking."), "warning");
    }
  };

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>My Bookings</h1>
          <p style={subStyle}>Equipment you've booked, and their current status</p>
        </div>
        <button onClick={() => setShowForm(true)} style={primaryBtn}>+ New Booking</button>
      </div>

      {error && <p style={{ color: "#c0392b" }}>{error}</p>}
      {!user?.userId && (
        <p style={{ color: "#b56a00" }}>
          Your profile hasn't loaded yet, so bookings can't be matched to your account.
        </p>
      )}

      <div style={card}>
        <div style={filterBar}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="All">All Status</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <p style={{ padding: 20 }}>Loading your bookings...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Equipment</th>
                  <th style={thStyle}>Start</th>
                  <th style={thStyle}>End</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.bookingId} style={{ borderBottom: "1px solid #f0f2f6" }}>
                    <td style={tdStyle}>#{b.bookingId}</td>
                    <td style={tdStyle}>{b.equipmentName || b.equipId}</td>
                    <td style={tdStyle}>{b.startTime ? new Date(b.startTime).toLocaleString() : "-"}</td>
                    <td style={tdStyle}>{b.endTime ? new Date(b.endTime).toLocaleString() : "-"}</td>
                    <td style={tdStyle}>
                      <span style={statusPill(b.status)}>{b.status}</span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ ...tdStyle, textAlign: "center", padding: 30 }}>
                      You have no bookings yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 19 }}>New Booking</h2>
              <button onClick={() => setShowForm(false)} style={{ border: "none", background: "none", fontSize: 19, cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Equipment</label>
                <select
                  required
                  value={form.equipId}
                  onChange={(e) => setForm({ ...form, equipId: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Select equipment</option>
                  {equipment.filter((eq) => eq.status === "AVAILABLE").map((eq) => (
                    <option key={eq.equipmentId} value={eq.equipmentId}>{eq.equipmentName}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Start Time</label>
                <input
                  type="datetime-local"
                  required
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>End Time</label>
                <input
                  type="datetime-local"
                  required
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <p style={{ fontSize: 11, color: "#94a3b8" }}>
                If the equipment is already booked for this slot, you'll automatically be
                added to its waitlist by the backend.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 16 }}>
                <button type="button" onClick={() => setShowForm(false)} style={cancelBtn}>Cancel</button>
                <button type="submit" style={primaryBtn}>Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function statusPill(status) {
  const map = {
    PENDING_APPROVAL: { bg: "#fff4df", fg: "#b56a00" },
    CONFIRMED: { bg: "#e8f7ee", fg: "#16834b" },
    REJECTED: { bg: "#fdecec", fg: "#c0392b" },
    CANCELLED: { bg: "#f1f5f9", fg: "#475569" },
    COMPLETED: { bg: "#eaf2ff", fg: "#2563eb" },
  };
  const s = map[status] || { bg: "#f1f5f9", fg: "#475569" };
  return { background: s.bg, color: s.fg, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 };
}

const page = { padding: "30px 34px", background: "#f6f8fc", minHeight: "100%", boxSizing: "border-box", color: "#172b4d" };
const headerRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 };
const h1Style = { margin: 0, fontSize: 28, fontWeight: 700, color: "#172b4d" };
const subStyle = { margin: "7px 0 0", fontSize: 14, color: "#718096" };
const primaryBtn = { border: "none", background: "#2563eb", color: "white", padding: "11px 18px", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" };
const cancelBtn = { padding: "9px 16px", borderRadius: 6, border: "1px solid #d8dee8", background: "white", color: "#64748b", cursor: "pointer" };
const card = { background: "#fff", border: "1px solid #e4e8ef", borderRadius: 12, boxShadow: "0 2px 8px rgba(20,40,70,0.04)" };
const filterBar = { padding: "17px 20px", borderBottom: "1px solid #e8ecf2", display: "flex", gap: 12, alignItems: "center" };
const selectStyle = { height: 40, minWidth: 180, border: "1px solid #d9dfe8", borderRadius: 7, padding: "0 10px", background: "white", color: "#475569", fontSize: 13 };
const thStyle = { padding: "13px 16px", textAlign: "left", color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" };
const tdStyle = { padding: "14px 16px", color: "#475569", fontSize: 13, whiteSpace: "nowrap" };
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 };
const modalCard = { background: "white", borderRadius: 12, padding: 26, width: 480, maxHeight: "85vh", overflowY: "auto" };
const labelStyle = { display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: "#334155" };
const inputStyle = { width: "100%", height: 40, boxSizing: "border-box", border: "1px solid #d8dee8", borderRadius: 6, padding: "0 10px", fontSize: 13, outline: "none" };

export default MyBookings;
