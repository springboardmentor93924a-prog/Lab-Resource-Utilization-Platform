import React, { useState } from 'react';
import axios from 'axios';

export default function BookingAvailability() {
  const [equipmentId, setEquipmentId] = useState('');
  const [date, setDate] = useState('');
  const [isAvailable, setIsAvailable] = useState(null);

  const checkAvailability = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`http://localhost:8080/api/bookings/availability?equipmentId=${equipmentId}&date=${date}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      setIsAvailable(res.data.isAvailable);
    } catch (error) {
      alert('Error checking availability.');
    }
  };

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', maxWidth: '400px' }}>
      <h3>Check Equipment Availability</h3>
      <form onSubmit={checkAvailability}>
        <div style={{ marginBottom: '10px' }}>
          <label>Equipment ID:</label><br />
          <input type="number" value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Date:</label><br />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <button type="submit" style={{ background: '#6c757d', color: '#fff', padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Check</button>
      </form>

      {isAvailable !== null && (
        <div style={{ marginTop: '15px', padding: '10px', background: isAvailable ? '#d4edda' : '#f8d7da', color: isAvailable ? '#155724' : '#721c24', borderRadius: '4px' }}>
          {isAvailable ? '✅ Equipment is available on this date!' : '❌ Equipment is already booked/unavailable.'}
        </div>
      )}
    </div>
  );
}