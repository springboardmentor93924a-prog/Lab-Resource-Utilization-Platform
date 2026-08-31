import React, { useState } from "react";
import "./Reports.css";

const mockReportsData = {
  utilization: [
    { id: "REP-U01", equipment: "Oscilloscope (EQ001)", dept: "ECE", hours: 164, utilization: "82%", status: "Optimal" },
    { id: "REP-U02", equipment: "3D Printer (EQ003)", dept: "Mechanical", hours: 136, utilization: "68%", status: "Optimal" },
    { id: "REP-U03", equipment: "Digital Multimeter (EQ002)", dept: "ECE", hours: 70, utilization: "35%", status: "Under-utilized" },
    { id: "REP-U04", equipment: "Spectrometer (EQ005)", dept: "Physics", hours: 44, utilization: "22%", status: "Under-utilized" },
    { id: "REP-U05", equipment: "CNC Machine (EQ004)", dept: "Mechanical", hours: 36, utilization: "18%", status: "Critical" }
  ],
  maintenance: [
    { id: "REP-M01", equipment: "CNC Machine", type: "Scheduled Maintenance", cost: "₹18,000", date: "2026-08-15", status: "Completed" },
    { id: "REP-M02", equipment: "Oscilloscope", type: "Calibration Check", cost: "₹8,500", date: "2026-08-22", status: "Completed" },
    { id: "REP-M03", equipment: "Spectrometer", type: "Sensor Alignment", cost: "₹12,000", date: "2026-08-28", status: "In Progress" },
    { id: "REP-M04", equipment: "3D Printer", type: "Extruder Replacement", cost: "₹7,500", date: "2026-08-30", status: "Pending" }
  ],
  cost: [
    { id: "REP-C01", department: "ECE", usageCost: "₹1,20,000", maintenanceCost: "₹24,500", total: "₹1,44,500", billable: "₹45,000" },
    { id: "REP-C02", department: "Mechanical", usageCost: "₹95,000", maintenanceCost: "₹18,000", total: "₹1,13,000", billable: "₹32,000" },
    { id: "REP-C03", department: "Physics", usageCost: "₹52,000", maintenanceCost: "₹12,000", total: "₹64,000", billable: "₹14,000" }
  ],
  sharing: [
    { id: "REP-S01", partner: "Partner Research Institute", equipment: "Oscilloscope", hours: 48, revenue: "₹28,800", status: "Active" },
    { id: "REP-S02", partner: "Engineering Research Center", equipment: "3D Printer", hours: 64, revenue: "₹38,400", status: "Active" },
    { id: "REP-S03", partner: "Central Science University", equipment: "Spectrometer", hours: 32, revenue: "₹19,200", status: "Completed" }
  ]
};

