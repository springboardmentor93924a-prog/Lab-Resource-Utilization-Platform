import { useEffect, useState } from "react";
import {
  getAllEquipment,
  getCalibrationByEquipment,
  createCalibrationRecord,
  updateCalibrationRecord,
  deleteCalibrationRecord,
} from "../api/equipmentApi";
import { extractErrorMessage } from "../api/client";
import { CERTIFICATION_STATUSES } from "../utils/constants";
import { page, headerRow, h1Style, subStyle, card, selectStyle, labelStyle, inputStyle, primaryBtn, cancelBtn, errorText, emptyText, pill } from "../styles/shared";

const WRITE_ROLES = ["SYSTEM_ADMIN", "INSTITUTION_ADMIN", "LAB_MANAGER", "LAB_TECHNICIAN"];
const DELETE_ROLES = ["SYSTEM_ADMIN", "INSTITUTION_ADMIN", "LAB_MANAGER"];

const emptyForm = {
  lastCalibrationDate: "", nextCalibrationDate: "", calibrationIntervalMonths: "",
  certificationNumber: "", certificationIssueDate: "", certificationExpiryDate: "",
  certificationRequired: true,
};

function CalibrationPage({ userRole, showToast }) {
  const [equipment, setEquipment] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [record, setRecord] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);

  const canWrite = WRITE_ROLES.includes(userRole);
  const canDelete = DELETE_ROLES.includes(userRole);

  useEffect(() => {
    getAllEquipment().then(setEquipment).catch(() => setEquipment([]));
  }, []);

  useEffect(() => {
    if (!selectedId) { setRecord(null); return; }
    setLoading(true);
    setNotFound(false);
    getCalibrationByEquipment(selectedId)
      .then((r) => { setRecord(r); populateForm(r); })
      .catch(() => { setRecord(null); setNotFound(true); })
      .finally(() => setLoading(false));
  }, [selectedId]);

  const populateForm = (r) => {
    setForm({
      lastCalibrationDate: r?.lastCalibrationDate || "",
      nextCalibrationDate: r?.nextCalibrationDate || "",
      calibrationIntervalMonths: r?.calibrationIntervalMonths ?? "",
      certificationNumber: r?.certificationNumber || "",
      certificationIssueDate: r?.certificationIssueDate || "",
      certificationExpiryDate: r?.certificationExpiryDate || "",
      certificationRequired: true,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      equipmentId: Number(selectedId),
      lastCalibrationDate: form.lastCalibrationDate || null,
      nextCalibrationDate: form.nextCalibrationDate || null,
      calibrationIntervalMonths: form.calibrationIntervalMonths ? Number(form.calibrationIntervalMonths) : null,
      certificationNumber: form.certificationNumber || null,
      certificationIssueDate: form.certificationIssueDate || null,
      certificationExpiryDate: form.certificationExpiryDate || null,
      certificationRequired: true,
    };
    try {
      if (record) {
        const updated = await updateCalibrationRecord(record.calibrationId, payload);
        setRecord(updated);
        showToast?.("Calibration record updated.", "success");
      } else {
        const created = await createCalibrationRecord(payload);
        setRecord(created);
        setNotFound(false);
        showToast?.("Calibration record created.", "success");
      }
      setEditing(false);
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Failed to save calibration record."), "warning");
    }
  };

  const handleDelete = async () => {
    if (!record || !window.confirm("Delete this calibration record?")) return;
    try {
      await deleteCalibrationRecord(record.calibrationId);
      showToast?.("Calibration record deleted.", "success");
      setRecord(null);
      setNotFound(true);
      setForm(emptyForm);
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Failed to delete calibration record."), "warning");
    }
  };

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>Calibration Records</h1>
          <p style={subStyle}>Look up and manage calibration certification per equipment</p>
        </div>
      </div>

      <div style={{ ...card, padding: 20, marginBottom: 20 }}>
        <label style={labelStyle}>Select Equipment</label>
        <select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setEditing(false); }} style={selectStyle}>
          <option value="">Choose equipment...</option>
          {equipment.map((eq) => (
            <option key={eq.equipmentId} value={eq.equipmentId}>{eq.equipmentName} ({eq.assetTag})</option>
          ))}
        </select>
      </div>

      {!selectedId && <p style={emptyText}>Select a piece of equipment to view its calibration record.</p>}

      {selectedId && loading && <p>Loading calibration record...</p>}

      {selectedId && !loading && (
        <div style={{ ...card, padding: 24 }}>
          {record && !editing && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 18 }}>Calibration #{record.calibrationId}</h2>
                <span style={
                  record.certificationStatus === "ACTIVE" ? pill("#e8f7ee", "#16834b") :
                  record.certificationStatus === "EXPIRED" ? pill("#fdecec", "#c0392b") :
                  pill("#f1f5f9", "#475569")
                }>
                  {record.certificationStatus || "NOT_CERTIFIED"}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, fontSize: 13, color: "#334155" }}>
                <div><strong>Last Calibration:</strong> {record.lastCalibrationDate || "-"}</div>
                <div><strong>Next Calibration:</strong> {record.nextCalibrationDate || "-"}</div>
                <div><strong>Interval (months):</strong> {record.calibrationIntervalMonths ?? "-"}</div>
                <div><strong>Certification #:</strong> {record.certificationNumber || "-"}</div>
                <div><strong>Cert. Issued:</strong> {record.certificationIssueDate || "-"}</div>
                <div><strong>Cert. Expires:</strong> {record.certificationExpiryDate || "-"}</div>
              </div>
              {canWrite && (
                <div style={{ display: "flex", gap: 9, marginTop: 20 }}>
                  <button onClick={() => setEditing(true)} style={primaryBtn}>Edit</button>
                  {canDelete && <button onClick={handleDelete} style={{ ...cancelBtn, color: "#c0392b" }}>Delete</button>}
                </div>
              )}
            </div>
          )}

          {notFound && !editing && (
            <div>
              <p style={emptyText}>No calibration record exists for this equipment yet.</p>
              {canWrite && (
                <button onClick={() => { populateForm(null); setEditing(true); }} style={primaryBtn}>
                  + Create Calibration Record
                </button>
              )}
            </div>
          )}

          {editing && (
            <form onSubmit={handleSave}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Last Calibration Date" type="date" value={form.lastCalibrationDate} onChange={(v) => setForm({ ...form, lastCalibrationDate: v })} />
                <Field label="Next Calibration Date" type="date" value={form.nextCalibrationDate} onChange={(v) => setForm({ ...form, nextCalibrationDate: v })} />
                <Field label="Interval (months)" type="number" value={form.calibrationIntervalMonths} onChange={(v) => setForm({ ...form, calibrationIntervalMonths: v })} />
                <Field label="Certification Number" value={form.certificationNumber} onChange={(v) => setForm({ ...form, certificationNumber: v })} />
                <Field label="Certification Issue Date" type="date" value={form.certificationIssueDate} onChange={(v) => setForm({ ...form, certificationIssueDate: v })} />
                <Field label="Certification Expiry Date" type="date" value={form.certificationExpiryDate} onChange={(v) => setForm({ ...form, certificationExpiryDate: v })} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 22 }}>
                <button type="button" onClick={() => { setEditing(false); if (!record) setSelectedId(""); }} style={cancelBtn}>Cancel</button>
                <button type="submit" style={primaryBtn}>{record ? "Save Changes" : "Create Record"}</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
    </div>
  );
}

export default CalibrationPage;
