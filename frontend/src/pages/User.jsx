import "./User.css";

function User() {
  const userList = [
    {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      role: "ADMIN",
      department: "Computer Science",
      status: "Active",
    },
    {
      id: 2,
      name: "Lab Manager",
      email: "manager@example.com",
      role: "LAB_MANAGER",
      department: "Electronics",
      status: "Active",
    },
    {
      id: 3,
      name: "Test User",
      email: "user@example.com",
      role: "USER",
      department: "Mechanical",
      status: "Inactive",
    },
  ];

  return (
    <div className="user-container">

      <div className="user-header">
        <div>
          <h2>User Management</h2>
          <p>Manage users, roles and departments</p>
        </div>

        <button className="add-user-btn">
          + Add User
        </button>
      </div>

      <div className="user-toolbar">
        <input
          className="user-search"
          type="text"
          placeholder="Search users..."
        />
      </div>

      <div className="user-table-card">

        <table className="user-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {userList.map((user) => (
              <tr key={user.id}>

                <td className="user-id">
                  {user.id}
                </td>

                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.name.charAt(0)}
                    </div>

                    <span>{user.name}</span>
                  </div>
                </td>

                <td className="user-email">
                  {user.email}
                </td>

                <td>
                  <span className="role-badge">
                    {user.role}
                  </span>
                </td>

                <td>
                  {user.department}
                </td>

                <td>
                  <span
                    className={
                      user.status === "Active"
                        ? "status-badge active"
                        : "status-badge inactive"
                    }
                  >
                    ● {user.status}
                  </span>
                </td>

                <td>
                  <button className="edit-user-btn">
                    Edit
                  </button>

                  <button className="delete-user-btn">
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

      <div className="user-footer">
        Showing {userList.length} users
      </div>

    </div>
  );
}

export default User;