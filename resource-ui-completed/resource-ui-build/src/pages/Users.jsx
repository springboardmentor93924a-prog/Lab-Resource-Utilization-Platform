import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser as deleteUserService } from "../services/userService";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

function Users() {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
        department: ""
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { addToast } = useToast();
    const { isSuperAdmin } = useAuth();

    // Search and Pagination
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data || []);
            setError("");
        } catch (err) {
            console.error(err);
            // setError("Unable to load users. Ensure backend is running or enable DEV MODE.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setTimeout(() => loadUsers(), 0);
        const handleStorage = () => loadUsers();
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({ name: "", email: "", password: "", role: "", department: "" });
        setEditingId(null);
        setError("");
    };

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await updateUser(editingId, formData);
                addToast("User updated successfully!");
            } else {
                await createUser(formData);
                addToast("User added successfully!");
            }
            resetForm();
            await loadUsers();
        } catch (err) {
            console.error(err);
            setError("Unable to save user.");
            addToast("Failed to save user.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const editUser = (user) => {
        setEditingId(user.id);
        setFormData({
            name: user.name ?? "",
            email: user.email ?? "",
            password: user.password ?? "",
            role: user.role ?? "",
            department: user.department ?? ""
        });
        setError("");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await deleteUserService(id);
            addToast("User deleted successfully!");
            await loadUsers();
        } catch (err) {
            console.error(err);
            setError("Unable to delete user.");
            addToast("Failed to delete user.", "error");
        }
    };

    // Derived State
    const filteredUsers = users.filter(u => {
        const uRole = u.role?.toUpperCase() || "";
        const isAdminType = uRole === "ADMIN" || uRole === "SUPER_ADMIN" || uRole === "ROLE_ADMIN" || uRole === "ROLE_SUPER_ADMIN";
        
        if (isSuperAdmin) {
            if (!isAdminType) return false;
        } else {
            if (isAdminType) return false;
        }

        const matchesSearch = (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (u.email || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole ? u.role === filterRole : true;
        return matchesSearch && matchesRole;
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>User Management</h2>
                    <p>Manage system access and roles</p>
                </div>
            </div>

            {error && <div className="pro-alert">{error}</div>}

            <div className="glass-card" style={{marginBottom: '40px'}}>
                <h4 style={{marginTop: 0, marginBottom: '20px', fontSize: '20px'}}>
                    {editingId ? "Edit User" : "Add New User"}
                </h4>
                <form onSubmit={submit}>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0 20px'}}>
                        <div className="glass-form-group">
                            <label>Name *</label>
                            <input type="text" className="glass-input" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="glass-form-group">
                            <label>Email *</label>
                            <input type="email" className="glass-input" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="glass-form-group">
                            <label>Password</label>
                            <input type="password" className="glass-input" name="password" value={formData.password} onChange={handleChange} required={!editingId} placeholder={editingId ? "Leave blank to keep unchanged" : ""} />
                        </div>
                        <div className="glass-form-group">
                            <label>Role *</label>
                            <select className="glass-select" name="role" value={formData.role} onChange={handleChange} required>
                                <option value="">Select Role</option>
                                {isSuperAdmin ? (
                                    <>
                                        <option value="ADMIN">Admin</option>
                                        <option value="SUPER_ADMIN">Super Admin</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="STUDENT">Student</option>
                                        <option value="FACULTY">Faculty</option>
                                        <option value="USER">User</option>
                                    </>
                                )}
                            </select>
                        </div>
                        <div className="glass-form-group">
                            <label>Department *</label>
                            <input type="text" className="glass-input" name="department" value={formData.department} onChange={handleChange} required />
                        </div>
                    </div>
                    <div style={{display: 'flex', gap: '12px', marginTop: '10px'}}>
                        <button type="submit" className="glass-btn" disabled={submitting}>
                            {submitting ? "Saving..." : (editingId ? "Update User" : "Add User")}
                        </button>
                        {editingId && <button type="button" className="glass-btn" style={{background: 'rgba(255,255,255,0.1)'}} onClick={resetForm} disabled={submitting}>Cancel</button>}
                    </div>
                </form>
            </div>

            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                    <h4 style={{ margin: 0, fontSize: '20px' }}>Current Users</h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            type="text" 
                            className="glass-input" 
                            placeholder="Search name or email..." 
                            value={searchQuery}
                            onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
                            style={{ width: '250px' }}
                        />
                        <select 
                            className="glass-select" 
                            value={filterRole}
                            onChange={(e) => {setFilterRole(e.target.value); setCurrentPage(1);}}
                        >
                            <option value="">All Roles</option>
                            {isSuperAdmin ? (
                                <>
                                    <option value="ADMIN">Admin</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                </>
                            ) : (
                                <>
                                    <option value="STUDENT">Student</option>
                                    <option value="FACULTY">Faculty</option>
                                    <option value="USER">User</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="glass-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Department</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan="5" style={{textAlign: 'center'}}>Loading...</td></tr> : paginatedUsers.length > 0 ? (
                                paginatedUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td><span className="status-badge" style={{background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)', border: '1px solid rgba(255,255,255,0.2)'}}>{user.role}</span></td>
                                        <td>{user.department}</td>
                                        <td>
                                            <button className="glass-btn" style={{padding: '0 12px', height: '32px', fontSize: '12px', marginRight: '8px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24'}} onClick={() => editUser(user)}>Edit</button>
                                            <button className="glass-btn" style={{padding: '0 12px', height: '32px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171'}} onClick={() => deleteUser(user.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : <tr><td colSpan="5" style={{textAlign: 'center'}}>No users found</td></tr>}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' }}>
                        <button className="glass-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '5px 15px' }}>Previous</button>
                        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Page {currentPage} of {totalPages}</span>
                        <button className="glass-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '5px 15px' }}>Next</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Users;