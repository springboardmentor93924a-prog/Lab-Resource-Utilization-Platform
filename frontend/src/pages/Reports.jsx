import { useEffect, useState } from "react";

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

  const reserved = equipment.filter(
    (item) => item.status === "Reserved"
  ).length;

  const maintenance = equipment.filter(
    (item) => item.status === "Maintenance"
  ).length;


  const confirmedBookings = bookings.filter(
    (booking) => booking.bookingStatus === "Confirmed"
  ).length;

  const pendingBookings = bookings.filter(
    (booking) => booking.bookingStatus === "Pending"
  ).length;

  const completedBookings = bookings.filter(
    (booking) => booking.bookingStatus === "Completed"
  ).length;


  return (
    <div style={{ padding: "20px" }}>

      <h2>Reports</h2>


      <h3>Equipment Summary</h3>

      <div style={sectionStyle}>

        <div style={cardStyle}>
          <h4>Total Equipment</h4>
          <p>{equipment.length}</p>
        </div>

        <div style={cardStyle}>
          <h4>Available</h4>
          <p>{available}</p>
        </div>

        <div style={cardStyle}>
          <h4>Reserved</h4>
          <p>{reserved}</p>
        </div>

        <div style={cardStyle}>
          <h4>Maintenance</h4>
          <p>{maintenance}</p>
        </div>

      </div>


      <h3>Booking Summary</h3>

      <div style={sectionStyle}>

        <div style={cardStyle}>
          <h4>Total Bookings</h4>
          <p>{bookings.length}</p>
        </div>

        <div style={cardStyle}>
          <h4>Confirmed</h4>
          <p>{confirmedBookings}</p>
        </div>

        <div style={cardStyle}>
          <h4>Pending</h4>
          <p>{pendingBookings}</p>
        </div>

        <div style={cardStyle}>
          <h4>Completed</h4>
          <p>{completedBookings}</p>
        </div>

      </div>


      <h3>User Summary</h3>

      <div style={sectionStyle}>

        <div style={cardStyle}>
          <h4>Total Users</h4>
          <p>{users.length}</p>
        </div>

      </div>

    </div>
  );
}


const sectionStyle = {
  display: "flex",
  gap: "20px",
  flexWrap: "wrap",
  marginBottom: "30px",
};


const cardStyle = {
  background: "white",
  padding: "20px",
  minWidth: "160px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};


export default Reports;
