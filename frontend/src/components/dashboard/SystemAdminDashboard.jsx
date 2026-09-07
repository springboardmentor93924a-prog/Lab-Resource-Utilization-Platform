import { useEffect, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";

export default function SystemAdminDashboard() {
    const [dashboard, setDashboard] = useState(null);

    const loadData = async () => {
        try {
            const res = await api.get("/dashboard");
            setDashboard(res.data);
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
                    <div className="stat-label">Institutions</div>
                    <div className="stat-value">{dashboard?.totalInstitutions ?? 0}</div>
                </div>
                <div className="stat-card" style={{ borderBottom: '4px solid var(--info)' }}>
                    <div className="stat-label">Departments</div>
                    <div className="stat-value">{dashboard?.totalDepartments ?? 0}</div>
                </div>
                <div className="stat-card" style={{ borderBottom: '4px solid var(--success)' }}>
                    <div className="stat-label">Total Equipment</div>
                    <div className="stat-value">{dashboard?.totalEquipment ?? 0}</div>
                </div>
                <div className="stat-card" style={{ borderBottom: '4px solid var(--warning)' }}>
                    <div className="stat-label">Total Bookings</div>
                    <div className="stat-value">{dashboard?.totalBookings ?? 0}</div>
                </div>
            </div>

            <div className="card mt-2">
                <div className="card-body" style={{ padding: '24px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '24px' }}>System Administration</h2>

                    <div className="dashboard-grid">
                        <div className="card" style={{ backgroundColor: 'var(--bg-light)', border: '1px solid var(--border)', boxShadow: 'none' }}>
                            <div className="card-body">
                                <h6 className="stat-label mb-3">System Overview</h6>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div className="list-group-item">
                                        <span>Maintenance Records</span>
                                        <span className="badge badge-danger">{dashboard?.totalMaintenanceRecords ?? 0}</span>
                                    </div>
                                    <div className="list-group-item">
                                        <span>Calibration Records</span>
                                        <span className="badge badge-info">{dashboard?.totalCalibrationRecords ?? 0}</span>
                                    </div>
                                    <div className="list-group-item">
                                        <span>Out of Service</span>
                                        <span className="badge badge-warning">{dashboard?.outOfService ?? 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ backgroundColor: 'var(--bg-light)', border: '1px solid var(--border)', boxShadow: 'none' }}>
                            <div className="card-body">
                                <h6 className="stat-label mb-3">Administrative Actions</h6>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <Link to="/users" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                        🏛️ Manage Institutions & Departments
                                    </Link>
                                    <Link to="/equipment" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                        🛠️ Manage Equipment
                                    </Link>
                                    <Link to="/analytics" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                        📈 System Analytics
                                    </Link>
                                    <Link to="/reports" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                        📋 View Reports
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
