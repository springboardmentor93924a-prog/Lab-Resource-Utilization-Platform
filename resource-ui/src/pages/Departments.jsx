import { useEffect, useState } from "react";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "../services/departmentService";
import { getInstitutions } from "../services/institutionService";
import { useToast } from "../context/ToastContext";

function Departments() {
    const [departments, setDepartments] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [formData, setFormData] = useState({ name: "", description: "", institutionId: "" });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { addToast } = useToast();

    const loadData = async () => {
        setLoading(true);
        try {
            const [depData, instData] = await Promise.all([getDepartments(), getInstitutions()]);
            setDepartments(depData || []);
            setInstitutions(instData || []);
            setError("");
        } catch (err) {
            console.error(err);
            // setError("Unable to load departments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setTimeout(() => loadData(), 0); }, []);

    

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const resetForm = () => {
        setFormData({ name: "", description: "", institutionId: "" });
        setEditingId(null);
        setError("");
    };

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await updateDepartment(editingId, formData);
                addToast("Department updated successfully!");
            } else {
                await createDepartment(formData);
                addToast("Department added successfully!");
            }
            resetForm();
            await loadData();
        } catch (err) {
            console.error(err);
            setError("Error saving department.");
            addToast("Failed to save department.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const edit = (item) => {
        setEditingId(item.id);
        setFormData({ name: item.name || "", description: item.description || "", institutionId: item.institutionId || "" });
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this department?")) return;
        try {
            await deleteDepartment(id);
            addToast("Department deleted successfully!");
            await loadData();
        } catch (err) {
            console.error(err);
            setError("Cannot delete department.");
            addToast("Failed to delete department.", "error");
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>Departments</h2>
                    <p>Manage organizational units within institutions</p>
                </div>
            </div>

            {error && <div className="pro-alert">{error}</div>}

            <div className="glass-card" style={{ marginBottom: '40px' }}>
                <h4 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>
                    {editingId ? "Edit Department" : "Add Department"}
                </h4>
                <form onSubmit={submit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div className="glass-form-group"><label>Name</label><input type="text" className="glass-input" name="name" value={formData.name} onChange={handleChange} required /></div>
                        <div className="glass-form-group">
                            <label>Institution</label>
                            <select className="glass-select" name="institutionId" value={formData.institutionId} onChange={handleChange} required>
                                <option value="">Select Institution</option>
                                {institutions.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                            </select>
                        </div>
                        <div className="glass-form-group" style={{ gridColumn: '1 / -1' }}><label>Description</label><input type="text" className="glass-input" name="description" value={formData.description} onChange={handleChange} required /></div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        <button type="submit" className="glass-btn" disabled={submitting}>
                            {submitting ? "Saving..." : (editingId ? "Update" : "Add")}
                        </button>
                        {editingId && <button type="button" className="glass-btn" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={resetForm} disabled={submitting}>Cancel</button>}
                    </div>
                </form>
            </div>

            <div className="glass-card">
                <h4 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>All Departments</h4>
                <div className="table-responsive">
                    <table className="glass-table">
                        <thead>
                            <tr><th>Name</th><th>Institution</th><th>Description</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan="4">Loading...</td></tr> : departments.length > 0 ? (
                                departments.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td>{institutions.find(i => i.id === item.institutionId)?.name || item.institutionId}</td>
                                        <td>{item.description}</td>
                                        <td>
                                            <button className="glass-btn" style={{ padding: '0 12px', height: '32px', fontSize: '12px', marginRight: '8px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }} onClick={() => edit(item)}>Edit</button>
                                            <button className="glass-btn" style={{ padding: '0 12px', height: '32px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }} onClick={() => remove(item.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : <tr><td colSpan="4">No departments found</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Departments;
