import React from 'react';

function Settings() {
    return (
        <div className="animate-fade-in">
            <div className="dashboard-header">
                <h1>Settings</h1>
                <p>Manage your application preferences</p>
            </div>
            
            <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
                <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Appearance</h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h4 style={{ margin: 0 }}>Dark Mode</h4>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Experience a darker, high-contrast theme</p>
                    </div>
                    <label className="switch">
                        <input type="checkbox" defaultChecked disabled />
                        <span className="slider"></span>
                    </label>
                </div>

                <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', margin: '2.5rem 0 1.5rem' }}>Notifications</h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h4 style={{ margin: 0 }}>Email Alerts</h4>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Receive booking and maintenance updates via email</p>
                    </div>
                    <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                    </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h4 style={{ margin: 0 }}>Browser Push Notifications</h4>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Get live alerts when in the app</p>
                    </div>
                    <label className="switch">
                        <input type="checkbox" />
                        <span className="slider"></span>
                    </label>
                </div>

                <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', margin: '2.5rem 0 1.5rem' }}>Security</h3>
                
                <div style={{ marginBottom: '1rem' }}>
                    <button className="glass-button danger" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                        Change Password
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Settings;
