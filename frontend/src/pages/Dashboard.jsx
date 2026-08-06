import { useEffect, useState } from "react";
import { getDashboard } from "../services/dashboardService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import HeatMap from "../components/HeatMap";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card" style={{ padding: '10px', background: 'rgba(15, 23, 42, 0.9)' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ margin: '5px 0 0 0', color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

function Dashboard() {
    const [dashboard, setDashboard] = useState({
        totalUsers: 0,
        totalInstitutions: 0,
        totalDepartments: 0,
        totalEquipment: 0,
        availableEquipment: 0,
        bookedEquipment: 0,
        totalBookings: 0,
        pendingBookings: 0,
        approvedBookings: 0,
        recentBookings: [],
        utilizationTrends: [],
        equipmentDistribution: [],
        resourceSharingRequests: 0,
        waitlistCount: 0,
        idleEquipmentCount: 0,
        recentActivities: []
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const data = await getDashboard();
            setDashboard({
                totalUsers: data.totalUsers || 0,
                totalInstitutions: data.totalInstitutions || 0,
                totalDepartments: data.totalDepartments || 0,
                totalEquipment: data.totalEquipment || 0,
                availableEquipment: data.availableEquipment || 0,
                bookedEquipment: data.bookedEquipment || 0,
                totalBookings: data.totalBookings || 0,
                pendingBookings: data.pendingBookings || 0,
                approvedBookings: data.approvedBookings || 0,
                recentBookings: data.recentBookings || [],
                utilizationTrends: data.utilizationTrends || [],
                equipmentDistribution: data.equipmentDistribution || [],
                resourceSharingRequests: data.resourceSharingRequests || 0,
                waitlistCount: data.waitlistCount || 0,
                idleEquipmentCount: data.idleEquipmentCount || 0,
                recentActivities: data.recentActivities || []
            });
            setError("");
        } catch (err) {
            console.error(err);
            // setError("Unable to load dashboard data. Ensure backend is running or enable DEV MODE in topbar.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setTimeout(() => loadDashboard(), 0);
        const handleStorage = () => loadDashboard();
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    

    const getStatusClass = (status) => {
        if (!status) return "";
        return `status-badge status-${status.toLowerCase()}`;
    };
    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>Overview Dashboard</h2>
                    <p>Lab Resource Utilization Platform</p>
                </div>
                <button className="glass-btn" onClick={loadDashboard}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                    Refresh Data
                </button>
            </div>

            {error && (
                <div className="pro-alert">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'8px', verticalAlign:'text-bottom'}}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    {error}
                </div>
            )}

            {loading ? (
                <div style={{textAlign:'center', padding:'50px', color:'var(--text-muted)'}}>
                    Loading data...
                </div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div className="glass-card stat-card" style={{gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(59, 130, 246, 0.1))', border: '1px solid rgba(56, 189, 248, 0.2)'}}>
                            <h5>Total Network</h5>
                            <div style={{display:'flex', gap:'40px', marginTop:'10px'}}>
                                <div>
                                    <h2 style={{color: '#38bdf8'}}>{dashboard.totalInstitutions}</h2>
                                    <div style={{fontSize:'12px', color:'var(--text-muted)'}}>Institutions</div>
                                </div>
                                <div>
                                    <h2 style={{color: '#818cf8'}}>{dashboard.totalDepartments}</h2>
                                    <div style={{fontSize:'12px', color:'var(--text-muted)'}}>Departments</div>
                                </div>
                                <div>
                                    <h2 style={{color: '#c084fc'}}>{dashboard.totalUsers}</h2>
                                    <div style={{fontSize:'12px', color:'var(--text-muted)'}}>Users</div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card stat-card">
                            <h5>Total Equipment</h5>
                            <h2>{dashboard.totalEquipment}</h2>
                        </div>
                        <div className="glass-card stat-card">
                            <h5>Available Equipment</h5>
                            <h2 style={{color: 'var(--success)'}}>{dashboard.availableEquipment}</h2>
                        </div>
                        <div className="glass-card stat-card">
                            <h5>Booked Equipment</h5>
                            <h2 style={{color: 'var(--warning)'}}>{dashboard.bookedEquipment}</h2>
                        </div>
                        <div className="glass-card stat-card">
                            <h5>Total Bookings</h5>
                            <h2>{dashboard.totalBookings}</h2>
                        </div>
                        <div className="glass-card stat-card">
                            <h5>Pending Bookings</h5>
                            <h2 style={{color: 'var(--warning)'}}>{dashboard.pendingBookings}</h2>
                        </div>
                        <div className="glass-card stat-card">
                            <h5>Approved Bookings</h5>
                            <h2 style={{color: 'var(--success)'}}>{dashboard.approvedBookings}</h2>
                        </div>
                        <div className="glass-card stat-card">
                            <h5>Resource Sharing Requests</h5>
                            <h2 style={{color: '#c084fc'}}>{dashboard.resourceSharingRequests}</h2>
                        </div>
                        <div className="glass-card stat-card">
                            <h5>Waitlist Count</h5>
                            <h2 style={{color: '#60a5fa'}}>{dashboard.waitlistCount}</h2>
                        </div>
                        <div className="glass-card stat-card">
                            <h5>Idle Equipment</h5>
                            <h2 style={{color: '#f87171'}}>{dashboard.idleEquipmentCount}</h2>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div className="glass-card">
                            <h4 style={{marginTop: 0, marginBottom: '20px', fontSize: '16px'}}>Utilization Trends (Last 6 Months)</h4>
                            <div style={{ height: '300px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dashboard.utilizationTrends} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                        <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                                        <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        <Bar dataKey="bookings" name="Bookings" fill="#818cf8" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="usageHours" name="Usage Hours" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="glass-card">
                            <h4 style={{marginTop: 0, marginBottom: '20px', fontSize: '16px'}}>Equipment Status Distribution</h4>
                            <div style={{ height: '300px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={dashboard.equipmentDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {dashboard.equipmentDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                                {dashboard.equipmentDistribution.map(entry => (
                                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: entry.color }}></div>
                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{entry.name} ({entry.value})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="glass-card">
                        <h4 style={{marginTop: 0, marginBottom: '20px', fontSize: '20px'}}>Recent Bookings</h4>
                        <div className="table-responsive">
                            <table className="glass-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>User</th>
                                        <th>Equipment</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboard.recentBookings.length > 0 ? (
                                        dashboard.recentBookings.map((booking) => (
                                            <tr key={booking.id}>
                                                <td>#{booking.id}</td>
                                                <td>{booking.userName}</td>
                                                <td>{booking.equipmentName}</td>
                                                <td>{booking.bookingDate}</td>
                                                <td>
                                                    <span className={getStatusClass(booking.status)}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{textAlign: 'center', padding: '30px', color: 'var(--text-muted)'}}>
                                                No recent bookings found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginTop: '30px' }}>
                        <HeatMap />

                        <div className="glass-card">
                            <h4 style={{marginTop: 0, marginBottom: '20px', fontSize: '20px'}}>Recent Activities</h4>
                            {dashboard.recentActivities.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {dashboard.recentActivities.map(act => (
                                        <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                            <span style={{
                                                width: '8px', height: '8px', borderRadius: '50%', marginTop: '6px', flexShrink: 0,
                                                backgroundColor: act.type === 'BOOKING' ? '#60a5fa' : act.type === 'SHARING' ? '#c084fc' : act.type === 'WAITLIST' ? '#fbbf24' : '#f87171'
                                            }}></span>
                                            <div>
                                                <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>{act.message}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{new Date(act.timestamp).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No recent activity.</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Dashboard;