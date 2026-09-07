import { useEffect, useState } from "react";
import api from "../../services/api";

export default function UtilizationHeatmap() {
    const [equipmentList, setEquipmentList] = useState([]);
    const [selectedEq, setSelectedEq] = useState("ALL");
    const [heatmapData, setHeatmapData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get("/equipment").then(res => {
            setEquipmentList(res.data || []);
        }).catch(err => console.error(err));
    }, []);

    // The backend only exposes a per-equipment heatmap endpoint
    // (GET /utilization-analytics/heatmap/{equipmentId}) — there is no
    // "all equipment" endpoint. So for the "ALL" view we fetch every
    // equipment's heatmap ourselves and merge them here on the frontend.
    useEffect(() => {
        if (!selectedEq) return;

        let cancelled = false;
        setLoading(true);
        setError(null);

        const loadSingle = (equipmentId) =>
            api.get(`/utilization-analytics/heatmap/${equipmentId}`)
                .then(res => res.data || [])
                .catch(err => {
                    console.error(`Failed to load heatmap for ${equipmentId}`, err);
                    return [];
                });

        const mergeAll = (datasets) => {
            // key -> { usageCount, totalUsageMinutes, percentages: [] }
            const merged = new Map();

            datasets.forEach(dataset => {
                dataset.forEach(cell => {
                    const key = `${cell.day}-${cell.hour}`;
                    const existing = merged.get(key) || {
                        day: cell.day,
                        hour: cell.hour,
                        usageCount: 0,
                        totalUsageMinutes: 0,
                        percentages: []
                    };
                    existing.usageCount += cell.usageCount || 0;
                    existing.totalUsageMinutes += cell.totalUsageMinutes || 0;
                    existing.percentages.push(cell.utilizationPercentage || 0);
                    merged.set(key, existing);
                });
            });

            return Array.from(merged.values()).map(v => ({
                day: v.day,
                hour: v.hour,
                usageCount: v.usageCount,
                totalUsageMinutes: v.totalUsageMinutes,
                // Every equipment shares the same available-minutes basis for a
                // given day/hour slot, so a simple average of each equipment's
                // percentage is equivalent to the true combined utilization.
                utilizationPercentage:
                    v.percentages.reduce((a, b) => a + b, 0) / v.percentages.length
            }));
        };

        const run = async () => {
            try {
                if (selectedEq === "ALL") {
                    if (equipmentList.length === 0) {
                        if (!cancelled) {
                            setHeatmapData([]);
                            setLoading(false);
                        }
                        return;
                    }
                    const datasets = await Promise.all(
                        equipmentList.map(eq => loadSingle(eq.id))
                    );
                    if (!cancelled) setHeatmapData(mergeAll(datasets));
                } else {
                    const data = await loadSingle(selectedEq);
                    if (!cancelled) setHeatmapData(data);
                }
            } catch (err) {
                console.error(err);
                if (!cancelled) setError("Unable to load heatmap data.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [selectedEq, equipmentList]);

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

                {loading ? (
                    <div className="text-center py-5 text-muted">
                        Loading heatmap data...
                    </div>
                ) : error ? (
                    <div className="text-center py-5 text-danger">
                        {error}
                    </div>
                ) : heatmapData.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        No heatmap data available for this equipment yet.
                    </div>
                ) : (
                    <div className="table-responsive">
                        {heatmapData.every(d => (d.usageCount || 0) === 0) && (
                            <div className="alert alert-info py-2 small mb-3">
                                No usage has been logged yet for {selectedEq === "ALL" ? "any equipment" : "this equipment"} in the last 30 days, so all slots currently show 0%. The heatmap will fill in automatically as bookings are used and utilization logs are recorded.
                            </div>
                        )}
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
