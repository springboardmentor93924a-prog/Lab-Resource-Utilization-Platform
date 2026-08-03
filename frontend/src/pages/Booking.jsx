import "../styles/booking.css";

function Booking() {
  return (
    <div className="booking-page">

      <div className="booking-card">

        <h1>Book Laboratory</h1>
        <p>Reserve your preferred laboratory and time slot.</p>

        <form className="booking-form">

          <div className="input-group">
            <label>Student Name</label>
            <input
              type="text"
              placeholder="Enter your name"
            />
          </div>

          <div className="input-group">
            <label>Register Number</label>
            <input
              type="text"
              placeholder="Enter register number"
            />
          </div>

          <div className="input-group">
            <label>Select Laboratory</label>

            <select>
              <option>AI Laboratory</option>
              <option>Cloud Computing Lab</option>
              <option>Networking Laboratory</option>
              <option>IoT Laboratory</option>
            </select>

          </div>

          <div className="input-group">
            <label>Date</label>
            <input type="date" />
          </div>

          <div className="input-group">
            <label>Time Slot</label>

            <select>
              <option>09:00 AM - 11:00 AM</option>
              <option>11:00 AM - 01:00 PM</option>
              <option>01:00 PM - 03:00 PM</option>
              <option>03:00 PM - 05:00 PM</option>
            </select>

          </div>

          <div className="input-group">
            <label>Purpose</label>

            <textarea
              rows="4"
              placeholder="Enter purpose of booking"
            ></textarea>

          </div>

          <button className="booking-btn">
            Confirm Booking
          </button>

        </form>

      </div>

    </div>
  );
}

export default Booking;