export default function SharingHistory({ requests }) {
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
            <h5 style={{ fontSize: '15px', color: 'var(--text-main)', marginBottom: '15px', fontWeight: '600' }}>Sharing History</h5>
            <div className="table-responsive">
                <table className="glass-table">
                    <thead>
                        <tr>
                            <th>Equipment</th>
                            <th>Requester</th>
                            <th>Owner</th>
                            <th>Dates</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length > 0 ? (
                            requests.map(req => (
                                <tr key={req.id}>
                                    <td style={{ fontWeight: '600' }}>{req.equipmentName}</td>
                                    <td>{req.requesterInstitutionName}</td>
                                    <td>{req.ownerInstitutionName}</td>
                                    <td>
                                        <small style={{ display: 'block' }}>{req.startDate} - {req.endDate}</small>
                                    </td>
                                    <td>
                                        <span className="status-badge" style={{ ...getStatusStyle(req.status), padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>
                                            {req.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No historical sharing records yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
