
function Profile() {
    const name = localStorage.getItem('name') || 'User';
    const email = localStorage.getItem('email') || 'No email provided';
    const role = localStorage.getItem('role') || 'User';

    return (
        <div className="animate-fade-in">
            <div className="dashboard-header">
                <h1>My Profile</h1>
                <p>View and manage your personal details</p>
            </div>
            
            <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2rem' }}>
                    <div style={{
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '50%', 
                        background: 'var(--accent-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: 'white'
                    }}>
                        {name[0].toUpperCase()}
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '24px' }}>{name}</h2>
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>{role.replace('ROLE_', '').replace('_', ' ')}</p>
                    </div>
                </div>

                <div className="glass-form-group">
                    <label>Full Name</label>
                    <input type="text" className="glass-input" value={name} readOnly />
                </div>
                
                <div className="glass-form-group">
                    <label>Email Address</label>
                    <input type="email" className="glass-input" value={email} readOnly />
                </div>
                
                <div className="glass-form-group">
                    <label>Role</label>
                    <input type="text" className="glass-input" value={role.replace('ROLE_', '').replace('_', ' ')} readOnly />
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <button className="glass-button" disabled>Edit Profile (Coming Soon)</button>
                </div>
            </div>
        </div>
    );
}

export default Profile;
