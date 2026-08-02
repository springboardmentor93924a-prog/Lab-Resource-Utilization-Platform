import "./Reservations.css";

function Reservations() {
  const reservations = [
    {
      id: 1,
      equipment: "Projector",
      user: "Admin User",
      date: "2026-08-02",
      startTime: "10:00 AM",
      endTime: "12:00 PM",
      status: "Confirmed",
    },
    {
      id: 2,
      equipment: "Arduino Uno",
      user: "Lab Manager",
      date: "2026-08-03",
      startTime: "02:00 PM",
      endTime: "04:00 PM",
      status: "Pending",
    },
    {
      id: 3,
      equipment: "Laptop",
      user: "Test User",
      date: "2026-08-04",
      startTime: "09:00 AM",
      endTime: "11:00 AM",
      status: "Cancelled",
    },
  ];

  return (
    <div className="reservations-container">

      <div className="reservations-header">
        <div>
          <h2>Reservations</h2>
          <p>Manage equipment bookings and schedules</p>
        </div>

        <button className="add-reservation-btn">
          + New Reservation
        </button>
      </div>

      <div className="reservation-toolbar">
        <input
          type="text"
          className="reservation-search"
          placeholder="Search reservations..."
        />

        <select className="reservation-filter">
          <option value="">All Status</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="reservation-table-card">

        <table className="reservation-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Equipment</th>
              <th>User</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id}>

                <td>{reservation.id}</td>

                <td className="equipment-name">
                  {reservation.equipment}
                </td>

                <td>{reservation.user}</td>

                <td>{reservation.date}</td>

                <td>{reservation.startTime}</td>

                <td>{reservation.endTime}</td>

                <td>
                  <span
                    className={`reservation-status ${reservation.status.toLowerCase()}`}
                  >
                    ● {reservation.status}
                  </span>
                </td>

                <td>
                  <button className="edit-reservation-btn">
                    Edit
                  </button>

                  <button className="cancel-reservation-btn">
                    Cancel
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

      <div className="reservation-footer">
        Showing {reservations.length} reservations
      </div>

    </div>
  );
}

export default Reservations;