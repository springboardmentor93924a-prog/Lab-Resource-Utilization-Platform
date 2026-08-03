import Sidebar from "../components/Sidebar";
import "../styles/mybookings.css";

function MyBookings() {
  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-content">

        <div className="booking-header">
          <h1>My Bookings</h1>
          <p>View and manage all your laboratory reservations.</p>
        </div>

        <div className="booking-table">

          <table>

            <thead>
              <tr>
                <th>Laboratory</th>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>AI Laboratory</td>
                <td>02 Aug 2026</td>
                <td>09:00 AM - 11:00 AM</td>
                <td className="approved">Approved</td>
                <td>-</td>
              </tr>

              <tr>
                <td>Cloud Computing Lab</td>
                <td>03 Aug 2026</td>
                <td>01:00 PM - 03:00 PM</td>
                <td className="pending">Pending</td>
                <td>
                  <button className="cancel-btn">
                    Cancel
                  </button>
                </td>
              </tr>

              <tr>
                <td>IoT Laboratory</td>
                <td>05 Aug 2026</td>
                <td>10:00 AM - 12:00 PM</td>
                <td className="rejected">Rejected</td>
                <td>-</td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default MyBookings;