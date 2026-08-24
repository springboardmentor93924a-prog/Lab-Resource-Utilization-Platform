import React, { useEffect, useState } from "react";
import "./Maintenance.css";

const API_BASE_URL = "http://localhost:8080/api";

/*
 * Maintenance Module (Milestone 3, Task 1).
 *
 * This page was rebuilt against the new Maintenance Module backend.
 * The previous "Schedule" tab called /api/maintenance, which no
 * longer exists on the backend (there is no Maintenance entity,
 * controller, or service in the delivered backend) - that dead code
 * path has been removed entirely.
 *
 * Four sections, matching the new backend one-to-one:
 *   - Maintenance Request   -> /api/maintenance-requests/**
 *   - Work Order            -> /api/work-orders/**
 *   - Maintenance Service Log -> /api/service-logs/**
 *   - Equipment Downtime    -> /api/equipment-downtime/**
 *
 * All list/detail data is read from the DTOs the backend actually
 * returns (MaintenanceRequestDTO, WorkOrderDTO, MaintenanceServiceLogDTO,
 * EquipmentDowntimeDTO) - these are flattened (e.g. `equipmentName`,
 * `assignedTechnicianId`), not nested JPA entities.
 */

const REQUEST_REVIEW_ROLES = [
    "LAB_TECHNICIAN", "LAB_MANAGER", "DEPARTMENT_HEAD", "INSTITUTION_ADMIN", "SYSTEM_ADMIN"
];
const WORK_ORDER_MANAGE_ROLES = [
    "LAB_TECHNICIAN", "LAB_MANAGER", "INSTITUTION_ADMIN", "SYSTEM_ADMIN"
];
const SERVICE_LOG_ADD_ROLES = [
    "LAB_TECHNICIAN", "LAB_MANAGER", "INSTITUTION_ADMIN", "SYSTEM_ADMIN"
];
const DOWNTIME_MANAGE_ROLES = [
    "LAB_TECHNICIAN", "LAB_MANAGER", "INSTITUTION_ADMIN", "SYSTEM_ADMIN"
];

