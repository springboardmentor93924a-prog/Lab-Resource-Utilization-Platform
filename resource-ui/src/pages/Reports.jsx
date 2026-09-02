import { useEffect, useState } from "react";
import api from "../services/api";

function Reports() {
    const [activeTab, setActiveTab] = useState("summary");
    const [summary, setSummary] = useState(null);
    const [revenue, setRevenue] = useState(null);
    const [equipmentReport, setEquipmentReport] = useState([]);
    const [bookingReport, setBookingReport] = useState([]);
    const [maintenanceReport, setMaintenanceReport] = useState([]);
    const [calibrationReport, setCalibrationReport] = useState([]);
    const [costReport, setCostReport] = useState([]);
    const [billingReport, setBillingReport] = useState([]);
    const [sharingReport, setSharingReport] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState("");

    async function loadSummary() {
        setLoading(true);
        setError("");
        try {
            const [sumRes, revRes] = await Promise.all([
                api.get("/reports/dashboard-summary").catch(() => ({ data: null })),
                api.get("/reports/revenue-summary").catch(() => ({ data: null }))
            ]);
            setSummary(sumRes.data);
            setRevenue(revRes.data);
        } catch (err) {
            console.error(err);
            setError("Unable to load report summary.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSummary();
         
    }, []);

    const loadTabData = async (tab) => {
        setLoading(true);
        setError("");
        try {
            const endpoint = {
                equipment: "/reports/equipment",
                bookings: "/reports/bookings",
                maintenance: "/reports/maintenance",
                calibration: "/reports/calibrations",
                costs: "/reports/costs",
                billing: "/reports/billing",
                sharing: "/reports/sharing"
            }[tab];
            if (!endpoint) return;
            const response = await api.get(endpoint);
            const setters = {
                equipment: setEquipmentReport,
                bookings: setBookingReport,
                maintenance: setMaintenanceReport,
                calibration: setCalibrationReport,
                costs: setCostReport,
                billing: setBillingReport,
                sharing: setSharingReport
            };
            setters[tab](response.data || []);
        } catch (err) {
            console.error(err);
            setError(`Unable to load ${tab} report.`);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab !== "summary") {
            loadTabData(tab);
        }
    };

    const handleExport = async (format) => {
        if (activeTab === "summary" || exporting) return;
        setExporting(format);
        setError("");
        try {
            const response = await api.get(
                `/reports/export/${format}/${activeTab}`,
                { responseType: "blob" }
            );
            const extension = format === "excel" ? "xlsx" : "pdf";
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${activeTab}-report.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            setError(`Unable to export ${activeTab} report.`);
        } finally {
            setExporting("");
        }
    };

    const formatCurrency = (val) => {
        if (val == null) return "—";
        return `₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (d) => {
        if (!d) return "—";
        return new Date(d).toLocaleDateString();
    };

    const formatDateTime = (dt) => {
        if (!dt) return "—";
        return new Date(dt).toLocaleString();
    };

    const TABS = [
        { id: "summary", label: "Summary" },
        { id: "equipment", label: "Equipment" },
        { id: "bookings", label: "Bookings" },
        { id: "maintenance", label: "Maintenance" },
        { id: "calibration", label: "Calibration" },
        { id: "costs", label: "Costs" },
        { id: "billing", label: "Billing" },
        { id: "sharing", label: "Sharing" }
    ];

    return (
        <div className="page-content">
            <h1 className="mb-4">Reports</h1>
            {error && <div className="alert alert-danger">{error}</div>}

            <ul className="nav nav-tabs mb-4 flex-wrap">
                {TABS.map(tab => (
                    <li className="nav-item" key={tab.id}>
                        <button
                            className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
                            onClick={() => handleTabChange(tab.id)}
                        >
                            {tab.label}
                        </button>
                    </li>
                ))}
            </ul>

            {activeTab !== "summary" && (
                <div className="d-flex gap-2 mb-3">
                    <button
                        className="btn btn-outline-success btn-sm"
                        onClick={() => handleExport("excel")}
                        disabled={exporting !== ""}
                    >
                        {exporting === "excel" ? "Exporting..." : "Export Excel"}
                    </button>
                    <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleExport("pdf")}
                        disabled={exporting !== ""}
                    >
                        {exporting === "pdf" ? "Exporting..." : "Export PDF"}
                    </button>
                </div>
            )}

            {loading && <div className="text-center py-4"><div className="spinner-border" role="status"></div></div>}

            {!loading && activeTab === "summary" && summary && (
                <div>
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5 className="mb-3">Dashboard Summary Report</h5>
                            <p className="text-muted small">Generated: {formatDateTime(summary.generatedAt)}</p>
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <div className="stat-mini"><strong>{summary.totalEquipments}</strong> Total Equipment</div>
                                </div>
                                <div className="col-md-3">
                                    <div className="stat-mini"><strong className="text-success">{summary.availableEquipments}</strong> Available</div>
                                </div>
                                <div className="col-md-3">
                                    <div className="stat-mini"><strong className="text-warning">{summary.bookedEquipments}</strong> Booked</div>
                                </div>
                                <div className="col-md-3">
                                    <div className="stat-mini"><strong className="text-danger">{summary.maintenanceEquipments}</strong> Under Maintenance</div>
                                </div>
                            </div>
                            <hr />
                            <div className="row g-3">
                                <div className="col-md-3"><div className="stat-mini"><strong>{summary.totalBookings}</strong> Total Bookings</div></div>
                                <div className="col-md-3"><div className="stat-mini"><strong className="text-success">{summary.approvedBookings}</strong> Approved</div></div>
                                <div className="col-md-3"><div className="stat-mini"><strong className="text-info">{summary.pendingBookings}</strong> Pending</div></div>
                                <div className="col-md-3"><div className="stat-mini"><strong>{summary.completedBookings}</strong> Completed</div></div>
                                <div className="col-md-3"><div className="stat-mini"><strong className="text-danger">{summary.cancelledBookings}</strong> Cancelled</div></div>
                                <div className="col-md-3"><div className="stat-mini"><strong className="text-danger">{summary.rejectedBookings}</strong> Rejected</div></div>
                            </div>
                            <hr />
                            <div className="row g-3">
                                <div className="col-md-3"><div className="stat-mini"><strong>{summary.totalMaintenanceRecords}</strong> Maintenance Records</div></div>
                                <div className="col-md-3"><div className="stat-mini"><strong className="text-info">{summary.pendingMaintenanceRecords}</strong> Pending Maintenance</div></div>
                                <div className="col-md-3"><div className="stat-mini"><strong className="text-success">{summary.completedMaintenanceRecords}</strong> Completed Maintenance</div></div>
                                <div className="col-md-3"><div className="stat-mini"><strong>{summary.totalCalibrationRecords}</strong> Calibration Records</div></div>
                            </div>
                            <hr />
                            <div className="row g-3">
                                <div className="col-md-3"><div className="stat-mini"><strong>{summary.totalInstitutions}</strong> Institutions</div></div>
                                <div className="col-md-3"><div className="stat-mini"><strong>{summary.totalDepartments}</strong> Departments</div></div>
                                <div className="col-md-3"><div className="stat-mini"><strong>{summary.totalUsers}</strong> Users</div></div>
                                <div className="col-md-3"><div className="stat-mini"><strong>{summary.totalExternalBookings}</strong> External Bookings</div></div>
                            </div>
                        </div>
                    </div>

                    {revenue && (
                        <div className="card">
                            <div className="card-body">
                                <h5 className="mb-3">Revenue Summary</h5>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <div className="stat-mini"><strong className="text-success">{formatCurrency(revenue.totalRevenue)}</strong> Total Revenue</div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="stat-mini"><strong className="text-danger">{formatCurrency(revenue.totalCost)}</strong> Total Cost</div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="stat-mini"><strong className={Number(revenue.profit) >= 0 ? "text-success" : "text-danger"}>{formatCurrency(revenue.profit)}</strong> Profit</div>
                                    </div>
                                    <div className="col-md-3"><div className="stat-mini"><strong>{revenue.totalBills}</strong> Total Bills</div></div>
                                    <div className="col-md-3"><div className="stat-mini"><strong className="text-success">{revenue.paidBills}</strong> Paid Bills</div></div>
                                    <div className="col-md-3"><div className="stat-mini"><strong className="text-warning">{revenue.pendingBills}</strong> Pending Bills</div></div>
                                    <div className="col-md-3"><div className="stat-mini"><strong className="text-danger">{revenue.overdueBills}</strong> Overdue Bills</div></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!loading && activeTab === "equipment" && (
                <div className="card">
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead><tr><th>Name</th><th>Category</th><th>Institution</th><th>Status</th><th>Availability</th></tr></thead>
                            <tbody>
                                {equipmentReport.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center text-muted py-3">No equipment records</td></tr>
                                ) : equipmentReport.map(eq => (
                                    <tr key={eq.id}>
                                        <td><div className="fw-bold">{eq.name}</div><div className="text-muted small">{eq.serialNumber}</div></td>
                                        <td>{eq.categoryName || "—"}</td>
                                        <td>{eq.institutionName || "—"}</td>
                                        <td><span className="badge badge-secondary">{eq.status || "—"}</span></td>
                                        <td><span className="badge badge-info">{eq.availabilityStatus || "—"}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && activeTab === "bookings" && (
                <div className="card">
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead><tr><th>Equipment</th><th>User</th><th>Start</th><th>End</th><th>Booking Status</th><th>Approval</th></tr></thead>
                            <tbody>
                                {bookingReport.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center text-muted py-3">No booking records</td></tr>
                                ) : bookingReport.map(b => (
                                    <tr key={b.id}>
                                        <td className="fw-bold">{b.equipmentName || "—"}</td>
                                        <td>{b.userName || "—"}</td>
                                        <td>{formatDateTime(b.startTime)}</td>
                                        <td>{formatDateTime(b.endTime)}</td>
                                        <td><span className="badge badge-info">{b.bookingStatus || "—"}</span></td>
                                        <td><span className="badge badge-secondary">{b.approvalStatus || "—"}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && activeTab === "maintenance" && (
                <div className="card">
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead><tr><th>Equipment</th><th>Type</th><th>Scheduled</th><th>Completed</th><th>Technician</th><th>Cost</th><th>Status</th></tr></thead>
                            <tbody>
                                {maintenanceReport.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center text-muted py-3">No maintenance records</td></tr>
                                ) : maintenanceReport.map(m => (
                                    <tr key={m.id}>
                                        <td className="fw-bold">{m.equipmentName || "—"}</td>
                                        <td>{m.maintenanceType || "—"}</td>
                                        <td>{formatDate(m.scheduledDate)}</td>
                                        <td>{formatDate(m.completedDate)}</td>
                                        <td>{m.technicianName || "—"}</td>
                                        <td>{m.cost != null ? formatCurrency(m.cost) : "—"}</td>
                                        <td><span className="badge badge-secondary">{m.status || "—"}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && activeTab === "calibration" && (
                <div className="card">
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead><tr><th>Equipment</th><th>Calibration Date</th><th>Next Due</th><th>Result</th><th>Status</th></tr></thead>
                            <tbody>
                                {calibrationReport.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center text-muted py-3">No calibration records</td></tr>
                                ) : calibrationReport.map(c => (
                                    <tr key={c.id}>
                                        <td className="fw-bold">{c.equipmentName || "—"}</td>
                                        <td>{formatDate(c.calibrationDate)}</td>
                                        <td>{formatDate(c.nextCalibrationDate)}</td>
                                        <td><span className="badge badge-info">{c.calibrationResult || "—"}</span></td>
                                        <td><span className="badge badge-secondary">{c.status || "—"}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && activeTab === "costs" && (
                <div className="card">
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead><tr><th>Equipment</th><th>Cost Type</th><th>Amount</th><th>Date</th><th>Vendor</th><th>Payment</th></tr></thead>
                            <tbody>
                                {costReport.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center text-muted py-3">No cost records</td></tr>
                                ) : costReport.map(c => (
                                    <tr key={c.id}>
                                        <td className="fw-bold">{c.equipmentName || "—"}</td>
                                        <td>{c.costType || "—"}</td>
                                        <td>{formatCurrency(c.amount)}</td>
                                        <td>{formatDate(c.costDate)}</td>
                                        <td>{c.vendorName || "—"}</td>
                                        <td><span className="badge badge-secondary">{c.paymentStatus || "—"}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && activeTab === "billing" && (
                <div className="card">
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead><tr><th>Payer</th><th>Receiver</th><th>Base Amount</th><th>Total</th><th>Invoice Date</th><th>Due Date</th><th>Status</th></tr></thead>
                            <tbody>
                                {billingReport.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center text-muted py-3">No billing records</td></tr>
                                ) : billingReport.map(b => (
                                    <tr key={b.id}>
                                        <td>{b.payerInstitutionName || "—"}</td>
                                        <td>{b.receiverInstitutionName || "—"}</td>
                                        <td>{formatCurrency(b.baseAmount)}</td>
                                        <td className="fw-bold">{formatCurrency(b.totalAmount)}</td>
                                        <td>{formatDate(b.invoiceDate)}</td>
                                        <td>{formatDate(b.dueDate)}</td>
                                        <td>
                                            <span className="badge badge-info">{b.billingStatus || "—"}</span>
                                            <span className="badge badge-secondary ms-1">{b.paymentStatus || "—"}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {!loading && activeTab === "sharing" && (
                <div className="card">
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead><tr><th>Equipment</th><th>Requester</th><th>Provider Institution</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
                            <tbody>
                                {sharingReport.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center text-muted py-3">No sharing records</td></tr>
                                ) : sharingReport.map(s => (
                                    <tr key={s.id}>
                                        <td className="fw-bold">{s.equipmentName || "—"}</td>
                                        <td>
                                            <div>{s.requesterName || "—"}</div>
                                            <div className="text-muted small">{s.requesterInstitutionName || ""}</div>
                                        </td>
                                        <td>{s.providerInstitutionName || "—"}</td>
                                        <td>{formatDateTime(s.startTime)}</td>
                                        <td>{formatDateTime(s.endTime)}</td>
                                        <td><span className="badge badge-info">{s.status || "—"}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reports;
