
export default function DashboardCards({ stats }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Assets</span>
                <span style={{ display: 'block', fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', marginTop: '8px' }}>{stats.totalEquipment}</span>
            </div>
            <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #34d399' }}>
                <span style={{ fontSize: '12px', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available Assets</span>
                <span style={{ display: 'block', fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', marginTop: '8px' }}>{stats.availableCount}</span>
            </div>
            <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #60a5fa' }}>
                <span style={{ fontSize: '12px', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assets In Use</span>
                <span style={{ display: 'block', fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', marginTop: '8px' }}>{stats.inUseCount}</span>
            </div>
            <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #f87171' }}>
                <span style={{ fontSize: '12px', color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Under Maintenance</span>
                <span style={{ display: 'block', fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', marginTop: '8px' }}>{stats.maintenanceCount}</span>
            </div>
            <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #c084fc' }}>
                <span style={{ fontSize: '12px', color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Utilization Rate</span>
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
        </div>
    );
}
