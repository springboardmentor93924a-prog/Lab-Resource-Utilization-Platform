import { useEffect, useState } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../services/categoryService";
import { useToast } from "../context/ToastContext";

function Categories() {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { addToast } = useToast();

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await getCategories();
            setCategories(data || []);
            setError("");
        } catch (err) {
            console.error(err);
            // setError("Unable to load categories.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setTimeout(() => loadCategories(), 0); }, []);

    

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const resetForm = () => {
        setFormData({ name: "", description: "" });
        setEditingId(null);
        setError("");
    };

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await updateCategory(editingId, formData);
                addToast("Category updated successfully!");
            } else {
                await createCategory(formData);
                addToast("Category added successfully!");
            }
            resetForm();
            await loadCategories();
        } catch (err) {
            console.error(err);
            setError("Error saving category.");
            addToast("Failed to save category.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const edit = (item) => {
        setEditingId(item.id);
        setFormData({ name: item.name || "", description: item.description || "" });
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this category?")) return;
        try {
            await deleteCategory(id);
            addToast("Category deleted successfully!");
            await loadCategories();
        } catch (err) {
            console.error(err);
            setError("Cannot delete category.");
            addToast("Failed to delete category.", "error");
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>Equipment Categories</h2>
                    <p>Manage classifications for laboratory equipment</p>
                </div>
            </div>

            {error && <div className="pro-alert">{error}</div>}

            <div className="glass-card" style={{ marginBottom: '40px' }}>
                <h4 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>
                    {editingId ? "Edit Category" : "Add Category"}
                </h4>
                <form onSubmit={submit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div className="glass-form-group"><label>Name</label><input type="text" className="glass-input" name="name" value={formData.name} onChange={handleChange} required /></div>
                        <div className="glass-form-group"><label>Description</label><input type="text" className="glass-input" name="description" value={formData.description} onChange={handleChange} required /></div>
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
                <h4 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>All Categories</h4>
                <div className="table-responsive">
                    <table className="glass-table">
                        <thead>
                            <tr><th>Name</th><th>Description</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan="3">Loading...</td></tr> : categories.length > 0 ? (
                                categories.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td>{item.description}</td>
                                        <td>
                                            <button className="glass-btn" style={{ padding: '0 12px', height: '32px', fontSize: '12px', marginRight: '8px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }} onClick={() => edit(item)}>Edit</button>
                                            <button className="glass-btn" style={{ padding: '0 12px', height: '32px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }} onClick={() => remove(item.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : <tr><td colSpan="3">No categories found</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Categories;
