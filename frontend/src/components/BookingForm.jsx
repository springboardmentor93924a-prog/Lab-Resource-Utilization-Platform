import React, { useState } from 'react';
import axios from 'axios';

export default function BookingForm({ onSuccess }) {
  const [equipmentId, setEquipmentId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/bookings', {
        equipmentId: parseInt(equipmentId),
        bookingDate,
        status: 'PENDING'
      }, {
        headers: { "Authorization": `Bearer ${sessionStorage.getItem("token")}` }
      });
      alert('Equipment booked successfully! Pending approval.');
      setEquipmentId('');
      setBookingDate('');
      if (onSuccess) onSuccess();
    } catch (error) {
      alert('Booking failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px', maxWidth: '400px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <h3>Create Equipment Booking</h3>
      <form onSubmit={handleBooking}>
        <div style={{ marginBottom: '10px' }}>
          <label>Equipment ID:</label><br />
          <input type="number" value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Booking Date:</label><br />
          <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <button type="submit" disabled={loading} style={{ background: '#007bff', color: '#fff', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Submitting...' : 'Submit Booking'}
        </button>
      </form>
    </div>
  );
}