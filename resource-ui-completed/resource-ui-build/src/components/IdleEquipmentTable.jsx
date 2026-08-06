export default function IdleEquipmentTable({ data }) {
    return (
        <div className="glass-card">
            <h5 style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Idle Equipment & Recommendations</h5>
            
            <div className="table-responsive">
                <table className="glass-table">
                    <thead>
                        <tr>
                            <th>Equipment</th>
                            <th>Institution</th>
                            <th>Idle Days</th>
                            <th>Recommendation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map(item => (
                                <tr key={item.id}>
                                    <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{item.name}</td>
                                    <td>{item.institutionName}</td>
                                    <td>
                                        <span className="status-badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                            {item.idleDays} Days
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.recommendation}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No idle equipment identified.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
