import { updateExternalBookingStatus, deleteExternalBooking } from "../services/externalBookingService";
import { autoAllocateWaitlist } from "../services/waitlistService";
import { useToast } from "../context/ToastContext";

export default function BookingDetails({ booking, onClose, onRefresh }) {
    const { addToast } = useToast();

    if (!booking) return null;

    const handleAction = async (status) => {
        try {
            await updateExternalBookingStatus(booking.id, status);
            addToast(`Booking ${status.toLowerCase()}.`, "success");

            // Equipment just freed up (rejected before starting, or wrapped
            // up) — automatically pull the next person off the waitlist,
            // if any, instead of leaving the slot idle.
            if (["REJECTED", "COMPLETED"].includes(status)) {
                try {
                    const allocated = await autoAllocateWaitlist(booking.equipmentId);
                    if (allocated) {
                        addToast(`${booking.equipmentName} auto-allocated to next in queue: ${allocated.userName}.`, "info");
                    }
                } catch (allocErr) {
                    console.error("Auto-allocation failed:", allocErr);
                }
            }

            onRefresh();
            onClose();
        } catch (err) {
            console.error(err);
            addToast("Failed to update booking status.", "error");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this booking record?")) return;
        try {
            await deleteExternalBooking(booking.id);
            addToast("Booking deleted.", "success");
            onRefresh();
            onClose();
        } catch (err) {
            console.error(err);
            addToast("Failed to delete booking.", "error");
        }
    };

    return (
        <div className="glass-card" style={{ padding: '20px', position: 'sticky', top: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h5 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Booking Details</h5>
                <button className="glass-btn btn-sm" style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 10px' }} onClick={onClose}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Equipment:</span> <strong>{booking.equipmentName}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Organization:</span> {booking.externalOrganization}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Contact:</span> {booking.contactPerson}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> {booking.email}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Dates:</span> {booking.startDate} to {booking.endDate}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Purpose:</span> {booking.purpose || 'N/A'}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Status:</span> {booking.status}</div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
                {booking.status === "PENDING" && (
                    <>
                        <button className="glass-btn btn-sm" style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399' }} onClick={() => handleAction("APPROVED")}>Approve</button>
                        <button className="glass-btn btn-sm" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }} onClick={() => handleAction("REJECTED")}>Reject</button>
                    </>
                )}
                {booking.status === "APPROVED" && (
                    <button className="glass-btn btn-sm" style={{ background: 'rgba(96,165,250,0.2)', color: '#60a5fa' }} onClick={() => handleAction("COMPLETED")}>Mark Completed</button>
                )}
                <button className="glass-btn btn-sm" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={handleDelete}>Delete</button>
            </div>
        </div>
    );
}
