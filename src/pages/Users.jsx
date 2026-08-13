import { useState } from "react";

function Users() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [users, setUsers] = useState([
    {
      id: "USR001",
      name: "Admin User",
      email: "admin@labresource.com",
      role: "SYSTEM_ADMIN",
      department: "Administration",
      status: "Active",
    },
    {
      id: "USR002",
      name: "Institution Admin",
      email: "institution@labresource.com",
      role: "INSTITUTION_ADMIN",
      department: "Administration",
      status: "Active",
    },
    {
      id: "USR003",
      name: "Department Head",
      email: "head@labresource.com",
      role: "DEPARTMENT_HEAD",
      department: "ECE",
      status: "Active",
    },
    {
      id: "USR004",
      name: "Lab Manager",
      email: "manager@labresource.com",
      role: "LAB_MANAGER",
      department: "ECE",
      status: "Active",
    },
    {
      id: "USR005",
      name: "Lab Technician",
      email: "technician@labresource.com",
      role: "LAB_TECHNICIAN",
      department: "Mechanical",
      status: "Active",
    },
    {
      id: "USR006",
      name: "Researcher",
      email: "researcher@labresource.com",
      role: "RESEARCHER",
      department: "Physics",
      status: "Active",
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "RESEARCHER",
    department: "",
    status: "Active",
  });

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status === "Inactive"
  ).length;

  const researchers = users.filter(
    (user) => user.role === "RESEARCHER"
  ).length;

  const filteredUsers = users.filter((user) => {
    const text = search.toLowerCase();

    const matchesSearch =
      user.id.toLowerCase().includes(text) ||
      user.name.toLowerCase().includes(text) ||
      user.email.toLowerCase().includes(text) ||
      user.department.toLowerCase().includes(text);

    const matchesRole =
      roleFilter === "All" || user.role === roleFilter;

    const matchesStatus =
      statusFilter === "All" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const addUser = (e) => {
    e.preventDefault();

    const newUser = {
      id: `USR${String(users.length + 1).padStart(3, "0")}`,
      name: form.name,
      email: form.email,
      role: form.role,
      department: form.department,
      status: form.status,
    };

    setUsers([...users, newUser]);

    setForm({
      name: "",
      email: "",
      role: "RESEARCHER",
      department: "",
      status: "Active",
    });

    setShowAddForm(false);
  };

  const getRoleLabel = (role) => {
    return role
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getRoleStyle = (role) => {
    const styles = {
      SYSTEM_ADMIN: {
        background: "#eee9ff",
        color: "#6941c6",
      },
      INSTITUTION_ADMIN: {
        background: "#eaf2ff",
        color: "#2563eb",
      },
      DEPARTMENT_HEAD: {
        background: "#e9f8ef",
        color: "#16834b",
      },
      LAB_MANAGER: {
        background: "#fff4df",
        color: "#b56a00",
      },
      LAB_TECHNICIAN: {
        background: "#fcecec",
        color: "#c0392b",
      },
      RESEARCHER: {
        background: "#edf0f5",
        color: "#596579",
      },
    };

    return styles[role] || styles.RESEARCHER;
  };

  const getStatusStyle = (status) => {
    if (status === "Active") {
      return {
        background: "#e8f7ee",
        color: "#16834b",
      };
    }

    return {
      background: "#fdecec",
      color: "#c0392b",
    };
  };

  return (
    <div
      style={{
        padding: "30px 34px",
        background: "#f6f8fc",
        minHeight: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "26px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 700,
              color: "#172b4d",
            }}
          >
            User Management
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              fontSize: "14px",
              color: "#718096",
            }}
          >
            Manage platform users and their roles
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          style={{
            border: "none",
            background: "#2563eb",
            color: "white",
            padding: "11px 18px",
            borderRadius: "7px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + Add User
        </button>
      </div>

      {/* STATISTICS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <StatCard
          icon="▣"
          title="Total Users"
          value={totalUsers}
          background="#eaf2ff"
          color="#2563eb"
        />

        <StatCard
          icon="✓"
          title="Active Users"
          value={activeUsers}
          background="#e9f8ef"
          color="#16834b"
        />

        <StatCard
          icon="●"
          title="Inactive Users"
          value={inactiveUsers}
          background="#fdecec"
          color="#c0392b"
        />

        <StatCard
          icon="R"
          title="Researchers"
          value={researchers}
          background="#eee9ff"
          color="#6941c6"
        />
      </div>

      {/* TABLE CARD */}

      <div
        style={{
          background: "white",
          border: "1px solid #e4e8ef",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(20, 40, 70, 0.04)",
          overflow: "hidden",
        }}
      >
        {/* FILTER BAR */}

        <div
          style={{
            padding: "17px 20px",
            borderBottom: "1px solid #e8ecf2",
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "40px",
              border: "1px solid #d9dfe8",
              borderRadius: "7px",
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
            }}
          >
            <span
              style={{
                color: "#8b96a8",
                fontSize: "18px",
                marginRight: "8px",
              }}
            >
              ⌕
            </span>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "13px",
              }}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="All">All Roles</option>
            <option value="SYSTEM_ADMIN">System Admin</option>
            <option value="INSTITUTION_ADMIN">
              Institution Admin
            </option>
            <option value="DEPARTMENT_HEAD">
              Department Head
            </option>
            <option value="LAB_MANAGER">
              Lab Manager
            </option>
            <option value="LAB_TECHNICIAN">
              Lab Technician
            </option>
            <option value="RESEARCHER">Researcher</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* TABLE */}

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1050px",
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <TableHeader>ID</TableHeader>
                <TableHeader>User</TableHeader>
                <TableHeader>Role</TableHeader>
                <TableHeader>Department</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: "1px solid #edf0f4",
                  }}
                >
                  {/* ID */}

                  <td style={tdStyle}>
                    <span
                      style={{
                        color: "#718096",
                        fontWeight: 600,
                        fontSize: "12px",
                      }}
                    >
                      {user.id}
                    </span>
                  </td>

                  {/* USER */}

                  <td style={tdStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "11px",
                      }}
                    >
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          background: "#edf4ff",
                          color: "#2563eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "13px",
                        }}
                      >
                        {user.name.charAt(0)}
                      </div>

                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#24344d",
                            marginBottom: "3px",
                          }}
                        >
                          {user.name}
                        </div>

                        <div
                          style={{
                            fontSize: "11px",
                            color: "#8792a3",
                          }}
                        >
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* ROLE */}

                  <td style={tdStyle}>
                    <span
                      style={{
                        ...getRoleStyle(user.role),
                        display: "inline-block",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </td>

                  {/* DEPARTMENT */}

                  <td style={tdStyle}>
                    {user.department}
                  </td>

                  {/* STATUS */}

                  <td style={tdStyle}>
                    <span
                      style={{
                        ...getStatusStyle(user.status),
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "5px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "currentColor",
                        }}
                      />

                      {user.status}
                    </span>
                  </td>

                  {/* ACTIONS */}

                  <td style={tdStyle}>
                    <div
                      style={{
                        display: "flex",
                        gap: "7px",
                      }}
                    >
                      <button style={viewButton}>
                        View
                      </button>

                      <button style={editButton}>
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}

        <div
          style={{
            padding: "13px 20px",
            background: "#fafbfc",
            color: "#8792a3",
            fontSize: "11px",
            borderTop: "1px solid #edf0f4",
          }}
        >
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* ADD USER MODAL */}

      {showAddForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "620px",
              maxWidth: "90%",
              background: "white",
              borderRadius: "12px",
              padding: "25px",
              boxSizing: "border-box",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            {/* MODAL HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    color: "#172b4d",
                  }}
                >
                  Add User
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: "12px",
                    color: "#718096",
                  }}
                >
                  Create a new platform user
                </p>
              </div>

              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  border: "none",
                  background: "#f1f4f8",
                  width: "30px",
                  height: "30px",
                  borderRadius: "6px",
                  fontSize: "19px",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={addUser}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "17px",
                }}
              >
                <FormInput
                  label="Full Name"
                  placeholder="e.g. Rahul Kumar"
                  value={form.name}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      name: value,
                    })
                  }
                />

                <FormInput
                  label="Email"
                  type="email"
                  placeholder="e.g. rahul@example.com"
                  value={form.email}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      email: value,
                    })
                  }
                />

                <div>
                  <label style={labelStyle}>
                    Role
                  </label>

                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        role: e.target.value,
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="SYSTEM_ADMIN">
                      System Admin
                    </option>

                    <option value="INSTITUTION_ADMIN">
                      Institution Admin
                    </option>

                    <option value="DEPARTMENT_HEAD">
                      Department Head
                    </option>

                    <option value="LAB_MANAGER">
                      Lab Manager
                    </option>

                    <option value="LAB_TECHNICIAN">
                      Lab Technician
                    </option>

                    <option value="RESEARCHER">
                      Researcher
                    </option>
                  </select>
                </div>

                <FormInput
                  label="Department"
                  placeholder="e.g. ECE"
                  value={form.department}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      department: value,
                    })
                  }
                />

                <div>
                  <label style={labelStyle}>
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value,
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </div>
              </div>

              {/* BUTTONS */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "9px",
                  marginTop: "25px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "6px",
                    border: "1px solid #d8dee8",
                    background: "white",
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    padding: "9px 17px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#2563eb",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


/* =========================
   COMPONENTS
========================= */

function StatCard({
  icon,
  title,
  value,
  background,
  color,
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e4e8ef",
        borderRadius: "12px",
        padding: "18px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        boxShadow: "0 2px 8px rgba(20, 40, 70, 0.04)",
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "9px",
          background,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "17px",
          fontWeight: 700,
        }}
      >
        {icon}
      </div>

      <div>
        <p
          style={{
            margin: "0 0 4px",
            color: "#718096",
            fontSize: "12px",
          }}
        >
          {title}
        </p>

        <h2
          style={{
            margin: 0,
            fontSize: "23px",
            color: "#172b4d",
          }}
        >
          {value}
        </h2>
      </div>
    </div>
  );
}


