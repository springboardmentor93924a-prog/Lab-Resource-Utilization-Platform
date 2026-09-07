import { useEffect, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";

export default function LabManagerDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [pendingBookings, setPendingBookings] = useState([]);
    const [idleEquipment, setIdleEquipment] = useState([]);
    const [mostUsedEquipment, setMostUsedEquipment] = useState([]);

    const loadData = async () => {
        try {
            const [dashRes, bookRes, idleRes, usedRes] = await Promise.all([
                api.get("/dashboard").catch(() => ({ data: null })),
                api.get("/bookings/approval-status/PENDING").catch(() => ({ data: [] })),
                api.get("/utilization-analytics/idle-equipment").catch(() => ({ data: [] })),
                api.get("/utilization-analytics/most-used-equipment").catch(() => ({ data: [] }))
            ]);

            setDashboard(dashRes.data);
            setPendingBookings(bookRes.data || []);
            setIdleEquipment((idleRes.data || []).slice(0, 5));
            setMostUsedEquipment((usedRes.data || []).slice(0, 5));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadData();
         
    }, []);

    return (
        <div>
            <div className="stat-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Equipment</div>
                    <div className="stat-value">{dashboard?.totalEquipment ?? 0}</div>
                </div>
                <div className="stat-card" style={{ borderBottom: '4px solid var(--success)' }}>
                    <div className="stat-label">Available</div>
                    <div className="stat-value">{dashboard?.availableEquipment ?? 0}</div>
                </div>
                <div className="stat-card" style={{ borderBottom: '4px solid var(--danger)' }}>
                    <div className="stat-label">In Maintenance</div>
                    <div className="stat-value">{dashboard?.underMaintenance ?? 0}</div>
                </div>
                <div className="stat-card" style={{ borderBottom: '4px solid var(--warning)' }}>
                    <div className="stat-label">Pending Approvals</div>
                    <div className="stat-value">{pendingBookings.length}</div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="card">
                    <div className="card-body">
                        <h2>Quick Actions</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                            <Link to="/bookings" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                ✓ Review Pending Bookings ({pendingBookings.length})
                            </Link>
                            <Link to="/utilization" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                📊 View Utilization Heatmaps
                            </Link>
                            <Link to="/equipment" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                🛠️ Update Equipment Status
                            </Link>
                            <Link to="/sharing" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                🤝 Manage Resource Sharing
                            </Link>
                            <Link to="/maintenance" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                🔧 Maintenance Records
                            </Link>
                            <Link to="/reports" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                📋 View Reports
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <h2>Utilization Insights</h2>

                        <div style={{ marginTop: '24px', marginBottom: '24px' }}>
                            <h6 className="stat-label">🔥 High Demand Equipment</h6>
                            {mostUsedEquipment.length === 0 ? (
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No data available</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {mostUsedEquipment.map(item => (
                                        <div key={item.equipmentId} className="list-group-item">
                                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.equipmentName || 'Equipment'}</span>
                                            <span className="badge badge-danger">{Math.round(item.utilizationRate || 0)}%</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <h6 className="stat-label">💤 Idle Equipment</h6>
                            {idleEquipment.length === 0 ? (
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No data available</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {idleEquipment.map(item => (
                                        <div key={item.equipmentId} className="list-group-item">
                                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.equipmentName || 'Equipment'}</span>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{Math.round((item.idleMinutes || 0) / 60)}h idle</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
