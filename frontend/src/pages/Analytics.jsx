import { useEffect, useState } from "react";
import api from "../services/api";
import UtilizationHeatmap from "../components/utilization/UtilizationHeatmap";

function Analytics() {
    const [activeTab, setActiveTab] = useState("overview");
    const [mostUsed, setMostUsed] = useState([]);
    const [idleEquipment, setIdleEquipment] = useState([]);
    const [demandAnalysis, setDemandAnalysis] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function loadOverview() {
        setLoading(true);
        setError("");
        try {
            const [dashRes, mostUsedRes, idleRes, demandRes] = await Promise.all([
                api.get("/dashboard").catch(() => ({ data: null })),
                api.get("/utilization-analytics/most-used-equipment").catch(() => ({ data: [] })),
                api.get("/utilization-analytics/idle-equipment").catch(() => ({ data: [] })),
                api.get("/utilization-analytics/demand-analysis").catch(() => ({ data: [] }))
            ]);
            setDashboardData(dashRes.data);
            setMostUsed(mostUsedRes.data || []);
            setIdleEquipment(idleRes.data || []);
            setDemandAnalysis(demandRes.data || []);
        } catch (err) {
            console.error(err);
            setError("Unable to load analytics data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOverview();
         
    }, []);

    const formatMinutes = (mins) => {
        if (mins == null) return "—";
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const formatPercent = (val) => {
        if (val == null) return "—";
        return `${Number(val).toFixed(1)}%`;
    };

    const getUtilizationClass = (rate) => {
        if (rate == null) return "secondary";
        const r = Number(rate);
        if (r >= 75) return "danger";
        if (r >= 50) return "warning";
        if (r >= 25) return "info";
        return "success";
    };

    return (
        <div className="page-content">
            <h1 className="mb-4">Organization Analytics</h1>
            {error && <div className="alert alert-danger">{error}</div>}

            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>Overview</button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === "utilization" ? "active" : ""}`} onClick={() => setActiveTab("utilization")}>Utilization & Idle</button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === "demand" ? "active" : ""}`} onClick={() => setActiveTab("demand")}>Demand Analysis</button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === "heatmap" ? "active" : ""}`} onClick={() => setActiveTab("heatmap")}>Heatmap</button>
                </li>
            </ul>

            {loading && <div className="text-center py-4"><div className="spinner-border" role="status"></div></div>}

            {!loading && activeTab === "overview" && dashboardData && (
                <div>
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <div className="card stat-card">
                                <div className="card-body text-center">
                                    <div className="stat-number">{dashboardData.totalEquipment ?? 0}</div>
                                    <div className="stat-label">Total Equipment</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card stat-card">
                                <div className="card-body text-center">
                                    <div className="stat-number text-success">{dashboardData.availableEquipment ?? 0}</div>
                                    <div className="stat-label">Available</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card stat-card">
                                <div className="card-body text-center">
                                    <div className="stat-number text-warning">{dashboardData.bookedEquipment ?? 0}</div>
                                    <div className="stat-label">Booked</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card stat-card">
                                <div className="card-body text-center">
                                    <div className="stat-number text-danger">{dashboardData.underMaintenance ?? 0}</div>
                                    <div className="stat-label">Under Maintenance</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <div className="card stat-card">
                                <div className="card-body text-center">
                                    <div className="stat-number">{dashboardData.totalBookings ?? 0}</div>
                                    <div className="stat-label">Total Bookings</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card stat-card">
                                <div className="card-body text-center">
                                    <div className="stat-number">{dashboardData.totalInstitutions ?? 0}</div>
                                    <div className="stat-label">Institutions</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card stat-card">
                                <div className="card-body text-center">
                                    <div className="stat-number">{dashboardData.totalDepartments ?? 0}</div>
                                    <div className="stat-label">Departments</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card stat-card">
                                <div className="card-body text-center">
                                    <div className="stat-number">{dashboardData.totalMaintenanceRecords ?? 0}</div>
                                    <div className="stat-label">Maintenance Records</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <h5>Top 5 Most Used Equipment</h5>
                            <div className="table-responsive mt-3">
                                <table className="data-table">
                                    <thead>
                                    <tr>
                                        <th>Equipment</th>
                                        <th>Utilization Rate</th>
                                        <th>Total Usage</th>
                                        <th>Bookings</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                        {mostUsed.length === 0 ? (
                                            <tr><td colSpan="4" className="text-center text-muted py-3">No data available</td></tr>
                                        ) : (
                                            mostUsed.slice(0, 5).map((eq, i) => (
                                                <tr key={eq.equipmentId || i}>
                                                    <td className="fw-bold">{eq.equipmentName || "—"}</td>
                                                    <td>
                                                        <span className={`badge badge-${getUtilizationClass(eq.utilizationRate)}`}>
                                                            {formatPercent(eq.utilizationRate)}
                                                        </span>
                                                    </td>
                                                    <td>{formatMinutes(eq.totalUsageMinutes)}</td>
                                                    <td>{eq.totalBookings ?? 0}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!loading && activeTab === "utilization" && (
                <div>
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5>Most Used Equipment</h5>
                            <div className="table-responsive mt-3">
                                <table className="data-table">
                                    <thead>
                                    <tr>
                                        <th>Equipment</th>
                                        <th>Utilization Rate</th>
                                        <th>Total Usage</th>
                                        <th>Available Time</th>
                                        <th>Bookings</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                        {mostUsed.length === 0 ? (
                                            <tr><td colSpan="5" className="text-center text-muted py-3">No data available</td></tr>
                                        ) : (
                                            mostUsed.map((eq, i) => (
                                                <tr key={eq.equipmentId || i}>
                                                    <td className="fw-bold">{eq.equipmentName || "—"}</td>
                                                    <td>
                                                        <span className={`badge badge-${getUtilizationClass(eq.utilizationRate)}`}>
                                                            {formatPercent(eq.utilizationRate)}
                                                        </span>
                                                    </td>
                                                    <td>{formatMinutes(eq.totalUsageMinutes)}</td>
                                                    <td>{formatMinutes(eq.availableMinutes)}</td>
                                                    <td>{eq.totalBookings ?? 0}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <h5>Idle Equipment (Most Idle First)</h5>
                            <div className="table-responsive mt-3">
                                <table className="data-table">
                                    <thead>
                                    <tr>
                                        <th>Equipment</th>
                                        <th>Idle Time</th>
                                        <th>Utilization Rate</th>
                                        <th>Total Usage</th>
                                        <th>Bookings</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                        {idleEquipment.length === 0 ? (
                                            <tr><td colSpan="5" className="text-center text-muted py-3">No idle equipment detected</td></tr>
                                        ) : (
                                            idleEquipment.map((eq, i) => (
                                                <tr key={eq.equipmentId || i}>
                                                    <td className="fw-bold">{eq.equipmentName || "—"}</td>
                                                    <td>
                                                        <span className="badge badge-warning">
                                                            {formatMinutes(eq.idleMinutes)}
                                                        </span>
                                                    </td>
                                                    <td>{formatPercent(eq.utilizationRate)}</td>
                                                    <td>{formatMinutes(eq.totalUsageMinutes)}</td>
                                                    <td>{eq.totalBookings ?? 0}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!loading && activeTab === "demand" && (
                <div className="card">
                    <div className="card-body">
                        <h5>Demand Analysis</h5>
                        <p className="text-muted small">Based on bookings, resource-sharing requests, and actual utilization.</p>
                        <div className="table-responsive mt-3">
                            <table className="data-table">
                                <thead>
                                <tr>
                                    <th>Equipment</th>
                                    <th>Total Requests</th>
                                    <th>Total Bookings</th>
                                    <th>Utilization Rate</th>
                                    <th>Total Usage</th>
                                    <th>Idle Time</th>
                                </tr>
                                </thead>
                                <tbody>
                                    {demandAnalysis.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center text-muted py-3">No demand data available</td></tr>
                                    ) : (
                                        demandAnalysis.map((eq, i) => (
                                            <tr key={eq.equipmentId || i}>
                                                <td className="fw-bold">{eq.equipmentName || "—"}</td>
                                                <td>
                                                    <span className="badge badge-info">{eq.totalRequests ?? 0}</span>
                                                </td>
                                                <td>{eq.totalBookings ?? 0}</td>
                                                <td>
                                                    <span className={`badge badge-${getUtilizationClass(eq.utilizationRate)}`}>
                                                        {formatPercent(eq.utilizationRate)}
                                                    </span>
                                                </td>
                                                <td>{formatMinutes(eq.totalUsageMinutes)}</td>
                                                <td>{formatMinutes(eq.idleMinutes)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {!loading && activeTab === "heatmap" && (
                <UtilizationHeatmap />
            )}
        </div>
    );
}

export default Analytics;
