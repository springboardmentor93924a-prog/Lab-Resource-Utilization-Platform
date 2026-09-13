import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import api from "../services/api";
import "./ReportsDashboard.css";

const ReportsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });

  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [report, setReport] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [demand, setDemand] = useState([]);
  const [trends, setTrends] = useState([]);

  const [equipment, setEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [costs, setCosts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [costRecovery, setCostRecovery] = useState([]);
  const [billing, setBilling] = useState([]);
  const [sharedEquipment, setSharedEquipment] = useState([]);

  /*
   * =====================================================
   * REPORT HELPERS
   * =====================================================
   *
   * __define-ocg__
   * Reports Dashboard uses existing Spring Boot APIs
   * and live PostgreSQL data.
   */

  const normalizeArray = (data) => {
    if (Array.isArray(data)) return data;

    if (data?.content && Array.isArray(data.content)) {
      return data.content;
    }

    return [];
  };

  const getNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  };

  const getStatus = (item) => {
    return (
      item?.status ||
      item?.bookingStatus ||
      item?.maintenanceStatus ||
      item?.billingStatus ||
      item?.chargebackStatus ||
      ""
    )
      .toString()
      .toUpperCase()
      .replace(/-/g, "_")
      .replace(/\s+/g, "_");
  };

  const getId = (item) => {
    return (
      item?.id ??
      item?.equipmentId ??
      item?.bookingId ??
      item?.workOrderId ??
      null
    );
  };

  const getEquipmentId = (item) => {
    return (
      item?.equipment?.id ??
      item?.equipmentId ??
      item?.resource?.id ??
      item?.equipment?.equipmentId ??
      null
    );
  };

  const getEquipmentName = (item) => {
    return (
      item?.equipment?.name ||
      item?.equipment?.equipmentName ||
      item?.equipmentName ||
      item?.resource?.name ||
      item?.resourceName ||
      "Unknown Equipment"
    );
  };

  const getDepartmentName = (item) => {
    return (
      item?.department?.name ||
      item?.department?.departmentName ||
      item?.departmentName ||
      item?.user?.department?.name ||
      item?.user?.departmentName ||
      item?.researcher?.department?.name ||
      item?.researcher?.departmentName ||
      item?.equipment?.department?.name ||
      item?.equipment?.department?.departmentName ||
      item?.equipment?.departmentName ||
      "Unassigned"
    );
  };

  const getInstitutionName = (item, type) => {
    if (type === "sharing") {
      return (
        item?.sharingInstitution?.name ||
        item?.sharingInstitutionName ||
        "Unknown Institution"
      );
    }

    return (
      item?.usingInstitution?.name ||
      item?.usingInstitutionName ||
      "Unknown Institution"
    );
  };

  /*
   * =====================================================
   * BOOKING DATE/TIME HELPERS
   * =====================================================
   */

  const getBookingDate = (booking) => {
    return (
      booking?.bookingDate ||
      booking?.date ||
      booking?.startDate ||
      null
    );
  };

  const getBookingStart = (booking) => {
    const bookingDate = getBookingDate(booking);

    /*
     * Booking.java uses:
     * bookingDate : LocalDate
     * startTime   : LocalTime
     */
    if (bookingDate && booking?.startTime) {
      return `${String(bookingDate).substring(0, 10)}T${String(
        booking.startTime
      )}`;
    }

    return (
      booking?.startDateTime ||
      booking?.startDate ||
      booking?.bookingDate ||
      booking?.date ||
      null
    );
  };

  const getBookingEnd = (booking) => {
    const bookingDate = getBookingDate(booking);

    if (bookingDate && booking?.endTime) {
      return `${String(bookingDate).substring(0, 10)}T${String(
        booking.endTime
      )}`;
    }

    return (
      booking?.endDateTime ||
      booking?.endDate ||
      getBookingStart(booking)
    );
  };

  const isDateInRange = (dateValue) => {
    if (!dateValue) return true;

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return true;
    }

    const selectedStart = new Date(`${startDate}T00:00:00`);
    const selectedEnd = new Date(`${endDate}T23:59:59`);

    return date >= selectedStart && date <= selectedEnd;
  };

  const getDateValue = (item) => {
    return (
      item?.date ||
      item?.costDate ||
      item?.billingDate ||
      item?.requestDate ||
      item?.createdAt ||
      item?.scheduledStart ||
      item?.startDate ||
      null
    );
  };

  const filterByDate = (items) => {
    return items.filter((item) =>
      isDateInRange(getDateValue(item))
    );
  };

  /*
   * =====================================================
   * LOAD REPORT DATA
   * =====================================================
   */

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        startDate,
        endDate,
      };

      const [
        reportRes,
        rankingRes,
        demandRes,
        trendsRes,
        equipmentRes,
        bookingsRes,
        maintenanceRes,
        workOrdersRes,
        costsRes,
        budgetsRes,
        recoveryRes,
        billingRes,
        sharedRes,
      ] = await Promise.all([
        api.get("/analytics/report", { params }),
        api.get("/analytics/ranking", { params }),
        api.get("/analytics/demand", { params }),
        api.get("/analytics/trends", { params }),

        api.get("/equipment"),
        api.get("/bookings"),
        api.get("/maintenance/requests"),
        api.get("/maintenance/work-orders"),
        api.get("/costs"),
        api.get("/budgets"),
        api.get("/cost-recovery"),
        api.get("/inter-institution-billing"),
        api.get("/shared-equipment"),
      ]);

      setReport(reportRes.data || {});
      setRanking(normalizeArray(rankingRes.data));
      setDemand(normalizeArray(demandRes.data));
      setTrends(normalizeArray(trendsRes.data));

      setEquipment(normalizeArray(equipmentRes.data));
      setBookings(normalizeArray(bookingsRes.data));
      setMaintenanceRequests(normalizeArray(maintenanceRes.data));
      setWorkOrders(normalizeArray(workOrdersRes.data));
      setCosts(normalizeArray(costsRes.data));
      setBudgets(normalizeArray(budgetsRes.data));
      setCostRecovery(normalizeArray(recoveryRes.data));
      setBilling(normalizeArray(billingRes.data));
      setSharedEquipment(normalizeArray(sharedRes.data));
    } catch (err) {
      console.error("Reports loading error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load report data. Please check whether the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
 * =====================================================
 * TASK 5.3
 * EXCEL EXPORT
 * =====================================================
 */

const exportToExcel = () => {
  try {
    const workbook = XLSX.utils.book_new();

    /*
     * =====================================================
     * SHEET 1 — SUMMARY
     * =====================================================
     */

    const summaryData = [
      ["REPORT SUMMARY"],
      [],
      ["Report Period", `${startDate} to ${endDate}`],
      [],
      ["Metric", "Value"],
      ["Total Equipment", totalEquipment],
      ["Total Bookings", totalBookings],
      [
        "Average Utilization (%)",
        Number(getNumber(averageUtilization).toFixed(2)),
      ],
      [
        "Maintenance Requests",
        filteredMaintenanceRequests.length,
      ],
      [
        "Total Work Orders",
        filteredWorkOrders.length,
      ],
      [
        "Total Downtime (Hours)",
        Number(totalDowntime.toFixed(2)),
      ],
      [
        "Shared Equipment",
        sharedEquipmentSet.size ||
          filteredSharedEquipment.length,
      ],
      [
        "Sharing Institutions",
        sharingInstitutionSet.size,
      ],
      [
        "Using Institutions",
        usingInstitutionSet.size,
      ],
      [
        "Billing Records",
        filteredBilling.length,
      ],
      ["Billing Amount", billingAmount],
      ["Total Cost", totalCost],
      ["Usage Cost", usageCost],
      ["Maintenance Cost", maintenanceCost],
      ["Total Budget", totalBudget],
      ["Used Budget", usedBudget],
      ["Remaining Budget", remainingBudget],
      [
        "Budget Utilization (%)",
        Number(budgetUtilization.toFixed(2)),
      ],
      [
        "Recoverable Amount",
        recoverableAmount,
      ],
      [
        "Recovered Amount",
        recoveredAmount,
      ],
      [
        "Outstanding Recovery",
        calculatedOutstanding,
      ],
      [
        "Recovery Percentage (%)",
        Number(recoveryPercentage.toFixed(2)),
      ],
    ];

    const summarySheet =
      XLSX.utils.aoa_to_sheet(summaryData);

    summarySheet["!cols"] = [
      { wch: 30 },
      { wch: 25 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      "Summary"
    );

    /*
     * =====================================================
     * SHEET 2 — EQUIPMENT UTILIZATION
     * =====================================================
     */

    const equipmentUtilizationData =
      ranking.map((item, index) => {
        const utilization = getNumber(
          item.utilizationPercentage ??
            item.utilization ??
            item.utilizationRate
        );

        const bookingCount = getNumber(
          item.bookingCount ??
            item.totalBookings ??
            item.bookings
        );

        const demandItem = demand.find(
          (d) =>
            String(d.equipmentId) ===
            String(item.equipmentId)
        );

        const demandLevel =
          item.demandLevel ||
          item.demand ||
          demandItem?.demandLevel ||
          demandItem?.demand ||
          "N/A";

        return {
          Rank: index + 1,
          Equipment:
            item.equipmentName ||
            item.name ||
            "Unknown Equipment",
          "Equipment ID":
            item.equipmentId ??
            item.id ??
            "",
          "Booking Count": bookingCount,
          "Utilization (%)": Number(
            utilization.toFixed(2)
          ),
          "Demand Level": demandLevel,
        };
      });

    const equipmentUtilizationSheet =
      XLSX.utils.json_to_sheet(
        equipmentUtilizationData.length
          ? equipmentUtilizationData
          : [
              {
                Equipment: "No data",
              },
            ]
      );

    equipmentUtilizationSheet["!cols"] = [
      { wch: 8 },
      { wch: 30 },
      { wch: 15 },
      { wch: 18 },
      { wch: 20 },
      { wch: 18 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      equipmentUtilizationSheet,
      "Equipment Utilization"
    );

    /*
     * =====================================================
     * SHEET 3 — DEPARTMENT USAGE
     * =====================================================
     */

    const departmentUsageData =
      departmentUsage.map(
        (department, index) => {
          const usageShare =
            totalDepartmentUsageHours > 0
              ? (department.usageHours /
                  totalDepartmentUsageHours) *
                100
              : 0;

          return {
            Rank: index + 1,
            Department:
              department.name ||
              "Unknown Department",
            Bookings:
              department.bookings ?? 0,
            "Usage Hours": Number(
              getNumber(
                department.usageHours
              ).toFixed(2)
            ),
            "Equipment Count":
              department.equipmentCount ?? 0,
            "Utilization (%)": Number(
              getNumber(
                department.utilization
              ).toFixed(2)
            ),
            "Usage Share (%)": Number(
              usageShare.toFixed(2)
            ),
          };
        }
      );

    const departmentUsageSheet =
      XLSX.utils.json_to_sheet(
        departmentUsageData.length
          ? departmentUsageData
          : [
              {
                Department: "No data",
              },
            ]
      );

    departmentUsageSheet["!cols"] = [
      { wch: 8 },
      { wch: 30 },
      { wch: 15 },
      { wch: 18 },
      { wch: 18 },
      { wch: 20 },
      { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      departmentUsageSheet,
      "Department Usage"
    );

    /*
     * =====================================================
     * SHEET 4 — MAINTENANCE
     * =====================================================
     */

    const maintenanceData =
      filteredMaintenanceRequests.map(
        (item, index) => ({
          "#": index + 1,
          "Request ID":
            item.id ?? "",
          Equipment:
            getEquipmentName(item),
          Description:
            item.description ??
            item.issueDescription ??
            item.problem ??
            "",
          Priority:
            item.priority ??
            "",
          Status:
            getStatus(item) ||
            "N/A",
          "Created Date":
            item.createdAt ??
            item.requestDate ??
            item.date ??
            "",
        })
      );

    const maintenanceSheet =
      XLSX.utils.json_to_sheet(
        maintenanceData.length
          ? maintenanceData
          : [
              {
                Maintenance:
                  "No maintenance records",
              },
            ]
      );

    maintenanceSheet["!cols"] = [
      { wch: 8 },
      { wch: 15 },
      { wch: 30 },
      { wch: 40 },
      { wch: 15 },
      { wch: 18 },
      { wch: 25 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      maintenanceSheet,
      "Maintenance"
    );

    /*
     * =====================================================
     * SHEET 5 — DOWNTIME
     * =====================================================
     */

    const downtimeData =
      filteredWorkOrders.map(
        (item, index) => ({
          "#": index + 1,
          "Work Order ID":
            item.id ?? "",
          Equipment:
            getEquipmentName(item),
          Status:
            getStatus(item) ||
            "N/A",
          "Scheduled Start":
            item.scheduledStart ??
            item.startTime ??
            "",
          "Scheduled End":
            item.scheduledEnd ??
            item.endTime ??
            "",
          "Downtime Hours":
            getNumber(
              item.downtimeHours ??
                item.downtime ??
                item.totalDowntime
            ),
        })
      );

    const downtimeSheet =
      XLSX.utils.json_to_sheet(
        downtimeData.length
          ? downtimeData
          : [
              {
                Downtime:
                  "No downtime records",
              },
            ]
      );

    downtimeSheet["!cols"] = [
      { wch: 8 },
      { wch: 18 },
      { wch: 30 },
      { wch: 18 },
      { wch: 25 },
      { wch: 25 },
      { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      downtimeSheet,
      "Downtime"
    );

    /*
     * =====================================================
     * SHEET 6 — SHARING
     * =====================================================
     */

    const sharingData =
      filteredSharedEquipment.map(
        (item, index) => ({
          "#": index + 1,
          "Equipment":
            getEquipmentName(item),
          "Sharing Institution":
            getInstitutionName(
              item,
              "sharing"
            ),
          "Using Institution":
            getInstitutionName(
              item,
              "using"
            ),
          "Usage Hours":
            getNumber(
              item.usageHours
            ),
          Status:
            getStatus(item) ||
            "N/A",
        })
      );

    const sharingSheet =
      XLSX.utils.json_to_sheet(
        sharingData.length
          ? sharingData
          : [
              {
                Sharing:
                  "No sharing records",
              },
            ]
      );

    sharingSheet["!cols"] = [
      { wch: 8 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 18 },
      { wch: 18 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      sharingSheet,
      "Sharing"
    );

    /*
     * =====================================================
     * SHEET 7 — BILLING
     * =====================================================
     */

    const billingData =
      filteredBilling.map(
        (item, index) => ({
          "#": index + 1,
          "Sharing Institution":
            getInstitutionName(
              item,
              "sharing"
            ),
          "Using Institution":
            getInstitutionName(
              item,
              "using"
            ),
          Equipment:
            getEquipmentName(item),
          "Usage Hours":
            getNumber(
              item.usageHours
            ),
          Amount:
            getNumber(
              item.amount ??
                item.billingAmount
            ),
          Status:
            getStatus(item) ||
            "N/A",
          "Billing Date":
            item.billingDate ??
            item.date ??
            "",
        })
      );

    const billingSheet =
      XLSX.utils.json_to_sheet(
        billingData.length
          ? billingData
          : [
              {
                Billing:
                  "No billing records",
              },
            ]
      );

    billingSheet["!cols"] = [
      { wch: 8 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      billingSheet,
      "Billing"
    );

    /*
     * =====================================================
     * SHEET 8 — COSTS
     * =====================================================
     */

    const costsData =
      filteredCosts.map(
        (item, index) => ({
          "#": index + 1,
          "Cost ID":
            item.id ?? "",
          Equipment:
            getEquipmentName(item),
          "Cost Type":
            item.costType ??
            item.type ??
            "",
          "Usage Hours":
            getNumber(
              item.usageHours
            ),
          "Rate Per Hour":
            getNumber(
              item.ratePerHour
            ),
          "Total Cost":
            getNumber(
              item.totalCost ??
                item.amount ??
                item.cost
            ),
          "Cost Date":
            item.costDate ??
            item.date ??
            "",
          Description:
            item.description ??
            "",
          Status:
            item.billingStatus ??
            item.status ??
            "",
        })
      );

    const costsSheet =
      XLSX.utils.json_to_sheet(
        costsData.length
          ? costsData
          : [
              {
                Costs:
                  "No cost records",
              },
            ]
      );

    costsSheet["!cols"] = [
      { wch: 8 },
      { wch: 15 },
      { wch: 30 },
      { wch: 20 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 20 },
      { wch: 40 },
      { wch: 18 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      costsSheet,
      "Costs"
    );

    /*
     * =====================================================
     * SHEET 9 — BUDGET
     * =====================================================
     */

    const budgetData =
      filteredBudgets.map(
        (item, index) => {
          const budget =
            getNumber(
              item.budgetAmount
            );

          const used =
            getNumber(
              item.usedAmount
            );

          const remaining =
            Math.max(
              budget - used,
              0
            );

          const utilization =
            budget > 0
              ? Math.min(
                  (used / budget) *
                    100,
                  100
                )
              : 0;

          return {
            "#": index + 1,
            Department:
              item.department?.name ??
              item.departmentName ??
              "N/A",
            Institution:
              item.institution?.name ??
              item.institutionName ??
              "N/A",
            "Financial Year":
              item.financialYear ??
              "N/A",
            Budget: budget,
            Used: used,
            Remaining: remaining,
            "Utilization (%)":
              Number(
                utilization.toFixed(2)
              ),
            Status:
              getStatus(item) ||
              "ACTIVE",
          };
        }
      );

    const budgetSheet =
      XLSX.utils.json_to_sheet(
        budgetData.length
          ? budgetData
          : [
              {
                Budget:
                  "No budget records",
              },
            ]
      );

    budgetSheet["!cols"] = [
      { wch: 8 },
      { wch: 30 },
      { wch: 30 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 20 },
      { wch: 18 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      budgetSheet,
      "Budget"
    );

    /*
     * =====================================================
     * DOWNLOAD EXCEL FILE
     * =====================================================
     */

    const fileName =
      `Lab_Resource_Report_${startDate}_to_${endDate}.xlsx`;

    XLSX.writeFile(
      workbook,
      fileName
    );

  } catch (error) {
    console.error(
      "Excel export failed:",
      error
    );

    alert(
      "Failed to export Excel report. Please try again."
    );
  }
};


const exportToPDF = () => {
  try {
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();

    /*
     * =====================================================
     * TASK 5.4
     * PDF REPORT EXPORT
     * =====================================================
     */

    // ---------- TITLE ----------
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(
      "Lab Resource Utilization Report",
      pageWidth / 2,
      15,
      { align: "center" }
    );

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(
      `Report Period: ${startDate} to ${endDate}`,
      pageWidth / 2,
      22,
      { align: "center" }
    );

    doc.text(
      "Generated from live PostgreSQL data",
      pageWidth / 2,
      28,
      { align: "center" }
    );

    // ---------- SUMMARY ----------
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Overall Summary", 14, 40);

    autoTable(doc, {
      startY: 44,
      head: [["Metric", "Value"]],
      body: [
        ["Total Equipment", String(totalEquipment)],
        ["Total Bookings", String(totalBookings)],
        [
          "Average Utilization",
          `${getNumber(averageUtilization).toFixed(1)}%`,
        ],
        [
          "Maintenance Requests",
          String(filteredMaintenanceRequests.length),
        ],
        [
          "Total Work Orders",
          String(filteredWorkOrders.length),
        ],
        [
          "Equipment Downtime",
          `${totalDowntime.toFixed(1)} hrs`,
        ],
        [
          "Shared Equipment",
          String(
            sharedEquipmentSet.size ||
              filteredSharedEquipment.length
          ),
        ],
        [
          "Billing Amount",
          formatCurrency(billingAmount),
        ],
        [
          "Total Cost",
          formatCurrency(totalCost),
        ],
        [
          "Total Budget",
          formatCurrency(totalBudget),
        ],
        [
          "Used Budget",
          formatCurrency(usedBudget),
        ],
        [
          "Remaining Budget",
          formatCurrency(remainingBudget),
        ],
        [
          "Outstanding Recovery",
          formatCurrency(calculatedOutstanding),
        ],
        [
          "Recovery Percentage",
          `${recoveryPercentage.toFixed(1)}%`,
        ],
      ],
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fontStyle: "bold",
      },
      margin: {
        left: 14,
        right: 14,
      },
    });

    // ---------- EQUIPMENT UTILIZATION ----------
    doc.addPage();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("5.2.1 Equipment Utilization", 14, 15);

    if (ranking.length > 0) {
      autoTable(doc, {
        startY: 20,
        head: [
          [
            "#",
            "Equipment",
            "Bookings",
            "Utilization",
            "Demand",
          ],
        ],
        body: ranking.map((item, index) => {
          const utilization = getNumber(
            item.utilizationPercentage ??
              item.utilization ??
              item.utilizationRate
          );

          const bookingCount = getNumber(
            item.bookingCount ??
              item.totalBookings ??
              item.bookings
          );

          const demandItem = demand.find(
            (d) =>
              String(d.equipmentId) ===
              String(item.equipmentId)
          );

          const demandLevel =
            item.demandLevel ||
            item.demand ||
            demandItem?.demandLevel ||
            demandItem?.demand ||
            "N/A";

          return [
            index + 1,
            item.equipmentName ||
              item.name ||
              "Unknown Equipment",
            bookingCount,
            `${utilization.toFixed(1)}%`,
            demandLevel,
          ];
        }),
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
        },
        headStyles: {
          fontStyle: "bold",
        },
        margin: {
          left: 10,
          right: 10,
        },
      });
    } else {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "No equipment utilization data available.",
        14,
        23
      );
    }

    // ---------- DEPARTMENT USAGE ----------
    doc.addPage();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("5.2.2 Department / Resource Usage", 14, 15);

    if (departmentUsage.length > 0) {
      autoTable(doc, {
        startY: 20,
        head: [
          [
            "#",
            "Department",
            "Bookings",
            "Usage Hours",
            "Equipment Count",
            "Utilization",
            "Usage Share",
          ],
        ],
        body: departmentUsage.map(
          (department, index) => {
            const usageShare =
              totalDepartmentUsageHours > 0
                ? (department.usageHours /
                    totalDepartmentUsageHours) *
                  100
                : 0;

            return [
              index + 1,
              department.name,
              department.bookings,
              `${department.usageHours.toFixed(2)} hrs`,
              department.equipmentCount,
              `${department.utilization.toFixed(1)}%`,
              `${usageShare.toFixed(1)}%`,
            ];
          }
        ),
        theme: "grid",
        styles: {
          fontSize: 7.5,
          cellPadding: 2.5,
        },
        headStyles: {
          fontStyle: "bold",
        },
        margin: {
          left: 8,
          right: 8,
        },
      });
    } else {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "No department usage data available.",
        14,
        23
      );
    }

    // ---------- MAINTENANCE ----------
    doc.addPage();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("5.2.3 Maintenance & Downtime", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [["Maintenance Metric", "Value"]],
      body: [
        [
          "Total Requests",
          filteredMaintenanceRequests.length,
        ],
        [
          "Pending Requests",
          pendingMaintenance,
        ],
        [
          "In Progress Requests",
          inProgressMaintenance,
        ],
        [
          "Completed Requests",
          completedMaintenance,
        ],
        [
          "Total Work Orders",
          filteredWorkOrders.length,
        ],
        [
          "Completed Work Orders",
          completedWorkOrders,
        ],
        [
          "Work Orders In Progress",
          inProgressWorkOrders,
        ],
        [
          "Total Downtime",
          `${totalDowntime.toFixed(1)} hrs`,
        ],
      ],
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fontStyle: "bold",
      },
      margin: {
        left: 14,
        right: 14,
      },
    });

    if (maintenanceEquipmentRanking.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");

      const maintenanceY =
        doc.lastAutoTable.finalY + 10;

      doc.text(
        "Most-Maintained Equipment",
        14,
        maintenanceY
      );

      autoTable(doc, {
        startY: maintenanceY + 4,
        head: [
          [
            "#",
            "Equipment",
            "Maintenance Records",
          ],
        ],
        body: maintenanceEquipmentRanking
          .slice(0, 10)
          .map((item, index) => [
            index + 1,
            item.equipmentName || "N/A",
            item.requestCount || 0,
          ]),
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
        },
        headStyles: {
          fontStyle: "bold",
        },
        margin: {
          left: 14,
          right: 14,
        },
      });
    }

    // ---------- INTER-INSTITUTION SHARING ----------
    doc.addPage();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(
      "5.2.4 Inter-Institution Sharing",
      14,
      15
    );

    autoTable(doc, {
      startY: 20,
      head: [["Sharing Metric", "Value"]],
      body: [
        [
          "Shared Equipment",
          sharedEquipmentSet.size ||
            filteredSharedEquipment.length,
        ],
        [
          "Sharing Institutions",
          sharingInstitutionSet.size,
        ],
        [
          "Using Institutions",
          usingInstitutionSet.size,
        ],
        [
          "Usage Hours",
          `${sharingUsageHours.toFixed(1)} hrs`,
        ],
        [
          "Billing Records",
          filteredBilling.length,
        ],
        [
          "Pending Billing",
          pendingBilling,
        ],
        [
          "Paid Billing",
          paidBilling,
        ],
        [
          "Billing Amount",
          formatCurrency(billingAmount),
        ],
      ],
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fontStyle: "bold",
      },
      margin: {
        left: 14,
        right: 14,
      },
    });

    if (filteredBilling.length > 0) {
      const billingY =
        doc.lastAutoTable.finalY + 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");

      doc.text(
        "Inter-Institution Billing Records",
        14,
        billingY
      );

      autoTable(doc, {
        startY: billingY + 4,
        head: [
          [
            "Sharing Institution",
            "Using Institution",
            "Equipment",
            "Hours",
            "Amount",
            "Status",
          ],
        ],
        body: filteredBilling.map((item) => [
          getInstitutionName(item, "sharing"),
          getInstitutionName(item, "using"),
          getEquipmentName(item),
          `${getNumber(
            item.usageHours ??
              item.hours ??
              item.usedHours
          ).toFixed(1)}`,
          formatCurrency(
            item.amount ??
              item.billingAmount
          ),
          getStatus(item) || "N/A",
        ]),
        theme: "grid",
        styles: {
          fontSize: 7,
          cellPadding: 2,
        },
        headStyles: {
          fontStyle: "bold",
        },
        margin: {
          left: 8,
          right: 8,
        },
      });
    }

    // ---------- COST & PROCUREMENT ----------
    doc.addPage();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(
      "5.2.5 Cost & Procurement Analysis",
      14,
      15
    );

    autoTable(doc, {
      startY: 20,
      head: [["Cost / Budget Metric", "Value"]],
      body: [
        [
          "Cost Records",
          filteredCosts.length,
        ],
        [
          "Total Cost",
          formatCurrency(totalCost),
        ],
        [
          "Usage Cost",
          formatCurrency(usageCost),
        ],
        [
          "Maintenance Cost",
          formatCurrency(maintenanceCost),
        ],
        [
          "Total Budget",
          formatCurrency(totalBudget),
        ],
        [
          "Used Budget",
          formatCurrency(usedBudget),
        ],
        [
          "Remaining Budget",
          formatCurrency(remainingBudget),
        ],
        [
          "Budget Utilization",
          `${budgetUtilization.toFixed(1)}%`,
        ],
        [
          "Recoverable Amount",
          formatCurrency(recoverableAmount),
        ],
        [
          "Recovered Amount",
          formatCurrency(recoveredAmount),
        ],
        [
          "Outstanding Recovery",
          formatCurrency(calculatedOutstanding),
        ],
        [
          "Recovery Percentage",
          `${recoveryPercentage.toFixed(1)}%`,
        ],
        [
          "Inter-Institution Billing",
          formatCurrency(billingAmount),
        ],
      ],
      theme: "grid",
      styles: {
        fontSize: 8.5,
        cellPadding: 2.8,
      },
      headStyles: {
        fontStyle: "bold",
      },
      margin: {
        left: 14,
        right: 14,
      },
    });

    // ---------- COST RECORDS ----------
    if (filteredCosts.length > 0) {
      doc.addPage();

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Cost Records", 14, 15);

      autoTable(doc, {
        startY: 20,
        head: [
          [
            "Equipment",
            "Cost Type",
            "Usage Hours",
            "Rate / Hour",
            "Total Cost",
            "Date",
          ],
        ],
        body: filteredCosts.map((item) => [
          getEquipmentName(item),
          item.costType ||
            item.type ||
            "N/A",
          getNumber(
            item.usageHours
          ).toFixed(1),
          formatCurrency(
            item.ratePerHour
          ),
          formatCurrency(
            item.totalCost ??
              item.amount ??
              item.cost
          ),
          item.costDate ||
            item.date ||
            "N/A",
        ]),
        theme: "grid",
        styles: {
          fontSize: 7,
          cellPadding: 2,
        },
        headStyles: {
          fontStyle: "bold",
        },
        margin: {
          left: 8,
          right: 8,
        },
      });
    }

    // ---------- BUDGET RECORDS ----------
    if (filteredBudgets.length > 0) {
      doc.addPage();

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Budget Records", 14, 15);

      autoTable(doc, {
        startY: 20,
        head: [
          [
            "Department",
            "Institution",
            "Financial Year",
            "Budget",
            "Used",
            "Remaining",
            "Utilization",
            "Status",
          ],
        ],
        body: filteredBudgets.map((item) => {
          const budget = getNumber(
            item.budgetAmount
          );

          const used = getNumber(
            item.usedAmount
          );

          const remaining = Math.max(
            budget - used,
            0
          );

          const utilization =
            budget > 0
              ? Math.min(
                  (used / budget) * 100,
                  100
                )
              : 0;

          return [
            item.department?.name ||
              item.departmentName ||
              "N/A",
            item.institution?.name ||
              item.institutionName ||
              "N/A",
            item.financialYear ||
              "N/A",
            formatCurrency(budget),
            formatCurrency(used),
            formatCurrency(remaining),
            `${utilization.toFixed(1)}%`,
            getStatus(item) ||
              "ACTIVE",
          ];
        }),
        theme: "grid",
        styles: {
          fontSize: 6.8,
          cellPadding: 2,
        },
        headStyles: {
          fontStyle: "bold",
        },
        margin: {
          left: 6,
          right: 6,
        },
      });
    }

    // ---------- DEMAND ANALYSIS ----------
    doc.addPage();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Demand Analysis", 14, 15);

    if (demand.length > 0) {
      autoTable(doc, {
        startY: 20,
        head: [
          [
            "#",
            "Equipment",
            "Booking Count",
            "Demand Level",
          ],
        ],
        body: demand.map(
          (item, index) => [
            index + 1,
            item.equipmentName ||
              "Unknown Equipment",
            item.bookingCount ??
              item.totalBookings ??
              0,
            item.demandLevel ||
              item.demand ||
              "N/A",
          ]
        ),
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
        },
        headStyles: {
          fontStyle: "bold",
        },
        margin: {
          left: 10,
          right: 10,
        },
      });
    } else {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "No demand analysis data available.",
        14,
        23
      );
    }

    // ---------- FOOTER ----------
    const totalPages =
      doc.internal.getNumberOfPages();

    for (
      let i = 1;
      i <= totalPages;
      i++
    ) {
      doc.setPage(i);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");

      doc.text(
        `Lab Resource Utilization Report | Page ${i} of ${totalPages}`,
        pageWidth / 2,
        290,
        { align: "center" }
      );
    }

    // ---------- SAVE ----------
    doc.save(
      `Lab_Resource_Report_${startDate}_to_${endDate}.pdf`
    );

  } catch (error) {
    console.error(
      "PDF export failed:",
      error
    );

    alert(
      "Failed to export PDF. Please check the browser console."
    );
  }
};

  useEffect(() => {
    loadReports();
  }, []);

  /*
   * =====================================================
   * DATE-FILTERED DATA
   * =====================================================
   */

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const status = getStatus(booking);

      if (["CANCELLED", "NO_SHOW"].includes(status)) {
        return false;
      }

      const bookingDate = getBookingDate(booking);

      if (!bookingDate) {
        return false;
      }

      const normalizedDate = String(bookingDate).substring(
        0,
        10
      );

      return (
        normalizedDate >= startDate &&
        normalizedDate <= endDate
      );
    });
  }, [bookings, startDate, endDate]);

  const filteredMaintenanceRequests = useMemo(() => {
    return filterByDate(maintenanceRequests);
  }, [maintenanceRequests, startDate, endDate]);

  const filteredWorkOrders = useMemo(() => {
    return filterByDate(workOrders);
  }, [workOrders, startDate, endDate]);

  const filteredCosts = useMemo(() => {
    return filterByDate(costs);
  }, [costs, startDate, endDate]);

  const filteredBudgets = useMemo(() => {
    return budgets;
  }, [budgets]);

  const filteredBilling = useMemo(() => {
    return filterByDate(billing);
  }, [billing, startDate, endDate]);

  const filteredSharedEquipment = useMemo(() => {
    return filterByDate(sharedEquipment);
  }, [sharedEquipment, startDate, endDate]);

  const filteredRecovery = useMemo(() => {
    return filterByDate(costRecovery);
  }, [costRecovery, startDate, endDate]);

  /*
   * =====================================================
   * GENERAL REPORT VALUES
   * =====================================================
   */

  const getReportValue = (keys, fallback = 0) => {
    for (const key of keys) {
      if (
        report &&
        report[key] !== undefined &&
        report[key] !== null
      ) {
        return report[key];
      }
    }

    return fallback;
  };

  const totalEquipment = getReportValue(
    ["totalEquipment", "equipmentCount"],
    equipment.length
  );

  const totalBookings = getReportValue(
    ["totalBookings", "bookingCount"],
    filteredBookings.length
  );

  const averageUtilization = getReportValue(
    ["averageUtilization", "averageUtilizationPercentage"],
    0
  );

  /*
   * =====================================================
   * TASK 5.2.1
   * EQUIPMENT UTILIZATION REPORT
   * =====================================================
   */

  const highestRankingEquipment =
    ranking.length > 0
      ? [...ranking].sort(
          (a, b) =>
            getNumber(
              b.utilizationPercentage ??
                b.utilization ??
                b.utilizationRate
            ) -
            getNumber(
              a.utilizationPercentage ??
                a.utilization ??
                a.utilizationRate
            )
        )[0]
      : null;

  const lowestRankingEquipment =
    ranking.length > 0
      ? [...ranking].sort(
          (a, b) =>
            getNumber(
              a.utilizationPercentage ??
                a.utilization ??
                a.utilizationRate
            ) -
            getNumber(
              b.utilizationPercentage ??
                b.utilization ??
                b.utilizationRate
            )
        )[0]
      : null;

  const highestEquipment =
    highestRankingEquipment?.equipmentName ||
    highestRankingEquipment?.name ||
    (typeof report?.highestUtilizationEquipment === "string"
      ? report.highestUtilizationEquipment
      : report?.highestUtilizationEquipment?.equipmentName) ||
    (typeof report?.highestEquipment === "string"
      ? report.highestEquipment
      : report?.highestEquipment?.equipmentName) ||
    "N/A";

  const lowestEquipment =
    lowestRankingEquipment?.equipmentName ||
    lowestRankingEquipment?.name ||
    (typeof report?.lowestUtilizationEquipment === "string"
      ? report.lowestUtilizationEquipment
      : report?.lowestUtilizationEquipment?.equipmentName) ||
    (typeof report?.lowestEquipment === "string"
      ? report.lowestEquipment
      : report?.lowestEquipment?.equipmentName) ||
    "N/A";

  /*
   * =====================================================
   * TASK 5.2.2
   * DEPARTMENT / RESOURCE USAGE
   * =====================================================
   */

  /*
   * Create a lookup map:
   *
   * equipment ID
   *       ↓
   * equipment object
   *       ↓
   * department
   */
  const equipmentMap = useMemo(() => {
    const map = new Map();

    equipment.forEach((item) => {
      if (
        item?.id !== undefined &&
        item?.id !== null
      ) {
        map.set(String(item.id), item);
      }
    });

    return map;
  }, [equipment]);

  /*
   * Find equipment ID from booking.
   */
  const getEquipmentIdFromBooking = (booking) => {
    return (
      booking?.equipment?.id ??
      booking?.equipmentId ??
      booking?.equipment?.equipmentId ??
      booking?.resource?.id ??
      booking?.resourceId ??
      null
    );
  };

  /*
   * Find equipment name from booking.
   */
  const getEquipmentNameFromBooking = (
    booking,
    equipmentLookup
  ) => {
    const equipmentId =
      getEquipmentIdFromBooking(booking);

    const equipmentItem =
      equipmentId !== null
        ? equipmentLookup.get(String(equipmentId))
        : null;

    return (
      booking?.equipment?.name ||
      booking?.equipment?.equipmentName ||
      booking?.equipmentName ||
      equipmentItem?.name ||
      equipmentItem?.equipmentName ||
      booking?.resource?.name ||
      booking?.resourceName ||
      (equipmentId !== null
        ? `Equipment #${equipmentId}`
        : "Unknown Equipment")
    );
  };

  /*
   * Find department from:
   *
   * 1. Booking
   * 2. Booking equipment
   * 3. Equipment lookup
   */
  const getDepartmentFromBooking = (
    booking,
    equipmentLookup
  ) => {
    const equipmentId =
      getEquipmentIdFromBooking(booking);

    const equipmentItem =
      equipmentId !== null
        ? equipmentLookup.get(String(equipmentId))
        : null;

    const department =
      booking?.department ||
      booking?.equipment?.department ||
      equipmentItem?.department ||
      null;

    if (typeof department === "string") {
      return department;
    }

    return (
      department?.name ||
      department?.departmentName ||
      booking?.departmentName ||
      booking?.equipment?.departmentName ||
      equipmentItem?.departmentName ||
      "Unassigned"
    );
  };

  /*
   * Calculate booking duration.
   *
   * Backend Booking.java uses LocalTime:
   * startTime
   * endTime
   */
  const calculateBookingHours = (booking) => {
    if (
      !booking?.startTime ||
      !booking?.endTime
    ) {
      return 0;
    }

    try {
      const parseTimeToMinutes = (timeValue) => {
        const parts = String(timeValue)
          .split(":")
          .map(Number);

        const hours = Number.isFinite(parts[0])
          ? parts[0]
          : 0;

        const minutes = Number.isFinite(parts[1])
          ? parts[1]
          : 0;

        const seconds = Number.isFinite(parts[2])
          ? parts[2]
          : 0;

        return (
          hours * 60 +
          minutes +
          seconds / 60
        );
      };

      const startMinutes =
        parseTimeToMinutes(
          booking.startTime
        );

      const endMinutes =
        parseTimeToMinutes(
          booking.endTime
        );

      let difference =
        endMinutes - startMinutes;

      /*
       * Handles bookings crossing midnight.
       */
      if (difference < 0) {
        difference += 24 * 60;
      }

      return Math.max(
        difference / 60,
        0
      );
    } catch (calculationError) {
      console.error(
        "Booking duration calculation error:",
        calculationError
      );

      return 0;
    }
  };

  /*
   * Selected number of days.
   */
  const selectedPeriodDays = useMemo(() => {
    const start = new Date(
      `${startDate}T00:00:00`
    );

    const end = new Date(
      `${endDate}T00:00:00`
    );

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return 1;
    }

    const difference =
      Math.round(
        (end.getTime() -
          start.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    return Math.max(
      difference,
      1
    );
  }, [startDate, endDate]);

  /*
   * Filter bookings specifically for
   * Department / Resource Usage.
   */
  const departmentBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const status = getStatus(booking);

      /*
       * Cancelled and no-show bookings
       * should not contribute to usage.
       */
      if (
        ["CANCELLED", "NO_SHOW"].includes(status)
      ) {
        return false;
      }

      const bookingDate =
        getBookingDate(booking);

      if (!bookingDate) {
        return false;
      }

      const normalizedDate =
        String(bookingDate).substring(
          0,
          10
        );

      return (
        normalizedDate >= startDate &&
        normalizedDate <= endDate
      );
    });
  }, [
    bookings,
    startDate,
    endDate,
  ]);

  /*
   * Create ranking lookup.
   *
   * equipment ID → utilization %
   */
  const equipmentUtilizationMap = useMemo(() => {
    const map = new Map();

    ranking.forEach((item) => {
      const equipmentId =
        item?.equipmentId ??
        item?.id ??
        null;

      if (
        equipmentId === null ||
        equipmentId === undefined
      ) {
        return;
      }

      const utilization =
        getNumber(
          item?.utilizationPercentage ??
            item?.utilization ??
            item?.utilizationRate
        );

      map.set(
        String(equipmentId),
        Math.min(
          Math.max(utilization, 0),
          100
        )
      );
    });

    return map;
  }, [ranking]);

  /*
   * Group bookings by department.
   */
  const departmentUsage = useMemo(() => {
    const grouped = {};

    departmentBookings.forEach(
      (booking) => {
        const departmentName =
          getDepartmentFromBooking(
            booking,
            equipmentMap
          );

        const equipmentId =
          getEquipmentIdFromBooking(
            booking
          );

        const equipmentName =
          getEquipmentNameFromBooking(
            booking,
            equipmentMap
          );

        const equipmentKey =
          equipmentId !== null
            ? String(equipmentId)
            : `name-${equipmentName}`;

        const usageHours =
          calculateBookingHours(
            booking
          );

        if (
          !grouped[departmentName]
        ) {
          grouped[departmentName] = {
            name: departmentName,
            bookings: 0,
            usageHours: 0,
            equipmentIds: new Set(),
            equipmentUtilizations: [],
          };
        }

        grouped[departmentName].bookings += 1;

        grouped[departmentName].usageHours +=
          usageHours;

        grouped[departmentName].equipmentIds.add(
          equipmentKey
        );

        /*
         * Store existing analytics utilization
         * for this equipment where available.
         */
        if (
          equipmentId !== null &&
          equipmentUtilizationMap.has(
            String(equipmentId)
          )
        ) {
          grouped[
            departmentName
          ].equipmentUtilizations.push(
            equipmentUtilizationMap.get(
              String(equipmentId)
            )
          );
        }
      }
    );

    return Object.values(grouped)
      .map((department) => {
        const equipmentCount =
          department.equipmentIds.size;

        /*
         * Calculate actual department utilization.
         *
         * Preferred:
         * Average utilization of equipment
         * belonging to the department.
         */
        let utilization = 0;

        if (
          department.equipmentUtilizations
            .length > 0
        ) {
          utilization =
            department.equipmentUtilizations.reduce(
              (sum, value) =>
                sum + value,
              0
            ) /
            department.equipmentUtilizations
              .length;
        } else if (
          equipmentCount > 0
        ) {
          /*
           * Fallback calculation.
           *
           * Analytics backend uses:
           *
           * available hours =
           * selected days × 8 hours
           *
           * Therefore:
           *
           * utilization =
           * usage hours /
           * (equipment count × days × 8)
           */
          const availableHours =
            equipmentCount *
            selectedPeriodDays *
            8;

          utilization =
            availableHours > 0
              ? (department.usageHours /
                  availableHours) *
                100
              : 0;
        }

        /*
         * Usage share is separate from utilization.
         */
        return {
          name: department.name,
          bookings: department.bookings,
          usageHours: Number(
            department.usageHours.toFixed(2)
          ),
          equipmentCount,
          utilization: Number(
            Math.min(
              Math.max(
                utilization,
                0
              ),
              100
            ).toFixed(2)
          ),
        };
      })
      .sort(
        (a, b) =>
          b.usageHours -
          a.usageHours
      );
  }, [
    departmentBookings,
    equipmentMap,
    equipmentUtilizationMap,
    selectedPeriodDays,
  ]);

  /*
   * Department summary.
   */
  const totalDepartmentBookings =
    departmentUsage.reduce(
      (sum, department) =>
        sum + department.bookings,
      0
    );

  const totalDepartmentUsageHours =
    departmentUsage.reduce(
      (sum, department) =>
        sum + department.usageHours,
      0
    );

  const totalDepartments =
    departmentUsage.length;

  const mostUsedDepartment =
    departmentUsage.length > 0
      ? departmentUsage[0]
      : null;

  const leastUsedDepartment =
    departmentUsage.length > 0
      ? departmentUsage[
          departmentUsage.length - 1
        ]
      : null;

  const averageDepartmentUtilization =
    departmentUsage.length > 0
      ? departmentUsage.reduce(
          (sum, department) =>
            sum +
            department.utilization,
          0
        ) / departmentUsage.length
      : 0;

  /*
   * =====================================================
   * TASK 5.2.3
   * MAINTENANCE & DOWNTIME
   * =====================================================
   */

  const completedMaintenance =
    filteredMaintenanceRequests.filter(
      (item) =>
        getStatus(item) ===
        "COMPLETED"
    ).length;

  const pendingMaintenance =
    filteredMaintenanceRequests.filter(
      (item) =>
        ["PENDING", "OPEN"].includes(
          getStatus(item)
        )
    ).length;

  const inProgressMaintenance =
    filteredMaintenanceRequests.filter(
      (item) =>
        ["IN_PROGRESS"].includes(
          getStatus(item)
        )
    ).length;

  const completedWorkOrders =
    filteredWorkOrders.filter(
      (item) =>
        getStatus(item) ===
        "COMPLETED"
    ).length;

  const pendingWorkOrders =
    filteredWorkOrders.filter(
      (item) =>
        ["PENDING", "OPEN"].includes(
          getStatus(item)
        )
    ).length;

  const inProgressWorkOrders =
    filteredWorkOrders.filter(
      (item) =>
        ["IN_PROGRESS"].includes(
          getStatus(item)
        )
    ).length;

  const getDowntimeHours = (
    workOrder
  ) => {
    const directValue =
      workOrder?.downtimeHours ??
      workOrder?.downtime ??
      workOrder?.totalDowntimeHours;

    if (
      directValue !== undefined &&
      directValue !== null
    ) {
      return getNumber(
        directValue
      );
    }

    if (
      workOrder?.actualStart &&
      workOrder?.actualEnd
    ) {
      const start =
        new Date(
          workOrder.actualStart
        );

      const end =
        new Date(
          workOrder.actualEnd
        );

      if (
        !Number.isNaN(
          start.getTime()
        ) &&
        !Number.isNaN(
          end.getTime()
        )
      ) {
        return Math.max(
          (end.getTime() -
            start.getTime()) /
            (1000 * 60 * 60),
          0
        );
      }
    }

    if (
      workOrder?.scheduledStart &&
      workOrder?.scheduledEnd
    ) {
      const start =
        new Date(
          workOrder.scheduledStart
        );

      const end =
        new Date(
          workOrder.scheduledEnd
        );

      if (
        !Number.isNaN(
          start.getTime()
        ) &&
        !Number.isNaN(
          end.getTime()
        )
      ) {
        return Math.max(
          (end.getTime() -
            start.getTime()) /
            (1000 * 60 * 60),
          0
        );
      }
    }

    return 0;
  };

  const totalDowntime =
    filteredWorkOrders.reduce(
      (sum, workOrder) =>
        sum +
        getDowntimeHours(
          workOrder
        ),
      0
    );

  const maintenanceEquipmentMap =
    {};

  filteredMaintenanceRequests.forEach(
    (request) => {
      const equipmentId =
        getEquipmentId(request);

      const equipmentName =
        getEquipmentName(request);

      const key =
        equipmentId !== null
          ? String(equipmentId)
          : equipmentName;

      if (
        !maintenanceEquipmentMap[key]
      ) {
        maintenanceEquipmentMap[key] = {
          equipmentId,
          equipmentName,
          requestCount: 0,
        };
      }

      maintenanceEquipmentMap[
        key
      ].requestCount += 1;
    }
  );

  filteredWorkOrders.forEach(
    (workOrder) => {
      const equipmentId =
        getEquipmentId(workOrder);

      const equipmentName =
        getEquipmentName(
          workOrder
        );

      const key =
        equipmentId !== null
          ? String(equipmentId)
          : equipmentName;

      if (
        !maintenanceEquipmentMap[key]
      ) {
        maintenanceEquipmentMap[key] = {
          equipmentId,
          equipmentName,
          requestCount: 0,
        };
      }

      maintenanceEquipmentMap[
        key
      ].requestCount += 1;
    }
  );

  const maintenanceEquipmentRanking =
    Object.values(
      maintenanceEquipmentMap
    ).sort(
      (a, b) =>
        b.requestCount -
        a.requestCount
    );

  const mostMaintainedEquipment =
    maintenanceEquipmentRanking.length >
    0
      ? maintenanceEquipmentRanking[0]
      : null;

  /*
   * =====================================================
   * TASK 5.2.4
   * INTER-INSTITUTION SHARING
   * =====================================================
   */

  const sharingInstitutionSet =
    new Set();

  const usingInstitutionSet =
    new Set();

  filteredSharedEquipment.forEach(
    (item) => {
      sharingInstitutionSet.add(
        getInstitutionName(
          item,
          "sharing"
        )
      );

      usingInstitutionSet.add(
        getInstitutionName(
          item,
          "using"
        )
      );
    }
  );

  filteredBilling.forEach(
    (item) => {
      sharingInstitutionSet.add(
        getInstitutionName(
          item,
          "sharing"
        )
      );

      usingInstitutionSet.add(
        getInstitutionName(
          item,
          "using"
        )
      );
    }
  );

  const sharingUsageHours =
    filteredBilling.reduce(
      (sum, item) =>
        sum +
        getNumber(
          item?.usageHours ??
            item?.hours ??
            item?.usedHours
        ),
      0
    );

  const paidBilling =
    filteredBilling.filter(
      (item) =>
        getStatus(item) ===
        "PAID"
    ).length;

  const pendingBilling =
    filteredBilling.filter(
      (item) =>
        [
          "PENDING",
          "GENERATED",
        ].includes(
          getStatus(item)
        )
    ).length;

  const sharedEquipmentSet =
    new Set();

  filteredSharedEquipment.forEach(
    (item) => {
      const id =
        getEquipmentId(item) ??
        getEquipmentName(item);

      sharedEquipmentSet.add(
        String(id)
      );
    }
  );

  /*
   * =====================================================
   * TASK 5.2.5
   * COST & PROCUREMENT
   * =====================================================
   */

  const totalCost =
    filteredCosts.reduce(
      (sum, item) =>
        sum +
        getNumber(
          item?.totalCost ??
            item?.amount ??
            item?.cost ??
            item?.billingAmount
        ),
      0
    );

  const usageCost =
    filteredCosts
      .filter((item) => {
        const type = (
          item?.costType ||
          item?.type ||
          ""
        )
          .toString()
          .toUpperCase();

        return type.includes(
          "USAGE"
        );
      })
      .reduce(
        (sum, item) =>
          sum +
          getNumber(
            item?.totalCost ??
              item?.amount ??
              item?.cost
          ),
        0
      );

  const maintenanceCost =
    filteredCosts
      .filter((item) => {
        const type = (
          item?.costType ||
          item?.type ||
          ""
        )
          .toString()
          .toUpperCase();

        return (
          type.includes(
            "MAINTENANCE"
          ) ||
          type.includes("REPAIR")
        );
      })
      .reduce(
        (sum, item) =>
          sum +
          getNumber(
            item?.totalCost ??
              item?.amount ??
              item?.cost
          ),
        0
      );

  const totalBudget =
    filteredBudgets.reduce(
      (sum, item) =>
        sum +
        getNumber(
          item?.budgetAmount ??
            item?.amount ??
            item?.totalBudget
        ),
      0
    );

  const usedBudget =
    filteredBudgets.reduce(
      (sum, item) =>
        sum +
        getNumber(
          item?.usedAmount
        ),
      0
    );

  const remainingBudget =
    Math.max(
      totalBudget -
        usedBudget,
      0
    );

  const budgetUtilization =
    totalBudget > 0
      ? Math.min(
          (usedBudget /
            totalBudget) *
            100,
          100
        )
      : 0;

  const recoveredAmount =
    filteredRecovery.reduce(
      (sum, item) =>
        sum +
        getNumber(
          item?.recoveredAmount ??
            item?.amountRecovered
        ),
      0
    );

  const recoverableAmount =
    filteredRecovery.reduce(
      (sum, item) =>
        sum +
        getNumber(
          item?.recoverableAmount ??
            item?.amount ??
            item?.totalAmount
        ),
      0
    );

  const outstandingAmount =
    filteredRecovery.reduce(
      (sum, item) =>
        sum +
        getNumber(
          item?.outstandingAmount
        ),
      0
    );

  const calculatedOutstanding =
    outstandingAmount > 0
      ? outstandingAmount
      : Math.max(
          recoverableAmount -
            recoveredAmount,
          0
        );

  const recoveryPercentage =
    recoverableAmount > 0
      ? Math.min(
          (recoveredAmount /
            recoverableAmount) *
            100,
          100
        )
      : 0;

  const billingAmount =
    filteredBilling.reduce(
      (sum, item) =>
        sum +
        getNumber(
          item?.amount ??
            item?.billingAmount
        ),
      0
    );

  const formatCurrency = (
    value
  ) => {
    return `₹${getNumber(
      value
    ).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;
  };

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (loading) {
    return (
      <div className="reports-page">
        <div className="reports-loading">
          <div className="reports-spinner"></div>
          <p>
            Loading reports...
          </p>
        </div>
      </div>
    );
  }

  /*
   * =====================================================
   * PAGE
   * =====================================================
   */

  return (
    <div className="reports-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="reports-header">
        <div>
          <h1>
            Reports Dashboard
          </h1>

          <p>
            Analyze equipment utilization, department
            usage, maintenance, sharing and costs.
          </p>
        </div>

        <button
          className="reports-refresh-btn"
          onClick={loadReports}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="reports-error">
          <strong>
            Error:
          </strong>{" "}
          {error}
        </div>
      )}

      {/* =================================================
          DATE FILTER
      ================================================= */}

      <div className="reports-filter-card">

        <div className="filter-group">
          <label>
            Start Date
          </label>

          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={(e) =>
              setStartDate(
                e.target.value
              )
            }
          />
        </div>

        <div className="filter-group">
          <label>
            End Date
          </label>

          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) =>
              setEndDate(
                e.target.value
              )
            }
          />
        </div>

        <button
          className="apply-filter-btn"
          onClick={loadReports}
        >
          Apply Filter
        </button>


        <button
          type="button"
          className="report-export-btn excel-export-btn"
          onClick={exportToExcel}
        >
          Export Excel
        </button>


        <button
          className="report-export-btn pdf-export-btn"
          onClick={exportToPDF}
        >
          Export PDF
        </button>

      </div>

      {/* =================================================
          OVERALL SUMMARY
      ================================================= */}

      <div className="reports-cards">

        <div className="report-card">
          <div className="report-card-icon">
            🔬
          </div>

          <div>
            <span>
              Total Equipment
            </span>

            <strong>
              {totalEquipment}
            </strong>
          </div>
        </div>

        <div className="report-card">
          <div className="report-card-icon">
            📅
          </div>

          <div>
            <span>
              Total Bookings
            </span>

            <strong>
              {totalBookings}
            </strong>
          </div>
        </div>

        <div className="report-card">
          <div className="report-card-icon">
            📊
          </div>

          <div>
            <span>
              Avg. Utilization
            </span>

            <strong>
              {getNumber(
                averageUtilization
              ).toFixed(1)}
              %
            </strong>
          </div>
        </div>

        <div className="report-card">
          <div className="report-card-icon">
            🛠️
          </div>

          <div>
            <span>
              Maintenance Requests
            </span>

            <strong>
              {
                filteredMaintenanceRequests.length
              }
            </strong>
          </div>
        </div>

        <div className="report-card">
          <div className="report-card-icon">
            💰
          </div>

          <div>
            <span>
              Total Cost
            </span>

            <strong>
              {formatCurrency(
                totalCost
              )}
            </strong>
          </div>
        </div>

        <div className="report-card">
          <div className="report-card-icon">
            🏢
          </div>

          <div>
            <span>
              Shared Equipment
            </span>

            <strong>
              {sharedEquipmentSet.size ||
                filteredSharedEquipment.length}
            </strong>
          </div>
        </div>

      </div>

      {/* =================================================
          TASK 5.2.1
          EQUIPMENT UTILIZATION REPORT
      ================================================= */}

      <section className="reports-section">

        <div className="section-title">
          <div>
            <h2>
              5.2.1 Equipment Utilization Report
            </h2>

            <span>
              Equipment usage, utilization ranking and
              demand analysis.
            </span>
          </div>
        </div>

        <div className="utilization-summary-grid">

          <div className="utilization-summary-card">
            <span>
              Average Utilization
            </span>

            <strong>
              {getNumber(
                averageUtilization
              ).toFixed(1)}
              %
            </strong>

            <small>
              Selected period
            </small>
          </div>

          <div className="utilization-summary-card">
            <span>
              Highest Utilization
            </span>

            <strong>
              {highestEquipment}
            </strong>

            <small>
              {highestRankingEquipment
                ? `${getNumber(
                    highestRankingEquipment.utilizationPercentage ??
                      highestRankingEquipment.utilization ??
                      highestRankingEquipment.utilizationRate
                  ).toFixed(1)}% utilization`
                : "Best performing equipment"}
            </small>
          </div>

          <div className="utilization-summary-card">
            <span>
              Lowest Utilization
            </span>

            <strong>
              {lowestEquipment}
            </strong>

            <small>
              {lowestRankingEquipment
                ? `${getNumber(
                    lowestRankingEquipment.utilizationPercentage ??
                      lowestRankingEquipment.utilization ??
                      lowestRankingEquipment.utilizationRate
                  ).toFixed(1)}% utilization`
                : "Requires attention"}
            </small>
          </div>

          <div className="utilization-summary-card">
            <span>
              Equipment Analyzed
            </span>

            <strong>
              {ranking.length ||
                equipment.length}
            </strong>

            <small>
              Equipment records
            </small>
          </div>

        </div>

        <div className="reports-two-column">

          <div className="reports-panel chart-panel">

            <h3>
              Equipment Utilization Ranking
            </h3>

            {ranking.length === 0 ? (
              <div className="empty-report">
                No utilization ranking data available
                for the selected period.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={340}
              >
                <BarChart
                  data={ranking.slice(
                    0,
                    10
                  )}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 5,
                    bottom: 70,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="equipmentName"
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    height={90}
                  />

                  <YAxis
                    domain={[
                      0,
                      100,
                    ]}
                    tickFormatter={(
                      value
                    ) =>
                      `${value}%`
                    }
                  />

                  <Tooltip
                    formatter={(
                      value,
                      name
                    ) => [
                      `${getNumber(
                        value
                      ).toFixed(1)}%`,
                      name,
                    ]}
                  />

                  <Legend />

                  <Bar
                    dataKey="utilizationPercentage"
                    name="Utilization"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}

          </div>

          <div className="reports-panel">

            <h3>
              Utilization Highlights
            </h3>

            <div className="highlight-item">
              <span>
                Highest Utilization
              </span>

              <strong>
                {highestEquipment}
              </strong>
            </div>

            <div className="highlight-item">
              <span>
                Lowest Utilization
              </span>

              <strong>
                {lowestEquipment}
              </strong>
            </div>

            <div className="highlight-item">
              <span>
                Average Utilization
              </span>

              <strong>
                {getNumber(
                  averageUtilization
                ).toFixed(1)}
                %
              </strong>
            </div>

            <div className="highlight-item">
              <span>
                Equipment Analyzed
              </span>

              <strong>
                {ranking.length ||
                  equipment.length}
              </strong>
            </div>

            <div className="highlight-item">
              <span>
                Report Period
              </span>

              <strong>
                {startDate} →{" "}
                {endDate}
              </strong>
            </div>

          </div>

        </div>

        <div className="reports-panel utilization-table-panel">

          <div className="utilization-table-header">

            <div>
              <h3>
                Equipment-wise Utilization
              </h3>

              <p>
                Booking count, utilization and demand
                based on the selected date range.
              </p>
            </div>

            <span className="table-record-count">
              {ranking.length} Records
            </span>

          </div>

          {ranking.length === 0 ? (
            <div className="empty-report">
              No equipment utilization records found.
            </div>
          ) : (
            <div className="report-table-wrapper">

              <table className="report-table utilization-report-table">

                <thead>
                  <tr>
                    <th>#</th>
                    <th>Equipment</th>
                    <th>Booking Count</th>
                    <th>Utilization</th>
                    <th>Demand</th>
                  </tr>
                </thead>

                <tbody>

                  {ranking.map(
                    (item, index) => {

                      const utilization =
                        getNumber(
                          item.utilizationPercentage ??
                            item.utilization ??
                            item.utilizationRate
                        );

                      const bookingCount =
                        getNumber(
                          item.bookingCount ??
                            item.totalBookings ??
                            item.bookings
                        );

                      const demandItem =
                        demand.find(
                          (d) =>
                            String(
                              d.equipmentId
                            ) ===
                            String(
                              item.equipmentId
                            )
                        );

                      const demandLevel =
                        item.demandLevel ||
                        item.demand ||
                        demandItem?.demandLevel ||
                        demandItem?.demand ||
                        "N/A";

                      return (
                        <tr
                          key={
                            item.equipmentId ||
                            item.id ||
                            index
                          }
                        >
                          <td>
                            <span className="ranking-number">
                              {index + 1}
                            </span>
                          </td>

                          <td>
                            <strong className="equipment-report-name">
                              {item.equipmentName ||
                                item.name ||
                                "Unknown Equipment"}
                            </strong>
                          </td>

                          <td>
                            {bookingCount}
                          </td>

                          <td>
                            <div className="utilization-cell">

                              <div className="utilization-bar">
                                <div
                                  className="utilization-bar-fill"
                                  style={{
                                    width: `${Math.min(
                                      Math.max(
                                        utilization,
                                        0
                                      ),
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>

                              <span>
                                {utilization.toFixed(
                                  1
                                )}
                                %
                              </span>

                            </div>
                          </td>

                          <td>
                            <span
                              className={`demand-badge ${String(
                                demandLevel
                              ).toLowerCase()}`}
                            >
                              {demandLevel}
                            </span>
                          </td>
                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </section>

      {/* =================================================
          TASK 5.2.2
          DEPARTMENT / RESOURCE USAGE
      ================================================= */}

      <section className="reports-section">

        <div className="section-title">
          <div>
            <h2>
              5.2.2 Department / Resource Usage
            </h2>

            <span>
              Department-wise booking activity and
              equipment resource usage.
            </span>
          </div>
        </div>

        {/* =================================================
            DEPARTMENT SUMMARY
        ================================================= */}

        <div className="department-summary-grid">

          <div className="department-summary-card">
            <span>
              Departments
            </span>

            <strong>
              {totalDepartments}
            </strong>

            <small>
              Departments with booking activity
            </small>
          </div>

          <div className="department-summary-card">
            <span>
              Total Bookings
            </span>

            <strong>
              {totalDepartmentBookings}
            </strong>

            <small>
              Bookings in selected period
            </small>
          </div>

          <div className="department-summary-card">
            <span>
              Equipment Usage
            </span>

            <strong>
              {totalDepartmentUsageHours.toFixed(
                2
              )}{" "}
              hrs
            </strong>

            <small>
              Calculated from booking times
            </small>
          </div>

          <div className="department-summary-card">
            <span>
              Avg. Department Utilization
            </span>

            <strong>
              {averageDepartmentUtilization.toFixed(
                1
              )}
              %
            </strong>

            <small>
              Based on equipment utilization
            </small>
          </div>

        </div>

        {/* =================================================
            CHART + HIGHLIGHTS
        ================================================= */}

        <div className="department-main-grid">

          <div className="reports-panel">

            <div className="report-panel-header">

              <div>
                <h3>
                  Department Equipment Usage
                </h3>

                <p>
                  Actual booking hours calculated from
                  start and end times.
                </p>
              </div>

            </div>

            {departmentUsage.length === 0 ? (

              <div className="report-empty-state">
                No department booking data found
                for the selected period.
              </div>

            ) : (

              <div className="department-chart">

                <ResponsiveContainer
                  width="100%"
                  height={360}
                >

                  <BarChart
                    data={departmentUsage}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 10,
                      bottom: 60,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="name"
                      angle={-20}
                      textAnchor="end"
                      interval={0}
                      height={80}
                    />

                    <YAxis />

                    <Tooltip
                      formatter={(
                        value,
                        name
                      ) => {
                        if (
                          name ===
                          "Usage Hours"
                        ) {
                          return [
                            `${Number(
                              value
                            ).toFixed(
                              2
                            )} hrs`,
                            name,
                          ];
                        }

                        return [
                          value,
                          name,
                        ];
                      }}
                    />

                    <Legend />

                    <Bar
                      dataKey="usageHours"
                      name="Usage Hours"
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            )}

          </div>

          <div className="reports-panel">

            <div className="report-panel-header">

              <div>
                <h3>
                  Department Highlights
                </h3>
              </div>

            </div>

            <div className="department-highlights">

              <div className="department-highlight-row">
                <span>
                  Most Used Department
                </span>

                <strong>
                  {mostUsedDepartment?.name ||
                    "No Data"}
                </strong>
              </div>

              <div className="department-highlight-row">
                <span>
                  Least Used Department
                </span>

                <strong>
                  {leastUsedDepartment?.name ||
                    "No Data"}
                </strong>
              </div>

              <div className="department-highlight-row">
                <span>
                  Total Equipment Usage
                </span>

                <strong>
                  {totalDepartmentUsageHours.toFixed(
                    2
                  )}{" "}
                  hrs
                </strong>
              </div>

              <div className="department-highlight-row">
                <span>
                  Department Count
                </span>

                <strong>
                  {totalDepartments}
                </strong>
              </div>

              <div className="department-highlight-row">
                <span>
                  Avg. Utilization
                </span>

                <strong>
                  {averageDepartmentUtilization.toFixed(
                    1
                  )}
                  %
                </strong>
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            DEPARTMENT TABLE
        ================================================= */}

        <div className="reports-panel department-table-panel">

          <div className="utilization-table-header">

            <div>
              <h3>
                Department-wise Resource Usage
              </h3>

              <p>
                Booking activity and equipment usage
                derived from live database records.
              </p>
            </div>

            <span className="table-record-count">
              {departmentUsage.length}{" "}
              {departmentUsage.length === 1
                ? "Department"
                : "Departments"}
            </span>

          </div>

          {departmentUsage.length === 0 ? (

            <div className="empty-report">
              No department usage records available.
            </div>

          ) : (

            <div className="report-table-wrapper">

              <table className="report-table department-report-table">

                <thead>

                  <tr>
                    <th>#</th>
                    <th>Department</th>
                    <th>Bookings</th>
                    <th>Equipment Usage</th>
                    <th>Equipment Count</th>
                    <th>Utilization</th>
                    <th>Usage Share</th>
                  </tr>

                </thead>

                <tbody>

                  {departmentUsage.map(
                    (
                      department,
                      index
                    ) => {

                      const usageShare =
                        totalDepartmentUsageHours >
                        0
                          ? (
                              (department.usageHours /
                                totalDepartmentUsageHours) *
                              100
                            )
                          : 0;

                      return (
                        <tr
                          key={
                            department.name
                          }
                        >

                          <td>
                            <span className="department-row-number">
                              {index + 1}
                            </span>
                          </td>

                          <td>
                            <strong className="department-name-text">
                              {department.name}
                            </strong>
                          </td>

                          <td>
                            {department.bookings}
                          </td>

                          <td>
                            <strong>
                              {department.usageHours.toFixed(
                                2
                              )}{" "}
                              hrs
                            </strong>
                          </td>

                          <td>
                            {department.equipmentCount}
                          </td>

                          <td>

                            <div className="department-usage-cell">

                              <strong>
                                {department.utilization.toFixed(
                                  1
                                )}
                                %
                              </strong>

                              <div className="department-usage-bar">

                                <div
                                  className="department-usage-fill"
                                  style={{
                                    width: `${Math.min(
                                      Math.max(
                                        department.utilization,
                                        0
                                      ),
                                      100
                                    )}%`,
                                  }}
                                />

                              </div>

                            </div>

                          </td>

                          <td>

                            <div className="department-usage-cell">

                              <strong>
                                {usageShare.toFixed(
                                  1
                                )}
                                %
                              </strong>

                              <div className="department-usage-bar usage-share-bar">

                                <div
                                  className="department-usage-fill"
                                  style={{
                                    width: `${Math.min(
                                      Math.max(
                                        usageShare,
                                        0
                                      ),
                                      100
                                    )}%`,
                                  }}
                                />

                              </div>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </section>

      {/* =================================================
          BOOKING TRENDS
      ================================================= */}

      <section className="reports-section">

        <div className="section-title">
          <div>
            <h2>
              Booking & Usage Trends
            </h2>

            <span>
              Booking activity during the selected
              period.
            </span>
          </div>
        </div>

        <div className="reports-panel chart-panel">

          {trends.length === 0 ? (
            <div className="empty-report">
              No trend data available.
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={330}
            >
              <LineChart
                data={trends}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="date"
                />

                <YAxis />

                <Tooltip />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="bookingCount"
                  name="Bookings"
                  strokeWidth={3}
                />

              </LineChart>
            </ResponsiveContainer>
          )}

        </div>

      </section>

      {/* =================================================
          TASK 5.2.3
          MAINTENANCE & DOWNTIME
      ================================================= */}

      <section className="reports-section">

        <div className="section-title">
          <div>
            <h2>
              5.2.3 Maintenance & Downtime
            </h2>

            <span>
              Maintenance requests, work orders and
              equipment downtime.
            </span>
          </div>
        </div>

        <div className="maintenance-summary-grid">

          <div className="status-box">
            <span>
              Total Requests
            </span>

            <strong>
              {
                filteredMaintenanceRequests.length
              }
            </strong>
          </div>

          <div className="status-box pending">
            <span>
              Pending
            </span>

            <strong>
              {pendingMaintenance}
            </strong>
          </div>

          <div className="status-box progress">
            <span>
              In Progress
            </span>

            <strong>
              {inProgressMaintenance}
            </strong>
          </div>

          <div className="status-box completed">
            <span>
              Completed
            </span>

            <strong>
              {completedMaintenance}
            </strong>
          </div>

          <div className="status-box">
            <span>
              Total Work Orders
            </span>

            <strong>
              {filteredWorkOrders.length}
            </strong>
          </div>

          <div className="status-box completed">
            <span>
              Completed Work Orders
            </span>

            <strong>
              {completedWorkOrders}
            </strong>
          </div>

          <div className="status-box">
            <span>
              Work In Progress
            </span>

            <strong>
              {inProgressWorkOrders}
            </strong>
          </div>

          <div className="status-box downtime-box">
            <span>
              Equipment Downtime
            </span>

            <strong>
              {totalDowntime.toFixed(
                1
              )}{" "}
              hrs
            </strong>
          </div>

        </div>

        <div className="reports-two-column">

          <div className="reports-panel">

            <h3>
              Maintenance Status
            </h3>

            <div className="maintenance-status-list">

              <div className="maintenance-status-row">
                <span>
                  Pending Requests
                </span>

                <strong>
                  {pendingMaintenance}
                </strong>
              </div>

              <div className="maintenance-status-row">
                <span>
                  In Progress Requests
                </span>

                <strong>
                  {inProgressMaintenance}
                </strong>
              </div>

              <div className="maintenance-status-row">
                <span>
                  Completed Requests
                </span>

                <strong>
                  {completedMaintenance}
                </strong>
              </div>

              <div className="maintenance-status-row">
                <span>
                  Completed Work Orders
                </span>

                <strong>
                  {completedWorkOrders}
                </strong>
              </div>

            </div>

          </div>

          <div className="reports-panel">

            <h3>
              Maintenance Highlights
            </h3>

            <div className="highlight-item">
              <span>
                Most-Maintained Equipment
              </span>

              <strong>
                {mostMaintainedEquipment?.equipmentName ||
                  "N/A"}
              </strong>
            </div>

            <div className="highlight-item">
              <span>
                Maintenance Records
              </span>

              <strong>
                {filteredMaintenanceRequests.length +
                  filteredWorkOrders.length}
              </strong>
            </div>

            <div className="highlight-item">
              <span>
                Total Downtime
              </span>

              <strong>
                {totalDowntime.toFixed(
                  1
                )}{" "}
                hrs
              </strong>
            </div>

          </div>

        </div>

        <div className="reports-panel maintenance-table-panel">

          <div className="utilization-table-header">

            <div>
              <h3>
                Most-Maintained Equipment
              </h3>

              <p>
                Equipment ranked by maintenance
                request and work-order activity.
              </p>
            </div>

            <span className="table-record-count">
              {
                maintenanceEquipmentRanking.length
              }{" "}
              Records
            </span>

          </div>

          {maintenanceEquipmentRanking.length ===
          0 ? (
            <div className="empty-report">
              No maintenance equipment data found.
            </div>
          ) : (
            <div className="report-table-wrapper">

              <table className="report-table">

                <thead>
                  <tr>
                    <th>#</th>
                    <th>Equipment</th>
                    <th>Maintenance Records</th>
                  </tr>
                </thead>

                <tbody>

                  {maintenanceEquipmentRanking
                    .slice(0, 10)
                    .map(
                      (
                        item,
                        index
                      ) => (
                        <tr
                          key={
                            item.equipmentId ||
                            item.equipmentName
                          }
                        >
                          <td>
                            <span className="ranking-number">
                              {index + 1}
                            </span>
                          </td>

                          <td>
                            <strong>
                              {item.equipmentName}
                            </strong>
                          </td>

                          <td>
                            {item.requestCount}
                          </td>
                        </tr>
                      )
                    )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </section>

      {/* =================================================
          TASK 5.2.4
          INTER-INSTITUTION SHARING
      ================================================= */}

      <section className="reports-section">

        <div className="section-title">
          <div>
            <h2>
              5.2.4 Inter-Institution Sharing
            </h2>

            <span>
              Shared resources, institutions, usage and
              billing activity.
            </span>
          </div>
        </div>

        <div className="sharing-summary-grid">

          <div className="status-box">
            <span>
              Shared Equipment
            </span>

            <strong>
              {sharedEquipmentSet.size ||
                filteredSharedEquipment.length}
            </strong>
          </div>

          <div className="status-box">
            <span>
              Sharing Institutions
            </span>

            <strong>
              {sharingInstitutionSet.size}
            </strong>
          </div>

          <div className="status-box">
            <span>
              Using Institutions
            </span>

            <strong>
              {usingInstitutionSet.size}
            </strong>
          </div>

          <div className="status-box">
            <span>
              Usage Hours
            </span>

            <strong>
              {sharingUsageHours.toFixed(
                1
              )}
            </strong>
          </div>

          <div className="status-box">
            <span>
              Billing Records
            </span>

            <strong>
              {filteredBilling.length}
            </strong>
          </div>

          <div className="status-box pending">
            <span>
              Pending Billing
            </span>

            <strong>
              {pendingBilling}
            </strong>
          </div>

          <div className="status-box completed">
            <span>
              Paid Billing
            </span>

            <strong>
              {paidBilling}
            </strong>
          </div>

          <div className="status-box">
            <span>
              Billing Amount
            </span>

            <strong>
              {formatCurrency(
                billingAmount
              )}
            </strong>
          </div>

        </div>

        <div className="reports-two-column">

          <div className="reports-panel">

            <h3>
              Sharing Overview
            </h3>

            <div className="finance-row">
              <span>
                Shared Equipment
              </span>

              <strong>
                {sharedEquipmentSet.size ||
                  filteredSharedEquipment.length}
              </strong>
            </div>

            <div className="finance-row">
              <span>
                Sharing Institutions
              </span>

              <strong>
                {sharingInstitutionSet.size}
              </strong>
            </div>

            <div className="finance-row">
              <span>
                Using Institutions
              </span>

              <strong>
                {usingInstitutionSet.size}
              </strong>
            </div>

            <div className="finance-row">
              <span>
                Usage Hours
              </span>

              <strong>
                {sharingUsageHours.toFixed(
                  1
                )}{" "}
                hrs
              </strong>
            </div>

          </div>

          <div className="reports-panel">

            <h3>
              Billing Status
            </h3>

            <div className="billing-status-chart">

              <div className="billing-status-item">
                <span>
                  Pending / Generated
                </span>

                <strong>
                  {pendingBilling}
                </strong>
              </div>

              <div className="billing-status-item">
                <span>
                  Paid
                </span>

                <strong>
                  {paidBilling}
                </strong>
              </div>

              <div className="billing-status-item">
                <span>
                  Total Records
                </span>

                <strong>
                  {filteredBilling.length}
                </strong>
              </div>

            </div>

          </div>

        </div>

        <div className="reports-panel">

          <div className="utilization-table-header">

            <div>
              <h3>
                Inter-Institution Billing Records
              </h3>

              <p>
                Billing activity for shared resources.
              </p>
            </div>

            <span className="table-record-count">
              {filteredBilling.length} Records
            </span>

          </div>

          {filteredBilling.length === 0 ? (
            <div className="empty-report">
              No billing records found.
            </div>
          ) : (
            <div className="report-table-wrapper">

              <table className="report-table">

                <thead>
                  <tr>
                    <th>
                      Sharing Institution
                    </th>

                    <th>
                      Using Institution
                    </th>

                    <th>
                      Equipment
                    </th>

                    <th>
                      Usage Hours
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {filteredBilling.map(
                    (
                      item,
                      index
                    ) => (
                      <tr
                        key={
                          item.id ||
                          index
                        }
                      >
                        <td>
                          {getInstitutionName(
                            item,
                            "sharing"
                          )}
                        </td>

                        <td>
                          {getInstitutionName(
                            item,
                            "using"
                          )}
                        </td>

                        <td>
                          {getEquipmentName(
                            item
                          )}
                        </td>

                        <td>
                          {getNumber(
                            item.usageHours
                          ).toFixed(
                            1
                          )}
                        </td>

                        <td>
                          <strong>
                            {formatCurrency(
                              item.amount ??
                                item.billingAmount
                            )}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`status-badge ${getStatus(
                              item
                            ).toLowerCase()}`}
                          >
                            {getStatus(
                              item
                            ) ||
                              "N/A"}
                          </span>
                        </td>
                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </section>

      {/* =================================================
          TASK 5.2.5
          COST & PROCUREMENT ANALYSIS
      ================================================= */}

      <section className="reports-section">

        <div className="section-title">
          <div>
            <h2>
              5.2.5 Cost & Procurement Analysis
            </h2>

            <span>
              Costs, budgets, cost recovery and
              inter-institution billing.
            </span>
          </div>
        </div>

        <div className="cost-summary-grid">

          <div className="status-box">
            <span>
              Total Cost
            </span>

            <strong>
              {formatCurrency(
                totalCost
              )}
            </strong>
          </div>

          <div className="status-box">
            <span>
              Usage Cost
            </span>

            <strong>
              {formatCurrency(
                usageCost
              )}
            </strong>
          </div>

          <div className="status-box">
            <span>
              Maintenance Cost
            </span>

            <strong>
              {formatCurrency(
                maintenanceCost
              )}
            </strong>
          </div>

          <div className="status-box">
            <span>
              Total Budget
            </span>

            <strong>
              {formatCurrency(
                totalBudget
              )}
            </strong>
          </div>

          <div className="status-box">
            <span>
              Used Budget
            </span>

            <strong>
              {formatCurrency(
                usedBudget
              )}
            </strong>
          </div>

          <div className="status-box completed">
            <span>
              Remaining Budget
            </span>

            <strong>
              {formatCurrency(
                remainingBudget
              )}
            </strong>
          </div>

          <div className="status-box">
            <span>
              Budget Utilization
            </span>

            <strong>
              {budgetUtilization.toFixed(
                1
              )}
              %
            </strong>
          </div>

          <div className="status-box pending">
            <span>
              Outstanding Recovery
            </span>

            <strong>
              {formatCurrency(
                calculatedOutstanding
              )}
            </strong>
          </div>

        </div>

        <div className="reports-two-column">

          <div className="reports-panel">

            <h3>
              Cost Analysis
            </h3>

            <div className="finance-row">
              <span>
                Cost Records
              </span>

              <strong>
                {filteredCosts.length}
              </strong>
            </div>

            <div className="finance-row">
              <span>
                Total Cost
              </span>

              <strong>
                {formatCurrency(
                  totalCost
                )}
              </strong>
            </div>

            <div className="finance-row">
              <span>
                Usage Cost
              </span>

              <strong>
                {formatCurrency(
                  usageCost
                )}
              </strong>
            </div>

            <div className="finance-row">
              <span>
                Maintenance Cost
              </span>

              <strong>
                {formatCurrency(
                  maintenanceCost
                )}
              </strong>
            </div>

            <div className="finance-row">
              <span>
                Inter-Institution Billing
              </span>

              <strong>
                {formatCurrency(
                  billingAmount
                )}
              </strong>
            </div>

          </div>

          <div className="reports-panel">

            <h3>
              Budget Utilization
            </h3>

            <div className="finance-row">
              <span>
                Total Budget
              </span>

              <strong>
                {formatCurrency(
                  totalBudget
                )}
              </strong>
            </div>

            <div className="finance-row">
              <span>
                Used Budget
              </span>

              <strong>
                {formatCurrency(
                  usedBudget
                )}
              </strong>
            </div>

            <div className="finance-row">
              <span>
                Remaining Budget
              </span>

              <strong>
                {formatCurrency(
                  remainingBudget
                )}
              </strong>
            </div>

            <div className="budget-progress">
              <div
                className="budget-progress-fill"
                style={{
                  width: `${budgetUtilization}%`,
                }}
              ></div>
            </div>

            <p className="budget-percentage">
              {budgetUtilization.toFixed(
                1
              )}
              % budget utilized
            </p>

          </div>

        </div>

        <div className="reports-panel chart-panel">

          <h3>
            Cost & Budget Comparison
          </h3>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <BarChart
              data={[
                {
                  name: "Total Cost",
                  amount: totalCost,
                },
                {
                  name: "Usage Cost",
                  amount: usageCost,
                },
                {
                  name: "Maintenance",
                  amount:
                    maintenanceCost,
                },
                {
                  name: "Budget Used",
                  amount:
                    usedBudget,
                },
                {
                  name: "Remaining Budget",
                  amount:
                    remainingBudget,
                },
              ]}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="name"
              />

              <YAxis />

              <Tooltip
                formatter={(value) =>
                  formatCurrency(
                    value
                  )
                }
              />

              <Legend />

              <Bar
                dataKey="amount"
                name="Amount"
              />

            </BarChart>
          </ResponsiveContainer>

        </div>

        <div className="reports-panel recovery-panel">

          <div className="utilization-table-header">

            <div>
              <h3>
                Cost Recovery
              </h3>

              <p>
                Recoverable, recovered and outstanding
                amounts.
              </p>
            </div>

            <span className="table-record-count">
              {filteredRecovery.length} Records
            </span>

          </div>

          <div className="recovery-summary">

            <div>
              <span>
                Recoverable Amount
              </span>

              <strong>
                {formatCurrency(
                  recoverableAmount
                )}
              </strong>
            </div>

            <div>
              <span>
                Recovered Amount
              </span>

              <strong>
                {formatCurrency(
                  recoveredAmount
                )}
              </strong>
            </div>

            <div>
              <span>
                Outstanding Amount
              </span>

              <strong>
                {formatCurrency(
                  calculatedOutstanding
                )}
              </strong>
            </div>

            <div>
              <span>
                Recovery %
              </span>

              <strong>
                {recoveryPercentage.toFixed(
                  1
                )}
                %
              </strong>
            </div>

          </div>

          <div className="recovery-progress">
            <div
              className="recovery-progress-fill"
              style={{
                width: `${recoveryPercentage}%`,
              }}
            ></div>
          </div>

        </div>

        <div className="reports-panel">

          <div className="utilization-table-header">

            <div>
              <h3>
                Budget Records
              </h3>

              <p>
                Budget allocation and utilization.
              </p>
            </div>

            <span className="table-record-count">
              {filteredBudgets.length} Records
            </span>

          </div>

          {filteredBudgets.length === 0 ? (
            <div className="empty-report">
              No budget records found.
            </div>
          ) : (
            <div className="report-table-wrapper">

              <table className="report-table">

                <thead>
                  <tr>
                    <th>
                      Department
                    </th>

                    <th>
                      Institution
                    </th>

                    <th>
                      Financial Year
                    </th>

                    <th>
                      Budget
                    </th>

                    <th>
                      Used
                    </th>

                    <th>
                      Remaining
                    </th>

                    <th>
                      Utilization
                    </th>

                    <th>
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {filteredBudgets.map(
                    (
                      item,
                      index
                    ) => {

                      const budget =
                        getNumber(
                          item.budgetAmount
                        );

                      const used =
                        getNumber(
                          item.usedAmount
                        );

                      const remaining =
                        Math.max(
                          budget -
                            used,
                          0
                        );

                      const utilization =
                        budget >
                        0
                          ? Math.min(
                              (used /
                                budget) *
                                100,
                              100
                            )
                          : 0;

                      return (
                        <tr
                          key={
                            item.id ||
                            index
                          }
                        >

                          <td>
                            {item.department?.name ||
                              item.departmentName ||
                              "N/A"}
                          </td>

                          <td>
                            {item.institution?.name ||
                              item.institutionName ||
                              "N/A"}
                          </td>

                          <td>
                            {item.financialYear ||
                              "N/A"}
                          </td>

                          <td>
                            {formatCurrency(
                              budget
                            )}
                          </td>

                          <td>
                            {formatCurrency(
                              used
                            )}
                          </td>

                          <td>
                            {formatCurrency(
                              remaining
                            )}
                          </td>

                          <td>
                            {utilization.toFixed(
                              1
                            )}
                            %
                          </td>

                          <td>
                            <span
                              className={`status-badge ${getStatus(
                                item
                              ).toLowerCase()}`}
                            >
                              {getStatus(
                                item
                              ) ||
                                "ACTIVE"}
                            </span>
                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </section>

      {/* =================================================
          DEMAND ANALYSIS
      ================================================= */}

      <section className="reports-section">

        <div className="section-title">
          <div>
            <h2>
              Demand Analysis
            </h2>

            <span>
              Equipment demand classification from
              analytics data.
            </span>
          </div>
        </div>

        <div className="reports-panel">

          {demand.length === 0 ? (
            <div className="empty-report">
              No demand data available.
            </div>
          ) : (
            <div className="report-table-wrapper">

              <table className="report-table">

                <thead>
                  <tr>
                    <th>#</th>
                    <th>
                      Equipment
                    </th>
                    <th>
                      Booking Count
                    </th>
                    <th>
                      Demand Level
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {demand.map(
                    (
                      item,
                      index
                    ) => {

                      const demandLevel =
                        item.demandLevel ||
                        item.demand ||
                        "N/A";

                      return (
                        <tr
                          key={
                            item.equipmentId ||
                            index
                          }
                        >

                          <td>
                            <span className="ranking-number">
                              {index + 1}
                            </span>
                          </td>

                          <td>
                            {item.equipmentName ||
                              "Unknown Equipment"}
                          </td>

                          <td>
                            {item.bookingCount ??
                              item.totalBookings ??
                              0}
                          </td>

                          <td>
                            <span
                              className={`demand-badge ${String(
                                demandLevel
                              ).toLowerCase()}`}
                            >
                              {demandLevel}
                            </span>
                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="reports-footer">

        <span>
          Report period:{" "}
          <strong>
            {startDate}
          </strong>{" "}
          to{" "}
          <strong>
            {endDate}
          </strong>
        </span>

        <span>
          Generated from live PostgreSQL data
        </span>

      </div>

    </div>
  );
};

export default ReportsDashboard;