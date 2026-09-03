import { useEffect, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";

export default function InstitutionAdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [sharingReqs, setSharingReqs] = useState([]);

    const loadData = async () => {
        try {
            const [dashRes, shareRes] = await Promise.all([
                api.get("/dashboard").catch(() => ({ data: null })),
                api.get("/resource-sharing").catch(() => ({ data: [] }))
            ]);
            setDashboard(dashRes.data);
            setSharingReqs(shareRes.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadData();
         
    }, []);

    const pendingSharing = sharingReqs.filter(r => (r.status || "").toLowerCase() === "pending").length;

    return (
        <div>
            <div className="stat-grid">
                <div className="stat-card" style={{ borderBottom: '4px solid var(--secondary)' }}>
                    <div className="stat-label">Total Equipment</div>
                    <div className="stat-value">{dashboard?.totalEquipment ?? 0}</div>
                </div>
                <div className="stat-card" style={{ borderBottom: '4px solid var(--success)' }}>
                    <div className="stat-label">Total Bookings</div>
                    <div className="stat-value">{dashboard?.totalBookings ?? 0}</div>
                </div>
                <div className="stat-card" style={{ borderBottom: '4px solid var(--warning)' }}>
                    <div className="stat-label">Pending Sharing</div>
                    <div className="stat-value">{pendingSharing}</div>
                </div>
                <div className="stat-card" style={{ borderBottom: '4px solid var(--danger)' }}>
                    <div className="stat-label">Out of Service</div>
                    <div className="stat-value">{dashboard?.outOfService ?? 0}</div>
                </div>
            </div>

            <div className="card mt-2">
                <div className="card-body" style={{ padding: '24px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '24px' }}>Organization Overview</h2>

                    <div className="dashboard-grid">
                        <div className="card" style={{ backgroundColor: 'var(--bg-light)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
                            <div className="card-body">
                                <h6 className="stat-label mb-3">Equipment Status</h6>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div className="list-group-item">
                                        <span>Available</span>
                                        <span className="badge badge-success">{dashboard?.availableEquipment ?? 0}</span>
                                    </div>
                                    <div className="list-group-item">
                                        <span>Booked</span>
                                        <span className="badge badge-warning">{dashboard?.bookedEquipment ?? 0}</span>
                                    </div>
                                    <div className="list-group-item">
                                        <span>Under Maintenance</span>
                                        <span className="badge badge-danger">{dashboard?.underMaintenance ?? 0}</span>
                                    </div>
                                    <div className="list-group-item">
                                        <span>Under Calibration</span>
                                        <span className="badge badge-info">{dashboard?.underCalibration ?? 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ backgroundColor: 'var(--bg-light)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
                            <div className="card-body">
                                <h6 className="stat-label mb-3">Administrative Actions</h6>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <Link to="/sharing" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                        🤝 Resource Sharing ({pendingSharing} pending)
                                    </Link>
                                    <Link to="/analytics" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                        📈 Analytics & Cost Analysis
                                    </Link>
                                    <Link to="/reports" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                        📋 Reports
                                    </Link>
                                    <Link to="/users" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                        🏛️ Manage Institutions & Departments
                                    </Link>
                                    <Link to="/utilization" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                        📊 Utilization Analytics
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
