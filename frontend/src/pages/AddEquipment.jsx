import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./AddEquipment.css";
import { addEquipment } from "../services/equipmentService";
import { isAdmin } from "../utils/auth";
import { uploadFile } from "../services/fileService";

const statusOptions = ["Available", "Booked", "Under maintenance", "Out of service", "Retired"];

const initialForm = {
  equipmentName: "",
  category: "",
  assetId: "",
  department: "",
  institution: "",
  manufacturer: "",
  modelNumber: "",
  notes: "",
  calibrationDate: "",

  // Calibration details
  lastCalibrationDate: "",
  nextCalibrationDate: "",

  // Certification details
  certificationDetails: "",
  certificationExpiryDate: "",

  imageUrl: "",
};

function mapStatusToBackend(uiStatus) {
  switch (uiStatus) {
    case "Available":
      return "AVAILABLE";
    case "Booked":
      return "IN_USE";
    case "Under maintenance":
      return "MAINTENANCE";
    default:
      return "MAINTENANCE";
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
  equipmentName: form.equipmentName,
  assetTag: form.assetId,
  category: form.category,
  department: form.department,
  manufacturer: form.manufacturer,
  model: form.modelNumber,

  imageUrl:
    form.imageUrl ||
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80",

  status: mapStatusToBackend(status),

  // Calibration
  calibrationDueDate:
    form.nextCalibrationDate || null,

  lastCalibrationDate:
    form.lastCalibrationDate || null,

  nextCalibrationDate:
    form.nextCalibrationDate || null,

  // Certification
  certificationDetails:
    form.certificationDetails || null,

  certificationExpiryDate:
    form.certificationExpiryDate || null,

  // Documents
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
                <input type="text" value={form.category} onChange={(e) => updateField("category", e.target.value)} />
              </div>
              <div>
                <label>Asset ID / tag</label>
                <input type="text" value={form.assetId} onChange={(e) => updateField("assetId", e.target.value)} />
              </div>
              <div>
                <label>Department</label>
                <input type="text" value={form.department} onChange={(e) => updateField("department", e.target.value)} />
              </div>
              <div>
                <label>Institution</label>
                <input type="text" value={form.institution} onChange={(e) => updateField("institution", e.target.value)} />
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
  <h3>Calibration & certification</h3>

  <div className="grid-3">

    <div>
      <label>Last calibration date</label>
      <input
        type="date"
        className="date"
        value={form.lastCalibrationDate}
        onChange={(e) =>
          updateField(
            "lastCalibrationDate",
            e.target.value
          )
        }
      />
    </div>

    <div>
      <label>Next calibration date</label>
      <input
        type="date"
        className="date"
        value={form.nextCalibrationDate}
        onChange={(e) =>
          updateField(
            "nextCalibrationDate",
            e.target.value
          )
        }
      />
    </div>

    <div>
      <label>Certification expiry date</label>
      <input
        type="date"
        className="date"
        value={form.certificationExpiryDate}
        onChange={(e) =>
          updateField(
            "certificationExpiryDate",
            e.target.value
          )
        }
      />
    </div>

    <div style={{ gridColumn: "1 / -1" }}>
      <label>Certification details</label>
      <textarea
        value={form.certificationDetails}
        onChange={(e) =>
          updateField(
            "certificationDetails",
            e.target.value
          )
        }
        placeholder="Enter certification name, number, issuing authority, etc."
      />
    </div>

  </div>
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