
export default function StatusBadge({ status }) {
    let bg = 'rgba(255, 255, 255, 0.1)';
    let color = '#fff';
    let border = '1px solid rgba(255, 255, 255, 0.2)';
    let label = status || 'Unknown';

    switch (status?.toUpperCase()) {
        case 'AVAILABLE':
        case 'ACTIVE':
            bg = 'rgba(16, 185, 129, 0.15)'; // Green
            color = '#34d399';
            border = '1px solid rgba(16, 185, 129, 0.3)';
            label = 'Available';
            break;
        case 'IN_USE':
        case 'IN USE':
            bg = 'rgba(59, 130, 246, 0.15)'; // Blue
            color = '#60a5fa';
            border = '1px solid rgba(59, 130, 246, 0.3)';
            label = 'In Use';
            break;
        case 'BOOKED':
            bg = 'rgba(245, 158, 11, 0.15)'; // Yellow
            color = '#fbbf24';
            border = '1px solid rgba(245, 158, 11, 0.3)';
            label = 'Booked';
            break;
        case 'MAINTENANCE':
        case 'UNDER_MAINTENANCE':
        case 'UNDER MAINTENANCE':
            bg = 'rgba(239, 68, 68, 0.15)'; // Red
            color = '#f87171';
            border = '1px solid rgba(239, 68, 68, 0.3)';
            label = 'Maintenance';
            break;
        default:
            break;
    }

    return (
        <span 
            className="status-badge" 
            style={{ 
                background: bg, 
                color: color, 
                border: border, 
                padding: '4px 10px', 
                borderRadius: '20px', 
                fontSize: '12px', 
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
            }}
        >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color, display: 'inline-block' }}></span>
            {label}
        </span>
    );
}
