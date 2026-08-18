import React, { useEffect, useState } from "react";
import "./Maintenance.css";

const API_BASE_URL = "http://localhost:8080/api";

function Maintenance() {
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

    const token = localStorage.getItem("token");

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

    useEffect(() => {
        fetchData();
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

        </div>
    );
}

export default Maintenance;