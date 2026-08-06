import { leaveWaitlist } from "../services/waitlistService";
import { useToast } from "../context/ToastContext";

export default function WaitlistTable({ entries, onRefresh }) {
    const { addToast } = useToast();

    const handleLeave = async (id) => {
        if (!window.confirm("Leave this waitlist?")) return;
        try {
            await leaveWaitlist(id);
            addToast("Left the waitlist.", "success");
            onRefresh();
        } catch (err) {
            console.error(err);
            addToast("Failed to leave waitlist.", "error");
        }
    };

    return (
        <div className="glass-card mb-4">
            <h5 style={{ fontSize: '15px', color: 'var(--text-main)', marginBottom: '15px', fontWeight: '600' }}>Waitlist Entries</h5>
            <div className="table-responsive">
                <table className="glass-table">
                    <thead>
                        <tr>
                            <th>Equipment</th>
                            <th>User</th>
                            <th>Queue Position</th>
                            <th>Est. Wait</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.length > 0 ? (
                            entries.map(entry => (
                                <tr key={entry.id}>
                                    <td style={{ fontWeight: '600' }}>{entry.equipmentName}</td>
                                    <td>{entry.userName}</td>
                                    <td>
                                        <span className="status-badge" style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#60a5fa', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>
                                            #{entry.queuePosition}
                                        </span>
                                    </td>
                                    <td>{entry.estimatedDays} day(s)</td>
                                    <td>
                                        <span className="status-badge" style={{
                                            background: entry.status === 'ALLOCATED' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                            color: entry.status === 'ALLOCATED' ? '#34d399' : '#fbbf24',
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '12px'
                                        }}>
                                            {entry.status}
                                        </span>
                                    </td>
                                    <td>
                                        {entry.status === "WAITING" && (
                                            <button className="glass-btn btn-sm" style={{ background: 'rgba(255,255,255,0.1)', fontSize: '12px' }} onClick={() => handleLeave(entry.id)}>
                                                Leave Waitlist
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No one is currently on a waitlist.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
