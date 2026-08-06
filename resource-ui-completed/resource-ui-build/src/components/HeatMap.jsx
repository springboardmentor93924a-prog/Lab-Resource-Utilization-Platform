import { useState, useEffect } from "react";
import { getUtilizationHeatmap } from "../services/analyticsService";

export default function HeatMap() {
    const [heatmap, setHeatmap] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getUtilizationHeatmap();
                setHeatmap(data);
            } catch (err) {
                console.error("Failed to load utilization heatmap:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const getGlowColor = (val) => {
        if (val === 0) return 'rgba(255, 255, 255, 0.02)';
        if (val < 25) return 'rgba(96, 165, 250, 0.15)';
        if (val < 50) return 'rgba(96, 165, 250, 0.4)';
        if (val < 75) return 'rgba(192, 132, 252, 0.65)';
        return 'rgba(168, 85, 247, 0.9)';
    };

    if (loading) {
        return (
            <div className="glass-card" style={{ padding: '20px', marginBottom: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading heatmap...
            </div>
        );
    }

    if (!heatmap) return null;

    const { days, hours, matrix } = heatmap;

    return (
        <div className="glass-card" style={{ padding: '20px', marginBottom: '30px' }}>
            <h5 style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hourly Utilization Heatmap</h5>

            <div className="table-responsive">
                <div style={{ minWidth: '600px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', paddingLeft: '50px' }}>
                        {hours.map((h, idx) => (
                            <div key={idx} style={{ flex: 1, textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                                {h}
                            </div>
                        ))}
                    </div>

                    {days.map((d, dayIdx) => (
                        <div key={dayIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '50px', fontSize: '12px', color: 'var(--text-main)', fontWeight: '500' }}>
                                {d}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                                {matrix[dayIdx].map((val, hourIdx) => (
                                    <div
                                        key={hourIdx}
                                        style={{
                                            flex: 1,
                                            height: '35px',
                                            borderRadius: '6px',
                                            backgroundColor: getGlowColor(val),
                                            border: '1px solid rgba(255, 255, 255, 0.05)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            color: val > 50 ? '#fff' : 'var(--text-muted)',
                                            transition: 'transform 0.2s',
                                            cursor: 'pointer'
                                        }}
                                        title={`${d} at ${hours[hourIdx]}: ${val}% utilized`}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        {val}%
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '15px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.05)' }}></span>
                    <span>0%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(96, 165, 250, 0.15)' }}></span>
                    <span>1-25%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(96, 165, 250, 0.4)' }}></span>
                    <span>26-50%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(192, 132, 252, 0.65)' }}></span>
                    <span>51-75%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(168, 85, 247, 0.9)' }}></span>
                    <span>76-100%</span>
                </div>
            </div>
        </div>
    );
}
