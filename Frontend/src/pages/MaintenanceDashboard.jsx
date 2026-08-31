import React, { useEffect, useState } from "react";
import {
    getAllMaintenanceRequests,
    getAllWorkOrders,
    calculateDowntime
} from "../services/maintenanceApi";

// __define-ocg__

const MaintenanceDashboard = () => {

    const [requests, setRequests] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);
    const [downtime, setDowntime] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const varOcg = "maintenance-dashboard";

    useEffect(() => {
        loadDashboard();
    }, []);

    // =========================================================
    // LOAD DASHBOARD DATA
    // =========================================================

    const loadDashboard = async () => {

        try {

            setLoading(true);
            setError("");

            console.log(
                "Loading maintenance dashboard..."
            );

            // =================================================
            // MAINTENANCE REQUESTS
            // =================================================

            const requestsResponse =
                await getAllMaintenanceRequests();

            console.log(
                "Maintenance requests:",
                requestsResponse
            );

            const requestData =
                Array.isArray(requestsResponse)
                    ? requestsResponse
                    : requestsResponse?.data &&
                      Array.isArray(requestsResponse.data)
                        ? requestsResponse.data
                        : requestsResponse?.content &&
                          Array.isArray(requestsResponse.content)
                            ? requestsResponse.content
                            : [];

            setRequests(requestData);

            // =================================================
            // WORK ORDERS
            // =================================================

            const workOrdersResponse =
                await getAllWorkOrders();

            console.log(
                "Work orders:",
                workOrdersResponse
            );

            const workOrderData =
                Array.isArray(workOrdersResponse)
                    ? workOrdersResponse
                    : workOrdersResponse?.data &&
                      Array.isArray(workOrdersResponse.data)
                        ? workOrdersResponse.data
                        : workOrdersResponse?.content &&
                          Array.isArray(workOrdersResponse.content)
                            ? workOrdersResponse.content
                            : [];

            setWorkOrders(workOrderData);

            // =================================================
            // DOWNTIME
            // =================================================

            await calculateTotalDowntime(
                workOrderData
            );

        } catch (err) {

            console.error(
                "Maintenance dashboard error:",
                err
            );

            console.error(
                "Backend response:",
                err?.response?.data
            );

            let errorMessage =
                "Unable to load maintenance dashboard.";

            if (typeof err?.response?.data === "string") {

                errorMessage =
                    err.response.data;

            } else if (
                err?.response?.data?.message
            ) {

                errorMessage =
                    err.response.data.message;

            } else if (err?.message) {

                errorMessage =
                    err.message;
            }

            setError(errorMessage);

        } finally {

            setLoading(false);
        }
    };

    // =========================================================
    // CALCULATE TOTAL DOWNTIME
    // =========================================================

    const calculateTotalDowntime = async (
        workOrderData
    ) => {

        try {

            if (
                !Array.isArray(workOrderData) ||
                workOrderData.length === 0
            ) {

                setDowntime(0);
                return;
            }

            let totalHours = 0;

            for (
                const workOrder
                of workOrderData
            ) {

                if (!workOrder?.id) {
                    continue;
                }

                try {

                    const response =
                        await calculateDowntime(
                            workOrder.id
                        );

                    const data =
                        response?.data ??
                        response;

                    /*
                     * Current backend endpoint returns
                     * the WorkOrder object.

                     * Therefore calculate downtime from
                     * actualStart and actualEnd.
                     */

                    if (
                        data &&
                        data.actualStart &&
                        data.actualEnd
                    ) {

                        const start =
                            new Date(
                                data.actualStart
                            );

                        const end =
                            new Date(
                                data.actualEnd
                            );

                        const milliseconds =
                            end.getTime() -
                            start.getTime();

                        if (
                            milliseconds > 0
                        ) {

                            totalHours +=
                                milliseconds /
                                (1000 * 60 * 60);
                        }
                    }

                } catch (err) {

                    console.warn(
                        `Unable to calculate downtime for work order ${workOrder.id}`,
                        err
                    );
                }
            }

            setDowntime(totalHours);

        } catch (err) {

            console.error(
                "Downtime calculation failed:",
                err
            );

            setDowntime(0);
        }
    };

    // =========================================================
    // HELPERS
    // =========================================================

    const getStatus = (item) =>
        String(
            item?.status || ""
        ).toUpperCase();

    const getPriority = (item) =>
        String(
            item?.priority || ""
        ).toUpperCase();

    const getEquipmentName = (item) => {

        return (
            item?.equipment?.name ||
            item?.equipmentName ||
            `Equipment #${
                item?.equipment?.id ||
                item?.equipmentId ||
                "-"
            }`
        );
    };

    // =========================================================
    // REQUEST COUNTS
    // =========================================================

    const totalRequests =
        requests.length;

    const pendingRequests =
        requests.filter(
            request =>
                getStatus(request) ===
                "PENDING"
        ).length;

    const inProgressRequests =
        requests.filter(
            request =>
                getStatus(request) ===
                "IN_PROGRESS"
        ).length;

    const completedRequests =
        requests.filter(
            request =>
                getStatus(request) ===
                "COMPLETED"
        ).length;

    const highPriorityRequests =
        requests.filter(
            request =>
                getPriority(request) ===
                "HIGH" ||
                getPriority(request) ===
                "CRITICAL"
        ).length;

    // =========================================================
    // WORK ORDER COUNTS
    // =========================================================

    const totalWorkOrders =
        workOrders.length;

    const activeWorkOrders =
        workOrders.filter(
            workOrder => {

                const status =
                    getStatus(workOrder);

                return (
                    status === "ASSIGNED" ||
                    status === "IN_PROGRESS"
                );
            }
        ).length;

    // =========================================================
    // LOADING STATE
    // =========================================================

    if (loading) {

        return (
            <div className="maintenance-dashboard">

                <div className="loading">

                    <div className="loading-spinner">
                        ⟳
                    </div>

                    <p>
                        Loading maintenance dashboard...
                    </p>

                </div>

                <style>{dashboardStyles}</style>

            </div>
        );
    }

    // =========================================================
    // DASHBOARD
    // =========================================================

    return (

        <div
            className="maintenance-dashboard"
            data-dashboard={varOcg}
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="dashboard-header">

                <div>

                    <h1>
                        Maintenance Dashboard
                    </h1>

                    <p>
                        Monitor maintenance requests,
                        work orders and equipment downtime.
                    </p>

                </div>

                <button
                    className="refresh-btn"
                    onClick={loadDashboard}
                    disabled={loading}
                >
                    ↻ Refresh
                </button>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="error-message">

                    <strong>
                        Error:
                    </strong>

                    <span>
                        {error}
                    </span>

                    <button
                        onClick={loadDashboard}
                    >
                        Try Again
                    </button>

                </div>
            )}

            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="stats-grid">

                <StatCard
                    title="Total Maintenance Requests"
                    value={totalRequests}
                    icon="🔧"
                    className="blue"
                />

                <StatCard
                    title="Pending Requests"
                    value={pendingRequests}
                    icon="⏳"
                    className="orange"
                />

                <StatCard
                    title="In Progress"
                    value={inProgressRequests}
                    icon="⚙️"
                    className="purple"
                />

                <StatCard
                    title="Completed"
                    value={completedRequests}
                    icon="✓"
                    className="green"
                />

                <StatCard
                    title="High Priority"
                    value={highPriorityRequests}
                    icon="!"
                    className="red"
                />

                <StatCard
                    title="Total Work Orders"
                    value={totalWorkOrders}
                    icon="📋"
                    className="teal"
                />

                <StatCard
                    title="Active Work Orders"
                    value={activeWorkOrders}
                    icon="🛠️"
                    className="indigo"
                />

                <StatCard
                    title="Equipment Downtime"
                    value={`${Number(
                        downtime
                    ).toFixed(1)} hrs`}
                    icon="🕒"
                    className="dark"
                />

            </div>

            {/* =================================================
                RECENT MAINTENANCE REQUESTS
            ================================================= */}

            <section className="dashboard-section">

                <div className="section-header">

                    <div>

                        <h2>
                            Recent Maintenance Requests
                        </h2>

                        <p>
                            Latest maintenance requests
                            from the database
                        </p>

                    </div>

                    <span className="record-count">
                        {requests.length} records
                    </span>

                </div>

                {requests.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            🔧
                        </div>

                        <h3>
                            No maintenance requests
                        </h3>

                        <p>
                            Create a maintenance request
                            to see it here.
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

                                </tr>

                            </thead>

                            <tbody>

                                {requests
                                    .slice(0, 10)
                                    .map(request => (

                                        <tr
                                            key={
                                                request.id
                                            }
                                        >

                                            <td>
                                                <strong>
                                                    #{request.id}
                                                </strong>
                                            </td>

                                            <td>
                                                {
                                                    getEquipmentName(
                                                        request
                                                    )
                                                }
                                            </td>

                                            <td
                                                className="description-cell"
                                            >
                                                {
                                                    request.description ||
                                                    "-"
                                                }
                                            </td>

                                            <td>

                                                <StatusBadge
                                                    value={
                                                        getPriority(
                                                            request
                                                        )
                                                    }
                                                    type="priority"
                                                />

                                            </td>

                                            <td>

                                                <StatusBadge
                                                    value={
                                                        getStatus(
                                                            request
                                                        )
                                                    }
                                                    type="status"
                                                />

                                            </td>

                                            <td>
                                                {
                                                    request.requestedAt
                                                        ? new Date(
                                                            request.requestedAt
                                                        ).toLocaleString()
                                                        : "-"
                                                }
                                            </td>

                                        </tr>

                                    ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </section>

            {/* =================================================
                RECENT WORK ORDERS
            ================================================= */}

            <section className="dashboard-section">

                <div className="section-header">

                    <div>

                        <h2>
                            Recent Work Orders
                        </h2>

                        <p>
                            Latest work orders from the
                            database
                        </p>

                    </div>

                    <span className="record-count">
                        {workOrders.length} records
                    </span>

                </div>

                {workOrders.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            📋
                        </div>

                        <h3>
                            No work orders
                        </h3>

                        <p>
                            Work orders will appear here
                            after they are created.
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
                                        Work Description
                                    </th>

                                    <th>
                                        Technician
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Scheduled Start
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {workOrders
                                    .slice(0, 10)
                                    .map(workOrder => (

                                        <tr
                                            key={
                                                workOrder.id
                                            }
                                        >

                                            <td>
                                                <strong>
                                                    #{workOrder.id}
                                                </strong>
                                            </td>

                                            <td>
                                                {
                                                    getEquipmentName(
                                                        workOrder
                                                    )
                                                }
                                            </td>

                                            <td
                                                className="description-cell"
                                            >
                                                {
                                                    workOrder.workDescription ||
                                                    "-"
                                                }
                                            </td>

                                            <td>

                                                {
                                                    workOrder
                                                        ?.technician
                                                        ?.fullName ||
                                                    workOrder
                                                        ?.technicianName ||
                                                    "Unassigned"
                                                }

                                            </td>

                                            <td>

                                                <StatusBadge
                                                    value={
                                                        getStatus(
                                                            workOrder
                                                        )
                                                    }
                                                    type="status"
                                                />

                                            </td>

                                            <td>
                                                {
                                                    workOrder.scheduledStart
                                                        ? new Date(
                                                            workOrder.scheduledStart
                                                        ).toLocaleString()
                                                        : "-"
                                                }
                                            </td>

                                        </tr>

                                    ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </section>

            {/* =================================================
                WORK ORDER SUMMARY
            ================================================= */}

            <section className="dashboard-section">

                <div className="section-header">

                    <div>

                        <h2>
                            Work Order Summary
                        </h2>

                        <p>
                            Current maintenance activity
                        </p>

                    </div>

                </div>

                <div className="work-summary">

                    <div>

                        <span>
                            Total Work Orders
                        </span>

                        <strong>
                            {totalWorkOrders}
                        </strong>

                    </div>

                    <div>

                        <span>
                            Active Work Orders
                        </span>

                        <strong>
                            {activeWorkOrders}
                        </strong>

                    </div>

                    <div>

                        <span>
                            Equipment Downtime
                        </span>

                        <strong>
                            {Number(
                                downtime
                            ).toFixed(1)} hrs
                        </strong>

                    </div>

                </div>

            </section>

            <style>{dashboardStyles}</style>

        </div>
    );
};


// =============================================================
// STAT CARD
// =============================================================

const StatCard = ({
    title,
    value,
    icon,
    className
}) => {

    return (

        <div
            className={`stat-card ${className}`}
        >

            <div className="stat-icon">
                {icon}
            </div>

            <div className="stat-content">

                <span className="stat-label">
                    {title}
                </span>

                <strong className="stat-value">
                    {value}
                </strong>

            </div>

        </div>
    );
};


// =============================================================
// STATUS BADGE
// =============================================================

const StatusBadge = ({
    value,
    type
}) => {

    const normalized =
        String(value || "UNKNOWN")
            .toLowerCase();

    return (

        <span
            className={
                `badge ${
                    type === "priority"
                        ? `priority-${normalized}`
                        : `status-${normalized}`
                }`
            }
        >
            {value || "UNKNOWN"}
        </span>
    );
};


// =============================================================
// STYLES
// =============================================================

const dashboardStyles = `

.maintenance-dashboard {
    padding: 24px;
    max-width: 1400px;
    margin: auto;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
}

.dashboard-header h1 {
    margin: 0 0 6px;
    font-size: 30px;
}

.dashboard-header p {
    margin: 0;
    color: #666;
}

.refresh-btn {
    border: none;
    border-radius: 7px;
    padding: 10px 18px;
    cursor: pointer;
    font-weight: 600;
    background: #111827;
    color: white;
}

.refresh-btn:hover {
    opacity: 0.9;
}

.error-message {
    padding: 14px 16px;
    margin-bottom: 20px;
    border-radius: 8px;
    background: #fee2e2;
    border: 1px solid #fca5a5;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.error-message button {
    margin-left: auto;
    border: none;
    border-radius: 6px;
    padding: 7px 12px;
    cursor: pointer;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 18px;
    margin-bottom: 28px;
}

.stat-card {
    padding: 20px;
    border-radius: 12px;
    background: white;
    border: 1px solid #e5e5e5;
    display: flex;
    align-items: center;
    gap: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-icon {
    font-size: 28px;
}

.stat-content {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.stat-label {
    font-size: 13px;
    color: #666;
}

.stat-value {
    font-size: 27px;
}

.blue {
    border-left: 5px solid #3b82f6;
}

.orange {
    border-left: 5px solid #f59e0b;
}

.purple {
    border-left: 5px solid #8b5cf6;
}

.green {
    border-left: 5px solid #22c55e;
}

.red {
    border-left: 5px solid #ef4444;
}

.teal {
    border-left: 5px solid #14b8a6;
}

.indigo {
    border-left: 5px solid #6366f1;
}

.dark {
    border-left: 5px solid #374151;
}

.dashboard-section {
    background: white;
    border: 1px solid #e5e5e5;
    border-radius: 12px;
    padding: 22px;
    margin-bottom: 25px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
}

.section-header h2 {
    margin: 0 0 5px;
}

.section-header p {
    margin: 0;
    color: #777;
    font-size: 14px;
}

.record-count {
    font-size: 13px;
    color: #666;
    background: #f3f4f6;
    padding: 6px 10px;
    border-radius: 20px;
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
    padding: 13px;
    text-align: left;
    border-bottom: 1px solid #eee;
}

th {
    font-size: 13px;
    background: #f8f9fa;
}

td {
    font-size: 14px;
}

.description-cell {
    max-width: 300px;
}

.badge {
    display: inline-block;
    padding: 5px 9px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}

.priority-low {
    background: #dcfce7;
}

.priority-medium {
    background: #fef3c7;
}

.priority-high {
    background: #fee2e2;
}

.priority-critical {
    background: #fecaca;
}

.status-pending {
    background: #fef3c7;
}

.status-approved {
    background: #dbeafe;
}

.status-in_progress {
    background: #ede9fe;
}

.status-completed {
    background: #dcfce7;
}

.status-rejected,
.status-cancelled {
    background: #fee2e2;
}

.status-created {
    background: #e5e7eb;
}

.status-assigned {
    background: #dbeafe;
}

.empty-state {
    text-align: center;
    padding: 45px 20px;
    color: #666;
}

.empty-icon {
    font-size: 35px;
    margin-bottom: 10px;
}

.empty-state h3 {
    margin-bottom: 5px;
}

.work-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

.work-summary > div {
    padding: 20px;
    border-radius: 10px;
    background: #f8f9fa;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.work-summary span {
    color: #666;
    font-size: 14px;
}

.work-summary strong {
    font-size: 26px;
}

.loading {
    padding: 60px;
    text-align: center;
    font-size: 18px;
}

.loading-spinner {
    font-size: 35px;
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

@media (max-width: 1000px) {

    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }

}

@media (max-width: 600px) {

    .maintenance-dashboard {
        padding: 15px;
    }

    .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .work-summary {
        grid-template-columns: 1fr;
    }

    .section-header {
        align-items: flex-start;
        gap: 10px;
        flex-direction: column;
    }

}
`;

export default MaintenanceDashboard;