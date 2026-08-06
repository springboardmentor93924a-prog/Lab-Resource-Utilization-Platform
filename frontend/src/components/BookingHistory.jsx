export default function BookingHistory({ bookings, onSelect, selectedId }) {
    const getStatusStyle = (status) => {
        switch (status) {
            case "APPROVED": return { background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' };
            case "REJECTED": return { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' };
            case "COMPLETED": return { background: 'rgba(96, 165, 250, 0.15)', color: '#60a5fa' };
            default: return { background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' };
        }
    };

    return (
        <div className="glass-card">
            <h5 style={{ fontSize: '15px', color: 'var(--text-main)', marginBottom: '15px', fontWeight: '600' }}>External Booking History</h5>
            <div className="table-responsive">
                <table className="glass-table">
                    <thead>
                        <tr>
                            <th>Equipment</th>
                            <th>Organization</th>
                            <th>Dates</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.length > 0 ? (
                            bookings.map(b => (
                                <tr key={b.id} style={{ background: selectedId === b.id ? 'rgba(59,130,246,0.08)' : 'transparent' }}>
                                    <td style={{ fontWeight: '600' }}>{b.equipmentName}</td>
                                    <td>
                                        <div>{b.externalOrganization}</div>
                                        <small style={{ color: 'var(--text-muted)' }}>{b.contactPerson}</small>
                                    </td>
                                    <td>
                                        <small style={{ display: 'block' }}>{b.startDate} - {b.endDate}</small>
                                    </td>
                                    <td>
                                        <span className="status-badge" style={{ ...getStatusStyle(b.status), padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="glass-btn btn-sm" style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)' }} onClick={() => onSelect(b)}>
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No external bookings found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
