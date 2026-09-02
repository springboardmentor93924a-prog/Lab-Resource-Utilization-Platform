import { useEffect, useState } from "react";
import api from "../../services/api";

export default function UtilizationHeatmap() {
    const [equipmentList, setEquipmentList] = useState([]);
    const [selectedEq, setSelectedEq] = useState("ALL");
    const [heatmapData, setHeatmapData] = useState([]);

    useEffect(() => {
        api.get("/equipment").then(res => {
            setEquipmentList(res.data || []);
        }).catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (!selectedEq) return;
        const url = selectedEq === "ALL"
            ? "/utilization-analytics/heatmap"
            : `/utilization-analytics/heatmap/${selectedEq}`;
        api.get(url).then(res => {
            setHeatmapData(res.data || []);
        }).catch(err => console.error(err));
    }, [selectedEq]);

    const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const hours = [9, 10, 11, 12, 13, 14, 15, 16];

    const getCellData = (day, hour) => {
        return heatmapData.find(d => d.day === day && d.hour === hour);
    };

    const getCellColor = (percentage) => {
        if (percentage === undefined || percentage === null) return "transparent";
        if (percentage === 0) return "rgba(57, 123, 181, 0.05)";
        if (percentage < 25) return "rgba(57, 123, 181, 0.2)";
        if (percentage < 50) return "rgba(57, 123, 181, 0.4)";
        if (percentage < 75) return "rgba(57, 123, 181, 0.7)";
        return "rgba(57, 123, 181, 0.9)";
    };

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="mb-0 text-muted fw-bold">Usage Heatmap (Utilization %)</h5>
                    <select
                        className="form-select bg-light border-0 w-auto"
                        value={selectedEq}
                        onChange={(e) => setSelectedEq(e.target.value)}
                    >
                        <option value="ALL">All Equipment</option>
                        {equipmentList.map(eq => (
                            <option key={eq.id} value={eq.id}>{eq.name}</option>
                        ))}
                    </select>
                </div>

                {heatmapData.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        No heatmap data available for this equipment yet.
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-bordered text-center" style={{ tableLayout: 'fixed' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '60px' }}>Hour</th>
                                    {dayLabels.map(d => <th key={d} style={{ fontSize: '0.75rem' }}>{d}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {hours.map(h => (
                                    <tr key={h}>
                                        <td className="small text-muted fw-bold">{h}:00</td>
                                        {days.map((day, idx) => {
                                            const cell = getCellData(day, h);
                                            const pct = cell?.utilizationPercentage ?? 0;
                                            return (
                                                <td
                                                    key={day}
                                                    style={{
                                                        backgroundColor: getCellColor(cell?.utilizationPercentage),
                                                        cursor: 'pointer',
                                                        padding: '12px 4px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 600,
                                                        color: (cell?.utilizationPercentage || 0) >= 50 ? 'white' : 'var(--text-muted)'
                                                    }}
                                                    title={cell ? `${dayLabels[idx]} ${h}:00 - ${Math.round(pct)}% (${cell.usageCount || 0} bookings, ${cell.totalUsageMinutes || 0} min)` : `${dayLabels[idx]} ${h}:00 - No data`}
                                                >
                                                    {cell ? `${Math.round(pct)}%` : "—"}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="d-flex gap-3 justify-content-center mt-3 small align-items-center">
                            <span className="text-muted">Low</span>
                            <div style={{ display: 'flex', gap: '2px' }}>
                                <div style={{ width: '24px', height: '16px', background: 'rgba(57, 123, 181, 0.05)' }}></div>
                                <div style={{ width: '24px', height: '16px', background: 'rgba(57, 123, 181, 0.2)' }}></div>
                                <div style={{ width: '24px', height: '16px', background: 'rgba(57, 123, 181, 0.4)' }}></div>
                                <div style={{ width: '24px', height: '16px', background: 'rgba(57, 123, 181, 0.7)' }}></div>
                                <div style={{ width: '24px', height: '16px', background: 'rgba(57, 123, 181, 0.9)' }}></div>
                            </div>
                            <span className="text-muted">High</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
