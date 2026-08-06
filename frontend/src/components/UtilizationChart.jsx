import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#34d399', '#60a5fa', '#fbbf24', '#f87171'];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card" style={{ padding: '10px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {payload.map((entry, index) => (
                    <p key={index} style={{ margin: 0, color: entry.color || '#fff', fontSize: '12px', fontWeight: '500' }}>
                        {entry.name}: {entry.value}%
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function UtilizationChart({ hourlyData, dailyData, categoryDistribution }) {
    // Pie chart formatted data
    const pieData = categoryDistribution.map((item, idx) => ({
        name: item.name,
        value: item.bookings,
        color: COLORS[idx % COLORS.length]
    }));

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginBottom: '30px' }}>
            {/* Line Chart: Hourly Utilization */}
            <div className="glass-card" style={{ padding: '20px' }}>
                <h5 style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hourly Utilization Trend</h5>
                <div style={{ width: '100%', height: '220px' }}>
                    <ResponsiveContainer>
                        <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="hour" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="rate" stroke="#60a5fa" strokeWidth={2.5} name="Utilization Rate" activeDot={{ r: 6 }} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bar Chart: Daily Utilization */}
            <div className="glass-card" style={{ padding: '20px' }}>
                <h5 style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Weekly Utilization Breakdown</h5>
                <div style={{ width: '100%', height: '220px' }}>
                    <ResponsiveContainer>
                        <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Bar dataKey="rate" fill="#34d399" radius={[4, 4, 0, 0]} name="Utilization Rate">
                                {dailyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.rate > 75 ? '#c084fc' : '#34d399'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pie Chart: Bookings Category distribution */}
            <div className="glass-card" style={{ padding: '20px' }}>
                <h5 style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Share of Bookings by Category</h5>
                <div style={{ display: 'flex', alignItems: 'center', height: '220px' }}>
                    <div style={{ width: '50%', height: '100%' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={75}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ width: '50%', paddingLeft: '10px', fontSize: '12px' }}>
                        {pieData.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '8px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color, display: 'inline-block' }}></span>
                                <span style={{ color: 'var(--text-muted)' }}>{item.name}:</span>
                                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
