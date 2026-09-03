export default function Settings() {
    return (
        <div className="page-content">
            <div className="welcome-header">
                <h1>Settings</h1>
                <p>Manage your account preferences and notifications.</p>
            </div>
            
            <div className="dashboard-grid">
                <div className="card">
                    <div className="card-body">
                        <h4 className="mb-4">Notification Preferences</h4>
                        <div className="form-check form-switch mb-3">
                            <input className="form-check-input" type="checkbox" role="switch" id="emailNotif" defaultChecked />
                            <label className="form-check-label" htmlFor="emailNotif">Email Notifications</label>
                        </div>
                        <div className="form-check form-switch mb-3">
                            <input className="form-check-input" type="checkbox" role="switch" id="pushNotif" defaultChecked />
                            <label className="form-check-label" htmlFor="pushNotif">In-App Notifications</label>
                        </div>
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" role="switch" id="marketingNotif" />
                            <label className="form-check-label" htmlFor="marketingNotif">Marketing Updates</label>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <h4 className="mb-4">Account Security</h4>
                        <button className="btn btn-outline mb-3 w-100">Change Password</button>
                        <button className="btn btn-outline mb-3 w-100">Enable Two-Factor Auth (2FA)</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
