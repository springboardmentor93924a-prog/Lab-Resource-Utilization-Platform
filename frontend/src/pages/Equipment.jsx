import { useEffect, useState } from "react";
import api from "../services/api";
import { extractErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Equipment() {
    const { isAdmin, isManager, isLabTechnician, user } = useAuth();
    const navigate = useNavigate();

    const [equipment, setEquipment] = useState([]);
    const [categories, setCategories] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        categoryId: "",
        status: "AVAILABLE",
        institutionId: "",
        departmentId: "",
        description: "",
        serialNumber: ""
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadEquipment = async () => {
        try {
            const response = await api.get("/equipment");
            setEquipment(response.data);
            setError("");
        } catch {
            setError("Unable to load equipment.");
        }
    };

    const loadCategories = async () => {
        try {
            const response = await api.get("/categories");
            setCategories(response.data || []);
        } catch {
            console.error("Unable to load categories");
        }
    };

    const loadInstitutions = async () => {
        try {
            const response = await api.get("/institutions");
            setInstitutions(response.data || []);
        } catch {
            console.error("Unable to load institutions");
        }
    };

    const loadDepartments = async (institutionId) => {
        try {
            const response = await api.get(`/departments/institution/${institutionId}`);
            setDepartments(response.data || []);
        } catch {
            console.error("Unable to load departments");
            setDepartments([]);
        }
    };

    useEffect(() => {
        loadEquipment();
        loadCategories();
        loadInstitutions();
    }, []);

    useEffect(() => {
        if (!formData.institutionId) return;
        loadDepartments(formData.institutionId);
    }, [formData.institutionId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "institutionId") {
            // Changing institution invalidates the selected department list
            setDepartments([]);
        }
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const resetForm = () => {
        setFormData({
            name: "",
            categoryId: "",
            status: "AVAILABLE",
            institutionId: "",
            departmentId: "",
            description: "",
            serialNumber: ""
        });
        setEditingId(null);
        setError("");
    };

    const addEquipment = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            const payload = {
                ...formData,
                serialNumber: formData.serialNumber || `EQ-${Date.now()}`,
                status: "ACTIVE",
                availabilityStatus: formData.status
            };
            await api.post("/equipment", payload);
            setSuccess("Equipment added successfully.");
            resetForm();
            await loadEquipment();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data || "";
            setError(msg ? `Unable to add equipment: ${msg}` : "Unable to add equipment.");
        }
    };

    const editEquipment = (item) => {
        setEditingId(item.id);
        setFormData({
            name: item.name ?? "",
            categoryId: item.categoryId ?? "",
            status: item.availabilityStatus ?? item.status ?? "AVAILABLE",
            institutionId: item.institutionId ?? "",
            departmentId: item.departmentId ?? "",
            description: item.description ?? "",
            serialNumber: item.serialNumber ?? `EQ-${Date.now()}`
        });
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const updateEquipment = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            const payload = {
                ...formData,
                status: "ACTIVE",
                availabilityStatus: formData.status
            };
            await api.put(`/equipment/${editingId}`, payload);
            setSuccess("Equipment updated successfully.");
            resetForm();
            await loadEquipment();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data || "";
            setError(msg ? `Unable to update equipment: ${msg}` : "Unable to update equipment.");
        }
    };

    const deleteEquipment = async (id) => {
        if (!window.confirm("Are you sure you want to delete this equipment?")) return;
        try {
            await api.delete(`/equipment/${id}`);
            setSuccess("Equipment deleted successfully.");
            await loadEquipment();
        } catch (err) {
            console.error(err);
            setError("Unable to delete equipment. It may be used in an existing booking.");
        }
    };

    const changeStatus = async (id, newStatus) => {
        try {
            await api.put(`/equipment/${id}/status`, {
                status: "ACTIVE",
                availabilityStatus: newStatus
            });
            setSuccess(`Equipment status changed to ${newStatus}.`);
            await loadEquipment();
        } catch (err) {
            console.error(err);
            setError("Unable to change equipment status.");
        }
    };

    const handleBookNow = (item) => {
        navigate('/bookings', { state: { selectedEquipment: item.id } });
    };

    const handleJoinWaitlist = async (item) => {
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dateStr = tomorrow.toISOString().split('T')[0];
            await api.post("/waitlist", {
                userId: String(user.userId),
                equipmentId: String(item.id),
                requestedStartTime: `${dateStr}T09:00:00`,
                requestedEndTime: `${dateStr}T17:00:00`,
                priority: 1,
                purpose: "Waitlisted from Equipment Page",
                remarks: ""
            });
            setSuccess(`Successfully joined waitlist for ${item.name} (scheduled for ${dateStr})`);
        } catch (err) {
            console.error(err);
            setError(`Unable to join waitlist: ${extractErrorMessage(err)}`);
        }
    };

    const canManage = isAdmin() || isManager() || isLabTechnician();

    const filteredEquipment = equipment.filter(item => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (item.name || "").toLowerCase().includes(term) ||
               (item.serialNumber || "").toLowerCase().includes(term) ||
               (item.categoryName || "").toLowerCase().includes(term);
    });

    const getBadgeClass = (availabilityStatus) => {
        const s = (availabilityStatus || "").toLowerCase();
        if (s === "available") return "success";
        if (s === "booked" || s === "in_use") return "warning";
        if (s === "maintenance") return "danger";
        if (s === "out_of_service" || s === "retired") return "danger";
        return "info";
    };

    return (
        <div className="page-content">
            <h1 className="mb-4">Equipment Catalog</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {canManage && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h4 className="mb-3">{editingId ? "Edit Equipment" : "Add New Equipment"}</h4>
                        <form onSubmit={editingId ? updateEquipment : addEquipment}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-muted fw-bold">Name</label>
                                    <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} placeholder="Example: Digital Microscope" required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-muted fw-bold">Category</label>
                                    <select className="form-select" name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                                        <option value="">Select category</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-muted fw-bold">Institution</label>
                                    <select className="form-select" name="institutionId" value={formData.institutionId} onChange={handleChange} required>
                                        <option value="">Select institution</option>
                                        {institutions.map(inst => (
                                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-muted fw-bold">Department</label>
                                    <select className="form-select" name="departmentId" value={formData.departmentId} onChange={handleChange} required disabled={!formData.institutionId}>
                                        <option value="">
                                            {formData.institutionId
                                                ? departments.length > 0
                                                    ? "Select department"
                                                    : "No departments available"
                                                : "Select institution first"}
                                        </option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-muted fw-bold">Availability Status</label>
                                    <select className="form-select" name="status" value={formData.status} onChange={handleChange} required>
                                        <option value="AVAILABLE">Available</option>
                                        <option value="BOOKED">Booked</option>
                                        <option value="MAINTENANCE">Under Maintenance</option>
                                        <option value="OUT_OF_SERVICE">Out of Service</option>
                                        <option value="RETIRED">Retired</option>
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-muted fw-bold">Serial Number</label>
                                    <input type="text" className="form-control" name="serialNumber" value={formData.serialNumber} onChange={handleChange} placeholder="Optional (auto-generated if empty)" />
                                </div>
                                <div className="col-12 mb-4">
                                    <label className="form-label text-muted fw-bold">Description</label>
                                    <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} placeholder="Enter equipment description" rows="2" />
                                </div>
                            </div>
                            <button type="submit" className={editingId ? "btn btn-warning px-4" : "btn btn-primary px-4"}>
                                {editingId ? "Update Equipment" : "Add Equipment"}
                            </button>
                            {editingId && (
                                <button type="button" className="btn btn-outline-secondary ms-3 px-4" onClick={resetForm}>Cancel</button>
                            )}
                        </form>
                    </div>
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-3">
                <input
                    type="text"
                    className="form-control"
                    style={{ maxWidth: "300px" }}
                    placeholder="Search equipment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Name & Details</th>
                            <th>Category</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEquipment.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-4 text-muted">No equipment found</td></tr>
                        ) : (
                            filteredEquipment.map((item) => {
                                const availStatus = (item.availabilityStatus || item.status || "").toLowerCase();
                                const isAvailable = availStatus === "available";
                                const isBooked = availStatus === "booked" || availStatus === "in_use";

                                return (
                                <tr key={item.id}>
                                    <td>
                                        <div className="fw-bold text-dark">{item.name}</div>
                                        <div className="text-muted small">{item.description}</div>
                                        <div className="text-muted small">SN: {item.serialNumber}</div>
                                    </td>
                                    <td>{item.categoryName || item.category}</td>
                                    <td>{item.departmentName || item.department}</td>
                                    <td>
                                        <span className={`badge badge-${getBadgeClass(item.availabilityStatus)}`}>
                                            {item.availabilityStatus || item.status || "Unknown"}
                                        </span>
                                        {canManage && (
                                            <select
                                                className="form-select form-select-sm mt-1"
                                                style={{ maxWidth: "150px" }}
                                                value={item.availabilityStatus || ""}
                                                onChange={(e) => changeStatus(item.id, e.target.value)}
                                            >
                                                <option value="AVAILABLE">Available</option>
                                                <option value="BOOKED">Booked</option>
                                                <option value="MAINTENANCE">Maintenance</option>
                                                <option value="OUT_OF_SERVICE">Out of Service</option>
                                                <option value="RETIRED">Retired</option>
                                            </select>
                                        )}
                                    </td>
                                    <td>
                                        {canManage ? (
                                            <div className="d-flex gap-2">
                                                <button className="btn btn-outline-primary btn-sm" onClick={() => editEquipment(item)}>Edit</button>
                                                {isAdmin() && <button className="btn btn-outline-danger btn-sm" onClick={() => deleteEquipment(item.id)}>Delete</button>}
                                            </div>
                                        ) : (
                                            <div className="d-flex gap-2">
                                                {isAvailable && (
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleBookNow(item)}>Book Now</button>
                                                )}
                                                {(isBooked || availStatus === "maintenance") && (
                                                    <button className="btn btn-outline-warning btn-sm" onClick={() => handleJoinWaitlist(item)}>Join Waitlist</button>
                                                )}
                                                {!isAvailable && !isBooked && availStatus !== "maintenance" && (
                                                    <button className="btn btn-secondary btn-sm" disabled>Unavailable</button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )})
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        </div>
    );
}

export default Equipment;
