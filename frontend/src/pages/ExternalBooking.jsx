import { useState, useEffect, useCallback } from "react";
import { getExternalBookings } from "../services/externalBookingService";
import BookingForm from "../components/BookingForm";
import BookingHistory from "../components/BookingHistory";
import BookingDetails from "../components/BookingDetails";
import { useToast } from "../context/ToastContext";

export default function ExternalBooking() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const { addToast } = useToast();

    const loadBookings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getExternalBookings();
            setBookings(data || []);
        } catch (err) {
            console.error(err);
            addToast("Failed to load external bookings.", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => { setTimeout(() => loadBookings(), 0); }, [loadBookings]);

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === "PENDING").length,
        approved: bookings.filter(b => b.status === "APPROVED").length,
        completed: bookings.filter(b => b.status === "COMPLETED").length,
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>External Booking & Access Management</h2>
                    <p>Manage equipment bookings and access requests from external organizations</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="glass-card" style={{ padding: '20px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Bookings</span>
                    <span style={{ display: 'block', fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', marginTop: '8px' }}>{stats.total}</span>
                </div>
                <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #fbbf24' }}>
                    <span style={{ fontSize: '12px', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending</span>
                    <span style={{ display: 'block', fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', marginTop: '8px' }}>{stats.pending}</span>
                </div>
                <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #34d399' }}>
                    <span style={{ fontSize: '12px', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Approved</span>
                    <span style={{ display: 'block', fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', marginTop: '8px' }}>{stats.approved}</span>
                </div>
                <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #60a5fa' }}>
                    <span style={{ fontSize: '12px', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completed</span>
                    <span style={{ display: 'block', fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', marginTop: '8px' }}>{stats.completed}</span>
                </div>
            </div>

            <BookingForm existingBookings={bookings} onBookingCreated={loadBookings} />

            <div style={{ display: 'grid', gridTemplateColumns: selectedBooking ? '2fr 1fr' : '1fr', gap: '20px', alignItems: 'flex-start' }}>
                {loading ? (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading bookings...</div>
                ) : (
                    <BookingHistory bookings={bookings} onSelect={setSelectedBooking} selectedId={selectedBooking?.id} />
                )}
                {selectedBooking && (
                    <BookingDetails booking={selectedBooking} onClose={() => setSelectedBooking(null)} onRefresh={loadBookings} />
                )}
            </div>
        </div>
    );
}
