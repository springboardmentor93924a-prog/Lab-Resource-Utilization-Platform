import { useEffect, useState } from "react";
import "./Reports.css"; 

function Reports() {
  const [equipment, setEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8080/api/equipment", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setEquipment(data))
      .catch((error) => console.error("Equipment error:", error));

    fetch("http://localhost:8080/api/bookings", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setBookings(data))
      .catch((error) => console.error("Booking error:", error));

    fetch("http://localhost:8080/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("User error:", error));
  }, []);

  const available = equipment.filter(
    (item) => item.status === "Available"
  ).length;

  // Backend sets "Booked" instead of "Reserved"
  const reserved = equipment.filter(
    (item) => item.status === "Booked" || item.status === "Reserved"
  ).length;

  // Backend sets "Under Maintenance" instead of "Maintenance"
  const maintenance = equipment.filter(
    (item) => item.status === "Under Maintenance" || item.status === "Maintenance"
  ).length;

  const confirmedBookings = bookings.filter(
    (booking) => booking.bookingStatus === "Confirmed"
  ).length;

  const pendingBookings = bookings.filter(
    (booking) => booking.bookingStatus === "Pending Approval"
  ).length;

  const completedBookings = bookings.filter(
    (booking) => booking.bookingStatus === "Completed"
  ).length;

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2 className="reports-title">Lab Intelligence & Reports Dashboard</h2>
        <p className="reports-subtitle">Real-time monitoring of equipment, bookings, and system resource utilization.</p>
      </div>

      <h3 className="section-title">Equipment Summary</h3>
      <div className="section-style">
        <div className="card-style border-blue">
          <h4 className="card-title">Total Equipment</h4>
          <p className="card-value">{equipment.length}</p>
        </div>

        <div className="card-style border-green">
          <h4 className="card-title">Available</h4>
          <p className="card-value">{available}</p>
        </div>

        <div className="card-style border-yellow">
          <h4 className="card-title">Reserved</h4>
          <p className="card-value">{reserved}</p>
        </div>

        <div className="card-style border-red">
          <h4 className="card-title">Maintenance</h4>
          <p className="card-value">{maintenance}</p>
        </div>
      </div>

      <h3 className="section-title">Booking Summary</h3>
      <div className="section-style">
        <div className="card-style border-blue">
          <h4 className="card-title">Total Bookings</h4>
          <p className="card-value">{bookings.length}</p>
        </div>

        <div className="card-style border-green">
          <h4 className="card-title">Confirmed</h4>
          <p className="card-value">{confirmedBookings}</p>
        </div>

        <div className="card-style border-yellow">
          <h4 className="card-title">Pending</h4>
          <p className="card-value">{pendingBookings}</p>
        </div>

        <div className="card-style border-indigo">
          <h4 className="card-title">Completed</h4>
          <p className="card-value">{completedBookings}</p>
        </div>
      </div>

      <h3 className="section-title">User Summary</h3>
      <div className="section-style">
        <div className="card-style border-purple">
          <h4 className="card-title">Total Users</h4>
          <p className="card-value">{users.length}</p>
        </div>
      </div>
    </div>
  );
}

export default Reports;