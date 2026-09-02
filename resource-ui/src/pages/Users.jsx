import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Users() {
    const { isSystemAdmin } = useAuth();
    const [dashboard, setDashboard] = useState(null);
    const [institutions, setInstitutions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Institution form
    const [instForm, setInstForm] = useState({ name: "", email: "", phone: "", address: "", city: "", state: "", country: "", status: "ACTIVE" });
    const [editingInstId, setEditingInstId] = useState(null);

    // Department form
    const [deptForm, setDeptForm] = useState({ name: "", description: "", institutionId: "" });
    const [editingDeptId, setEditingDeptId] = useState(null);

    const loadAll = async () => {
        try {
            const [dashRes, instRes, deptRes] = await Promise.all([
                api.get("/dashboard").catch(() => ({ data: null })),
                api.get("/institutions").catch(() => ({ data: [] })),
                api.get("/departments").catch(() => ({ data: [] }))
            ]);
            setDashboard(dashRes.data);
            setInstitutions(instRes.data || []);
            setDepartments(deptRes.data || []);
        } catch (err) {
            console.error(err);
            setError("Unable to load system data.");
        }
    };

    useEffect(() => {
        loadAll();
         
    }, []);

    const handleInstChange = (e) => setInstForm({ ...instForm, [e.target.name]: e.target.value });
    const handleDeptChange = (e) => setDeptForm({ ...deptForm, [e.target.name]: e.target.value });

    const saveInstitution = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            if (editingInstId) {
                await api.put(`/institutions/${editingInstId}`, instForm);
                setSuccess("Institution updated successfully.");
            } else {
                await api.post("/institutions", instForm);
                setSuccess("Institution created successfully.");
            }
            setInstForm({ name: "", email: "", phone: "", address: "", city: "", state: "", country: "", status: "ACTIVE" });
            setEditingInstId(null);
            await loadAll();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data || "";
            setError(msg ? `Unable to save institution: ${msg}` : "Unable to save institution.");
        }
    };

    const editInstitution = (inst) => {
        setEditingInstId(inst.id);
        setInstForm({
            name: inst.name || "", email: inst.email || "", phone: inst.phone || "",
            address: inst.address || "", city: inst.city || "", state: inst.state || "",
            country: inst.country || "", status: inst.status || "ACTIVE"
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const deleteInstitution = async (id) => {
        if (!window.confirm("Delete this institution? This cannot be undone.")) return;
        try {
            await api.delete(`/institutions/${id}`);
            setSuccess("Institution deleted.");
            await loadAll();
        } catch {
            setError("Unable to delete institution.");
        }
    };

    const saveDepartment = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            if (editingDeptId) {
                await api.put(`/departments/${editingDeptId}`, deptForm);
                setSuccess("Department updated successfully.");
            } else {
                await api.post("/departments", deptForm);
                setSuccess("Department created successfully.");
            }
            setDeptForm({ name: "", description: "", institutionId: "" });
            setEditingDeptId(null);
            await loadAll();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data || "";
            setError(msg ? `Unable to save department: ${msg}` : "Unable to save department.");
        }
    };

    const editDepartment = (dept) => {
        setEditingDeptId(dept.id);
        setDeptForm({ name: dept.name || "", description: dept.description || "", institutionId: dept.institutionId || "" });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const deleteDepartment = async (id) => {
        if (!window.confirm("Delete this department?")) return;
        try {
            await api.delete(`/departments/${id}`);
            setSuccess("Department deleted.");
            await loadAll();
        } catch {
            setError("Unable to delete department.");
        }
    };

    return (
        <div className="page-content">
            <h1 className="mb-4">{isSystemAdmin() ? "System Administration" : "Institution Management"}</h1>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* System Dashboard Stats */}
            {dashboard && (
                <div className="stat-grid mb-4">
                    <div className="stat-card">
                        <div className="stat-label">Institutions</div>
                        <div className="stat-value">{dashboard.totalInstitutions}</div>
                    </div>
                    <div className="stat-card" style={{ borderBottom: '4px solid var(--info)' }}>
                        <div className="stat-label">Departments</div>
                        <div className="stat-value">{dashboard.totalDepartments}</div>
                    </div>
                    <div className="stat-card" style={{ borderBottom: '4px solid var(--success)' }}>
                        <div className="stat-label">Total Equipment</div>
                        <div className="stat-value">{dashboard.totalEquipment}</div>
                    </div>
                    <div className="stat-card" style={{ borderBottom: '4px solid var(--warning)' }}>
                        <div className="stat-label">Total Bookings</div>
                        <div className="stat-value">{dashboard.totalBookings}</div>
                    </div>
                    <div className="stat-card" style={{ borderBottom: '4px solid var(--danger)' }}>
                        <div className="stat-label">Under Maintenance</div>
                        <div className="stat-value">{dashboard.underMaintenance}</div>
                    </div>
                </div>
            )}

            <div className="dashboard-grid">
                {/* Institution Management */}
                <div className="card">
                    <div className="card-body">
                        <h4 className="mb-3">{editingInstId ? "Edit Institution" : "Add Institution"}</h4>
                        <form onSubmit={saveInstitution}>
                            <div className="mb-2">
                                <input type="text" className="form-control mb-2" name="name" value={instForm.name} onChange={handleInstChange} placeholder="Institution name" required />
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-2">
                                    <input type="email" className="form-control" name="email" value={instForm.email} onChange={handleInstChange} placeholder="Email" />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <input type="text" className="form-control" name="phone" value={instForm.phone} onChange={handleInstChange} placeholder="Phone" />
                                </div>
                            </div>
                            <input type="text" className="form-control mb-2" name="address" value={instForm.address} onChange={handleInstChange} placeholder="Address" />
                            <div className="row">
                                <div className="col-md-4 mb-2">
                                    <input type="text" className="form-control" name="city" value={instForm.city} onChange={handleInstChange} placeholder="City" />
                                </div>
                                <div className="col-md-4 mb-2">
                                    <input type="text" className="form-control" name="state" value={instForm.state} onChange={handleInstChange} placeholder="State" />
                                </div>
                                <div className="col-md-4 mb-2">
                                    <input type="text" className="form-control" name="country" value={instForm.country} onChange={handleInstChange} placeholder="Country" />
                                </div>
                            </div>
                            <button type="submit" className={editingInstId ? "btn btn-warning px-4" : "btn btn-primary px-4"}>
                                {editingInstId ? "Update" : "Add Institution"}
                            </button>
                            {editingInstId && <button type="button" className="btn btn-outline-secondary ms-2 px-4" onClick={() => { setEditingInstId(null); setInstForm({ name: "", email: "", phone: "", address: "", city: "", state: "", country: "", status: "ACTIVE" }); }}>Cancel</button>}
                        </form>

                        <div className="table-responsive mt-4">
                            <table className="data-table">
                                <thead>
                                    <tr><th>Name</th><th>Contact</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {institutions.length === 0 ? (
                                        <tr><td colSpan="3" className="text-center text-muted py-3">No institutions</td></tr>
                                    ) : institutions.map(inst => (
                                        <tr key={inst.id}>
                                            <td className="fw-bold">{inst.name}</td>
                                            <td className="small">{inst.email}<br />{inst.phone}</td>
                                            <td>
                                                <button className="btn btn-outline-primary btn-sm me-1" onClick={() => editInstitution(inst)}>Edit</button>
                                                {isSystemAdmin() && <button className="btn btn-outline-danger btn-sm" onClick={() => deleteInstitution(inst.id)}>Delete</button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Department Management */}
                <div className="card">
                    <div className="card-body">
                        <h4 className="mb-3">{editingDeptId ? "Edit Department" : "Add Department"}</h4>
                        <form onSubmit={saveDepartment}>
                            <select className="form-select mb-2" name="institutionId" value={deptForm.institutionId} onChange={handleDeptChange} required>
                                <option value="">Select institution</option>
                                {institutions.map(inst => (
                                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                                ))}
                            </select>
                            <input type="text" className="form-control mb-2" name="name" value={deptForm.name} onChange={handleDeptChange} placeholder="Department name" required />
                            <input type="text" className="form-control mb-2" name="description" value={deptForm.description} onChange={handleDeptChange} placeholder="Description" />
                            <button type="submit" className={editingDeptId ? "btn btn-warning px-4" : "btn btn-primary px-4"}>
                                {editingDeptId ? "Update" : "Add Department"}
                            </button>
                            {editingDeptId && <button type="button" className="btn btn-outline-secondary ms-2 px-4" onClick={() => { setEditingDeptId(null); setDeptForm({ name: "", description: "", institutionId: "" }); }}>Cancel</button>}
                        </form>

                        <div className="table-responsive mt-4">
                            <table className="data-table">
                                <thead>
                                    <tr><th>Name</th><th>Institution</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {departments.length === 0 ? (
                                        <tr><td colSpan="3" className="text-center text-muted py-3">No departments</td></tr>
                                    ) : departments.map(dept => (
                                        <tr key={dept.id}>
                                            <td className="fw-bold">{dept.name}</td>
                                            <td className="small">{institutions.find(i => i.id === dept.institutionId)?.name || dept.institutionId}</td>
                                            <td>
                                                <button className="btn btn-outline-primary btn-sm me-1" onClick={() => editDepartment(dept)}>Edit</button>
                                                <button className="btn btn-outline-danger btn-sm" onClick={() => deleteDepartment(dept.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Users;
