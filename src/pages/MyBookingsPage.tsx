import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchBookings, updateBookingStatus } from '../services/platformData';
import type { BookingItem } from '../services/platformData';

const tabs = ['Upcoming', 'Past history', 'Pending approvals'] as const;

type BookingTab = (typeof tabs)[number];

export default function MyBookingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<BookingTab>('Upcoming');

  useEffect(() => {
    void loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await updateBookingStatus(id, 'Cancelled');
      await loadBookings();
      setMessage('Booking cancelled successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to cancel booking.');
    }
  };

  const now = new Date();
  const filteredBookings = useMemo(() => {
    const myBookings = user ? bookings.filter((booking) => booking.requester === user.name) : bookings;

    return myBookings.filter((booking) => {
      const bookingDate = new Date(`${booking.date}T${booking.endTime}`);
      if (activeTab === 'Upcoming') {
        return booking.status === 'Approved' && bookingDate >= now;
      }
      if (activeTab === 'Past history') {
        return bookingDate < now;
      }
      return booking.status === 'Pending';
    });
  }, [activeTab, bookings, now, user]);

  if (!user) {
    return (
      <div className="page-grid">
        <div className="panel-card">
          <h2>My bookings</h2>
          <p>Please sign in to view your booking history and manage your reservations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-grid">
      <div className="panel-card">
        <h2>My bookings</h2>
        <p>Review your upcoming reservations, past history, and pending approvals from one page.</p>
        {message && <div className="success-pill">{message}</div>}
        <div className="tab-row">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`tab-pill ${tab === activeTab ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        {loading ? (
          <p>Loading your bookings…</p>
        ) : (
          <div className="table-card">
            <div className="table-row table-header">
              <strong>Booking ID</strong>
              <strong>Equipment</strong>
              <strong>Date / Time</strong>
              <strong>Status</strong>
              <span />
            </div>
            {filteredBookings.length === 0 ? (
              <div className="table-row">
                <span>No bookings found for this view.</span>
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <div className="table-row" key={booking.id}>
                  <span>{booking.id}</span>
                  <span>{booking.resourceName}</span>
                  <span>{booking.date} {booking.startTime}-{booking.endTime}</span>
                  <span>{booking.status}</span>
                  <div className="action-row">
                    {booking.status !== 'Cancelled' && booking.status !== 'Rejected' ? (
                      <button className="secondary-btn" type="button" onClick={() => void handleCancel(booking.id)}>
                        Cancel Booking
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
