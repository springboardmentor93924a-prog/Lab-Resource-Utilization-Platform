 import { useState, useEffect } from "react";
import axios from "axios";
import "./Reservations.css";

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  
  const userRole = localStorage.getItem("role");

  // Fetch data inside useEffect to avoid declaration order errors
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/api/reservations", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReservations(response.data);
      } catch (error) {
        console.error("Failed to fetch reservations", error);
      }
    };

    const fetchEquipment = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/api/equipment", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEquipmentList(response.data);
      } catch (error) {
        console.error("Failed to fetch equipment list", error);
      }
    };

    fetchReservations();
    fetchEquipment();
  }, []);

  // Handle booking submission for students
  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8080/api/reservations",
        {
          equipmentId: selectedEquipment,
          date: bookingDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert("Reservation request submitted successfully!");
      setSelectedEquipment("");
      setBookingDate("");
      window.location.reload(); // Refresh to update list
    } catch (error) {
      console.error("Failed to create reservation", error);
      alert("Error submitting reservation");
    }
  };

  // Handle status update (Approve/Reject) for admin
  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/api/reservations/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert(`Reservation ${status.toLowerCase()} successfully!`);
      window.location.reload(); // Refresh to update list
    } catch (error) {
      console.error("Failed to update reservation status", error);
    }
  };

  return (
    <div className="container">
      <h2>Reservation Management</h2>

      {/* Show booking form only for students */}
      {userRole === "ROLE_STUDENT" && (
        <form className="booking-form" onSubmit={handleBooking}>
          <h3>Book Equipment</h3>
          <div className="form-group">
            <label>Select Equipment:</label>
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              required
            >
              <option value="">-- Choose Equipment --</option>
              {equipmentList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.category})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Booking Date:</label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Submit Reservation
          </button>
        </form>
      )}

      {/* Reservations Table for both Admin and Students */}
      <div className="table-container">
        <h3>All Reservations</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Equipment</th>
              <th>User</th>
              <th>Date</th>
              <th>Status</th>
              {userRole === "ROLE_ADMIN" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {reservations.map((res) => (
              <tr key={res.id}>
                <td>{res.id}</td>
                <td>{res.equipmentName || res.equipment?.name}</td>
                <td>{res.username || res.user?.username}</td>
                <td>{res.date}</td>
                <td>
                  <span className={`status ${res.status?.toLowerCase()}`}>
                    {res.status}
                  </span>
                </td>
                {userRole === "ROLE_ADMIN" && (
                  <td>
                    {res.status === "PENDING" && (
                      <>
                        <button
                          className="approve-btn"
                          onClick={() => handleStatusUpdate(res.id, "APPROVED")}
                        >
                          Approve
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleStatusUpdate(res.id, "REJECTED")}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}