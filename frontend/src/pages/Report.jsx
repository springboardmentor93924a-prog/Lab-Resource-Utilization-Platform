import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getAllEquipment,
  getUtilizationCostReport,
} from "../services/equipmentService";

import { getDepartmentUsageReport } from "../services/bookingService";
import { getMaintenanceDowntimeReport } from "../services/workOrderService";

import {
  getInterInstitutionSharingReport,
} from "../services/sharingService";

import { isAdmin } from "../utils/auth";

import "./Report.css";

export default function Reports() {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [reportType, setReportType] = useState("equipment");

  const [equipmentRows, setEquipmentRows] = useState([]);
  const [departmentRows, setDepartmentRows] = useState([]);
  const [maintenanceRows, setMaintenanceRows] = useState([]);
  const [sharingRows, setSharingRows] = useState([]);
  const [procurementRows, setProcurementRows] = useState([]);

  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  // =========================================================
  // RBAC
  // =========================================================

  useEffect(() => {
    if (!isAdmin()) {
      alert("You don't have permission to view reports.");
      navigate("/dashboard");
    }
  }, [navigate]);

  // =========================================================
  // GENERATE REPORT
  // =========================================================

  async function handleGenerate() {
    if (!from || !to) {
      alert("Please select both a start and end date.");
      return;
    }

    if (from > to) {
      alert("The From date cannot be after the To date.");
      return;
    }

    try {
      setLoading(true);
      setGenerated(false);

      // =====================================================
      // EQUIPMENT UTILIZATION
      // =====================================================

      if (reportType === "equipment") {
        const data = await getUtilizationCostReport(from, to);

        setEquipmentRows(data || []);
        setDepartmentRows([]);
        setMaintenanceRows([]);
        setSharingRows([]);
        setProcurementRows([]);
      }

      // =====================================================
      // DEPARTMENT USAGE
      // =====================================================

      else if (reportType === "department") {
        const data = await getDepartmentUsageReport(from, to);

        setDepartmentRows(data || []);
        setEquipmentRows([]);
        setMaintenanceRows([]);
        setSharingRows([]);
        setProcurementRows([]);
      }

      // =====================================================
      // MAINTENANCE
      // =====================================================

      else if (reportType === "maintenance") {
        const data = await getMaintenanceDowntimeReport(from, to);

        setMaintenanceRows(data || []);
        setEquipmentRows([]);
        setDepartmentRows([]);
        setSharingRows([]);
        setProcurementRows([]);
      }

      // =====================================================
      // INTER-INSTITUTION SHARING
      // =====================================================

      else if (reportType === "sharing") {
        const data =
          await getInterInstitutionSharingReport(from, to);

        setSharingRows(data || []);
        setEquipmentRows([]);
        setDepartmentRows([]);
        setMaintenanceRows([]);
        setProcurementRows([]);
      }

      // =====================================================
      // PROCUREMENT & COST
      // =====================================================

      else if (reportType === "procurement") {
        const data = await getAllEquipment();

        /*
         * Procurement report is based on purchaseDate.
         *
         * Only equipment having a purchase date inside
         * the selected date range will be included.
         */

        const filteredData = (data || []).filter((equipment) => {
          if (!equipment.purchaseDate) {
            return false;
          }

          return (
            equipment.purchaseDate >= from &&
            equipment.purchaseDate <= to
          );
        });

        setProcurementRows(filteredData);

        setEquipmentRows([]);
        setDepartmentRows([]);
        setMaintenanceRows([]);
        setSharingRows([]);
      }

      setGenerated(true);

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Failed to generate report."
      );

    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // DOWNLOAD REPORT
  // =========================================================

  async function handleDownload() {
    if (!from || !to) {
      alert("Please select both a start and end date.");
      return;
    }

    if (from > to) {
      alert("The From date cannot be after the To date.");
      return;
    }

    try {
      // Equipment Utilization already has a backend CSV endpoint.
      if (reportType === "equipment") {
        const { downloadUtilizationCostReportCsv } =
          await import("../services/equipmentService");
        await downloadUtilizationCostReportCsv(from, to);
        return;
      }

      let rows = [];
      let headers = [];
      let filename = "";

      // Department Usage
      if (reportType === "department") {
        rows = departmentRows;
        if (!generated) {
          rows = (await getDepartmentUsageReport(from, to)) || [];
        }
        headers = [
          "Department",
          "Total Bookings",
          "Usage Hours",
          "Equipment Count",
          "Utilization Rate",
        ];
        filename = "department_usage_report.csv";
      }

      // Maintenance & Downtime
      else if (reportType === "maintenance") {
        rows = maintenanceRows;
        if (!generated) {
          rows = (await getMaintenanceDowntimeReport(from, to)) || [];
        }
        headers = [
          "Equipment",
          "Total Work Orders",
          "Completed Work Orders",
          "In Progress Work Orders",
          "Downtime Minutes",
        ];
        filename = "maintenance_downtime_report.csv";
      }

      // Inter-Institution Sharing
      else if (reportType === "sharing") {
        rows = sharingRows;
        if (!generated) {
          rows = (await getInterInstitutionSharingReport(from, to)) || [];
        }
        headers = [
          "Requesting Institution",
          "Owning Institution",
          "Total Requests",
          "Approved Requests",
          "Rejected Requests",
          "Pending Requests",
          "Shared Equipment",
        ];
        filename = "inter_institution_sharing_report.csv";
      }

      // Procurement & Cost
      else if (reportType === "procurement") {
        rows = procurementRows;
        if (!generated) {
          const data = await getAllEquipment();
          rows = (data || []).filter((equipment) =>
            equipment.purchaseDate &&
            equipment.purchaseDate >= from &&
            equipment.purchaseDate <= to
          );
        }
        headers = [
          "Equipment",
          "Asset Tag",
          "Category",
          "Department",
          "Supplier",
          "Purchase Date",
          "Purchase Cost",
        ];
        filename = "procurement_cost_report.csv";
      } else {
        alert("CSV download is not available for this report.");
        return;
      }

      const csvHeader = headers.map(csvEscape).join(",");
      let csvRows = [];

      if (reportType === "department") {
        csvRows = rows.map((row) => [
          csvEscape(row.department),
          csvEscape(row.totalBookings ?? 0),
          csvEscape(row.usageHours ?? 0),
          csvEscape(row.equipmentCount ?? 0),
          csvEscape(
            row.utilizationRate !== null && row.utilizationRate !== undefined
              ? Number(row.utilizationRate).toFixed(1)
              : "0.0"
          ),
        ].join(","));
      } else if (reportType === "maintenance") {
        csvRows = rows.map((row) => [
          csvEscape(row.equipmentName || "Unknown Equipment"),
          csvEscape(row.totalWorkOrders ?? 0),
          csvEscape(row.completedWorkOrders ?? 0),
          csvEscape(row.inProgressWorkOrders ?? 0),
          csvEscape(row.totalDowntimeMinutes ?? 0),
        ].join(","));
      } else if (reportType === "sharing") {
        csvRows = rows.map((row) => [
          csvEscape(row.requestingInstitutionName || "Unknown Institution"),
          csvEscape(row.owningInstitutionName || "Unknown Institution"),
          csvEscape(row.totalRequests ?? 0),
          csvEscape(row.approvedRequests ?? 0),
          csvEscape(row.rejectedRequests ?? 0),
          csvEscape(row.pendingRequests ?? 0),
          csvEscape(row.sharedEquipment ?? 0),
        ].join(","));
      } else if (reportType === "procurement") {
        csvRows = rows.map((row) => [
          csvEscape(row.equipmentName),
          csvEscape(row.assetTag),
          csvEscape(row.category),
          csvEscape(row.department),
          csvEscape(row.supplier),
          csvEscape(row.purchaseDate || ""),
          csvEscape(row.purchaseCost ?? ""),
        ].join(","));
      }

      const csv = csvHeader + (csvRows.length ? "\n" + csvRows.join("\n") : "");
      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("CSV download error:", err);
      alert(
        err.response?.data?.message ||
        "Failed to download CSV."
      );
    }
  }
  // =========================================================
// DOWNLOAD EXCEL REPORT
// =========================================================

async function handleExcelDownload() {
  if (!from || !to) {
    alert("Please select both a start and end date.");
    return;
  }

  if (from > to) {
    alert("The From date cannot be after the To date.");
    return;
  }

  try {
    let rows = [];

    // =====================================================
    // GET DATA
    // =====================================================

    if (reportType === "equipment") {
      rows = equipmentRows;

      if (!generated) {
        rows = (await getUtilizationCostReport(from, to)) || [];
      }
    }

    else if (reportType === "department") {
      rows = departmentRows;

      if (!generated) {
        rows = (await getDepartmentUsageReport(from, to)) || [];
      }
    }

    else if (reportType === "maintenance") {
      rows = maintenanceRows;

      if (!generated) {
        rows = (await getMaintenanceDowntimeReport(from, to)) || [];
      }
    }

    else if (reportType === "sharing") {
      rows = sharingRows;

      if (!generated) {
        rows = (await getInterInstitutionSharingReport(from, to)) || [];
      }
    }

    else if (reportType === "procurement") {
      rows = procurementRows;

      if (!generated) {
        const data = await getAllEquipment();

        rows = (data || []).filter(
          (equipment) =>
            equipment.purchaseDate &&
            equipment.purchaseDate >= from &&
            equipment.purchaseDate <= to
        );
      }
    }

    // =====================================================
    // PREPARE EXCEL DATA
    // =====================================================

    let excelData = [];
    let filename = "";

    // =====================================================
    // EQUIPMENT UTILIZATION
    // =====================================================

    if (reportType === "equipment") {
      excelData = rows.map((row) => ({
        "Equipment": row.equipmentName || "",
        "Category": row.category || "",
        "Total Bookings": Number(row.totalBookings || 0),
        "Usage Hours": Number(row.usageHours || 0),
        "Utilization (%)": Number(row.utilizationRate || 0),
        "Total Cost (₹)": Number(row.totalCost || 0),
      }));

      filename = "equipment_utilization_report.xlsx";
    }

    // =====================================================
    // DEPARTMENT USAGE
    // =====================================================

    else if (reportType === "department") {
      excelData = rows.map((row) => ({
        "Department": row.department || "Unknown",
        "Total Bookings": Number(row.totalBookings || 0),
        "Usage Hours": Number(row.usageHours || 0),
        "Equipment Count": Number(row.equipmentCount || 0),
        "Utilization (%)": Number(row.utilizationRate || 0),
      }));

      filename = "department_usage_report.xlsx";
    }

    // =====================================================
    // MAINTENANCE & DOWNTIME
    // =====================================================

    else if (reportType === "maintenance") {
      excelData = rows.map((row) => ({
        "Equipment": row.equipmentName || "Unknown Equipment",
        "Total Work Orders": Number(row.totalWorkOrders || 0),
        "Completed Work Orders": Number(
          row.completedWorkOrders || 0
        ),
        "In Progress Work Orders": Number(
          row.inProgressWorkOrders || 0
        ),
        "Downtime Minutes": Number(
          row.totalDowntimeMinutes || 0
        ),
      }));

      filename = "maintenance_downtime_report.xlsx";
    }

    // =====================================================
    // INTER-INSTITUTION SHARING
    // =====================================================

    else if (reportType === "sharing") {
      excelData = rows.map((row) => ({
        "Requesting Institution":
          row.requestingInstitutionName ||
          "Unknown Institution",

        "Owning Institution":
          row.owningInstitutionName ||
          "Unknown Institution",

        "Total Requests":
          Number(row.totalRequests || 0),

        "Approved Requests":
          Number(row.approvedRequests || 0),

        "Rejected Requests":
          Number(row.rejectedRequests || 0),

        "Pending Requests":
          Number(row.pendingRequests || 0),

        "Shared Equipment":
          Number(row.sharedEquipment || 0),
      }));

      filename = "inter_institution_sharing_report.xlsx";
    }

    // =====================================================
    // PROCUREMENT & COST
    // =====================================================

    else if (reportType === "procurement") {
      excelData = rows.map((row) => ({
        "Equipment":
          row.equipmentName || "Unknown Equipment",

        "Asset Tag":
          row.assetTag || "",

        "Category":
          row.category || "",

        "Department":
          row.department || "",

        "Supplier":
          row.supplier || "Not specified",

        "Purchase Date":
          row.purchaseDate || "",

        "Purchase Cost (₹)":
          Number(row.purchaseCost || 0),
      }));

      filename = "procurement_cost_report.xlsx";
    }

    // =====================================================
    // CREATE WORKBOOK
    // =====================================================

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [];

    if (excelData.length > 0) {
      const headers = Object.keys(excelData[0]);

      headers.forEach((header) => {
        let maxLength = header.length;

        excelData.forEach((row) => {
          const value = row[header];

          if (value !== null && value !== undefined) {
            maxLength = Math.max(
              maxLength,
              String(value).length
            );
          }
        });

        columnWidths.push({
          wch: Math.min(maxLength + 3, 40),
        });
      });

      worksheet["!cols"] = columnWidths;
    }

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Report"
    );

    // =====================================================
    // DOWNLOAD
    // =====================================================

    XLSX.writeFile(workbook, filename);

  } catch (err) {

    console.error(
      "Excel download error:",
      err
    );

    alert(
      err.response?.data?.message ||
      "Failed to download Excel report."
    );
  }
}

  // =========================================================
  // DOWNLOAD PDF REPORT
  // =========================================================

  async function handlePdfDownload() {
    if (!from || !to) {
      alert("Please select both a start and end date.");
      return;
    }

    if (from > to) {
      alert("The From date cannot be after the To date.");
      return;
    }

    try {
      let rows = [];

      if (reportType === "equipment") {
        rows = equipmentRows;
        if (!generated) {
          rows = (await getUtilizationCostReport(from, to)) || [];
        }
      } else if (reportType === "department") {
        rows = departmentRows;
        if (!generated) {
          rows = (await getDepartmentUsageReport(from, to)) || [];
        }
      } else if (reportType === "maintenance") {
        rows = maintenanceRows;
        if (!generated) {
          rows = (await getMaintenanceDowntimeReport(from, to)) || [];
        }
      } else if (reportType === "sharing") {
        rows = sharingRows;
        if (!generated) {
          rows = (await getInterInstitutionSharingReport(from, to)) || [];
        }
      } else if (reportType === "procurement") {
        rows = procurementRows;
        if (!generated) {
          const data = await getAllEquipment();
          rows = (data || []).filter(
            (equipment) =>
              equipment.purchaseDate &&
              equipment.purchaseDate >= from &&
              equipment.purchaseDate <= to
          );
        }
      }

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      let title = "";
      let head = [];
      let body = [];

      if (reportType === "equipment") {
        title = "Equipment Utilization & Cost Report";
        head = [[
          "Equipment", "Category", "Bookings",
          "Usage Hours", "Utilization (%)", "Total Cost (₹)"
        ]];
        body = rows.map((row) => [
          row.equipmentName || "",
          row.category || "General",
          Number(row.totalBookings || 0),
          Number(row.usageHours || 0),
          Number(row.utilizationRate || 0).toFixed(1),
          Number(row.totalCost || 0).toFixed(2),
        ]);
      } else if (reportType === "department") {
        title = "Department Usage Report";
        head = [[
          "Department", "Total Bookings", "Usage Hours",
          "Equipment Count", "Utilization (%)"
        ]];
        body = rows.map((row) => [
          row.department || "Unknown",
          Number(row.totalBookings || 0),
          Number(row.usageHours || 0),
          Number(row.equipmentCount || 0),
          Number(row.utilizationRate || 0).toFixed(1),
        ]);
      } else if (reportType === "maintenance") {
        title = "Maintenance & Downtime Report";
        head = [[
          "Equipment", "Total Work Orders",
          "Completed", "In Progress", "Downtime"
        ]];
        body = rows.map((row) => [
          row.equipmentName || "Unknown Equipment",
          Number(row.totalWorkOrders || 0),
          Number(row.completedWorkOrders || 0),
          Number(row.inProgressWorkOrders || 0),
          formatDowntime(row.totalDowntimeMinutes),
        ]);
      } else if (reportType === "sharing") {
        title = "Inter-Institution Sharing Report";
        head = [[
          "Requesting Institution", "Owning Institution",
          "Total Requests", "Approved", "Rejected",
          "Pending", "Shared Equipment"
        ]];
        body = rows.map((row) => [
          row.requestingInstitutionName || "Unknown Institution",
          row.owningInstitutionName || "Unknown Institution",
          Number(row.totalRequests || 0),
          Number(row.approvedRequests || 0),
          Number(row.rejectedRequests || 0),
          Number(row.pendingRequests || 0),
          Number(row.sharedEquipment || 0),
        ]);
      } else if (reportType === "procurement") {
        title = "Procurement & Cost Report";
        head = [[
          "Equipment", "Asset Tag", "Category", "Department",
          "Supplier", "Purchase Date", "Purchase Cost (₹)"
        ]];
        body = rows.map((row) => [
          row.equipmentName || "Unknown Equipment",
          row.assetTag || "",
          row.category || "",
          row.department || "",
          row.supplier || "Not specified",
          row.purchaseDate || "-",
          Number(row.purchaseCost || 0).toFixed(2),
        ]);
      }

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(title, 14, 15);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Date Range: ${from} to ${to}`, 14, 22);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

      autoTable(doc, {
        startY: 34,
        head,
        body,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
          overflow: "linebreak",
        },
        headStyles: {
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
        margin: { left: 14, right: 14 },
      });

      const pageCount = doc.getNumberOfPages();

      for (let page = 1; page <= pageCount; page++) {
        doc.setPage(page);
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Laboratory Reports | Page ${page} of ${pageCount}`,
          14,
          pageHeight - 8
        );
      }

      const filenameMap = {
        equipment: "equipment_utilization_report.pdf",
        department: "department_usage_report.pdf",
        maintenance: "maintenance_downtime_report.pdf",
        sharing: "inter_institution_sharing_report.pdf",
        procurement: "procurement_cost_report.pdf",
      };

      doc.save(filenameMap[reportType] || "laboratory_report.pdf");

    } catch (err) {
      console.error("PDF download error:", err);
      alert(
        err.response?.data?.message ||
        "Failed to download PDF report."
      );
    }
  }

  // =========================================================
  // CSV ESCAPE HELPER
  // =========================================================

  function csvEscape(value) {
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    const stringValue = String(value);

    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  // =========================================================
  // EQUIPMENT SUMMARY CALCULATIONS
  // =========================================================

  const totalEquipment =
    equipmentRows.length;

  const totalBookings =
    equipmentRows.reduce(
      (sum, row) =>
        sum +
        Number(row.totalBookings || 0),
      0
    );

  const totalUsageHours =
    equipmentRows.reduce(
      (sum, row) =>
        sum +
        Number(row.usageHours || 0),
      0
    );

  const totalCost =
    equipmentRows.reduce(
      (sum, row) =>
        sum +
        Number(row.totalCost || 0),
      0
    );

  const averageUtilization =
    equipmentRows.length > 0
      ? (
          equipmentRows.reduce(
            (sum, row) =>
              sum +
              Number(
                row.utilizationRate || 0
              ),
            0
          ) / equipmentRows.length
        ).toFixed(1)
      : "0.0";

  // =========================================================
  // DEPARTMENT SUMMARY CALCULATIONS
  // =========================================================

  const totalDepartments =
    departmentRows.length;

  const totalDepartmentBookings =
    departmentRows.reduce(
      (sum, row) =>
        sum +
        Number(row.totalBookings || 0),
      0
    );

  const totalDepartmentUsage =
    departmentRows.reduce(
      (sum, row) =>
        sum +
        Number(row.usageHours || 0),
      0
    );

  const totalDepartmentEquipment =
    departmentRows.reduce(
      (sum, row) =>
        sum +
        Number(row.equipmentCount || 0),
      0
    );

  // =========================================================
  // MAINTENANCE SUMMARY CALCULATIONS
  // =========================================================

  const totalMaintenanceEquipment =
    maintenanceRows.length;

  const totalMaintenanceWorkOrders =
    maintenanceRows.reduce(
      (sum, row) =>
        sum +
        Number(row.totalWorkOrders || 0),
      0
    );

  const totalCompletedWorkOrders =
    maintenanceRows.reduce(
      (sum, row) =>
        sum +
        Number(row.completedWorkOrders || 0),
      0
    );

  const totalInProgressWorkOrders =
    maintenanceRows.reduce(
      (sum, row) =>
        sum +
        Number(row.inProgressWorkOrders || 0),
      0
    );

  const totalDowntimeMinutes =
    maintenanceRows.reduce(
      (sum, row) =>
        sum +
        Number(row.totalDowntimeMinutes || 0),
      0
    );

  const formatDowntime = (minutes) => {
    const totalMinutes =
      Number(minutes || 0);

    const hours =
      Math.floor(totalMinutes / 60);

    const remainingMinutes =
      totalMinutes % 60;

    if (hours === 0) {
      return `${remainingMinutes} min`;
    }

    return `${hours}h ${remainingMinutes}m`;
  };

  // =========================================================
  // SHARING SUMMARY CALCULATIONS
  // =========================================================

  const totalSharingRequests =
    sharingRows.reduce(
      (sum, row) =>
        sum +
        Number(row.totalRequests || 0),
      0
    );

  const totalApprovedSharingRequests =
    sharingRows.reduce(
      (sum, row) =>
        sum +
        Number(row.approvedRequests || 0),
      0
    );

  const totalRejectedSharingRequests =
    sharingRows.reduce(
      (sum, row) =>
        sum +
        Number(row.rejectedRequests || 0),
      0
    );

  const totalPendingSharingRequests =
    sharingRows.reduce(
      (sum, row) =>
        sum +
        Number(row.pendingRequests || 0),
      0
    );

  const totalSharedEquipment =
    sharingRows.reduce(
      (sum, row) =>
        sum +
        Number(row.sharedEquipment || 0),
      0
    );

  // =========================================================
  // PROCUREMENT SUMMARY CALCULATIONS
  // =========================================================

  const totalProcurementEquipment =
    procurementRows.length;

  const totalProcurementCost =
    procurementRows.reduce(
      (sum, row) =>
        sum +
        Number(row.purchaseCost || 0),
      0
    );

  const averagePurchaseCost =
    totalProcurementEquipment > 0
      ? totalProcurementCost /
        totalProcurementEquipment
      : 0;

  const highestPurchaseCost =
    procurementRows.length > 0
      ? Math.max(
          ...procurementRows.map(
            (row) =>
              Number(row.purchaseCost || 0)
          )
        )
      : 0;

  const procurementWithSupplier =
    procurementRows.filter(
      (row) =>
        row.supplier &&
        row.supplier.trim() !== ""
    ).length;

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="reports-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">
        <Sidebar />
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="reports-content">

        {/* ===================================================
            HEADER
        =================================================== */}

        <section className="reports-header">

          <div className="reports-title-wrapper">

            <div className="reports-icon">
              ✦
            </div>

            <div>

              <h1>
                Reports & Analytics
              </h1>

              <p>
                Generate insights about laboratory
                resources, utilization and costs.
              </p>

            </div>

          </div>

        </section>


        {/* ===================================================
            REPORT TYPES
        =================================================== */}

        <section className="report-types">

          {/* EQUIPMENT */}

          <div
            className={`report-type-card ${
              reportType === "equipment"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setReportType("equipment")
            }
          >

            <div className="report-type-icon blue">
              📊
            </div>

            <div>

              <h3>
                Equipment Utilization
              </h3>

              <p>
                Usage, bookings, utilization
                and operating cost.
              </p>

            </div>

            <span className="active-badge">
              Available
            </span>

          </div>


          {/* DEPARTMENT */}

          <div
            className={`report-type-card ${
              reportType === "department"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setReportType("department")
            }
          >

            <div className="report-type-icon purple">
              🏢
            </div>

            <div>

              <h3>
                Department Usage
              </h3>

              <p>
                Analyze department and
                resource usage.
              </p>

            </div>

            <span className="active-badge">
              Available
            </span>

          </div>


          {/* MAINTENANCE */}

          <div
            className={`report-type-card ${
              reportType === "maintenance"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setReportType("maintenance")
            }
          >

            <div className="report-type-icon orange">
              🛠
            </div>

            <div>

              <h3>
                Maintenance & Downtime
              </h3>

              <p>
                Maintenance activity,
                downtime and service history.
              </p>

            </div>

            <span className="active-badge">
              Available
            </span>

          </div>


          {/* SHARING */}

          <div
            className={`report-type-card ${
              reportType === "sharing"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setReportType("sharing")
            }
          >

            <div className="report-type-icon cyan">
              🔗
            </div>

            <div>

              <h3>
                Inter-Institution Sharing
              </h3>

              <p>
                Shared equipment and
                cross-institution usage.
              </p>

            </div>

            <span className="active-badge">
              Available
            </span>

          </div>


          {/* PROCUREMENT */}

          <div
            className={`report-type-card ${
              reportType === "procurement"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setReportType("procurement")
            }
          >

            <div className="report-type-icon green">
              💰
            </div>

            <div>

              <h3>
                Procurement & Cost
              </h3>

              <p>
                Procurement and cost
                analysis reports.
              </p>

            </div>

            <span className="active-badge">
              Available
            </span>

          </div>

        </section>


        {/* ===================================================
            REPORT GENERATOR
        =================================================== */}

        <section className="report-generator">

          <div className="generator-heading">

            <div className="generator-icon">
              ⚡
            </div>

            <div>

              <h2>
                Laboratory Reports
              </h2>

              <p>
                Select a report type and date
                range to generate insights.
              </p>

            </div>

          </div>


          <div className="generator-controls">

            {/* REPORT TYPE */}

            <div className="date-field report-select-field">

              <label>
                REPORT TYPE
              </label>

              <select
                value={reportType}
                onChange={(e) =>
                  setReportType(e.target.value)
                }
              >

                <option value="equipment">
                  Equipment Utilization & Cost
                </option>

                <option value="department">
                  Department Usage
                </option>

                <option value="maintenance">
                  Maintenance & Downtime
                </option>

                <option value="sharing">
                  Inter-Institution Sharing
                </option>

                <option value="procurement">
                  Procurement & Cost
                </option>

              </select>

            </div>


            {/* FROM */}

            <div className="date-field">

              <label>
                FROM DATE
              </label>

              <input
                type="date"
                value={from}
                onChange={(e) =>
                  setFrom(e.target.value)
                }
              />

            </div>


            {/* TO */}

            <div className="date-field">

              <label>
                TO DATE
              </label>

              <input
                type="date"
                value={to}
                onChange={(e) =>
                  setTo(e.target.value)
                }
              />

            </div>


            {/* GENERATE */}

            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={loading}
            >

              <span>
                {loading ? "⏳" : "✦"}
              </span>

              {loading
                ? "Generating..."
                : "Generate Report"}

            </button>


            {/* DOWNLOAD */}

            <div
              className="download-buttons"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <button
                className="download-btn"
                style={{ marginRight: "10px" }}
                onClick={handleDownload}
                disabled={loading}
              >
                📥 Download CSV
              </button>

              <button
                className="download-btn excel-download-btn"
                style={{ marginRight: "10px" }}
                onClick={handleExcelDownload}
                disabled={loading}
              >
                📊 Download Excel
              </button>

              <button
                className="download-btn pdf-download-btn"
                onClick={handlePdfDownload}
                disabled={loading}
              >
                📄 Download PDF
              </button>
            </div>

          </div>

        </section>


        {/* ===================================================
            EQUIPMENT SUMMARY
        =================================================== */}

        {generated &&
          reportType === "equipment" && (

          <section className="summary-grid">

            <div className="summary-card blue-card">

              <div className="summary-card-icon">
                🧪
              </div>

              <div>

                <span>
                  EQUIPMENT
                </span>

                <strong>
                  {totalEquipment}
                </strong>

                <small>
                  equipment analyzed
                </small>

              </div>

            </div>


            <div className="summary-card purple-card">

              <div className="summary-card-icon">
                📅
              </div>

              <div>

                <span>
                  BOOKINGS
                </span>

                <strong>
                  {totalBookings}
                </strong>

                <small>
                  total bookings
                </small>

              </div>

            </div>


            <div className="summary-card cyan-card">

              <div className="summary-card-icon">
                ⏱
              </div>

              <div>

                <span>
                  USAGE HOURS
                </span>

                <strong>
                  {totalUsageHours}
                </strong>

                <small>
                  total equipment usage
                </small>

              </div>

            </div>


            <div className="summary-card green-card">

              <div className="summary-card-icon">
                💰
              </div>

              <div>

                <span>
                  TOTAL COST
                </span>

                <strong>
                  ₹{totalCost.toFixed(2)}
                </strong>

                <small>
                  estimated usage cost
                </small>

              </div>

            </div>

          </section>

        )}


        {/* ===================================================
            DEPARTMENT SUMMARY
        =================================================== */}

        {generated &&
          reportType === "department" && (

          <section className="summary-grid">

            <div className="summary-card purple-card">

              <div className="summary-card-icon">
                🏢
              </div>

              <div>

                <span>
                  DEPARTMENTS
                </span>

                <strong>
                  {totalDepartments}
                </strong>

                <small>
                  departments analyzed
                </small>

              </div>

            </div>


            <div className="summary-card blue-card">

              <div className="summary-card-icon">
                📅
              </div>

              <div>

                <span>
                  BOOKINGS
                </span>

                <strong>
                  {totalDepartmentBookings}
                </strong>

                <small>
                  department bookings
                </small>

              </div>

            </div>


            <div className="summary-card cyan-card">

              <div className="summary-card-icon">
                ⏱
              </div>

              <div>

                <span>
                  USAGE HOURS
                </span>

                <strong>
                  {totalDepartmentUsage}
                </strong>

                <small>
                  total department usage
                </small>

              </div>

            </div>


            <div className="summary-card green-card">

              <div className="summary-card-icon">
                🧪
              </div>

              <div>

                <span>
                  EQUIPMENT
                </span>

                <strong>
                  {totalDepartmentEquipment}
                </strong>

                <small>
                  equipment resources
                </small>

              </div>

            </div>

          </section>

        )}


        {/* ===================================================
            MAINTENANCE SUMMARY
        =================================================== */}

        {generated &&
          reportType === "maintenance" && (

          <section className="summary-grid">

            <div className="summary-card orange-card">

              <div className="summary-card-icon">
                🛠
              </div>

              <div>

                <span>
                  EQUIPMENT
                </span>

                <strong>
                  {totalMaintenanceEquipment}
                </strong>

                <small>
                  equipment with maintenance activity
                </small>

              </div>

            </div>


            <div className="summary-card blue-card">

              <div className="summary-card-icon">
                📋
              </div>

              <div>

                <span>
                  WORK ORDERS
                </span>

                <strong>
                  {totalMaintenanceWorkOrders}
                </strong>

                <small>
                  total maintenance work orders
                </small>

              </div>

            </div>


            <div className="summary-card green-card">

              <div className="summary-card-icon">
                ✓
              </div>

              <div>

                <span>
                  COMPLETED
                </span>

                <strong>
                  {totalCompletedWorkOrders}
                </strong>

                <small>
                  completed work orders
                </small>

              </div>

            </div>


            <div className="summary-card purple-card">

              <div className="summary-card-icon">
                ⏱
              </div>

              <div>

                <span>
                  DOWNTIME
                </span>

                <strong>
                  {formatDowntime(
                    totalDowntimeMinutes
                  )}
                </strong>

                <small>
                  {totalInProgressWorkOrders}
                  {" "}work orders in progress
                </small>

              </div>

            </div>

          </section>

        )}


        {/* ===================================================
            SHARING SUMMARY
        =================================================== */}

        {generated &&
          reportType === "sharing" && (

          <section className="summary-grid">

            <div className="summary-card cyan-card">

              <div className="summary-card-icon">
                🔗
              </div>

              <div>

                <span>
                  TOTAL REQUESTS
                </span>

                <strong>
                  {totalSharingRequests}
                </strong>

                <small>
                  cross-institution requests
                </small>

              </div>

            </div>


            <div className="summary-card green-card">

              <div className="summary-card-icon">
                ✓
              </div>

              <div>

                <span>
                  APPROVED
                </span>

                <strong>
                  {totalApprovedSharingRequests}
                </strong>

                <small>
                  approved requests
                </small>

              </div>

            </div>


            <div className="summary-card orange-card">

              <div className="summary-card-icon">
                ✕
              </div>

              <div>

                <span>
                  REJECTED
                </span>

                <strong>
                  {totalRejectedSharingRequests}
                </strong>

                <small>
                  rejected requests
                </small>

              </div>

            </div>


            <div className="summary-card purple-card">

              <div className="summary-card-icon">
                ⏳
              </div>

              <div>

                <span>
                  PENDING
                </span>

                <strong>
                  {totalPendingSharingRequests}
                </strong>

                <small>
                  pending requests
                </small>

              </div>

            </div>

          </section>

        )}


        {/* ===================================================
            PROCUREMENT SUMMARY
        =================================================== */}

        {generated &&
          reportType === "procurement" && (

          <section className="summary-grid">

            {/* EQUIPMENT PROCURED */}

            <div className="summary-card blue-card">

              <div className="summary-card-icon">
                🧪
              </div>

              <div>

                <span>
                  EQUIPMENT PROCURED
                </span>

                <strong>
                  {totalProcurementEquipment}
                </strong>

                <small>
                  equipment purchased
                </small>

              </div>

            </div>


            {/* TOTAL PROCUREMENT COST */}

            <div className="summary-card green-card">

              <div className="summary-card-icon">
                💰
              </div>

              <div>

                <span>
                  TOTAL PROCUREMENT COST
                </span>

                <strong>
                  ₹{totalProcurementCost.toFixed(2)}
                </strong>

                <small>
                  total purchase expenditure
                </small>

              </div>

            </div>


            {/* AVERAGE COST */}

            <div className="summary-card purple-card">

              <div className="summary-card-icon">
                📊
              </div>

              <div>

                <span>
                  AVERAGE PURCHASE COST
                </span>

                <strong>
                  ₹{averagePurchaseCost.toFixed(2)}
                </strong>

                <small>
                  average cost per equipment
                </small>

              </div>

            </div>


            {/* HIGHEST COST */}

            <div className="summary-card cyan-card">

              <div className="summary-card-icon">
                📈
              </div>

              <div>

                <span>
                  HIGHEST PURCHASE COST
                </span>

                <strong>
                  ₹{highestPurchaseCost.toFixed(2)}
                </strong>

                <small>
                  highest individual purchase
                </small>

              </div>

            </div>

          </section>

        )}


        {/* ===================================================
            EQUIPMENT UTILIZATION OVERVIEW
        =================================================== */}

        {generated &&
          reportType === "equipment" &&
          equipmentRows.length > 0 && (

          <section className="utilization-overview">

            <div className="overview-heading">

              <div>

                <h2>
                  Utilization Overview
                </h2>

                <p>
                  Equipment performance during
                  the selected period.
                </p>

              </div>

              <div className="average-utilization">

                <span>
                  Average Utilization
                </span>

                <strong>
                  {averageUtilization}%
                </strong>

              </div>

            </div>


            <div className="utilization-list">

              {equipmentRows.map((row) => (

                <div
                  className="utilization-item"
                  key={row.equipmentId}
                >

                  <div className="equipment-info">

                    <div className="equipment-mini-icon">
                      ⚙
                    </div>

                    <div>

                      <strong>
                        {row.equipmentName}
                      </strong>

                      <span>
                        {row.category ||
                          "Equipment"}
                      </span>

                    </div>

                  </div>


                  <div className="utilization-bar-wrapper">

                    <div className="utilization-bar">

                      <div
                        className="utilization-fill"
                        style={{
                          width: `${Math.min(
                            Number(
                              row.utilizationRate ||
                                0
                            ),
                            100
                          )}%`,
                        }}
                      />

                    </div>

                    <span>
                      {row.utilizationRate}%
                    </span>

                  </div>

                </div>

              ))}

            </div>

          </section>

        )}


        {/* ===================================================
            EQUIPMENT REPORT TABLE
        =================================================== */}

        {generated &&
          reportType === "equipment" && (

          <section className="report-table-card">

            <div className="table-header">

              <div>

                <h2>
                  Equipment Utilization & Cost
                </h2>

                <p>
                  Equipment usage and cost
                  breakdown.
                </p>

              </div>

              <div className="date-range-display">
                📅 {from} → {to}
              </div>

            </div>


            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      EQUIPMENT
                    </th>

                    <th>
                      CATEGORY
                    </th>

                    <th>
                      BOOKINGS
                    </th>

                    <th>
                      USAGE HOURS
                    </th>

                    <th>
                      UTILIZATION
                    </th>

                    <th>
                      COST
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {equipmentRows.length === 0 ? (

                    <tr>

                      <td
                        colSpan="6"
                        className="empty-row"
                      >

                        <div>
                          ✦
                        </div>

                        No equipment data
                        available for this
                        date range.

                      </td>

                    </tr>

                  ) : (

                    equipmentRows.map((row) => (

                      <tr
                        key={row.equipmentId}
                      >

                        <td>

                          <div className="table-equipment">

                            <div>
                              ⚙
                            </div>

                            <strong>
                              {row.equipmentName}
                            </strong>

                          </div>

                        </td>


                        <td>

                          <span className="category-badge">

                            {row.category ||
                              "General"}

                          </span>

                        </td>


                        <td>
                          {row.totalBookings}
                        </td>


                        <td>
                          {row.usageHours}
                        </td>


                        <td>

                          <span className="utilization-badge">
                            {row.utilizationRate}%
                          </span>

                        </td>


                        <td>

                          <strong className="cost-value">
                            ₹
                            {Number(
                              row.totalCost || 0
                            ).toFixed(2)}
                          </strong>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          </section>

        )}


        {/* ===================================================
            DEPARTMENT USAGE REPORT
        =================================================== */}

        {generated &&
          reportType === "department" && (

          <section className="report-table-card department-report-card">

            <div className="table-header">

              <div>

                <h2>
                  🏢 Department / Resource Usage
                </h2>

                <p>
                  Department-level equipment
                  usage and resource utilization.
                </p>

              </div>

              <div className="department-summary-badge">
                {totalDepartments} Departments
              </div>

            </div>


            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      DEPARTMENT
                    </th>

                    <th>
                      TOTAL BOOKINGS
                    </th>

                    <th>
                      USAGE HOURS
                    </th>

                    <th>
                      EQUIPMENT
                    </th>

                    <th>
                      UTILIZATION
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {departmentRows.length === 0 ? (

                    <tr>

                      <td
                        colSpan="5"
                        className="empty-row"
                      >

                        <div>
                          🏢
                        </div>

                        No department usage
                        data available for this
                        date range.

                      </td>

                    </tr>

                  ) : (

                    departmentRows.map(
                      (row, index) => (

                        <tr
                          key={
                            row.department ||
                            index
                          }
                        >

                          <td>

                            <div className="table-department">

                              <div className="department-icon">
                                🏢
                              </div>

                              <strong>
                                {row.department ||
                                  "Unknown"}
                              </strong>

                            </div>

                          </td>


                          <td>
                            {row.totalBookings}
                          </td>


                          <td>
                            {row.usageHours}
                          </td>


                          <td>
                            {row.equipmentCount}
                          </td>


                          <td>

                            <span className="department-utilization-badge">

                              {Number(
                                row.utilizationRate ||
                                  0
                              ).toFixed(1)}
                              %

                            </span>

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>


            {departmentRows.length > 0 && (

              <div className="department-footer">

                <span>
                  📊
                </span>

                {totalDepartmentEquipment}
                {" "}equipment distributed across{" "}
                {totalDepartments}
                {" "}departments.

              </div>

            )}

          </section>

        )}


        {/* ===================================================
            MAINTENANCE & DOWNTIME REPORT
        =================================================== */}

        {generated &&
          reportType === "maintenance" && (

          <section className="report-table-card maintenance-report-card">

            <div className="table-header">

              <div>

                <h2>
                  🛠 Maintenance / Downtime
                </h2>

                <p>
                  Maintenance activity, work
                  orders and equipment downtime.
                </p>

              </div>

              <div className="date-range-display">
                📅 {from} → {to}
              </div>

            </div>


            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      EQUIPMENT
                    </th>

                    <th>
                      TOTAL WORK ORDERS
                    </th>

                    <th>
                      COMPLETED
                    </th>

                    <th>
                      IN PROGRESS
                    </th>

                    <th>
                      DOWNTIME
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {maintenanceRows.length === 0 ? (

                    <tr>

                      <td
                        colSpan="5"
                        className="empty-row"
                      >

                        <div>
                          🛠
                        </div>

                        No maintenance data
                        available for this
                        date range.

                      </td>

                    </tr>

                  ) : (

                    maintenanceRows.map((row) => (

                      <tr
                        key={row.equipmentId}
                      >

                        <td>

                          <div className="table-equipment">

                            <div>
                              🛠
                            </div>

                            <strong>
                              {row.equipmentName ||
                                "Unknown Equipment"}
                            </strong>

                          </div>

                        </td>


                        <td>
                          {Number(
                            row.totalWorkOrders ||
                              0
                          )}
                        </td>


                        <td>

                          <span className="maintenance-status-badge completed">

                            {Number(
                              row.completedWorkOrders ||
                                0
                            )}

                          </span>

                        </td>


                        <td>

                          <span className="maintenance-status-badge progress">

                            {Number(
                              row.inProgressWorkOrders ||
                                0
                            )}

                          </span>

                        </td>


                        <td>

                          <strong className="downtime-value">

                            {formatDowntime(
                              row.totalDowntimeMinutes
                            )}

                          </strong>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>


            {maintenanceRows.length > 0 && (

              <div className="department-footer">

                <span>
                  🛠
                </span>

                {totalMaintenanceWorkOrders}
                {" "}work orders across{" "}
                {totalMaintenanceEquipment}
                {" "}equipment resources, with{" "}
                {formatDowntime(
                  totalDowntimeMinutes
                )}
                {" "}total downtime.

              </div>

            )}

          </section>

        )}


        {/* ===================================================
            INTER-INSTITUTION SHARING REPORT
        =================================================== */}

        {generated &&
          reportType === "sharing" && (

          <section className="report-table-card sharing-report-card">

            <div className="table-header">

              <div>

                <h2>
                  🔗 Inter-Institution Sharing
                </h2>

                <p>
                  Cross-institution equipment
                  sharing and access request activity.
                </p>

              </div>

              <div className="date-range-display">
                📅 {from} → {to}
              </div>

            </div>


            {sharingRows.length > 0 && (

              <div className="department-footer">

                <span>
                  🔗
                </span>

                {sharingRows.length}
                {" "}cross-institution sharing
                relationships found, with{" "}
                {totalSharedEquipment}
                {" "}shared equipment resources.

              </div>

            )}


            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      REQUESTING INSTITUTION
                    </th>

                    <th>
                      OWNING INSTITUTION
                    </th>

                    <th>
                      TOTAL REQUESTS
                    </th>

                    <th>
                      APPROVED
                    </th>

                    <th>
                      REJECTED
                    </th>

                    <th>
                      PENDING
                    </th>

                    <th>
                      SHARED EQUIPMENT
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {sharingRows.length === 0 ? (

                    <tr>

                      <td
                        colSpan="7"
                        className="empty-row"
                      >

                        <div>
                          🔗
                        </div>

                        No inter-institution
                        sharing data available
                        for this date range.

                      </td>

                    </tr>

                  ) : (

                    sharingRows.map(
                      (row, index) => (

                        <tr
                          key={`${row.requestingInstitutionId}-${row.owningInstitutionId}-${index}`}
                        >

                          <td>

                            <strong>
                              {row.requestingInstitutionName ||
                                "Unknown Institution"}
                            </strong>

                          </td>


                          <td>

                            <strong>
                              {row.owningInstitutionName ||
                                "Unknown Institution"}
                            </strong>

                          </td>


                          <td>
                            {Number(
                              row.totalRequests || 0
                            )}
                          </td>


                          <td>

                            <span className="maintenance-status-badge completed">

                              {Number(
                                row.approvedRequests ||
                                  0
                              )}

                            </span>

                          </td>


                          <td>

                            <span className="maintenance-status-badge progress">

                              {Number(
                                row.rejectedRequests ||
                                  0
                              )}

                            </span>

                          </td>


                          <td>
                            {Number(
                              row.pendingRequests || 0
                            )}
                          </td>


                          <td>

                            <strong>
                              {Number(
                                row.sharedEquipment ||
                                  0
                              )}
                            </strong>

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>


            {sharingRows.length > 0 && (

              <div className="department-footer">

                <span>
                  📊
                </span>

                {totalSharingRequests}
                {" "}total sharing requests:
                {" "}
                {totalApprovedSharingRequests}
                {" "}approved,
                {" "}
                {totalRejectedSharingRequests}
                {" "}rejected and
                {" "}
                {totalPendingSharingRequests}
                {" "}pending.

              </div>

            )}

          </section>

        )}


        {/* ===================================================
            PROCUREMENT & COST REPORT
        =================================================== */}

        {generated &&
          reportType === "procurement" && (

          <section className="report-table-card procurement-report-card">

            <div className="table-header">

              <div>

                <h2>
                  💰 Procurement & Cost Analysis
                </h2>

                <p>
                  Equipment procurement and
                  purchase cost breakdown.
                </p>

              </div>

              <div className="date-range-display">
                📅 {from} → {to}
              </div>

            </div>


            {/* PROCUREMENT SUMMARY MESSAGE */}

            {procurementRows.length > 0 && (

              <div className="department-footer">

                <span>
                  💰
                </span>

                {totalProcurementEquipment}
                {" "}equipment procured during
                the selected period for a total
                cost of{" "}
                ₹{totalProcurementCost.toFixed(2)}.

              </div>

            )}


            {/* TABLE */}

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      EQUIPMENT
                    </th>

                    <th>
                      ASSET TAG
                    </th>

                    <th>
                      CATEGORY
                    </th>

                    <th>
                      DEPARTMENT
                    </th>

                    <th>
                      SUPPLIER
                    </th>

                    <th>
                      PURCHASE DATE
                    </th>

                    <th>
                      PURCHASE COST
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {procurementRows.length === 0 ? (

                    <tr>

                      <td
                        colSpan="7"
                        className="empty-row"
                      >

                        <div>
                          💰
                        </div>

                        No procurement data
                        available for this
                        date range.

                      </td>

                    </tr>

                  ) : (

                    procurementRows.map(
                      (row, index) => (

                        <tr
                          key={
                            row.id ||
                            row.assetTag ||
                            index
                          }
                        >

                          {/* EQUIPMENT */}

                          <td>

                            <div className="table-equipment">

                              <div>
                                ⚙
                              </div>

                              <strong>
                                {row.equipmentName ||
                                  "Unknown Equipment"}
                              </strong>

                            </div>

                          </td>


                          {/* ASSET TAG */}

                          <td>
                            {row.assetTag ||
                              "-"}
                          </td>


                          {/* CATEGORY */}

                          <td>

                            <span className="category-badge">

                              {row.category ||
                                "General"}

                            </span>

                          </td>


                          {/* DEPARTMENT */}

                          <td>
                            {row.department ||
                              "-"}

                          </td>


                          {/* SUPPLIER */}

                          <td>

                            {row.supplier ||
                              "Not specified"}

                          </td>


                          {/* PURCHASE DATE */}

                          <td>
                            {row.purchaseDate ||
                              "-"}
                          </td>


                          {/* PURCHASE COST */}

                          <td>

                            <strong className="cost-value">

                              ₹
                              {Number(
                                row.purchaseCost || 0
                              ).toFixed(2)}

                            </strong>

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>


            {/* PROCUREMENT FOOTER */}

            {procurementRows.length > 0 && (

              <div className="department-footer">

                <span>
                  📊
                </span>

                {procurementWithSupplier}
                {" "}of{" "}
                {totalProcurementEquipment}
                {" "}procured equipment records
                have supplier information.

              </div>

            )}

          </section>

        )}


        {/* ===================================================
            FOOTER
        =================================================== */}

        <div className="reports-footer">

          <span>
            ✦
          </span>

          Reports help optimize laboratory
          resources and improve operational
          efficiency.

        </div>

      </main>

    </div>
  );
}