import { useEffect, useState, useCallback } from "react";
import "./CostManagement.css";

const API_BASE_URL = "http://localhost:8080/api";

function CostManagement() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState("");
  const [generating, setGenerating] = useState(false);
  const [rateDrafts, setRateDrafts] = useState({});

  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");

  const canEdit = [
    "LAB_MANAGER",
    "DEPARTMENT_HEAD",
    "INSTITUTION_ADMIN",
    "SYSTEM_ADMIN",
  ].includes(role);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const fetchAll = useCallback(async () => {
    try {
      setError("");

      const [recordsRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/costs`, { headers: authHeaders }),
        fetch(`${API_BASE_URL}/costs/summary`, { headers: authHeaders }),
      ]);

      if (!recordsRes.ok || !summaryRes.ok) {
        throw new Error("Failed to load cost data.");
      }

      const recordsData = await recordsRes.json();
      const summaryData = await summaryRes.json();

      setRecords(recordsData);
      setSummary(summaryData);
    } catch (err) {
      console.error(err);
      setError(
        "Could not load cost management data. Please try again shortly."
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleGenerate = async () => {
    setGenerating(true);
    setBanner("");
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/costs/generate`, {
        method: "POST",
        headers: authHeaders,
      });

      if (!res.ok) {
        throw new Error("Failed to generate cost records.");
      }

      const data = await res.json();
      setBanner(data.message || "Cost records generated.");
      await fetchAll();
    } catch (err) {
      console.error(err);
      setError("Could not generate cost records.");
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (usageCostId, newStatus) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/costs/${usageCostId}/status`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({ costStatus: newStatus }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update status.");
      }

      const updated = await res.json();

      setRecords((prev) =>
        prev.map((r) =>
          r.usageCostId === updated.usageCostId ? updated : r
        )
      );

      // Summary totals depend on status, so refresh it too.
      const summaryRes = await fetch(`${API_BASE_URL}/costs/summary`, {
        headers: authHeaders,
      });
      if (summaryRes.ok) {
        setSummary(await summaryRes.json());
      }
    } catch (err) {
      console.error(err);
      setError("Could not update the cost status.");
    }
  };

  const handleRateSave = async (equipmentId) => {
    const draft = rateDrafts[equipmentId];

    if (draft === undefined || draft === "" || Number(draft) < 0) {
      setError("Enter a valid non-negative rate before saving.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/costs/equipment/${equipmentId}/rate`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({ ratePerHour: Number(draft) }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update rate.");
      }

      setBanner("Hourly rate updated.");
      await fetchAll();
    } catch (err) {
      console.error(err);
      setError("Could not update the equipment rate.");
    }
  };

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  if (loading) {
    return (
      <div className="cost-container">
        <p>Loading cost management data...</p>
      </div>
    );
  }

  return (
    <div className="cost-container">
      <div className="cost-header">
        <div>
          <h2 className="cost-title">Cost Management</h2>
          <p className="cost-subtitle">
            Equipment usage billing, department cost allocation and rate
            configuration.
          </p>
        </div>

        {canEdit && (
          <button
            className="cost-refresh-btn"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? "Generating..." : "Generate Cost Records"}
          </button>
        )}
      </div>

      {banner && <div className="cost-banner">{banner}</div>}
      {error && <div className="cost-banner error">{error}</div>}

      {summary && (
        <div className="cost-cards">
          <div className="cost-card">
            <span className="cost-card-label">Total Cost</span>
            <p className="cost-card-value">
              {formatCurrency(summary.totalCost)}
            </p>
          </div>

          <div className="cost-card pending">
            <span className="cost-card-label">Pending</span>
            <p className="cost-card-value">
              {formatCurrency(summary.pendingCost)}
            </p>
          </div>

          <div className="cost-card paid">
            <span className="cost-card-label">Paid</span>
            <p className="cost-card-value">
              {formatCurrency(summary.paidCost)}
            </p>
          </div>

          <div className="cost-card hours">
            <span className="cost-card-label">Billable Hours</span>
            <p className="cost-card-value">
              {Number(summary.totalBillableHours || 0).toFixed(1)} h
            </p>
          </div>

          <div className="cost-card avg">
            <span className="cost-card-label">Avg / Booking</span>
            <p className="cost-card-value">
              {formatCurrency(summary.averageCostPerBooking)}
            </p>
          </div>
        </div>
      )}

      {/* Cost by Equipment + rate editing */}
      <div className="cost-section">
        <h3>Cost by Equipment</h3>
        <p className="cost-section-desc">
          Total billed cost and usage per equipment.
          {canEdit ? " Update hourly rates below." : ""}
        </p>

        <div className="cost-table-wrapper">
          <table className="cost-table">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Usage Count</th>
                <th>Total Hours</th>
                <th>Current Rate / hr</th>
                <th>Total Cost</th>
                {canEdit && <th>Update Rate</th>}
              </tr>
            </thead>
            <tbody>
              {!summary || summary.costByEquipment?.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} className="cost-empty-state">
                    No equipment cost data yet.
                  </td>
                </tr>
              ) : (
                summary.costByEquipment.map((item) => (
                  <tr key={item.equipmentId}>
                    <td>{item.equipmentName}</td>
                    <td>{item.usageCount}</td>
                    <td>{Number(item.totalHours).toFixed(1)} h</td>
                    <td>{formatCurrency(item.ratePerHour)}</td>
                    <td>{formatCurrency(item.totalCost)}</td>
                    {canEdit && (
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          className="cost-rate-input"
                          placeholder={item.ratePerHour}
                          value={
                            rateDrafts[item.equipmentId] !== undefined
                              ? rateDrafts[item.equipmentId]
                              : ""
                          }
                          onChange={(e) =>
                            setRateDrafts((prev) => ({
                              ...prev,
                              [item.equipmentId]: e.target.value,
                            }))
                          }
                        />
                        <button
                          className="cost-rate-save"
                          onClick={() => handleRateSave(item.equipmentId)}
                        >
                          Save
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost by Department */}
      <div className="cost-section">
        <h3>Cost by Department</h3>
        <p className="cost-section-desc">
          Allocated equipment usage cost grouped by requesting department.
        </p>

        <div className="cost-table-wrapper">
          <table className="cost-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Allocations</th>
                <th>Pending</th>
                <th>Paid</th>
                <th>Total Allocated</th>
              </tr>
            </thead>
            <tbody>
              {!summary || summary.costByDepartment?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="cost-empty-state">
                    No department allocations yet.
                  </td>
                </tr>
              ) : (
                summary.costByDepartment.map((item) => (
                  <tr key={item.departmentId}>
                    <td>{item.departmentName}</td>
                    <td>{item.allocationCount}</td>
                    <td>{formatCurrency(item.pendingAmount)}</td>
                    <td>{formatCurrency(item.paidAmount)}</td>
                    <td>{formatCurrency(item.totalAllocatedCost)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage cost records */}
      <div className="cost-section">
        <h3>Usage Cost Records</h3>
        <p className="cost-section-desc">
          Every billable booking, generated automatically once it's marked
          Completed.
        </p>

        <div className="cost-table-wrapper">
          <table className="cost-table">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>User</th>
                <th>Department</th>
                <th>Hours</th>
                <th>Rate / hr</th>
                <th>Total Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="cost-empty-state">
                    No usage cost records found. Completed bookings will
                    appear here automatically.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.usageCostId}>
                    <td>{record.equipmentName}</td>
                    <td>{record.userName || "-"}</td>
                    <td>{record.departmentName || "-"}</td>
                    <td>{Number(record.usageHours).toFixed(1)} h</td>
                    <td>{formatCurrency(record.ratePerHour)}</td>
                    <td>{formatCurrency(record.totalCost)}</td>
                    <td>
                      {canEdit ? (
                        <select
                          className="cost-status-select"
                          value={record.costStatus}
                          onChange={(e) =>
                            handleStatusChange(
                              record.usageCostId,
                              e.target.value
                            )
                          }
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PAID">PAID</option>
                          <option value="WAIVED">WAIVED</option>
                        </select>
                      ) : (
                        <span
                          className={`cost-status-badge ${record.costStatus?.toLowerCase()}`}
                        >
                          {record.costStatus}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CostManagement;
