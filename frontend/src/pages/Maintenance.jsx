import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./Maintenance.css";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

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
        nextMaintenanceDate: "",
        assignedTechnicianId: ""
    });

    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    const isTech = role === "LAB_TECHNICIAN";
    // Department Head/Institution Admin no longer reach this page at all
    // (see AppRoutes.jsx) — trimmed to match who's actually here now.
    const canDecide = ["LAB_MANAGER", "INSTITUTION_ADMIN", "SYSTEM_ADMIN"].includes(role);
    // Same roles that create/assign maintenance work orders — see
    // MaintenanceController.createMaintenance's @PreAuthorize.
    const canManageWorkOrders = canDecide;

    // Rejecting a completed work order is a PUT — INSTITUTION_ADMIN isn't
    // in MaintenanceController's PUT @PreAuthorize at all, so unlike
    // canDecide above this is Lab Manager (+ System Admin) only. This is
    // also enforced server-side in MaintenanceServiceImpl.
    const canReject = ["LAB_MANAGER", "SYSTEM_ADMIN"].includes(role);

    // Technicians for the "Assign Technician" dropdown (managers/dept
    // heads/admins only — technicians don't need to see this list).
    const [technicians, setTechnicians] = useState([]);

    // "All / Scheduled / Active / In Progress / Completed / Cancelled" —
    // doubles as the maintenance history view (filter down to Completed
    // or Cancelled to see what's closed out).
    const [statusFilter, setStatusFilter] = useState("All");

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

            // Lab Technicians only ever see their own assigned work
            // orders (My Tasks); every other allowed role sees the full
            // list and can create/assign/edit any record.
            const maintenanceUrl = isTech
                ? `${API_BASE_URL}/maintenance/my-tasks`
                : `${API_BASE_URL}/maintenance`;

            const [maintenanceResponse, equipmentResponse] =
                await Promise.all([
                    fetch(maintenanceUrl, {
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

    const fetchTechnicians = async () => {
        if (!canManageWorkOrders) return;
        try {
            const res = await fetch(`${API_BASE_URL}/technician/list`, {
                headers: getHeaders(),
            });
            if (!res.ok) throw new Error(`Failed to load technicians: ${res.status}`);
            setTechnicians(await res.json());
        } catch (err) {
            console.error("Technician list error:", err);
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
        fetchTechnicians();

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
            nextMaintenanceDate: "",
            assignedTechnicianId: ""
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
            nextMaintenanceDate: record.nextMaintenanceDate || "",
            assignedTechnicianId: record.assignedTechnician?.userId || ""
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
                    formData.nextMaintenanceDate || null,
                // Only managers/dept heads/admins ever see or set this
                // field (assignedTechnicianId stays "" for a technician
                // editing their own task, so this is simply omitted —
                // the backend also rejects a technician trying to set it
                // to anyone but themselves, see MaintenanceServiceImpl).
                assignedTechnician: formData.assignedTechnicianId
                    ? { userId: Number(formData.assignedTechnicianId) }
                    : null
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
            console.error("Mark complete error:", err);
            alert(`Failed: ${err.message}`);
        }
    };

    const handleReject = async (record) => {
        const reason = window.prompt(
            `Send "${getEquipmentName(record)}" back to ${getTechnicianName(record) || "the technician"} for rework.\n\nWhat needs to be fixed?`
        );

        if (reason === null) return;

        if (!reason.trim()) {
            alert("A reason is required to reject a completed task.");
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
                        maintenanceStatus: "Rejected",
                        rejectionReason: reason.trim()
                    })
                }
            );

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Failed to reject maintenance task");
            }

            await fetchData();

        } catch (err) {
            console.error("Reject maintenance error:", err);
            alert(`Failed to reject: ${err.message}`);
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

    const getTechnicianName = (record) => {
        if (!record.assignedTechnician) return null;
        return record.assignedTechnician.fullName
            || record.assignedTechnician.name
            || record.assignedTechnician.email
            || `Technician #${record.assignedTechnician.userId}`;
    };

    // Lightweight equipment-downtime indicator — days the record has been
    // open (not yet Completed/Cancelled), counted from maintenanceDate.
    // There's no separate "closed at" timestamp in this schema, so a
    // closed record just doesn't show a downtime figure.
    const getDowntimeDays = (record) => {
        const status = record.maintenanceStatus?.toLowerCase() || "";
        if (status === "completed" || status === "cancelled") return null;
        if (!record.maintenanceDate) return null;

        const started = new Date(record.maintenanceDate).getTime();
        const days = Math.max(0, Math.floor((Date.now() - started) / 86400000));
        return days;
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

        if (value.includes("reject")) {
            return "status-rejected";
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
                    <h1>{isTech ? "My Maintenance Tasks" : "Maintenance"}</h1>
                    <p>
                        {isTech
                            ? "Work orders assigned to you — update status and log your work."
                            : "Manage equipment maintenance and service schedules"}
                    </p>
                </div>

                {canManageWorkOrders && (
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
                )}
            </div>

            {error && (
                <div className="maintenance-error">
                    {error}
                </div>
            )}

            {showForm && canManageWorkOrders && (
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
                                    <option value="Rejected">
                                        Rejected
                                    </option>
                                    <option value="Cancelled">
                                        Cancelled
                                    </option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Assign Technician</label>

                                <select
                                    name="assignedTechnicianId"
                                    value={formData.assignedTechnicianId}
                                    onChange={handleChange}
                                >
                                    <option value="">Unassigned</option>
                                    {technicians.map((tech) => (
                                        <option key={tech.userId} value={tech.userId}>
                                            {tech.fullName || tech.name || tech.email}
                                        </option>
                                    ))}
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

            {showForm && isTech && (
                <div className="maintenance-form-card">
                    <h2>Update Task</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">

                            <div className="form-group">
                                <label>Equipment</label>
                                <input type="text" value={getEquipmentName({ equipment: equipment.find(e => String(e.equipmentId) === String(formData.equipmentId)) }) || "—"} disabled />
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    name="maintenanceStatus"
                                    value={formData.maintenanceStatus}
                                    onChange={handleChange}
                                >
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="Active">Active</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    {formData.maintenanceStatus === "Rejected" && (
                                        <option value="Rejected" disabled>
                                            Rejected — pick a status to resubmit
                                        </option>
                                    )}
                                </select>
                            </div>

                            <div className="form-group full-width">
                                <label>Work log / notes</label>
                                <textarea
                                    name="description"
                                    placeholder="What did you find / do?"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
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
                            <button type="submit" className="save-btn">
                                Update Task
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!isTech && (
                <div className="maintenance-status-tabs" style={{ display: "flex", gap: "8px", margin: "12px 0", flexWrap: "wrap" }}>
                    {["All", "Scheduled", "Active", "In Progress", "Completed", "Rejected", "Cancelled"].map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setStatusFilter(tab)}
                            className={statusFilter === tab ? "status-btn active" : "status-btn"}
                        >
                            {tab}
                        </button>
                    ))}
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

            {(() => {
                const filteredRecords = (!isTech && statusFilter !== "All")
                    ? maintenanceRecords.filter(
                          (r) => (r.maintenanceStatus || "").toLowerCase() === statusFilter.toLowerCase()
                      )
                    : maintenanceRecords;

                if (filteredRecords.length === 0) {
                    return (
                        <div className="empty-maintenance">
                            <div className="empty-icon">🔧</div>
                            <h2>No Maintenance Records</h2>
                            <p>
                                {isTech
                                    ? "You have no maintenance tasks assigned right now."
                                    : statusFilter === "All"
                                        ? "No equipment is currently scheduled for maintenance."
                                        : `No records with status "${statusFilter}".`}
                            </p>

                            {canManageWorkOrders && statusFilter === "All" && (
                                <button
                                    className="add-maintenance-btn"
                                    onClick={() => setShowForm(true)}
                                >
                                    + Schedule Maintenance
                                </button>
                            )}
                        </div>
                    );
                }

                return (
                <div className="maintenance-grid">

                    {filteredRecords.map((record) => {
                        const status = record.maintenanceStatus?.toLowerCase() || "";
                        const isClosed = status === "completed" || status === "cancelled";
                        const technicianName = getTechnicianName(record);
                        const downtimeDays = getDowntimeDays(record);

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

                                    <div>
                                        <span>Assigned to</span>
                                        <strong>
                                            {technicianName || "Unassigned"}
                                        </strong>
                                    </div>

                                    {downtimeDays !== null && (
                                        <div>
                                            <span>Equipment downtime</span>
                                            <strong>
                                                {downtimeDays === 0 ? "Opened today" : `${downtimeDays} day${downtimeDays === 1 ? "" : "s"} so far`}
                                            </strong>
                                        </div>
                                    )}

                                </div>

                                {record.description && (
                                    <div className="maintenance-description">
                                        {record.description}
                                    </div>
                                )}

                                {status === "rejected" && record.rejectionReason && (
                                    <div className="maintenance-rejection-banner">
                                        <strong>Sent back for rework:</strong>
                                        {record.rejectionReason}
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

                                    {canReject && status === "completed" && (
                                        <button
                                            type="button"
                                            className="edit-maintenance-btn"
                                            onClick={() => handleReject(record)}
                                        >
                                            Reject
                                        </button>
                                    )}
                                </div>

                            </div>
                        );
                    })}

                </div>
                );
            })()}

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