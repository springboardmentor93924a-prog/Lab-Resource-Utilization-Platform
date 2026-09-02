import { useEffect, useState } from "react";
import api from "../../services/api";

export default function UtilizationStats() {
    const [idleEq, setIdleEq] = useState([]);
    const [mostUsedEq, setMostUsedEq] = useState([]);
    const [demand, setDemand] = useState([]);

    const loadData = async () => {
        try {
            const [idleRes, usedRes, demandRes] = await Promise.all([
                api.get("/utilization-analytics/idle-equipment").catch(() => ({ data: [] })),
                api.get("/utilization-analytics/most-used-equipment").catch(() => ({ data: [] })),
                api.get("/utilization-analytics/demand-analysis").catch(() => ({ data: [] }))
            ]);

            setIdleEq(idleRes.data || []);
            setMostUsedEq(usedRes.data || []);
            setDemand(demandRes.data || []);
        } catch (err) {
            console.error("Error loading utilization stats", err);
        }
    };

    useEffect(() => {
        loadData();
         
    }, []);

    const formatHours = (minutes) => {
        if (!minutes) return "0 hrs";
        const hrs = Math.round(minutes / 60);
        return `${hrs} hrs`;
    };

    return (
        <div className="row mt-4">
            <div className="col-md-4 mb-4">
                <div className="card shadow-sm h-100">
                    <div className="card-body">
                        <h5 className="text-muted fw-bold mb-3">Most Used Equipment</h5>
                        {mostUsedEq.length === 0 ? <p className="text-muted small">No data available</p> : (
                            <ul className="list-group list-group-flush">
                                {mostUsedEq.slice(0,5).map((eq, i) => (
                                    <li key={eq.equipmentId || i} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                        {eq.equipmentName || "Unknown"}
                                        <span className="badge badge-success">{Math.round(eq.utilizationRate || 0)}%</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <div className="col-md-4 mb-4">
                <div className="card shadow-sm h-100 border-0" style={{ borderTop: '4px solid var(--danger)' }}>
                    <div className="card-body">
                        <h5 className="text-muted fw-bold mb-3">Highest Idle Time</h5>
                        {idleEq.length === 0 ? <p className="text-muted small">No data available</p> : (
                            <ul className="list-group list-group-flush">
                                {idleEq.slice(0,5).map((eq, i) => (
                                    <li key={eq.equipmentId || i} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                        {eq.equipmentName || "Unknown"}
                                        <span className="badge badge-danger">{formatHours(eq.idleMinutes)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <div className="col-md-4 mb-4">
                <div className="card shadow-sm h-100">
                    <div className="card-body">
                        <h5 className="text-muted fw-bold mb-3">Demand Analysis</h5>
                        {demand.length === 0 ? <p className="text-muted small">No data available</p> : (
                            <ul className="list-group list-group-flush">
                                {demand.slice(0,5).map((eq, i) => (
                                    <li key={eq.equipmentId || i} className="list-group-item px-0">
                                        <div className="d-flex justify-content-between">
                                            <span>{eq.equipmentName || "Unknown"}</span>
                                            <span className="badge badge-warning">High Demand</span>
                                        </div>
                                        <div className="small text-muted mt-1">
                                            Bookings: {eq.totalBookings || 0} | Requests: {eq.totalRequests || 0}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
