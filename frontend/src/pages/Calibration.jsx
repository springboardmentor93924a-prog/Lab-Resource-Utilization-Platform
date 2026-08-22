import { useEffect, useState } from "react";
import "./Calibration.css";

const API_BASE_URL = "http://localhost:8080/api";

const STATUS_OPTIONS = ["COMPLETED", "SCHEDULED", "IN_PROGRESS", "CANCELLED"];

function Calibration() {
  const [records, setRecords] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // "all" | "due-soon" | "overdue" | "cert-expiring" | "cert-expired"
  const [filterView, setFilterView] = useState("all");

  const [formData, setFormData] = useState({
    equipmentId: "",
    calibrationDate: "",
    nextCalibrationDate: "",
    certificateNumber: "",
    certificateExpiryDate: "",
    calibrationStatus: "COMPLETED",
    remarks: "",
  });

  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");

  const canLog = ["LAB_TECHNICIAN", "LAB_MANAGER", "INSTITUTION_ADMIN", "SYSTEM_ADMIN"].includes(role);

  const getHeaders = () => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");

      const [recordsRes, equipmentRes] = await Promise.all([
        fetch(`${API_BASE_URL}/calibrations`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/equipment`, { headers: getHeaders() }),
      ]);

      if (!recordsRes.ok) throw new Error(`Failed to load calibrations: ${recordsRes.status}`);
      if (!equipmentRes.ok) throw new Error(`Failed to load equipment: ${equipmentRes.status}`);

      setRecords(await recordsRes.json());
      setEquipment(await equipmentRes.json());
    } catch (err) {
      // EDGE CASE: surface the real error, don't silently show an empty table
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiltered = async (view) => {
    setFilterView(view);

    if (view === "all") {
      return fetchAll();
    }

    const endpointMap = {
      "due-soon": "/calibrations/due-soon",
      overdue: "/calibrations/overdue",
      "cert-expiring": "/calibrations/certifications/due-soon",
      "cert-expired": "/calibrations/certifications/overdue",
    };

    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE_URL}${endpointMap[view]}`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
      setRecords(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      equipmentId: "",
      calibrationDate: "",
      nextCalibrationDate: "",
      certificateNumber: "",
      certificateExpiryDate: "",
      calibrationStatus: "COMPLETED",
      remarks: "",
    });
    setEditingId(null);
  };

  const openEditForm = (record) => {
    setFormData({
      equipmentId: record.equipment?.equipmentId || "",
      calibrationDate: record.calibrationDate || "",
      nextCalibrationDate: record.nextCalibrationDate || "",
      certificateNumber: record.certificateNumber || "",
      certificateExpiryDate: record.certificateExpiryDate || "",
      calibrationStatus: record.calibrationStatus || "COMPLETED",
      remarks: record.remarks || "",
    });
    setEditingId(record.calibrationId);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // EDGE CASE: client-side guard mirroring the backend validation,
    // so the user sees the message immediately instead of after a round trip
    if (
      formData.nextCalibrationDate &&
      formData.calibrationDate &&
      formData.nextCalibrationDate <= formData.calibrationDate
    ) {
      setError("Next calibration date must be after the calibration date.");
      return;
    }
    if (
      formData.certificateExpiryDate &&
      formData.calibrationDate &&
      formData.certificateExpiryDate <= formData.calibrationDate
    ) {
      setError("Certificate expiry date must be after the calibration date.");
      return;
    }

    const payload = {
      equipment: { equipmentId: Number(formData.equipmentId) },
      calibrationDate: formData.calibrationDate,
      nextCalibrationDate: formData.nextCalibrationDate,
      certificateNumber: formData.certificateNumber || null,
      certificateExpiryDate: formData.certificateExpiryDate || null,
      calibrationStatus: formData.calibrationStatus,
      remarks: formData.remarks || null,
    };

    try {
      const url = editingId
        ? `${API_BASE_URL}/calibrations/${editingId}`
        : `${API_BASE_URL}/calibrations`;

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save calibration record");
      }

      setShowForm(false);
      resetForm();
      fetchFiltered(filterView);
    } catch (err) {
      setError(err.message);
    }
  };

  const statusBadgeClass = (status) => {
    if (status === "SCHEDULED" || status === "IN_PROGRESS") return "badge badge-blocking";
    if (status === "CANCELLED") return "badge badge-cancelled";
    return "badge badge-completed";
  };

  return (
    <div className="calibration-page">
      {error && <div className="calibration-error">{error}</div>}

      <div className="calibration-toolbar">
        {/* Buttons, not a dropdown — structured filter choices */}
        <div className="calibration-filters">
          <button className={filterView === "all" ? "filter-btn active" : "filter-btn"} onClick={() => fetchFiltered("all")}>All</button>
          <button className={filterView === "due-soon" ? "filter-btn active" : "filter-btn"} onClick={() => fetchFiltered("due-soon")}>Due Soon</button>
          <button className={filterView === "overdue" ? "filter-btn active" : "filter-btn"} onClick={() => fetchFiltered("overdue")}>Overdue</button>
          <button className={filterView === "cert-expiring" ? "filter-btn active" : "filter-btn"} onClick={() => fetchFiltered("cert-expiring")}>Cert Expiring</button>
          <button className={filterView === "cert-expired" ? "filter-btn active" : "filter-btn"} onClick={() => fetchFiltered("cert-expired")}>Cert Expired</button>
        </div>

        {canLog && (
          <button
            className="primary-btn"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            + Log Calibration
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : records.length === 0 ? (
        // EDGE CASE: empty state, not a blank table
        <div className="calibration-empty">No calibration records found for this view.</div>
      ) : (
        <table className="calibration-table">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Calibrated On</th>
              <th>Next Due</th>
              <th>Certificate #</th>
              <th>Cert Expiry</th>
              <th>Status</th>
              <th>Calibrated By</th>
              {canLog && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.calibrationId}>
                <td>{r.equipment?.equipmentName || "—"}</td>
                <td>{r.calibrationDate}</td>
                <td>{r.nextCalibrationDate}</td>
                <td>{r.certificateNumber || "—"}</td>
                <td>{r.certificateExpiryDate || "—"}</td>
                <td><span className={statusBadgeClass(r.calibrationStatus)}>{r.calibrationStatus}</span></td>
                <td>{r.calibratedBy || "—"}</td>
                {canLog && (
                  <td>
                    <button className="link-btn" onClick={() => openEditForm(r)}>Edit</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="calibration-modal-overlay">
          <div className="calibration-modal">
            <h3>{editingId ? "Update Calibration Record" : "Log New Calibration"}</h3>

            <form onSubmit={handleSubmit}>
              <label>Equipment</label>
              <select
                name="equipmentId"
                value={formData.equipmentId}
                onChange={handleChange}
                required
                disabled={!!editingId} // EDGE CASE: don't allow swapping equipment mid-edit
              >
                <option value="">Select equipment</option>
                {equipment.map((eq) => (
                  <option key={eq.equipmentId} value={eq.equipmentId}>
                    {eq.equipmentName}
                  </option>
                ))}
              </select>

              <label>Calibration Date</label>
              <input type="date" name="calibrationDate" value={formData.calibrationDate} onChange={handleChange} required />

              <label>Next Calibration Date</label>
              <input type="date" name="nextCalibrationDate" value={formData.nextCalibrationDate} onChange={handleChange} required />

              <label>Certificate Number</label>
              <input type="text" name="certificateNumber" value={formData.certificateNumber} onChange={handleChange} />

              <label>Certificate Expiry Date</label>
              <input type="date" name="certificateExpiryDate" value={formData.certificateExpiryDate} onChange={handleChange} />

              <label>Status</label>
              <div className="status-btn-group">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    type="button"
                    key={s}
                    className={formData.calibrationStatus === s ? "status-btn active" : "status-btn"}
                    onClick={() => setFormData({ ...formData, calibrationStatus: s })}
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>

              <label>Remarks</label>
              <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={3} />

              <div className="calibration-modal-actions">
                <button type="button" className="secondary-btn" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button>
                <button type="submit" className="primary-btn">{editingId ? "Save Changes" : "Log Calibration"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calibration;