import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./ResearcherDashboard.css";
import { getAllEquipment } from "../services/equipmentService";
import { getBookingsByUser } from "../services/bookingService";
import { getCurrentUserId } from "../utils/auth";
import { getUnreadCount } from "../services/notificationService";

export default function ResearcherDashboard() {
  const navigate = useNavigate();
  const [equipmentList, setEquipmentList] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const equipment = await getAllEquipment();
        setEquipmentList(equipment);

          try {
            const unread = await getUnreadCount();
            setUnreadCount(unread.count);
          } catch {
            setUnreadCount(0);
          }

        const userId = getCurrentUserId();
        if (userId) {
          try {
            const bookings = await getBookingsByUser(userId);
            setMyBookings(bookings);
          } catch {
            setMyBookings([]);
          }
        }
      } catch {
        setEquipmentList([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function handleBookNow(equipmentId) {
    navigate(`/bookings?equipmentId=${equipmentId}`);
  }

  const availableCount = equipmentList.filter((e) => e.status?.toUpperCase() === "AVAILABLE").length;
    const upcomingBookings = myBookings.filter(
    (b) => b.bookingStatus === "PENDING_APPROVAL" || b.bookingStatus === "CONFIRMED"
  );
  const waitlistCount = myBookings.filter((b) => b.bookingStatus === "WAITLISTED").length;
  const recommended = equipmentList
    .filter((e) => e.status?.toUpperCase() === "AVAILABLE" && e.imageUrl)
    .slice(0, 3);

  return (
    <div className="container-main researcher-dashboard-page">
      <aside className="sidebar">
        <Sidebar />
      </aside>

      <main className="content">
        <div className="rd-topbar">
          <h4>Researcher dashboard</h4>
          <div className="rd-top-right">

    <button
        className="profile-circle"
        onClick={() => navigate("/profile")}
        title="My Profile"
        aria-label="My Profile"
    >
        👤
    </button>
</div>
        </div>

        <div className="stats">

  {/* MY BOOKINGS */}
  <div
    className="card stat blue"
    onClick={() => navigate("/my-bookings")}
    style={{ cursor: "pointer" }}
  >
    <big><b>My bookings</b></big>
    <h2>{upcomingBookings.length} upcoming</h2>
  </div>

  {/* AVAILABLE EQUIPMENT */}
  <div
    className="card stat green"
    onClick={() => navigate("/equipment?status=AVAILABLE")}
    style={{ cursor: "pointer" }}
  >
    <big><b>Available now</b></big>
    <h2>{availableCount} items</h2>
  </div>

  {/* WAITLIST */}
  <div
    className="card stat orange"
    onClick={() => navigate("/my-waitlist")}
    style={{ cursor: "pointer" }}
  >
    <big><b>Waitlisted</b></big>
    <h2>{waitlistCount} items</h2>
  </div>

  {/* NOTIFICATIONS */}
  <div
    className="card stat gray"
    onClick={() => navigate("/notifications")}
    style={{ cursor: "pointer" }}
  >
    <big><b>Notifications</b></big>
    <h2>{unreadCount} new</h2>
  </div>

</div>

        <h5 className="section-title">Upcoming reservations</h5>
        <div className="reservation-box">
          {upcomingBookings.length === 0 && <p style={{ padding: "15px" }}>No upcoming reservations.</p>}
          {upcomingBookings.map((b) => (
            <div className="reservation" key={b.id}>
              <span>{b.equipmentName}</span>
              <span>{b.bookingDate}, {b.startTime}-{b.endTime}</span>
              <span className="badge bg-success rounded-pill">{b.bookingStatus}</span>
            </div>
          ))}
        </div>

        <h5 className="section-title">Recommended equipment</h5>
        <div className="equipment">
          {loading && <p>Loading equipment...</p>}
          {!loading && recommended.map((eq) => (
  <div className="equipment-card" key={eq.equipmentId}>
    <img
      src={eq.imageUrl}
      alt={eq.name}
      style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "8px", marginBottom: "10px" }}
    />
    <h6>{eq.name}</h6>
    <span className="badge bg-success rounded-pill">
      {eq.status?.toUpperCase() === "AVAILABLE" ? "Available" : eq.status}
    </span>
    <button className="btn btn-outline-dark mt-3" onClick={() => handleBookNow(eq.equipmentId)}>
      Book now
    </button>
  </div>
))}
        </div>
      </main>
    </div>
  );
}


