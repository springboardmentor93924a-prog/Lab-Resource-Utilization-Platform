import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./Maintenance.css";


const API_BASE_URL = "http://localhost:8080/api";

// Structured reason chips instead of free text — matches the button-first
// UX used across the rest of the app. Selecting one fills the description;
// the reporter can still edit it afterward.
const REASON_OPTIONS = [
    "Not functioning properly",
    "Improper / inaccurate results",
    "Physical damage",
    "Missing accessory or part",
    "Unusual noise or overheating",
    "Other",
];

function Maintenance() {
    const [searchParams] = useSearchParams();

    const [maintenanceRecords, setMaintenanceRecords] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");

    // id of the record currently being edited, null = create mode
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        equipmentId: "",
        maintenanceDate: "",
        maintenanceType: "",
        description: "",
        maintenanceStatus: "Scheduled",
        nextMaintenanceDate: ""
    });

    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    const isTech = role === "LAB_TECHNICIAN";
    const canDecide = ["LAB_MANAGER", "DEPARTMENT_HEAD", "INSTITUTION_ADMIN", "SYSTEM_ADMIN"].includes(role);

    // ------------------------------------------------------------------
    // Equipment Issue Reports (formerly the standalone /feedback page for
    // staff). Students never had a route here — they submit inline from
    // My Bookings (Reservations.jsx) within 1 hour of a booking completing,
    // or a staff member files a general report below via the same "⚠️
    // Report an Issue" flow the old Feedback page used, deep-linked from
    // Equipment.jsx (?equipmentId=).
    // ------------------------------------------------------------------
    const [feedbackList, setFeedbackList] = useState([]);
    const [feedbackLoading, setFeedbackLoading] = useState(true);
    const [feedbackError, setFeedbackError] = useState("");
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [feedbackForm, setFeedbackForm] = useState({
        equipmentId: "",
        description: "",
        urgency: "NORMAL",
    });

    const getHeaders = () => ({
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [maintenanceResponse, equipmentResponse] =
                await Promise.all([
                    fetch(`${API_BASE_URL}/maintenance`, {
                        headers: getHeaders()
                    }),
                    fetch(`${API_BASE_URL}/equipment`, {
                        headers: getHeaders()
                    })
                ]);

            if (!maintenanceResponse.ok) {
                throw new Error(
                    `Maintenance request failed: ${maintenanceResponse.status}`
                );
            }

            if (!equipmentResponse.ok) {
                throw new Error(
                    `Equipment request failed: ${equipmentResponse.status}`
                );
            }

            const maintenanceData = await maintenanceResponse.json();
            const equipmentData = await equipmentResponse.json();

            setMaintenanceRecords(maintenanceData);
            setEquipment(equipmentData);

        } catch (err) {
            console.error("Maintenance page error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchFeedback = async () => {
        try {
            setFeedbackLoading(true);
            setFeedbackError("");

            const res = await fetch(`${API_BASE_URL}/equipment-feedback`, {
                headers: getHeaders(),
            });
            if (!res.ok) throw new Error(`Failed to load issue reports: ${res.status}`);
            setFeedbackList(await res.json());
        } catch (err) {
            console.error("Feedback fetch error:", err);
            setFeedbackError(err.message);
        } finally {
            setFeedbackLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchFeedback();

        // Deep link from Equipment.jsx's "⚠️ Report" button, e.g.
        // /maintenance?equipmentId=3 — opens the report modal pre-filled.
        const paramEqId = searchParams.get("equipmentId");
        if (paramEqId) {
            setFeedbackForm((prev) => ({ ...prev, equipmentId: paramEqId }));
            setShowFeedbackForm(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setFormData({
            equipmentId: "",
            maintenanceDate: "",
            maintenanceType: "",
            description: "",
            maintenanceStatus: "Scheduled",
            nextMaintenanceDate: ""
        });
        setEditingId(null);
    };

    const openEditForm = (record) => {
        setFormData({
            equipmentId: record.equipment?.equipmentId || "",
            maintenanceDate: record.maintenanceDate || "",
            maintenanceType: record.maintenanceType || "",
            description: record.description || "",
            maintenanceStatus: record.maintenanceStatus || "Scheduled",
            nextMaintenanceDate: record.nextMaintenanceDate || ""
        });
        setEditingId(record.maintenanceId);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.equipmentId) {
            alert("Please select equipment.");
            return;
        }

        try {
            const maintenanceData = {
                equipment: {
                    equipmentId: Number(formData.equipmentId)
                },
                maintenanceDate: formData.maintenanceDate,
                maintenanceType: formData.maintenanceType,
                description: formData.description,
                maintenanceStatus: formData.maintenanceStatus,
                nextMaintenanceDate:
                    formData.nextMaintenanceDate || null
            };

            const isEditing = editingId !== null;

            const response = await fetch(
                isEditing
                    ? `${API_BASE_URL}/maintenance/${editingId}`
                    : `${API_BASE_URL}/maintenance`,
                {
                    method: isEditing ? "PUT" : "POST",
                    headers: getHeaders(),
                    body: JSON.stringify(maintenanceData)
                }
            );

            if (!response.ok) {
                const message = await response.text();
                throw new Error(
                    message ||
                        `Failed to ${isEditing ? "update" : "create"} maintenance record`
                );
            }

            resetForm();
            setShowForm(false);

            await fetchData();

        } catch (err) {
            console.error("Save maintenance error:", err);
            alert(`Failed to save maintenance record: ${err.message}`);
        }
    };

    const handleMarkComplete = async (record) => {
        if (!window.confirm(
            `Mark maintenance for "${getEquipmentName(record)}" as Completed? The equipment will be released back to Available.`
        )) {
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/maintenance/${record.maintenanceId}`,
                {
                    method: "PUT",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        ...record,
                        maintenanceStatus: "Completed"
                    })
                }
            );

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Failed to mark maintenance complete");
            }

            await fetchData();

        } catch (err) {
            console.error("Complete maintenance error:", err);
            alert(`Failed to mark complete: ${err.message}`);
        }
    };

    const getEquipmentName = (record) => {
        if (record.equipment?.name) {
            return record.equipment.name;
        }

        if (record.equipment?.equipmentName) {
            return record.equipment.equipmentName;
        }

        return "Unknown Equipment";
    };

    const getStatusClass = (status) => {
        if (!status) return "status-default";

        const value = status.toLowerCase();

        if (value.includes("complete")) {
            return "status-completed";
        }

        if (value.includes("progress")) {
            return "status-progress";
        }

        if (value.includes("cancel")) {
            return "status-cancelled";
        }

        return "status-scheduled";
    };

    // ------------------------------------------------------------------
    // Equipment Issue Reports handlers
    // ------------------------------------------------------------------

    const handleReasonClick = (reason) => {
        setFeedbackForm({ ...feedbackForm, description: reason === "Other" ? "" : reason });
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        setFeedbackError("");

        if (!feedbackForm.equipmentId) {
            setFeedbackError("Please select the equipment.");
            return;
        }
        if (!feedbackForm.description.trim()) {
            setFeedbackError("Please select or describe the issue.");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/equipment-feedback`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    equipment: { equipmentId: Number(feedbackForm.equipmentId) },
                    description: feedbackForm.description,
                    urgency: feedbackForm.urgency,
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || "Failed to submit report");
            }

            setShowFeedbackForm(false);
            setFeedbackForm({ equipmentId: "", description: "", urgency: "NORMAL" });
            fetchFeedback();
        } catch (err) {
            setFeedbackError(err.message);
        }
    };

    const handleMarkFixed = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/equipment-feedback/${id}/fix`, {
                method: "PUT",
                headers: getHeaders(),
            });
            if (!res.ok) throw new Error("Failed to mark as fixed");
            fetchFeedback();
        } catch (err) {
            setFeedbackError(err.message);
        }
    };

    const handleDecide = async (id, decision) => {
        try {
            const res = await fetch(`${API_BASE_URL}/equipment-feedback/${id}/decide?decision=${decision}`, {
                method: "PUT",
                headers: getHeaders(),
            });
            if (!res.ok) throw new Error("Failed to record decision");
            fetchFeedback();
        } catch (err) {
            setFeedbackError(err.message);
        }
    };

    const feedbackStatusBadgeClass = (status) => {
        if (status === "RESOLVED") return "badge badge-completed";
        if (status === "PENDING_APPROVAL") return "badge badge-blocking";
        if (status === "REJECTED") return "badge badge-cancelled";
        return "badge badge-cancelled";
    };

    if (loading) {
        return (
            <div className="maintenance-page">
                <div className="maintenance-loading">
                    Loading maintenance records...
                </div>
            </div>
        );
    }

    return (
        <div className="maintenance-page">

            <div className="maintenance-header">
                <div>
                    <h1>Maintenance</h1>
                    <p>
                        Manage equipment maintenance and service schedules
                    </p>
                </div>

                <button
                    className="add-maintenance-btn"
                    onClick={() => {
                        if (showForm) {
                            resetForm();
                        }
                        setShowForm(!showForm);
                    }}
                >
                    {showForm ? "Close" : "+ Schedule Maintenance"}
                </button>
            </div>

            {error && (
                <div className="maintenance-error">
                    {error}
                </div>
            )}

            {showForm && (
                <div className="maintenance-form-card">
                    <h2>{editingId ? "Edit Maintenance" : "Schedule Maintenance"}</h2>

                    <form onSubmit={handleSubmit}>

                        <div className="form-grid">

                            <div className="form-group">
                                <label>Equipment</label>

                                <select
                                    name="equipmentId"
                                    value={formData.equipmentId}
                                    onChange={handleChange}
                                    required
                                    disabled={editingId !== null}
                                >
                                    <option value="">
                                        Select equipment
                                    </option>

                                    {equipment.map((item) => (
                                        <option
                                            key={item.equipmentId || item.id}
                                            value={
                                                item.equipmentId || item.id
                                            }
                                        >
                                            {item.name ||
                                                item.equipmentName ||
                                                "Unnamed Equipment"}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Maintenance Date</label>

                                <input
                                    type="date"
                                    name="maintenanceDate"
                                    value={formData.maintenanceDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Maintenance Type</label>

                                <input
                                    type="text"
                                    name="maintenanceType"
                                    placeholder="e.g. Preventive Maintenance"
                                    value={formData.maintenanceType}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Status</label>

                                <select
                                    name="maintenanceStatus"
                                    value={formData.maintenanceStatus}
                                    onChange={handleChange}
                                >
                                    <option value="Scheduled">
                                        Scheduled
                                    </option>
                                    <option value="Active">
                                        Active
                                    </option>
                                    <option value="In Progress">
                                        In Progress
                                    </option>
                                    <option value="Completed">
                                        Completed
                                    </option>
                                    <option value="Cancelled">
                                        Cancelled
                                    </option>
                                </select>
                            </div>

                            <div className="form-group full-width">
                                <label>Description</label>

                                <textarea
                                    name="description"
                                    placeholder="Enter maintenance details..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label>Next Maintenance Date</label>

                                <input
                                    type="date"
                                    name="nextMaintenanceDate"
                                    value={formData.nextMaintenanceDate}
                                    onChange={handleChange}
                                />
                            </div>

                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => {
                                    resetForm();
                                    setShowForm(false);
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-btn"
                            >
                                {editingId ? "Update Maintenance" : "Save Maintenance"}
                            </button>
                        </div>

                    </form>
                </div>
            )}

            <div className="maintenance-summary">
                <div className="summary-card">
                    <span>Total Records</span>
                    <strong>{maintenanceRecords.length}</strong>
                </div>

                <div className="summary-card">
                    <span>Scheduled</span>
                    <strong>
                        {
                            maintenanceRecords.filter(
                                (item) =>
                                    item.maintenanceStatus?.toLowerCase() ===
                                    "scheduled"
                            ).length
                        }
                    </strong>
                </div>

                <div className="summary-card">
                    <span>In Progress</span>
                    <strong>
                        {
                            maintenanceRecords.filter(
                                (item) =>
                                    ["in progress", "active"].includes(
                                        item.maintenanceStatus?.toLowerCase()
                                    )
                            ).length
                        }
                    </strong>
                </div>

                <div className="summary-card">
                    <span>Completed</span>
                    <strong>
                        {
                            maintenanceRecords.filter(
                                (item) =>
                                    item.maintenanceStatus?.toLowerCase() ===
                                    "completed"
                            ).length
                        }
                    </strong>
                </div>
            </div>

            {maintenanceRecords.length === 0 ? (
                <div className="empty-maintenance">
                    <div className="empty-icon">🔧</div>
                    <h2>No Maintenance Records</h2>
                    <p>
                        No equipment is currently scheduled for maintenance.
                    </p>

                    <button
                        className="add-maintenance-btn"
                        onClick={() => setShowForm(true)}
                    >
                        + Schedule Maintenance
                    </button>
                </div>
            ) : (
                <div className="maintenance-grid">

                    {maintenanceRecords.map((record) => {
                        const status = record.maintenanceStatus?.toLowerCase() || "";
                        const isClosed = status === "completed" || status === "cancelled";

                        return (
                            <div
                                className="maintenance-card"
                                key={record.maintenanceId}
                            >

                                <div className="maintenance-card-top">
                                    <div className="equipment-icon">
                                        🔧
                                    </div>

                                    <span
                                        className={`maintenance-status ${getStatusClass(
                                            record.maintenanceStatus
                                        )}`}
                                    >
                                        {record.maintenanceStatus ||
                                            "Unknown"}
                                    </span>
                                </div>

                                <h2>
                                    {getEquipmentName(record)}
                                </h2>

                                <div className="maintenance-info">

                                    <div>
                                        <span>Maintenance Date</span>
                                        <strong>
                                            {record.maintenanceDate || "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Type</span>
                                        <strong>
                                            {record.maintenanceType || "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Next Maintenance</span>
                                        <strong>
                                            {record.nextMaintenanceDate || "—"}
                                        </strong>
                                    </div>

                                </div>

                                {record.description && (
                                    <div className="maintenance-description">
                                        {record.description}
                                    </div>
                                )}

                                <div className="maintenance-card-actions">
                                    <button
                                        type="button"
                                        className="edit-maintenance-btn"
                                        onClick={() => openEditForm(record)}
                                    >
                                        Edit
                                    </button>

                                    {!isClosed && (
                                        <button
                                            type="button"
                                            className="complete-maintenance-btn"
                                            onClick={() => handleMarkComplete(record)}
                                        >
                                            Mark Complete
                                        </button>
                                    )}
                                </div>

                            </div>
                        );
                    })}

                </div>
            )}

            {/* ================================================================
                Equipment Issue Reports — folded in from the old standalone
                /feedback page. Any technician can pick an open report from
                the shared queue and Mark as Fixed; a manager/dept head/admin
                then Approves (→ Resolved) or Rejects (→ back to the queue).
               ================================================================ */}
            <div className="feedback-page" style={{ marginTop: "32px" }}>
                <div className="maintenance-header" style={{ marginBottom: "12px" }}>
                    <div>
                        <h1 style={{ fontSize: "20px" }}>Equipment Issue Reports</h1>
                        <p>Reports filed by researchers and staff — pick one up, fix it, get it verified.</p>
                    </div>
                    <button className="primary-btn" onClick={() => setShowFeedbackForm(true)}>
                        + Report an Issue
                    </button>
                </div>

                {feedbackError && <div className="feedback-error">{feedbackError}</div>}

                {feedbackLoading ? (
                    <p>Loading issue reports...</p>
                ) : feedbackList.length === 0 ? (
                    <div className="feedback-empty">No equipment issues reported yet.</div>
                ) : (
                    <table className="feedback-table">
                        <thead>
                            <tr>
                                <th>Equipment</th>
                                <th>Description</th>
                                <th>Urgency</th>
                                <th>Status</th>
                                <th>Reported By</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feedbackList.map((f) => (
                                <tr key={f.feedbackId}>
                                    <td>{f.equipment?.equipmentName || "—"}</td>
                                    <td>{f.description}</td>
                                    <td>
                                        <span className={f.urgency === "URGENT" ? "badge badge-cancelled" : "badge badge-blocking"}>
                                            {f.urgency}
                                        </span>
                                    </td>
                                    <td><span className={feedbackStatusBadgeClass(f.status)}>{f.status}</span></td>
                                    <td>{f.reportedBy?.fullName || "—"}</td>
                                    <td className="feedback-actions">
                                        {isTech && (f.status === "PENDING" || f.status === "REJECTED") && (
                                            <button className="primary-btn small" onClick={() => handleMarkFixed(f.feedbackId)}>
                                                Mark Fixed
                                            </button>
                                        )}

                                        {canDecide && f.status === "PENDING_APPROVAL" && (
                                            <>
                                                <button className="primary-btn small" onClick={() => handleDecide(f.feedbackId, "RESOLVED")}>
                                                    Approve Fix
                                                </button>
                                                <button className="secondary-btn small" onClick={() => handleDecide(f.feedbackId, "REJECTED")}>
                                                    Reject
                                                </button>
                                            </>
                                        )}

                                        {f.status === "RESOLVED" && (
                                            <span style={{ fontSize: "11px", color: "#64748b" }}>Resolved</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {showFeedbackForm && (
                    <div className="feedback-modal-overlay">
                        <div className="feedback-modal">
                            <h3>Report an Issue</h3>

                            <form onSubmit={handleFeedbackSubmit}>
                                <label>Equipment</label>
                                <select
                                    value={feedbackForm.equipmentId}
                                    onChange={(e) => setFeedbackForm({ ...feedbackForm, equipmentId: e.target.value })}
                                    required
                                >
                                    <option value="">Select equipment</option>
                                    {equipment.map((eq) => (
                                        <option key={eq.equipmentId} value={eq.equipmentId}>
                                            {eq.equipmentName || eq.name}
                                        </option>
                                    ))}
                                </select>

                                <label>What's wrong?</label>
                                <div className="reason-btn-group">
                                    {REASON_OPTIONS.map((reason) => (
                                        <button
                                            type="button"
                                            key={reason}
                                            className={feedbackForm.description === reason ? "reason-btn active" : "reason-btn"}
                                            onClick={() => handleReasonClick(reason)}
                                        >
                                            {reason}
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    placeholder="Add more detail if needed..."
                                    value={feedbackForm.description}
                                    onChange={(e) => setFeedbackForm({ ...feedbackForm, description: e.target.value })}
                                    rows={3}
                                />

                                <label>Urgency</label>
                                <div className="status-btn-group">
                                    <button
                                        type="button"
                                        className={feedbackForm.urgency === "NORMAL" ? "status-btn active" : "status-btn"}
                                        onClick={() => setFeedbackForm({ ...feedbackForm, urgency: "NORMAL" })}
                                    >
                                        Normal
                                    </button>
                                    <button
                                        type="button"
                                        className={feedbackForm.urgency === "URGENT" ? "status-btn active urgent" : "status-btn"}
                                        onClick={() => setFeedbackForm({ ...feedbackForm, urgency: "URGENT" })}
                                    >
                                        Urgent
                                    </button>
                                </div>

                                <div className="feedback-modal-actions">
                                    <button type="button" className="secondary-btn" onClick={() => setShowFeedbackForm(false)}>Cancel</button>
                                    <button type="submit" className="primary-btn">Submit Report</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}

export default Maintenance;