import { useState, useEffect } from "react";
import { getAnalyticsStats } from "../services/analyticsService";
import {
    ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip
} from "recharts";

const COLORS = ['#34d399', '#60a5fa', '#fbbf24', '#f87171', '#c084fc'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card" style={{ padding: '10px', background: 'rgba(15,23,42,0.95)' }}>
                {label && <p style={{ margin: 0, fontWeight: 'bold', fontSize: '12px' }}>{label}</p>}
                {payload.map((entry, idx) => (
                    <p key={idx} style={{ margin: '4px 0 0', color: entry.color, fontSize: '12px' }}>{entry.name}: {entry.value}</p>
                ))}
            </div>
        );
    }
    return null;
};

export default function DemandAnalysis() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getAnalyticsStats();
                setStats(data);
            } catch (err) {
                console.error("Error loading demand analytics:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading || !stats) {
        return (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
                Loading demand analytics...
            </div>
        );
    }

    const pieData = stats.demandTrends.map((item, idx) => ({ name: item.name, value: item.bookings, color: COLORS[idx % COLORS.length] }));

    return (
        <div className="animate-fade-in">
            <div className="page-header mb-4">
                <h2>Utilization Rate & Demand Analysis</h2>
                <p>Understand equipment demand patterns and peak usage across the network</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="glass-card" style={{ padding: '20px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Utilization Rate</span>
                    <span style={{ display: 'block', fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', marginTop: '8px' }}>{stats.utilizationRate}%</span>
                </div>
                <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #22d3ee' }}>
                    <span style={{ fontSize: '12px', color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Usage Hours</span>
                    <span style={{ display: 'block', fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', marginTop: '8px' }}>{stats.totalUsageHours}h</span>
                </div>
                <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #94a3b8' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Idle Hours</span>
                    <span style={{ display: 'block', fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', marginTop: '8px' }}>{stats.idleHours}h</span>
                </div>
                <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #c084fc' }}>
                    <span style={{ fontSize: '12px', color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Peak Usage Time</span>
                    <span style={{ display: 'block', fontSize: '17px', fontWeight: '700', color: 'var(--text-main)', marginTop: '12px' }}>{stats.peakUsageTime}</span>
                </div>
                <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #34d399' }}>
                    <span style={{ fontSize: '12px', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Most Requested</span>
                    <span style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', marginTop: '12px' }}>{stats.frequentlyRequested}</span>
                </div>
                <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #fbbf24' }}>
                    <span style={{ fontSize: '12px', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Booking Frequency</span>
                    <span style={{ display: 'block', fontSize: '17px', fontWeight: '700', color: 'var(--text-main)', marginTop: '12px' }}>{stats.bookingFrequency}</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '25px' }}>
                <div className="glass-card" style={{ padding: '20px' }}>
                    <h5 style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bookings Share by Category</h5>
                    <div style={{ height: '260px' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                                    {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                                </Pie>
                                <RechartsTooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                    <h5 style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Usage Hours by Category</h5>
                    <div style={{ height: '260px' }}>
                        <ResponsiveContainer>
                            <BarChart data={stats.demandTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Bar dataKey="hours" fill="#818cf8" radius={[4, 4, 0, 0]} name="Usage Hours" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                    <h5 style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hourly Demand Trend</h5>
                    <div style={{ height: '260px' }}>
                        <ResponsiveContainer>
                            <LineChart data={stats.hourlyUtilization} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={(v) => `${v}%`} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="rate" stroke="#60a5fa" strokeWidth={2.5} name="Demand Rate" dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                    <h5 style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Weekly Demand Volume</h5>
                    <div style={{ height: '260px' }}>
                        <ResponsiveContainer>
                            <AreaChart data={stats.dailyUtilization} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="demandAreaFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.5} />
                                        <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={(v) => `${v}%`} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="rate" stroke="#34d399" fill="url(#demandAreaFill)" strokeWidth={2} name="Utilization" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
