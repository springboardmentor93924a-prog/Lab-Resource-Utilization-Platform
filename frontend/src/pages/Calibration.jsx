import { useEffect, useState } from "react";
import api from "../services/api";

const CALIBRATION_RESULTS = ["PASSED", "FAILED", "ADJUSTED", "PENDING"];
const STATUSES = ["PENDING", "COMPLETED", "DUE", "OVERDUE"];

function Calibration() {
    const [records, setRecords] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [filterStatus, setFilterStatus] = useState("");
    const [formData, setFormData] = useState({
        equipmentId: "",
        technicianId: "",
        calibrationDate: "",
        nextCalibrationDate: "",
        calibrationResult: "PENDING",
        certificateUrl: "",
        remarks: "",
        status: "PENDING"
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadRecords = async () => {
        try {
            const response = await api.get("/calibrations");
            setRecords(response.data || []);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Unable to load calibration records.");
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
            technicianId: "",
            calibrationDate: "",
            nextCalibrationDate: "",
            calibrationResult: "PENDING",
            certificateUrl: "",
            remarks: "",
            status: "PENDING"
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
                technicianId: formData.technicianId || null,
                calibrationDate: formData.calibrationDate || null,
                nextCalibrationDate: formData.nextCalibrationDate || null,
                calibrationResult: formData.calibrationResult,
                certificateUrl: formData.certificateUrl || null,
                remarks: formData.remarks || null,
                status: formData.status
            };
            if (editingId) {
                await api.put(`/calibrations/${editingId}`, payload);
                setSuccess("Calibration record updated successfully.");
            } else {
                await api.post("/calibrations", payload);
                setSuccess("Calibration record created successfully.");
            }
            resetForm();
            await loadRecords();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data || "";
            setError(msg ? `Error: ${msg}` : "Unable to save calibration record.");
        }
    };

    const editRecord = (rec) => {
        setEditingId(rec.id);
        setFormData({
            equipmentId: rec.equipmentId || "",
            technicianId: rec.technicianId || "",
            calibrationDate: rec.calibrationDate || "",
            nextCalibrationDate: rec.nextCalibrationDate || "",
            calibrationResult: rec.calibrationResult || "PENDING",
            certificateUrl: rec.certificateUrl || "",
            remarks: rec.remarks || "",
            status: rec.status || "PENDING"
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const deleteRecord = async (id) => {
        if (!window.confirm("Delete this calibration record?")) return;
        try {
            await api.delete(`/calibrations/${id}`);
            setSuccess("Calibration record deleted.");
            await loadRecords();
        } catch (err) {
            console.error(err);
            setError("Unable to delete calibration record.");
        }
    };

    const filterByStatus = async () => {
        if (!filterStatus) {
            loadRecords();
            return;
        }
        try {
            const response = await api.get(`/calibrations/status/${filterStatus}`);
            setRecords(response.data || []);
        } catch (err) {
            console.error(err);
            setError("Unable to filter records.");
        }
    };

    const getBadgeClass = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "completed") return "success";
        if (s === "pending") return "info";
        if (s === "due") return "warning";
        if (s === "overdue") return "danger";
        return "secondary";
    };

    const getResultBadge = (result) => {
        const r = (result || "").toLowerCase();
        if (r === "passed") return "success";
        if (r === "failed") return "danger";
        if (r === "adjusted") return "warning";
        return "info";
    };

    const formatDate = (d) => {
        if (!d) return "—";
        return new Date(d).toLocaleDateString();
    };

    return (
        <div className="page-content">
            <h1 className="mb-4">Calibration Management</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="card mb-4">
                <div className="card-body">
                    <h4 className="mb-3">{editingId ? "Edit Calibration Record" : "Create New Calibration Record"}</h4>
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
                                <label className="form-label text-muted fw-bold">Technician ID</label>
                                <input type="text" className="form-control" name="technicianId" value={formData.technicianId} onChange={handleChange} placeholder="Technician user ID (optional)" />
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="form-label text-muted fw-bold">Calibration Date</label>
                                <input type="date" className="form-control" name="calibrationDate" value={formData.calibrationDate} onChange={handleChange} required />
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="form-label text-muted fw-bold">Next Calibration Date</label>
                                <input type="date" className="form-control" name="nextCalibrationDate" value={formData.nextCalibrationDate} onChange={handleChange} />
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="form-label text-muted fw-bold">Status</label>
                                <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label text-muted fw-bold">Calibration Result</label>
                                <select className="form-select" name="calibrationResult" value={formData.calibrationResult} onChange={handleChange}>
                                    {CALIBRATION_RESULTS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label text-muted fw-bold">Certificate URL</label>
                                <input type="text" className="form-control" name="certificateUrl" value={formData.certificateUrl} onChange={handleChange} placeholder="https://..." />
                            </div>
                            <div className="col-12 mb-3">
                                <label className="form-label text-muted fw-bold">Remarks</label>
                                <textarea className="form-control" name="remarks" value={formData.remarks} onChange={handleChange} rows="2" placeholder="Additional notes" />
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
                            <th>Calibration Date</th>
                            <th>Next Due</th>
                            <th>Technician</th>
                            <th>Result</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                            {records.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-4 text-muted">No calibration records found</td></tr>
                            ) : (
                                records.map(rec => (
                                    <tr key={rec.id}>
                                        <td>
                                            <div className="fw-bold">{rec.equipmentName || "—"}</div>
                                            {rec.remarks && <div className="text-muted small">{rec.remarks}</div>}
                                        </td>
                                        <td>{formatDate(rec.calibrationDate)}</td>
                                        <td>{formatDate(rec.nextCalibrationDate)}</td>
                                        <td>{rec.technicianName || rec.technicianId || "—"}</td>
                                        <td>
                                            <span className={`badge badge-${getResultBadge(rec.calibrationResult)}`}>
                                                {rec.calibrationResult || "—"}
                                            </span>
                                        </td>
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

export default Calibration;
