import { useEffect, useState } from "react";
import api from "../services/api";

const MAINTENANCE_TYPES = ["PREVENTIVE", "CORRECTIVE", "CALIBRATION", "INSPECTION", "REPAIR", "UPGRADE"];
const STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

function Maintenance() {
    const [records, setRecords] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [filterStatus, setFilterStatus] = useState("");
    const [formData, setFormData] = useState({
        equipmentId: "",
        maintenanceType: "PREVENTIVE",
        scheduledDate: "",
        completedDate: "",
        description: "",
        technicianName: "",
        cost: "",
        status: "PENDING",
        remarks: ""
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadRecords = async () => {
        try {
            const response = await api.get("/maintenance");
            setRecords(response.data || []);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Unable to load maintenance records.");
        }
    };

    const loadEquipment = async () => {
        try {
            const response = await api.get("/equipment");
            setEquipment(response.data || []);
        } catch {
            console.error("Unable to load equipment");
        }
    };

    useEffect(() => {
        loadRecords();
        loadEquipment();
         
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({
            equipmentId: "",
            maintenanceType: "PREVENTIVE",
            scheduledDate: "",
            completedDate: "",
            description: "",
            technicianName: "",
            cost: "",
            status: "PENDING",
            remarks: ""
        });
        setEditingId(null);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            const payload = {
                equipmentId: formData.equipmentId,
                maintenanceType: formData.maintenanceType,
                scheduledDate: formData.scheduledDate || null,
                completedDate: formData.completedDate || null,
                description: formData.description,
                technicianName: formData.technicianName,
                cost: formData.cost ? parseFloat(formData.cost) : null,
                status: formData.status,
                remarks: formData.remarks
            };
            if (editingId) {
                await api.put(`/maintenance/${editingId}`, payload);
                setSuccess("Maintenance record updated successfully.");
            } else {
                await api.post("/maintenance", payload);
                setSuccess("Maintenance record created successfully.");
            }
            resetForm();
            await loadRecords();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data || "";
            setError(msg ? `Error: ${msg}` : "Unable to save maintenance record.");
        }
    };

    const editRecord = (rec) => {
        setEditingId(rec.id);
        setFormData({
            equipmentId: rec.equipmentId || "",
            maintenanceType: rec.maintenanceType || "PREVENTIVE",
            scheduledDate: rec.scheduledDate || "",
            completedDate: rec.completedDate || "",
            description: rec.description || "",
            technicianName: rec.technicianName || "",
            cost: rec.cost != null ? String(rec.cost) : "",
            status: rec.status || "PENDING",
            remarks: rec.remarks || ""
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const deleteRecord = async (id) => {
        if (!window.confirm("Delete this maintenance record?")) return;
        try {
            await api.delete(`/maintenance/${id}`);
            setSuccess("Maintenance record deleted.");
            await loadRecords();
        } catch (err) {
            console.error(err);
            setError("Unable to delete maintenance record.");
        }
    };

    const filterByStatus = async () => {
        if (!filterStatus) {
            loadRecords();
            return;
        }
        try {
            const response = await api.get(`/maintenance/status/${filterStatus}`);
            setRecords(response.data || []);
        } catch (err) {
            console.error(err);
            setError("Unable to filter records.");
        }
    };

    const getBadgeClass = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "completed") return "success";
        if (s === "in_progress") return "warning";
        if (s === "pending") return "info";
        if (s === "cancelled") return "danger";
        return "secondary";
    };

    const formatDate = (d) => {
        if (!d) return "—";
        return new Date(d).toLocaleDateString();
    };

    return (
        <div className="page-content">
            <h1 className="mb-4">Maintenance Management</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="card mb-4">
                <div className="card-body">
                    <h4 className="mb-3">{editingId ? "Edit Maintenance Record" : "Schedule New Maintenance"}</h4>
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label text-muted fw-bold">Equipment</label>
                                <select className="form-select" name="equipmentId" value={formData.equipmentId} onChange={handleChange} required>
                                    <option value="">Select equipment</option>
                                    {equipment.map(eq => (
                                        <option key={eq.id} value={eq.id}>{eq.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label text-muted fw-bold">Maintenance Type</label>
                                <select className="form-select" name="maintenanceType" value={formData.maintenanceType} onChange={handleChange} required>
                                    {MAINTENANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="form-label text-muted fw-bold">Scheduled Date</label>
                                <input type="date" className="form-control" name="scheduledDate" value={formData.scheduledDate} onChange={handleChange} required />
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="form-label text-muted fw-bold">Completed Date</label>
                                <input type="date" className="form-control" name="completedDate" value={formData.completedDate} onChange={handleChange} />
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="form-label text-muted fw-bold">Status</label>
                                <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label text-muted fw-bold">Technician Name</label>
                                <input type="text" className="form-control" name="technicianName" value={formData.technicianName} onChange={handleChange} placeholder="Assigned technician" />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label text-muted fw-bold">Cost (INR)</label>
                                <input type="number" step="0.01" className="form-control" name="cost" value={formData.cost} onChange={handleChange} placeholder="0.00" />
                            </div>
                            <div className="col-12 mb-3">
                                <label className="form-label text-muted fw-bold">Description</label>
                                <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} rows="2" placeholder="Describe the maintenance issue" />
                            </div>
                            <div className="col-12 mb-3">
                                <label className="form-label text-muted fw-bold">Remarks</label>
                                <input type="text" className="form-control" name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Additional remarks" />
                            </div>
                        </div>
                        <button type="submit" className={editingId ? "btn btn-warning px-4" : "btn btn-primary px-4"}>
                            {editingId ? "Update Record" : "Create Record"}
                        </button>
                        {editingId && (
                            <button type="button" className="btn btn-outline-secondary ms-3 px-4" onClick={resetForm}>Cancel</button>
                        )}
                    </form>
                </div>
            </div>

            <div className="d-flex align-items-center mb-3 gap-2">
                <select className="form-select" style={{ maxWidth: "200px" }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button className="btn btn-outline-primary" onClick={filterByStatus}>Filter</button>
                <button className="btn btn-outline-secondary" onClick={loadRecords}>Clear</button>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Equipment</th>
                            <th>Type</th>
                            <th>Scheduled</th>
                            <th>Completed</th>
                            <th>Technician</th>
                            <th>Cost</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                            {records.length === 0 ? (
                                <tr><td colSpan="8" className="text-center py-4 text-muted">No maintenance records found</td></tr>
                            ) : (
                                records.map(rec => (
                                    <tr key={rec.id}>
                                        <td>
                                            <div className="fw-bold">{rec.equipmentName || "—"}</div>
                                            <div className="text-muted small">{rec.description}</div>
                                        </td>
                                        <td>{rec.maintenanceType}</td>
                                        <td>{formatDate(rec.scheduledDate)}</td>
                                        <td>{formatDate(rec.completedDate)}</td>
                                        <td>{rec.technicianName || "—"}</td>
                                        <td>{rec.cost != null ? `₹${rec.cost.toLocaleString()}` : "—"}</td>
                                        <td>
                                            <span className={`badge badge-${getBadgeClass(rec.status)}`}>
                                                {rec.status || "UNKNOWN"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button className="btn btn-outline-primary btn-sm" onClick={() => editRecord(rec)}>Edit</button>
                                                <button className="btn btn-outline-danger btn-sm" onClick={() => deleteRecord(rec.id)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Maintenance;
