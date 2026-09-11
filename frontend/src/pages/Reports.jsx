import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Reports.css";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const REPORT_TABS = [
  { key: "equipment-utilization", label: "Equipment Utilization" },
  { key: "department-usage", label: "Department Usage" },
  { key: "maintenance-downtime", label: "Maintenance & Downtime" },
  { key: "inter-institution-sharing", label: "Inter-Institution Sharing" },
  { key: "procurement-cost", label: "Procurement & Cost" },
];

const CHART_COLORS = ["#4f46e5", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

function authHeaders() {
  const token = sessionStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

// ---------------------------------------------------------------
// Task 5 - Detailed Reports (tabbed section, real DB data, filters
// + PDF/Excel export). Kept inside Reports.jsx per the requirement
// to extend the existing page rather than build a separate one.
// ---------------------------------------------------------------
function DetailedReportsSection({ equipmentList }) {
  const [activeTab, setActiveTab] = useState(REPORT_TABS[0].key);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    departmentId: "",
    institutionId: "",
    equipmentId: "",
    category: "",
    status: "",
  });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState("");

  // Filter dropdown options, derived from equipment already loaded
  // by the parent Reports page - no extra API calls needed.
  const departments = Array.from(
    new Map(
      equipmentList
        .filter((e) => e.department)
        .map((e) => [e.department.departmentId, e.department.departmentName])
    ).entries()
  );

  const institutions = Array.from(
    new Map(
      equipmentList
        .filter((e) => e.institution)
        .map((e) => [e.institution.institutionId, e.institution.institutionName])
    ).entries()
  );

  const categories = Array.from(
    new Set(equipmentList.map((e) => e.category).filter(Boolean))
  );

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.departmentId) params.append("departmentId", filters.departmentId);
    if (filters.institutionId) params.append("institutionId", filters.institutionId);
    if (filters.equipmentId) params.append("equipmentId", filters.equipmentId);
    if (filters.category) params.append("category", filters.category);
    if (filters.status) params.append("status", filters.status);
    return params.toString();
  };

  const fetchReport = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/reports/${activeTab}?${buildQuery()}`,
        { headers: authHeaders() }
      );

      if (!res.ok) {
        throw new Error("Failed to load report.");
      }

      setReport(await res.json());
    } catch (err) {
      console.error(err);
      setError("Could not load this report. Please adjust filters and try again.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleExport = async (format) => {
    setExporting(format);
    setError("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/reports/${activeTab}/export/${format}?${buildQuery()}`,
        { headers: authHeaders() }
      );

      if (!res.ok) {
        throw new Error("Export failed.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${activeTab}-report.${format === "pdf" ? "pdf" : "xlsx"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(`Could not export as ${format.toUpperCase()}.`);
    } finally {
      setExporting("");
    }
  };

  const fmtNum = (v) =>
    v === null || v === undefined ? "-" : Number(v).toLocaleString();

  const renderSummaryCards = () => {
    if (!report) return null;

    switch (activeTab) {
      case "equipment-utilization":
        return (
          <>
            <SummaryCard label="Total Equipment" value={report.totalEquipment} border="border-blue" />
            <SummaryCard label="Avg Utilization" value={`${fmtNum(report.averageUtilization)}%`} border="border-green" />
            <SummaryCard label="Total Booked Hrs" value={fmtNum(report.totalBookedHours)} border="border-yellow" />
            <SummaryCard label="Highest Utilized" value={report.highestUtilizationEquipment} border="border-indigo" />
          </>
        );
      case "department-usage":
        return (
          <>
            <SummaryCard label="Departments" value={report.totalDepartments} border="border-blue" />
            <SummaryCard label="Total Bookings" value={report.totalBookings} border="border-green" />
            <SummaryCard label="Total Usage Hrs" value={fmtNum(report.totalUsageHours)} border="border-yellow" />
            <SummaryCard label="Most Active Dept" value={report.mostActiveDepartment} border="border-indigo" />
          </>
        );
      case "maintenance-downtime":
        return (
          <>
            <SummaryCard label="Maintenance Events" value={report.totalMaintenanceEvents} border="border-blue" />
            <SummaryCard label="Downtime Events" value={report.totalDowntimeEvents} border="border-red" />
            <SummaryCard label="Total Downtime Hrs" value={fmtNum(report.totalDowntimeHours)} border="border-yellow" />
            <SummaryCard label="Highest Downtime" value={report.equipmentWithHighestDowntime} border="border-indigo" />
          </>
        );
      case "inter-institution-sharing":
        return (
          <>
            <SummaryCard label="Total Requests" value={report.totalRequests} border="border-blue" />
            <SummaryCard label="Approved" value={report.approvedRequests} border="border-green" />
            <SummaryCard label="Pending" value={report.pendingRequests} border="border-yellow" />
            <SummaryCard label="Rejected" value={report.rejectedRequests} border="border-red" />
          </>
        );
      case "procurement-cost":
        return (
          <>
            <SummaryCard label="Total Purchase Cost" value={`₹${fmtNum(report.totalPurchaseCost)}`} border="border-blue" />
            <SummaryCard label="Total Usage Cost" value={`₹${fmtNum(report.totalUsageCost)}`} border="border-green" />
            <SummaryCard label="Total Maintenance Cost" value={`₹${fmtNum(report.totalMaintenanceCost)}`} border="border-yellow" />
            <SummaryCard label="Highest Cost Equipment" value={report.highestCostEquipment} border="border-indigo" />
          </>
        );
      default:
        return null;
    }
  };

  const renderChart = () => {
    if (!report || !report.rows || report.rows.length === 0) return null;

    if (activeTab === "equipment-utilization") {
      return (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={report.rows.slice(0, 10)} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="equipmentName" angle={-25} textAnchor="end" interval={0} height={70} />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v) => [`${v}%`, "Utilization"]} />
            <Bar dataKey="utilizationPercentage" fill="#22c55e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (activeTab === "department-usage") {
      return (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={report.rows} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="departmentName" angle={-20} textAnchor="end" interval={0} height={60} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalUsageHours" name="Usage Hrs" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (activeTab === "maintenance-downtime") {
      const byEquipment = Object.values(
        report.rows.reduce((acc, r) => {
          acc[r.equipmentName] = acc[r.equipmentName] || { equipmentName: r.equipmentName, downtimeHours: 0 };
          acc[r.equipmentName].downtimeHours += r.downtimeHours || 0;
          return acc;
        }, {})
      ).slice(0, 10);

      return (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={byEquipment} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="equipmentName" angle={-25} textAnchor="end" interval={0} height={70} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="downtimeHours" name="Downtime Hrs" fill="#ef4444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (activeTab === "inter-institution-sharing") {
      const statusCounts = Object.entries(
        report.rows.reduce((acc, r) => {
          acc[r.status || "UNKNOWN"] = (acc[r.status || "UNKNOWN"] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }));

      return (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={statusCounts}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={(entry) => `${entry.name}: ${entry.value}`}
            >
              {statusCounts.map((entry, index) => (
                <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (activeTab === "procurement-cost") {
      return (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={report.rows.slice(0, 10)} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="equipmentName" angle={-25} textAnchor="end" interval={0} height={70} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalOperationalCost" name="Operational Cost" fill="#f59e0b" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  const renderTable = () => {
    if (!report) return null;

    if (!report.rows || report.rows.length === 0) {
      return <div className="reports-empty-state">No data available for the selected filters.</div>;
    }

    switch (activeTab) {
      case "equipment-utilization":
        return (
          <table className="reports-table">
            <thead>
              <tr>
                <th>Equipment</th><th>Category</th><th>Department</th><th>Institution</th>
                <th>Available Hrs</th><th>Booked Hrs</th><th>Idle Hrs</th><th>Utilization %</th>
                <th>Bookings</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((r) => (
                <tr key={r.equipmentId}>
                  <td>{r.equipmentName}</td><td>{r.category}</td><td>{r.departmentName}</td>
                  <td>{r.institutionName}</td><td>{fmtNum(r.totalAvailableHours)}</td>
                  <td>{fmtNum(r.totalBookedHours)}</td><td>{fmtNum(r.idleHours)}</td>
                  <td>{fmtNum(r.utilizationPercentage)}%</td><td>{r.bookingCount}</td><td>{r.currentStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "department-usage":
        return (
          <table className="reports-table">
            <thead>
              <tr>
                <th>Department</th><th>Equipment Count</th><th>Bookings</th>
                <th>Usage Hrs</th><th>Available Hrs</th><th>Utilization %</th><th>Most Used</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((r) => (
                <tr key={r.departmentName}>
                  <td>{r.departmentName}</td><td>{r.equipmentCount}</td><td>{r.bookingCount}</td>
                  <td>{fmtNum(r.totalUsageHours)}</td><td>{fmtNum(r.totalAvailableHours)}</td>
                  <td>{fmtNum(r.utilizationPercentage)}%</td><td>{r.mostUsedEquipment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "maintenance-downtime":
        return (
          <table className="reports-table">
            <thead>
              <tr>
                <th>Equipment</th><th>Department</th><th>Type</th><th>Date</th><th>Status</th>
                <th>Work Order</th><th>Technician</th><th>Downtime Hrs</th><th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.equipmentName}</td><td>{r.departmentName}</td><td>{r.maintenanceType}</td>
                  <td>{r.maintenanceDate || "-"}</td><td>{r.maintenanceStatus || "-"}</td>
                  <td>{r.workOrderStatus || "-"}</td><td>{r.assignedTechnician || "-"}</td>
                  <td>{fmtNum(r.downtimeHours)}</td><td>{r.downtimeReason || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "inter-institution-sharing":
        return (
          <table className="reports-table">
            <thead>
              <tr>
                <th>Request ID</th><th>Equipment</th><th>Requesting Institution</th>
                <th>Providing Institution</th><th>Request Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((r) => (
                <tr key={r.requestId}>
                  <td>{r.requestId}</td><td>{r.equipmentName}</td><td>{r.requestingInstitution}</td>
                  <td>{r.providingInstitution}</td>
                  <td>{r.requestDate ? new Date(r.requestDate).toLocaleString() : "-"}</td>
                  <td>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "procurement-cost":
        return (
          <table className="reports-table">
            <thead>
              <tr>
                <th>Equipment</th><th>Category</th><th>Department</th><th>Institution</th>
                <th>Purchase Date</th><th>Purchase Cost</th><th>Usage Cost</th>
                <th>Maintenance Cost</th><th>Total Operational</th><th>Utilization %</th><th>Cost/Hr</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((r) => (
                <tr key={r.equipmentId}>
                  <td>{r.equipmentName}</td><td>{r.category}</td><td>{r.departmentName}</td>
                  <td>{r.institutionName}</td><td>{r.purchaseDate || "-"}</td>
                  <td>{r.purchaseCost !== null ? `₹${fmtNum(r.purchaseCost)}` : "N/A"}</td>
                  <td>₹{fmtNum(r.usageCost)}</td><td>₹{fmtNum(r.maintenanceCost)}</td>
                  <td>₹{fmtNum(r.totalOperationalCost)}</td><td>{fmtNum(r.utilizationPercentage)}%</td>
                  <td>{r.costPerUsageHour !== null ? `₹${fmtNum(r.costPerUsageHour)}` : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      default:
        return null;
    }
  };

  return (
    <div className="reports-detailed-section">
      <h3 className="section-title">Detailed Reports</h3>

      <div className="reports-tabs">
        {REPORT_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`reports-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="reports-filters">
        <div className="reports-filter-field">
          <label>Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
          />
        </div>

        <div className="reports-filter-field">
          <label>End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
          />
        </div>

        {activeTab !== "inter-institution-sharing" && (
          <div className="reports-filter-field">
            <label>Department</label>
            <select
              value={filters.departmentId}
              onChange={(e) => setFilters((f) => ({ ...f, departmentId: e.target.value }))}
            >
              <option value="">All</option>
              {departments.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="reports-filter-field">
          <label>Institution</label>
          <select
            value={filters.institutionId}
            onChange={(e) => setFilters((f) => ({ ...f, institutionId: e.target.value }))}
          >
            <option value="">All</option>
            {institutions.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>

        {(activeTab === "equipment-utilization" ||
          activeTab === "maintenance-downtime" ||
          activeTab === "procurement-cost") && (
          <div className="reports-filter-field">
            <label>Equipment</label>
            <select
              value={filters.equipmentId}
              onChange={(e) => setFilters((f) => ({ ...f, equipmentId: e.target.value }))}
            >
              <option value="">All</option>
              {equipmentList.map((eq) => (
                <option key={eq.equipmentId} value={eq.equipmentId}>{eq.equipmentName}</option>
              ))}
            </select>
          </div>
        )}

        {(activeTab === "equipment-utilization" || activeTab === "procurement-cost") && (
          <div className="reports-filter-field">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {activeTab === "inter-institution-sharing" && (
          <div className="reports-filter-field">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        )}

        <button className="reports-apply-btn" onClick={fetchReport} disabled={loading}>
          {loading ? "Loading..." : "Apply Filters"}
        </button>

        <button
          className="reports-export-btn pdf"
          onClick={() => handleExport("pdf")}
          disabled={exporting !== ""}
        >
          {exporting === "pdf" ? "Exporting..." : "Export PDF"}
        </button>

        <button
          className="reports-export-btn excel"
          onClick={() => handleExport("excel")}
          disabled={exporting !== ""}
        >
          {exporting === "excel" ? "Exporting..." : "Export Excel"}
        </button>
      </div>

      {error && <div className="reports-error-banner">{error}</div>}

      {loading ? (
        <div className="reports-empty-state">Loading report...</div>
      ) : (
        <>
          <div className="section-style">{renderSummaryCards()}</div>

          <div className="reports-chart-wrapper">{renderChart()}</div>

          <div className="reports-table-wrapper">{renderTable()}</div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, border }) {
  return (
    <div className={`card-style ${border}`}>
      <h4 className="card-title">{label}</h4>
      <p className="card-value">{value ?? "-"}</p>
    </div>
  );
}

function Reports() {
  const [equipment, setEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);

  const role = sessionStorage.getItem("role");

  // GET /api/users is backend-restricted to INSTITUTION_ADMIN /
  // SYSTEM_ADMIN, but this Reports page is also reachable by
  // LAB_MANAGER and DEPARTMENT_HEAD. Calling it unconditionally for
  // those roles used to fail on every load (403) and leave the User
  // Summary card silently stuck at 0.
  const canViewUsers = ["INSTITUTION_ADMIN", "SYSTEM_ADMIN"].includes(role);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/equipment`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setEquipment(data))
      .catch((error) => console.error("Equipment error:", error));

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setBookings(data))
      .catch((error) => console.error("Booking error:", error));

    if (canViewUsers) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => setUsers(data))
        .catch((error) => console.error("User error:", error));
    }
  }, [canViewUsers]);

  const myInstitutionId = sessionStorage.getItem("institutionId");

  // Same reasoning as Dashboard.jsx: /api/equipment intentionally
  // returns every institution's equipment (needed for cross-college
  // booking), but this report should reflect only the viewer's own
  // institution. SYSTEM_ADMIN sees the real platform-wide total.
  const scopedEquipment =
    role === "SYSTEM_ADMIN" || !myInstitutionId
      ? equipment
      : equipment.filter(
          (item) =>
            String(item.institution?.institutionId) === String(myInstitutionId)
        );

  const available = scopedEquipment.filter(
    (item) => item.status === "Available"
  ).length;

  // Backend sets "Booked" instead of "Reserved"
  const reserved = scopedEquipment.filter(
    (item) => item.status === "Booked" || item.status === "Reserved"
  ).length;

  // Backend sets "Under Maintenance" instead of "Maintenance"
  const maintenance = scopedEquipment.filter(
    (item) => item.status === "Under Maintenance" || item.status === "Maintenance"
  ).length;

  const confirmedBookings = bookings.filter(
    (booking) => booking.bookingStatus === "Confirmed"
  ).length;

  const pendingBookings = bookings.filter(
    (booking) => booking.bookingStatus === "Pending Approval"
  ).length;

  const completedBookings = bookings.filter(
    (booking) => booking.bookingStatus === "Completed"
  ).length;

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2 className="reports-title">Lab Intelligence & Reports Dashboard</h2>
        <p className="reports-subtitle">Real-time monitoring of equipment, bookings, and system resource utilization.</p>
      </div>

      <h3 className="section-title">Equipment Summary</h3>
      <div className="section-style">
        <div className="card-style border-blue">
          <h4 className="card-title">Total Equipment</h4>
          <p className="card-value">{scopedEquipment.length}</p>
        </div>

        <div className="card-style border-green">
          <h4 className="card-title">Available</h4>
          <p className="card-value">{available}</p>
        </div>

        <div className="card-style border-yellow">
          <h4 className="card-title">Reserved</h4>
          <p className="card-value">{reserved}</p>
        </div>

        <div className="card-style border-red">
          <h4 className="card-title">Maintenance</h4>
          <p className="card-value">{maintenance}</p>
        </div>
      </div>

      <h3 className="section-title">Booking Summary</h3>
      <div className="section-style">
        <div className="card-style border-blue">
          <h4 className="card-title">Total Bookings</h4>
          <p className="card-value">{bookings.length}</p>
        </div>

        <div className="card-style border-green">
          <h4 className="card-title">Confirmed</h4>
          <p className="card-value">{confirmedBookings}</p>
        </div>

        <div className="card-style border-yellow">
          <h4 className="card-title">Pending</h4>
          <p className="card-value">{pendingBookings}</p>
        </div>

        <div className="card-style border-indigo">
          <h4 className="card-title">Completed</h4>
          <p className="card-value">{completedBookings}</p>
        </div>
      </div>

      <h3 className="section-title">User Summary</h3>
      <div className="section-style">
        <div className="card-style border-purple">
          <h4 className="card-title">Total Users</h4>
          <p className="card-value">{users.length}</p>
        </div>
      </div>

      {/* ===================== TASK 5 ===================== */}
      <DetailedReportsSection equipmentList={scopedEquipment} />
    </div>
  );
}

export default Reports;