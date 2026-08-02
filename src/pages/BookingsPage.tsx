import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createBooking, fetchBookings, fetchEquipment, updateBookingStatus } from '../services/platformData';
import { useAppSelector } from '../hooks/useAppSelector';

type BookingFormValues = {
  resourceId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
};

export default function BookingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [bookings, setBookings] = useState<Awaited<ReturnType<typeof fetchBookings>>>([]);
  const [equipment, setEquipment] = useState<Awaited<ReturnType<typeof fetchEquipment>>>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BookingFormValues>({
    defaultValues: { resourceId: '', date: '', startTime: '', endTime: '', notes: '' },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingData, equipmentData] = await Promise.all([fetchBookings(), fetchEquipment()]);
      setBookings(bookingData);
      setEquipment(equipmentData);
      setMessage(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const onSubmit = async (data: BookingFormValues) => {
    if (!user) {
      setMessage('You must be signed in to create a booking.');
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({
        resourceId: data.resourceId,
        requester: user.name,
        requesterRole: user.role,
        department: user.department,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
      });
      reset();
      await loadData();
      setMessage('Booking submitted and is awaiting approval.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecision = async (id: string, status: 'Approved' | 'Rejected' | 'Cancelled') => {
    try {
      await updateBookingStatus(id, status);
      await loadData();
      setMessage(`Booking ${status.toLowerCase()} successfully.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update booking.');
    }
  };

  return (
    <div className="page-grid">
      <div className="panel-card">
        <h2>Booking workflow</h2>
        <p>Queue approvals, manage conflicts, and review requests with clear status handling.</p>
        {message && <div className="success-pill">{message}</div>}
        <form className="form-stack" onSubmit={handleSubmit(onSubmit)}>
          <label className="field">
            <select {...register('resourceId', { required: 'Select a resource' })}>
              <option value="">Select equipment</option>
              {equipment.filter((item) => item.status !== 'Maintenance' && item.status !== 'Offline').map((item) => (
                <option key={item.id} value={item.id}>{item.name} — {item.location}</option>
              ))}
            </select>
          </label>
          {errors.resourceId && <p className="field-error">{errors.resourceId.message}</p>}
          <div className="field-row">
            <label className="field">
              <input type="date" {...register('date', { required: 'Choose a date' })} />
            </label>
            <label className="field">
              <input type="time" {...register('startTime', { required: 'Choose a start time' })} />
            </label>
            <label className="field">
              <input type="time" {...register('endTime', { required: 'Choose an end time' })} />
            </label>
          </div>
          {errors.date && <p className="field-error">{errors.date.message}</p>}
          {errors.startTime && <p className="field-error">{errors.startTime.message}</p>}
          {errors.endTime && <p className="field-error">{errors.endTime.message}</p>}
          <label className="field">
            <textarea rows={3} placeholder="Purpose or notes" {...register('notes')} />
          </label>
          <button className="primary-btn" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit booking'}</button>
        </form>
      </div>

      <div className="panel-card">
        <h3>Active bookings</h3>
        {loading ? <p>Loading bookings…</p> : (
          <div className="table-card">
            <div className="table-row"><strong>Resource</strong><strong>Schedule</strong><strong>Status</strong></div>
            {bookings.map((booking) => (
              <div className="table-row" key={booking.id}>
                <span>{booking.resourceName}</span>
                <span>{booking.date} {booking.startTime}-{booking.endTime}</span>
                <span>{booking.status}</span>
                <div className="action-row">
                  <button className="secondary-btn" onClick={() => void handleDecision(booking.id, 'Approved')}>Approve</button>
                  <button className="ghost-btn" onClick={() => void handleDecision(booking.id, 'Rejected')}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
