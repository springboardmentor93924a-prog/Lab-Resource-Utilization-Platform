import StatusBadge from './StatusBadge';

export default function EquipmentCard({ equipment, isRecentUpdate }) {
    return (
        <div 
            className={`glass-card equipment-card ${isRecentUpdate ? 'glow-update' : ''}`}
            style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                transition: 'all 0.3s ease',
                border: isRecentUpdate ? '1.5px solid rgba(59, 130, 246, 0.8)' : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isRecentUpdate ? '0 0 20px rgba(59, 130, 246, 0.4)' : 'none',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)'
            }}
        >
            {isRecentUpdate && (
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(59, 130, 246, 0.9)',
                    color: '#fff',
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    animation: 'pulse 1.5s infinite',
                    zIndex: 2,
                    boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)'
                }}>
                    Live Update
                </div>
            )}
            
            <div style={{ padding: '20px', flex: '1 0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {equipment.categoryName || 'General Category'}
                    </span>
                    <StatusBadge status={equipment.availabilityStatus} />
                </div>
                
                <h4 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '600', color: 'var(--text-main)' }}>
                    {equipment.name}
                </h4>
                
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 15px 0', minHeight: '36px' }}>
                    {equipment.description || 'No description available for this asset.'}
                </p>
                
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '12px', marginTop: '12px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Institution:</span>
                        <span style={{ fontWeight: '500', color: 'var(--text-main)', textAlign: 'right' }}>{equipment.institutionName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                        <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{equipment.location || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Model / S/N:</span>
                        <span style={{ fontWeight: '500', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                            {equipment.modelNumber || 'N/A'} / {equipment.serialNumber || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
