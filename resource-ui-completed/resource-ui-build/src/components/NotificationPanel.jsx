import { useState, useEffect } from "react";
import { getWaitlistNotifications, clearNotifications } from "../services/waitlistService";

export default function NotificationPanel({ refreshKey }) {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getWaitlistNotifications();
                setNotifications(data || []);
            } catch (err) {
                console.error(err);
            }
        };
        load();
    }, [refreshKey]);

    const handleClear = async () => {
        await clearNotifications();
        setNotifications([]);
    };

    return (
        <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h5 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Availability Notifications</h5>
                {notifications.length > 0 && (
                    <button className="glass-btn btn-sm" style={{ background: 'rgba(255,255,255,0.1)', fontSize: '11px' }} onClick={handleClear}>
                        Clear All
                    </button>
                )}
            </div>
            {notifications.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto' }}>
                    {notifications.map(n => (
                        <div key={n.id} style={{ padding: '10px 12px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', fontSize: '13px' }}>
                            <div style={{ fontWeight: '600', marginBottom: '3px' }}>{n.equipmentName}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{n.message}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: '4px' }}>{new Date(n.timestamp).toLocaleString()}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>No notifications yet.</div>
            )}
        </div>
    );
}
