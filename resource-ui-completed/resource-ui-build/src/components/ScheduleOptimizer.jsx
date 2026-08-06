import { useState, useEffect, useCallback } from "react";
import { getOptimalBookingSlots } from "../services/analyticsService";

// Recommends the best (lowest-utilization) day/hour windows to book a given
// piece of equipment into, so demand gets spread out instead of piling onto
// the same peak hours -- directly supports "optimize booking schedules to
// reduce idle time and maximize equipment usage".
export default function ScheduleOptimizer({ equipmentList }) {
    const [equipmentId, setEquipmentId] = useState("");
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const runOptimizer = useCallback(async (id) => {
        if (!id) return;
        setLoading(true);
        setHasSearched(true);
        try {
            const result = await getOptimalBookingSlots(id);
            setSlots(result?.recommendedSlots || []);
        } catch (err) {
            console.error("Failed to load optimal slots:", err);
            setSlots([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const initDefault = async () => {
            if (equipmentList && equipmentList.length > 0 && !equipmentId) {
                setEquipmentId(equipmentList[0].id);
            }
        };
        initDefault();
    }, [equipmentList, equipmentId]);

    useEffect(() => {
        const load = async () => {
            if (equipmentId) await runOptimizer(equipmentId);
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [equipmentId]);

    return (
        <div className="glass-card mb-4" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                <div>
                    <h5 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Booking Schedule Optimizer</h5>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                        Lowest-utilization windows for this equipment, to reduce idle time and spread demand.
                    </p>
                </div>
                <select
                    className="glass-select"
                    style={{ maxWidth: '260px' }}
                    value={equipmentId}
                    onChange={(e) => setEquipmentId(e.target.value)}
                >
                    <option value="">Select Equipment</option>
                    {(equipmentList || []).map(eq => (
                        <option key={eq.id} value={eq.id}>{eq.name}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>Calculating optimal windows...</div>
            ) : hasSearched && slots.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                    {slots.map((s, idx) => (
                        <div
                            key={idx}
                            className="glass-card"
                            style={{ padding: '12px', background: 'rgba(52, 211, 153, 0.06)', border: '1px solid rgba(52, 211, 153, 0.2)' }}
                        >
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{s.day} &middot; {s.hour}</div>
                            <div style={{ fontSize: '11px', color: '#34d399', marginTop: '4px' }}>{s.utilization}% typical utilization</div>
                        </div>
                    ))}
                </div>
            ) : hasSearched ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>No low-utilization windows found — this equipment is in high demand across the week.</div>
            ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>Select equipment to see recommended booking windows.</div>
            )}
        </div>
    );
}
