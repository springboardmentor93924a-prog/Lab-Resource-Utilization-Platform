import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getAllBookings, approveBooking, rejectBooking } from "../services/bookingService";
import { useNavigate } from "react-router-dom";
import { isAdmin } from "../utils/auth";

const thStyle = {
  padding: "12px 16px",
  textAlign: "left",
  background: "#0F1B2D",
  color: "#fff",
  border: "1px solid #0F1B2D",
};

const tdStyle = {
  padding: "12px 16px",
  border: "1px solid #E2E8F0",
};

export default function BookingApproval() {
    const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin()) {
      alert("You don't have permission to view this page.");
      navigate("/dashboard");
    }
  }, [navigate]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
      alert("Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    try {
      await approveBooking(id);
      loadBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve booking.");
    }
  }

  async function handleReject(id) {
    try {
      await rejectBooking(id);
      loadBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject booking.");
    }
  }

  function statusColor(status) {
    switch (status) {
      case "CONFIRMED":
        return "#22c55e";
      case "CANCELLED":
        return "#ef4444";
      case "COMPLETED":
        return "#94a3b8";
      default:
        return "#f59e0b";
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside className="sidebar">
        <Sidebar />
      </aside>

      <main style={{ flex: 1, padding: "30px" }}>
        <h2 style={{ fontWeight: 700, color: "#0F1B2D", marginBottom: "25px" }}>
          Booking Approval
        </h2>

        {loading && <p>Loading bookings...</p>}

        {!loading && (
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>Equipment</th>
                  <th style={thStyle}>Booking Date</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td style={tdStyle}>{booking.id}</td>
                    <td style={tdStyle}>{booking.userFullName}</td>
                    <td style={tdStyle}>{booking.equipmentName}</td>
                    <td style={tdStyle}>{booking.bookingDate}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          background: statusColor(booking.bookingStatus),
                          color: "#fff",
                          padding: "5px 12px",
                          borderRadius: "999px",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {booking.bookingStatus === "PENDING" && (
                        <>
                          <button
                            className="btn btn-dark"
                            style={{ marginRight: "8px" }}
                            onClick={() => handleApprove(booking.id)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-outline-dark"
                            onClick={() => handleReject(booking.id)}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}