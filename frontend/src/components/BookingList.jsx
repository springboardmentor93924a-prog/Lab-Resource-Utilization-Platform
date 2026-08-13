import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function BookingList() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/bookings', {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      setBookings(res.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
      <h3>All Bookings History</h3>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ background: '#f8f9fa' }}>
            <th>ID</th>
            <th>Equipment ID</th>
            <th>Booking Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length > 0 ? (
            bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.equipmentId}</td>
                <td>{b.bookingDate}</td>
                <td>
                  <span style={{ fontWeight: 'bold', color: b.status === 'APPROVED' ? 'green' : b.status === 'REJECTED' ? 'red' : 'orange' }}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4" style={{ textAlign: 'center' }}>No bookings found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}