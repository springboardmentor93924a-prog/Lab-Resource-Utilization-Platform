import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./ResearcherDashboard.css";
import { getAllEquipment } from "../services/equipmentService";
import { getBookingsByUser } from "../services/bookingService";
import { getCurrentUserId } from "../utils/auth";

export default function ResearcherDashboard() {
  const navigate = useNavigate();
  const [equipmentList, setEquipmentList] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const equipment = await getAllEquipment();
        setEquipmentList(equipment);

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

  const availableCount = equipmentList.filter((e) => e.status === "AVAILABLE").length;
  const upcomingBookings = myBookings.filter(
    (b) => b.bookingStatus === "PENDING" || b.bookingStatus === "CONFIRMED"
  );
  const recommended = equipmentList.slice(0, 3);

  return (
    <div className="container-main">
      <aside className="sidebar">
        <Sidebar />
      </aside>

      <main className="content">
        <div className="topbar">
          <h4>Researcher dashboard</h4>
          <div className="top-right">
            <input type="text" placeholder="Search..." className="form-control search" />
            <div className="profile"></div>
          </div>
        </div>

        <div className="stats">
          <div className="card stat blue">
            <small>My bookings</small>
            <h2>{upcomingBookings.length} upcoming</h2>
          </div>
          <div className="card stat green">
            <small>Available now</small>
            <h2>{availableCount} items</h2>
          </div>
          <div className="card stat orange">
            <small>Waitlisted</small>
            <h2>0 items</h2>
          </div>
          <div className="card stat gray">
            <small>Notifications</small>
            <h2>5 new</h2>
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
  <div className="equipment-card" key={eq.id}>
    <img
      src={eq.imageUrl}
      alt={eq.equipmentName}
      style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "8px", marginBottom: "10px" }}
    />
    <h6>{eq.equipmentName}</h6>
    <span className="badge bg-success rounded-pill">
      {eq.status === "AVAILABLE" ? "Available" : eq.status}
    </span>
    <button className="btn btn-outline-dark mt-3" onClick={() => handleBookNow(eq.id)}>
      Book now
    </button>
  </div>
))}
        </div>
      </main>
    </div>
  );
}