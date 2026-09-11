import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function BookingApproval() {
  const [pendingBookings, setPendingBookings] = useState([]);

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/pending`, {
        headers: { "Authorization": `Bearer ${sessionStorage.getItem("token")}` }
      });
      setPendingBookings(res.data);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${id}/status?status=${status}`, {}, {
        headers: { "Authorization": `Bearer ${sessionStorage.getItem("token")}` }
      });
      fetchPendingBookings();
      alert(`Booking ${status.toLowerCase()} successfully!`);
    } catch (error) {
      alert('Failed to update booking status.');
    }
  };

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
      <h3>Manage Booking Approvals</h3>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ background: '#f8f9fa' }}>
            <th>ID</th>
            <th>Equipment ID</th>
            <th>Booking Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingBookings.length > 0 ? (
            pendingBookings.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.equipmentId}</td>
                <td>{b.bookingDate}</td>
                <td>
                  <button onClick={() => updateBookingStatus(b.id, 'APPROVED')} style={{ background: '#28a745', color: '#fff', border: 'none', padding: '5px 10px', marginRight: '5px', cursor: 'pointer', borderRadius: '4px' }}>Approve</button>
                  <button onClick={() => updateBookingStatus(b.id, 'REJECTED')} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Reject</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4" style={{ textAlign: 'center' }}>No pending booking approvals.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}