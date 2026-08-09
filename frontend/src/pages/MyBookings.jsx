import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getBookingsByUser, cancelBooking } from "../services/bookingService";
import { getCurrentUserId } from "../utils/auth";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const userId = getCurrentUserId();
      const data = await getBookingsByUser(userId);
      setBookings(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id) {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await cancelBooking(id);
      alert("Booking cancelled.");
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking.");
    }
  }

  return (
    <div className="wrapper" style={{ display: "flex", minHeight: "100vh" }}>
      <aside className="sidebar">
        <Sidebar />
      </aside>

      <main className="content" style={{ flex: 1, padding: "30px" }}>
        <h4 style={{ marginBottom: "20px" }}>My bookings</h4>

        {loading && <p>Loading bookings...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && bookings.length === 0 && <p>You have no bookings yet.</p>}

        {!loading && !error && bookings.length > 0 && (
          <div style={{ background: "#fff", borderRadius: "12px", padding: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
            {bookings.map((b) => (
              <div
                key={b.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "15px",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div>
                  <strong>{b.equipmentName}</strong>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    {b.bookingDate}, {b.startTime}–{b.endTime}
                    {b.priorityBooking && <span style={{ marginLeft: "8px", color: "#0F766E" }}>• Priority</span>}
                  </div>
                  <div style={{ fontSize: "13px", color: "#999" }}>{b.purpose}</div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span
                    className="badge rounded-pill"
                    style={{
                      background:
                        b.bookingStatus === "CANCELLED"
                          ? "#e5e7eb"
                          : b.bookingStatus === "CONFIRMED"
                          ? "#22c55e"
                          : b.bookingStatus === "COMPLETED"
                          ? "#94a3b8"
                          : "#f59e0b",
                      color: "#fff",
                      padding: "6px 14px",
                    }}
                  >
                    {b.bookingStatus}
                  </span>

                  {(b.bookingStatus === "PENDING" || b.bookingStatus === "CONFIRMED") && (
                    <button
                      className="btn btn-outline-dark"
                      onClick={() => handleCancel(b.id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}