function Reports() {
  const [activeTab, setActiveTab] = useState("utilization");
  const [timeRange, setTimeRange] = useState("30days");

  const equipmentStats = { total: 5, available: 3, inUse: 1, maintenance: 1 };
  const bookingStats = { total: 5, pending: 2, approved: 2, completed: 1 };
  const userStats = { total: 6, active: 6 };

  const utilization = Math.round(
    ((equipmentStats.inUse + equipmentStats.maintenance) / equipmentStats.total) * 100
  );

  const handleExport = (format) => {
    alert(`Exporting ${activeTab.toUpperCase()} Report as ${format.toUpperCase()} file...`);
  };

  return (
    <div style={{ padding: "30px 34px", background: "#f6f8fc", minHeight: "100%", boxSizing: "border-box" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "26px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em", color: "#2563eb", textTransform: "uppercase" }}>
            Milestone 3 Reports
          </span>
          <h1 style={{ margin: "4px 0 0", fontSize: "28px", fontWeight: 700, color: "#172b4d" }}>
            Utilization & Cost Reports
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#718096" }}>
            Generate, view, and export detailed analytical records for lab assets
          </p>
        </div>

        {/* EXPORT BUTTONS */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => handleExport("pdf")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              border: "1px solid #fca5a5",
              background: "#fef2f2",
              color: "#dc2626"
            }}
          >
            📄 Export PDF
          </button>
          <button
            onClick={() => handleExport("excel")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              border: "1px solid #86efac",
              background: "#f0fdf4",
              color: "#16a34a"
            }}
          >
            📊 Export Excel
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <SummaryCard icon="▣" title="Total Equipment" value={equipmentStats.total} subtitle={`${equipmentStats.available} available`} background="#eaf2ff" color="#2563eb" />
        <SummaryCard icon="◷" title="Total Bookings" value={bookingStats.total} subtitle={`${bookingStats.pending} pending`} background="#fff4df" color="#b56a00" />
        <SummaryCard icon="●" title="Total Users" value={userStats.total} subtitle={`${userStats.active} active`} background="#e9f8ef" color="#16834b" />
        <SummaryCard icon="↗" title="Utilization" value={`${utilization}%`} subtitle="Current resource usage" background="#eee9ff" color="#6941c6" />
      </div>

      {/* FILTER & TABS BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", background: "#ffffff", padding: "10px 16px", borderRadius: "8px", border: "1px solid #e4e8ef" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { id: "utilization", label: "Utilization Report" },
            { id: "maintenance", label: "Maintenance Log" },
            { id: "cost", label: "Cost & Billing" },
            { id: "sharing", label: "Resource Sharing" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 600,
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                background: activeTab === tab.id ? "#eff6ff" : "transparent",
                color: activeTab === tab.id ? "#2563eb" : "#64748b"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          style={{ height: "36px", border: "1px solid #d9dfe8", borderRadius: "6px", padding: "0 10px", fontSize: "13px", color: "#334155" }}
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* ITEMIZIED DATA TABLES */}
      <div style={{ background: "white", border: "1px solid #e4e8ef", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(20, 40, 70, 0.04)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textStyle: "left", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#475569" }}>Report ID</th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#475569" }}>
                {activeTab === "cost" ? "Department" : activeTab === "sharing" ? "Partner Institution" : "Equipment"}
              </th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#475569" }}>
                {activeTab === "utilization" ? "Department" : activeTab === "maintenance" ? "Service Type" : activeTab === "cost" ? "Usage Cost" : "Shared Asset"}
              </th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#475569" }}>
                {activeTab === "utilization" ? "Usage Hours" : activeTab === "maintenance" ? "Date" : activeTab === "cost" ? "Maintenance Cost" : "Total Hours"}
              </th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#475569" }}>
                {activeTab === "utilization" ? "Utilization %" : activeTab === "maintenance" ? "Cost" : activeTab === "cost" ? "Total Spending" : "Revenue"}
              </th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#475569" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockReportsData[activeTab].map((row) => (
              <tr key={row.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "14px 16px" }}><code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>{row.id}</code></td>
                <td style={{ padding: "14px 16px", fontWeight: 600 }}>{row.equipment || row.department || row.partner}</td>
                <td style={{ padding: "14px 16px" }}>{row.dept || row.type || row.usageCost || row.equipment}</td>
                <td style={{ padding: "14px 16px" }}>{row.hours ? `${row.hours} hrs` : row.date || row.maintenanceCost}</td>
                <td style={{ padding: "14px 16px", fontWeight: 600, color: "#2563eb" }}>{row.utilization || row.cost || row.total || row.revenue}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, background: "#dcfce7", color: "#15803d" }}>
                    {row.status || "Verified"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ icon, title, value, subtitle, background, color }) {
  return (
    <div style={{ background: "white", border: "1px solid #e4e8ef", borderRadius: "12px", padding: "18px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 2px 8px rgba(20, 40, 70, 0.04)" }}>
      <div style={{ width: "42px", height: "42px", borderRadius: "9px", background, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", fontWeight: 700, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: "0 0 4px", color: "#718096", fontSize: "12px" }}>{title}</p>
        <h2 style={{ margin: "0 0 3px", fontSize: "23px", color: "#172b4d" }}>{value}</h2>
        <p style={{ margin: 0, color: "#8792a3", fontSize: "10px" }}>{subtitle}</p>
      </div>
    </div>
  );
}

export default Reports;