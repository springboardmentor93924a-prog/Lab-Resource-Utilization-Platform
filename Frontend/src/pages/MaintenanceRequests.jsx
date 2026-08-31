
import React, { useEffect, useState } from "react";
import {
    getAllMaintenanceRequests,
    updateMaintenanceRequestStatus,
    createMaintenanceRequest
} from "../services/maintenanceApi";

// __define-ocg__

const MaintenanceRequests = () => {

    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");

    const [selectedRequest, setSelectedRequest] = useState(null);

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const varOcg = "maintenance-requests";

    const [showCreateModal, setShowCreateModal] = useState(false);

const [createForm, setCreateForm] = useState({
    equipmentId: "",
    description: "",
    priority: "MEDIUM",
    notes: ""
});

const [creating, setCreating] = useState(false);
    // =========================================================
    // LOAD REQUESTS
    // =========================================================

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await getAllMaintenanceRequests();

            let data = [];

            if (Array.isArray(response)) {

                data = response;

            } else if (
                response &&
                Array.isArray(response.data)
            ) {

                data = response.data;

            } else if (
                response &&
                Array.isArray(response.content)
            ) {

                data = response.content;
            }

            setRequests(data);

        } catch (err) {

            console.error(
                "Failed to load maintenance requests:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.response?.data ||
                "Unable to load maintenance requests."
            );

        } finally {

            setLoading(false);
        }
    };

    // =========================================================
    // FILTER REQUESTS
    // =========================================================

    useEffect(() => {

        let result = [...requests];

        const searchText =
            search.trim().toLowerCase();

        if (searchText) {

            result = result.filter(request => {

                const equipmentName =
                    request?.equipment?.name ||
                    request?.equipmentName ||
                    "";

                const description =
                    request?.description || "";

                const id =
                    String(request?.id || "");

                return (
                    equipmentName
                        .toLowerCase()
                        .includes(searchText) ||

                    description
                        .toLowerCase()
                        .includes(searchText) ||

                    id.includes(searchText)
                );
            });
        }

        if (statusFilter !== "ALL") {

            result = result.filter(
                request =>
                    getStatus(request) ===
                    statusFilter
            );
        }

        if (priorityFilter !== "ALL") {

            result = result.filter(
                request =>
                    getPriority(request) ===
                    priorityFilter
            );
        }

        setFilteredRequests(result);

    }, [
        requests,
        search,
        statusFilter,
        priorityFilter
    ]);

    // =========================================================
    // HELPERS
    // =========================================================

    const getStatus = (request) =>
        String(
            request?.status || ""
        ).toUpperCase();

    const getPriority = (request) =>
        String(
            request?.priority || ""
        ).toUpperCase();

    const getEquipmentName = (request) =>
        request?.equipment?.name ||
        request?.equipmentName ||
        `Equipment #${
            request?.equipment?.id ||
            request?.equipmentId ||
            "-"
        }`;

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    const handleStatusUpdate = async (
        requestId,
        newStatus
    ) => {

        try {

            setUpdating(true);
            setError("");
            setSuccess("");

            await updateMaintenanceRequestStatus(
                requestId,
                newStatus
            );

            setSuccess(
                `Maintenance request #${requestId} updated successfully.`
            );

            setSelectedRequest(null);

            await loadRequests();

        } catch (err) {

            console.error(
                "Failed to update request status:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.response?.data ||
                "Unable to update maintenance request status."
            );

        } finally {

            setUpdating(false);
        }
    };


    const handleCreateRequest = async (e) => {

    e.preventDefault();

    try {

        setCreating(true);
        setError("");
        setSuccess("");

        if (!createForm.equipmentId) {
            setError("Please enter an equipment ID.");
            return;
        }

        if (!createForm.description.trim()) {
            setError("Please enter a maintenance description.");
            return;
        }

        await createMaintenanceRequest({
            equipmentId: Number(createForm.equipmentId),
            description: createForm.description.trim(),
            priority: createForm.priority,
            notes: createForm.notes.trim()
        });

        setSuccess(
            "Maintenance request created successfully."
        );

        setCreateForm({
            equipmentId: "",
            description: "",
            priority: "MEDIUM",
            notes: ""
        });

        setShowCreateModal(false);

        await loadRequests();

    } catch (err) {

        console.error(
            "Failed to create maintenance request:",
            err
        );

        console.log("HTTP Status:", err?.response?.status);
        console.log("Backend Error:", err?.response?.data);
        console.log("Request URL:", err?.config?.url);
        console.log("Request Params:", err?.config?.params);
    
        const backendError =
        typeof err?.response?.data === "string"
            ? err.response.data
            : err?.response?.data?.message ||
              err?.response?.data?.error ||
              "Unable to create maintenance request.";

        setError(backendError);

        // setError(
        //     err?.response?.data?.message ||
        //     err?.response?.data ||
        //     "Unable to create maintenance request."
        // );

    } finally {

        setCreating(false);
    }
};

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (
            <div className="maintenance-requests-page">

                <div className="loading-box">
                    Loading maintenance requests...
                </div>

            </div>
        );
    }

    return (
        <div
            className="maintenance-requests-page"
            data-page={varOcg}
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="page-header">

                <div>

                    <h1>
                        Maintenance Requests
                    </h1>

                    <p>
                        Manage maintenance requests
                        submitted for laboratory equipment.
                    </p>

                </div>

                <div className="header-actions">

    <button
        className="create-btn"
        onClick={() => {
            setError("");
            setSuccess("");
            setShowCreateModal(true);
        }}
    >
        + Create Maintenance Request
    </button>

    <button
        className="refresh-btn"
        onClick={loadRequests}
        disabled={loading}
    >
        ↻ Refresh
    </button>

</div>

            </div>

            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (

                <div className="success-message">

                    {success}

                    <button
                        onClick={() =>
                            setSuccess("")
                        }
                    >
                        ×
                    </button>

                </div>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="error-message">

                    {error}

                    <button
                        onClick={() =>
                            setError("")
                        }
                    >
                        ×
                    </button>

                </div>
            )}

            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="filter-panel">

                <div className="search-box">

                    <label>
                        Search
                    </label>

                    <input
                        type="text"
                        placeholder="Search by ID, equipment or description..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>

                <div className="filter-box">

                    <label>
                        Status
                    </label>

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                    >

                        <option value="ALL">
                            All Statuses
                        </option>

                        <option value="PENDING">
                            Pending
                        </option>

                        <option value="APPROVED">
                            Approved
                        </option>

                        <option value="IN_PROGRESS">
                            In Progress
                        </option>

                        <option value="COMPLETED">
                            Completed
                        </option>

                        <option value="CANCELLED">
                            Cancelled
                        </option>

                        <option value="REJECTED">
                            Rejected
                        </option>

                    </select>

                </div>

                <div className="filter-box">

                    <label>
                        Priority
                    </label>

                    <select
                        value={priorityFilter}
                        onChange={(e) =>
                            setPriorityFilter(
                                e.target.value
                            )
                        }
                    >

                        <option value="ALL">
                            All Priorities
                        </option>

                        <option value="LOW">
                            Low
                        </option>

                        <option value="MEDIUM">
                            Medium
                        </option>

                        <option value="HIGH">
                            High
                        </option>

                        <option value="CRITICAL">
                            Critical
                        </option>

                    </select>

                </div>

                <div className="result-count">

                    <strong>
                        {filteredRequests.length}
                    </strong>

                    <span>
                        Requests
                    </span>

                </div>

            </div>

            {/* =================================================
                REQUEST TABLE
            ================================================= */}

            <div className="table-card">

                {filteredRequests.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            🔧
                        </div>

                        <h3>
                            No maintenance requests found
                        </h3>

                        <p>
                            Try changing the search or
                            filter criteria.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Equipment
                                    </th>

                                    <th>
                                        Description
                                    </th>

                                    <th>
                                        Priority
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Requested At
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredRequests.map(
                                    request => (

                                        <tr
                                            key={request.id}
                                        >

                                            <td>
                                                <strong>
                                                    #{request.id}
                                                </strong>
                                            </td>

                                            <td>
                                                <strong>
                                                    {getEquipmentName(
                                                        request
                                                    )}
                                                </strong>
                                            </td>

                                            <td className="description-cell">

                                                {request.description ||
                                                    "-"}

                                            </td>

                                            <td>

                                                <span
                                                    className={`badge priority-${getPriority(
                                                        request
                                                    ).toLowerCase()}`}
                                                >
                                                    {getPriority(
                                                        request
                                                    ) || "-"}
                                                </span>

                                            </td>

                                            <td>

                                                <span
                                                    className={`badge status-${getStatus(
                                                        request
                                                    ).toLowerCase()}`}
                                                >
                                                    {formatStatus(
                                                        getStatus(
                                                            request
                                                        )
                                                    )}
                                                </span>

                                            </td>

                                            <td>

                                                {request.requestedAt
                                                    ? new Date(
                                                        request.requestedAt
                                                    ).toLocaleString()
                                                    : "-"}

                                            </td>

                                            <td>

                                                <button
                                                    className="view-btn"
                                                    onClick={() =>
                                                        setSelectedRequest(
                                                            request
                                                        )
                                                    }
                                                >
                                                    View Details
                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {/* =================================================
                DETAILS MODAL
            ================================================= */}

            {selectedRequest && (

                <div
                    className="modal-overlay"
                    onClick={() =>
                        setSelectedRequest(null)
                    }
                >

                    <div
                        className="modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Maintenance Request #
                                    {selectedRequest.id}
                                </h2>

                                <p>
                                    Request details
                                </p>

                            </div>

                            <button
                                className="close-btn"
                                onClick={() =>
                                    setSelectedRequest(null)
                                }
                            >
                                ×
                            </button>

                        </div>

                        <div className="details-grid">

                            <div className="detail-item">

                                <span>
                                    Equipment
                                </span>

                                <strong>
                                    {getEquipmentName(
                                        selectedRequest
                                    )}
                                </strong>

                            </div>

                            <div className="detail-item">

                                <span>
                                    Priority
                                </span>

                                <strong>

                                    <span
                                        className={`badge priority-${getPriority(
                                            selectedRequest
                                        ).toLowerCase()}`}
                                    >
                                        {getPriority(
                                            selectedRequest
                                        )}
                                    </span>

                                </strong>

                            </div>

                            <div className="detail-item">

                                <span>
                                    Status
                                </span>

                                <strong>

                                    <span
                                        className={`badge status-${getStatus(
                                            selectedRequest
                                        ).toLowerCase()}`}
                                    >
                                        {formatStatus(
                                            getStatus(
                                                selectedRequest
                                            )
                                        )}
                                    </span>

                                </strong>

                            </div>

                            <div className="detail-item">

                                <span>
                                    Requested At
                                </span>

                                <strong>
                                    {selectedRequest.requestedAt
                                        ? new Date(
                                            selectedRequest.requestedAt
                                        ).toLocaleString()
                                        : "-"}
                                </strong>

                            </div>

                        </div>

                        <div className="detail-section">

                            <h3>
                                Description
                            </h3>

                            <p>
                                {selectedRequest.description ||
                                    "No description provided."}
                            </p>

                        </div>

                        <div className="detail-section">

                            <h3>
                                Notes
                            </h3>

                            <p>
                                {selectedRequest.notes ||
                                    "No additional notes."}
                            </p>

                        </div>

                        {/* =================================================
                            STATUS ACTIONS
                        ================================================= */}

                        <div className="status-actions">

                            <h3>
                                Update Status
                            </h3>

                            <div className="status-buttons">

                                <button
                                    className="status-btn pending"
                                    disabled={
                                        updating ||
                                        getStatus(
                                            selectedRequest
                                        ) === "PENDING"
                                    }
                                    onClick={() =>
                                        handleStatusUpdate(
                                            selectedRequest.id,
                                            "PENDING"
                                        )
                                    }
                                >
                                    Pending
                                </button>

                                <button
                                    className="status-btn approved"
                                    disabled={
                                        updating ||
                                        getStatus(
                                            selectedRequest
                                        ) === "APPROVED"
                                    }
                                    onClick={() =>
                                        handleStatusUpdate(
                                            selectedRequest.id,
                                            "APPROVED"
                                        )
                                    }
                                >
                                    Approved
                                </button>

                                <button
                                    className="status-btn progress"
                                    disabled={
                                        updating ||
                                        getStatus(
                                            selectedRequest
                                        ) === "IN_PROGRESS"
                                    }
                                    onClick={() =>
                                        handleStatusUpdate(
                                            selectedRequest.id,
                                            "IN_PROGRESS"
                                        )
                                    }
                                >
                                    In Progress
                                </button>

                                <button
                                    className="status-btn complete"
                                    disabled={
                                        updating ||
                                        getStatus(
                                            selectedRequest
                                        ) === "COMPLETED"
                                    }
                                    onClick={() =>
                                        handleStatusUpdate(
                                            selectedRequest.id,
                                            "COMPLETED"
                                        )
                                    }
                                >
                                    Completed
                                </button>

                                <button
                                    className="status-btn cancel"
                                    disabled={
                                        updating ||
                                        getStatus(
                                            selectedRequest
                                        ) === "CANCELLED"
                                    }
                                    onClick={() =>
                                        handleStatusUpdate(
                                            selectedRequest.id,
                                            "CANCELLED"
                                        )
                                    }
                                >
                                    Cancelled
                                </button>

                            </div>

                        </div>

                    </div>

                </div>
            )}

            {/* =================================================
    CREATE MAINTENANCE REQUEST MODAL
================================================= */}

{showCreateModal && (

    <div
        className="modal-overlay"
        onClick={() => setShowCreateModal(false)}
    >

        <div
            className="modal create-modal"
            onClick={(e) => e.stopPropagation()}
        >

            <div className="modal-header">

                <div>

                    <h2>
                        Create Maintenance Request
                    </h2>

                    <p>
                        Submit a new maintenance request
                        for laboratory equipment.
                    </p>

                </div>

                <button
                    className="close-btn"
                    onClick={() =>
                        setShowCreateModal(false)
                    }
                >
                    ×
                </button>

            </div>

            <form onSubmit={handleCreateRequest}>

                {/* Equipment ID */}

                <div className="form-group">

                    <label>
                        Equipment ID
                        <span className="required">
                            *
                        </span>
                    </label>

                    <input
                        type="number"
                        min="1"
                        placeholder="Enter equipment ID"
                        value={createForm.equipmentId}
                        onChange={(e) =>
                            setCreateForm({
                                ...createForm,
                                equipmentId:
                                    e.target.value
                            })
                        }
                        required
                    />

                    <small>
                        Enter the ID of the equipment
                        requiring maintenance.
                    </small>

                </div>

                {/* Description */}

                <div className="form-group">

                    <label>
                        Description
                        <span className="required">
                            *
                        </span>
                    </label>

                    <textarea
                        rows="4"
                        placeholder="Describe the maintenance problem..."
                        value={createForm.description}
                        onChange={(e) =>
                            setCreateForm({
                                ...createForm,
                                description:
                                    e.target.value
                            })
                        }
                        required
                    />

                </div>

                {/* Priority */}

                <div className="form-group">

                    <label>
                        Priority
                        <span className="required">
                            *
                        </span>
                    </label>

                    <select
                        value={createForm.priority}
                        onChange={(e) =>
                            setCreateForm({
                                ...createForm,
                                priority:
                                    e.target.value
                            })
                        }
                    >

                        <option value="LOW">
                            Low
                        </option>

                        <option value="MEDIUM">
                            Medium
                        </option>

                        <option value="HIGH">
                            High
                        </option>

                        <option value="CRITICAL">
                            Critical
                        </option>

                    </select>

                </div>

                {/* Notes */}

                <div className="form-group">

                    <label>
                        Notes
                    </label>

                    <textarea
                        rows="3"
                        placeholder="Additional notes (optional)..."
                        value={createForm.notes}
                        onChange={(e) =>
                            setCreateForm({
                                ...createForm,
                                notes:
                                    e.target.value
                            })
                        }
                    />

                </div>

                {/* Buttons */}

                <div className="form-actions">

                    <button
                        type="button"
                        className="cancel-form-btn"
                        onClick={() =>
                            setShowCreateModal(false)
                        }
                        disabled={creating}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="submit-form-btn"
                        disabled={creating}
                    >

                        {creating
                            ? "Creating..."
                            : "Create Request"}

                    </button>

                </div>

            </form>

        </div>

    </div>

)}

            {/* =================================================
                STYLES
            ================================================= */}

            <style>{`

                .maintenance-requests-page {
                    padding: 24px;
                    max-width: 1500px;
                    margin: auto;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                }

                .page-header h1 {
                    margin: 0 0 6px;
                    font-size: 30px;
                }

                .page-header p {
                    margin: 0;
                    color: #666;
                }

                .refresh-btn {
                    border: none;
                    background: #2563eb;
                    color: white;
                    padding: 10px 18px;
                    border-radius: 7px;
                    cursor: pointer;
                    font-weight: 600;
                }

                .refresh-btn:hover {
                    background: #1d4ed8;
                }

                .filter-panel {
                    display: grid;
                    grid-template-columns:
                        minmax(300px, 2fr)
                        1fr
                        1fr
                        150px;
                    gap: 15px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    padding: 18px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                }

                .search-box,
                .filter-box {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .search-box label,
                .filter-box label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #555;
                }

                .search-box input,
                .filter-box select {
                    padding: 10px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 7px;
                    font-size: 14px;
                    outline: none;
                }

                .search-box input:focus,
                .filter-box select:focus {
                    border-color: #2563eb;
                }

                .result-count {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .result-count strong {
                    font-size: 25px;
                }

                .result-count span {
                    color: #666;
                    font-size: 13px;
                }

                .table-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    overflow: hidden;
                }

                .table-wrapper {
                    overflow-x: auto;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                th,
                td {
                    padding: 14px;
                    text-align: left;
                    border-bottom: 1px solid #eee;
                    white-space: nowrap;
                }

                th {
                    background: #f8fafc;
                    font-size: 13px;
                    color: #555;
                }

                td {
                    font-size: 14px;
                }

                .description-cell {
                    max-width: 300px;
                    white-space: normal;
                    line-height: 1.4;
                }

                .badge {
                    display: inline-block;
                    padding: 5px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                }

                .priority-low {
                    background: #dcfce7;
                    color: #166534;
                }

                .priority-medium {
                    background: #fef3c7;
                    color: #92400e;
                }

                .priority-high {
                    background: #fee2e2;
                    color: #991b1b;
                }

                .priority-critical {
                    background: #fecaca;
                    color: #7f1d1d;
                }

                .status-pending {
                    background: #fef3c7;
                    color: #92400e;
                }

                .status-approved {
                    background: #dbeafe;
                    color: #1e40af;
                }

                .status-in_progress {
                    background: #ede9fe;
                    color: #6d28d9;
                }

                .status-completed {
                    background: #dcfce7;
                    color: #166534;
                }

                .status-cancelled,
                .status-rejected {
                    background: #fee2e2;
                    color: #991b1b;
                }

                .view-btn {
                    border: none;
                    background: #eff6ff;
                    color: #2563eb;
                    padding: 7px 11px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                }

                .view-btn:hover {
                    background: #dbeafe;
                }

                .empty-state {
                    text-align: center;
                    padding: 70px 20px;
                    color: #666;
                }

                .empty-icon {
                    font-size: 45px;
                    margin-bottom: 10px;
                }

                .empty-state h3 {
                    margin: 0 0 8px;
                }

                .empty-state p {
                    margin: 0;
                }

                .loading-box {
                    padding: 80px;
                    text-align: center;
                    font-size: 18px;
                }

                .error-message,
                .success-message {
                    padding: 12px 15px;
                    border-radius: 8px;
                    margin-bottom: 18px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .error-message {
                    background: #fee2e2;
                    border: 1px solid #fecaca;
                    color: #991b1b;
                }

                .success-message {
                    background: #dcfce7;
                    border: 1px solid #bbf7d0;
                    color: #166534;
                }

                .error-message button,
                .success-message button {
                    border: none;
                    background: transparent;
                    font-size: 20px;
                    cursor: pointer;
                }

                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                    z-index: 1000;
                }

                .modal {
                    width: 100%;
                    max-width: 750px;
                    max-height: 90vh;
                    overflow-y: auto;
                    background: white;
                    border-radius: 14px;
                    padding: 25px;
                    box-shadow:
                        0 20px 50px
                        rgba(0, 0, 0, 0.25);
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 25px;
                }

                .modal-header h2 {
                    margin: 0 0 5px;
                }

                .modal-header p {
                    margin: 0;
                    color: #666;
                }

                .close-btn {
                    width: 35px;
                    height: 35px;
                    border: none;
                    border-radius: 50%;
                    background: #f3f4f6;
                    font-size: 24px;
                    cursor: pointer;
                }

                .details-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 18px;
                    margin-bottom: 25px;
                }

                .detail-item {
                    padding: 15px;
                    background: #f8fafc;
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 7px;
                }

                .detail-item span:first-child {
                    color: #666;
                    font-size: 13px;
                }

                .detail-section {
                    border-top: 1px solid #eee;
                    padding-top: 18px;
                    margin-top: 18px;
                }

                .detail-section h3,
                .status-actions h3 {
                    margin: 0 0 10px;
                }

                .detail-section p {
                    margin: 0;
                    line-height: 1.6;
                    color: #444;
                }

                .status-actions {
                    border-top: 1px solid #eee;
                    margin-top: 22px;
                    padding-top: 20px;
                }

                .status-buttons {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .status-btn {
                    border: none;
                    padding: 9px 14px;
                    border-radius: 7px;
                    cursor: pointer;
                    font-weight: 600;
                }

                .status-btn:disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                }

                .status-btn.pending {
                    background: #fef3c7;
                    color: #92400e;
                }

                .status-btn.approved {
                    background: #dbeafe;
                    color: #1e40af;
                }

                .status-btn.progress {
                    background: #ede9fe;
                    color: #6d28d9;
                }

                .status-btn.complete {
                    background: #dcfce7;
                    color: #166534;
                }

                .status-btn.cancel {
                    background: #fee2e2;
                    color: #991b1b;
                }

                @media (max-width: 1000px) {

                    .filter-panel {
                        grid-template-columns: 1fr 1fr;
                    }

                    .result-count {
                        min-height: 70px;
                    }
                }

                @media (max-width: 650px) {

                    .maintenance-requests-page {
                        padding: 15px;
                    }

                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 15px;
                    }

                    .filter-panel {
                        grid-template-columns: 1fr;
                    }

                    .details-grid {
                        grid-template-columns: 1fr;
                    }

                    .modal {
                        padding: 18px;
                    }
                }

                .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

.create-btn {
    border: none;
    background: #16a34a;
    color: white;
    padding: 10px 18px;
    border-radius: 7px;
    cursor: pointer;
    font-weight: 600;
}

.create-btn:hover {
    background: #15803d;
}

.create-modal {
    max-width: 650px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin-bottom: 18px;
}

.form-group label {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.required {
    color: #dc2626;
    margin-left: 4px;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    box-sizing: border-box;
    padding: 11px 12px;
    border: 1px solid #d1d5db;
    border-radius: 7px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
    border-color: #2563eb;
}

.form-group textarea {
    resize: vertical;
}

.form-group small {
    color: #6b7280;
    font-size: 12px;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 25px;
    padding-top: 18px;
    border-top: 1px solid #eee;
}

.cancel-form-btn,
.submit-form-btn {
    border: none;
    padding: 10px 18px;
    border-radius: 7px;
    cursor: pointer;
    font-weight: 600;
}

.cancel-form-btn {
    background: #f3f4f6;
    color: #374151;
}

.cancel-form-btn:hover {
    background: #e5e7eb;
}

.submit-form-btn {
    background: #2563eb;
    color: white;
}

.submit-form-btn:hover {
    background: #1d4ed8;
}

.submit-form-btn:disabled,
.cancel-form-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@media (max-width: 650px) {

    .header-actions {
        width: 100%;
        flex-direction: column;
        align-items: stretch;
    }

    .create-btn,
    .refresh-btn {
        width: 100%;
    }
}

            `}</style>

        </div>
    );
};

// =========================================================
// FORMAT STATUS
// =========================================================

const formatStatus = (status) => {

    if (!status) {
        return "-";
    }

    return status
        .toLowerCase()
        .split("_")
        .map(word =>
            word.charAt(0).toUpperCase() +
            word.slice(1)
        )
        .join(" ");
};

export default MaintenanceRequests;
