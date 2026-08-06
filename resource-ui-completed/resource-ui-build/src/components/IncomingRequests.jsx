import { updateSharingRequestStatus } from "../services/sharingService";
import { useToast } from "../context/ToastContext";

export default function IncomingRequests({ requests, onRefresh }) {
    const { addToast } = useToast();

    const handleAction = async (id, status) => {
        try {
            await updateSharingRequestStatus(id, status);
            addToast(`Request ${status.toLowerCase()} successfully!`, "success");
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error(err);
            addToast("Failed to process request action.", "error");
        }
    };

    return (
        <div className="glass-card mb-4">
            <h5 style={{ fontSize: '15px', color: 'var(--text-main)', marginBottom: '15px', fontWeight: '600' }}>Incoming Resource Requests</h5>
            <div className="table-responsive">
                <table className="glass-table">
                    <thead>
                        <tr>
                            <th>Equipment</th>
                            <th>Requested By</th>
                            <th>Dates</th>
                            <th>Purpose</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length > 0 ? (
                            requests.map(req => (
                                <tr key={req.id}>
                                    <td style={{ fontWeight: '600' }}>{req.equipmentName}</td>
                                    <td>
                                        <div>{req.requestedBy}</div>
                                        <small style={{ color: 'var(--text-muted)' }}>{req.requesterInstitutionName}</small>
                                    </td>
                                    <td>
                                        <small style={{ display: 'block' }}>From: {req.startDate}</small>
                                        <small style={{ display: 'block' }}>To: {req.endDate}</small>
                                    </td>
                                    <td>{req.purpose || 'N/A'}</td>
                                    <td>
                                        <button 
                                            className="glass-btn btn-sm" 
                                            style={{ marginRight: '8px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '12px' }}
                                            onClick={() => handleAction(req.id, "APPROVED")}
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            className="glass-btn btn-sm" 
                                            style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '12px' }}
                                            onClick={() => handleAction(req.id, "REJECTED")}
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No incoming requests pending.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
