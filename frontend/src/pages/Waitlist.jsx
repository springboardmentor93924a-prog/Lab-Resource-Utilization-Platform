import { useEffect, useState } from "react";
import api, { extractErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";

const pad = (n) => String(n).padStart(2, "0");

const getTomorrowStr = (hour) => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(hour, 0, 0, 0);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hour)}:00`;
};

const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const ensureSeconds = (dt) => {
    if (dt && dt.length === 16) return dt + ":00";
    return dt;
};

export default function Waitlist() {
    const { user, isResearcher, isManager, isAdmin } = useAuth();

    const [waitlists, setWaitlists] = useState([]);
    const [equipmentList, setEquipmentList] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        equipmentId: "",
        requestedStartTime: getTomorrowStr(9),
        requestedEndTime: getTomorrowStr(17),
        priority: 1,
        purpose: "",
        remarks: ""
    });

    const loadData = async () => {
        try {
            let endpoint = "/waitlist";
            if (isResearcher()) {
                endpoint = `/waitlist/user/${user.userId}`;
            }
            const [wlRes, eqRes] = await Promise.all([
                api.get(endpoint).catch(() => ({ data: [] })),
                api.get("/equipment").catch(() => ({ data: [] }))
            ]);
            setWaitlists(wlRes.data || []);
            setEquipmentList(eqRes.data || []);
        } catch (err) {
            console.error(err);
            setError("Unable to load waitlist data.");
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const joinWaitlist = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            await api.post("/waitlist", {
                userId: String(user.userId),
                equipmentId: String(formData.equipmentId),
                requestedStartTime: ensureSeconds(formData.requestedStartTime),
                requestedEndTime: ensureSeconds(formData.requestedEndTime),
                priority: parseInt(formData.priority) || 1,
                purpose: formData.purpose,
                remarks: formData.remarks
            });
            setSuccess("Successfully joined the waitlist!");
            setShowForm(false);
            setFormData({ equipmentId: "", requestedStartTime: getTomorrowStr(9), requestedEndTime: getTomorrowStr(17), priority: 1, purpose: "", remarks: "" });
            await loadData();
        } catch (err) {
            console.error(err);
            setError(`Unable to join waitlist: ${extractErrorMessage(err)}`);
        }
    };

    const cancelWaitlist = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this waitlist entry?")) return;
        try {
            await api.delete(`/waitlist/${id}`);
            setSuccess("Waitlist entry cancelled successfully.");
            await loadData();
        } catch (err) {
            console.error(err);
            setError("Unable to cancel waitlist entry.");
        }
    };

    const allocateNextUser = async (equipmentId) => {
        try {
            await api.put(`/waitlist/${equipmentId}/allocate`);
            setSuccess("Next user allocated successfully.");
            await loadData();
        } catch (err) {
            console.error(err);
            setError(`Unable to allocate user: ${extractErrorMessage(err)}`);
        }
    };

    const notifyUser = async (id) => {
        try {
            await api.put(`/waitlist/${id}/notify`);
            setSuccess("User notified successfully.");
            await loadData();
        } catch (err) {
            console.error(err);
            setError("Unable to notify user.");
        }
    };

    const expireWaitlist = async (id) => {
        try {
            await api.put(`/waitlist/${id}/expire`);
            setSuccess("Waitlist entry expired.");
            await loadData();
        } catch (err) {
            console.error(err);
            setError("Unable to expire waitlist entry.");
        }
    };

    const canManage = isManager() || isAdmin();

    const formatDateTime = (dt) => {
        if (!dt) return "";
        return String(dt).replace("T", " ").substring(0, 16);
    };

    const getBadgeClass = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "notified") return "success";
        if (s === "allocated" || s === "booked") return "info";
        if (s === "expired" || s === "cancelled") return "danger";
        return "warning";
    };

    return (
        <div className="page-content">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>{canManage ? "Manage Waitlists" : "My Waitlists"}</h1>
                {!canManage && (
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Cancel" : "+ Join Waitlist"}
                    </button>
                )}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {showForm && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="mb-3">Join Waitlist</h5>
                        <form onSubmit={joinWaitlist}>
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
                                <div className="col-md-3 mb-3">
                                    <label className="form-label text-muted fw-bold">Priority</label>
                                    <input type="number" className="form-control" name="priority" value={formData.priority} onChange={handleChange} min="1" max="5" />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label text-muted fw-bold">Purpose</label>
                                    <input type="text" className="form-control" name="purpose" value={formData.purpose} onChange={handleChange} placeholder="Research" />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-muted fw-bold">Requested Start Time</label>
                                    <input type="datetime-local" className="form-control" name="requestedStartTime" value={formData.requestedStartTime} onChange={handleChange} min={getMinDateTime()} required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-muted fw-bold">Requested End Time</label>
                                    <input type="datetime-local" className="form-control" name="requestedEndTime" value={formData.requestedEndTime} onChange={handleChange} min={getMinDateTime()} required />
                                </div>
                                <div className="col-12 mb-3">
                                    <label className="form-label text-muted fw-bold">Remarks</label>
                                    <input type="text" className="form-control" name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Optional remarks" />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary px-4">Join Waitlist</button>
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
                            <th>User</th>
                            <th>Requested Slot</th>
                            <th>Queue #</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {waitlists.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-4 text-muted">No waitlist entries found</td></tr>
                        ) : (
                            waitlists.map(w => {
                                const statusLower = (w.status || "").toLowerCase();
                                return (
                                <tr key={w.id}>
                                    <td className="fw-bold">{w.equipmentName || "Unknown"}</td>
                                    <td>{w.userName || "Unknown"}</td>
                                    <td>
                                        <div>{formatDateTime(w.requestedStartTime)}</div>
                                        <div className="text-muted small">to {formatDateTime(w.requestedEndTime)}</div>
                                    </td>
                                    <td>{w.queuePosition ?? "-"}</td>
                                    <td>
                                        <span className={`badge badge-${getBadgeClass(w.status)}`}>
                                            {(w.status || "Waiting").toLowerCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2 flex-wrap">
                                            {canManage && statusLower === 'waiting' && (
                                                <>
                                                    <button className="btn btn-outline-primary btn-sm" onClick={() => allocateNextUser(w.equipmentId)}>Allocate</button>
                                                    <button className="btn btn-outline-success btn-sm" onClick={() => notifyUser(w.id)}>Notify</button>
                                                </>
                                            )}
                                            {canManage && statusLower === 'notified' && (
                                                <button className="btn btn-outline-danger btn-sm" onClick={() => expireWaitlist(w.id)}>Expire</button>
                                            )}
                                            {statusLower !== 'expired' && statusLower !== 'cancelled' && (
                                                <button className="btn btn-outline-danger btn-sm" onClick={() => cancelWaitlist(w.id)}>Cancel</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );})
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        </div>
    );
}
