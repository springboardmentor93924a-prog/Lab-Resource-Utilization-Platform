import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { user } = useAuth();
    
    // Fallbacks if user details are missing
    const name = user?.name || "User";
    const email = user?.email || "user@institution.edu";
    const role = user?.role ? user.role.replace('ROLE_', '').replace('_', ' ') : 'Unknown Role';
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <div className="page-content">
            <div className="welcome-header">
                <h1>My Profile</h1>
                <p>View and manage your personal information.</p>
            </div>
            
            <div className="dashboard-grid">
                <div className="card">
                    <div className="card-body" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <div style={{
                            width: '80px', height: '80px', 
                            background: 'var(--accent)', color: 'white', 
                            borderRadius: '50%', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem', fontWeight: '700'
                        }}>
                            {initials}
                        </div>
                        <div>
                            <h2 style={{ marginBottom: '4px' }}>{name}</h2>
                            <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                                {role.toLowerCase()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <h4 className="mb-4" style={{ marginBottom: '24px' }}>Contact Information</h4>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>Email Address</label>
                            <div style={{ fontWeight: '500' }}>{email}</div>
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>Institution</label>
                            <div style={{ fontWeight: '500' }}>{user?.institution || "Default Institution"}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