function TableHeader({ children }) {
  return (
    <th
      style={{
        padding: "13px 16px",
        textAlign: "left",
        color: "#64748b",
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        borderBottom: "1px solid #e2e8f0",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}


function FormInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
      </label>

      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </div>
  );
}


/* =========================
   STYLES
========================= */

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "12px",
  fontWeight: 600,
  color: "#334155",
};

const inputStyle = {
  width: "100%",
  height: "40px",
  boxSizing: "border-box",
  border: "1px solid #d8dee8",
  borderRadius: "6px",
  padding: "0 10px",
  fontSize: "13px",
  background: "white",
  color: "#334155",
  outline: "none",
};

const selectStyle = {
  height: "40px",
  minWidth: "150px",
  border: "1px solid #d9dfe8",
  borderRadius: "7px",
  padding: "0 10px",
  background: "white",
  color: "#475569",
  fontSize: "13px",
  outline: "none",
};

const tdStyle = {
  padding: "14px 16px",
  color: "#475569",
  fontSize: "13px",
  whiteSpace: "nowrap",
};

const viewButton = {
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#2563eb",
  padding: "5px 10px",
  borderRadius: "5px",
  fontSize: "11px",
  cursor: "pointer",
};

const editButton = {
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#64748b",
  padding: "5px 10px",
  borderRadius: "5px",
  fontSize: "11px",
  cursor: "pointer",
};

export default Users;