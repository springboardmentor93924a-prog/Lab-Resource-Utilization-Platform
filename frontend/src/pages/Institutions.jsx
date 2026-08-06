import { useEffect, useState } from "react";
import { getInstitutions, createInstitution, updateInstitution, deleteInstitution } from "../services/institutionService";
import { useToast } from "../context/ToastContext";

function Institutions() {
    const [institutions, setInstitutions] = useState([]);
    const [formData, setFormData] = useState({
        name: "", email: "", phone: "", address: "", city: "", state: "", country: "", status: "ACTIVE"
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { addToast } = useToast();

    

    const loadInstitutions = async () => {
        setLoading(true);
        try {
            const data = await getInstitutions();
            setInstitutions(data || []);
            setError("");
        } catch {
            // setError("Unable to load institutions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setTimeout(() => loadInstitutions(), 0); }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const resetForm = () => {
        setFormData({ name: "", email: "", phone: "", address: "", city: "", state: "", country: "", status: "ACTIVE" });
        setEditingId(null);
        setError("");
    };

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await updateInstitution(editingId, formData);
                addToast("Institution updated successfully!");
            } else {
                await createInstitution(formData);
                addToast("Institution added successfully!");
            }
            resetForm();
            await loadInstitutions();
        } catch {
            setError("Error saving institution.");
            addToast("Failed to save institution.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const edit = (item) => {
        setEditingId(item.id);
        setFormData({
            name: item.name || "", email: item.email || "", phone: item.phone || "",
            address: item.address || "", city: item.city || "", state: item.state || "",
            country: item.country || "", status: item.status || "ACTIVE"
        });
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this institution?")) return;
        try {
            await deleteInstitution(id);
            addToast("Institution deleted successfully!");
            await loadInstitutions();
        } catch {
            setError("Cannot delete institution.");
            addToast("Failed to delete institution.", "error");
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>Institutions</h2>
                    <p>Manage universities, labs, and research centers</p>
                </div>
            </div>

            {error && <div className="pro-alert">{error}</div>}

            <div className="glass-card" style={{ marginBottom: '40px' }}>
                <h4 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>
                    {editingId ? "Edit Institution" : "Add Institution"}
                </h4>
                <form onSubmit={submit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div className="glass-form-group"><label>Name</label><input type="text" className="glass-input" name="name" value={formData.name} onChange={handleChange} required /></div>
                        <div className="glass-form-group"><label>Email</label><input type="email" className="glass-input" name="email" value={formData.email} onChange={handleChange} required /></div>
                        <div className="glass-form-group"><label>Phone</label><input type="text" className="glass-input" name="phone" value={formData.phone} onChange={handleChange} required /></div>
                        <div className="glass-form-group"><label>Address</label><input type="text" className="glass-input" name="address" value={formData.address} onChange={handleChange} required /></div>
                        <div className="glass-form-group"><label>City</label><input type="text" className="glass-input" name="city" value={formData.city} onChange={handleChange} required /></div>
                        <div className="glass-form-group"><label>State</label><input type="text" className="glass-input" name="state" value={formData.state} onChange={handleChange} required /></div>
                        <div className="glass-form-group"><label>Country</label><input type="text" className="glass-input" name="country" value={formData.country} onChange={handleChange} required /></div>
                        <div className="glass-form-group">
                            <label>Status</label>
                            <select className="glass-select" name="status" value={formData.status} onChange={handleChange}>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
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
                <h4 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>All Institutions</h4>
                <div className="table-responsive">
                    <table className="glass-table">
                        <thead>
                            <tr><th>Name</th><th>Email</th><th>City</th><th>State</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan="6">Loading...</td></tr> : institutions.length > 0 ? (
                                institutions.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.name}</td><td>{item.email}</td><td>{item.city}</td><td>{item.state}</td>
                                        <td><span className={`status-badge status-${item.status.toLowerCase()}`}>{item.status}</span></td>
                                        <td>
                                            <button className="glass-btn" style={{ padding: '0 12px', height: '32px', fontSize: '12px', marginRight: '8px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }} onClick={() => edit(item)}>Edit</button>
                                            <button className="glass-btn" style={{ padding: '0 12px', height: '32px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }} onClick={() => remove(item.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : <tr><td colSpan="6">No institutions found</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Institutions;
