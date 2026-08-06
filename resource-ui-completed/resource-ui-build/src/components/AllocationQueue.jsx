import { autoAllocateWaitlist } from "../services/waitlistService";
import { useToast } from "../context/ToastContext";

export default function AllocationQueue({ groupedByEquipment, onRefresh }) {
    const { addToast } = useToast();

    const handleAutoAllocate = async (equipmentId, equipmentName) => {
        try {
            const allocated = await autoAllocateWaitlist(equipmentId);
            if (allocated) {
                addToast(`${equipmentName} auto-allocated to ${allocated.userName}!`, "success");
            } else {
                addToast("No one in queue to allocate.", "warning");
            }
            onRefresh();
        } catch (err) {
            console.error(err);
            addToast("Failed to auto-allocate.", "error");
        }
    };

    const equipmentIds = Object.keys(groupedByEquipment);

    return (
        <div className="glass-card">
            <h5 style={{ fontSize: '15px', color: 'var(--text-main)', marginBottom: '15px', fontWeight: '600' }}>Allocation Queue by Equipment</h5>
            {equipmentIds.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                    {equipmentIds.map(eqId => {
                        const group = groupedByEquipment[eqId];
                        const waiting = group.filter(g => g.status === "WAITING").sort((a, b) => a.queuePosition - b.queuePosition);
                        return (
                            <div key={eqId} className="glass-card" style={{ padding: '15px', background: 'rgba(255,255,255,0.03)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <strong>{group[0].equipmentName}</strong>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{waiting.length} waiting</span>
                                </div>
                                <ol style={{ margin: '0 0 12px 18px', padding: 0, fontSize: '13px' }}>
                                    {waiting.map(w => (
                                        <li key={w.id} style={{ marginBottom: '4px' }}>
                                            {w.userName} <small style={{ color: 'var(--text-muted)' }}>({w.estimatedDays}d est.)</small>
                                        </li>
                                    ))}
                                </ol>
                                <button
                                    className="glass-btn btn-sm"
                                    style={{ background: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa', fontSize: '12px' }}
                                    disabled={waiting.length === 0}
                                    onClick={() => handleAutoAllocate(eqId, group[0].equipmentName)}
                                >
                                    Auto-Allocate Next
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No active waitlists.</div>
            )}
        </div>
    );
}
