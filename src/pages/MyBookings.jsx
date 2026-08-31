import { useState } from "react";
import "./MyBookings.css";

function MyBookings({ showToast }) {
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [bookings, setBookings] = useState([
    {
      id: "BK001",
      equipment: "Oscilloscope",
      equipmentId: "EQ001",
      category: "Electronics",
      department: "ECE",
      location: "Lab 101",
      date: "12 Aug 2026",
      startTime: "10:00 AM",
      endTime: "12:00 PM",
      status: "Confirmed",
    },
    {
      id: "BK002",
      equipment: "Digital Multimeter",
      equipmentId: "EQ002",
      category: "Electronics",
      department: "ECE",
      location: "Lab 102",
      date: "13 Aug 2026",
      startTime: "02:00 PM",
      endTime: "03:00 PM",
      status: "Pending Approval",
    },
    {
      id: "BK003",
      equipment: "Spectrometer",
      equipmentId: "EQ005",
      category: "Optical",
      department: "Physics",
      location: "Lab 301",
      date: "08 Aug 2026",
      startTime: "09:00 AM",
      endTime: "11:00 AM",
      status: "Completed",
    },
    {
      id: "BK004",
      equipment: "3D Printer",
      equipmentId: "EQ003",
      category: "Manufacturing",
      department: "Mechanical",
      location: "Lab 201",
      date: "05 Aug 2026",
      startTime: "11:00 AM",
      endTime: "01:00 PM",
      status: "Completed",
    },
    {
      id: "BK005",
      equipment: "CNC Machine",
      equipmentId: "EQ004",
      category: "Manufacturing",
      department: "Mechanical",
      location: "Workshop",
      date: "02 Aug 2026",
      startTime: "03:00 PM",
      endTime: "05:00 PM",
      status: "Cancelled",
    },
  ]);

  const confirmed = bookings.filter(
    (item) => item.status === "Confirmed"
  ).length;

  const pending = bookings.filter(
    (item) => item.status === "Pending Approval"
  ).length;

  const completed = bookings.filter(
    (item) => item.status === "Completed"
  ).length;

  const cancelled = bookings.filter(
    (item) => item.status === "Cancelled"
  ).length;

  const filteredBookings =
    selectedStatus === "All"
      ? bookings
      : bookings.filter((item) => item.status === selectedStatus);

  const cancelBooking = (id, equipmentName) => {
    setBookings((previousBookings) =>
      previousBookings.map((booking) =>
        booking.id === id ? { ...booking, status: "Cancelled" } : booking
      )
    );

    if (showToast) {
      showToast(`Booking ${id} for ${equipmentName} has been cancelled.`, "info");
    }
  };

  const handleViewDetails = (booking) => {
    if (showToast) {
      showToast(`Showing details for ${booking.equipment} (${booking.id})`, "info");
    }
  };

  const handleNewBookingClick = () => {
    if (showToast) {
      showToast("Redirecting to equipment booking page...", "info");
    }
  };

  return (
    <div className="my-bookings-page">
      {/* HEADER */}
      <div className="my-bookings-top">
        <div>
          <h1>My Bookings</h1>
          <p>View and manage your laboratory equipment reservations</p>
        </div>

        <button className="new-booking-button" onClick={handleNewBookingClick}>
          + New Booking
        </button>
      </div>

      {/* SUMMARY */}
      <div className="my-booking-stats">
        <BookingStat title="Upcoming" value={confirmed} icon="◷" type="blue" />
        <BookingStat
          title="Pending Approval"
          value={pending}
          icon="◌"
          type="orange"
        />
        <BookingStat title="Completed" value={completed} icon="✓" type="green" />
        <BookingStat title="Cancelled" value={cancelled} icon="×" type="gray" />
      </div>

      {/* BOOKINGS SECTION */}
      <div className="my-bookings-container">
        <div className="my-bookings-section-header">
          <div>
            <h2>My Reservations</h2>
            <p>Your equipment booking history and upcoming reservations</p>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">All Bookings</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* BOOKING LIST */}
        <div className="researcher-booking-list">
          {filteredBookings.length === 0 ? (
            <div className="no-my-bookings">
              <div className="no-booking-icon">◷</div>
              <h3>No bookings found</h3>
              <p>You don't have any bookings with this status.</p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={cancelBooking}
                onViewDetails={handleViewDetails}
              />
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="my-bookings-footer">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </div>
      </div>
    </div>
  );
}

/* =========================================
   BOOKING STAT
========================================= */

function BookingStat({ title, value, icon, type }) {
  return (
    <div className="my-booking-stat-card">
      <div className={`my-booking-stat-icon ${type}`}>{icon}</div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

/* =========================================
   BOOKING CARD
========================================= */

function BookingCard({ booking, onCancel, onViewDetails }) {
  const canCancel =
    booking.status === "Confirmed" || booking.status === "Pending Approval";

  return (
    <div className="researcher-booking-card">
      {/* LEFT */}
      <div className="researcher-booking-main">
        <div className="researcher-equipment-icon">
          {booking.equipment.charAt(0)}
        </div>

        <div className="researcher-equipment-info">
          <div className="researcher-equipment-title">
            <h3>{booking.equipment}</h3>
            <StatusBadge status={booking.status} />
          </div>

          <p>
            {booking.equipmentId} • {booking.category}
          </p>

          <div className="researcher-booking-details">
            <span>
              <strong>Department</strong>
              {booking.department}
            </span>

            <span>
              <strong>Location</strong>
              {booking.location}
            </span>
          </div>
        </div>
      </div>

      {/* DATE/TIME */}
      <div className="researcher-booking-date">
        <span className="detail-label">DATE</span>
        <strong>{booking.date}</strong>
        <span>
          {booking.startTime} - {booking.endTime}
        </span>
      </div>

      {/* ACTIONS */}
      <div className="researcher-booking-actions">
        <button
          className="view-booking-button"
          onClick={() => onViewDetails(booking)}
        >
          View Details
        </button>

        {canCancel && (
          <button
            className="cancel-booking-button"
            onClick={() => onCancel(booking.id, booking.equipment)}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================
   STATUS BADGE
========================================= */

function StatusBadge({ status }) {
  let type = "confirmed";

  if (status === "Pending Approval") {
    type = "pending";
  }

  if (status === "Completed") {
    type = "completed";
  }

  if (status === "Cancelled") {
    type = "cancelled";
  }

  return (
    <span className={`researcher-status ${type}`}>
      <span></span>
      {status}
    </span>
  );
}

export default MyBookings;