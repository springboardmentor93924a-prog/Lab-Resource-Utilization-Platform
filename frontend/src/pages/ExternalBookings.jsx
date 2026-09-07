import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED"];

function ExternalBookings() {
    const { user, isManager, isAdmin } = useAuth();
    const canReview = isManager() || isAdmin();

    const [bookings, setBookings] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [filterStatus, setFilterStatus] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        equipmentId: "",
        requestingInstitutionId: "",
        requestedStartTime: "",
        requestedEndTime: "",
        purpose: ""
    });

    const [reviewModal, setReviewModal] = useState({
        open: false,
        bookingId: null,
        status: "APPROVED",
        accessInstructions: "",
        rejectionReason: ""
    });

    const loadBookings = async () => {
        try {
            const response = await api.get("/external-bookings");
            setBookings(response.data || []);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Unable to load external bookings.");
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

    const loadInstitutions = async () => {
        try {
            const response = await api.get("/institutions");
            setInstitutions(response.data || []);
        } catch {
            console.error("Unable to load institutions");
        }
    };

    useEffect(() => {
        loadBookings();
        loadEquipment();
        loadInstitutions();
         
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toLocalDateTime = (dt) => {
        if (!dt) return null;
        return dt.length <= 10 ? `${dt}T00:00:00` : dt;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            const payload = {
                equipmentId: formData.equipmentId,
                requestedByUserId: String(user.userId),
                requestingInstitutionId: formData.requestingInstitutionId,
                requestedStartTime: toLocalDateTime(formData.requestedStartTime),
                requestedEndTime: toLocalDateTime(formData.requestedEndTime),
                purpose: formData.purpose
            };
            await api.post("/external-bookings", payload);
            setSuccess("External booking request submitted successfully.");
            setFormData({
                equipmentId: "",
                requestingInstitutionId: "",
                requestedStartTime: "",
                requestedEndTime: "",
                purpose: ""
            });
            await loadBookings();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data || "";
            setError(msg ? `Error: ${msg}` : "Unable to submit external booking.");
        }
    };

    const cancelBooking = async (id) => {
        if (!window.confirm("Cancel this external booking?")) return;
        try {
            await api.put(`/external-bookings/${id}/cancel?userId=${user.userId}`);
            setSuccess("External booking cancelled.");
            await loadBookings();
        } catch (err) {
            console.error(err);
            setError("Unable to cancel booking.");
        }
    };

    const completeBooking = async (id) => {
        if (!window.confirm("Mark this booking as completed?")) return;
        try {
            await api.put(`/external-bookings/${id}/complete`);
            setSuccess("Booking marked as completed.");
            await loadBookings();
        } catch (err) {
            console.error(err);
            setError("Unable to complete booking.");
        }
    };

    const deleteBooking = async (id) => {
        if (!window.confirm("Delete this external booking record?")) return;
        try {
            await api.delete(`/external-bookings/${id}`);
            setSuccess("External booking deleted.");
            await loadBookings();
        } catch (err) {
            console.error(err);
            setError("Unable to delete booking.");
        }
    };

    const openReviewModal = (booking) => {
        setReviewModal({
            open: true,
            bookingId: booking.id,
            status: "APPROVED",
            accessInstructions: "",
            rejectionReason: ""
        });
    };

    const handleReviewChange = (e) => {
        setReviewModal({ ...reviewModal, [e.target.name]: e.target.value });
    };

    const submitReview = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            const payload = {
                reviewedByUserId: String(user.userId),
                status: reviewModal.status,
                accessInstructions: reviewModal.status === "APPROVED" ? reviewModal.accessInstructions : null,
                rejectionReason: reviewModal.status === "REJECTED" ? reviewModal.rejectionReason : null
            };
            await api.put(`/external-bookings/${reviewModal.bookingId}/review`, payload);
            setSuccess(`Booking ${reviewModal.status.toLowerCase()} successfully.`);
            setReviewModal({ open: false, bookingId: null, status: "APPROVED", accessInstructions: "", rejectionReason: "" });
            await loadBookings();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data || "";
            setError(msg ? `Error: ${msg}` : "Unable to review booking.");
        }
    };

    const filterByStatus = async () => {
        if (!filterStatus) {
            loadBookings();
            return;
        }
        try {
            const response = await api.get(`/external-bookings/status/${filterStatus}`);
            setBookings(response.data || []);
        } catch (err) {
            console.error(err);
            setError("Unable to filter bookings.");
        }
    };

    const getBadgeClass = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "approved") return "success";
        if (s === "pending") return "info";
        if (s === "rejected" || s === "cancelled") return "danger";
        if (s === "completed") return "primary";
        return "secondary";
    };

    const formatDateTime = (dt) => {
        if (!dt) return "—";
        return new Date(dt).toLocaleString();
    };

    return (
        <div className="page-content">
            <h1 className="mb-4">External Bookings</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="card mb-4">
                <div className="card-body">
                    <h4 className="mb-3">Request External Equipment Access</h4>
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label text-muted fw-bold">Equipment</label>
                                <select className="form-select" name="equipmentId" value={formData.equipmentId} onChange={handleChange} required>
                                    <option value="">Select equipment</option>
                                    {equipment.map(eq => (
                                        <option key={eq.id} value={eq.id}>{eq.name} ({eq.institutionName || "—"})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label text-muted fw-bold">Requesting Institution</label>
                                <select className="form-select" name="requestingInstitutionId" value={formData.requestingInstitutionId} onChange={handleChange} required>
                                    <option value="">Select your institution</option>
                                    {institutions.map(inst => (
                                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="form-label text-muted fw-bold">Start Time</label>
                                <input type="datetime-local" className="form-control" name="requestedStartTime" value={formData.requestedStartTime} onChange={handleChange} required />
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="form-label text-muted fw-bold">End Time</label>
                                <input type="datetime-local" className="form-control" name="requestedEndTime" value={formData.requestedEndTime} onChange={handleChange} required />
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="form-label text-muted fw-bold">Purpose</label>
                                <input type="text" className="form-control" name="purpose" value={formData.purpose} onChange={handleChange} placeholder="Purpose of access" required />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary px-4">Submit Request</button>
                    </form>
                </div>
            </div>

            <div className="d-flex align-items-center mb-3 gap-2">
                <select className="form-select" style={{ maxWidth: "200px" }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button className="btn btn-outline-primary" onClick={filterByStatus}>Filter</button>
                <button className="btn btn-outline-secondary" onClick={loadBookings}>Clear</button>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Equipment</th>
                            <th>Requester</th>
                            <th>Institutions</th>
                            <th>Time Slot</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-4 text-muted">No external bookings found</td></tr>
                            ) : (
                                bookings.map(b => (
                                    <tr key={b.id}>
                                        <td>
                                            <div className="fw-bold">{b.equipmentName || "—"}</div>
                                            <div className="text-muted small">{b.purpose}</div>
                                        </td>
                                        <td>{b.requestedByUserName || b.requestedByUserId || "—"}</td>
                                        <td>
                                            <div className="small">
                                                <strong>From:</strong> {b.requestingInstitutionName || "—"}
                                            </div>
                                            <div className="small">
                                                <strong>To:</strong> {b.providerInstitutionName || "—"}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="small">{formatDateTime(b.requestedStartTime)}</div>
                                            <div className="small text-muted">to {formatDateTime(b.requestedEndTime)}</div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${getBadgeClass(b.status)}`}>
                                                {b.status || "UNKNOWN"}
                                            </span>
                                            {b.accessInstructions && (
                                                <div className="text-muted small mt-1">Access: {b.accessInstructions}</div>
                                            )}
                                            {b.rejectionReason && (
                                                <div className="text-danger small mt-1">Reason: {b.rejectionReason}</div>
                                            )}
                                        </td>
                                        <td>
                                            <div className="d-flex flex-wrap gap-1">
                                                {canReview && b.status === "PENDING" && (
                                                    <button className="btn btn-outline-success btn-sm" onClick={() => openReviewModal(b)}>Review</button>
                                                )}
                                                {canReview && b.status === "APPROVED" && (
                                                    <button className="btn btn-outline-primary btn-sm" onClick={() => completeBooking(b.id)}>Complete</button>
                                                )}
                                                {(b.status === "PENDING" || b.status === "APPROVED") && (
                                                    <button className="btn btn-outline-warning btn-sm" onClick={() => cancelBooking(b.id)}>Cancel</button>
                                                )}
                                                {canReview && (
                                                    <button className="btn btn-outline-danger btn-sm" onClick={() => deleteBooking(b.id)}>Delete</button>
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

            {reviewModal.open && (
                <div className="modal-overlay" style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.5)", display: "flex",
                    alignItems: "center", justifyContent: "center", zIndex: 1050
                }}>
                    <div className="card" style={{ maxWidth: "500px", width: "90%" }}>
                        <div className="card-body">
                            <h4 className="mb-3">Review External Booking</h4>
                            <form onSubmit={submitReview}>
                                <div className="mb-3">
                                    <label className="form-label text-muted fw-bold">Decision</label>
                                    <select className="form-select" name="status" value={reviewModal.status} onChange={handleReviewChange} required>
                                        <option value="APPROVED">Approve</option>
                                        <option value="REJECTED">Reject</option>
                                    </select>
                                </div>
                                {reviewModal.status === "APPROVED" && (
                                    <div className="mb-3">
                                        <label className="form-label text-muted fw-bold">Access Instructions</label>
                                        <textarea className="form-control" name="accessInstructions" value={reviewModal.accessInstructions} onChange={handleReviewChange} rows="3" placeholder="Provide access instructions for the requester" />
                                    </div>
                                )}
                                {reviewModal.status === "REJECTED" && (
                                    <div className="mb-3">
                                        <label className="form-label text-muted fw-bold">Rejection Reason</label>
                                        <textarea className="form-control" name="rejectionReason" value={reviewModal.rejectionReason} onChange={handleReviewChange} rows="3" placeholder="Explain why the request is rejected" required />
                                    </div>
                                )}
                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary px-4">Submit Review</button>
                                    <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setReviewModal({ open: false, bookingId: null, status: "APPROVED", accessInstructions: "", rejectionReason: "" })}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExternalBookings;
