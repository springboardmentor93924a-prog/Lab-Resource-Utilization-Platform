import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./AddEquipment.css";
import { addEquipment } from "../services/equipmentService";
import { isAdmin } from "../utils/auth";
import { uploadFile } from "../services/fileService";

const statusOptions = ["Available", "Booked", "Under maintenance", "Out of service", "Retired"];

// TEMP hardcoded reference data (confirmed via psql) until these are fetched
// from equipment_categories / departments tables (see open issue: real dropdowns).
const CATEGORY_OPTIONS = [
  { id: 1, name: "Imaging" },
  { id: 2, name: "Spectroscopy" },
  { id: 3, name: "Chromatography" },
  { id: 4, name: "Centrifugation" },
  { id: 5, name: "Sample Prep" },
  { id: 6, name: "Measurement Tools" },
];

const DEPARTMENT_OPTIONS = [
  { id: 1, name: "Computer Science" },
  { id: 2, name: "External Research Department" },
  { id: 3, name: "Mechanical Engineering" },
  { id: 4, name: "Electrical Engineering" },
  { id: 5, name: "Computer Science Engineering" },
];

// Only one institution exists right now.
const INSTITUTION_ID = 1;

const initialForm = {
  equipmentName: "",
  categoryId: CATEGORY_OPTIONS[0].id,
  assetId: "",
  departmentId: DEPARTMENT_OPTIONS[0].id,
  manufacturer: "",
  modelNumber: "",
  notes: "",
  calibrationDate: "",
  imageUrl: "",
};

function mapStatusToBackend(uiStatus) {
  switch (uiStatus) {
    case "Available":
      return "Available";
    case "Booked":
      return "Booked";
    case "Under maintenance":
      return "Under Maintenance";
    case "Out of service":
      return "Out of Service";
    case "Retired":
      return "Retired";
    default:
      return "Under Maintenance";
  }
}

export default function AddEquipment() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin()) {
      alert("You don't have permission to add equipment.");
      navigate("/equipment");
    }
  }, [navigate]);

  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("Available");
  const [manualFile, setManualFile] = useState(null);
  const [certFile, setCertFile] = useState(null);
  const [saving, setSaving] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (form.equipmentName.trim() === "") {
      alert("Please enter Equipment Name.");
      return;
    }
    if (form.assetId.trim() === "") {
      alert("Please enter Asset ID / tag.");
      return;
    }

    try {
      setSaving(true);

      let manualFilename = null;
      let certFilename = null;

      if (manualFile) {
        const uploaded = await uploadFile(manualFile);
        manualFilename = uploaded.filename;
      }
      if (certFile) {
        const uploaded = await uploadFile(certFile);
        certFilename = uploaded.filename;
      }

      const payload = {
        name: form.equipmentName,
        assetTag: form.assetId,
        category: { categoryId: Number(form.categoryId) },
        department: { departmentId: Number(form.departmentId) },
        institution: { institutionId: INSTITUTION_ID },
        manufacturer: form.manufacturer,
        modelNumber: form.modelNumber,
        imageUrl: form.imageUrl || "https://picsum.photos/seed/newequipment/400/300",
        status: mapStatusToBackend(status),
        calibrationDueDate: form.calibrationDate || null,
        manualDocument: manualFilename,
        calibrationCertificate: certFilename,
      };

      await addEquipment(payload);
      alert("Equipment saved successfully!");
      navigate("/equipment");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save equipment. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (window.confirm("Clear all fields?")) {
      setForm(initialForm);
      setStatus("Available");
      setManualFile(null);
      setCertFile(null);
    }
  }

  function handleClose() {
    if (window.confirm("Close this page?")) {
      navigate(-1);
    }
  }

  return (
    <div className="container">
      <aside className="sidebar">
        <Sidebar />
      </aside>

      <main className="main">
        <header>
          <h2>Add equipment</h2>
          <div className="right">
            <input type="text" placeholder="Search..." />
            <button
    className="profile-circle"
    onClick={() => navigate("/profile")}
    title="My Profile"
    aria-label="My Profile"
>
    👤
</button>
          </div>
        </header>

        <div className="card">
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>

          <div className="section">
            <h3>Basic info</h3>
            <div className="grid-3">
              <div>
                <label>Equipment name</label>
                <input type="text" value={form.equipmentName} onChange={(e) => updateField("equipmentName", e.target.value)} />
              </div>
              <div>
                <label>Category / type</label>
                <select value={form.categoryId} onChange={(e) => updateField("categoryId", e.target.value)}>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Asset ID / tag</label>
                <input type="text" value={form.assetId} onChange={(e) => updateField("assetId", e.target.value)} />
              </div>
              <div>
                <label>Department</label>
                <select value={form.departmentId} onChange={(e) => updateField("departmentId", e.target.value)}>
                  {DEPARTMENT_OPTIONS.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Image URL</label>
                <input type="text" placeholder="https://..." value={form.imageUrl} onChange={(e) => updateField("imageUrl", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Specifications</h3>
            <div className="grid-3">
              <div>
                <label>Manufacturer</label>
                <input type="text" value={form.manufacturer} onChange={(e) => updateField("manufacturer", e.target.value)} />
              </div>
              <div>
                <label>Model number</label>
                <input type="text" value={form.modelNumber} onChange={(e) => updateField("modelNumber", e.target.value)} />
              </div>
              <div>
                <label>Capacity / notes</label>
                <textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)}></textarea>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Documents</h3>
            <div className="documents">
              <div className="upload-box">
                <i className="fa-solid fa-cloud-arrow-up"></i>
                <p>{manualFile ? manualFile.name : "Upload manual (PDF)"}</p>
                <input type="file" onChange={(e) => setManualFile(e.target.files[0] || null)} />
              </div>
              <div className="upload-box">
                <i className="fa-solid fa-cloud-arrow-up"></i>
                <p>{certFile ? certFile.name : "Upload calibration certificate"}</p>
                <input type="file" onChange={(e) => setCertFile(e.target.files[0] || null)} />
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Status</h3>
            <div className="status">
              {statusOptions.map((option) => (
                <button
                  key={option}
                  className={`pill ${status === option ? "active-status" : ""}`}
                  onClick={() => setStatus(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <small className="note">pill = single-select. "Out of service" and "Retired" currently map to Maintenance on the backend.</small>
          </div>

          <div className="section">
            <label>Calibration due date</label>
            <input
              type="date"
              className="date"
              value={form.calibrationDate}
              onChange={(e) => updateField("calibrationDate", e.target.value)}
            />
          </div>

          <div className="buttons">
            <button className="cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button className="save" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save equipment"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
