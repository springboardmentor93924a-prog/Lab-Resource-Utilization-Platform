import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Sharing() {
    const { user, isManager, isAdmin, isResearcher } = useAuth();

    const [requests, setRequests] = useState([]);
    const [equipmentList, setEquipmentList] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showCreate, setShowCreate] = useState(false);
    const [formData, setFormData] = useState({
        equipmentId: "",
        providerInstitutionId: "",
        requesterInstitutionId: "",
        startDate: "",
        endDate: "",
        purpose: ""
    });

    const loadData = async () => {
        try {
            let endpoint = "/resource-sharing";
            if (isResearcher()) {
                endpoint = `/resource-sharing/requester/${user.userId}`;
            }
            const [res, eqRes, instRes] = await Promise.all([
                api.get(endpoint).catch(() => ({ data: [] })),
                api.get("/equipment").catch(() => ({ data: [] })),
                api.get("/institutions").catch(() => ({ data: [] }))
            ]);
            setRequests(res.data || []);
            setEquipmentList(eqRes.data || []);
            setInstitutions(instRes.data || []);
        } catch (err) {
            console.error(err);
            setError("Unable to load sharing requests.");
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const createRequest = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            const payload = {
                equipmentId: formData.equipmentId,
                providerInstitutionId: formData.providerInstitutionId,
                requesterId: String(user.userId),
                requesterInstitutionId: formData.requesterInstitutionId,
                startTime: `${formData.startDate}T00:00:00`,
                endTime: `${formData.endDate}T23:59:59`,
                purpose: formData.purpose
            };
            await api.post("/resource-sharing", payload);
            setSuccess("Resource sharing request submitted successfully.");
            setShowCreate(false);
            setFormData({ equipmentId: "", providerInstitutionId: "", requesterInstitutionId: "", startDate: "", endDate: "", purpose: "" });
            await loadData();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data || "";
            setError(msg ? `Unable to submit sharing request: ${msg}` : "Unable to submit sharing request.");
        }
    };

    const updateStatus = async (id, action) => {
        try {
            if (action === "approve") {
                await api.put(`/resource-sharing/${id}/approve?approvedById=${user.userId}`);
            } else if (action === "reject") {
                const reason = window.prompt("Reason for rejection:");
                if (reason === null) return;
                await api.put(`/resource-sharing/${id}/reject?approvedById=${user.userId}&rejectionReason=${encodeURIComponent(reason)}`);
            }
            setSuccess(`Request ${action}d successfully.`);
            await loadData();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data || "";
            setError(msg ? `Unable to ${action} request: ${msg}` : `Unable to ${action} request.`);
        }
    };

    const canManage = isManager() || isAdmin();

    const formatDate = (dt) => {
        if (!dt) return "";
        return String(dt).split("T")[0];
    };

    const getBadgeClass = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "approved") return "success";
        if (s === "rejected") return "danger";
        return "warning";
    };

    return (
        <div className="page-content">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>{canManage ? "Manage Resource Sharing" : "My Sharing Requests"}</h1>
                <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
                    {showCreate ? "Cancel" : "+ New Request"}
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {showCreate && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="mb-3">Request External Resource</h5>
                        <form onSubmit={createRequest}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-muted fw-bold">Equipment</label>
                                    <select className="form-select" name="equipmentId" value={formData.equipmentId} onChange={handleChange} required>
                                        <option value="">Select Equipment</option>
                                        {equipmentList.map(eq => (
                                            <option key={eq.id} value={eq.id}>{eq.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-muted fw-bold">Your Institution</label>
                                    <select className="form-select" name="requesterInstitutionId" value={formData.requesterInstitutionId} onChange={handleChange} required>
                                        <option value="">Select your institution</option>
                                        {institutions.map(inst => (
                                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-muted fw-bold">Provider Institution</label>
                                    <select className="form-select" name="providerInstitutionId" value={formData.providerInstitutionId} onChange={handleChange} required>
                                        <option value="">Select provider institution</option>
                                        {institutions.map(inst => (
                                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label text-muted fw-bold">Start Date</label>
                                    <input type="date" className="form-control" name="startDate" value={formData.startDate} onChange={handleChange} required />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label text-muted fw-bold">End Date</label>
                                    <input type="date" className="form-control" name="endDate" value={formData.endDate} onChange={handleChange} required />
                                </div>
                                <div className="col-12 mb-3">
                                    <label className="form-label text-muted fw-bold">Purpose</label>
                                    <textarea className="form-control" name="purpose" value={formData.purpose} onChange={handleChange} rows="2" required></textarea>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary px-4">Submit</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Equipment</th>
                            <th>Provider Institution</th>
                            <th>Requester</th>
                            <th>Dates</th>
                            <th>Purpose</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr><td colSpan="7" className="text-center py-4 text-muted">No sharing requests found</td></tr>
                        ) : (
                            requests.map(r => (
                                <tr key={r.id}>
                                    <td className="fw-bold">{r.equipmentName || r.equipmentId}</td>
                                    <td>{r.providerInstitutionName || r.providerInstitutionId}</td>
                                    <td>
                                        <div>{r.requesterName || "Unknown"}</div>
                                        <div className="text-muted small">{r.requesterInstitutionName || ""}</div>
                                    </td>
                                    <td>
                                        <div>{formatDate(r.startTime)}</div>
                                        <div className="text-muted small">to {formatDate(r.endTime)}</div>
                                    </td>
                                    <td>{r.purpose}</td>
                                    <td>
                                        <span className={`badge badge-${getBadgeClass(r.status)}`}>
                                            {r.status || "Pending"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            {canManage && (r.status || "").toLowerCase() === 'pending' && (
                                                <>
                                                    <button className="btn btn-outline-success btn-sm" onClick={() => updateStatus(r.id, 'approve')}>Approve</button>
                                                    <button className="btn btn-outline-danger btn-sm" onClick={() => updateStatus(r.id, 'reject')}>Reject</button>
                                                </>
                                            )}
                                            {(r.status || "").toLowerCase() === 'rejected' && r.rejectionReason && (
                                                <button className="btn btn-secondary btn-sm" title={r.rejectionReason} disabled>Reason</button>
                                            )}
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
