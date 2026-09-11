import { useEffect, useState } from "react";
import "./Calibration.css"; // reusing the same class names/styles

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

function Certification() {
  const [records, setRecords] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // "all" | "expiring" | "expired"
  const [filterView, setFilterView] = useState("all");

  const [formData, setFormData] = useState({
    equipmentId: "",
    certificationName: "",
    certificateNumber: "",
    issuedDate: "",
    expiryDate: "",
    issuingAuthority: "",
    certificationStatus: "ACTIVE",
    remarks: "",
  });

  const token = sessionStorage.getItem("token");

  const getHeaders = () => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");

      const [recordsRes, equipmentRes] = await Promise.all([
        fetch(`${API_BASE_URL}/certifications`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/equipment`, { headers: getHeaders() }),
      ]);

      if (!recordsRes.ok) throw new Error(`Failed to load certifications: ${recordsRes.status}`);
      if (!equipmentRes.ok) throw new Error(`Failed to load equipment: ${equipmentRes.status}`);

      setRecords(await recordsRes.json());
      setEquipment(await equipmentRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiltered = async (view) => {
    setFilterView(view);
    if (view === "all") return fetchAll();

    const endpointMap = { expiring: "/certifications/expiring-soon", expired: "/certifications/expired" };

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

  const resetForm = () => {
    setFormData({
      equipmentId: "", certificationName: "", certificateNumber: "",
      issuedDate: "", expiryDate: "", issuingAuthority: "",
      certificationStatus: "ACTIVE", remarks: "",
    });
    setEditingId(null);
  };

  const openEditForm = (record) => {
    setFormData({
      equipmentId: record.equipment?.equipmentId || "",
      certificationName: record.certificationName || "",
      certificateNumber: record.certificateNumber || "",
      issuedDate: record.issuedDate || "",
      expiryDate: record.expiryDate || "",
      issuingAuthority: record.issuingAuthority || "",
      certificationStatus: record.certificationStatus || "ACTIVE",
      remarks: record.remarks || "",
    });
    setEditingId(record.certificationId);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // EDGE CASE: expiry before issue date doesn't make sense
    if (formData.issuedDate && formData.expiryDate && formData.expiryDate <= formData.issuedDate) {
      setError("Expiry date must be after the issued date.");
      return;
    }

    const payload = {
      equipment: { equipmentId: Number(formData.equipmentId) },
      certificationName: formData.certificationName,
      certificateNumber: formData.certificateNumber || null,
      issuedDate: formData.issuedDate || null,
      expiryDate: formData.expiryDate || null,
      issuingAuthority: formData.issuingAuthority || null,
      certificationStatus: formData.certificationStatus,
      remarks: formData.remarks || null,
    };

    try {
      const url = editingId
        ? `${API_BASE_URL}/certifications/${editingId}`
        : `${API_BASE_URL}/certifications`;

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save certification record");
      }

      setShowForm(false);
      resetForm();
      fetchFiltered(filterView);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="calibration-page">
      {error && <div className="calibration-error">{error}</div>}

      <div className="calibration-toolbar">
        <div className="calibration-filters">
          <button className={filterView === "all" ? "filter-btn active" : "filter-btn"} onClick={() => fetchFiltered("all")}>All</button>
          <button className={filterView === "expiring" ? "filter-btn active" : "filter-btn"} onClick={() => fetchFiltered("expiring")}>Expiring Soon</button>
          <button className={filterView === "expired" ? "filter-btn active" : "filter-btn"} onClick={() => fetchFiltered("expired")}>Expired</button>
        </div>

        <button className="primary-btn" onClick={() => { resetForm(); setShowForm(true); }}>+ Add Certification</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : records.length === 0 ? (
        <div className="calibration-empty">No certification records found for this view.</div>
      ) : (
        <table className="calibration-table">
          <thead>
            <tr>
              <th>Equipment</th><th>Certification</th><th>Cert #</th>
              <th>Issued</th><th>Expiry</th><th>Authority</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.certificationId}>
                <td>{r.equipment?.equipmentName || "—"}</td>
                <td>{r.certificationName}</td>
                <td>{r.certificateNumber || "—"}</td>
                <td>{r.issuedDate || "—"}</td>
                <td>{r.expiryDate || "—"}</td>
                <td>{r.issuingAuthority || "—"}</td>
                <td><span className="badge badge-completed">{r.certificationStatus}</span></td>
                <td><button className="link-btn" onClick={() => openEditForm(r)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="calibration-modal-overlay">
          <div className="calibration-modal">
            <h3>{editingId ? "Update Certification" : "Add Certification"}</h3>
            <form onSubmit={handleSubmit}>
              <label>Equipment</label>
              <select value={formData.equipmentId} onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })} required disabled={!!editingId}>
                <option value="">Select equipment</option>
                {equipment.map((eq) => <option key={eq.equipmentId} value={eq.equipmentId}>{eq.equipmentName}</option>)}
              </select>

              <label>Certification Name</label>
              <input type="text" value={formData.certificationName} onChange={(e) => setFormData({ ...formData, certificationName: e.target.value })} required />

              <label>Certificate Number</label>
              <input type="text" value={formData.certificateNumber} onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })} />

              <label>Issued Date</label>
              <input type="date" value={formData.issuedDate} onChange={(e) => setFormData({ ...formData, issuedDate: e.target.value })} />

              <label>Expiry Date</label>
              <input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} />

              <label>Issuing Authority</label>
              <input type="text" value={formData.issuingAuthority} onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })} />

              <label>Remarks</label>
              <textarea rows={3} value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} />

              <div className="calibration-modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="primary-btn">{editingId ? "Save Changes" : "Add Certification"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Certification;