import { useEffect, useState } from "react";
import {
  getAllUsers,
  getPendingUsers,
  approveUser,
  updateUser,
  deleteUser,
} from "../api/userApi";
import { getDepartmentsByInstitution } from "../api/departmentApi";
import { extractErrorMessage } from "../api/client";
import { ROLE_LABELS } from "../utils/constants";
import {
  page, headerRow, h1Style, subStyle, card, filterBar, searchInput, selectStyle,
  thStyle, tdStyle, actionBtn, modalOverlay, modalCard, labelStyle, inputStyle,
  cancelBtn, primaryBtn, errorText, emptyText, pill,
} from "../styles/shared";

function Users({ showToast }) {
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [editingUser, setEditingUser] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", departmentId: "" });

  const load = () => {
    setLoading(true);
    Promise.allSettled([
      getAllUsers().then(setUsers),
      getPendingUsers().then(setPending),
    ])
      .then((results) => {
        const failed = results.find((r) => r.status === "rejected");
        if (failed) setError(extractErrorMessage(failed.reason, "Failed to load some user data."));
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const list = tab === "pending" ? pending : users;
  const filtered = list.filter((u) => {
    const matchesSearch =
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleApprove = async (u) => {
    try {
      await approveUser(u.email);
      showToast?.(`${u.firstName} ${u.lastName} approved.`, "success");
      load();
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Failed to approve user."), "warning");
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete user "${u.firstName} ${u.lastName}"?`)) return;
    try {
      await deleteUser(u.email);
      showToast?.(`${u.firstName} ${u.lastName} deleted.`, "success");
      load();
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Failed to delete user."), "warning");
    }
  };

  const openEdit = (u) => {
    setForm({
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      phone: u.phone || "",
      departmentId: u.department?.departId || "",
    });
    setEditingUser(u);
    if (u.institution?.institutionId) {
      getDepartmentsByInstitution(u.institution.institutionId).then(setDepartments).catch(() => setDepartments([]));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateUser(editingUser.email, {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        departmentId: form.departmentId ? Number(form.departmentId) : null,
      });
      showToast?.("User updated.", "success");
      setEditingUser(null);
      load();
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Failed to update user."), "warning");
    }
  };

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>Users</h1>
          <p style={subStyle}>Manage user accounts and pending approvals</p>
        </div>
      </div>

      {error && <p style={errorText}>{error}</p>}

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button onClick={() => setTab("all")} style={tab === "all" ? tabBtnActive : tabBtn}>
          All Users ({users.length})
        </button>
        <button onClick={() => setTab("pending")} style={tab === "pending" ? tabBtnActive : tabBtn}>
          Pending Approval ({pending.length})
        </button>
      </div>

      <div style={card}>
        <div style={filterBar}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." style={searchInput} />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={selectStyle}>
            <option value="All">All Roles</option>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <p style={{ padding: 20 }}>Loading users...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Institution</th>
                  <th style={thStyle}>Department</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.userId} style={{ borderBottom: "1px solid #f0f2f6" }}>
                    <td style={tdStyle}>{u.firstName} {u.lastName}</td>
                    <td style={tdStyle}>{u.email}</td>
                    <td style={tdStyle}>{ROLE_LABELS[u.role] || u.role}</td>
                    <td style={tdStyle}>{u.institution?.institutionName || "-"}</td>
                    <td style={tdStyle}>{u.department?.departmentName || "-"}</td>
                    <td style={tdStyle}>
                      <span style={u.isActive ? pill("#e8f7ee", "#16834b") : pill("#fff4df", "#b56a00")}>
                        {u.isActive ? "Active" : "Pending"}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, display: "flex", gap: 6 }}>
                      {!u.isActive && (
                        <button onClick={() => handleApprove(u)} style={{ ...actionBtn, color: "#16834b" }}>Approve</button>
                      )}
                      <button onClick={() => openEdit(u)} style={actionBtn}>Edit</button>
                      <button onClick={() => handleDelete(u)} style={{ ...actionBtn, color: "#c0392b" }}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={emptyText}>No users found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editingUser && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 19 }}>Edit {editingUser.firstName} {editingUser.lastName}</h2>
              <button onClick={() => setEditingUser(null)} style={{ border: "none", background: "none", fontSize: 19, cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>First Name</label>
                <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Last Name</label>
                <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Department</label>
                <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} style={inputStyle}>
                  <option value="">No department</option>
                  {departments.map((d) => (
                    <option key={d.departId} value={d.departId}>{d.departmentName}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 20 }}>
                <button type="button" onClick={() => setEditingUser(null)} style={cancelBtn}>Cancel</button>
                <button type="submit" style={primaryBtn}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const tabBtn = { padding: "9px 16px", borderRadius: 7, border: "1px solid #d9dfe8", background: "white", color: "#475569", fontSize: 13, cursor: "pointer" };
const tabBtnActive = { ...tabBtn, background: "#2563eb", borderColor: "#2563eb", color: "white", fontWeight: 600 };

export default Users;
