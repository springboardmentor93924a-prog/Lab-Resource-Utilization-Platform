import { Link } from "react-router-dom";

export default function Unauthorized() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="card shadow-sm text-center p-5" style={{ maxWidth: '500px', borderTop: '4px solid var(--danger)' }}>
                <h1 style={{ fontSize: '4rem', margin: 0, color: 'var(--danger)' }}>403</h1>
                <h2 className="mb-4">Access Restricted</h2>
                <p className="text-muted mb-4">
                    You don't have permission to access this resource.
                </p>
                <Link to="/" className="btn btn-primary">
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
