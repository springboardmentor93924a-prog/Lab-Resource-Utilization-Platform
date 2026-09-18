import { useEffect, useState } from "react";
import {
  getAllBookings,
  createBooking,
  updateBooking,
  approveBooking,
  rejectBooking,
  cancelBooking,
} from "../api/bookingApi";
import { getAllEquipment } from "../api/equipmentApi";
import { extractErrorMessage } from "../api/client";
import { BOOKING_STATUSES } from "../utils/constants";

const CREATE_ROLES = ["LAB_MANAGER", "DEPARTMENT_HEAD", "RESEARCHER"];
const UPDATE_ROLES = ["LAB_MANAGER", "DEPARTMENT_HEAD"];
const APPROVE_ROLES = ["INSTITUTION_ADMIN", "DEPARTMENT_HEAD", "LAB_MANAGER"];
const REJECT_ROLES = ["INSTITUTION_ADMIN", "DEPARTMENT_HEAD"];
const CANCEL_ROLES = ["LAB_MANAGER", "DEPARTMENT_HEAD"];

const emptyForm = { equipId: "", startTime: "", endTime: "" };

function Bookings({ userRole, showToast }) {
  const [bookings, setBookings] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    getAllBookings()
      .then(setBookings)
      .catch((err) => setError(extractErrorMessage(err, "Failed to load bookings.")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getAllEquipment().then(setEquipment).catch(() => setEquipment([]));
  }, []);

  const filtered = bookings.filter((b) => statusFilter === "All" || b.status === statusFilter);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (b) => {
    setForm({
      equipId: b.equipId,
      startTime: b.startTime?.slice(0, 16) || "",
      endTime: b.endTime?.slice(0, 16) || "",
    });
    setEditingId(b.bookingId);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      equipId: Number(form.equipId),
      startTime: form.startTime,
      endTime: form.endTime,
    };
    try {
      if (editingId) {
        await updateBooking(editingId, payload);
        showToast?.(`Booking #${editingId} updated.`, "success");
      } else {
        await createBooking(payload);
        showToast?.("Booking created.", "success");
      }
      resetForm();
      load();
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Failed to save booking."), "warning");
    }
  };

  const runAction = async (action, booking, successMsg) => {
    try {
      await action(booking.bookingId);
      showToast?.(successMsg, "success");
      load();
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Action failed."), "warning");
    }
  };

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>Bookings</h1>
          <p style={subStyle}>Manage equipment booking requests</p>
        </div>
        {CREATE_ROLES.includes(userRole) && (
          <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }} style={primaryBtn}>
            + New Booking
          </button>
        )}
      </div>

      {error && <p style={{ color: "#c0392b" }}>{error}</p>}

      <div style={card}>
        <div style={filterBar}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="All">All Status</option>
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <p style={{ padding: 20 }}>Loading bookings...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 950 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Equipment</th>
                  <th style={thStyle}>Start</th>
                  <th style={thStyle}>End</th>
                  <th style={thStyle}>Requesting Inst.</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.bookingId} style={{ borderBottom: "1px solid #f0f2f6" }}>
                    <td style={tdStyle}>#{b.bookingId}</td>
                    <td style={tdStyle}>{b.equipmentName || b.equipId}</td>
                    <td style={tdStyle}>{b.startTime ? new Date(b.startTime).toLocaleString() : "-"}</td>
                    <td style={tdStyle}>{b.endTime ? new Date(b.endTime).toLocaleString() : "-"}</td>
                    <td style={tdStyle}>{b.requestingInstitutionName || "-"}</td>
                    <td style={tdStyle}>
                      <span style={statusPill(b.status)}>{b.status}</span>
                    </td>
                    <td style={{ ...tdStyle, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {UPDATE_ROLES.includes(userRole) && b.status === "PENDING_APPROVAL" && (
                        <button onClick={() => openEdit(b)} style={actionBtn}>Edit</button>
                      )}
                      {APPROVE_ROLES.includes(userRole) && b.status === "PENDING_APPROVAL" && (
                        <button
                          onClick={() => runAction(approveBooking, b, `Booking #${b.bookingId} approved.`)}
                          style={{ ...actionBtn, color: "#16834b" }}
                        >
                          Approve
                        </button>
                      )}
                      {REJECT_ROLES.includes(userRole) && b.status === "PENDING_APPROVAL" && (
                        <button
                          onClick={() => runAction(rejectBooking, b, `Booking #${b.bookingId} rejected.`)}
                          style={{ ...actionBtn, color: "#c0392b" }}
                        >
                          Reject
                        </button>
                      )}
                      {CANCEL_ROLES.includes(userRole) && b.status !== "CANCELLED" && b.status !== "COMPLETED" && (
                        <button
                          onClick={() => runAction(cancelBooking, b, `Booking #${b.bookingId} cancelled.`)}
                          style={actionBtn}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ ...tdStyle, textAlign: "center", padding: 30 }}>
                      No bookings found.
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
              <h2 style={{ margin: 0, fontSize: 19 }}>{editingId ? "Edit Booking" : "New Booking"}</h2>
              <button onClick={resetForm} style={{ border: "none", background: "none", fontSize: 19, cursor: "pointer" }}>×</button>
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
                  {equipment.map((eq) => (
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
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 20 }}>
                <button type="button" onClick={resetForm} style={cancelBtn}>Cancel</button>
                <button type="submit" style={primaryBtn}>{editingId ? "Save Changes" : "Create Booking"}</button>
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
const selectStyle = { height: 40, minWidth: 160, border: "1px solid #d9dfe8", borderRadius: 7, padding: "0 10px", background: "white", color: "#475569", fontSize: 13 };
const thStyle = { padding: "13px 16px", textAlign: "left", color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" };
const tdStyle = { padding: "14px 16px", color: "#475569", fontSize: 13, whiteSpace: "nowrap" };
const actionBtn = { border: "1px solid #cbd5e1", background: "white", color: "#334155", padding: "5px 10px", borderRadius: 5, fontSize: 11, cursor: "pointer" };
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 };
const modalCard = { background: "white", borderRadius: 12, padding: 26, width: 500, maxHeight: "85vh", overflowY: "auto" };
const labelStyle = { display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: "#334155" };
const inputStyle = { width: "100%", height: 40, boxSizing: "border-box", border: "1px solid #d8dee8", borderRadius: 6, padding: "0 10px", fontSize: 13, outline: "none" };

export default Bookings;
