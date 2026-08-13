import { useState } from "react";
import "./ExternalBooking.css";

function ExternalBooking() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const [bookings, setBookings] = useState([]);

  const equipment = [
    {
      id: "EQ001",
      name: "Oscilloscope",
      category: "Electronics",
      institution: "Mysuru Research Institute",
      department: "ECE",
      location: "Lab 101",
      status: "Available",
      description: "Digital oscilloscope available for research and academic use.",
    },
    {
      id: "EQ002",
      name: "Digital Multimeter",
      category: "Electronics",
      institution: "Mysuru Research Institute",
      department: "ECE",
      location: "Lab 102",
      status: "Available",
      description: "Precision digital multimeter for laboratory measurements.",
    },
    {
      id: "EQ003",
      name: "3D Printer",
      category: "Manufacturing",
      institution: "National Engineering College",
      department: "Mechanical",
      location: "Lab 201",
      status: "Booked",
      description: "Professional 3D printer available through resource sharing.",
    },
    {
      id: "EQ004",
      name: "CNC Machine",
      category: "Manufacturing",
      institution: "Mysuru Research Institute",
      department: "Mechanical",
      location: "Workshop",
      status: "Maintenance",
      description: "CNC machine currently undergoing scheduled maintenance.",
    },
    {
      id: "EQ005",
      name: "Spectrometer",
      category: "Optical",
      institution: "Central Science University",
      department: "Physics",
      location: "Lab 301",
      status: "Available",
      description: "Optical spectrometer available for external researchers.",
    },
  ];

  const categories = [
    "All",
    ...new Set(equipment.map((item) => item.category)),
  ];

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.institution.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || item.category === category;

    return matchesSearch && matchesCategory;
  });

  const handleBooking = (bookingDetails) => {
    const newBooking = {
      id: `BK00${bookings.length + 1}`,
      equipment: selectedEquipment.name,
      date: bookingDetails.date,
      startTime: bookingDetails.startTime,
      endTime: bookingDetails.endTime,
      status: "Pending Approval",
    };

    setBookings([...bookings, newBooking]);
    setSelectedEquipment(null);
  };

  return (
    <div className="external-booking-page">

      {/* HEADER */}

      <div className="external-booking-header">
        <div>
          <h1>External Equipment Booking</h1>

          <p>
            Find and book laboratory equipment shared by
            partner institutions.
          </p>
        </div>

        <div className="booking-info-badge">
          External Access
        </div>
      </div>


      {/* QUICK STATS */}

      <div className="booking-stats">

        <div className="booking-stat-card">
          <div className="booking-stat-icon blue">
            ▣
          </div>

          <div>
            <span>Available Equipment</span>
            <strong>
              {
                equipment.filter(
                  (item) => item.status === "Available"
                ).length
              }
            </strong>
          </div>
        </div>


        <div className="booking-stat-card">
          <div className="booking-stat-icon purple">
            ⇄
          </div>

          <div>
            <span>Shared Resources</span>
            <strong>{equipment.length}</strong>
          </div>
        </div>


        <div className="booking-stat-card">
          <div className="booking-stat-icon orange">
            ◷
          </div>

          <div>
            <span>My Bookings</span>
            <strong>{bookings.length}</strong>
          </div>
        </div>

      </div>


      {/* SEARCH */}

      <div className="booking-search-card">

        <div className="booking-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search equipment or institution..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>


        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "All"
                ? "All Categories"
                : item}
            </option>
          ))}
        </select>

      </div>


      {/* EQUIPMENT */}

      <div className="external-equipment-section">

        <div className="external-section-heading">
          <div>
            <h2>Available Resources</h2>

            <p>
              Equipment available through institutional
              resource sharing.
            </p>
          </div>

          <span>
            {filteredEquipment.length} resources
          </span>
        </div>


        <div className="external-equipment-grid">

          {filteredEquipment.map((item) => (

            <EquipmentCard
              key={item.id}
              equipment={item}
              onBook={() => setSelectedEquipment(item)}
            />

          ))}

        </div>

        {filteredEquipment.length === 0 && (
          <div className="no-equipment">
            <div>⌕</div>

            <h3>No equipment found</h3>

            <p>
              Try changing your search or category filter.
            </p>
          </div>
        )}

      </div>


      {/* MY BOOKINGS */}

      <div className="my-bookings-card">

        <div className="my-bookings-header">
          <div>
            <h2>My External Bookings</h2>

            <p>
              Track your equipment access requests.
            </p>
          </div>
        </div>


        {bookings.length === 0 ? (

          <div className="empty-bookings">
            <div>◷</div>

            <h3>No external bookings yet</h3>

            <p>
              Select available equipment above to create
              your first booking.
            </p>
          </div>

        ) : (

          <div className="booking-list">

            {bookings.map((booking) => (

              <div
                className="booking-list-row"
                key={booking.id}
              >

                <div>
                  <strong>{booking.equipment}</strong>

                  <small>{booking.id}</small>
                </div>

                <span>{booking.date}</span>

                <span>
                  {booking.startTime} - {booking.endTime}
                </span>

                <span className="pending-status">
                  ● {booking.status}
                </span>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* BOOKING MODAL */}

      {selectedEquipment && (
        <BookingModal
          equipment={selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
          onBook={handleBooking}
        />
      )}

    </div>
  );
}


/* =====================================
   EQUIPMENT CARD
===================================== */

function EquipmentCard({ equipment, onBook }) {

  const isAvailable = equipment.status === "Available";

  return (
    <div className="external-equipment-card">

      <div className="equipment-card-top">

        <div className="external-equipment-icon">
          {equipment.name.charAt(0)}
        </div>

        <span
          className={`equipment-status ${
            equipment.status
              .toLowerCase()
              .replace(" ", "-")
          }`}
        >
          <span></span>
          {equipment.status}
        </span>

      </div>


      <div className="external-equipment-content">

        <h3>{equipment.name}</h3>

        <span className="equipment-category">
          {equipment.category}
        </span>

        <p>
          {equipment.description}
        </p>


        <div className="equipment-details">

          <div>
            <small>Institution</small>
            <strong>{equipment.institution}</strong>
          </div>

          <div>
            <small>Department</small>
            <strong>{equipment.department}</strong>
          </div>

          <div>
            <small>Location</small>
            <strong>{equipment.location}</strong>
          </div>

        </div>

      </div>


      <div className="equipment-card-footer">

        <button
          className={
            isAvailable
              ? "book-equipment-button"
              : "disabled-book-button"
          }
          disabled={!isAvailable}
          onClick={onBook}
        >
          {isAvailable
            ? "Book Equipment"
            : equipment.status === "Booked"
            ? "Currently Booked"
            : "Under Maintenance"}
        </button>

      </div>

    </div>
  );
}


/* =====================================
   BOOKING MODAL
===================================== */

function BookingModal({
  equipment,
  onClose,
  onBook,
}) {

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const submitBooking = (e) => {
    e.preventDefault();

    if (!date || !startTime || !endTime) {
      return;
    }

    onBook({
      date,
      startTime,
      endTime,
    });
  };

  return (
    <div className="booking-modal-overlay">

      <div className="booking-modal">

        <div className="booking-modal-header">

          <div>
            <h2>Book Equipment</h2>

            <p>
              Request access to {equipment.name}
            </p>
          </div>

          <button
            className="booking-close"
            onClick={onClose}
          >
            ×
          </button>

        </div>


        <div className="selected-equipment">

          <div className="selected-equipment-icon">
            {equipment.name.charAt(0)}
          </div>

          <div>
            <strong>{equipment.name}</strong>

            <span>
              {equipment.institution}
            </span>
          </div>

        </div>


        <form onSubmit={submitBooking}>

          <div className="booking-form-group">

            <label>Booking Date</label>

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
              required
            />

          </div>


          <div className="booking-time-row">

            <div className="booking-form-group">

              <label>Start Time</label>

              <input
                type="time"
                value={startTime}
                onChange={(e) =>
                  setStartTime(e.target.value)
                }
                required
              />

            </div>


            <div className="booking-form-group">

              <label>End Time</label>

              <input
                type="time"
                value={endTime}
                onChange={(e) =>
                  setEndTime(e.target.value)
                }
                required
              />

            </div>

          </div>


          <div className="booking-note">
            <strong>Note</strong>

            <p>
              This booking will be sent for approval.
              Access will be available after approval.
            </p>
          </div>


          <div className="booking-modal-actions">

            <button
              type="button"
              className="cancel-booking"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="confirm-booking"
            >
              Request Booking
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


export default ExternalBooking;