import React, { useState } from 'react';
import axios from 'axios';

export default function BookingStatus() {
  const [bookingId, setBookingId] = useState('');
  const [statusData, setStatusData] = useState(null);

  const checkStatus = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${bookingId}`, {
        headers: { "Authorization": `Bearer ${sessionStorage.getItem("token")}` }
      });
      setStatusData(res.data);
    } catch (error) {
      alert('Booking not found or error fetching status.');
      setStatusData(null);
    }
  };

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px', maxWidth: '400px' }}>
      <h3>Check Booking Status</h3>
      <form onSubmit={checkStatus}>
        <div style={{ marginBottom: '10px' }}>
          <label>Booking ID:</label><br />
          <input type="number" value={bookingId} onChange={(e) => setBookingId(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <button type="submit" style={{ background: '#17a2b8', color: '#fff', padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Check Status</button>
      </form>

      {statusData && (
        <div style={{ marginTop: '15px', padding: '10px', background: '#e9ecef', borderRadius: '4px' }}>
          <p><strong>ID:</strong> {statusData.id}</p>
          <p><strong>Equipment ID:</strong> {statusData.equipmentId}</p>
          <p><strong>Date:</strong> {statusData.bookingDate}</p>
          <p><strong>Status:</strong> <span style={{ color: statusData.status === 'APPROVED' ? 'green' : 'orange' }}>{statusData.status}</span></p>
        </div>
      )}
    </div>
  );
}