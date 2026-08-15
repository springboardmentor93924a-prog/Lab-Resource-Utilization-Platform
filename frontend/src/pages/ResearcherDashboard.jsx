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

  // Search
  const [searchValue, setSearchValue] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

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

  function handleSearchChange(e) {
    const value = e.target.value;

    setSearchValue(value);
    setShowSearchResults(value.trim().length > 0);
  }

  function handleSearchResultClick(path) {
    setSearchValue("");
    setShowSearchResults(false);
    navigate(path);
  }

  // Search equipment
  const matchingEquipment = equipmentList
    .filter((equipment) => {
      const search = searchValue.toLowerCase().trim();

      return (
        equipment.equipmentName?.toLowerCase().includes(search) ||
        equipment.category?.toLowerCase().includes(search) ||
        equipment.status?.toLowerCase().includes(search)
      );
    })
    .slice(0, 5);

  // Search user's bookings
  const matchingBookings = myBookings
    .filter((booking) => {
      const search = searchValue.toLowerCase().trim();

      return (
        booking.equipmentName?.toLowerCase().includes(search) ||
        booking.bookingDate?.toLowerCase().includes(search) ||
        booking.bookingStatus?.toLowerCase().includes(search)
      );
    })
    .slice(0, 5);

  const totalSearchResults =
    matchingEquipment.length + matchingBookings.length;

  const availableCount = equipmentList.filter(
    (e) => e.status === "AVAILABLE"
  ).length;

  const upcomingBookings = myBookings.filter(
    (b) =>
      b.bookingStatus === "PENDING" ||
      b.bookingStatus === "CONFIRMED"
  );

  const recommended = equipmentList.slice(0, 3);

  return (
    <div className="container-main">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <Sidebar />
      </aside>

      {/* MAIN CONTENT */}
      <main className="content">

        {/* TOP BAR */}
        <div className="topbar">

          <h4>Researcher dashboard</h4>

          <div className="top-right">

            {/* SEARCH */}
            <div className="dashboard-search-wrapper">

              <input
                type="text"
                placeholder="Search equipment, bookings..."
                className="form-control search"
                value={searchValue}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (searchValue.trim()) {
                    setShowSearchResults(true);
                  }
                }}
              />

              {/* SEARCH RESULTS */}
              {showSearchResults && (
                <div className="search-results">

                  {totalSearchResults === 0 && (
                    <div className="search-no-results">
                      No results found
                    </div>
                  )}

                  {/* EQUIPMENT RESULTS */}
                  {matchingEquipment.length > 0 && (
                    <>
                      <div className="search-section-title">
                        Equipment
                      </div>

                      {matchingEquipment.map((equipment) => (
                        <button
                          key={`equipment-${equipment.id}`}
                          className="search-result-item"
                          onClick={() =>
                            handleSearchResultClick("/equipment")
                          }
                        >
                          <span className="search-result-icon">
                            <i className="bi bi-box-seam"></i>
                          </span>

                          <span className="search-result-content">
                            <strong>
                              {equipment.equipmentName}
                            </strong>

                            <small>
                              {equipment.category || "Equipment"} •{" "}
                              {equipment.status || "Unknown status"}
                            </small>
                          </span>
                        </button>
                      ))}
                    </>
                  )}

                  {/* BOOKING RESULTS */}
                  {matchingBookings.length > 0 && (
                    <>
                      <div className="search-section-title">
                        My bookings
                      </div>

                      {matchingBookings.map((booking) => (
                        <button
                          key={`booking-${booking.id}`}
                          className="search-result-item"
                          onClick={() =>
                            handleSearchResultClick("/my-bookings")
                          }
                        >
                          <span className="search-result-icon">
                            <i className="bi bi-calendar-check"></i>
                          </span>

                          <span className="search-result-content">
                            <strong>
                              {booking.equipmentName}
                            </strong>

                            <small>
                              {booking.bookingDate} •{" "}
                              {booking.bookingStatus}
                            </small>
                          </span>
                        </button>
                      ))}
                    </>
                  )}

                </div>
              )}

            </div>

            {/* NOTIFICATION BELL */}
            <button
              className="notification-circle"
              onClick={() => navigate("/notifications")}
              title="Notifications"
              aria-label="Notifications"
            >
              <i className="bi bi-bell"></i>
            </button>

            {/* PROFILE */}
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

        {/* STATS */}
        <div className="stats">

          {/* MY BOOKINGS */}
          <div
            className="card stat blue"
            onClick={() => navigate("/my-bookings")}
            style={{ cursor: "pointer" }}
          >
            <big>
              <b>My bookings</b>
            </big>

            <h2>
              {upcomingBookings.length} upcoming
            </h2>
          </div>

          {/* AVAILABLE EQUIPMENT */}
          <div
            className="card stat green"
            onClick={() =>
              navigate("/equipment?status=AVAILABLE")
            }
            style={{ cursor: "pointer" }}
          >
            <big>
              <b>Available now</b>
            </big>

            <h2>
              {availableCount} items
            </h2>
          </div>

          {/* WAITLIST */}
          <div
            className="card stat orange"
            onClick={() => navigate("/my-waitlist")}
            style={{ cursor: "pointer" }}
          >
            <big>
              <b>Waitlisted</b>
            </big>

            <h2>0 items</h2>
          </div>

          {/* NOTIFICATIONS */}
          <div
            className="card stat gray"
            onClick={() => navigate("/notifications")}
            style={{ cursor: "pointer" }}
          >
            <big>
              <b>Notifications</b>
            </big>

            <h2>5 new</h2>
          </div>

        </div>

        {/* UPCOMING RESERVATIONS */}
        <h5 className="section-title">
          Upcoming reservations
        </h5>

        <div className="reservation-box">

          {upcomingBookings.length === 0 && (
            <p style={{ padding: "15px" }}>
              No upcoming reservations.
            </p>
          )}

          {upcomingBookings.map((b) => (
            <div
              className="reservation"
              key={b.id}
            >
              <span>{b.equipmentName}</span>

              <span>
                {b.bookingDate}, {b.startTime}-
                {b.endTime}
              </span>

              <span className="badge bg-success rounded-pill">
                {b.bookingStatus}
              </span>
            </div>
          ))}

        </div>

        {/* RECOMMENDED EQUIPMENT */}
        <h5 className="section-title">
          Recommended equipment
        </h5>

        <div className="equipment">

          {loading && (
            <p>Loading equipment...</p>
          )}

          {!loading &&
            recommended.map((eq) => (
              <div
                className="equipment-card"
                key={eq.id}
              >

                <img
                  src={eq.imageUrl}
                  alt={eq.equipmentName}
                  style={{
                    width: "100%",
                    height: "140px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "10px",
                  }}
                />

                <h6>{eq.equipmentName}</h6>

                <span className="badge bg-success rounded-pill">
                  {eq.status === "AVAILABLE"
                    ? "Available"
                    : eq.status}
                </span>

                <button
                  className="btn btn-outline-dark mt-3"
                  onClick={() =>
                    handleBookNow(eq.id)
                  }
                >
                  Book now
                </button>

              </div>
            ))}

        </div>

      </main>
    </div>
  );
}