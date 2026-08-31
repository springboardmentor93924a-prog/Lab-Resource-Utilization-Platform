import React, { useEffect, useState } from "react";

import {
    getAllWorkOrders,
    getAllMaintenanceRequests,
    createWorkOrder,
    assignTechnician,
    startWorkOrder,
    completeWorkOrder,
    formatDowntime
} from "../services/maintenanceApi";

// __define-ocg__

const WorkOrders = () => {

    const [workOrders, setWorkOrders] = useState([]);
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);
    const [technicians, setTechnicians] = useState([]);

    const [loading, setLoading] = useState(true);
    const [technicianLoading, setTechnicianLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [completing, setCompleting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);

    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

    const [technicianId, setTechnicianId] = useState("");
    const [completionNotes, setCompletionNotes] = useState("");

    const [statusFilter, setStatusFilter] = useState("ALL");

    const varOcg = "work-order-management";

    // ============================================================
    // CREATE WORK ORDER FORM
    // ============================================================

    const [formData, setFormData] = useState({
        maintenanceRequestId: "",
        workDescription: "",
        scheduledStart: "",
        scheduledEnd: ""
    });

    // ============================================================
    // ERROR MESSAGE HELPER
    // ============================================================

    const getErrorMessage = (
        err,
        defaultMessage
    ) => {

        const responseData =
            err?.response?.data;

        if (
            typeof responseData ===
            "string"
        ) {
            return responseData;
        }

        if (
            responseData?.message
        ) {
            return responseData.message;
        }

        if (
            responseData?.error
        ) {
            return responseData.error;
        }

        return (
            err?.message ||
            defaultMessage
        );
    };

    // ============================================================
    // LOAD ALL DATA
    // ============================================================

    useEffect(() => {

        loadData();

    }, []);

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                workOrdersResponse,
                requestsResponse
            ] = await Promise.all([
                getAllWorkOrders(),
                getAllMaintenanceRequests()
            ]);

            const workOrderData =
                Array.isArray(workOrdersResponse)
                    ? workOrdersResponse
                    : workOrdersResponse?.data || [];

            const requestData =
                Array.isArray(requestsResponse)
                    ? requestsResponse
                    : requestsResponse?.data || [];

            setWorkOrders(workOrderData);
            setMaintenanceRequests(requestData);

            /*
             * Keep technicians already returned inside
             * work orders as a fallback.
             *
             * The actual technician list is loaded separately
             * from /api/admin/users/technicians.
             */

            const technicianMap =
                new Map();

            workOrderData.forEach(
                workOrder => {

                    const technician =
                        workOrder?.technician;

                    if (
                        technician?.id
                    ) {

                        technicianMap.set(
                            technician.id,
                            technician
                        );
                    }
                }
            );

            setTechnicians(
                Array.from(
                    technicianMap.values()
                )
            );

            /*
             * Load the complete technician list.
             */

            await loadTechnicians();

        } catch (err) {

            console.error(
                "Work order loading error:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to load work orders."
                )
            );

        } finally {

            setLoading(false);

        }
    };

    // ============================================================
    // LOAD TECHNICIANS
    // ============================================================

    const loadTechnicians = async () => {

        try {

            setTechnicianLoading(true);

            /*
             * Direct API call.
             *
             * This matches:
             *
             * GET /api/admin/users/technicians
             */

            const token =
                localStorage.getItem(
                    "token"
                );

            const response =
                await fetch(
                    "http://localhost:8080/api/admin/users/technicians",
                    {
                        method: "GET",

                        headers: {
                            "Content-Type":
                                "application/json",

                            ...(token
                                ? {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                                : {})
                        }
                    }
                );

            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    "Unable to load technicians."
                );
            }

            const data =
                await response.json();

            const technicianData =
                Array.isArray(data)
                    ? data
                    : data?.data || [];

            setTechnicians(
                technicianData
            );

        } catch (err) {

            console.error(
                "Technician loading error:",
                err
            );

            /*
             * Do not completely break the page
             * if technicians fail to load.
             *
             * Existing technicians from work orders
             * remain available.
             */

        } finally {

            setTechnicianLoading(false);

        }
    };

    // ============================================================
    // STATUS
    // ============================================================

    const getStatus = (item) =>
        String(
            item?.status || ""
        ).toUpperCase();

    const filteredWorkOrders =
        statusFilter === "ALL"
            ? workOrders
            : workOrders.filter(
                workOrder =>
                    getStatus(
                        workOrder
                    ) === statusFilter
            );

    // ============================================================
    // EQUIPMENT
    // ============================================================

    const getEquipmentName = (
        workOrder
    ) => {

        return (
            workOrder?.equipment?.name ||
            workOrder?.equipmentName ||
            `Equipment #${
                workOrder?.equipment?.id ||
                workOrder?.equipmentId ||
                "-"
            }`
        );
    };

    // ============================================================
    // REQUEST ID
    // ============================================================

    const getRequestId = (
        workOrder
    ) => {

        return (
            workOrder
                ?.maintenanceRequest
                ?.id ||
            workOrder
                ?.maintenanceRequestId ||
            "-"
        );
    };

    // ============================================================
    // TECHNICIAN NAME
    // ============================================================

    const getTechnicianName = (
        technician
    ) => {

        if (!technician) {
            return "Unassigned";
        }

        return (
            technician.fullName ||
            technician.name ||
            technician.email ||
            `Technician #${technician.id}`
        );
    };

    // ============================================================
    // CREATE WORK ORDER MODAL
    // ============================================================

    const openCreateModal = () => {

        setFormData({
            maintenanceRequestId: "",
            workDescription: "",
            scheduledStart: "",
            scheduledEnd: ""
        });

        setError("");
        setSuccess("");

        setShowCreateModal(
            true
        );
    };

    const closeCreateModal = () => {

        if (creating) {
            return;
        }

        setShowCreateModal(
            false
        );
    };

    const handleFormChange = (
        e
    ) => {

        const {
            name,
            value
        } = e.target;

        setFormData(
            previous => ({
                ...previous,
                [name]: value
            })
        );
    };

    // ============================================================
    // SELECTED MAINTENANCE REQUEST
    // ============================================================

    const selectedRequest =
        maintenanceRequests.find(
            request =>
                String(
                    request.id
                ) ===
                String(
                    formData
                        .maintenanceRequestId
                )
        );

    // ============================================================
    // SELECTED EQUIPMENT
    // ============================================================

    const getSelectedEquipmentName =
        () => {

            if (!selectedRequest) {
                return "-";
            }

            return (
                selectedRequest
                    ?.equipment
                    ?.name ||
                selectedRequest
                    ?.equipmentName ||
                `Equipment #${
                    selectedRequest
                        ?.equipment
                        ?.id ||
                    selectedRequest
                        ?.equipmentId ||
                    "-"
                }`
            );
        };

    // ============================================================
    // CREATE WORK ORDER
    // ============================================================

    const handleCreateWorkOrder =
        async (e) => {

            e.preventDefault();

            setError("");
            setSuccess("");

            if (
                !formData
                    .maintenanceRequestId
            ) {

                setError(
                    "Please select a maintenance request."
                );

                return;
            }

            if (
                !formData
                    .workDescription
                    ?.trim()
            ) {

                setError(
                    "Work description is required."
                );

                return;
            }

            if (
                formData.scheduledStart &&
                formData.scheduledEnd &&
                new Date(
                    formData.scheduledEnd
                ) <
                new Date(
                    formData.scheduledStart
                )
            ) {

                setError(
                    "Scheduled end cannot be before scheduled start."
                );

                return;
            }

            try {

                setCreating(true);

                await createWorkOrder({

                    maintenanceRequestId:
                        Number(
                            formData
                                .maintenanceRequestId
                        ),

                    workDescription:
                        formData
                            .workDescription
                            .trim(),

                    scheduledStart:
                        formData
                            .scheduledStart
                            ? formData
                                .scheduledStart
                            : null,

                    scheduledEnd:
                        formData
                            .scheduledEnd
                            ? formData
                                .scheduledEnd
                            : null
                });

                setShowCreateModal(
                    false
                );

                setFormData({
                    maintenanceRequestId: "",
                    workDescription: "",
                    scheduledStart: "",
                    scheduledEnd: ""
                });

                setSuccess(
                    "Work order created successfully."
                );

                await loadData();

            } catch (err) {

                console.error(
                    "Create work order error:",
                    err
                );

                setError(
                    getErrorMessage(
                        err,
                        "Unable to create work order."
                    )
                );

            } finally {

                setCreating(false);

            }
        };

    // ============================================================
    // ASSIGN TECHNICIAN MODAL
    // ============================================================

    const openAssignModal = (
        workOrder
    ) => {

        setSelectedWorkOrder(
            workOrder
        );

        setTechnicianId(
            workOrder
                ?.technician
                ?.id
                ? String(
                    workOrder
                        .technician
                        .id
                )
                : ""
        );

        setError("");
        setSuccess("");

        /*
         * Refresh technician list whenever
         * the assignment modal opens.
         */

        loadTechnicians();

        setShowAssignModal(
            true
        );
    };

    const closeAssignModal = () => {

        if (assigning) {
            return;
        }

        setShowAssignModal(
            false
        );

        setSelectedWorkOrder(
            null
        );

        setTechnicianId("");
    };

    // ============================================================
    // ASSIGN TECHNICIAN
    // ============================================================

    const handleAssignTechnician =
        async () => {

            if (!selectedWorkOrder) {
                return;
            }

            if (!technicianId) {

                setError(
                    "Please select a technician."
                );

                return;
            }

            try {

                setAssigning(true);
                setError("");
                setSuccess("");

                await assignTechnician(
                    selectedWorkOrder.id,
                    Number(
                        technicianId
                    )
                );

                setShowAssignModal(
                    false
                );

                setSelectedWorkOrder(
                    null
                );

                setTechnicianId("");

                setSuccess(
                    "Technician assigned successfully."
                );

                await loadData();

            } catch (err) {

                console.error(
                    "Assign technician error:",
                    err
                );

                setError(
                    getErrorMessage(
                        err,
                        "Unable to assign technician."
                    )
                );

            } finally {

                setAssigning(false);

            }
        };

    // ============================================================
    // START WORK
    // ============================================================

    const handleStartWork =
        async (workOrder) => {

            if (
                !window.confirm(
                    `Start work order #${workOrder.id}?`
                )
            ) {
                return;
            }

            try {

                setError("");
                setSuccess("");

                await startWorkOrder(
                    workOrder.id
                );

                setSuccess(
                    `Work order #${workOrder.id} started successfully.`
                );

                await loadData();

            } catch (err) {

                console.error(
                    "Start work order error:",
                    err
                );

                setError(
                    getErrorMessage(
                        err,
                        "Unable to start work order."
                    )
                );
            }
        };

    // ============================================================
    // COMPLETE WORK MODAL
    // ============================================================

    const openCompleteModal = (
        workOrder
    ) => {

        setSelectedWorkOrder(
            workOrder
        );

        setCompletionNotes(
            workOrder
                ?.completionNotes ||
            ""
        );

        setError("");
        setSuccess("");

        setShowCompleteModal(
            true
        );
    };

    const closeCompleteModal = () => {

        if (completing) {
            return;
        }

        setShowCompleteModal(
            false
        );

        setSelectedWorkOrder(
            null
        );

        setCompletionNotes("");
    };

    // ============================================================
    // COMPLETE WORK
    // ============================================================

    const handleCompleteWork =
        async () => {

            if (!selectedWorkOrder) {
                return;
            }

            try {

                setCompleting(true);
                setError("");
                setSuccess("");

                const workOrderId =
                    selectedWorkOrder.id;

                await completeWorkOrder(
                    workOrderId,
                    completionNotes
                );

                setShowCompleteModal(
                    false
                );

                setSelectedWorkOrder(
                    null
                );

                setCompletionNotes("");

                setSuccess(
                    `Work order #${workOrderId} completed successfully.`
                );

                await loadData();

            } catch (err) {

                console.error(
                    "Complete work order error:",
                    err
                );

                setError(
                    getErrorMessage(
                        err,
                        "Unable to complete work order."
                    )
                );

            } finally {

                setCompleting(false);

            }
        };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (
            <div
                className="work-orders-page"
            >

                <div className="loading">

                    <div className="loading-spinner">
                        ⟳
                    </div>

                    Loading work orders...

                </div>

            </div>
        );
    }

    // ============================================================
    // PAGE
    // ============================================================

    return (
        <div
            className="work-orders-page"
            data-page={varOcg}
        >

            {/* ================================================== */}
            {/* HEADER */}
            {/* ================================================== */}

            <div className="page-header">

                <div>

                    <h1>
                        Work Order Management
                    </h1>

                    <p>
                        Create, assign and manage
                        maintenance work orders.
                    </p>

                </div>

                <div className="header-actions">

                    {/* CREATE BUTTON IS KEPT */}

                    <button
                        className="create-btn"
                        onClick={
                            openCreateModal
                        }
                    >
                        + Create Work Order
                    </button>

                    <button
                        className="refresh-btn"
                        onClick={
                            loadData
                        }
                    >
                        ↻ Refresh
                    </button>

                </div>

            </div>

            {/* ================================================== */}
            {/* SUCCESS */}
            {/* ================================================== */}

            {success && (

                <div
                    className="success-message"
                >

                    <span>
                        ✓
                    </span>

                    <span>
                        {success}
                    </span>

                    <button
                        onClick={() =>
                            setSuccess("")
                        }
                    >
                        ×
                    </button>

                </div>

            )}

            {/* ================================================== */}
            {/* ERROR */}
            {/* ================================================== */}

            {error && (

                <div
                    className="error-message"
                >

                    <span>
                        ⚠
                    </span>

                    <span>
                        {error}
                    </span>

                    <button
                        onClick={() =>
                            setError("")
                        }
                    >
                        ×
                    </button>

                </div>

            )}

            {/* ================================================== */}
            {/* SUMMARY */}
            {/* ================================================== */}

            <div className="summary-grid">

                <SummaryCard
                    title="Total"
                    value={
                        workOrders.length
                    }
                />

                <SummaryCard
                    title="Created"
                    value={
                        workOrders.filter(
                            w =>
                                getStatus(w) ===
                                "CREATED"
                        ).length
                    }
                />

                <SummaryCard
                    title="Assigned"
                    value={
                        workOrders.filter(
                            w =>
                                getStatus(w) ===
                                "ASSIGNED"
                        ).length
                    }
                />

                <SummaryCard
                    title="In Progress"
                    value={
                        workOrders.filter(
                            w =>
                                getStatus(w) ===
                                "IN_PROGRESS"
                        ).length
                    }
                />

                <SummaryCard
                    title="Completed"
                    value={
                        workOrders.filter(
                            w =>
                                getStatus(w) ===
                                "COMPLETED"
                        ).length
                    }
                />

            </div>

            {/* ================================================== */}
            {/* FILTER */}
            {/* ================================================== */}

            <div className="toolbar">

                <div>

                    <label>
                        Filter by Status
                    </label>

                    <select
                        value={
                            statusFilter
                        }
                        onChange={
                            e =>
                                setStatusFilter(
                                    e.target.value
                                )
                        }
                    >

                        <option value="ALL">
                            All
                        </option>

                        <option value="CREATED">
                            Created
                        </option>

                        <option value="ASSIGNED">
                            Assigned
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

                    </select>

                </div>

            </div>

            {/* ================================================== */}
            {/* WORK ORDER TABLE */}
            {/* ================================================== */}

            <div className="card">

                <div className="card-header">

                    <div>

                        <h2>
                            Work Orders
                        </h2>

                        <p>
                            Work orders loaded from
                            the database.
                        </p>

                    </div>

                </div>

                {filteredWorkOrders.length ===
                0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            📋
                        </div>

                        <h3>
                            No work orders found
                        </h3>

                        <p>
                            Click
                            {" "}
                            <strong>
                                "+ Create Work Order"
                            </strong>
                            {" "}
                            to create one.
                        </p>

                        <button
                            className="empty-create-btn"
                            onClick={
                                openCreateModal
                            }
                        >
                            + Create Work Order
                        </button>

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
                                        Request
                                    </th>

                                    <th>
                                        Equipment
                                    </th>

                                    <th>
                                        Work Description
                                    </th>

                                    <th>
                                        Technician
                                    </th>

                                    <th>
                                        Scheduled Start
                                    </th>

                                    <th>
                                        Scheduled End
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Actions
                                    </th>
                                    <th>
                                        Downtime
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredWorkOrders.map(
                                    workOrder => {

                                        const status =
                                            getStatus(
                                                workOrder
                                            );

                                        return (

                                            <tr
                                                key={
                                                    workOrder.id
                                                }
                                            >

                                                <td>

                                                    <strong>
                                                        #
                                                        {
                                                            workOrder.id
                                                        }
                                                    </strong>

                                                </td>

                                                <td>

                                                    #
                                                    {
                                                        getRequestId(
                                                            workOrder
                                                        )
                                                    }

                                                </td>

                                                <td>

                                                    {
                                                        getEquipmentName(
                                                            workOrder
                                                        )
                                                    }

                                                </td>

                                                <td>

                                                    {
                                                        workOrder
                                                            .workDescription ||
                                                        "-"
                                                    }

                                                </td>

                                                <td>

                                                    {
                                                        getTechnicianName(
                                                            workOrder
                                                                ?.technician
                                                        )
                                                    }

                                                </td>

                                                <td>

                                                    {
                                                        workOrder
                                                            .scheduledStart
                                                            ? new Date(
                                                                workOrder
                                                                    .scheduledStart
                                                            ).toLocaleString()
                                                            : "-"
                                                    }

                                                </td>

                                                <td>

                                                    {
                                                        workOrder
                                                            .scheduledEnd
                                                            ? new Date(
                                                                workOrder
                                                                    .scheduledEnd
                                                            ).toLocaleString()
                                                            : "-"
                                                    }

                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            `badge status-${status.toLowerCase()}`
                                                        }
                                                    >
                                                        {
                                                            status
                                                                .replace(
                                                                    "_",
                                                                    " "
                                                                ) ||
                                                            "UNKNOWN"
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    <div className="actions">

                                                        <button
                                                            className="action-btn assign"
                                                            onClick={() =>
                                                                openAssignModal(
                                                                    workOrder
                                                                )
                                                            }
                                                            disabled={
                                                                status ===
                                                                    "COMPLETED" ||
                                                                status ===
                                                                    "CANCELLED"
                                                            }
                                                        >
                                                            Assign
                                                        </button>

                                                        <button
                                                            className="action-btn start"
                                                            onClick={() =>
                                                                handleStartWork(
                                                                    workOrder
                                                                )
                                                            }
                                                            disabled={
                                                                status ===
                                                                    "IN_PROGRESS" ||
                                                                status ===
                                                                    "COMPLETED" ||
                                                                status ===
                                                                    "CANCELLED"
                                                            }
                                                        >
                                                            Start
                                                        </button>

                                                        <button
                                                            className="action-btn complete"
                                                            onClick={() =>
                                                                openCompleteModal(
                                                                    workOrder
                                                                )
                                                            }
                                                            disabled={
                                                                status ===
                                                                    "COMPLETED" ||
                                                                status ===
                                                                    "CANCELLED"
                                                            }
                                                        >
                                                            Complete
                                                        </button>

                                                    </div>

                                                </td>

                                                <td> {formatDowntime( workOrder.actualStart, workOrder.actualEnd )} </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {/* ================================================== */}
            {/* CREATE WORK ORDER MODAL */}
            {/* ================================================== */}

            {showCreateModal && (

                <div
                    className="modal-overlay"
                    onMouseDown={e => {

                        if (
                            e.target ===
                            e.currentTarget &&
                            !creating
                        ) {

                            closeCreateModal();

                        }

                    }}
                >

                    <div
                        className="modal create-modal"
                    >

                        <form
                            onSubmit={
                                handleCreateWorkOrder
                            }
                        >

                            <div
                                className="modal-header"
                            >

                                <div>

                                    <h2>
                                        Create Work Order
                                    </h2>

                                    <p>
                                        Create a work order
                                        for a maintenance
                                        request.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeCreateModal
                                    }
                                    disabled={
                                        creating
                                    }
                                >
                                    ×
                                </button>

                            </div>

                            <div
                                className="modal-body"
                            >

                                {/* REQUEST */}

                                <div
                                    className="form-group"
                                >

                                    <label>
                                        Maintenance Request
                                        <span>
                                            *
                                        </span>
                                    </label>

                                    <select
                                        name="maintenanceRequestId"
                                        value={
                                            formData
                                                .maintenanceRequestId
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select maintenance
                                            request
                                        </option>

                                        {maintenanceRequests.map(
                                            request => (

                                                <option
                                                    key={
                                                        request.id
                                                    }
                                                    value={
                                                        request.id
                                                    }
                                                >
                                                    Request #
                                                    {
                                                        request.id
                                                    }

                                                    {" — "}

                                                    {
                                                        request.description
                                                            ?.substring(
                                                                0,
                                                                60
                                                            ) ||
                                                        "Maintenance Request"
                                                    }

                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                                {/* EQUIPMENT */}

                                <div
                                    className="equipment-preview"
                                >

                                    <span>
                                        Equipment
                                    </span>

                                    <strong>
                                        {
                                            getSelectedEquipmentName()
                                        }
                                    </strong>

                                </div>

                                {/* DESCRIPTION */}

                                <div
                                    className="form-group"
                                >

                                    <label>
                                        Work Description
                                        <span>
                                            *
                                        </span>
                                    </label>

                                    <textarea
                                        name="workDescription"
                                        value={
                                            formData
                                                .workDescription
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        rows="5"
                                        placeholder="Describe the maintenance work to be performed..."
                                        required
                                    />

                                    <small>
                                        Enter the exact work
                                        that the technician
                                        needs to perform.
                                    </small>

                                </div>

                                {/* SCHEDULE */}

                                <div
                                    className="form-row"
                                >

                                    <div
                                        className="form-group"
                                    >

                                        <label>
                                            Scheduled Start
                                        </label>

                                        <input
                                            type="datetime-local"
                                            name="scheduledStart"
                                            value={
                                                formData
                                                    .scheduledStart
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                        />

                                    </div>

                                    <div
                                        className="form-group"
                                    >

                                        <label>
                                            Scheduled End
                                        </label>

                                        <input
                                            type="datetime-local"
                                            name="scheduledEnd"
                                            value={
                                                formData
                                                    .scheduledEnd
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                        />

                                    </div>

                                </div>

                            </div>

                            <div
                                className="modal-footer"
                            >

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={
                                        closeCreateModal
                                    }
                                    disabled={
                                        creating
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={
                                        creating
                                    }
                                >

                                    {creating
                                        ? "Creating..."
                                        : "Create Work Order"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* ================================================== */}
            {/* ASSIGN TECHNICIAN MODAL */}
            {/* ================================================== */}

            {showAssignModal && (

                <div
                    className="modal-overlay"
                >

                    <div
                        className="modal"
                    >

                        <div
                            className="modal-header"
                        >

                            <div>

                                <h2>
                                    Assign Technician
                                </h2>

                                <p>
                                    Select a technician
                                    for this work order.
                                </p>

                            </div>

                            <button
                                onClick={
                                    closeAssignModal
                                }
                                disabled={
                                    assigning
                                }
                            >
                                ×
                            </button>

                        </div>

                        <div
                            className="modal-body"
                        >

                            <div
                                className="selected-work-order"
                            >

                                <span>
                                    Work Order
                                </span>

                                <strong>
                                    #
                                    {
                                        selectedWorkOrder
                                            ?.id
                                    }
                                </strong>

                            </div>

                            <div
                                className="form-group"
                            >

                                <label>
                                    Technician
                                    <span>
                                        *
                                    </span>
                                </label>

                                <select
                                    value={
                                        technicianId
                                    }
                                    onChange={
                                        e =>
                                            setTechnicianId(
                                                e.target.value
                                            )
                                    }
                                    disabled={
                                        technicianLoading ||
                                        assigning
                                    }
                                >

                                    <option value="">
                                        {technicianLoading
                                            ? "Loading technicians..."
                                            : "Select technician"}
                                    </option>

                                    {technicians.map(
                                        technician => (

                                            <option
                                                key={
                                                    technician.id
                                                }
                                                value={
                                                    technician.id
                                                }
                                            >
                                                {
                                                    getTechnicianName(
                                                        technician
                                                    )
                                                }
                                                {" — ID: "}
                                                {
                                                    technician.id
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                                {technicians.length ===
                                    0 &&
                                    !technicianLoading && (

                                        <small
                                            className="form-error"
                                        >
                                            No technicians
                                            available.
                                            Please make sure
                                            technician users
                                            exist in the
                                            database.

                                        </small>

                                    )}

                            </div>

                            <div
                                className="technician-info"
                            >

                                <span>
                                    Available Technicians
                                </span>

                                <strong>
                                    {
                                        technicianLoading
                                            ? "Loading..."
                                            : technicians.length
                                    }
                                </strong>

                            </div>

                        </div>

                        <div
                            className="modal-footer"
                        >

                            <button
                                className="cancel-btn"
                                onClick={
                                    closeAssignModal
                                }
                                disabled={
                                    assigning
                                }
                            >
                                Cancel
                            </button>

                            <button
                                className="primary-btn"
                                onClick={
                                    handleAssignTechnician
                                }
                                disabled={
                                    assigning ||
                                    technicianLoading ||
                                    !technicianId
                                }
                            >

                                {assigning
                                    ? "Assigning..."
                                    : "Assign Technician"}

                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* ================================================== */}
            {/* COMPLETE MODAL */}
            {/* ================================================== */}

            {showCompleteModal && (

                <div
                    className="modal-overlay"
                >

                    <div
                        className="modal"
                    >

                        <div
                            className="modal-header"
                        >

                            <div>

                                <h2>
                                    Complete Work Order
                                </h2>

                                <p>
                                    Add completion notes
                                    before finishing
                                    this work order.
                                </p>

                            </div>

                            <button
                                onClick={
                                    closeCompleteModal
                                }
                                disabled={
                                    completing
                                }
                            >
                                ×
                            </button>

                        </div>

                        <div
                            className="modal-body"
                        >

                            <div
                                className="selected-work-order"
                            >

                                <span>
                                    Work Order
                                </span>

                                <strong>
                                    #
                                    {
                                        selectedWorkOrder
                                            ?.id
                                    }
                                </strong>

                            </div>

                            <div
                                className="form-group"
                            >

                                <label>
                                    Completion Notes
                                </label>

                                <textarea
                                    rows="6"
                                    value={
                                        completionNotes
                                    }
                                    onChange={
                                        e =>
                                            setCompletionNotes(
                                                e.target.value
                                            )
                                    }
                                    placeholder="Enter completion notes..."
                                    disabled={
                                        completing
                                    }
                                />

                            </div>

                        </div>

                        <div
                            className="modal-footer"
                        >

                            <button
                                className="cancel-btn"
                                onClick={
                                    closeCompleteModal
                                }
                                disabled={
                                    completing
                                }
                            >
                                Cancel
                            </button>

                            <button
                                className="complete-btn"
                                onClick={
                                    handleCompleteWork
                                }
                                disabled={
                                    completing
                                }
                            >

                                {completing
                                    ? "Completing..."
                                    : "Complete Work"}

                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* ================================================== */}
            {/* STYLES */}
            {/* ================================================== */}

            <style>{`

                .work-orders-page {
                    padding: 24px;
                    max-width: 1500px;
                    margin: auto;
                    background: #f8fafc;
                    min-height: 100vh;
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
                    color: #111827;
                }

                .page-header p {
                    margin: 0;
                    color: #666;
                }

                .header-actions {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }

                .create-btn,
                .refresh-btn {
                    border: none;
                    border-radius: 7px;
                    padding: 10px 18px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: 0.2s;
                }

                .create-btn {
                    background: #2563eb;
                    color: white;
                }

                .create-btn:hover {
                    background: #1d4ed8;
                }

                .refresh-btn {
                    background: #e2e8f0;
                    color: #1e293b;
                }

                .refresh-btn:hover {
                    background: #cbd5e1;
                }

                .success-message,
                .error-message {
                    padding: 13px 16px;
                    margin-bottom: 20px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .success-message {
                    background: #dcfce7;
                    border: 1px solid #86efac;
                    color: #166534;
                }

                .error-message {
                    background: #fee2e2;
                    border: 1px solid #fca5a5;
                    color: #991b1b;
                }

                .success-message button,
                .error-message button {
                    margin-left: auto;
                    border: none;
                    background: transparent;
                    font-size: 18px;
                    cursor: pointer;
                }

                .summary-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(5, 1fr);
                    gap: 16px;
                    margin-bottom: 25px;
                }

                .summary-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 18px;
                    box-shadow:
                        0 2px 8px
                        rgba(0,0,0,0.05);
                }

                .summary-card span {
                    color: #666;
                    font-size: 14px;
                }

                .summary-card strong {
                    display: block;
                    margin-top: 8px;
                    font-size: 28px;
                    color: #111827;
                }

                .toolbar {
                    display: flex;
                    justify-content: flex-end;
                    margin-bottom: 18px;
                }

                .toolbar label {
                    display: block;
                    margin-bottom: 5px;
                    font-size: 13px;
                    font-weight: 600;
                }

                .toolbar select {
                    min-width: 180px;
                    padding: 9px;
                    border: 1px solid #d1d5db;
                    border-radius: 7px;
                    background: white;
                }

                .card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 22px;
                }

                .card-header {
                    margin-bottom: 18px;
                }

                .card-header h2 {
                    margin: 0 0 5px;
                }

                .card-header p {
                    margin: 0;
                    color: #777;
                    font-size: 14px;
                }

                .table-wrapper {
                    overflow-x: auto;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 1200px;
                }

                th,
                td {
                    padding: 13px;
                    text-align: left;
                    border-bottom: 1px solid #eee;
                    vertical-align: middle;
                }

                th {
                    background: #f8f9fa;
                    font-size: 13px;
                }

                td {
                    font-size: 14px;
                }

                .badge {
                    display: inline-block;
                    padding: 5px 9px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .status-created {
                    background: #e5e7eb;
                }

                .status-assigned {
                    background: #dbeafe;
                }

                .status-in_progress {
                    background: #ede9fe;
                }

                .status-completed {
                    background: #dcfce7;
                }

                .status-cancelled {
                    background: #fee2e2;
                }

                .actions {
                    display: flex;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .action-btn {
                    border: none;
                    padding: 7px 10px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 600;
                }

                .action-btn:disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                }

                .assign {
                    background: #dbeafe;
                    color: #1e40af;
                }

                .start {
                    background: #ede9fe;
                    color: #6d28d9;
                }

                .complete {
                    background: #dcfce7;
                    color: #166534;
                }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: #666;
                }

                .empty-icon {
                    font-size: 40px;
                    margin-bottom: 10px;
                }

                .empty-state h3 {
                    color: #111827;
                    margin-bottom: 8px;
                }

                .empty-create-btn {
                    margin-top: 15px;
                    border: none;
                    background: #2563eb;
                    color: white;
                    padding: 10px 18px;
                    border-radius: 7px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .loading {
                    padding: 100px;
                    text-align: center;
                    font-size: 18px;
                }

                .loading-spinner {
                    font-size: 35px;
                    margin-bottom: 10px;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }

                    to {
                        transform: rotate(360deg);
                    }
                }

                /* ================================================= */
                /* MODAL */
                /* ================================================= */

                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.45);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    z-index: 1000;
                }

                .modal {
                    width: 100%;
                    max-width: 520px;
                    background: white;
                    border-radius: 12px;
                    box-shadow:
                        0 10px 40px
                        rgba(0,0,0,0.2);
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .create-modal {
                    max-width: 650px;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 18px 20px;
                    border-bottom: 1px solid #eee;
                }

                .modal-header h2 {
                    margin: 0 0 5px;
                }

                .modal-header p {
                    margin: 0;
                    color: #777;
                    font-size: 13px;
                }

                .modal-header button {
                    border: none;
                    background: transparent;
                    font-size: 25px;
                    cursor: pointer;
                }

                .modal-header button:disabled {
                    cursor: not-allowed;
                    opacity: 0.5;
                }

                .modal-body {
                    padding: 20px;
                }

                .form-group {
                    margin-bottom: 18px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 7px;
                    font-weight: 600;
                    font-size: 14px;
                }

                .form-group label span {
                    color: #dc2626;
                    margin-left: 3px;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    box-sizing: border-box;
                    padding: 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 7px;
                    background: white;
                    font-family: inherit;
                    font-size: 14px;
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #2563eb;
                    box-shadow:
                        0 0 0 2px
                        rgba(37,99,235,0.1);
                }

                .form-group textarea {
                    resize: vertical;
                }

                .form-group small {
                    display: block;
                    margin-top: 5px;
                    color: #777;
                    font-size: 12px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns:
                        1fr 1fr;
                    gap: 15px;
                }

                .equipment-preview {
                    padding: 13px 15px;
                    margin-bottom: 18px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                }

                .equipment-preview span {
                    display: block;
                    font-size: 12px;
                    color: #64748b;
                    margin-bottom: 4px;
                }

                .equipment-preview strong {
                    font-size: 15px;
                }

                .selected-work-order {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 13px 15px;
                    margin-bottom: 18px;
                }

                .selected-work-order span {
                    color: #64748b;
                    font-size: 13px;
                }

                .selected-work-order strong {
                    color: #111827;
                    font-size: 16px;
                }

                .technician-info {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px;
                    background: #eff6ff;
                    border: 1px solid #bfdbfe;
                    border-radius: 8px;
                    font-size: 13px;
                }

                .technician-info span {
                    color: #475569;
                }

                .technician-info strong {
                    color: #1d4ed8;
                }

                .form-error {
                    color: #dc2626 !important;
                }

                .modal-footer {
                    padding: 15px 20px;
                    border-top: 1px solid #eee;
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }

                .cancel-btn,
                .primary-btn,
                .complete-btn {
                    border: none;
                    border-radius: 7px;
                    padding: 10px 15px;
                    cursor: pointer;
                    font-weight: 600;
                }

                .cancel-btn {
                    background: #e5e7eb;
                    color: #374151;
                }

                .primary-btn {
                    background: #2563eb;
                    color: white;
                }

                .primary-btn:hover {
                    background: #1d4ed8;
                }

                .primary-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .complete-btn {
                    background: #16a34a;
                    color: white;
                }

                .complete-btn:hover {
                    background: #15803d;
                }

                .complete-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @media (max-width: 1000px) {

                    .summary-grid {
                        grid-template-columns:
                            repeat(2, 1fr);
                    }

                }

                @media (max-width: 600px) {

                    .work-orders-page {
                        padding: 15px;
                    }

                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 15px;
                    }

                    .header-actions {
                        width: 100%;
                    }

                    .create-btn,
                    .refresh-btn {
                        flex: 1;
                    }

                    .summary-grid {
                        grid-template-columns: 1fr;
                    }

                    .toolbar {
                        justify-content: flex-start;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                    }

                }

            `}</style>

        </div>
    );
};

// ============================================================
// SUMMARY CARD
// ============================================================

const SummaryCard = ({
    title,
    value
}) => {

    return (
        <div className="summary-card">

            <span>
                {title}
            </span>

            <strong>
                {value}
            </strong>

        </div>
    );
};

export default WorkOrders;