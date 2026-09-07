import { useEffect, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";

export default function DepartmentHeadDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [pendingBookings, setPendingBookings] = useState([]);
    const [mostUsedEquipment, setMostUsedEquipment] = useState([]);

    const loadData = async () => {
        try {
            const [dashRes, bookRes, usedRes] = await Promise.all([
                api.get("/dashboard").catch(() => ({ data: null })),
                api.get("/bookings/approval-status/PENDING").catch(() => ({ data: [] })),
                api.get("/utilization-analytics/most-used-equipment").catch(() => ({ data: [] }))
            ]);

            setDashboard(dashRes.data);
            setPendingBookings(bookRes.data || []);
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
                <div className="stat-card" style={{ borderBottom: '4px solid var(--warning)' }}>
                    <div className="stat-label">Pending Bookings</div>
                    <div className="stat-value">{pendingBookings.length}</div>
                </div>
                <div className="stat-card" style={{ borderBottom: '4px solid var(--info)' }}>
                    <div className="stat-label">Total Bookings</div>
                    <div className="stat-value">{dashboard?.totalBookings ?? 0}</div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="card">
                    <div className="card-body">
                        <h2>Department Insights</h2>
                        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <Link to="/utilization" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                📊 Utilization & Heatmap
                            </Link>
                            <Link to="/sharing" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                🤝 Resource Sharing Requests
                            </Link>
                            <Link to="/bookings" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                📅 Manage Bookings
                            </Link>
                            <Link to="/reports" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                📋 View Reports
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <h2>High-Demand Equipment</h2>

                        <div style={{ marginTop: '24px' }}>
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

                        <div style={{ marginTop: '24px' }}>
                            <h6 className="stat-label">📋 Maintenance Overview</h6>
                            <div className="list-group-item">
                                <span style={{ fontWeight: 600 }}>Under Maintenance</span>
                                <span className="badge badge-danger">{dashboard?.underMaintenance ?? 0}</span>
                            </div>
                            <div className="list-group-item">
                                <span style={{ fontWeight: 600 }}>Under Calibration</span>
                                <span className="badge badge-warning">{dashboard?.underCalibration ?? 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
