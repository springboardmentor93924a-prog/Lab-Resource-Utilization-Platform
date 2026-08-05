import "../styles/externalbooking.css";

function ExternalBooking() {

  const equipment = [
    {
      id: 1,
      name: "Computer-01",
      lab: "AI Lab",
      available: true
    },
    {
      id: 2,
      name: "Arduino Kit",
      lab: "IoT Lab",
      available: false
    },
    {
      id: 3,
      name: "Projector",
      lab: "Cloud Lab",
      available: true
    },
    {
      id: 4,
      name: "3D Printer",
      lab: "Innovation Lab",
      available: true
    }
  ];

  const bookings = [
    {
      institution: "ABC Engineering College",
      equipment: "Computer-01",
      date: "05 Aug 2026",
      status: "Pending"
    },
    {
      institution: "XYZ University",
      equipment: "Arduino Kit",
      date: "04 Aug 2026",
      status: "Approved"
    },
    {
      institution: "PQR Institute",
      equipment: "Projector",
      date: "02 Aug 2026",
      status: "Rejected"
    },
    {
      institution: "LMN College",
      equipment: "3D Printer",
      date: "01 Aug 2026",
      status: "Completed"
    }
  ];

  return (

    <div className="external-booking">

      <h1>External Booking & Access Management</h1>

      <p>
        External institutions can request available laboratory equipment.
      </p>

      {/* Search & Filter */}

      <div className="booking-search">

        <input
          type="text"
          placeholder="Search Equipment..."
        />

        <select>
          <option>All Laboratories</option>
          <option>AI Lab</option>
          <option>Cloud Lab</option>
          <option>IoT Lab</option>
          <option>Innovation Lab</option>
        </select>

      </div>

      {/* Booking Form */}

      <h2>Request Equipment Booking</h2>

      <div className="booking-form">

        <input
          type="text"
          placeholder="Institution Name"
        />

        <input
          type="text"
          placeholder="Contact Person"
        />

        <select>

          <option>Select Equipment</option>
          <option>Computer-01</option>
          <option>Arduino Kit</option>
          <option>Projector</option>
          <option>3D Printer</option>

        </select>

        <input type="date" />

        <textarea
          rows="4"
          placeholder="Purpose of Booking"
        ></textarea>

        <button>
          Submit Request
        </button>

      </div>

      {/* Available Equipment */}

      <h2>Available Equipment</h2>

      <div className="equipment-grid">

        {equipment.map((item) => (

          <div
            className="equipment-card"
            key={item.id}
          >

            <h3>{item.name}</h3>

            <p>{item.lab}</p>

            <span
              className={item.available ? "available" : "busy"}
            >
              {item.available ? "Available" : "Already Booked"}
            </span>

            <button disabled={!item.available}>
              {item.available ? "Book Equipment" : "Unavailable"}
            </button>

          </div>

        ))}

      </div>

      {/* Booking Requests */}

      <h2>Booking Requests</h2>

      <table>

        <thead>

          <tr>

            <th>Institution</th>
            <th>Equipment</th>
            <th>Date</th>
            <th>Status</th>

          </tr>

        </thead>

        <tbody>

          {bookings.map((item, index) => (

            <tr key={index}>

              <td>{item.institution}</td>

              <td>{item.equipment}</td>

              <td>{item.date}</td>

              <td>

                <span
                  className={item.status.toLowerCase()}
                >
                  {item.status}
                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}

export default ExternalBooking;