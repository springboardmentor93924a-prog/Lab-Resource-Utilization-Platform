import { useEffect, useState } from "react";
import { getAllCosts, getCostByDepartment, getCostByInstitution, getBillingForInstitution } from "../api/costApi";
import { getAllDepartments } from "../api/departmentApi";
import { getAllInstitutions } from "../api/institutionApi";
import { extractErrorMessage } from "../api/client";
import { page, headerRow, h1Style, subStyle, card, statsRow, statCardStyle, thStyle, tdStyle, errorText, emptyText, pill, selectStyle, labelStyle } from "../styles/shared";

const ALL_ROLES = ["SYSTEM_ADMIN", "INSTITUTION_ADMIN"];
const DEPT_ROLES = ["SYSTEM_ADMIN", "INSTITUTION_ADMIN", "DEPARTMENT_HEAD", "LAB_MANAGER"];

function CostManagementPage({ userRole }) {
  const [costs, setCosts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [institutions, setInstitutions] = useState([]);

  const [deptId, setDeptId] = useState("");
  const [instId, setInstId] = useState("");
  const [deptSummary, setDeptSummary] = useState(null);
  const [instSummary, setInstSummary] = useState(null);
  const [billingSummary, setBillingSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllDepartments().then(setDepartments).catch(() => setDepartments([]));
    getAllInstitutions().then(setInstitutions).catch(() => setInstitutions([]));

    if (ALL_ROLES.includes(userRole)) {
      setLoading(true);
      getAllCosts()
        .then(setCosts)
        .catch((err) => setError(extractErrorMessage(err, "Failed to load cost data.")))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    if (!deptId) { setDeptSummary(null); return; }
    getCostByDepartment(deptId).then(setDeptSummary).catch(() => setDeptSummary(null));
  }, [deptId]);

  useEffect(() => {
    if (!instId || !ALL_ROLES.includes(userRole)) { setInstSummary(null); setBillingSummary(null); return; }
    getCostByInstitution(instId).then(setInstSummary).catch(() => setInstSummary(null));
    getBillingForInstitution(instId).then(setBillingSummary).catch(() => setBillingSummary(null));
  }, [instId, userRole]);

  const totalCost = costs.reduce((sum, c) => sum + Number(c.totalCost || 0), 0);
  const crossInstCount = costs.filter((c) => c.crossInstitution).length;

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>Cost Management</h1>
          <p style={subStyle}>Equipment usage cost tracking and billing summaries</p>
        </div>
      </div>

      {error && <p style={errorText}>{error}</p>}

      {ALL_ROLES.includes(userRole) && (
        <div style={statsRow}>
          <div style={statCardStyle}><div><p style={{ margin: "0 0 4px", color: "#718096", fontSize: 12 }}>Total Records</p><h2 style={{ margin: 0, fontSize: 22 }}>{costs.length}</h2></div></div>
          <div style={statCardStyle}><div><p style={{ margin: "0 0 4px", color: "#718096", fontSize: 12 }}>Total Cost</p><h2 style={{ margin: 0, fontSize: 22 }}>₹{totalCost.toFixed(2)}</h2></div></div>
          <div style={statCardStyle}><div><p style={{ margin: "0 0 4px", color: "#718096", fontSize: 12 }}>Cross-Institution Usage</p><h2 style={{ margin: 0, fontSize: 22 }}>{crossInstCount}</h2></div></div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ ...card, padding: 20 }}>
          <label style={labelStyle}>Department Cost Summary</label>
          <select value={deptId} onChange={(e) => setDeptId(e.target.value)} style={selectStyle}>
            <option value="">Select department</option>
            {departments.map((d) => <option key={d.departId} value={d.departId}>{d.departmentName}</option>)}
          </select>
          {deptSummary && (
            <div style={{ marginTop: 14, fontSize: 13, color: "#334155" }}>
              <p><strong>{deptSummary.name}</strong></p>
              <p>Total Bookings: {deptSummary.totalBookings}</p>
              <p>Total Hours: {deptSummary.totalHours}</p>
              <p>Total Cost: ₹{Number(deptSummary.totalCost || 0).toFixed(2)}</p>
            </div>
          )}
        </div>

        {ALL_ROLES.includes(userRole) && (
          <div style={{ ...card, padding: 20 }}>
            <label style={labelStyle}>Institution Cost & Billing</label>
            <select value={instId} onChange={(e) => setInstId(e.target.value)} style={selectStyle}>
              <option value="">Select institution</option>
              {institutions.map((i) => <option key={i.institutionId} value={i.institutionId}>{i.institutionName}</option>)}
            </select>
            {instSummary && (
              <div style={{ marginTop: 14, fontSize: 13, color: "#334155" }}>
                <p><strong>Usage Cost — {instSummary.name}</strong></p>
                <p>Total Bookings: {instSummary.totalBookings} | Hours: {instSummary.totalHours} | Cost: ₹{Number(instSummary.totalCost || 0).toFixed(2)}</p>
              </div>
            )}
            {billingSummary && (
              <div style={{ marginTop: 10, fontSize: 13, color: "#334155" }}>
                <p><strong>Owed to this institution (cross-institution usage)</strong></p>
                <p>Bookings: {billingSummary.totalBookings} | Hours: {billingSummary.totalHours} | Amount: ₹{Number(billingSummary.totalCost || 0).toFixed(2)}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {ALL_ROLES.includes(userRole) && (
        <div style={card}>
          <div style={{ overflowX: "auto" }}>
            {loading ? (
              <p style={{ padding: 20 }}>Loading cost records...</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={thStyle}>Cost ID</th>
                    <th style={thStyle}>Booking</th>
                    <th style={thStyle}>Equipment</th>
                    <th style={thStyle}>Department</th>
                    <th style={thStyle}>Hours Used</th>
                    <th style={thStyle}>Rate</th>
                    <th style={thStyle}>Total</th>
                    <th style={thStyle}>Cross-Institution</th>
                  </tr>
                </thead>
                <tbody>
                  {costs.map((c) => (
                    <tr key={c.costId} style={{ borderBottom: "1px solid #f0f2f6" }}>
                      <td style={tdStyle}>#{c.costId}</td>
                      <td style={tdStyle}>#{c.bookingId}</td>
                      <td style={tdStyle}>{c.equipName}</td>
                      <td style={tdStyle}>{c.departmentName}</td>
                      <td style={tdStyle}>{c.hoursUsed}</td>
                      <td style={tdStyle}>₹{c.hourlyRate}</td>
                      <td style={tdStyle}>₹{Number(c.totalCost || 0).toFixed(2)}</td>
                      <td style={tdStyle}>
                        {c.crossInstitution ? <span style={pill("#fff4df", "#b56a00")}>Yes</span> : <span style={pill("#f1f5f9", "#475569")}>No</span>}
                      </td>
                    </tr>
                  ))}
                  {costs.length === 0 && (
                    <tr><td colSpan={8} style={emptyText}>No cost records yet.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {!ALL_ROLES.includes(userRole) && !DEPT_ROLES.includes(userRole) && (
        <p style={emptyText}>You don't have access to cost data.</p>
      )}
    </div>
  );
}

export default CostManagementPage;
