import { useEffect, useState } from "react";
import { getEquipment, createEquipment, updateEquipment, deleteEquipment as deleteEquipmentService } from "../services/equipmentService";
import { getInstitutions } from "../services/institutionService";
import { getDepartmentsByInstitution } from "../services/departmentService";
import { getCategories } from "../services/categoryService";
import { useToast } from "../context/ToastContext";

function Equipment() {
    const [equipmentList, setEquipmentList] = useState([]);
    
    // Foreign Key Data
    const [institutions, setInstitutions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [categories, setCategories] = useState([]);

    const initialFormState = {
        name: "", description: "", serialNumber: "", manufacturer: "",
        modelNumber: "", purchaseDate: "", purchaseCost: "", location: "",
        status: "ACTIVE", availabilityStatus: "AVAILABLE", imageUrl: "",
        categoryId: "", institutionId: "", departmentId: ""
    };

    const [formData, setFormData] = useState(initialFormState);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { addToast } = useToast();

    // Filter and Pagination State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [eqData, instData, catData] = await Promise.all([
                getEquipment(),
                getInstitutions(),
                getCategories()
            ]);
            setEquipmentList(eqData || []);
            setInstitutions(instData || []);
            setCategories(catData || []);
            setError("");
        } catch (err) {
            console.error(err);
            // setError("Unable to load equipment data. Ensure backend is running or enable DEV MODE.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setTimeout(() => loadInitialData(), 0); 
        const handleStorage = () => loadInitialData();
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    useEffect(() => {
        if (formData.institutionId) {
            getDepartmentsByInstitution(formData.institutionId)
                .then(data => setDepartments(data || []))
                .catch(err => console.error(err));
        } else if (departments.length > 0) {
            setTimeout(() => setDepartments([]), 0);
        }
    }, [formData.institutionId, departments.length]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, imageUrl: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setError("");
        document.getElementById('image-upload-input').value = '';
    };

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { ...formData, purchaseCost: parseFloat(formData.purchaseCost) };
            if (editingId) {
                await updateEquipment(editingId, payload);
                addToast("Equipment updated successfully!");
            } else {
                await createEquipment(payload);
                addToast("Equipment created successfully!");
            }
            
            resetForm();
            await loadInitialData();
        } catch (err) {
            console.error(err);
            setError("Error saving equipment.");
            addToast("Failed to save equipment.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const edit = (eq) => {
        setEditingId(eq.id);
        setFormData({
            name: eq.name || "",
            description: eq.description || "",
            serialNumber: eq.serialNumber || "",
            manufacturer: eq.manufacturer || "",
            modelNumber: eq.modelNumber || "",
            purchaseDate: eq.purchaseDate || "",
            purchaseCost: eq.purchaseCost || "",
            location: eq.location || "",
            status: eq.status || "ACTIVE",
            availabilityStatus: eq.availabilityStatus || "AVAILABLE",
            imageUrl: eq.imageUrl || "",
            categoryId: eq.categoryId || "",
            institutionId: eq.institutionId || "",
            departmentId: eq.departmentId || ""
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this equipment?")) return;
        try {
            await deleteEquipmentService(id);
            addToast("Equipment deleted successfully!");
            await loadInitialData();
        } catch {
            setError("Cannot delete equipment.");
            addToast("Failed to delete equipment.", "error");
        }
    };

    const getStatusClass = (status) => {
        if (!status) return "";
        return `status-badge status-${status.toLowerCase()}`;
    };

    // Derived state for filtering and pagination
    const filteredEquipment = equipmentList.filter(eq => {
        const matchesSearch = String(eq.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                              String(eq.serialNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                              String(eq.modelNumber || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus ? eq.availabilityStatus === filterStatus : true;
        return matchesSearch && matchesFilter;
    });

    const totalPages = Math.ceil(filteredEquipment.length / itemsPerPage);
    const paginatedEquipment = filteredEquipment.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>Equipment Repository</h2>
                    <p>Manage and track laboratory equipment across institutions</p>
                </div>
            </div>

            {error && <div className="pro-alert">{error}</div>}

            <div className="glass-card" style={{ marginBottom: '40px' }}>
                <h4 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>
                    {editingId ? "Edit Equipment" : "Add New Equipment"}
                </h4>
                <form onSubmit={submit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px 20px' }}>
                        
                        <div className="glass-form-group" style={{ gridColumn: '1 / -1', marginBottom: '10px' }}>
                            <h5 style={{ color: 'var(--text-main)', margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Basic Information</h5>
                        </div>

                        <div className="glass-form-group">
                            <label>Name *</label>
                            <input type="text" className="glass-input" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="glass-form-group">
                            <label>Category *</label>
                            <select className="glass-select" name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="glass-form-group">
                            <label>Institution *</label>
                            <select className="glass-select" name="institutionId" value={formData.institutionId} onChange={handleChange} required>
                                <option value="">Select Institution</option>
                                {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                        </div>
                        <div className="glass-form-group">
                            <label>Department *</label>
                            <select className="glass-select" name="departmentId" value={formData.departmentId} onChange={handleChange} required disabled={!formData.institutionId}>
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>

                        <div className="glass-form-group" style={{ gridColumn: '1 / -1', margin: '20px 0 10px 0' }}>
                            <h5 style={{ color: 'var(--text-main)', margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Hardware Details</h5>
                        </div>

                        <div className="glass-form-group"><label>Manufacturer</label><input type="text" className="glass-input" name="manufacturer" value={formData.manufacturer} onChange={handleChange} /></div>
                        <div className="glass-form-group"><label>Model Number</label><input type="text" className="glass-input" name="modelNumber" value={formData.modelNumber} onChange={handleChange} /></div>
                        <div className="glass-form-group"><label>Serial Number</label><input type="text" className="glass-input" name="serialNumber" value={formData.serialNumber} onChange={handleChange} /></div>
                        
                        <div className="glass-form-group" style={{gridColumn: '1 / -1'}}>
                            <label>Equipment Image</label>
                            <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                                {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)'}} />}
                                <input type="file" id="image-upload-input" accept="image/*" onChange={handleImageUpload} style={{color: 'var(--text-main)'}} />
                            </div>
                        </div>

                        <div className="glass-form-group" style={{ gridColumn: '1 / -1', margin: '20px 0 10px 0' }}>
                            <h5 style={{ color: 'var(--text-main)', margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Operational Details</h5>
                        </div>

                        <div className="glass-form-group"><label>Purchase Date</label><input type="date" className="glass-input" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} /></div>
                        <div className="glass-form-group"><label>Purchase Cost</label><input type="number" step="0.01" className="glass-input" name="purchaseCost" value={formData.purchaseCost} onChange={handleChange} /></div>
                        <div className="glass-form-group"><label>Location (Room)</label><input type="text" className="glass-input" name="location" value={formData.location} onChange={handleChange} /></div>
                        
                        <div className="glass-form-group">
                            <label>General Status</label>
                            <select className="glass-select" name="status" value={formData.status} onChange={handleChange}>
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                                <option value="DECOMMISSIONED">DECOMMISSIONED</option>
                            </select>
                        </div>
                        <div className="glass-form-group">
                            <label>Availability Status</label>
                            <select className="glass-select" name="availabilityStatus" value={formData.availabilityStatus} onChange={handleChange}>
                                <option value="AVAILABLE">AVAILABLE</option>
                                <option value="BOOKED">BOOKED</option>
                                <option value="MAINTENANCE">MAINTENANCE</option>
                                <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                            </select>
                        </div>
                        <div className="glass-form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Description *</label>
                            <textarea className="glass-input" name="description" value={formData.description} onChange={handleChange} style={{ height: '60px', paddingTop: '12px' }} required></textarea>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        <button type="submit" className="glass-btn" disabled={submitting}>
                            {submitting ? "Saving..." : (editingId ? "Update Equipment" : "Add Equipment")}
                        </button>
                        {editingId && <button type="button" className="glass-btn" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={resetForm} disabled={submitting}>Cancel</button>}
                    </div>
                </form>
            </div>

            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                    <h4 style={{ margin: 0, fontSize: '20px' }}>Equipment Inventory</h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            type="text" 
                            className="glass-input" 
                            placeholder="Search by name or serial..." 
                            value={searchQuery}
                            onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
                            style={{ width: '250px' }}
                        />
                        <select 
                            className="glass-select" 
                            value={filterStatus}
                            onChange={(e) => {setFilterStatus(e.target.value); setCurrentPage(1);}}
                        >
                            <option value="">All Statuses</option>
                            <option value="AVAILABLE">Available</option>
                            <option value="BOOKED">Booked</option>
                            <option value="MAINTENANCE">Maintenance</option>
                            <option value="OUT_OF_SERVICE">Out of Service</option>
                        </select>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="glass-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Model / Serial</th>
                                <th>Category</th>
                                <th>Institution</th>
                                <th>Availability</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan="6" style={{textAlign:'center'}}>Loading...</td></tr> : paginatedEquipment.length > 0 ? (
                                paginatedEquipment.map(eq => (
                                    <tr key={eq.id}>
                                        <td>
                                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                                {eq.imageUrl && <img src={eq.imageUrl} alt={eq.name} style={{width:'40px', height:'40px', objectFit:'cover', borderRadius:'4px'}} />}
                                                <div>
                                                    <div style={{fontWeight:'500'}}>{eq.name}</div>
                                                    <div style={{fontSize:'12px', color:'var(--text-muted)'}}>{eq.location}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div>{eq.modelNumber || "-"}</div>
                                            <div style={{fontSize:'12px', color:'var(--text-muted)'}}>{eq.serialNumber || "-"}</div>
                                        </td>
                                        <td>{eq.categoryName || eq.categoryId}</td>
                                        <td>{eq.institutionName || eq.institutionId}</td>
                                        <td><span className={getStatusClass(eq.availabilityStatus)}>{eq.availabilityStatus}</span></td>
                                        <td>
                                            <button className="glass-btn" style={{ padding: '0 12px', height: '32px', fontSize: '12px', marginRight: '8px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }} onClick={() => edit(eq)}>Edit</button>
                                            <button className="glass-btn" style={{ padding: '0 12px', height: '32px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }} onClick={() => remove(eq.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : <tr><td colSpan="6" style={{textAlign:'center'}}>No equipment found</td></tr>}
                        </tbody>
                    </table>
                </div>
                
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' }}>
                        <button 
                            className="glass-btn" 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            style={{ padding: '5px 15px' }}
                        >
                            Previous
                        </button>
                        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Page {currentPage} of {totalPages}</span>
                        <button 
                            className="glass-btn" 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            style={{ padding: '5px 15px' }}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Equipment;