function Maintenance() {
    const role = sessionStorage.getItem("role");
    const token = sessionStorage.getItem("token");

    const canReviewRequests = REQUEST_REVIEW_ROLES.includes(role);
    const canManageWorkOrders = WORK_ORDER_MANAGE_ROLES.includes(role);
    const canAddServiceLog = SERVICE_LOG_ADD_ROLES.includes(role);
    const canManageDowntime = DOWNTIME_MANAGE_ROLES.includes(role);

    const [activeTab, setActiveTab] = useState("requests");

    const [equipment, setEquipment] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [requests, setRequests] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);
    const [downtimeList, setDowntimeList] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getHeaders = () => ({
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    });

    // =========================================================
    // INITIAL DATA LOAD
    // =========================================================

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                equipmentResponse,
                techResponse,
                requestsResponse,
                workOrdersResponse,
                downtimeResponse
            ] = await Promise.all([
                fetch(`${API_BASE_URL}/equipment`, { headers: getHeaders() }),
                fetch(`${API_BASE_URL}/users/technicians`, { headers: getHeaders() }),
                fetch(`${API_BASE_URL}/maintenance-requests`, { headers: getHeaders() }),
                fetch(`${API_BASE_URL}/work-orders`, { headers: getHeaders() }),
                fetch(`${API_BASE_URL}/equipment-downtime`, { headers: getHeaders() })
            ]);

            if (!equipmentResponse.ok) {
                throw new Error(`Equipment request failed: ${equipmentResponse.status}`);
            }
            setEquipment(await equipmentResponse.json());

            // These four are all part of the Maintenance Module - if a
            // role can't see one of them (403), don't let it break the
            // rest of the page; that section just renders empty.
            setTechnicians(techResponse.ok ? await techResponse.json() : []);
            setRequests(requestsResponse.ok ? await requestsResponse.json() : []);
            setWorkOrders(workOrdersResponse.ok ? await workOrdersResponse.json() : []);
            setDowntimeList(downtimeResponse.ok ? await downtimeResponse.json() : []);

        } catch (err) {
            console.error("Maintenance page error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // =========================================================
    // SHARED HELPERS
    // =========================================================

    const getEquipmentLabel = (item) => item.equipmentName || item.name || "Unnamed Equipment";

    const getStatusClass = (status) => {
        if (!status) return "status-default";
        const value = status.toLowerCase();
        if (value.includes("reject") || value.includes("cancel")) return "status-cancelled";
        if (value.includes("complet") || value.includes("approv") || value.includes("resolved")) return "status-completed";
        if (value.includes("progress") || value.includes("ongoing")) return "status-progress";
        if (value.includes("pending") || value.includes("open") || value.includes("scheduled")) return "status-scheduled";
        return "status-default";
    };

    const formatDateTime = (value) => {
        if (!value) return "—";
        return value.replace("T", " ").slice(0, 16);
    };

    const formatDuration = (minutes) => {
        if (minutes === null || minutes === undefined) return "Ongoing";
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hrs === 0) return `${mins}m`;
        return `${hrs}h ${mins}m`;
    };

    // =========================================================
    // MAINTENANCE REQUEST SECTION
    // =========================================================

    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestForm, setRequestForm] = useState({
        equipmentId: "",
        priority: "Medium",
        description: ""
    });

    const resetRequestForm = () => {
        setRequestForm({ equipmentId: "", priority: "Medium", description: "" });
    };

    const handleRequestFormChange = (e) => {
        setRequestForm({ ...requestForm, [e.target.name]: e.target.value });
    };

    const handleCreateRequest = async (e) => {
        e.preventDefault();

        if (!requestForm.equipmentId || !requestForm.description) {
            alert("Please select equipment and describe the issue.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/maintenance-requests`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    equipment: { equipmentId: Number(requestForm.equipmentId) },
                    priority: requestForm.priority,
                    description: requestForm.description
                })
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Failed to submit maintenance request");
            }

            resetRequestForm();
            setShowRequestForm(false);
            await fetchData();

        } catch (err) {
            console.error("Create request error:", err);
            alert(`Failed to submit request: ${err.message}`);
        }
    };

    // The backend's updateRequest() overwrites every field on the
    // entity from the request body (not a partial merge), so every
    // PUT here must resend the full current shape - including the
    // relations - rebuilt from the DTO's flattened ids, or
    // equipment/requestedBy would be wiped out to null.
    const reviewRequest = async (request, newStatus, remarksOverride) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/maintenance-requests/${request.requestId}`,
                {
                    method: "PUT",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        equipment: { equipmentId: request.equipmentId },
                        requestedBy: { userId: request.requestedByUserId },
                        requestDate: request.requestDate,
                        description: request.description,
                        priority: request.priority,
                        requestStatus: newStatus,
                        remarks: remarksOverride !== undefined ? remarksOverride : request.remarks
                    })
                }
            );

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || `Failed to set request to ${newStatus}`);
            }

            await fetchData();

        } catch (err) {
            console.error("Review request error:", err);
            alert(`Failed to update request: ${err.message}`);
        }
    };

    const handleApproveRequest = (request) => reviewRequest(request, "APPROVED");

    const handleRejectRequest = (request) => {
        const remark = window.prompt("Reason for rejection (optional):", request.remarks || "");
        if (remark === null) return; // cancelled
        reviewRequest(request, "REJECTED", remark);
    };

    const convertToWorkOrder = async (request) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/work-orders/from-request/${request.requestId}`,
                {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify({ priority: request.priority })
                }
            );

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Failed to create work order");
            }

            await fetchData();
            setActiveTab("workorders");

        } catch (err) {
            console.error("Convert to work order error:", err);
            alert(`Failed to create work order: ${err.message}`);
        }
    };

    // =========================================================
    // WORK ORDER SECTION
    // =========================================================

    const [showWorkOrderForm, setShowWorkOrderForm] = useState(false);
    const [workOrderForm, setWorkOrderForm] = useState({
        equipmentId: "",
        description: "",
        priority: "Medium",
        scheduledDate: ""
    });

    const [editingWorkOrderId, setEditingWorkOrderId] = useState(null);
    const [editWorkOrderForm, setEditWorkOrderForm] = useState({
        priority: "Medium",
        scheduledDate: "",
        completionDate: "",
        notes: ""
    });

    const resetWorkOrderForm = () => {
        setWorkOrderForm({ equipmentId: "", description: "", priority: "Medium", scheduledDate: "" });
    };

    const handleWorkOrderFormChange = (e) => {
        setWorkOrderForm({ ...workOrderForm, [e.target.name]: e.target.value });
    };

    const handleCreateWorkOrder = async (e) => {
        e.preventDefault();

        if (!workOrderForm.equipmentId || !workOrderForm.description) {
            alert("Please select equipment and describe the work needed.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/work-orders`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    equipment: { equipmentId: Number(workOrderForm.equipmentId) },
                    description: workOrderForm.description,
                    priority: workOrderForm.priority,
                    scheduledDate: workOrderForm.scheduledDate || null
                })
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Failed to create work order");
            }

            resetWorkOrderForm();
            setShowWorkOrderForm(false);
            await fetchData();

        } catch (err) {
            console.error("Create work order error:", err);
            alert(`Failed to create work order: ${err.message}`);
        }
    };

    // updateWorkOrder() on the backend merges only the fields that are
    // present (non-null) on the body, so partial payloads are safe here.
    const updateWorkOrder = async (workOrder, changes) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/work-orders/${workOrder.workOrderId}`,
                {
                    method: "PUT",
                    headers: getHeaders(),
                    body: JSON.stringify(changes)
                }
            );

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Failed to update work order");
            }

            await fetchData();

        } catch (err) {
            console.error("Update work order error:", err);
            alert(`Failed to update work order: ${err.message}`);
        }
    };

    const handleAssignTechnician = (workOrder, technicianId) => {
        if (!technicianId) return; // backend ignores an unset assignedTo - nothing to do
        updateWorkOrder(workOrder, { assignedTo: { userId: Number(technicianId) } });
    };

    const handleWorkOrderStatusChange = (workOrder, status) => {
        updateWorkOrder(workOrder, { workOrderStatus: status });
    };

    const openEditWorkOrder = (wo) => {
        setEditWorkOrderForm({
            priority: wo.priority || "Medium",
            scheduledDate: wo.startDate || "",
            completionDate: wo.completionDate || "",
            notes: wo.notes || ""
        });
        setEditingWorkOrderId(wo.workOrderId);
    };

    const handleEditWorkOrderChange = (e) => {
        setEditWorkOrderForm({ ...editWorkOrderForm, [e.target.name]: e.target.value });
    };

    const saveWorkOrderEdit = async (wo) => {
        await updateWorkOrder(wo, {
            priority: editWorkOrderForm.priority,
            scheduledDate: editWorkOrderForm.scheduledDate || null,
            completionDate: editWorkOrderForm.completionDate || null,
            notes: editWorkOrderForm.notes || null
        });
        setEditingWorkOrderId(null);
    };

    const openServiceLogFor = (workOrder) => {
        setActiveTab("servicelogs");
        setSelectedWorkOrderId(workOrder.workOrderId);
        loadLogsForWorkOrder(workOrder.workOrderId);
    };

    // =========================================================
    // MAINTENANCE SERVICE LOG SECTION
    // =========================================================

    const [selectedWorkOrderId, setSelectedWorkOrderId] = useState("");
    const [logsForWorkOrder, setLogsForWorkOrder] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const [selectedEquipmentForHistory, setSelectedEquipmentForHistory] = useState("");
    const [equipmentHistory, setEquipmentHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const [logForm, setLogForm] = useState({
        serviceDescription: "",
        partsReplaced: "",
        serviceCost: "",
        remarks: ""
    });

    const loadLogsForWorkOrder = async (workOrderId) => {
        if (!workOrderId) {
            setLogsForWorkOrder([]);
            return;
        }
        try {
            setLoadingLogs(true);
            const response = await fetch(
                `${API_BASE_URL}/service-logs/work-order/${workOrderId}`,
                { headers: getHeaders() }
            );
            if (!response.ok) throw new Error("Failed to load service logs");
            setLogsForWorkOrder(await response.json());
        } catch (err) {
            console.error("Load service logs error:", err);
            alert(`Failed to load service logs: ${err.message}`);
        } finally {
            setLoadingLogs(false);
        }
    };

    const handleSelectWorkOrderForLogs = (e) => {
        const id = e.target.value;
        setSelectedWorkOrderId(id);
        loadLogsForWorkOrder(id);
    };

    const loadHistoryForEquipment = async (equipmentId) => {
        if (!equipmentId) {
            setEquipmentHistory([]);
            return;
        }
        try {
            setLoadingHistory(true);
            const response = await fetch(
                `${API_BASE_URL}/service-logs/equipment/${equipmentId}`,
                { headers: getHeaders() }
            );
            if (!response.ok) throw new Error("Failed to load equipment history");
            setEquipmentHistory(await response.json());
        } catch (err) {
            console.error("Load equipment history error:", err);
            alert(`Failed to load equipment history: ${err.message}`);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSelectEquipmentForHistory = (e) => {
        const id = e.target.value;
        setSelectedEquipmentForHistory(id);
        loadHistoryForEquipment(id);
    };

    const handleLogFormChange = (e) => {
        setLogForm({ ...logForm, [e.target.name]: e.target.value });
    };

    const handleAddServiceLog = async (e) => {
        e.preventDefault();

        if (!selectedWorkOrderId) {
            alert("Please select a work order first.");
            return;
        }
        if (!logForm.serviceDescription) {
            alert("Please describe the work performed.");
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/service-logs/work-order/${selectedWorkOrderId}`,
                {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        serviceDescription: logForm.serviceDescription,
                        partsReplaced: logForm.partsReplaced || null,
                        serviceCost: logForm.serviceCost ? Number(logForm.serviceCost) : null,
                        remarks: logForm.remarks || null
                    })
                }
            );

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Failed to add service log");
            }

            setLogForm({ serviceDescription: "", partsReplaced: "", serviceCost: "", remarks: "" });
            await loadLogsForWorkOrder(selectedWorkOrderId);

        } catch (err) {
            console.error("Add service log error:", err);
            alert(`Failed to add service log: ${err.message}`);
        }
    };

    // =========================================================
    // EQUIPMENT DOWNTIME SECTION
    // =========================================================

    const [downtimeFilterEquipmentId, setDowntimeFilterEquipmentId] = useState("");
    const [showDowntimeForm, setShowDowntimeForm] = useState(false);
    const [downtimeForm, setDowntimeForm] = useState({
        equipmentId: "",
        reason: "",
        startDate: "",
        endDate: ""
    });

    const loadDowntime = async (equipmentId) => {
        try {
            const url = equipmentId
                ? `${API_BASE_URL}/equipment-downtime/equipment/${equipmentId}`
                : `${API_BASE_URL}/equipment-downtime`;
            const response = await fetch(url, { headers: getHeaders() });
            if (!response.ok) throw new Error("Failed to load downtime records");
            setDowntimeList(await response.json());
        } catch (err) {
            console.error("Load downtime error:", err);
            alert(`Failed to load downtime records: ${err.message}`);
        }
    };

    const handleDowntimeFilterChange = (e) => {
        const id = e.target.value;
        setDowntimeFilterEquipmentId(id);
        loadDowntime(id);
    };

    const handleDowntimeFormChange = (e) => {
        setDowntimeForm({ ...downtimeForm, [e.target.name]: e.target.value });
    };

    const handleLogDowntime = async (e) => {
        e.preventDefault();

        if (!downtimeForm.equipmentId || !downtimeForm.reason) {
            alert("Please select equipment and provide a reason.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/equipment-downtime`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    equipment: { equipmentId: Number(downtimeForm.equipmentId) },
                    reason: downtimeForm.reason,
                    startDate: downtimeForm.startDate || null,
                    endDate: downtimeForm.endDate || null
                })
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Failed to log downtime");
            }

            setDowntimeForm({ equipmentId: "", reason: "", startDate: "", endDate: "" });
            setShowDowntimeForm(false);
            await loadDowntime(downtimeFilterEquipmentId);

        } catch (err) {
            console.error("Log downtime error:", err);
            alert(`Failed to log downtime: ${err.message}`);
        }
    };

    const handleResolveDowntime = async (downtime) => {
        if (!window.confirm(`Mark downtime for "${downtime.equipmentName}" as resolved?`)) {
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/equipment-downtime/${downtime.downtimeId}/resolve`,
                { method: "PUT", headers: getHeaders() }
            );

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Failed to resolve downtime");
            }

            await loadDowntime(downtimeFilterEquipmentId);

        } catch (err) {
            console.error("Resolve downtime error:", err);
            alert(`Failed to resolve downtime: ${err.message}`);
        }
    };

    // =========================================================
    // RENDER
    // =========================================================

    if (loading) {
        return (
            <div className="maintenance-page">
                <div className="maintenance-loading">
                    Loading maintenance data...
                </div>
            </div>
        );
    }

    const pendingRequestCount = requests.filter(
        (r) => (r.requestStatus || "").toUpperCase() === "PENDING"
    ).length;

    const ongoingDowntimeCount = downtimeList.filter(
        (d) => (d.downtimeStatus || "").toUpperCase() === "ONGOING"
    ).length;

    return (
        <div className="maintenance-page">

            <div className="maintenance-header">
                <div>
                    <h1>Maintenance</h1>
                    <p>Requests, work orders, service history and equipment downtime</p>
                </div>
            </div>

            {error && <div className="maintenance-error">{error}</div>}

            <div className="maintenance-tabs">
                <button
                    className={`maintenance-tab ${activeTab === "requests" ? "active" : ""}`}
                    onClick={() => setActiveTab("requests")}
                >
                    Maintenance Request ({pendingRequestCount})
                </button>
                <button
                    className={`maintenance-tab ${activeTab === "workorders" ? "active" : ""}`}
                    onClick={() => setActiveTab("workorders")}
                >
                    Work Order ({workOrders.length})
                </button>
                <button
                    className={`maintenance-tab ${activeTab === "servicelogs" ? "active" : ""}`}
                    onClick={() => setActiveTab("servicelogs")}
                >
                    Maintenance Service Log
                </button>
                <button
                    className={`maintenance-tab ${activeTab === "downtime" ? "active" : ""}`}
                    onClick={() => setActiveTab("downtime")}
                >
                    Equipment Downtime ({ongoingDowntimeCount})
                </button>
            </div>

            {/* ================= MAINTENANCE REQUEST ================= */}
            {activeTab === "requests" && (
                <>
                    <div className="maintenance-header">
                        <div />
                        <button
                            className="add-maintenance-btn"
                            onClick={() => setShowRequestForm(!showRequestForm)}
                        >
                            {showRequestForm ? "Close" : "+ New Request"}
                        </button>
                    </div>

                    {showRequestForm && (
                        <div className="maintenance-form-card">
                            <h2>New Maintenance Request</h2>
                            <form onSubmit={handleCreateRequest}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Equipment</label>
                                        <select
                                            name="equipmentId"
                                            value={requestForm.equipmentId}
                                            onChange={handleRequestFormChange}
                                            required
                                        >
                                            <option value="">Select equipment</option>
                                            {equipment.map((item) => (
                                                <option key={item.equipmentId} value={item.equipmentId}>
                                                    {getEquipmentLabel(item)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Priority</label>
                                        <select
                                            name="priority"
                                            value={requestForm.priority}
                                            onChange={handleRequestFormChange}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                            <option value="Critical">Critical</option>
                                        </select>
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Issue Description</label>
                                        <textarea
                                            name="description"
                                            placeholder="Describe the issue..."
                                            value={requestForm.description}
                                            onChange={handleRequestFormChange}
                                            rows="3"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => { resetRequestForm(); setShowRequestForm(false); }}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="save-btn">
                                        Submit Request
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {requests.length === 0 ? (
                        <div className="empty-maintenance">
                            <div className="empty-icon">📋</div>
                            <h2>No Maintenance Requests</h2>
                            <p>Nobody has raised a maintenance request yet.</p>
                        </div>
                    ) : (
                        <div className="maintenance-grid">
                            {requests.map((request) => {
                                const statusValue = (request.requestStatus || "PENDING").toUpperCase();

                                return (
                                    <div className="maintenance-card" key={request.requestId}>
                                        <div className="maintenance-card-top">
                                            <div className="equipment-icon">📋</div>
                                            <span className={`maintenance-status ${getStatusClass(statusValue)}`}>
                                                {statusValue}
                                            </span>
                                        </div>

                                        <h2>{request.equipmentName || "Unknown Equipment"}</h2>

                                        <div className="maintenance-info">
                                            <div>
                                                <span>Requested By</span>
                                                <strong>{request.requestedByName || "—"}</strong>
                                            </div>
                                            <div>
                                                <span>Request Date</span>
                                                <strong>{request.requestDate || "—"}</strong>
                                            </div>
                                            <div>
                                                <span>Priority</span>
                                                <strong>{request.priority || "—"}</strong>
                                            </div>
                                        </div>

                                        {request.description && (
                                            <div className="maintenance-description">
                                                {request.description}
                                            </div>
                                        )}

                                        {request.remarks && (
                                            <div className="maintenance-description">
                                                <em>Remarks:</em> {request.remarks}
                                            </div>
                                        )}

                                        <div className="maintenance-card-actions">
                                            {statusValue === "PENDING" && canReviewRequests && (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="complete-maintenance-btn"
                                                        onClick={() => handleApproveRequest(request)}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="cancel-btn"
                                                        onClick={() => handleRejectRequest(request)}
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}

                                            {statusValue === "APPROVED" && canManageWorkOrders && (
                                                <button
                                                    type="button"
                                                    className="edit-maintenance-btn"
                                                    onClick={() => convertToWorkOrder(request)}
                                                >
                                                    Create Work Order
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* ================= WORK ORDER ================= */}
            {activeTab === "workorders" && (
                <>
                    <div className="maintenance-header">
                        <div />
                        {canManageWorkOrders && (
                            <button
                                className="add-maintenance-btn"
                                onClick={() => setShowWorkOrderForm(!showWorkOrderForm)}
                            >
                                {showWorkOrderForm ? "Close" : "+ New Work Order"}
                            </button>
                        )}
                    </div>

                    {showWorkOrderForm && (
                        <div className="maintenance-form-card">
                            <h2>New Work Order</h2>
                            <form onSubmit={handleCreateWorkOrder}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Equipment</label>
                                        <select
                                            name="equipmentId"
                                            value={workOrderForm.equipmentId}
                                            onChange={handleWorkOrderFormChange}
                                            required
                                        >
                                            <option value="">Select equipment</option>
                                            {equipment.map((item) => (
                                                <option key={item.equipmentId} value={item.equipmentId}>
                                                    {getEquipmentLabel(item)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Priority</label>
                                        <select
                                            name="priority"
                                            value={workOrderForm.priority}
                                            onChange={handleWorkOrderFormChange}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                            <option value="Critical">Critical</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Scheduled Date</label>
                                        <input
                                            type="date"
                                            name="scheduledDate"
                                            value={workOrderForm.scheduledDate}
                                            onChange={handleWorkOrderFormChange}
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            placeholder="What needs to be done..."
                                            value={workOrderForm.description}
                                            onChange={handleWorkOrderFormChange}
                                            rows="3"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => setShowWorkOrderForm(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="save-btn">
                                        Create Work Order
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {workOrders.length === 0 ? (
                        <div className="empty-maintenance">
                            <div className="empty-icon">🛠️</div>
                            <h2>No Work Orders</h2>
                            <p>Create one directly, or approve a request and convert it.</p>
                        </div>
                    ) : (
                        <div className="maintenance-grid">
                            {workOrders.map((wo) => (
                                <div className="maintenance-card" key={wo.workOrderId}>
                                    <div className="maintenance-card-top">
                                        <div className="equipment-icon">🛠️</div>
                                        <span className={`maintenance-status ${getStatusClass(wo.workOrderStatus)}`}>
                                            {wo.workOrderStatus || "OPEN"}
                                        </span>
                                    </div>

                                    <h2>{wo.equipmentName || "Unknown Equipment"}</h2>

                                    <div className="maintenance-info">
                                        <div>
                                            <span>Priority</span>
                                            <strong>{wo.priority || "—"}</strong>
                                        </div>
                                        <div>
                                            <span>Scheduled</span>
                                            <strong>{wo.startDate || "—"}</strong>
                                        </div>
                                        <div>
                                            <span>Completed</span>
                                            <strong>{wo.completionDate || "—"}</strong>
                                        </div>
                                        {wo.requestId && (
                                            <div>
                                                <span>From Request</span>
                                                <strong>#{wo.requestId}</strong>
                                            </div>
                                        )}
                                    </div>

                                    {wo.description && (
                                        <div className="maintenance-description">{wo.description}</div>
                                    )}

                                    {wo.notes && (
                                        <div className="maintenance-description">
                                            <em>Notes:</em> {wo.notes}
                                        </div>
                                    )}

                                    {canManageWorkOrders && (
                                        <>
                                            <div className="form-group">
                                                <label>Assigned Technician</label>
                                                <select
                                                    value={wo.assignedTechnicianId || ""}
                                                    onChange={(e) => handleAssignTechnician(wo, e.target.value)}
                                                >
                                                    <option value="">
                                                        {wo.assignedTechnicianName || "Unassigned"}
                                                    </option>
                                                    {technicians
                                                        .filter((tech) => tech.userId !== wo.assignedTechnicianId)
                                                        .map((tech) => (
                                                            <option key={tech.userId} value={tech.userId}>
                                                                {tech.fullName}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>Status</label>
                                                <select
                                                    value={wo.workOrderStatus || "OPEN"}
                                                    onChange={(e) => handleWorkOrderStatusChange(wo, e.target.value)}
                                                >
                                                    <option value="OPEN">Open</option>
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="COMPLETED">Completed</option>
                                                    <option value="CANCELLED">Cancelled</option>
                                                </select>
                                            </div>
                                        </>
                                    )}

                                    {editingWorkOrderId === wo.workOrderId && (
                                        <div className="maintenance-form-card" style={{ boxShadow: "none", padding: "14px 0 0 0" }}>
                                            <div className="form-grid">
                                                <div className="form-group">
                                                    <label>Priority</label>
                                                    <select
                                                        name="priority"
                                                        value={editWorkOrderForm.priority}
                                                        onChange={handleEditWorkOrderChange}
                                                    >
                                                        <option value="Low">Low</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="High">High</option>
                                                        <option value="Critical">Critical</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Scheduled Date</label>
                                                    <input
                                                        type="date"
                                                        name="scheduledDate"
                                                        value={editWorkOrderForm.scheduledDate}
                                                        onChange={handleEditWorkOrderChange}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Completion Date</label>
                                                    <input
                                                        type="date"
                                                        name="completionDate"
                                                        value={editWorkOrderForm.completionDate}
                                                        onChange={handleEditWorkOrderChange}
                                                    />
                                                </div>
                                                <div className="form-group full-width">
                                                    <label>Notes</label>
                                                    <textarea
                                                        name="notes"
                                                        value={editWorkOrderForm.notes}
                                                        onChange={handleEditWorkOrderChange}
                                                        rows="2"
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-actions">
                                                <button
                                                    type="button"
                                                    className="cancel-btn"
                                                    onClick={() => setEditingWorkOrderId(null)}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    className="save-btn"
                                                    onClick={() => saveWorkOrderEdit(wo)}
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="maintenance-card-actions">
                                        {canManageWorkOrders && editingWorkOrderId !== wo.workOrderId && (
                                            <button
                                                type="button"
                                                className="edit-maintenance-btn"
                                                onClick={() => openEditWorkOrder(wo)}
                                            >
                                                Edit
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="edit-maintenance-btn"
                                            onClick={() => openServiceLogFor(wo)}
                                        >
                                            Service Log
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ================= MAINTENANCE SERVICE LOG ================= */}
            {activeTab === "servicelogs" && (
                <>
                    <div className="maintenance-form-card">
                        <h2>Log by Work Order</h2>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Work Order</label>
                                <select value={selectedWorkOrderId} onChange={handleSelectWorkOrderForLogs}>
                                    <option value="">Select a work order</option>
                                    {workOrders.map((wo) => (
                                        <option key={wo.workOrderId} value={wo.workOrderId}>
                                            #{wo.workOrderId} — {wo.equipmentName || "Unknown Equipment"} ({wo.workOrderStatus || "OPEN"})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedWorkOrderId && (
                            <>
                                <div className="service-log-panel">
                                    {loadingLogs ? (
                                        <p className="service-log-empty">Loading service log...</p>
                                    ) : logsForWorkOrder.length === 0 ? (
                                        <p className="service-log-empty">No service log entries yet for this work order.</p>
                                    ) : (
                                        <ul className="service-log-list">
                                            {logsForWorkOrder.map((log) => (
                                                <li key={log.serviceLogId}>
                                                    <strong>{log.serviceDate}</strong> — {log.serviceDescription}
                                                    {log.partsReplaced && <> · Parts: {log.partsReplaced}</>}
                                                    {log.serviceCost != null && <> · Cost: {log.serviceCost}</>}
                                                    {log.technicianName && <> · by {log.technicianName}</>}
                                                    {log.remarks && <> · {log.remarks}</>}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {canAddServiceLog && (
                                        <form className="service-log-form" onSubmit={handleAddServiceLog}>
                                            <input
                                                type="text"
                                                name="serviceDescription"
                                                placeholder="Work performed..."
                                                value={logForm.serviceDescription}
                                                onChange={handleLogFormChange}
                                                required
                                            />
                                            <input
                                                type="text"
                                                name="partsReplaced"
                                                placeholder="Parts replaced (optional)"
                                                value={logForm.partsReplaced}
                                                onChange={handleLogFormChange}
                                            />
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="serviceCost"
                                                placeholder="Cost (optional)"
                                                value={logForm.serviceCost}
                                                onChange={handleLogFormChange}
                                            />
                                            <input
                                                type="text"
                                                name="remarks"
                                                placeholder="Remarks (optional)"
                                                value={logForm.remarks}
                                                onChange={handleLogFormChange}
                                            />
                                            <button type="submit" className="save-btn">Add Entry</button>
                                        </form>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="maintenance-form-card">
                        <h2>Full History by Equipment</h2>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Equipment</label>
                                <select value={selectedEquipmentForHistory} onChange={handleSelectEquipmentForHistory}>
                                    <option value="">Select equipment</option>
                                    {equipment.map((item) => (
                                        <option key={item.equipmentId} value={item.equipmentId}>
                                            {getEquipmentLabel(item)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedEquipmentForHistory && (
                            <div className="service-log-panel">
                                {loadingHistory ? (
                                    <p className="service-log-empty">Loading history...</p>
                                ) : equipmentHistory.length === 0 ? (
                                    <p className="service-log-empty">No service history recorded for this equipment.</p>
                                ) : (
                                    <ul className="service-log-list">
                                        {equipmentHistory.map((log) => (
                                            <li key={log.serviceLogId}>
                                                <strong>{log.serviceDate}</strong> — {log.serviceDescription}
                                                {" "}(Work Order #{log.workOrderId})
                                                {log.partsReplaced && <> · Parts: {log.partsReplaced}</>}
                                                {log.serviceCost != null && <> · Cost: {log.serviceCost}</>}
                                                {log.technicianName && <> · by {log.technicianName}</>}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ================= EQUIPMENT DOWNTIME ================= */}
            {activeTab === "downtime" && (
                <>
                    <div className="maintenance-header">
                        <div className="form-group" style={{ minWidth: "260px" }}>
                            <label>Filter by Equipment</label>
                            <select value={downtimeFilterEquipmentId} onChange={handleDowntimeFilterChange}>
                                <option value="">All equipment</option>
                                {equipment.map((item) => (
                                    <option key={item.equipmentId} value={item.equipmentId}>
                                        {getEquipmentLabel(item)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {canManageDowntime && (
                            <button
                                className="add-maintenance-btn"
                                onClick={() => setShowDowntimeForm(!showDowntimeForm)}
                            >
                                {showDowntimeForm ? "Close" : "+ Log Downtime"}
                            </button>
                        )}
                    </div>

                    {showDowntimeForm && (
                        <div className="maintenance-form-card">
                            <h2>Log Equipment Downtime</h2>
                            <form onSubmit={handleLogDowntime}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Equipment</label>
                                        <select
                                            name="equipmentId"
                                            value={downtimeForm.equipmentId}
                                            onChange={handleDowntimeFormChange}
                                            required
                                        >
                                            <option value="">Select equipment</option>
                                            {equipment.map((item) => (
                                                <option key={item.equipmentId} value={item.equipmentId}>
                                                    {getEquipmentLabel(item)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Reason</label>
                                        <textarea
                                            name="reason"
                                            placeholder="Why is this equipment down..."
                                            value={downtimeForm.reason}
                                            onChange={handleDowntimeFormChange}
                                            rows="2"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Start (optional — defaults to now)</label>
                                        <input
                                            type="datetime-local"
                                            name="startDate"
                                            value={downtimeForm.startDate}
                                            onChange={handleDowntimeFormChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>End (optional — leave blank if ongoing)</label>
                                        <input
                                            type="datetime-local"
                                            name="endDate"
                                            value={downtimeForm.endDate}
                                            onChange={handleDowntimeFormChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => setShowDowntimeForm(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="save-btn">
                                        Log Downtime
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {downtimeList.length === 0 ? (
                        <div className="empty-maintenance">
                            <div className="empty-icon">⏱️</div>
                            <h2>No Downtime Records</h2>
                            <p>Downtime opens automatically when a work order is raised, or log it manually.</p>
                        </div>
                    ) : (
                        <div className="maintenance-grid">
                            {downtimeList.map((d) => {
                                const status = (d.downtimeStatus || "").toUpperCase();
                                return (
                                    <div className="maintenance-card" key={d.downtimeId}>
                                        <div className="maintenance-card-top">
                                            <div className="equipment-icon">⏱️</div>
                                            <span className={`maintenance-status ${getStatusClass(status)}`}>
                                                {status || "—"}
                                            </span>
                                        </div>

                                        <h2>{d.equipmentName || "Unknown Equipment"}</h2>

                                        <div className="maintenance-info">
                                            <div>
                                                <span>Start</span>
                                                <strong>{formatDateTime(d.startDate)}</strong>
                                            </div>
                                            <div>
                                                <span>End</span>
                                                <strong>{formatDateTime(d.endDate)}</strong>
                                            </div>
                                            <div>
                                                <span>Duration</span>
                                                <strong>{formatDuration(d.durationMinutes)}</strong>
                                            </div>
                                            {d.workOrderId && (
                                                <div>
                                                    <span>Work Order</span>
                                                    <strong>#{d.workOrderId}</strong>
                                                </div>
                                            )}
                                        </div>

                                        {d.reason && (
                                            <div className="maintenance-description">{d.reason}</div>
                                        )}

                                        {status === "ONGOING" && canManageDowntime && (
                                            <div className="maintenance-card-actions">
                                                <button
                                                    type="button"
                                                    className="complete-maintenance-btn"
                                                    onClick={() => handleResolveDowntime(d)}
                                                >
                                                    Resolve
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Maintenance;
