export default function UsersPage() {
  return (
    <div className="page-grid">
      <div className="panel-card">
        <h2>User management</h2>
        <p>Manage users, roles, permissions, audit logs, and access controls.</p>
        <div className="table-card">
          <div className="table-row"><strong>Name</strong><strong>Role</strong><strong>Status</strong></div>
          <div className="table-row"><span>Dr. Nisha Patel</span><span>Researcher</span><span>Active</span></div>
          <div className="table-row"><span>Ravi Kumar</span><span>Lab Technician</span><span>Active</span></div>
        </div>
      </div>
    </div>
  );
}
