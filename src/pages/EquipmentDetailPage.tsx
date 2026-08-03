import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { fetchEquipment, createBooking, fetchBookings } from '../services/platformData';
import type { EquipmentItem, BookingItem } from '../services/platformData';

export default function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [equipment, setEquipment] = useState<EquipmentItem | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [purpose, setPurpose] = useState('');

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const [equipmentData, bookingsData] = await Promise.all([fetchEquipment(), fetchBookings()]);
        if (!active) return;
        setEquipment(equipmentData.find((item) => item.id === id) ?? null);
        setBookings(bookingsData.filter((booking) => booking.resourceId === id));
      } catch (err) {
        if (active) setMessage(err instanceof Error ? err.message : 'Unable to load equipment details.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  const occupied = useMemo(() => (
    bookings.map((booking) => `${booking.date} ${booking.startTime}-${booking.endTime}`)
  ), [bookings]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!equipment) return;

    try {
      await createBooking({
        resourceId: equipment.id,
        requester: 'Registered User',
        requesterRole: 'Researcher',
        department: equipment.department,
        date: new Date().toISOString().slice(0, 10),
        startTime,
        endTime,
        notes: purpose,
      });
      setMessage('Booking request submitted.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to submit booking.');
    }
  };

  if (loading) return <div className="page-grid"><div className="panel-card"><h2>Loading equipment details…</h2></div></div>;
  if (!equipment) return <div className="page-grid"><div className="panel-card"><h2>Equipment not found</h2></div></div>;

  return (
    <div className="page-grid equipment-detail-grid">
      <div className="panel-card detail-panel">
        <h2>{equipment.name}</h2>
        <p>{equipment.department} • {equipment.location}</p>
        <div className="spec-list">
          <div><strong>Asset Tag</strong><span>{equipment.id}</span></div>
          <div><strong>Serial Number</strong><span>{`SN-${equipment.id.toUpperCase()}-2026`}</span></div>
          <div><strong>Department</strong><span>{equipment.department}</span></div>
          <div><strong>Calibration due</strong><span>{equipment.calibrationDue}</span></div>
          <div><strong>User manual</strong><a className="ghost-btn" href="#">Download</a></div>
        </div>

        <div className="calendar-placeholder">
          <div>
            <strong>Booking calendar</strong>
            <p>Available slots are open. Occupied slots are shown in gray.</p>
          </div>
        </div>
      </div>

      <div className="panel-card booking-panel">
        <h3>Submit booking request</h3>
        <p className="muted-text">Occupied slots: {occupied.length ? occupied.join(', ') : 'None yet'}</p>
        {message && <div className="success-pill">{message}</div>}
        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Start time</span>
            <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} required />
          </label>
          <label className="field">
            <span>End time</span>
            <input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} required />
          </label>
          <label className="field">
            <span>Purpose</span>
            <textarea rows={3} value={purpose} onChange={(event) => setPurpose(event.target.value)} placeholder="Describe the booking purpose" required />
          </label>
          <button className="primary-btn" type="submit">Submit Booking Request</button>
        </form>
      </div>
    </div>
  );
}
