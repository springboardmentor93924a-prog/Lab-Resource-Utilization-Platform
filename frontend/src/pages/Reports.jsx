import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  getUtilizationCostReport,
  downloadUtilizationCostReportCsv,
} from "../services/equipmentService";
import { isAdmin } from "../utils/auth";

const thStyle = {
  padding: "12px 14px",
  textAlign: "left",
  background: "#0F1B2D",
  color: "#FFFFFF",
  fontSize: "13px",
  fontWeight: 600,
  borderBottom: "1px solid #1E293B",
};

const tdStyle = {
  padding: "12px 14px",
  border: "1px solid #E2E8F0",
  fontSize: "14px",
  color: "#0F172A",
  background: "#FFFFFF",
};

export default function Reports() {
  const navigate = useNavigate();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      alert("You don't have permission to view reports.");
      navigate("/dashboard");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      const data = await getUtilizationCostReport(from, to);

      setRows(data);
      setGenerated(true);
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to generate report."
      );
    } finally {
      setLoading(false);
    }
  }

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
      await downloadUtilizationCostReportCsv(from, to);
    } catch (err) {
      alert("Failed to download CSV.");
    }
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#07152F",
      }}
    >
      {/* Sidebar */}
      <aside className="sidebar">
        <Sidebar />
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          padding: "30px",
          background: "#07152F",
          minHeight: "100vh",
          color: "#FFFFFF",
        }}
      >
        {/* Page heading */}
        <h2
          style={{
            fontWeight: 700,
            color: "#FFFFFF",
            marginBottom: "25px",
            fontSize: "24px",
          }}
        >
          Reports
        </h2>

        {/* Filter / Action Card */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "12px",
            padding: "22px",
            marginBottom: "25px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.20)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "flex-end",
              flexWrap: "wrap",
            }}
          >
            {/* From */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  color: "#0F172A",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                From
              </label>

              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                style={{
                  height: "42px",
                  padding: "8px 12px",
                  border: "1px solid #CBD5E1",
                  borderRadius: "7px",
                  color: "#0F172A",
                  background: "#FFFFFF",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            {/* To */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  color: "#0F172A",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                To
              </label>

              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                style={{
                  height: "42px",
                  padding: "8px 12px",
                  border: "1px solid #CBD5E1",
                  borderRadius: "7px",
                  color: "#0F172A",
                  background: "#FFFFFF",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{
                height: "42px",
                padding: "0 20px",
                border: "none",
                borderRadius: "7px",
                background: "#0F1B2D",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Generating..." : "Generate report"}
            </button>

            {/* Download button */}
           <button
  onClick={handleDownload}
  style={{
    height: "42px",
    padding: "0 20px",
    border: "none",
    borderRadius: "7px",
    background: "#0F1B2D",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  }}
>
  Download CSV
</button>
          </div>
        </div>

        {/* Report Table */}
        {generated && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.20)",
            }}
          >
            <div
              style={{
                overflowX: "auto",
                width: "100%",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  background: "#FFFFFF",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>Equipment</th>
                    <th style={thStyle}>Category</th>
                    <th style={thStyle}>Total bookings</th>
                    <th style={thStyle}>Usage hours</th>
                    <th style={thStyle}>Utilization</th>
                    <th style={thStyle}>Cost</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "center",
                          padding: "25px",
                          color: "#475569",
                        }}
                        colSpan={6}
                      >
                        No data for this date range.
                      </td>
                    </tr>
                  )}

                  {rows.map((r) => (
                    <tr key={r.equipmentId}>
                      <td style={tdStyle}>
                        {r.equipmentName}
                      </td>

                      <td style={tdStyle}>
                        {r.category}
                      </td>

                      <td style={tdStyle}>
                        {r.totalBookings}
                      </td>

                      <td style={tdStyle}>
                        {r.usageHours}
                      </td>

                      <td style={tdStyle}>
                        {r.utilizationRate}%
                      </td>

                      <td style={tdStyle}>
                        ₹{r.totalCost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}