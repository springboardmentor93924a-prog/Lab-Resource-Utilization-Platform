import { useEffect, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";

export default function LabTechnicianDashboard() {
    const [maintenance, setMaintenance] = useState([]);
    const [calibrations, setCalibrations] = useState([]);
    const [equipmentCount, setEquipmentCount] = useState(0);

    const loadData = async () => {
        try {
            const [maintRes, calibRes, eqRes] = await Promise.all([
                api.get("/maintenance").catch(() => ({ data: [] })),
                api.get("/calibrations").catch(() => ({ data: [] })),
                api.get("/equipment").catch(() => ({ data: [] }))
            ]);

            const allMaint = maintRes.data || [];
            const allCalib = calibRes.data || [];

            setMaintenance(allMaint);
            setCalibrations(allCalib);
            setEquipmentCount(eqRes.data?.length || 0);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadData();
         
    }, []);

    const assignedTasks = maintenance.filter(m => {
        const s = (m.status || "").toLowerCase();
        return s === "scheduled" || s === "in_progress" || s === "pending";
    });

    const completedTasks = maintenance.filter(m => (m.status || "").toLowerCase() === "completed");
    const upcomingCalibrations = calibrations.filter(c => {
        const s = (c.status || "").toLowerCase();
        return s === "scheduled" || s === "pending";
    });

    return (
        <div>
            <div className="stat-grid">
                <div className="stat-card">
                    <div className="stat-label">Assigned Tasks</div>
                    <div className="stat-value">{assignedTasks.length}</div>
                </div>
                <div className="stat-card" style={{ borderBottom: '4px solid var(--info)' }}>
                    <div className="stat-label">Total Equipment</div>
                    <div className="stat-value">{equipmentCount}</div>
                </div>
                <div className="stat-card" style={{ borderBottom: '4px solid var(--warning)' }}>
                    <div className="stat-label">Upcoming Calibrations</div>
                    <div className="stat-value">{upcomingCalibrations.length}</div>
                </div>
                <div className="stat-card" style={{ borderBottom: '4px solid var(--success)' }}>
                    <div className="stat-label">Completed Tasks</div>
                    <div className="stat-value">{completedTasks.length}</div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="card">
                    <div className="card-body">
                        <h2>Quick Actions</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                            <Link to="/maintenance" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                🔧 Maintenance Work Orders
                            </Link>
                            <Link to="/calibration" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                📐 Calibration Tracking
                            </Link>
                            <Link to="/equipment" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                🛠️ Equipment List
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <h2>Maintenance Overview</h2>
                        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="list-group-item">
                                <span style={{ fontWeight: 600 }}>Active Work Orders</span>
                                <span className="badge badge-warning">{assignedTasks.length}</span>
                            </div>
                            <div className="list-group-item">
                                <span style={{ fontWeight: 600 }}>Completed</span>
                                <span className="badge badge-success">{completedTasks.length}</span>
                            </div>
                            <div className="list-group-item">
                                <span style={{ fontWeight: 600 }}>Calibration Records</span>
                                <span className="badge badge-info">{calibrations.length}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px' }}>
                            <h6 className="stat-label">Recent Maintenance</h6>
                            {maintenance.length === 0 ? (
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No maintenance records</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {maintenance.slice(0, 4).map(m => (
                                        <div key={m.id} className="list-group-item">
                                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{m.equipmentName || 'Equipment'}</span>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{m.maintenanceType || 'N/A'}</span>
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
