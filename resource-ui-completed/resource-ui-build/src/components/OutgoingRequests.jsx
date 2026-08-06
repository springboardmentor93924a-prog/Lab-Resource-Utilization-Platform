export default function OutgoingRequests({ requests, onCancel }) {
    const getStatusStyle = (status) => {
        switch (status) {
            case "APPROVED": return { background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' };
            case "REJECTED": return { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' };
            case "COMPLETED": return { background: 'rgba(96, 165, 250, 0.15)', color: '#60a5fa' };
            default: return { background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' };
        }
    };

    return (
        <div className="glass-card mb-4">
            <h5 style={{ fontSize: '15px', color: 'var(--text-main)', marginBottom: '15px', fontWeight: '600' }}>Outgoing Sharing Requests</h5>
            <div className="table-responsive">
                <table className="glass-table">
                    <thead>
                        <tr>
                            <th>Equipment</th>
                            <th>Owner Institution</th>
                            <th>Dates</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length > 0 ? (
                            requests.map(req => (
                                <tr key={req.id}>
                                    <td style={{ fontWeight: '600' }}>{req.equipmentName}</td>
                                    <td>{req.ownerInstitutionName}</td>
                                    <td>
                                        <small style={{ display: 'block' }}>From: {req.startDate}</small>
                                        <small style={{ display: 'block' }}>To: {req.endDate}</small>
                                    </td>
                                    <td>
                                        <span className="status-badge" style={{ ...getStatusStyle(req.status), padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td>
                                        {req.status === "PENDING" && (
                                            <button
                                                className="glass-btn btn-sm"
                                                style={{ background: 'rgba(255,255,255,0.1)', fontSize: '12px' }}
                                                onClick={() => onCancel(req.id)}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No outgoing requests sent.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
